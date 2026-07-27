import { BigInt, log } from '@graphprotocol/graph-ts';

import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
} from './types/NijiAuctionHouse/NijiAuctionHouse';
import {
  AuctionSettledWithClientId,
  AuctionBidWithClientId,
} from './types/NijiAuctionHouseV2/NijiAuctionHouseV2';
import { BidPlacedFor } from './types/NijiAuctionHouseV3/NijiAuctionHouseV3';
import { Auction, Noun, Bid } from './types/schema';
import { getOrCreateAccount } from './utils/helpers';

export function handleAuctionCreated(event: AuctionCreated): void {
  const nounId = event.params.nounId.toString();

  const noun = Noun.load(nounId);
  if (noun == null) {
    log.error('[handleAuctionCreated] Noun #{} not found. Hash: {}', [
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
  auction.clientId = 0;
  auction.save();
}

export function handleAuctionBid(event: AuctionBid): void {
  const bidder = getOrCreateAccount(event.params.sender.toHex());
  const auction = Auction.load(event.params.nounId.toString());
  if (auction == null) {
    log.error('[handleAuctionBid] Auction not found for Noun #{}. Hash: {}', [
      event.params.nounId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  // ETH 経路 default = isFiat=false, payer/recipient は null。
  // fiat 経路では同一 tx 内で AuctionBid の後に BidPlacedFor が emit されるので、
  // handleBidPlacedFor が本 entity を load して bidder / payer / recipient / isFiat を上書きする。
  const bidId = event.params.nounId.toString().concat('-').concat(event.params.value.toString());
  const bid = new Bid(bidId);
  bid.bidder = bidder.id;
  bid.isFiat = false;
  bid.amount = auction.amount;
  bid.noun = auction.noun;
  bid.txHash = event.transaction.hash;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

/**
 * fiat 代理入札 (createBidFor) 経路で AuctionBid の直後に emit される BidPlacedFor を handle し、
 * Bid.bidder / Auction.bidder を relayer から recipient (fiat 支払 user wallet) に上書きする。
 * payer / recipient / isFiat フィールドも set し、 subgraph client 側で「代理入札」 判別できるようにする。
 *
 * Bid id = `nounId-value` は AuctionBid と同一 tx 内なので lookup 可能。 event ordering は
 * Graph 側で deterministic (log order) のため race なし = codex 2026-07-23 review で確認済。
 */
export function handleBidPlacedFor(event: BidPlacedFor): void {
  const nounId = event.params.nounId.toString();
  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleBidPlacedFor] Auction not found for Noun #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const payer = getOrCreateAccount(event.params.payer.toHex());
  const recipient = getOrCreateAccount(event.params.recipient.toHex());

  // Auction.bidder を recipient (user wallet) で上書き。
  // handleAuctionBid が先に relayer で set した値を差替える。
  auction.bidder = recipient.id;
  auction.save();

  // Bid entity も同 id で load して上書き (payer / recipient / isFiat 追加、 bidder も置換)。
  const bidId = nounId.concat('-').concat(event.params.value.toString());
  const bid = Bid.load(bidId);
  if (bid == null) {
    log.error('[handleBidPlacedFor] Bid entity not found for id={}. Hash: {}', [
      bidId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  bid.bidder = recipient.id;
  bid.payer = payer.id;
  bid.recipient = recipient.id;
  bid.isFiat = true;
  bid.save();
}

export function handleAuctionBidWithClientId(event: AuctionBidWithClientId): void {
  const bidId = event.params.nounId.toString().concat('-').concat(event.params.value.toString());
  const bid = Bid.load(bidId);
  if (bid == null) {
    log.error('[handleAuctionBidWithClientId] Bid not found for Noun #{}. Hash: {}', [
      event.params.nounId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  bid.clientId = event.params.clientId.toI32();
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  const nounId = event.params.nounId.toString();

  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleAuctionExtended] Auction not found for Noun #{}. Hash: {}', [
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
    log.error('[handleAuctionSettled] Auction not found for Noun #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.settled = true;
  auction.save();
}

export function handleAuctionSettledWithClientId(event: AuctionSettledWithClientId): void {
  const nounId = event.params.nounId.toString();
  const auction = Auction.load(nounId);
  if (auction == null) {
    log.error('[handleAuctionSettled] Auction not found for Noun #{}. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  auction.clientId = event.params.clientId.toI32();
  auction.save();
}
