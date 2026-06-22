import React from 'react';

import { Trans } from '@lingui/react/macro';

import { useAppSelector } from '@/hooks';

interface BidHistoryBtnProps {
  onClick: () => void;
}

const WRAPPER_BASE_CLASS =
  'flex cursor-pointer justify-center !rounded-[10px] transition-all duration-200 ease-in-out';
const WRAPPER_COOL_CLASS =
  'text-[color:var(--brand-cool-light-text)] hover:text-[color:var(--brand-color-blue)]';
const WRAPPER_WARM_CLASS =
  'text-[color:var(--brand-warm-light-text)] hover:text-[color:var(--brand-color-warm)]';
const BID_HISTORY_LABEL_CLASS =
  "ml-2 font-['PT_Root_UI'] text-[16px] font-bold text-[color:var(--brand-color-cool)] pb-4";

const BidHistoryBtn: React.FC<BidHistoryBtnProps> = ({ onClick }) => {
  const isCool = useAppSelector(state => state.application.stateBackgroundColor) === '#d5d7e1';

  return (
    <div
      className={`${WRAPPER_BASE_CLASS} ${isCool ? WRAPPER_COOL_CLASS : WRAPPER_WARM_CLASS}`}
      onClick={onClick}
    >
      <div className={BID_HISTORY_LABEL_CLASS}>
        <Trans>View all bids</Trans>
      </div>
    </div>
  );
};
export default BidHistoryBtn;
