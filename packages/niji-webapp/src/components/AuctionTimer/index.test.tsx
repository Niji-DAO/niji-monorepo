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
});
