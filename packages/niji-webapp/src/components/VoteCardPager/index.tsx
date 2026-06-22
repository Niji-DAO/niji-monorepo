import React from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

interface VoteCardPagerProps {
  onRightArrowClick: () => void;
  onLeftArrowClick: () => void;
  isRightArrowDisabled: boolean;
  isLeftArrowDisabled: boolean;
  numPages: number;
  currentPage: number;
}

const VoteCardPager: React.FC<VoteCardPagerProps> = props => {
  const {
    onRightArrowClick,
    onLeftArrowClick,
    isRightArrowDisabled,
    isLeftArrowDisabled,
    numPages,
    currentPage,
  } = props;

  const isOnePage = numPages === 1;
  const PAGE_DOTS_CLASS =
    'text-center text-2xl font-bold text-[color:var(--brand-gray-light-text)]';
  const PAGINATION_ARROW_BTN_CLASS = 'border-none bg-transparent disabled:opacity-50';
  const PAGINATION_ARROW_CLASS = 'h-7 w-7 text-[color:var(--brand-gray-light-text)]';

  return (
    <>
      {/* Dots */}
      <div className={clsx(PAGE_DOTS_CLASS, isOnePage ? 'opacity-25' : '')}>
        {Array.from(Array(numPages).keys()).map((n: number) => {
          return (
            <span className={n === currentPage ? '' : 'opacity-50'} key={n}>
              •
            </span>
          );
        })}
      </div>
      {/* Arrows */}
      <div className={clsx('flex justify-center', isOnePage ? 'opacity-25' : '')}>
        <button
          className={PAGINATION_ARROW_BTN_CLASS}
          disabled={isLeftArrowDisabled || isOnePage}
          onClick={onLeftArrowClick}
        >
          <ChevronLeftIcon className={PAGINATION_ARROW_CLASS} />
        </button>

        <button
          disabled={isRightArrowDisabled || isOnePage}
          onClick={onRightArrowClick}
          className={PAGINATION_ARROW_BTN_CLASS}
        >
          <ChevronRightIcon className={PAGINATION_ARROW_CLASS} />
        </button>
      </div>
    </>
  );
};

export default VoteCardPager;
