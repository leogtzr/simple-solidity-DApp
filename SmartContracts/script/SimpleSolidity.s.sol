// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import { SimpleSolidity } from "../src/SimpleSolidity.sol";

contract SimpleSolidityScript is Script {
    SimpleSolidity public simpleSolidity;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        simpleSolidity = new SimpleSolidity();

        vm.stopBroadcast();
    }
}
