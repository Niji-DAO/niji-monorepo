import { useLocation } from 'react-router';

import { useAppSelector } from '../hooks';

export const shouldUseStateBg = (location: { pathname: string }) => {
  return (
    location.pathname === '/' ||
    location.pathname.includes('/noun') ||
    location.pathname.includes('/auction')
  );
};

/**
 * Color-aware state picker — current page background (white / cool / warm) に応じて
 * 3 引数のうち 1 つを返す。 `utils/pickByState.ts` の generic 版 `usePickByState`
 * と名前衝突しないよう ColorState 接尾辞を付けて区別する (rename Issue #169 R-1)。
 * @param whiteState white page state で返す値
 * @param coolState  cool 背景時に返す値
 * @param warmState  warm 背景時に返す値
 */
export const usePickByStateColor = (whiteState: any, coolState: any, warmState: any) => {
  const location = useLocation();
  const useStateBg = shouldUseStateBg(location);
  const isCoolState = useAppSelector(state => state.application.isCoolBackground);

  if (!useStateBg) {
    return whiteState;
  }
  if (isCoolState) {
    return coolState;
  }
  return warmState;
};
