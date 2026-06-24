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
});
