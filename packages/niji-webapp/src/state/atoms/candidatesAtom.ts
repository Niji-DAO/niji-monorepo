import { atom } from 'jotai/vanilla';

import { ProposalCandidate } from '@/wrappers/nijiData';

/**
 * Proposal candidates の view state (filtered list)。
 *
 * 実 fetch は `useCandidateProposals` (TanStack Query) で行い、 component で filter した
 * 結果を本 atom に書き込む。 旧 Redux slice (state/slices/candidates.ts) の `data` field
 * を Jotai atom に 1:1 移行したもの (Issue #212、 Phase 1 決定 Q1 = TanStack Query + Jotai)。
 *
 * loading / error は TanStack Query 側で持つため atom には保持しない (旧 slice の
 * setLoading / setError は consumer 0 件で dead だった)。
 */
export const candidatesAtom = atom<ProposalCandidate[] | undefined>(undefined);
