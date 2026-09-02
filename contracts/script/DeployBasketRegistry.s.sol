// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BasketRegistry} from "../src/BasketRegistry.sol";

/// @notice Deploy BasketRegistry to Base mainnet.
/// Soufian signs (doctrine: Claude prepares, Soufian signs). Run from WSL:
///   base-forge script script/DeployBasketRegistry.s.sol \
///     --rpc-url https://mainnet.base.org \
///     --account lrifton-0x1dee --sender 0x1deeaEc4250e66702E22777Ec1E3A70B19745A72 \
///     --broadcast
contract DeployBasketRegistry is Script {
    function run() external returns (BasketRegistry reg) {
        vm.startBroadcast();
        reg = new BasketRegistry();
        vm.stopBroadcast();
        console.log("BasketRegistry deployed at:", address(reg));
    }
}
