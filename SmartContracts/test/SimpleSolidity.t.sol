// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { Test } from "forge-std/Test.sol";
import { SimpleSolidity } from "../src/SimpleSolidity.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleSolidityTest is Test {
    
    SimpleSolidity simpleSolidity;

    function setUp() public {
        simpleSolidity = new SimpleSolidity();
    }

    function testInitialState() public view {
        string memory theMessage = simpleSolidity.message();

        uint likesCount = simpleSolidity.likesCount();
        uint dislikesCount = simpleSolidity.dislikesCount();
        address owner = simpleSolidity.owner();

        assertEq(theMessage, string("Initial message"));
        assertEq(likesCount, 0);
        assertEq(dislikesCount, 0);
        assertEq(owner, address(this));
    }

    function testLiking() public {
        SimpleSolidity simpleSolidityContract = new SimpleSolidity();
        simpleSolidityContract.like();
        assertEq(simpleSolidityContract.likesCount(), 1);

        vm.expectEmit();
        emit SimpleSolidity.Like(address(this));
        simpleSolidityContract.like();
    }

    function testDisliking() public {
        simpleSolidity.dislike();
        assertEq(simpleSolidity.dislikesCount(), 1);

        vm.expectEmit();
        emit SimpleSolidity.Dislike(address(this));
        simpleSolidity.dislike();
    }

    function test_RevertWhen_CallerIsNotOwner() public {
        address nonOwner = vm.addr(0x1);
        
        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector, 
                nonOwner
            )
        );
        simpleSolidity.setMessage("Should revert");
    }

    function testSetMessage() public {
        string memory oldMessage = simpleSolidity.message();

        vm.expectEmit();
        emit SimpleSolidity.MessageChanged(oldMessage, "value");
        simpleSolidity.setMessage("value");

        assertEq(simpleSolidity.message(), "value");
        assertEq(simpleSolidity.likesCount(), 0);
        assertEq(simpleSolidity.dislikesCount(), 0);
    }

    function testSettingMessageRevert() public {
        vm.prank(vm.addr(0x1));
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, vm.addr(0x1)));
        simpleSolidity.setMessage("Should fail because it is not the owner");
    }

    function testPlainETHTransfer() public {
        uint contractBalanceBefore = address(simpleSolidity).balance;
        assertEq(contractBalanceBefore, 0);

        address donor = vm.addr(0x1);
        deal(donor, 1 ether);
        vm.prank(donor);

        (bool success, ) = address(simpleSolidity).call{value: 1 ether}("");
        require(success, "Transfer failed");

        uint256 contractBalanceAfter = address(simpleSolidity).balance;
        assertEq(contractBalanceAfter, 1e18);
        // assertGt(contractBalanceBefore, contractBalanceAfter);
    }
}