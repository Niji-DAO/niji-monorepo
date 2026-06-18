import React, { useCallback, useEffect } from 'react';

import { Trans } from '@lingui/react/macro';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';

import AuctionActivityDateHeadline from '@/components/AuctionActivityDateHeadline';
import AuctionActivityNijiTitle from '@/components/AuctionActivityNijiTitle';
import AuctionActivityWrapper from '@/components/AuctionActivityWrapper';
import AuctionNavigation from '@/components/AuctionNavigation';
import AuctionTitleAndNavWrapper from '@/components/AuctionTitleAndNavWrapper';
import CurrentBid, { BID_N_A } from '@/components/CurrentBid';
import Winner from '@/components/Winner';
import { useAppSelector } from '@/hooks';

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
}

const NijiContent: React.FC<NijiContentProps> = props => {
  const {
    mintTimestamp,
    nounId,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
  } = props;

  const isCool = useAppSelector(state => state.application.isCoolBackground);

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
        </Col>
      </Row>
    </AuctionActivityWrapper>
  );
};
export default NijiContent;
