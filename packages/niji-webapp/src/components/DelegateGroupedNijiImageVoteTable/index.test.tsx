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

  it('renders 1 delegate hover for single delegate single niji data', () => {
    const data = [makeVote('0xA', ['1'])];
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="stacked"]').length).toBe(1);
  });

  it('handles 24 delegates (numPages = floor(24/12)+1 = 3)', () => {
    const data = Array.from({ length: 24 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    // 既存 contract: floor(N / 12) + 1 → 24/12=2, +1=3
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('3');
  });

  it('starts at currentPage=0 (default)', () => {
    const data = [makeVote('0xA', ['1'])];
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
  });

  it('left arrow becomes enabled after advancing to page 1', () => {
    const data = Array.from({ length: 15 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="left"]')?.disabled).toBe(false);
  });

  it('renders exactly 1 VoteCardPager instance', () => {
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="pager"]').length).toBe(1);
  });

  it('right arrow does not advance past last page', () => {
    const data = Array.from({ length: 5 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    // numPages = 1, right arrow disabled (only 1 page)
    expect(container.querySelector('[data-testid="right"]')?.disabled).toBe(true);
  });

  it('renders multi-page setup with 30 delegates (numPages = floor(30/12)+1 = 3)', () => {
    const data = Array.from({ length: 30 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('3');
  });

  it('left arrow stays disabled at page=0 when right click is not used', () => {
    const data = Array.from({ length: 24 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="left"]')?.disabled).toBe(true);
  });

  it('left arrow click returns from page 1 back to page 0', () => {
    const data = Array.from({ length: 15 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('1');
    fireEvent.click(container.querySelector('[data-testid="left"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
  });

  it('respects propId passed in baseProps (no crash for propId=999)', () => {
    const data = [makeVote('0xA', ['1'])];
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable
        propId={999}
        proposalCreationBlock={100n}
        filteredDelegateGroupedVoteData={data}
      />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(1);
  });

  it('empty data renders 12 gray cells exactly', () => {
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="gray"]').length).toBe(12);
  });

  it('numPages = floor(N/12) + 1 for N=11 returns 1', () => {
    const data = Array.from({ length: 11 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('1');
  });

  it('numPages = floor(N/12) + 1 for N=12 returns 2', () => {
    const data = Array.from({ length: 12 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('2');
  });

  it('right arrow on multi-page advances and disables at last page', () => {
    const data = Array.from({ length: 13 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="right"]')?.disabled).toBe(true);
  });

  it('large dataset (100 delegates) renders 9 pages', () => {
    const data = Array.from({ length: 100 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    // floor(100/12)+1 = 8+1 = 9
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('9');
  });

  it('rerender data updates count of hover cards', () => {
    const { container, rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(0);
    rerender(
      <DelegateGroupedNijiImageVoteTable
        {...baseProps}
        filteredDelegateGroupedVoteData={[makeVote('0xA', ['1']), makeVote('0xB', ['2'])]}
      />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(2);
  });

  it('multiple right clicks advance through pages correctly', () => {
    const data = Array.from({ length: 25 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('2');
  });
});
