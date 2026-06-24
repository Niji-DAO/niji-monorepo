import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeAll(() => {
  dayjs.extend(duration);
});

import SettleManuallyBtn from './index';

import type { Auction } from '@/wrappers/nijiAuction';

const auction: Auction = {
  amount: 1000000000000000000n,
  bidder: '0xAA',
  endTime: BigInt(Math.floor(Date.now() / 1000) - 600),
  startTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
  nounId: 1n,
  settled: false,
};

describe('SettleManuallyBtn', () => {
  it('renders Settle manually button (timer 0 で即時有効)', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.textContent).toContain('Settle manually');
  });

  it('button is enabled (settleEnabled=true after immediate flip)', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('fires settleAuctionHandler on button click', () => {
    const handler = vi.fn();
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={handler} auction={auction} />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('wraps button in <p> element', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelector('p button')).not.toBeNull();
  });

  it('fires settleAuctionHandler on multiple clicks', () => {
    const handler = vi.fn();
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={handler} auction={auction} />,
    );
    const btn = container.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('renders with huge bid amount', () => {
    const huge = { ...auction, amount: 1_000_000_000_000_000_000_000_000n };
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={huge} />,
    );
    expect(container.textContent).toContain('Settle');
  });

  it('renders exactly 1 button element', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('outermost wrapper is a single <p>', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('P');
  });

  it('handles nounId=0n auction', () => {
    const zeroId = { ...auction, nounId: 0n };
    expect(() =>
      render(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={zeroId} />),
    ).not.toThrow();
  });

  it('renders for settled=true auction without crash', () => {
    const settled = { ...auction, settled: true };
    expect(() =>
      render(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={settled} />),
    ).not.toThrow();
  });

  it('renders 0n bid amount auction', () => {
    const zero = { ...auction, amount: 0n };
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={zero} />,
    );
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('renders different nounId (large) without crash', () => {
    const large = { ...auction, nounId: 999999n };
    expect(() =>
      render(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={large} />),
    ).not.toThrow();
  });

  it('button text "Settle manually" verbatim', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelector('button')?.textContent).toContain('Settle manually');
  });

  it('handler not called on initial render (no auto-fire)', () => {
    const handler = vi.fn();
    render(<SettleManuallyBtn settleAuctionHandler={handler} auction={auction} />);
    expect(handler).not.toHaveBeenCalled();
  });

  it('rerender with new handler still works on click', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const { container, rerender } = render(
      <SettleManuallyBtn settleAuctionHandler={handler1} auction={auction} />,
    );
    rerender(<SettleManuallyBtn settleAuctionHandler={handler2} auction={auction} />);
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler1).not.toHaveBeenCalled();
  });

  it('multiple instances render with independent handlers', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const { container } = render(
      <>
        <SettleManuallyBtn settleAuctionHandler={h1} auction={auction} />
        <SettleManuallyBtn settleAuctionHandler={h2} auction={auction} />
      </>,
    );
    const btns = container.querySelectorAll('button');
    fireEvent.click(btns[0]);
    fireEvent.click(btns[1]);
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('button type defaults to button (or attribute exists)', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('p wrapper renders only 1 button child', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelectorAll('p button').length).toBe(1);
  });

  it('bidder 0x0 auction renders without crash', () => {
    const noBidder = { ...auction, bidder: '0x0' };
    expect(() =>
      render(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={noBidder} />),
    ).not.toThrow();
  });

  it('extremely large endTime does not crash', () => {
    const future = { ...auction, endTime: 99999999999n };
    expect(() =>
      render(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={future} />),
    ).not.toThrow();
  });

  it('5 instances render 5 buttons', () => {
    const { container } = render(
      <>
        <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />
        <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />
        <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />
        <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />
        <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('rerender preserves p wrapper', () => {
    const { container, rerender } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.firstElementChild?.tagName).toBe('P');
    rerender(<SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />);
    expect(container.firstElementChild?.tagName).toBe('P');
  });

  it('button text "Settle manually" rendered verbatim', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.textContent).toBe('Settle manually');
  });

  it('rerender different auction.amount does not crash', () => {
    const { rerender } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(() =>
      rerender(
        <SettleManuallyBtn
          settleAuctionHandler={() => {}}
          auction={{ ...auction, amount: 999n }}
        />,
      ),
    ).not.toThrow();
  });

  it('p wrapper renders 1 element exactly', () => {
    const { container } = render(
      <SettleManuallyBtn settleAuctionHandler={() => {}} auction={auction} />,
    );
    expect(container.querySelectorAll('p').length).toBe(1);
  });

  it('renders without crash for very old auction', () => {
    const oldAuction: Auction = {
      ...auction,
      endTime: BigInt(Math.floor(Date.now() / 1000) - 100000),
      startTime: BigInt(Math.floor(Date.now() / 1000) - 200000),
    };
    expect(() =>
      render(<SettleManuallyBtn auction={oldAuction} settleAuction={vi.fn()} />),
    ).not.toThrow();
  });

  it('renders without crash for future endTime', () => {
    const futureAuction: Auction = {
      ...auction,
      endTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
    };
    expect(() =>
      render(<SettleManuallyBtn auction={futureAuction} settleAuction={vi.fn()} />),
    ).not.toThrow();
  });

  it('rerender with different auction does not crash', () => {
    const { rerender } = render(<SettleManuallyBtn auction={auction} settleAuction={vi.fn()} />);
    const newAuction = { ...auction, nounId: 99n };
    expect(() =>
      rerender(<SettleManuallyBtn auction={newAuction} settleAuction={vi.fn()} />),
    ).not.toThrow();
  });

  it('renders 3 instances each independently', () => {
    const { container } = render(
      <>
        <SettleManuallyBtn auction={auction} settleAuction={vi.fn()} />
        <SettleManuallyBtn auction={auction} settleAuction={vi.fn()} />
        <SettleManuallyBtn auction={auction} settleAuction={vi.fn()} />
      </>,
    );
    expect(container.children.length).toBe(3);
  });

  it('renders for settled=true auction', () => {
    const settledAuction: Auction = { ...auction, settled: true };
    expect(() =>
      render(<SettleManuallyBtn auction={settledAuction} settleAuction={vi.fn()} />),
    ).not.toThrow();
  });
});
