import { atom } from 'jotai/vanilla';

/**
 * 画面に現在表示中の auction nounId と、 chain 上の最新 auction nounId を保持する。
 *
 * 旧 Redux slice (state/slices/onDisplayAuction.ts) を Jotai atom に 1:1 移行 (Issue #216、
 * Phase 1 決定 Q1 = TanStack Query + Jotai)。 reducer で setLastAuctionNounId /
 * setOnDisplayAuctionNounId のみが consumer 9 file で 14 箇所利用、 旧 setPrevOnDisplay... /
 * setNextOnDisplay... の 2 reducer は webapp 内 dispatch 0 件で dead だったため移植せず破棄。
 */
export const lastAuctionNounIdAtom = atom<number | undefined>(undefined);
export const onDisplayAuctionNounIdAtom = atom<number | undefined>(undefined);
