import { useAtomValue } from 'jotai/react';

import { auctionAtom } from '@/state/atoms/auctionAtom';
import {
  lastAuctionNounIdAtom,
  onDisplayAuctionNounIdAtom,
} from '@/state/atoms/onDisplayAuctionAtom';
import { pastAuctionsAtom } from '@/state/atoms/pastAuctionsAtom';
import { compareBids } from '@/utils/compareBids';
import { generateEmptyNounderAuction, isNounderNiji } from '@/utils/nounderNiji';
import { Address, Bid, BidEvent } from '@/utils/types';

import { Auction } from './nijiAuction';

const deserializeAuction = (reduxSafeAuction: Auction): Auction => {
  return {
    amount: reduxSafeAuction.amount ? BigInt(reduxSafeAuction.amount) : undefined,
    bidder: reduxSafeAuction.bidder ? (reduxSafeAuction.bidder as Address) : undefined,
    startTime: BigInt(reduxSafeAuction.startTime),
    endTime: BigInt(reduxSafeAuction.endTime),
    nounId: BigInt(reduxSafeAuction.nounId),
    settled: false,
  };
};

const deserializeBid = (reduxSafeBid: BidEvent): Bid => {
  return {
    nounId: BigInt(reduxSafeBid.nounId),
    sender: reduxSafeBid.sender,
    value: BigInt(reduxSafeBid.value),
    extended: reduxSafeBid.extended,
    transactionHash: reduxSafeBid.transactionHash,
    transactionIndex: reduxSafeBid.transactionIndex,
    timestamp: BigInt(reduxSafeBid.timestamp),
    isFiat: reduxSafeBid.isFiat === true,
  };
};
const deserializeBids = (reduxSafeBids: BidEvent[]): Bid[] => {
  return reduxSafeBids.map(bid => deserializeBid(bid)).sort((a: Bid, b: Bid) => compareBids(a, b));
};

const useOnDisplayAuction = (): Auction | undefined => {
  const auctionState = useAtomValue(auctionAtom);
  const lastAuctionNounId = auctionState.activeAuction?.nounId;
  const onDisplayAuctionNounId = useAtomValue(onDisplayAuctionNounIdAtom);
  const currentAuction = auctionState.activeAuction;
  const pastAuctions = useAtomValue(pastAuctionsAtom);

  if (
    onDisplayAuctionNounId === undefined ||
    !lastAuctionNounId ||
    !currentAuction ||
    !pastAuctions
  ) {
    return undefined;
  }

  // current auction
  // lastAuctionNounId は redux store 上 string、 onDisplayAuctionNounId は number、
  // 元実装は BigInt(string) === string で常に false に落ちて current 経路に入れな
  // かったため、 両辺を BigInt 化して比較する。
  if (BigInt(onDisplayAuctionNounId) === BigInt(lastAuctionNounId)) {
    return deserializeAuction(currentAuction);
  }

  // nounder auction
  if (isNounderNiji(BigInt(onDisplayAuctionNounId))) {
    const emptyNounderAuction = generateEmptyNounderAuction(
      BigInt(onDisplayAuctionNounId),
      pastAuctions,
    );

    return deserializeAuction(emptyNounderAuction);
  }

  // past auction
  const pastAuction = pastAuctions.find(auction => {
    if (!auction.activeAuction) return false;
    const nounId = BigInt(auction.activeAuction.nounId);
    return Number(nounId) === onDisplayAuctionNounId;
  });
  const reduxSafeAuction = pastAuction?.activeAuction;

  return reduxSafeAuction ? deserializeAuction(reduxSafeAuction) : undefined;
};

export const useAuctionBids = (auctionNounId: bigint): Bid[] | undefined => {
  const lastAuctionNounId = useAtomValue(lastAuctionNounIdAtom);
  const lastAuctionBids = useAtomValue(auctionAtom).bids;
  const pastAuctions = useAtomValue(pastAuctionsAtom);

  // auction requested is active auction
  if (lastAuctionNounId === Number(auctionNounId)) {
    return deserializeBids(lastAuctionBids);
  } else {
    // find bids for past auction requested
    const bidEvents: BidEvent[] | undefined = pastAuctions?.find(auction => {
      const nounId = auction.activeAuction && BigInt(auction.activeAuction.nounId);
      return !!nounId && nounId === auctionNounId;
    })?.bids;

    return bidEvents ? deserializeBids(bidEvents) : undefined;
  }
};

export default useOnDisplayAuction;
