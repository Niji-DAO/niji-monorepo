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
});
