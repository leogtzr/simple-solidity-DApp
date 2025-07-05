// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleSolidity is Ownable {
    string public message;
    uint public likesCount;
    uint public dislikesCount;

    event MessageChanged(string oldMessage, string newMessage);
    event Like(address indexed likedBy);
    event Dislike(address indexed dislikedBy);
    event Donation(address indexed donor, uint amount);

    constructor() Ownable(msg.sender) {
        message = "Initial message";
    }

    function setMessage(string memory _message) public onlyOwner {
        string memory oldMessage = message;
        message = _message;
        likesCount = 0;
        dislikesCount = 0;
        emit MessageChanged(oldMessage, _message);
    }

    function like() public {
        likesCount++;
        emit Like(msg.sender);
    }

    function dislike() public {
        dislikesCount++;
        emit Dislike(msg.sender);
    }

    receive() external payable {
        emit Donation(msg.sender, msg.value);
    }
}