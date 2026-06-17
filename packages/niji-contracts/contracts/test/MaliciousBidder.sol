// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import { INijiAuctionHouse } from '../interfaces/INijiAuctionHouse.sol';

contract MaliciousBidder {
    function bid(INijiAuctionHouse auctionHouse, uint256 tokenId) public payable {
        auctionHouse.createBid{ value: msg.value }(tokenId);
    }

    receive() external payable {
        assembly {
            invalid()
        }
    }
}
