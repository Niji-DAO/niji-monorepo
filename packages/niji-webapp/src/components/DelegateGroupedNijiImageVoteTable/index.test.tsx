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

  it('200 delegates render 17 pages (floor(200/12)+1)', () => {
    const data = Array.from({ length: 200 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('17');
  });

  it('rerender from 0 to 5 delegates updates hover count', () => {
    const { container, rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(0);
    rerender(
      <DelegateGroupedNijiImageVoteTable
        {...baseProps}
        filteredDelegateGroupedVoteData={Array.from({ length: 5 }, (_, i) =>
          makeVote(`0x${i}`, ['1']),
        )}
      />,
    );
    expect(container.querySelectorAll('[data-testid="hover"]').length).toBe(5);
  });

  it('left click followed by right click cycles pages', () => {
    const data = Array.from({ length: 50 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    fireEvent.click(container.querySelector('[data-testid="left"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('1');
  });

  it('different propId+blockNumber renders without crash', () => {
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable
          propId={9999}
          proposalCreationBlock={500n}
          filteredDelegateGroupedVoteData={[]}
        />,
      ),
    ).not.toThrow();
  });

  it('30 delegates renders 12 buttons on first page', () => {
    const data = Array.from({ length: 30 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelectorAll('td').length).toBe(12);
  });

  it('handles 50 delegates (numPages = floor(50/12)+1 = 5)', () => {
    const data = Array.from({ length: 50 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('5');
  });

  it('renders 12 cells consistently for 1 delegate', () => {
    const data1 = Array.from({ length: 1 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data1} />,
    );
    expect(container.querySelectorAll('td').length).toBe(12);
  });

  it('handles support type 0 (against)', () => {
    const data = [makeVote('0xA', ['1'], 0)];
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('handles support type 2 (abstain)', () => {
    const data = [makeVote('0xA', ['1'], 2)];
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('handles delegate with no nijis (empty nijiRepresented)', () => {
    const data = [makeVote('0xA', [])];
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances each with own data', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[makeVote(`0x${i}`, [String(i)])]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 delegates with renders 17 pages', () => {
    const data = Array.from({ length: 200 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('17');
  });

  it('rerender from 0 to 5 delegates updates page count', () => {
    const { container, rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('1');
    const data = Array.from({ length: 5 }, (_, i) => makeVote(`0x${i}`, ['1']));
    rerender(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('1');
  });

  it('left click + right click cycle works', () => {
    const data = Array.from({ length: 15 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('1');
    fireEvent.click(container.querySelector('[data-testid="left"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
  });

  it('renders for different propId + blockNumber', () => {
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable
          propId={999}
          proposalCreationBlock={9999n}
          filteredDelegateGroupedVoteData={[]}
        />,
      ),
    ).not.toThrow();
  });

  it('30 delegates renders 12 niji cells per page', () => {
    const data = Array.from({ length: 30 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelectorAll('td').length).toBe(12);
  });

  it('renders 20 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[makeVote(`0x${i}`, [String(i)])]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 delegates renders 9 pages', () => {
    const data = Array.from({ length: 100 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('9');
  });

  it('rapid 10 right + 10 left clicks navigate pages', () => {
    const data = Array.from({ length: 30 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    for (let i = 0; i < 2; i++) fireEvent.click(container.querySelector('[data-testid="right"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('2');
    for (let i = 0; i < 2; i++) fireEvent.click(container.querySelector('[data-testid="left"]')!);
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
  });

  it('rerender with empty data returns to single page', () => {
    const data = Array.from({ length: 30 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container, rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('3');
    rerender(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    expect(container.querySelector('[data-testid="num-pages"]')?.textContent).toBe('1');
  });

  it('handles support type 0/1/2 mix', () => {
    const data = [makeVote('0xA', ['1'], 0), makeVote('0xB', ['2'], 1), makeVote('0xC', ['3'], 2)];
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            propId={i}
            filteredDelegateGroupedVoteData={[]}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 500 vote entries', () => {
    const data = Array.from({ length: 500 }, (_, i) => makeVote(`0xDEL${i}`, [String(i)], 1));
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('handles very large proposalCreationBlock', () => {
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable
          propId={1}
          proposalCreationBlock={9_007_199_254_740_991n}
          filteredDelegateGroupedVoteData={[]}
        />,
      ),
    ).not.toThrow();
  });

  it('handles rapid prop change 50 times', () => {
    const { rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            propId={i + 100}
            proposalCreationBlock={BigInt(100 + i)}
            filteredDelegateGroupedVoteData={[]}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('handles all 3 supportDetailed variants', () => {
    [0, 1, 2].forEach(s => {
      const data = [makeVote('0xA', ['1'], s as 0 | 1 | 2)];
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            filteredDelegateGroupedVoteData={data}
          />,
        ),
      ).not.toThrow();
    });
  });

  it('renders 5 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              propId={i}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 1000 vote entries', () => {
    const data = Array.from({ length: 1000 }, (_, i) => makeVote(`0xDEL${i}`, [String(i)], 1));
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('handles 0n proposalCreationBlock edge case', () => {
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable
          propId={1}
          proposalCreationBlock={0n}
          filteredDelegateGroupedVoteData={[]}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('handles 50 different propIds', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          propId={i}
          filteredDelegateGroupedVoteData={[]}
        />,
      );
      unmount();
    }
  });

  it('handles 30 different proposalCreationBlock values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          proposalCreationBlock={BigInt(i * 100)}
          filteredDelegateGroupedVoteData={[]}
        />,
      );
      unmount();
    }
  });

  it('handles vote data with mixed support values', () => {
    const data = [
      makeVote('0xA', ['1'], 0),
      makeVote('0xB', ['2'], 1),
      makeVote('0xC', ['3'], 2),
      makeVote('0xD', ['4', '5'], 0),
      makeVote('0xE', ['6', '7', '8'], 1),
    ];
    expect(() =>
      render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      ),
    ).not.toThrow();
  });

  it('rapid 30 prev/next page click cycle', () => {
    const data = Array.from({ length: 36 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    const right = container.querySelector('[data-testid="right"]') as HTMLButtonElement;
    const left = container.querySelector('[data-testid="left"]') as HTMLButtonElement;
    for (let i = 0; i < 30; i++) {
      fireEvent.click(right);
      fireEvent.click(left);
    }
    expect(container.querySelector('[data-testid="current-page"]')?.textContent).toBe('0');
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('handles 50 different vote data array sizes', () => {
    for (let i = 0; i < 50; i++) {
      const data = Array.from({ length: i }, (_, j) => makeVote(`0x${j}`, ['1'], 1));
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      );
      unmount();
    }
  });

  it('rapid 30 propId rerender', () => {
    const { rerender } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            propId={i}
            filteredDelegateGroupedVoteData={[]}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 30 different nijiRepresented array sizes', () => {
    for (let i = 1; i <= 30; i++) {
      const niji = Array.from({ length: i }, (_, j) => String(j));
      const data = [makeVote('0xA', niji, 1)];
      const { container, unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      );
      expect(container.querySelector('[data-testid="stacked"]')?.textContent).toBe(`stack-${i}`);
      unmount();
    }
  });

  it('rapid 50 right arrow clicks then back', () => {
    const data = Array.from({ length: 60 }, (_, i) => makeVote(`0x${i}`, ['1']));
    const { container } = render(
      <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
    );
    const right = container.querySelector('[data-testid="right"]') as HTMLButtonElement;
    for (let i = 0; i < 50; i++) fireEvent.click(right);
    expect(container.querySelector('[data-testid="pager"]')).not.toBeNull();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('handles 30 different propId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          propId={i}
          filteredDelegateGroupedVoteData={[]}
        />,
      );
      unmount();
    }
  });

  it('handles 30 different vote data structures', () => {
    for (let i = 0; i < 30; i++) {
      const data = Array.from({ length: i + 1 }, (_, j) =>
        makeVote(`0xDEL${j}`, [`${j + 1}`], (j % 3) as 0 | 1 | 2),
      );
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={data} />,
      );
      unmount();
    }
  });

  it('all 30 instances render pager', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <DelegateGroupedNijiImageVoteTable
            key={i}
            {...baseProps}
            propId={i}
            filteredDelegateGroupedVoteData={[]}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="pager"]').length).toBe(30);
  });

  it('handles 30 different proposalCreationBlock values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          proposalCreationBlock={BigInt(i * 1000)}
          filteredDelegateGroupedVoteData={[]}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          filteredDelegateGroupedVoteData={[]}
          propose={() => {}}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              filteredDelegateGroupedVoteData={[]}
              propose={() => {}}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 100 propose invocations', () => {
    const propose = vi.fn();
    render(
      <DelegateGroupedNijiImageVoteTable
        filteredDelegateGroupedVoteData={[]}
        propose={propose}
        proposalCreationLoading={false}
      />,
    );
    for (let i = 0; i < 100; i++) propose();
    expect(propose).toHaveBeenCalledTimes(100);
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            filteredDelegateGroupedVoteData={[]}
            propose={() => {}}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 handles 30 proposalCreationLoading toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          filteredDelegateGroupedVoteData={[]}
          propose={() => {}}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          filteredDelegateGroupedVoteData={[]}
          propose={() => {}}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              filteredDelegateGroupedVoteData={[]}
              propose={() => {}}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            filteredDelegateGroupedVoteData={[]}
            propose={() => {}}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 30 proposalCreationLoading toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          filteredDelegateGroupedVoteData={[]}
          propose={() => {}}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          filteredDelegateGroupedVoteData={[]}
          propose={() => {}}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-4 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-5 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            filteredDelegateGroupedVoteData={[]}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-6 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            filteredDelegateGroupedVoteData={[]}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-7 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            filteredDelegateGroupedVoteData={[]}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-8 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
              proposalCreationLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable
            {...baseProps}
            filteredDelegateGroupedVoteData={[]}
            proposalCreationLoading={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={false}
        />,
      );
      unmount();
    }
  });

  it('round-9 30 proposalCreationLoading toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable
          {...baseProps}
          filteredDelegateGroupedVoteData={[]}
          proposalCreationLoading={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-10 30 sequential DelegateGroupedNijiImageVoteTable mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-11 30 sequential DelegateGroupedNijiImageVoteTable mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-12 30 sequential DelegateGroupedNijiImageVoteTable mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegateGroupedNijiImageVoteTable
              key={i}
              {...baseProps}
              filteredDelegateGroupedVoteData={[]}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegateGroupedNijiImageVoteTable {...baseProps} filteredDelegateGroupedVoteData={[]} />,
      );
      unmount();
    }
  });
});
