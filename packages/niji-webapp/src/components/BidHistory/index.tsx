import React from 'react';

import { useAtomValue } from 'jotai/react';

import { BidHistoryItem } from '@/components/BidHistoryItem';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';
import { Bid } from '@/utils/types';
import { useAuctionBids } from '@/wrappers/onDisplayAuction';

interface BidHistoryProps {
  auctionId: string;
  max: number;
  classes: Record<string, string>;
}

const BidHistory: React.FC<BidHistoryProps> = props => {
  const { auctionId, max, classes } = props;
  const isCool = useAtomValue(isCoolBackgroundAtom);
  const bids = useAuctionBids(BigInt(auctionId));
  const bidContent =
    bids &&
    bids
      .toSorted((bid1: Bid, bid2: Bid) => -1 * Number(bid1.timestamp - bid2.timestamp))
      .map((bid: Bid, i: number) => {
        return <BidHistoryItem key={i} bid={bid} classes={classes} isCool={isCool} />;
      })
      .slice(0, max);

  return <ul className={classes.bidCollection}>{bidContent}</ul>;
};

export default BidHistory;
