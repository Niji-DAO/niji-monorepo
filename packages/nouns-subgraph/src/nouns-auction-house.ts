import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
} from './types/NounsAuctionHouse/NounsAuctionHouse';
import { Auction, Bid, Niji } from './types/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleAuctionCreated(event: AuctionCreated): void {
  const nounId = event.params.nounId.toString();

  const noun = Niji.load(nounId);
  if (noun == null) {
    log.error('[handleAuctionCreated] Niji #{} not found. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const auction = new Auction(nounId);
  auction.noun = noun.id;
  auction.amount = BigInt.fromI32(0);
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  auction.save();
}

export function handleAuctionBid(event: AuctionBid): void {
  const nounId = event.params.nounId.toString();
  const bidderAddress = event.params.sender.toHex();

  const bidder = getOrCreateAccount(bidderAddress);

  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleAuctionBid] Auction not found for Niji #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  const bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.noun = auction.noun;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  const nounId = event.params.nounId.toString();

  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleAuctionExtended] Auction not found for Niji #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.endTime = event.params.endTime;
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {
  const nounId = event.params.nounId.toString();

  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for Niji #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.settled = true;
  auction.save();
}
