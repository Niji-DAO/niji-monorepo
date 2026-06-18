// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Base.sol';
import { INijiAuctionHouse } from '../../../contracts/interfaces/INijiAuctionHouse.sol';

abstract contract AuctionHelpers is CommonBase {
    function bidAndSettleAuction(INijiAuctionHouse auctionHouse, address buyer) internal {
        INijiAuctionHouse.Auction memory auction = getAuction(auctionHouse);
        if (auction.endTime < block.timestamp) {
            auctionHouse.settleCurrentAndCreateNewAuction();
            auction = getAuction(auctionHouse);
        }

        vm.deal(buyer, buyer.balance + 0.1 ether);
        vm.startPrank(buyer);
        uint256 newNounId = auction.nounId;
        auctionHouse.createBid{ value: 0.1 ether }(newNounId);
        vm.warp(block.timestamp + auction.endTime);
        auctionHouse.settleCurrentAndCreateNewAuction();
        vm.roll(block.number + 1);
        vm.stopPrank();
    }

    function getAuction(INijiAuctionHouse auctionHouse) internal view returns (INijiAuctionHouse.Auction memory) {
        (
            uint256 nounId,
            uint256 amount,
            uint256 startTime,
            uint256 endTime,
            address payable bidder,
            bool settled
        ) = auctionHouse.auction();

        return INijiAuctionHouse.Auction(nounId, amount, startTime, endTime, bidder, settled);
    }
}
