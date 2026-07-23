import type { AuctionState } from '@/state/atoms/auctionAtom';

import { atom } from 'jotai/vanilla';

import { GetLatestAuctionsQuery } from '@/subgraphs/graphql';
import { Address } from '@/utils/types';

/**
 * 過去 auction list の view state。
 *
 * 旧 Redux slice (state/slices/pastAuctions.ts) の `pastAuctions: AuctionState[]` を Jotai
 * atom に 1:1 移行したもの (Issue #213、 Phase 1 決定 Q1 = TanStack Query + Jotai)。 fetch は
 * subgraph (TanStack Query) または `useChainPastAuctions` (chain fallback) で行い、 結果を
 * `subgraphAuctionsToReduxSafe()` で整形してから本 atom に書き込む。
 */
export const pastAuctionsAtom = atom<AuctionState[]>([]);

/**
 * subgraph 形 `GetLatestAuctionsQuery` を AuctionState[] に変換する純粋関数。 旧 slice 内の
 * `reduxSafePastAuctions` をそのまま atom file に移植 (BigInt → string 整形を含む)。
 */
export const subgraphAuctionsToReduxSafe = (data: GetLatestAuctionsQuery): AuctionState[] => {
  const auctions = data.auctions;
  if (!auctions) return [];
  return auctions.map(auction => {
    return {
      activeAuction: {
        amount: auction.amount ? BigInt(auction.amount).toString() : undefined,
        bidder: auction.bidder ? (auction.bidder.id as Address) : undefined,
        startTime: BigInt(auction.startTime).toString(),
        endTime: BigInt(auction.endTime).toString(),
        nounId: BigInt(auction.id).toString(),
        settled: false,
      },
      bids: auction.bids.map(bid => {
        // subgraph の Bid.isFiat が 2026-07-23 追加 (fiat 代理入札の識別 flag)。
        // 未取得 (upgrade 前 index or query に isFiat 未含有) の時は undefined、
        // ロジック上は !== true で false 相当扱いになる。
        const bidWithIsFiat = bid as unknown as { isFiat?: boolean };
        return {
          nounId: BigInt(auction.id).toString(),
          sender: bid?.bidder?.id as Address,
          value: BigInt(bid.amount).toString(),
          extended: false,
          transactionHash: bid.txHash,
          transactionIndex: Number(bid.txIndex),
          timestamp: BigInt(bid.blockTimestamp).toString(),
          isFiat: bidWithIsFiat.isFiat === true,
        };
      }),
    };
  });
};
