import React, { useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai/react';
import { useNavigate, useParams } from 'react-router';
import { isNumber } from 'remeda';

import Auction from '@/components/Auction';
import Documentation from '@/components/Documentation';
import { isCoolBackgroundAtom } from '@/state/atoms/applicationAtom';
import {
  lastAuctionNounIdAtom,
  onDisplayAuctionNounIdAtom,
} from '@/state/atoms/onDisplayAuctionAtom';
import { nounPath } from '@/utils/history';
import useOnDisplayAuction from '@/wrappers/onDisplayAuction';

type AuctionPageProps = object;

const AuctionPage: React.FC<AuctionPageProps> = () => {
  const { id: auctionId } = useParams<{ id: string }>();
  const onDisplayAuction = useOnDisplayAuction();
  const lastAuctionNounId = useAtomValue(lastAuctionNounIdAtom);
  const setOnDisplayAuctionNounId = useSetAtom(onDisplayAuctionNounIdAtom);
  const onDisplayAuctionNounId = Number(onDisplayAuction?.nounId);

  const navigate = useNavigate();

  useEffect(() => {
    // lastAuctionNounId が 0 (Niji #0 のみ mint 済) は合法値。 未初期化 (null/undefined) のみ skip。
    if (lastAuctionNounId == null) return;
    if (auctionId === undefined) {
      if (onDisplayAuctionNounId === Number(lastAuctionNounId)) return;
      setOnDisplayAuctionNounId(Number(lastAuctionNounId));
      return;
    }

    if (
      !isNumber(Number(auctionId)) ||
      Number(auctionId) > lastAuctionNounId ||
      Number(auctionId) < 0
    ) {
      navigate(nounPath(lastAuctionNounId));
      return;
    }

    if (Number(auctionId) !== onDisplayAuctionNounId) {
      setOnDisplayAuctionNounId(Number(auctionId));
    }
  }, [auctionId, lastAuctionNounId, navigate, onDisplayAuctionNounId, setOnDisplayAuctionNounId]);

  const isCoolBackground = useAtomValue(isCoolBackgroundAtom);
  const backgroundColor = isCoolBackground
    ? 'var(--brand-cool-background)'
    : 'var(--brand-warm-background)';

  return (
    <>
      <Auction auction={onDisplayAuction} />
      <Documentation backgroundColor={backgroundColor} />
    </>
  );
};
export default AuctionPage;
