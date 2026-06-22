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

import auctionActivityClasses from '@/components/AuctionActivity/AuctionActivity.module.css';
import auctionBidClasses from '@/components/AuctionActivity/BidHistory.module.css';

const WRAPPER_BASE_CLASS =
  'flex cursor-pointer justify-center !rounded-[10px] transition-all duration-200 ease-in-out';
const WRAPPER_COOL_CLASS =
  'text-[color:var(--brand-cool-light-text)] hover:text-[color:var(--brand-color-blue)]';
const WRAPPER_WARM_CLASS =
  'text-[color:var(--brand-warm-light-text)] hover:text-[color:var(--brand-color-warm)]';
const LINK_COOL_CLASS =
  "ml-2 font-['PT_Root_UI'] text-[16px] font-bold text-[color:var(--brand-color-blue)] no-underline transition-all duration-200 ease-in-out hover:text-[color:var(--brand-color-blue)] hover:brightness-110";
const LINK_WARM_CLASS =
  "ml-2 font-['PT_Root_UI'] text-[16px] font-bold text-[color:var(--brand-color-red)] no-underline transition-all duration-200 ease-in-out hover:text-[color:var(--brand-color-red)] hover:brightness-110";

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
            className={`${auctionActivityClasses.currentBidCol} !border-r-0 ${auctionActivityClasses.auctionTimerCol}`}
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
                ' text-[15.5px] font-medium leading-[21px]'
              }
            >
              <Trans>All Niji auction proceeds are sent to the</Trans>{' '}
              <Link
                to="/vote"
                className="text-[color:var(--brand-dark-green)] underline visited:text-[color:var(--brand-dark-green)] hover:text-[color:var(--brand-dark-red)] active:text-[color:var(--brand-dark-green)]"
              >
                <Trans>Niji DAO</Trans>
              </Link>
              .{' '}
              <Trans>
                For this reason, we, the project&#39;s founders (‘Nounders’) have chosen to
                compensate ourselves with Nijis. Every 10th Niji for the first 5 years of the
                project will be sent to our multisig (5/10), where it will be vested and distributed
                to Nounders.
              </Trans>
            </li>
          </ul>
          <div
            className={`${WRAPPER_BASE_CLASS} ${isCool ? WRAPPER_COOL_CLASS : WRAPPER_WARM_CLASS}`}
          >
            <Link to="/nounders" className={isCool ? LINK_COOL_CLASS : LINK_WARM_CLASS}>
              <Trans>Learn more</Trans> →
            </Link>
          </div>
        </Col>
      </Row>
    </AuctionActivityWrapper>
  );
};
export default NijiContent;
