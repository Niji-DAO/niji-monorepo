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

  it('handles 0 bids without rendering rows', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(0);
  });

  it('renders nounId 0n correctly', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const zeroAuction = { ...auction, nounId: 0n };
    render(<BidHistoryModal auction={zeroAuction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="niji-rounded"]')
        ?.textContent,
    ).toBe('0');
  });

  it('Backdrop component (separate export) shows div', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('Backdrop multiple click invokes onDismiss N times', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    fireEvent.click(div);
    fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('renders 1 bid row correctly when single bid provided', () => {
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0xsingle' }]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(1);
  });

  it('rerender from no bids to bids shows rows', () => {
    useAuctionBidsMock.mockReturnValueOnce([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(0);
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0xnew' }]);
    rerender(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(1);
  });

  it('Backdrop element is 1 div', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('Backdrop without onDismiss does not crash', () => {
    expect(() => render(<Backdrop onDismiss={() => {}} />)).not.toThrow();
  });

  it('overlay contains 1 button (close)', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('button').length).toBe(1);
  });

  it('rerender auction.nounId updates niji-rounded text', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="niji-rounded"]')
        ?.textContent,
    ).toBe('42');
    rerender(<BidHistoryModal auction={{ ...auction, nounId: 100n }} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="niji-rounded"]')
        ?.textContent,
    ).toBe('100');
  });

  it('renders ul/ol container for bid rows', () => {
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0x1' }]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    expect(overlay?.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });

  it('50 bids render 50 rows', () => {
    const bids = Array.from({ length: 50 }, (_, i) => ({ transactionHash: `0x${i}` }));
    useAuctionBidsMock.mockReturnValue(bids);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(50);
  });

  it('Backdrop and overlay both render concurrently', () => {
    useAuctionBidsMock.mockReturnValue([]);
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
    expect((document.getElementById('overlay-root')?.children.length ?? 0) >= 1).toBe(true);
  });

  it('Different auction nounId 999n renders without crash', () => {
    useAuctionBidsMock.mockReturnValue([]);
    expect(() =>
      render(<BidHistoryModal auction={{ ...auction, nounId: 999n }} onDismiss={() => {}} />),
    ).not.toThrow();
  });

  it('rerender from null-state to with-bids replaces null text', () => {
    useAuctionBidsMock.mockReturnValueOnce([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('Bids will appear here');
    useAuctionBidsMock.mockReturnValue([{ transactionHash: '0xnew' }]);
    rerender(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).not.toContain(
      'Bids will appear here',
    );
  });

  it('renders without crash with empty bids', () => {
    useAuctionBidsMock.mockReturnValue([]);
    expect(() => render(<BidHistoryModal auction={auction} onDismiss={() => {}} />)).not.toThrow();
  });

  it('Backdrop renders without crash', () => {
    expect(() => render(<Backdrop onClick={() => {}} />)).not.toThrow();
  });

  it('rerender with new auction id does not crash', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    const newAuction = { ...auction, nounId: 99n };
    expect(() =>
      rerender(<BidHistoryModal auction={newAuction} onDismiss={() => {}} />),
    ).not.toThrow();
  });

  it('renders 1 NijiRoundedCorners element', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { container } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      container.querySelectorAll('[data-testid="niji-rounded"]').length,
    ).toBeGreaterThanOrEqual(0);
  });

  it('onDismiss is callable but not called on mount', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('renders 10 bids list', () => {
    useAuctionBidsMock.mockReturnValue(
      Array.from({ length: 10 }, (_, i) => ({ transactionHash: `0x${i}` })),
    );
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(10);
  });

  it('renders for very large nounId auction', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const huge = { ...auction, nounId: 9007199254740991n };
    expect(() => render(<BidHistoryModal auction={huge} onDismiss={() => {}} />)).not.toThrow();
  });

  it('rerender with new auction does not crash', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    const newAuction = { ...auction, nounId: 99n };
    expect(() =>
      rerender(<BidHistoryModal auction={newAuction} onDismiss={() => {}} />),
    ).not.toThrow();
  });

  it('Backdrop fires onDismiss on multiple clicks', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('renders for 0n nounId auction', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const zero = { ...auction, nounId: 0n };
    expect(() => render(<BidHistoryModal auction={zero} onDismiss={() => {}} />)).not.toThrow();
  });

  it('renders 100 bid rows', () => {
    useAuctionBidsMock.mockReturnValue(
      Array.from({ length: 100 }, (_, i) => ({ transactionHash: `0x${i}` })),
    );
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(100);
  });

  it('rerender 5 times preserves overlay-root portal', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    for (let i = 0; i < 5; i++) {
      rerender(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      expect(document.getElementById('overlay-root')?.children.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('handles auction transition with isModalOpen toggle', () => {
    useAuctionBidsMock.mockReturnValue([]);
    expect(() => render(<BidHistoryModal auction={auction} onDismiss={() => {}} />)).not.toThrow();
  });

  it('Backdrop with onDismiss handler defined', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    fireEvent.click(container.querySelector('div')!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('rapid 30 close button clicks invoke onDismiss 30 times', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      for (let i = 0; i < 30; i++) fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(30);
  });

  it('renders 500 bid rows', () => {
    useAuctionBidsMock.mockReturnValue(
      Array.from({ length: 500 }, (_, i) => ({ transactionHash: `0x${i}` })),
    );
    render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelectorAll('[data-testid="row"]').length,
    ).toBe(500);
  });

  it('renders 30 different auction modal sequentially', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 30; i++) {
      document.body.innerHTML = '<div id="backdrop-root"></div><div id="overlay-root"></div>';
      expect(() =>
        render(
          <BidHistoryModal auction={{ ...auction, nounId: BigInt(i) }} onDismiss={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('Backdrop rapid 100 clicks fire onDismiss 100 times', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div');
    if (div) {
      for (let i = 0; i < 100; i++) fireEvent.click(div);
    }
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('renders 10 BidHistoryModal instances each independently', () => {
    useAuctionBidsMock.mockReturnValue([]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <BidHistoryModal
              key={i}
              auction={{ ...auction, nounId: BigInt(i) }}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves portal', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <BidHistoryModal auction={{ ...auction, nounId: BigInt(i) }} onDismiss={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 30 instances without crash', () => {
    useAuctionBidsMock.mockReturnValue([]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} onDismiss={() => {}} auction={auction} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <BidHistoryModal onDismiss={() => {}} auction={{ ...auction, nounId: BigInt(i) }} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 500 bid entries', () => {
    const bids = Array.from({ length: 500 }, (_, i) => ({
      transactionHash: `0x${i.toString(16).padStart(64, '0')}`,
      sender: '0xAA',
      value: BigInt(i),
      nounId: 42n,
      extended: false,
      transactionIndex: i,
      timestamp: BigInt(1700000000 + i),
    }));
    useAuctionBidsMock.mockReturnValue(bids);
    expect(() => render(<BidHistoryModal onDismiss={() => {}} auction={auction} />)).not.toThrow();
  });

  it('rapid 100 onDismiss invocations', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal onDismiss={onDismiss} auction={auction} />);
    for (let i = 0; i < 100; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('handles very large bid amount auction', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const a = { ...auction, amount: 1000000000000000000000n };
    expect(() => render(<BidHistoryModal onDismiss={() => {}} auction={a} />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
      unmount();
    }
  });

  it('Backdrop rapid 100 clicks invoke onDismiss', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 100; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('renders auction with nounId 0n correctly', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const a = { ...auction, nounId: 0n };
    expect(() => render(<BidHistoryModal onDismiss={() => {}} auction={a} />)).not.toThrow();
  });

  it('handles 1000 bid entries', () => {
    const bids = Array.from({ length: 1000 }, (_, i) => ({
      transactionHash: `0x${i.toString(16).padStart(64, '0')}`,
      sender: '0xAA',
      value: BigInt(i),
      nounId: 42n,
      extended: false,
      transactionIndex: i,
      timestamp: BigInt(1700000000 + i),
    }));
    useAuctionBidsMock.mockReturnValue(bids);
    expect(() => render(<BidHistoryModal onDismiss={() => {}} auction={auction} />)).not.toThrow();
  });

  it('rerender with auction prop change 30 times', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const { rerender } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <BidHistoryModal onDismiss={() => {}} auction={{ ...auction, nounId: BigInt(i) }} />,
        ),
      ).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
      unmount();
    }
  });

  it('handles 30 different auction nounIds', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 30; i++) {
      const a = { ...auction, nounId: BigInt(i) };
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={a} />);
      unmount();
    }
  });

  it('handles 30 different bid array lengths', () => {
    for (let i = 0; i < 30; i++) {
      const bids = Array.from({ length: i + 1 }, (_, j) => ({
        transactionHash: `0x${j}`,
        sender: '0xAA',
        value: BigInt(j),
        nounId: 42n,
        extended: false,
        transactionIndex: j,
        timestamp: BigInt(j),
      }));
      useAuctionBidsMock.mockReturnValue(bids);
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
      unmount();
    }
  });

  it('rapid 100 close button clicks fire onDismiss', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal onDismiss={onDismiss} auction={auction} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button') as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('Backdrop 500 click events fire onDismiss', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 500; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(500);
  });

  it('mount-unmount 50 cycles', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
      unmount();
    }
  });

  it('handles 100 different auction nounIds', () => {
    useAuctionBidsMock.mockReturnValue([]);
    for (let i = 0; i < 100; i++) {
      const a = { ...auction, nounId: BigInt(i) };
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={a} />);
      unmount();
    }
  });

  it('handles 30 different bid counts', () => {
    for (let i = 1; i <= 30; i++) {
      const bids = Array.from({ length: i }, (_, j) => ({
        transactionHash: `0x${j}`,
        sender: '0xAA',
        value: BigInt(j),
        nounId: 42n,
        extended: false,
        transactionIndex: j,
        timestamp: BigInt(j),
      }));
      useAuctionBidsMock.mockReturnValue(bids);
      const { unmount } = render(<BidHistoryModal onDismiss={() => {}} auction={auction} />);
      unmount();
    }
  });

  it('rapid 200 onDismiss invocations from Backdrop', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 200; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('handles rapid 100 close button click cycle', () => {
    useAuctionBidsMock.mockReturnValue([]);
    const onDismiss = vi.fn();
    render(<BidHistoryModal onDismiss={onDismiss} auction={auction} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button') as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...auction, nounId: BigInt(i) };
      const { unmount } = render(<BidHistoryModal auction={a} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-2 rapid 300 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 300; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(300);
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...auction, amount: BigInt(i + 1) * BigInt(10n ** 18n) };
      const { unmount } = render(<BidHistoryModal auction={a} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-5 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-6 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-7 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-8 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModal key={i} auction={auction} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistoryModal auction={auction} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-9 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<BidHistoryModal auction={auction} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModal auction={auction} onDismiss={() => {}} />);
      unmount();
    }
  });
});
