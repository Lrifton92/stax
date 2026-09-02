// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BasketRegistry} from "../src/BasketRegistry.sol";

contract BasketRegistryTest is Test {
    BasketRegistry reg;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address aapl = address(0xb200000000000000000000C2e324d24d7eEcd1fb);
    address amzn = address(0xb200000000000000000000d9192b6B456483C2E8);
    address ogb = address(0xb200000000000000000000026aFdac7C1D621b78);

    function setUp() public {
        reg = new BasketRegistry();
    }

    function _twoTokens() internal view returns (address[] memory t, uint16[] memory w) {
        t = new address[](2);
        t[0] = aapl;
        t[1] = amzn;
        w = new uint16[](2);
        w[0] = 6000;
        w[1] = 4000;
    }

    function test_createBasket_storesAndEmits() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit BasketRegistry.BasketCreated(1, alice, "Tech");
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        assertEq(id, 1);
        BasketRegistry.Basket memory b = reg.getBasket(id);
        assertEq(b.owner, alice);
        assertEq(b.tokens.length, 2);
        assertEq(b.weightsBps[0], 6000);
        uint256[] memory list = reg.basketsOf(alice);
        assertEq(list.length, 1);
        assertEq(list[0], 1);
    }

    function test_createBasket_revertsOnBadWeights() public {
        address[] memory t = new address[](2);
        t[0] = aapl;
        t[1] = amzn;
        uint16[] memory w = new uint16[](2);
        w[0] = 6000;
        w[1] = 3000; // sums to 9000, not 10000
        vm.prank(alice);
        vm.expectRevert(BasketRegistry.BadWeights.selector);
        reg.createBasket("Bad", t, w, address(0));
    }

    function test_createBasket_revertsOnLengthMismatch() public {
        address[] memory t = new address[](2);
        t[0] = aapl;
        t[1] = amzn;
        uint16[] memory w = new uint16[](1);
        w[0] = 10000;
        vm.prank(alice);
        vm.expectRevert(BasketRegistry.LengthMismatch.selector);
        reg.createBasket("Bad", t, w, address(0));
    }

    function test_createBasket_revertsOnTooManyTokens() public {
        address[] memory t = new address[](21);
        uint16[] memory w = new uint16[](21);
        for (uint256 i; i < 21; ++i) {
            t[i] = address(uint160(i + 1));
            w[i] = i == 0 ? 10000 : 0;
        }
        vm.prank(alice);
        vm.expectRevert(BasketRegistry.TooManyTokens.selector);
        reg.createBasket("Too many", t, w, address(0));
    }

    function test_updateBasket_onlyOwner() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.prank(alice);
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        vm.prank(bob);
        vm.expectRevert(BasketRegistry.NotOwner.selector);
        reg.updateBasket(id, t, w);
    }

    function test_deleteBasket_removesFromList() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.startPrank(alice);
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        reg.deleteBasket(id);
        vm.stopPrank();
        assertEq(reg.basketsOf(alice).length, 0);
        vm.expectRevert(BasketRegistry.Unknown.selector);
        reg.getBasket(id);
    }

    function test_setAlert_and_clear() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.startPrank(alice);
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        reg.setAlert(id, aapl, int256(150_00000000), 1);
        BasketRegistry.Alert memory a = reg.getAlert(id);
        assertEq(a.token, aapl);
        assertEq(a.threshold, int256(150_00000000));
        assertTrue(a.active);
        reg.clearAlert(id);
        assertFalse(reg.getAlert(id).active);
        vm.stopPrank();
    }

    function test_setAlert_revertsOnBadDirection() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.startPrank(alice);
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        vm.expectRevert(BasketRegistry.BadDirection.selector);
        reg.setAlert(id, aapl, 1, 2);
        vm.stopPrank();
    }

    function test_linkCommunityToken() public {
        (address[] memory t, uint16[] memory w) = _twoTokens();
        vm.startPrank(alice);
        uint256 id = reg.createBasket("Tech", t, w, address(0));
        reg.linkCommunityToken(id, ogb);
        assertEq(reg.getBasket(id).communityToken, ogb);
        vm.stopPrank();
    }
}
