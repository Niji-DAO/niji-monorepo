import type { Auction as IAuction } from '@/wrappers/nijiAuction';

import React, { useCallback, useEffect } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction } from '@niji/sdk/react';
import { useAtomValue } from 'jotai/react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAccount, useBlock } from 'wagmi';

import AuctionActivityDateHeadline from '@/components/AuctionActivityDateHeadline';
import AuctionActivityNijiTitle from '@/components/AuctionActivityNijiTitle';
import AuctionActivityWrapper from '@/components/AuctionActivityWrapper';
import AuctionNavigation from '@/components/AuctionNavigation';
import AuctionTitleAndNavWrapper from '@/components/AuctionTitleAndNavWrapper';
import CurrentBid, { BID_N_A } from '@/components/CurrentBid';
import SettleManuallyBtn from '@/components/SettleManuallyBtn';
import Winner from '@/components/Winner';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';

import nounContentClasses from './NijiContent.module.css';

import auctionActivityClasses from '@/components/AuctionActivity/AuctionActivity.module.css';
import auctionBidClasses from '@/components/AuctionActivity/BidHistory.module.css';
import bidBtnClasses from '@/components/BidHistoryBtn/BidHistoryBtn.module.css';

interface NijiContentProps {
  mintTimestamp: bigint;
  nounId: bigint;
  isFirstAuction: boolean;
  isLastAuction: boolean;
  onPrevAuctionClick: () => void;
  onNextAuctionClick: () => void;
  auction?: IAuction;
}

const NijiContent: React.FC<NijiContentProps> = props => {
  const {
    mintTimestamp,
    nounId,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
    auction,
  } = props;

  const isCool = useAtomValue(isCoolBackgroundAtom);
  const { address: activeAccount } = useAccount();
  const { t } = useLingui();

  // Nijider 枠 (Niji 0 / 10 / ...) は通常 auction と違って bid がないので、
  // auction.endTime を過ぎたら誰でも settleCurrentAndCreateNewAuction() を呼んで
  // 次の auction を開始できる必要がある。 Bid component と同様の settle 経路を
  // Nijider 用 NijiContent にも組み込む。
  //
  // endTime 判定は **chain 上の block.timestamp** で行う (Date.now() は browser local
  // 時刻で anvil evm_increaseTime とズレるため Issue #172 m-1)。 useBlock は polling で
  // chain block 進行に追従する。
  // useBlock({ watch: true }) は default で 1 秒 polling、 NijiContent が常時 re-render 発火し
  // サイト全体が「時々重い」 症状の一因になる。 auctionEnded 判定は endTime 精度で 5 秒粒度で十分、
  // pollingInterval: 5000 に緩めて poll 頻度を 5 倍削減 (Issue #3103、 Phase B perf)。
  const { data: latestBlock } = useBlock({ watch: { pollingInterval: 5_000 } });
  const chainNow = latestBlock?.timestamp;
  const auctionEnded =
    auction !== undefined &&
    chainNow !== undefined &&
    chainNow >= BigInt(auction.endTime.toString());
  const isWalletConnected = activeAccount !== undefined;

  const {
    writeContract: settleAuction,
    isPending: isSettling,
    isSuccess: didSettle,
    isError: didSettleFail,
    error: settleError,
  } = useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction();

  useEffect(() => {
    if (didSettle) toast.success(t`Settled auction successfully!`);
  }, [didSettle, t]);
  useEffect(() => {
    if (didSettleFail) toast.error(settleError?.message || t`Please try again.`);
  }, [didSettleFail, settleError, t]);

  const settleAuctionHandler = () => {
    settleAuction({});
  };

  // Page through Nijis via keyboard
  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: { key: string }) => {
      if (event.key === 'ArrowLeft') {
        onPrevAuctionClick();
      }
      if (event.key === 'ArrowRight') {
        onNextAuctionClick();
      }
    },
    [onNextAuctionClick, onPrevAuctionClick],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <AuctionActivityWrapper>
      <div className={auctionActivityClasses.informationRow}>
        <Row className={auctionActivityClasses.activityRow}>
          <AuctionTitleAndNavWrapper>
            <AuctionNavigation
              isFirstAuction={isFirstAuction}
              isLastAuction={isLastAuction}
              onNextAuctionClick={onNextAuctionClick}
              onPrevAuctionClick={onPrevAuctionClick}
            />
            <AuctionActivityDateHeadline startTime={mintTimestamp} />
          </AuctionTitleAndNavWrapper>
          <Col lg={12}>
            <AuctionActivityNijiTitle nounId={nounId} />
          </Col>
        </Row>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={4} className={auctionActivityClasses.currentBidCol}>
            <CurrentBid currentBid={BID_N_A} auctionEnded={true} />
          </Col>
          <Col
            lg={5}
            className={`${auctionActivityClasses.currentBidCol} ${nounContentClasses.currentBidCol} ${auctionActivityClasses.auctionTimerCol}`}
          >
            <div className={auctionActivityClasses.section}>
              <Winner winner={'0x'} isNounders={true} />
            </div>
          </Col>
        </Row>
      </div>
      <Row className={auctionActivityClasses.activityRow}>
        <Col lg={12}>
          <ul className={auctionBidClasses.bidCollection}>
            <li
              className={
                (isCool ? `${auctionBidClasses.bidRowCool}` : `${auctionBidClasses.bidRowWarm}`) +
                ` ${nounContentClasses.bidRow}`
              }
            >
              <Trans>All Niji auction proceeds are sent to the</Trans>{' '}
              <Link to="/vote" className={nounContentClasses.link}>
                <Trans>Niji DAO</Trans>
              </Link>
              .{' '}
              <Trans>
                For this reason, we, the project&#39;s founders (‘Nijiders’) have chosen to
                compensate ourselves with Nijis. Every 10th Niji for the first 5 years of the
                project will be sent to our multisig (5/10), where it will be vested and distributed
                to Nijiders.
              </Trans>
            </li>
          </ul>
          <div
            className={
              isCool ? bidBtnClasses.bidHistoryWrapperCool : bidBtnClasses.bidHistoryWrapperWarm
            }
          >
            <Link
              to="/nounders"
              className={isCool ? bidBtnClasses.bidHistoryCool : bidBtnClasses.bidHistoryWarm}
            >
              <Trans>Learn more</Trans> →
            </Link>
          </div>
          {auctionEnded && isWalletConnected && auction !== undefined && (
            <SettleManuallyBtn settleAuctionHandler={settleAuctionHandler} auction={auction} />
          )}
          {isSettling && (
            <p className="mt-2 text-center text-xs text-slate-600">
              <Trans>送信中…</Trans>
            </p>
          )}
        </Col>
      </Row>
    </AuctionActivityWrapper>
  );
};
export default NijiContent;
