import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

vi.mock('@niji/sdk/react', () => ({
  nijiAuctionHouseAddress: { 1: '0xAUCTIONHOUSE' },
}));

vi.mock('@/components/AuctionActivityDateHeadline', () => ({
  default: () => <span data-testid="date-headline" />,
}));

vi.mock('@/components/AuctionActivityNijiTitle', () => ({
  default: () => <span data-testid="niji-title" />,
}));

vi.mock('@/components/AuctionActivityWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wrapper">{children}</div>
  ),
}));

vi.mock('@/components/AuctionNavigation', () => ({
  default: () => <div data-testid="auction-nav" />,
}));

vi.mock('@/components/AuctionTimer', () => ({
  default: () => <div data-testid="auction-timer" />,
}));

vi.mock('@/components/AuctionTitleAndNavWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="title-wrap">{children}</div>
  ),
}));

vi.mock('@/components/Bid', () => ({
  default: () => <div data-testid="bid" />,
}));

vi.mock('@/components/BidHistory', () => ({
  default: () => <div data-testid="bid-history" />,
}));

vi.mock('@/components/BidHistoryBtn', () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="bid-history-btn" onClick={onClick} />
  ),
}));

vi.mock('@/components/BidHistoryModal', () => ({
  default: () => <div data-testid="bid-history-modal" />,
}));

vi.mock('@/components/CurrentBid', () => ({
  default: () => <span data-testid="current-bid" />,
}));

vi.mock('@/components/Holder', () => ({
  default: () => <span data-testid="holder" />,
}));

vi.mock('@/components/NijiInfoCard', () => ({
  default: () => <div data-testid="niji-info-card" />,
}));

vi.mock('@/components/Winner', () => ({
  default: () => <span data-testid="winner" />,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

import AuctionActivity from './index';

const makeAuction = (overrides: Partial<Record<string, unknown>> = {}) => ({
  amount: 1000n,
  bidder: '0xAA',
  endTime: Math.floor(Date.now() / 1000) + 3600,
  startTime: 0n,
  nounId: 5n,
  settled: false,
  ...overrides,
});

const defaults = {
  isFirstAuction: false,
  isLastAuction: true,
  onPrevAuctionClick: () => {},
  onNextAuctionClick: () => {},
  displayGraphDepComps: true,
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AuctionActivity', () => {
  it('renders AuctionActivityWrapper with title and current bid', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="wrapper"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="current-bid"]')).not.toBeNull();
  });

  it('hides AuctionNavigation when displayGraphDepComps is false', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity
        {...defaults}
        displayGraphDepComps={false}
        auction={makeAuction() as never}
      />,
    );
    expect(container.querySelector('[data-testid="auction-nav"]')).toBeNull();
  });

  it('shows AuctionNavigation when displayGraphDepComps is true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="auction-nav"]')).not.toBeNull();
  });

  it('shows "Help mint the next Niji" link when auction ended', () => {
    useAtomValueMock.mockReturnValue(true);
    const endedAuction = makeAuction({ endTime: 1n });
    const { container } = wrap(<AuctionActivity {...defaults} auction={endedAuction as never} />);
    expect(container.querySelector('a[href="/crystal-ball"]')).not.toBeNull();
  });

  it('renders Bid for isLastAuction', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="bid"]')).not.toBeNull();
  });

  it('renders NijiInfoCard for non-last auction (no Bid)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={false} auction={makeAuction() as never} />,
    );
    expect(container.querySelector('[data-testid="niji-info-card"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bid"]')).toBeNull();
  });

  it('renders BidHistory for last + displayGraphDepComps', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="bid-history"]')).not.toBeNull();
  });

  it('does not render BidHistoryModal by default', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="bid-history-modal"]')).toBeNull();
  });

  it('hides BidHistoryBtn when last auction amount is 0', () => {
    useAtomValueMock.mockReturnValue(true);
    const zeroAuction = makeAuction({ amount: 0n });
    const { container } = wrap(<AuctionActivity {...defaults} auction={zeroAuction as never} />);
    expect(container.querySelector('[data-testid="bid-history-btn"]')).toBeNull();
  });

  it('renders BidHistoryBtn for non-graph mode in last auction with bids', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity
        {...defaults}
        displayGraphDepComps={false}
        auction={makeAuction() as never}
      />,
    );
    expect(container.querySelector('[data-testid="bid-history-btn"]')).not.toBeNull();
  });

  it('renders Holder for non-last + ended auction (no Winner fallback)', () => {
    useAtomValueMock.mockReturnValue(true);
    const endedAuction = makeAuction({ endTime: 1n });
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={false} auction={endedAuction as never} />,
    );
    expect(container.querySelector('[data-testid="holder"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="winner"]')).toBeNull();
  });

  it('renders Winner for last + ended auction with bidder', () => {
    useAtomValueMock.mockReturnValue(true);
    const endedAuction = makeAuction({ endTime: 1n, bidder: '0xBIDDER' });
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={true} auction={endedAuction as never} />,
    );
    expect(container.querySelector('[data-testid="winner"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="holder"]')).toBeNull();
  });

  it('renders AuctionTimer (last + active auction)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="auction-timer"]')).not.toBeNull();
  });

  it('renders date-headline in all common render paths', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="date-headline"]')).not.toBeNull();
  });

  it('renders title-wrap as child of wrapper', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="title-wrap"]')).not.toBeNull();
    expect(
      container
        .querySelector('[data-testid="wrapper"]')
        ?.querySelector('[data-testid="title-wrap"]'),
    ).not.toBeNull();
  });

  it('isFirstAuction with non-last shows NijiInfoCard', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity
        {...defaults}
        isFirstAuction={true}
        isLastAuction={false}
        auction={makeAuction() as never}
      />,
    );
    expect(container.querySelector('[data-testid="niji-info-card"]')).not.toBeNull();
  });

  it('warm mode (isCool false) still renders wrapper', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelector('[data-testid="wrapper"]')).not.toBeNull();
  });

  it('current-bid renders in all auction states', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={false} auction={makeAuction() as never} />,
    );
    expect(container.querySelector('[data-testid="current-bid"]')).not.toBeNull();
  });

  it('niji-title renders for any auction state', () => {
    useAtomValueMock.mockReturnValue(true);
    const ended = makeAuction({ endTime: 1n });
    const { container } = wrap(<AuctionActivity {...defaults} auction={ended as never} />);
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
  });

  it('Holder renders for non-last + ended exclusive (not Winner)', () => {
    useAtomValueMock.mockReturnValue(true);
    const ended = makeAuction({ endTime: 1n });
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={false} auction={ended as never} />,
    );
    const holder = container.querySelector('[data-testid="holder"]');
    const winner = container.querySelector('[data-testid="winner"]');
    expect(holder).not.toBeNull();
    expect(winner).toBeNull();
  });

  it('non-last + active auction renders niji-info-card (no Bid)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity {...defaults} isLastAuction={false} auction={makeAuction() as never} />,
    );
    expect(container.querySelector('[data-testid="niji-info-card"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bid"]')).toBeNull();
  });

  it('displayGraphDepComps=false hides BidHistory', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(
      <AuctionActivity
        {...defaults}
        displayGraphDepComps={false}
        auction={makeAuction() as never}
      />,
    );
    expect(container.querySelector('[data-testid="bid-history"]')).toBeNull();
  });

  it('wrapper renders exactly 1 time', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    expect(container.querySelectorAll('[data-testid="wrapper"]').length).toBe(1);
  });

  it('rerender from isLastAuction=true to false shows niji-info-card', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = wrap(
      <AuctionActivity {...defaults} auction={makeAuction() as never} />,
    );
    expect(container.querySelector('[data-testid="bid"]')).not.toBeNull();
    rerender(
      <MemoryRouter>
        <AuctionActivity {...defaults} isLastAuction={false} auction={makeAuction() as never} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[data-testid="niji-info-card"]')).not.toBeNull();
  });

  it('current-bid renders for both first + last auction states', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container: c1 } = wrap(
      <AuctionActivity {...defaults} isFirstAuction={true} auction={makeAuction() as never} />,
    );
    const { container: c2 } = wrap(
      <AuctionActivity {...defaults} isLastAuction={true} auction={makeAuction() as never} />,
    );
    expect(c1.querySelector('[data-testid="current-bid"]')).not.toBeNull();
    expect(c2.querySelector('[data-testid="current-bid"]')).not.toBeNull();
  });

  it('large nounId auction renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const huge = makeAuction({ nounId: 999999n });
    expect(() => wrap(<AuctionActivity {...defaults} auction={huge as never} />)).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    expect(() => {
      wrap(
        <>
          <AuctionActivity {...defaults} auction={makeAuction() as never} />
          <AuctionActivity {...defaults} auction={makeAuction() as never} />
          <AuctionActivity {...defaults} auction={makeAuction() as never} />
          <AuctionActivity {...defaults} auction={makeAuction() as never} />
          <AuctionActivity {...defaults} auction={makeAuction() as never} />
        </>,
      );
    }).not.toThrow();
  });

  it('renders without crash with isLastAuction=true', () => {
    expect(() =>
      wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} isLastAuction={true} />),
    ).not.toThrow();
  });

  it('renders without crash with isFirstAuction=true', () => {
    expect(() =>
      wrap(
        <AuctionActivity {...defaults} auction={makeAuction() as never} isFirstAuction={true} />,
      ),
    ).not.toThrow();
  });

  it('rerender does not crash (re-wrap MemoryRouter)', () => {
    expect(() => {
      wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    }).not.toThrow();
  });

  it('renders both first and last simultaneously without crash', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          isFirstAuction={true}
          isLastAuction={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances consecutively without crash', () => {
    for (let i = 0; i < 10; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('renders 3 instances each with own auctions', () => {
    expect(() =>
      wrap(
        <>
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: 1n }) as never} />
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: 2n }) as never} />
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: 3n }) as never} />
        </>,
      ),
    ).not.toThrow();
  });

  it('handles displayGraphDepComps=false in last auction', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          displayGraphDepComps={false}
          auction={makeAuction() as never}
        />,
      ),
    ).not.toThrow();
  });

  it('handles useAtomValueMock=false branch', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
    ).not.toThrow();
    useAtomValueMock.mockReturnValue(true);
  });

  it('renders large nounId auction (1M)', () => {
    expect(() =>
      wrap(<AuctionActivity {...defaults} auction={makeAuction({ nounId: 1000000n }) as never} />),
    ).not.toThrow();
  });

  it('renders AuctionActivity 30 times consecutively', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('renders 10 AuctionActivity instances in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              auction={makeAuction({ nounId: BigInt(i + 1) }) as never}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash with displayGraphDepComps=false + isLastAuction=false', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          displayGraphDepComps={false}
          isLastAuction={false}
          auction={makeAuction() as never}
        />,
      ),
    ).not.toThrow();
  });

  it('renders with 0n nounId auction', () => {
    expect(() =>
      wrap(<AuctionActivity {...defaults} auction={makeAuction({ nounId: 0n }) as never} />),
    ).not.toThrow();
  });

  it('renders without crash for ended + first + last all true', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          isFirstAuction={true}
          isLastAuction={true}
          auction={makeAuction({ endTime: 1n }) as never}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 30 AuctionActivity instances consecutively', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: BigInt(i) }) as never} />,
        ),
      ).not.toThrow();
    }
  });

  it('rerender 30 times preserves wrapper', () => {
    const { container, rerender } = wrap(
      <AuctionActivity {...defaults} auction={makeAuction() as never} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <MemoryRouter>
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: BigInt(i) }) as never} />
        </MemoryRouter>,
      );
      expect(container.querySelector('[data-testid="wrapper"]')).not.toBeNull();
    }
  });

  it('handles isLastAuction=false in non-graph mode', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          isLastAuction={false}
          displayGraphDepComps={false}
          auction={makeAuction() as never}
        />,
      ),
    ).not.toThrow();
  });

  it('renders for ended + isLastAuction + 1 wei amount', () => {
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          isLastAuction={true}
          auction={makeAuction({ endTime: 1n, amount: 1n }) as never}
        />,
      ),
    ).not.toThrow();
  });

  it('renders for 50 different auction nounIds', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders 20 instances without crash', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves wrapper', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container, rerender } = wrap(
      <AuctionActivity {...defaults} auction={makeAuction() as never} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <MemoryRouter>
          <AuctionActivity {...defaults} auction={makeAuction({ nounId: BigInt(i) }) as never} />
        </MemoryRouter>,
      );
    }
    expect(container.querySelector('[data-testid="wrapper"]')).not.toBeNull();
  });

  it('handles isFirstAuction=true variant', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <AuctionActivity {...defaults} isFirstAuction={true} auction={makeAuction() as never} />,
      ),
    ).not.toThrow();
  });

  it('handles displayGraphDepComps=false variant', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <AuctionActivity
          {...defaults}
          displayGraphDepComps={false}
          auction={makeAuction() as never}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 1e9 nounId large bigint', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <AuctionActivity {...defaults} auction={makeAuction({ nounId: 1000000000n }) as never} />,
      ),
    ).not.toThrow();
  });

  it('handles isLastAuction=false variant', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <AuctionActivity {...defaults} isLastAuction={false} auction={makeAuction() as never} />,
      ),
    ).not.toThrow();
  });

  it('rapid useAtomValue toggle 30 times', () => {
    const { rerender } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      expect(() =>
        rerender(
          <MemoryRouter>
            <AuctionActivity {...defaults} auction={makeAuction() as never} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles 0n nounId edge case', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(<AuctionActivity {...defaults} auction={makeAuction({ nounId: 0n }) as never} />),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('handles all 4 boolean combinations', () => {
    useAtomValueMock.mockReturnValue(false);
    [true, false].forEach(isFirst => {
      [true, false].forEach(isLast => {
        expect(() =>
          wrap(
            <AuctionActivity
              {...defaults}
              isFirstAuction={isFirst}
              isLastAuction={isLast}
              auction={makeAuction() as never}
            />,
          ),
        ).not.toThrow();
      });
    });
  });

  it('handles 30 different bidder addresses', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ bidder: `0xBIDDER${i}` });
      expect(() => wrap(<AuctionActivity {...defaults} auction={a as never} />)).not.toThrow();
    }
  });

  it('handles ended auction (endTime=1n)', () => {
    useAtomValueMock.mockReturnValue(false);
    const ended = makeAuction({ endTime: 1n });
    expect(() => wrap(<AuctionActivity {...defaults} auction={ended as never} />)).not.toThrow();
  });

  it('handles 50 different amount values', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 50; i++) {
      const a = makeAuction({ amount: BigInt(i * 1000) });
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('handles displayGraphDepComps toggle 30 times', () => {
    useAtomValueMock.mockReturnValue(false);
    const { rerender } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <AuctionActivity
              {...defaults}
              displayGraphDepComps={i % 2 === 0}
              auction={makeAuction() as never}
            />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles ended auction with isLastAuction=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const ended = makeAuction({ endTime: 1n });
    expect(() =>
      wrap(<AuctionActivity {...defaults} isLastAuction={false} auction={ended as never} />),
    ).not.toThrow();
  });

  it('handles 30 different startTime values', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ startTime: BigInt(1700000000 + i * 3600) });
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('renders 20 instances all isLastAuction=false', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              isLastAuction={false}
              auction={makeAuction() as never}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('handles 30 different displayGraphDepComps + isFirst combinations', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          displayGraphDepComps={i % 2 === 0}
          isFirstAuction={i % 3 === 0}
          auction={makeAuction() as never}
        />,
      );
      unmount();
    }
  });

  it('renders 50 instances all with displayGraphDepComps=true', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              displayGraphDepComps={true}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different auctionEnded (endTime variations)', () => {
    useAtomValueMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ endTime: i < 15 ? 1n : Math.floor(Date.now() / 1000) + 3600 });
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('handles rapid 30 onPrev/onNext click handler rerender', () => {
    useAtomValueMock.mockReturnValue(false);
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const { rerender } = wrap(
      <AuctionActivity
        {...defaults}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={onNext}
        auction={makeAuction() as never}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <AuctionActivity
              {...defaults}
              onPrevAuctionClick={onPrev}
              onNextAuctionClick={onNext}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
            />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <AuctionActivity
            auction={makeAuction() as never}
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
            displayGraphDepComps={false}
          />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different nounId values', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i) };
      const { unmount } = render(
        <MemoryRouter>
          <AuctionActivity
            auction={a as never}
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
            displayGraphDepComps={false}
          />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles all 4 isFirstAuction/isLastAuction combinations 5 times each', () => {
    useAtomValueMock.mockReturnValue(true);
    [
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: true },
      { isFirst: false, isLast: false },
    ].forEach(({ isFirst, isLast }) => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <MemoryRouter>
            <AuctionActivity
              auction={makeAuction() as never}
              isFirstAuction={isFirst}
              isLastAuction={isLast}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
              displayGraphDepComps={false}
            />
          </MemoryRouter>,
        );
        unmount();
      }
    });
  });

  it('handles 30 different displayGraphDepComps combinations', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <AuctionActivity
            auction={makeAuction() as never}
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
            displayGraphDepComps={i % 2 === 0}
          />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('renders 30 instances all in MemoryRouter', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity
              key={i}
              auction={{ ...makeAuction(), nounId: BigInt(i) } as never}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
              displayGraphDepComps={false}
            />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different auction nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i + 100) };
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), amount: BigInt(i + 1) * BigInt(10n ** 18n) };
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-3 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different auction nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i + 100) };
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('round-3 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), amount: BigInt(i + 1) * BigInt(10n ** 18n) };
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={a as never} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-4 30 different displayGraphDepComps cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-5 30 different displayGraphDepComps cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={true}
        />,
      );
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              auction={makeAuction() as never}
              displayGraphDepComps={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(
          <AuctionActivity
            {...defaults}
            auction={makeAuction() as never}
            displayGraphDepComps={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={true}
        />,
      );
      unmount();
    }
  });

  it('round-6 30 displayGraphDepComps toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={false}
        />,
      );
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              auction={makeAuction() as never}
              displayGraphDepComps={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(
          <AuctionActivity
            {...defaults}
            auction={makeAuction() as never}
            displayGraphDepComps={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={false}
        />,
      );
      unmount();
    }
  });

  it('round-7 30 displayGraphDepComps toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={false}
        />,
      );
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity
              key={i}
              {...defaults}
              auction={makeAuction() as never}
              displayGraphDepComps={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(
          <AuctionActivity
            {...defaults}
            auction={makeAuction() as never}
            displayGraphDepComps={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={false}
        />,
      );
      unmount();
    }
  });

  it('round-8 30 displayGraphDepComps toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AuctionActivity key={i} {...defaults} auction={makeAuction() as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />),
      ).not.toThrow();
    }
  });

  it('round-9 30 different displayGraphDepComps values second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <AuctionActivity
          {...defaults}
          auction={makeAuction() as never}
          displayGraphDepComps={i % 2 === 1}
        />,
      );
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<AuctionActivity {...defaults} auction={makeAuction() as never} />);
      unmount();
    }
  });
});
