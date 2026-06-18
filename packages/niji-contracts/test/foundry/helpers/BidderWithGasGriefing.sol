// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import { NijiAuctionHouseV3 } from '../../../contracts/NijiAuctionHouseV3.sol';

contract BidderWithGasGriefing {
    function bid(NijiAuctionHouseV3 auctionHouse, uint256 nounId) public payable {
        auctionHouse.createBid{ value: msg.value }(nounId);
    }

    receive() external payable {
        assembly {
            return(0, 107744)
        }
    }
}
