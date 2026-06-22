import React, { useEffect, useRef, useState } from 'react';

import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Col, Row } from 'react-bootstrap';

import { useAppSelector } from '@/hooks';
import { Auction } from '@/wrappers/nijiAuction';

const SECTION_CLASS =
  "[&_span]:font-londrina [&_span]:text-5xl [&_span]:font-bold [&_h4]:font-['PT_Root_UI'] [&_h4]:text-lg [&_h4]:font-bold [&_h2]:font-['PT_Root_UI'] [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:!mb-0 [&_h2]:mt-[3px] max-[992px]:justify-between max-[992px]:[&_h4]:mt-1.5 max-[992px]:[&_h4]:mb-0 max-[992px]:[&_h2]:text-[23px]";
const WRAPPER_CLASS =
  'pl-10 pr-0 mt-[0.3rem] w-max-content cursor-pointer max-[992px]:w-auto max-[992px]:mx-0 max-[992px]:pl-0';
const TIMER_WRAPPER_CLASS = 'mt-[1px] flex';
const TIMER_SECTION_CLASS =
  "mr-2 [&_span]:font-['PT_Root_UI'] [&_span]:!text-[32px] [&_span]:font-bold max-[992px]:[&_span]:!text-[23px]";
const TIMER_SECTION_FINAL_CLASS =
  "mr-0 [&_span]:font-['PT_Root_UI'] [&_span]:!text-[32px] [&_span]:font-bold max-[992px]:[&_span]:!text-[23px]";
const LEFT_COL_CLASS = 'mt-[1px] max-[992px]:mt-0 max-[992px]:pl-2';
const TIME_LEFT_CLASS = 'max-[992px]:pr-2';

dayjs.extend(duration);

interface AuctionTimerProps {
  auction: Auction;
  auctionEnded: boolean;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ auction, auctionEnded }) => {
  const [auctionTimer, setAuctionTimer] = useState(0);
  const [timerToggle, setTimerToggle] = useState(true);

  const auctionTimerRef = useRef(auctionTimer); // to access within setTimeout
  auctionTimerRef.current = auctionTimer;

  const timerDuration = dayjs.duration(auctionTimerRef.current, 's');
  const endTimeUnix = Math.floor(Date.now() / 1000) + auctionTimerRef.current;

  // timer logic
  useEffect(() => {
    const timeLeft = (auction && Number(auction.endTime)) - dayjs().unix();

    setAuctionTimer(auction && timeLeft);

    if (auction && timeLeft <= 0) {
      setAuctionTimer(0);
    } else {
      const timer = setTimeout(() => {
        setAuctionTimer(auctionTimerRef.current - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [auction, auctionTimer]);

  const auctionContentLong = auctionEnded ? (
    <Trans>Auction ended</Trans>
  ) : (
    <Trans>Auction ends in</Trans>
  );
  const auctionContentShort = auctionEnded ? (
    <Trans>Auction ended</Trans>
  ) : (
    <Trans>Time left</Trans>
  );

  const flooredMinutes = Math.floor(timerDuration.minutes());
  const flooredSeconds = Math.floor(timerDuration.seconds());
  const isCool = useAppSelector(state => state.application.isCoolBackground);

  if (!auction) return null;

  return (
    <Row
      className={clsx(WRAPPER_CLASS, SECTION_CLASS)}
      onClick={() => setTimerToggle(!timerToggle)}
    >
      <Col xs={timerToggle ? 4 : 6} lg={12} className={LEFT_COL_CLASS}>
        <h4
          style={{
            color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
          }}
        >
          {timerToggle ? (
            window.innerWidth < 992 ? (
              auctionContentShort
            ) : (
              auctionContentLong
            )
          ) : (
            <>
              <Trans>Ends on</Trans> {i18n.date(new Date(endTimeUnix * 1000), { month: 'short' })}{' '}
              {i18n.date(new Date(endTimeUnix * 1000), { day: 'numeric' })} <Trans>at</Trans>
            </>
          )}
        </h4>
      </Col>
      <Col xs="auto" lg={12}>
        {timerToggle ? (
          <h2
            className={clsx(TIMER_WRAPPER_CLASS, TIME_LEFT_CLASS)}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            <div className={TIMER_SECTION_CLASS}>
              <span>
                {`${Math.floor(timerDuration.hours())}`}
                <span>
                  <Trans>h</Trans>
                </span>
              </span>
            </div>
            <div className={TIMER_SECTION_CLASS}>
              <span>
                {`${flooredMinutes}`}
                <span>
                  <Trans>m</Trans>
                </span>
              </span>
            </div>
            <div className={TIMER_SECTION_FINAL_CLASS}>
              <span>
                {`${flooredSeconds}`}
                <span>
                  <Trans>s</Trans>
                </span>
              </span>
            </div>
          </h2>
        ) : (
          <h2
            className={TIMER_WRAPPER_CLASS}
            style={{
              color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)',
            }}
          >
            <div className={TIMER_SECTION_CLASS}>
              <span>{i18n.date(new Date(endTimeUnix * 1000), { timeStyle: 'medium' })}</span>
            </div>
          </h2>
        )}
      </Col>
    </Row>
  );
};

export default AuctionTimer;
