import React from 'react';

import { Trans } from '@lingui/react/macro';
import { useAtomValue } from 'jotai/react';

import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';

import bidBtnClasses from './BidHistoryBtn.module.css';

interface BidHistoryBtnProps {
  onClick: () => void;
}

const BidHistoryBtn: React.FC<BidHistoryBtnProps> = ({ onClick }) => {
  const isCool = useAtomValue(isCoolBackgroundAtom);

  return (
    <div
      className={isCool ? bidBtnClasses.bidHistoryWrapperCool : bidBtnClasses.bidHistoryWrapperWarm}
      onClick={onClick}
    >
      <div className={bidBtnClasses.bidHistory}>
        <Trans>View all bids</Trans>
      </div>
    </div>
  );
};
export default BidHistoryBtn;
