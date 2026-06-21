import { atom } from 'jotai/vanilla';

import {
  Address,
  AuctionCreateEvent,
  AuctionExtendedEvent,
  AuctionSettledEvent,
  BidEvent,
} from '@/utils/types';
import { Auction as IAuction } from '@/wrappers/nijiAuction';

export interface AuctionState {
  activeAuction?: IAuction;
  bids: BidEvent[];
}

const initialState: AuctionState = {
  activeAuction: undefined,
  bids: [],
};

/**
 * Current auction の view state (websocket / wagmi watch event 経由で更新)。
 *
 * 旧 Redux slice (state/slices/auction.ts) を Jotai atom に 1:1 移行したもの (Issue #215、
 * Phase 1 決定 Q1 = TanStack Query + Jotai)。 reducer は updater 関数として export し、
 * `useSetAtom(auctionAtom)` で受けた setter に updater(prev, payload) を渡して合成する。
 *
 * Q4 確定方針は `queryClient.setQueryData` だったが、 本 slice の更新は ChainSubscriber 内
 * の `useWatchNijiAuctionHouse*` event handler から行われており、 TanStack Query の cache
 * を共有する経路がなく event → atom set で十分。 query 経路を新設するのは複雑度が増す
 * ため atom 経路で統一する (#215 内で Q4 解釈を簡略化、 親 #155 / discussion-html に追記)。
 */
export const auctionAtom = atom<AuctionState>(initialState);

export const reduxSafeNewAuction = (auction: AuctionCreateEvent): IAuction => ({
  amount: BigInt(0).toString(),
  bidder: '0x' as `0x${string}`,
  startTime: BigInt(auction.startTime).toString(),
  endTime: BigInt(auction.endTime).toString(),
  nounId: BigInt(auction.nounId).toString(),
  settled: false,
});

export const reduxSafeAuction = (auction: IAuction): IAuction => ({
  amount: auction.amount ? BigInt(auction.amount).toString() : undefined,
  bidder: auction.bidder ? (auction.bidder as Address) : undefined,
  startTime: BigInt(auction.startTime).toString(),
  endTime: BigInt(auction.endTime).toString(),
  nounId: BigInt(auction.nounId).toString(),
  settled: auction.settled,
});

export const reduxSafeBid = (bid: BidEvent): BidEvent => ({
  nounId: BigInt(bid.nounId).toString(),
  sender: bid.sender,
  value: BigInt(bid.value).toString(),
  extended: bid.extended,
  transactionHash: bid.transactionHash,
  transactionIndex: bid.transactionIndex,
  timestamp: bid.timestamp.toString(),
});

const maxBid = (bids: BidEvent[]): BidEvent => {
  if (bids.length === 0) {
    throw new Error('Cannot find maximum bid in an empty array');
  }
  return bids.reduce((prev, current) => {
    return BigInt(prev.value) > BigInt(current.value) ? prev : current;
  }, bids[0]);
};

const auctionsEqual = (
  a: IAuction,
  b: AuctionSettledEvent | AuctionCreateEvent | BidEvent | AuctionExtendedEvent,
) => BigInt(a.nounId) === BigInt(b.nounId);

const containsBid = (bidEvents: BidEvent[], bidEvent: BidEvent) =>
  bidEvents.map(bid => bid.transactionHash).indexOf(bidEvent.transactionHash) >= 0;

/**
 * 旧 slice の 5 reducer を pure updater 関数として export。 setter side で
 *   `setAuction(prev => applyActiveAuction(prev, payload))`
 * のように呼ぶ (Jotai の primitive atom に updater fn を渡せる API を活用)。
 */

export const applyActiveAuction = (
  state: AuctionState,
  payload: AuctionCreateEvent,
): AuctionState => ({
  ...state,
  activeAuction: reduxSafeNewAuction(payload),
  bids: [],
});

export const applyFullAuction = (state: AuctionState, payload: IAuction): AuctionState => ({
  ...state,
  activeAuction: reduxSafeAuction(payload),
});

export const applyAppendBid = (state: AuctionState, payload: BidEvent): AuctionState => {
  if (!(state.activeAuction && auctionsEqual(state.activeAuction, payload))) return state;
  if (containsBid(state.bids, payload)) return state;
  const nextBids = [reduxSafeBid(payload), ...state.bids];
  const maxBid_ = maxBid(nextBids);
  return {
    ...state,
    bids: nextBids,
    activeAuction: {
      ...state.activeAuction,
      amount: BigInt(maxBid_.value).toString(),
      bidder: maxBid_.sender,
    },
  };
};

export const applyAuctionSettled = (
  state: AuctionState,
  payload: AuctionSettledEvent,
): AuctionState => {
  if (!(state.activeAuction && auctionsEqual(state.activeAuction, payload))) return state;
  return {
    ...state,
    activeAuction: {
      ...state.activeAuction,
      settled: true,
      bidder: payload.winner,
      amount: BigInt(payload.amount).toString(),
    },
  };
};

export const applyAuctionExtended = (
  state: AuctionState,
  payload: AuctionExtendedEvent,
): AuctionState => {
  if (!(state.activeAuction && auctionsEqual(state.activeAuction, payload))) return state;
  return {
    ...state,
    activeAuction: {
      ...state.activeAuction,
      endTime: BigInt(payload.endTime).toString(),
    },
  };
};
