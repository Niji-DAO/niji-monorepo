import { atom } from 'jotai/vanilla';

import { grey } from '@/utils/nounBgColors';

/**
 * 画面の背景色 (Niji の trait background id 0 → grey / 1 → beige) を保持する。
 *
 * 旧 Redux slice (state/slices/application.ts) を Jotai atom に 1:1 移行 (Issue #217、 Phase 1
 * 決定 Q1 = TanStack Query + Jotai)。 旧 slice の `isCoolBackground` field は
 * `stateBackgroundColor === grey` の派生値だったため derived atom として再構築する。
 */
export const stateBackgroundColorAtom = atom<string>(grey);

export const isCoolBackgroundAtom = atom(get => get(stateBackgroundColorAtom) === grey);
