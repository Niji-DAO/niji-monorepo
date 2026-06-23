import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/DelegateHoverCard', () => ({
  default: () => <span data-testid="delegate-hover" />,
}));

vi.mock('@/components/GrayCircle', () => ({
  GrayCircle: () => <span data-testid="gray" />,
}));

vi.mock('@/components/HoverCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="hover">{children}</span>
  ),
}));

vi.mock('@/components/TightStackedCircleNijis', () => ({
  default: ({ nounIds }: { nounIds: number[] }) => (
    <span data-testid="stacked">stack-{nounIds.length}</span>
  ),
}));

vi.mock('@/components/VoteCardPager', () => ({
  default: ({
    onLeftArrowClick,
    onRightArrowClick,
    isLeftArrowDisabled,
    isRightArrowDisabled,
    numPages,
    currentPage,
  }: {
    onLeftArrowClick: () => void;
    onRightArrowClick: () => void;
    isLeftArrowDisabled: boolean;
    isRightArrowDisabled: boolean;
    numPages: number;
    currentPage: number;
  }) => (
    <div data-testid="pager">
      <button onClick={onLeftArrowClick} disabled={isLeftArrowDisabled} data-testid="left" />
      <button onClick={onRightArrowClick} disabled={isRightArrowDisabled} data-testid="right" />
      <span data-testid="num-pages">{numPages}</span>
      <span data-testid="current-page">{currentPage}</span>
    </div>
  ),
}));

vi.mock('@/utils/pseudoRandomPredictableShuffle', () => ({
  pseudoRandomPredictableShuffle: <T,>(arr: T[] | undefined) => arr ?? [],
}));

import DelegateGroupedNijiImageVoteTable from './index';

const makeVote = (delegate: string, nounIds: string[], support: 0 | 1 | 2 = 1) => ({
  delegate,
  supportDetailed: support,
  nijiRepresented: nounIds,
});

const baseProps = {
  propId: 1,
  proposalCreationBlock: 100n,
};

describe('DelegateGroupedNijiImageVoteTable', () => {
  it('renders 3x4 = 12 cells per page', () => {
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('td').length).toBe(12);
  });

  it('renders gray circles when no delegates (all 12 cells are gray)', () => {
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="gray"]').length).toBe(12);
  });

  it('renders delegate hover cards for each vote', () => {
    const data = [
      makeVote('0xA', ['1', '2']),
      makeVote('0xB', ['3']),
      makeVote('0xC', ['4', '5', '6']),
    ];
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(3);
    expect(container.querySelectorAll('[data-testid="stacked"]').length).toBe(3);
  });

  it('left arrow disabled at page=0 + right arrow control via numPages', () => {
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelector('[data-testid="left"]')?.disabled).toBe(true);
  });

  it('passes numPages = floor(N / 12) + 1', () => {
    const data = Array.from({ length: 5 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('1');
  });

  it('right arrow click advances page (via setPage)', () => {
    const data = Array.from({ length: 15 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('1');
  });
});
