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
 * 増額 bid の 5 phase state 識別子 (Issue #3025 Phase 2 grilling P7 A' 案)
 *
 * webapp UI が topup endpoint 応答に応じて stepper 遷移する際の SSOT。
 * useFiatBid hook 側の FiatTopupPhase と同 shape、 hook 内 state と atom 間で
 * 直接 share せず, 起動元 (Bid component) が hook state を atom へ反映する契約。
 */
export type TopupStatePhase =
  | 'idle'
  | 'pending'
  | 'auth-taken'
  | 'tx-broadcast'
  | 'tx-confirmed'
  | 'cleanup-queued'
  | 'failure';

/**
 * 旧 authorization の async cleanup phase 識別子 (endpoint 応答後の非同期経路)
 *
 * queued  = topup endpoint 応答時点 (cleanup queue に enqueue 済、 実行 5 秒 delay 待機中)
 * running = cleanup worker が GMO alterTran VOID を発火中 (webapp から観測不能、 backend log のみ)
 * done    = cleanup 完了 (旧 authorization VOID 成功、 webapp から観測不能)
 *
 * 観測不能 phase のため webapp 表示は queued 固定 + 「別 tab で作業続行可」 disclaimer で説明する。
 */
export type CleanupPhase = 'idle' | 'queued' | 'running' | 'done';

/**
 * 増額 bid 中の transient state (auction 落札状態と分離)。
 *
 * Phase 2 mvp は modal ローカル state で完結、 atom へ晒すのは
 * (a) 他 component から「増額 bid 中」 を参照したい場合の hook 経路
 * (b) chain event 経由で bid 増額を検知したときの表示更新の 2 用途に閉じる。
 */
export interface TopupState {
  /** 増額 bid の現 phase (5 phase stepper 表示用) */
  phase: TopupStatePhase;
  /** 旧 authorization の cleanup phase (async 完了は観測不能) */
  cleanupPhase: CleanupPhase;
  /** 増額 bid 対象の旧 authId (topup endpoint request の authId) */
  oldAuthId?: string;
  /** 増額 bid 完了後の新 authId (endpoint 応答の authId) */
  newAuthId?: string;
}

const initialTopupState: TopupState = {
  phase: 'idle',
  cleanupPhase: 'idle',
};

/**
 * 増額 bid の 5 phase + async cleanup state atom (Issue #3025)
 *
 * FiatBidModal 内の useFiatBid hook state を setter 経由で反映する契約、
 * atom 側は presentation state のみ管理 (network call は hook が担当、 SoC 保持)。
 */
export const topupStateAtom = atom<TopupState>(initialTopupState);

export const applyTopupPhase = (
  state: TopupState,
  payload: { phase: TopupStatePhase; oldAuthId?: string; newAuthId?: string },
): TopupState => ({
  ...state,
  phase: payload.phase,
  oldAuthId: payload.oldAuthId ?? state.oldAuthId,
  newAuthId: payload.newAuthId ?? state.newAuthId,
});

export const applyCleanupPhase = (
  state: TopupState,
  payload: { cleanupPhase: CleanupPhase },
): TopupState => ({
  ...state,
  cleanupPhase: payload.cleanupPhase,
});

export const resetTopupState = (): TopupState => initialTopupState;

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
