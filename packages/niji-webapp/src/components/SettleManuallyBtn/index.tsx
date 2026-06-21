import { useEffect, useRef, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import dayjs from 'dayjs';
import { Info } from 'lucide-react';

import { Auction } from '@/wrappers/nijiAuction';

import classes from './SettleManuallyBtn.module.css';

const SettleManuallyBtn: React.FC<{
  settleAuctionHandler: () => void;
  auction: Auction;
}> = props => {
  const { settleAuctionHandler, auction } = props;

  const MINS_TO_ENABLE_MANUAL_SETTLEMENT = 5;

  const [settleEnabled, setSettleEnabled] = useState(false);
  const [auctionTimer, setAuctionTimer] = useState(MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60);
  const auctionTimerRef = useRef(auctionTimer); // to access within setTimeout
  auctionTimerRef.current = auctionTimer;

  const timerDuration = dayjs.duration(auctionTimerRef.current, 's');

  // timer logic
  useEffect(() => {
    // anvil (31337) も Base Sepolia (84532) も test 環境なので即時 manual settle 許可。
    // mainnet を撤廃したので常に即時 settle 可。
    setSettleEnabled(true);
    setAuctionTimer(0);
    return;

    // prettier-ignore
    const timeLeft = MINS_TO_ENABLE_MANUAL_SETTLEMENT * 60 - (dayjs().unix() - (auction && Number(auction.endTime)));

    setAuctionTimer(auction && timeLeft);

    if (auction && timeLeft <= 0) {
      setSettleEnabled(true);
      setAuctionTimer(0);
    } else {
      const timer = setTimeout(() => {
        setAuctionTimer(auctionTimerRef.current - 1);
      }, 1_000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [auction, auctionTimer]);

  const mins = timerDuration.minutes();

  return (
    <p className={classes.emergencySettleWrapper}>
      <button
        onClick={settleAuctionHandler}
        className={classes.emergencySettleButton}
        disabled={!settleEnabled}
      >
        {settleEnabled ? (
          <>
            <Trans>Settle manually</Trans>
          </>
        ) : (
          <>
            <Info className="inline-block h-4 w-4" />
            {mins !== 0 ? (
              <Trans>You can settle manually in {mins + 1} minutes</Trans>
            ) : (
              <Trans>You can settle manually in 1 minute</Trans>
            )}
          </>
        )}
      </button>
    </p>
  );
};

export default SettleManuallyBtn;
