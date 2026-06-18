import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import AuctionActivity from '@/components/AuctionActivity';
import { LoadingNoun } from '@/components/LegacyNoun';
import { NijiWithSeed } from '@/components/Niji';
import NijiContent from '@/components/NijiContent';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setStateBackgroundColor } from '@/state/slices/application';
import { RootState } from '@/store';
import { nounPath } from '@/utils/history';
import { beige, grey } from '@/utils/nounBgColors';
import { isNounderNiji } from '@/utils/nounderNiji';
import { Auction as IAuction } from '@/wrappers/nijiAuction';
import { INounSeed } from '@/wrappers/nijiToken';

import classes from './Auction.module.css';

interface AuctionProps {
  auction?: IAuction;
}

const Auction: React.FC<AuctionProps> = props => {
  const { auction: currentAuction } = props;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stateBgColor = useAppSelector((state: RootState) => state.application.stateBackgroundColor);
  const lastNounId = useAppSelector((state: RootState) => state.onDisplayAuction.lastAuctionNounId);

  const loadedNounHandler = (seed: INounSeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  const prevAuctionHandler = () => {
    if (currentAuction) {
      navigate(nounPath(Number(currentAuction.nounId) - 1));
    }
  };
  const nextAuctionHandler = () => {
    if (currentAuction) {
      navigate(nounPath(Number(currentAuction.nounId) + 1));
    }
  };

  const nounContent = currentAuction && (
    <div className={classes.nounWrapper}>
      <NijiWithSeed
        nounId={BigInt(currentAuction.nounId)}
        onLoadSeed={loadedNounHandler}
        shouldLinkToProfile={false}
      />
    </div>
  );

  const loadingNoun = (
    <div className={classes.nounWrapper}>
      <LoadingNoun />
    </div>
  );

  const currentAuctionActivityContent = currentAuction && lastNounId && (
    <AuctionActivity
      auction={currentAuction}
      isFirstAuction={currentAuction.nounId === 0n}
      isLastAuction={currentAuction.nounId === BigInt(lastNounId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
      displayGraphDepComps={true}
    />
  );
  const nounderNounContent = currentAuction && lastNounId && (
    <NijiContent
      mintTimestamp={BigInt(currentAuction.startTime)}
      nounId={BigInt(currentAuction.nounId)}
      isFirstAuction={currentAuction.nounId === 0n}
      isLastAuction={currentAuction.nounId === BigInt(lastNounId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
    />
  );

  return (
    <div style={{ backgroundColor: stateBgColor }} className={classes.wrapper}>
      <Container fluid="xl">
        <Row>
          <Col lg={{ span: 6 }} className={classes.nounContentCol}>
            {currentAuction ? nounContent : loadingNoun}
          </Col>
          <Col lg={{ span: 6 }} className={classes.auctionActivityCol}>
            {currentAuction &&
              (isNounderNiji(BigInt(currentAuction.nounId))
                ? nounderNounContent
                : currentAuctionActivityContent)}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auction;
