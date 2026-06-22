import React from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { Col, Row } from 'react-bootstrap';

import TruncatedAmount from '@/components/TruncatedAmount';
import { useAppSelector } from '@/hooks';

const SECTION_CLASS =
  "[&_span]:font-londrina [&_span]:text-5xl [&_span]:font-bold [&_h4]:font-['PT_Root_UI'] [&_h4]:text-lg [&_h4]:font-bold [&_h2]:font-['PT_Root_UI'] [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:!mb-0 [&_h2]:mt-[3px] max-[992px]:justify-between max-[992px]:[&_h4]:mt-1.5 max-[992px]:[&_h4]:mb-0 max-[992px]:[&_h2]:text-[23px]";
const WRAPPER_CLASS = 'px-0 max-[992px]:w-full max-[992px]:mx-0';
const LEFT_COL_CLASS = 'max-[992px]:pl-2';

/**
 * Passible to CurrentBid as `currentBid` prop to indicate that
 * the bid amount is not applicable to this auction. (Nounder Niji)
 */
export const BID_N_A = 'n/a';

/**
 * Special Bid type for not applicable auctions (Nounder Niji)
 */
type BidNa = typeof BID_N_A;

interface CurrentBidProps {
  currentBid: bigint | BidNa;
  auctionEnded: boolean;
}

const CurrentBid: React.FC<CurrentBidProps> = props => {
  const { currentBid, auctionEnded } = props;
  const isCool = useAppSelector(state => state.application.isCoolBackground);
  const titleContent = auctionEnded ? <Trans>Winning bid</Trans> : <Trans>Current bid</Trans>;

  return (
    <Row className={clsx(WRAPPER_CLASS, SECTION_CLASS)}>
      <Col xs={5} lg={12} className={LEFT_COL_CLASS}>
        <h4
          style={{
            color: isCool ? 'var(--brand-cool-light-text)' : 'var(--brand-warm-light-text)',
          }}
        >
          {titleContent}
        </h4>
      </Col>
      <Col xs="auto" lg={12}>
        <h2
          className="max-[992px]:mr-2"
          style={{ color: isCool ? 'var(--brand-cool-dark-text)' : 'var(--brand-warm-dark-text)' }}
        >
          {currentBid === BID_N_A ? BID_N_A : <TruncatedAmount amount={currentBid} />}
        </h2>
      </Col>
    </Row>
  );
};

export default CurrentBid;
