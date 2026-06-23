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
});
