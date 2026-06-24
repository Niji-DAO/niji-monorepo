import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/BidHistoryModalRow', () => ({
  default: ({ bid }: { bid: { transactionHash: string } }) => (
    <li data-testid="row">{bid.transactionHash}</li>
  ),
}));

vi.mock('@/components/Niji', () => ({
  NijiRoundedCorners: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-rounded">{nounId.toString()}</span>
  ),
}));

const useAuctionBidsMock = vi.fn();
vi.mock('@/wrappers/onDisplayAuction', () => ({
  useAuctionBids: () => useAuctionBidsMock(),
}));

import BidHistoryModal, { Backdrop } from './index';

import type { Auction } from '@/wrappers/nijiAuction';

const auction: Auction = {
  amount: 1000n,
  bidder: '0xAA',
  endTime: 100n,
  startTime: 0n,
  nounId: 42n,
  settled: false,
};

beforeEach(() => {
  document.body.innerHTML = '<div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Backdrop', () => {
  it('renders div + fires onDismiss', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    fireEvent.click(container.querySelector('div')!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('BidHistoryModal', () => {
  it('portals backdrop into backdrop-root', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
  });

  it('renders NijiRoundedCorners with auction nounId', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="niji-rounded"]')
        ?.textContent,
    ).toBe('42');
  });

  it('shows null-state text when no bids', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('Bids will appear here');
  });

  it('renders bid rows when bids present', () => {
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0x1' }, { transactionHash: '0x2' }]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(2);
  });

  it('close button fires onDismiss', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('backdrop click fires onDismiss', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) fireEvent.click(backdrop);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('close button fires onDismiss on repeated clicks', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('renders 10 bid rows when 10 bids present', () => {
    const bids = Array.from({ length: 10 }, (_, i) => ({ transactionHash: `0x${i}` }));
    useAuctionBidsMock.mockReturnValue(bids);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(10);
  });

  it('renders exactly 1 NijiRoundedCorners (single instance contract)', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="niji-rounded"]')
        .length,
    ).toBe(1);
  });

  it('null-state text omitted when bids exist', () => {
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0x1' }]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).not.toContain(
      'Bids will appear here',
    );
  });

  it('renders for large nounId auction', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const largeAuction = { ...auction, nounId: 999999n };
    render(<BidHistoryModal auction={largeAuction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="niji-rounded"]')
        ?.textContent,
    ).toBe('999999');
  });
});
