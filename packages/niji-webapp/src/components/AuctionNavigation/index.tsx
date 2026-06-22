import React, { useCallback, useEffect } from 'react';

import { useNavigate } from 'react-router';

import { useAppSelector } from '@/hooks';
import useOnDisplayAuction from '@/wrappers/onDisplayAuction';

const ARROW_BASE_CLASS =
  'inline-block h-8 w-8 appearance-none rounded-full border-none bg-contain bg-no-repeat p-0 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50 min-[992px]:hover:bg-[color:var(--brand-gray-hover)] min-[992px]:hover:opacity-90';
const ARROW_COOL_CLASS =
  'bg-[color:var(--brand-cool-accent)] text-[color:var(--brand-cool-dark-text)]';
const ARROW_WARM_CLASS =
  'bg-[color:var(--brand-warm-accent)] text-[color:var(--brand-warm-dark-text)]';
const RIGHT_MARGIN_CLASS = 'ml-[0.3rem]';

interface AuctionNavigationProps {
  isFirstAuction: boolean;
  isLastAuction: boolean;
  onPrevAuctionClick: () => void;
  onNextAuctionClick: () => void;
}

const AuctionNavigation: React.FC<AuctionNavigationProps> = props => {
  const { isFirstAuction, isLastAuction, onPrevAuctionClick, onNextAuctionClick } = props;
  const isCool = useAppSelector(state => state.application.stateBackgroundColor) === '#d5d7e1';
  const navigate = useNavigate();
  const onDisplayAuction = useOnDisplayAuction();
  const lastAuctionNounId = useAppSelector(state => state.onDisplayAuction.lastAuctionNounId);
  const onDisplayAuctionNounId = Number(onDisplayAuction?.nounId);

  // Page through Niji via a keyboard
  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: { key: string }) => {
      if (event.key === 'ArrowLeft') {
        // This is a hack.
        // If we don't put this, the first keystore
        // from the noun at / doesn't work (i.e.,
        // to go from current noun to current noun - 1 would take two arrow presses)
        if (onDisplayAuctionNounId === lastAuctionNounId) {
          navigate(`/niji/${lastAuctionNounId}`);
        }

        if (!isFirstAuction) {
          onPrevAuctionClick();
        }
      }
      if (event.key === 'ArrowRight') {
        if (!isLastAuction) {
          onNextAuctionClick();
        }
      }
    },
    [
      isFirstAuction,
      isLastAuction,
      lastAuctionNounId,
      navigate,
      onDisplayAuctionNounId,
      onNextAuctionClick,
      onPrevAuctionClick,
    ],
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
    <div className="absolute">
      <button
        onClick={() => onPrevAuctionClick()}
        className={`${ARROW_BASE_CLASS} ${isCool ? ARROW_COOL_CLASS : ARROW_WARM_CLASS}`}
        disabled={isFirstAuction}
      >
        ←
      </button>
      <button
        onClick={() => onNextAuctionClick()}
        className={`${ARROW_BASE_CLASS} ${RIGHT_MARGIN_CLASS} ${
          isCool ? ARROW_COOL_CLASS : ARROW_WARM_CLASS
        }`}
        disabled={isLastAuction}
      >
        →
      </button>
    </div>
  );
};
export default AuctionNavigation;
