// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BasketRegistry
/// @notice Custody-free onchain store for STAX tokenized-stock baskets and price
///         alerts. The contract never holds or transfers any token — it only records
///         a user's basket composition (token addresses + weights in basis points),
///         an optional price alert, and an optional community token link (e.g. OGB).
///         Every write is a real onchain interaction from the caller's wallet.
contract BasketRegistry {
    uint16 public constant TOTAL_BPS = 10_000;
    uint256 public constant MAX_TOKENS = 20;

    struct Basket {
        address owner;
        string name;
        address[] tokens;
        uint16[] weightsBps; // sums to TOTAL_BPS
        address communityToken; // optional (e.g. OGB), address(0) = none
        uint64 createdAt;
        uint64 updatedAt;
    }

    struct Alert {
        address token;
        int256 threshold; // 8-decimal price, Chainlink-aligned
        uint8 direction; // 0 = below, 1 = above
        bool active;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Basket) private _baskets;
    mapping(uint256 => Alert) private _alerts;
    mapping(address => uint256[]) private _ownerBaskets;

    event BasketCreated(uint256 indexed id, address indexed owner, string name);
    event BasketUpdated(uint256 indexed id, address indexed owner);
    event BasketDeleted(uint256 indexed id, address indexed owner);
    event AlertSet(uint256 indexed id, address token, int256 threshold, uint8 direction);
    event AlertCleared(uint256 indexed id);
    event CommunityTokenLinked(uint256 indexed id, address token);

    error NotOwner();
    error LengthMismatch();
    error TooManyTokens();
    error BadWeights();
    error BadDirection();
    error Unknown();

    modifier onlyOwner(uint256 id) {
        if (_baskets[id].owner != msg.sender) revert NotOwner();
        _;
    }

    function _validate(address[] calldata tokens, uint16[] calldata weightsBps) private pure {
        uint256 n = tokens.length;
        if (n == 0 || n != weightsBps.length) revert LengthMismatch();
        if (n > MAX_TOKENS) revert TooManyTokens();
        uint256 sum;
        for (uint256 i; i < n; ++i) {
            sum += weightsBps[i];
        }
        if (sum != TOTAL_BPS) revert BadWeights();
    }

    function createBasket(
        string calldata name,
        address[] calldata tokens,
        uint16[] calldata weightsBps,
        address communityToken
    ) external returns (uint256 id) {
        _validate(tokens, weightsBps);
        id = nextId++;
        Basket storage b = _baskets[id];
        b.owner = msg.sender;
        b.name = name;
        b.tokens = tokens;
        b.weightsBps = weightsBps;
        b.communityToken = communityToken;
        b.createdAt = uint64(block.timestamp);
        b.updatedAt = uint64(block.timestamp);
        _ownerBaskets[msg.sender].push(id);
        emit BasketCreated(id, msg.sender, name);
        if (communityToken != address(0)) emit CommunityTokenLinked(id, communityToken);
    }

    function updateBasket(uint256 id, address[] calldata tokens, uint16[] calldata weightsBps)
        external
        onlyOwner(id)
    {
        _validate(tokens, weightsBps);
        Basket storage b = _baskets[id];
        b.tokens = tokens;
        b.weightsBps = weightsBps;
        b.updatedAt = uint64(block.timestamp);
        emit BasketUpdated(id, msg.sender);
    }

    function deleteBasket(uint256 id) external onlyOwner(id) {
        delete _baskets[id];
        delete _alerts[id];
        uint256[] storage list = _ownerBaskets[msg.sender];
        for (uint256 i; i < list.length; ++i) {
            if (list[i] == id) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
        emit BasketDeleted(id, msg.sender);
    }

    function setAlert(uint256 id, address token, int256 threshold, uint8 direction)
        external
        onlyOwner(id)
    {
        if (direction > 1) revert BadDirection();
        _alerts[id] = Alert({token: token, threshold: threshold, direction: direction, active: true});
        emit AlertSet(id, token, threshold, direction);
    }

    function clearAlert(uint256 id) external onlyOwner(id) {
        delete _alerts[id];
        emit AlertCleared(id);
    }

    function linkCommunityToken(uint256 id, address token) external onlyOwner(id) {
        _baskets[id].communityToken = token;
        _baskets[id].updatedAt = uint64(block.timestamp);
        emit CommunityTokenLinked(id, token);
    }

    function getBasket(uint256 id) external view returns (Basket memory) {
        if (_baskets[id].owner == address(0)) revert Unknown();
        return _baskets[id];
    }

    function getAlert(uint256 id) external view returns (Alert memory) {
        return _alerts[id];
    }

    function basketsOf(address owner) external view returns (uint256[] memory) {
        return _ownerBaskets[owner];
    }
}
