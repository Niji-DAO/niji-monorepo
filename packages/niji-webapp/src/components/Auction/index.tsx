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

const NOUN_WRAPPER_CLASS =
  'w-full self-end max-[992px]:w-[70%] max-[992px]:mx-[15%] max-[568px]:w-[80%] max-[568px]:mx-[10%] max-[568px]:mt-8';
const NOUN_CONTENT_COL_CLASS = 'flex max-[568px]:p-0';
const AUCTION_ACTIVITY_COL_CLASS =
  '!self-end min-h-[558px] pb-0 pr-20 max-[992px]:w-full max-[992px]:bg-white max-[992px]:pt-[5%] max-[992px]:px-[5%] max-[568px]:w-full max-[568px]:mx-[unset] max-[568px]:pt-8 max-[568px]:pr-[unset] max-[568px]:pl-0';

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
    <div className={NOUN_WRAPPER_CLASS}>
      <NijiWithSeed
        nounId={BigInt(currentAuction.nounId)}
        onLoadSeed={loadedNounHandler}
        shouldLinkToProfile={false}
      />
    </div>
  );

  const loadingNoun = (
    <div className={NOUN_WRAPPER_CLASS}>
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
    <div style={{ backgroundColor: stateBgColor }}>
      <Container fluid="xl">
        <Row>
          <Col lg={{ span: 6 }} className={NOUN_CONTENT_COL_CLASS}>
            {currentAuction ? nounContent : loadingNoun}
          </Col>
          <Col lg={{ span: 6 }} className={AUCTION_ACTIVITY_COL_CLASS}>
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
