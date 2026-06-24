import type { Auction } from '@/wrappers/nijiAuction';

import { screen } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AuctionTimer from './index';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    _: (msg: string) => msg,
    date: (date: Date | number, _opts?: unknown) => new Date(date as number).toISOString(),
  },
}));

vi.mock('jotai/react', () => ({
  useAtomValue: () => true, // isCool=true
}));

describe('AuctionTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockAuction = (endTimeOffset = 3600): Auction => ({
    nounId: 1n,
    amount: 1000000000000000000n,
    startTime: BigInt(dayjs().unix() - 3600),
    endTime: BigInt(dayjs().unix() + endTimeOffset),
    bidder: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    settled: false,
  });

  it('renders auction timer with time remaining (auctionEnded=false)', () => {
    render(<AuctionTimer auction={mockAuction(3600)} auctionEnded={false} />);
    expect(screen.getByText(/Auction ends in|Time left/)).toBeInTheDocument();
  });

  it('renders auction ended message when auctionEnded=true', () => {
    render(<AuctionTimer auction={mockAuction(0)} auctionEnded={true} />);
    expect(screen.getAllByText('Auction ended').length).toBeGreaterThan(0);
  });

  it('toggles timer display on click', () => {
    render(<AuctionTimer auction={mockAuction(3600)} auctionEnded={false} />);
    const initialLabel = screen.getByText(/Auction ends in|Time left/);
    const wrapper = initialLabel.closest('.row');
    expect(wrapper).toBeDefined();
    if (wrapper) {
      fireEvent.click(wrapper);
      // After toggle, "Ends on" label appears (auctionEnded=false case)
      expect(screen.getByText(/Ends on|Auction ended/)).toBeInTheDocument();
    }
  });

  it('returns null when auction is not provided', () => {
    const { container } = render(
      <AuctionTimer auction={undefined as unknown as Auction} auctionEnded={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles auction with timeLeft=0 gracefully', () => {
    render(<AuctionTimer auction={mockAuction(0)} auctionEnded={true} />);
    // Should render "Auction ended" text without error
    expect(screen.getAllByText('Auction ended').length).toBeGreaterThan(0);
  });

  it('renders for settled=true auction', () => {
    const settled = { ...mockAuction(0), settled: true };
    expect(() => render(<AuctionTimer auction={settled} auctionEnded={true} />)).not.toThrow();
  });

  it('handles large nounId (10000n)', () => {
    const large = { ...mockAuction(3600), nounId: 10000n };
    expect(() => render(<AuctionTimer auction={large} auctionEnded={false} />)).not.toThrow();
  });

  it('handles auction 1 second to end', () => {
    render(<AuctionTimer auction={mockAuction(1)} auctionEnded={false} />);
    expect(screen.getByText(/Auction ends in|Time left/)).toBeInTheDocument();
  });

  it('handles zero-bidder auction (no bid yet)', () => {
    const zeroBidder = {
      ...mockAuction(3600),
      bidder: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    };
    expect(() => render(<AuctionTimer auction={zeroBidder} auctionEnded={false} />)).not.toThrow();
  });

  it('handles 0n amount auction', () => {
    const zeroAmt = { ...mockAuction(3600), amount: 0n };
    expect(() => render(<AuctionTimer auction={zeroAmt} auctionEnded={false} />)).not.toThrow();
  });

  it('handles very long endTime (year 2100)', () => {
    const future = {
      ...mockAuction(3600),
      endTime: 4_102_444_800n,
    };
    expect(() => render(<AuctionTimer auction={future} auctionEnded={false} />)).not.toThrow();
  });

  it('renders click handler triggers re-render', () => {
    const { container } = render(<AuctionTimer auction={mockAuction(3600)} auctionEnded={false} />);
    const wrapper = container.querySelector('.row');
    if (wrapper) {
      fireEvent.click(wrapper);
      fireEvent.click(wrapper);
    }
    expect(container.querySelector('.row')).not.toBeNull();
  });

  it('startTime in distant past does not crash', () => {
    const distantPast = {
      ...mockAuction(3600),
      startTime: 0n,
    };
    expect(() => render(<AuctionTimer auction={distantPast} auctionEnded={false} />)).not.toThrow();
  });

  it('handles auction with negative remaining time (auctionEnded=true)', () => {
    const ended = {
      ...mockAuction(-3600),
    };
    expect(() => render(<AuctionTimer auction={ended} auctionEnded={true} />)).not.toThrow();
  });

  it('renders without crash for boundary endTime exactly = now', () => {
    const now = {
      ...mockAuction(0),
      endTime: BigInt(dayjs().unix()),
    };
    expect(() => render(<AuctionTimer auction={now} auctionEnded={false} />)).not.toThrow();
  });

  it('multiple click toggles do not crash', () => {
    const { container } = render(<AuctionTimer auction={mockAuction(3600)} auctionEnded={false} />);
    const wrapper = container.querySelector('.row');
    if (wrapper) {
      for (let i = 0; i < 5; i++) fireEvent.click(wrapper);
    }
    expect(container.querySelector('.row')).not.toBeNull();
  });

  it('handles ended=true with large endTime past does not crash', () => {
    const past = { ...mockAuction(-100000), endTime: 100n };
    expect(() => render(<AuctionTimer auction={past} auctionEnded={true} />)).not.toThrow();
  });

  it('renders 1 row element in DOM', () => {
    const { container } = render(<AuctionTimer auction={mockAuction(3600)} auctionEnded={false} />);
    expect(container.querySelectorAll('.row').length).toBeGreaterThanOrEqual(1);
  });

  it('non-Auction (undefined) returns null container', () => {
    const { container } = render(
      <AuctionTimer auction={undefined as unknown as Auction} auctionEnded={true} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders with 30-min remaining (1800s) without crash', () => {
    expect(() =>
      render(<AuctionTimer auction={mockAuction(1800)} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders with 1-second remaining without crash', () => {
    expect(() =>
      render(<AuctionTimer auction={mockAuction(1)} auctionEnded={false} />),
    ).not.toThrow();
  });
});
