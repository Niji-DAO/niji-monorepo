import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({
    t: (s: TemplateStringsArray | string) => (Array.isArray(s) ? s[0] : s),
  }),
}));

const placeBidMock = vi.fn();
const settleAuctionMock = vi.fn();

const hookState: {
  account: string | undefined;
  minBidIncPercentage: bigint | undefined;
  placeBid: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
  settleAuction: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;
    error: { message: string } | null;
  };
} = {
  account: '0xUSER',
  minBidIncPercentage: 5n,
  placeBid: { isPending: false, isError: false, isSuccess: false },
  settleAuction: {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    error: null,
  },
};

vi.mock('@niji/sdk/react', () => ({
  useReadNijiAuctionHouseMinBidIncrementPercentage: () => ({
    data: hookState.minBidIncPercentage,
  }),
  useWriteNijiAuctionHouseCreateBid: () => ({
    writeContract: placeBidMock,
    isPending: hookState.placeBid.isPending,
    isError: hookState.placeBid.isError,
    isSuccess: hookState.placeBid.isSuccess,
  }),
  useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction: () => ({
    writeContract: settleAuctionMock,
    isPending: hookState.settleAuction.isPending,
    isSuccess: hookState.settleAuction.isSuccess,
    isError: hookState.settleAuction.isError,
    isIdle: hookState.settleAuction.isIdle,
    error: hookState.settleAuction.error,
  }),
}));

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookState.account }),
}));

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => toastSuccessMock(msg),
    error: (msg: string) => toastErrorMock(msg),
  },
}));

vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => 'en-US',
}));

vi.mock('@/components/SettleManuallyBtn', () => ({
  default: () => <button data-testid="settle-btn" />,
}));

import Bid from './index';

const makeAuction = (overrides: Record<string, unknown> = {}) => ({
  amount: 1_000_000_000_000_000_000n,
  bidder: '0xPREV',
  endTime: 100n,
  startTime: 0n,
  nounId: 5n,
  settled: false,
  ...overrides,
});

const resetState = () => {
  hookState.account = '0xUSER';
  hookState.minBidIncPercentage = 5n;
  hookState.placeBid = { isPending: false, isError: false, isSuccess: false };
  hookState.settleAuction = {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    error: null,
  };
  placeBidMock.mockReset();
  settleAuctionMock.mockReset();
  toastSuccessMock.mockReset();
  toastErrorMock.mockReset();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Bid', () => {
  it('renders input and Bid button when not auctionEnded', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    expect(container.querySelector('input')).not.toBeNull();
    expect(container.textContent).toContain('Bid');
  });

  it('updates bid input on change', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.50' } });
    expect(input.value).toBe('1.50');
  });

  it('limits decimal to 2 digits on input change', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.50' } });
    fireEvent.change(input, { target: { value: '1.5012' } });
    expect(input.value).toBe('1.50');
  });

  it('calls placeBid when input >= minBid', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2.50' } });
    const bidBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Bid'),
    );
    fireEvent.click(bidBtn!);
    expect(placeBidMock).toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('shows toast.error when input < minBid', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0.50' } });
    const bidBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Bid'),
    );
    fireEvent.click(bidBtn!);
    expect(toastErrorMock).toHaveBeenCalled();
    expect(placeBidMock).not.toHaveBeenCalled();
  });

  it('does not render input when auctionEnded=true', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(container.querySelector('input')).toBeNull();
  });

  it('shows "Pick the next Niji" button when auctionEnded=true', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(container.textContent).toContain('Pick the next Niji');
  });

  it('shows SettleManuallyBtn when auctionEnded=true and wallet connected', () => {
    hookState.account = '0xUSER';
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).not.toBeNull();
  });

  it('hides SettleManuallyBtn when wallet disconnected', () => {
    hookState.account = undefined;
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).toBeNull();
  });

  it('disables Bid button when wallet disconnected', () => {
    hookState.account = undefined;
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const bidBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Bid'),
    );
    expect(bidBtn?.disabled).toBe(true);
  });

  it('toast.error on placeBid failure (didPlaceBidFail effect)', () => {
    hookState.placeBid = { isPending: false, isError: true, isSuccess: false };
    render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it('toast.success on placeBid success (placeBidSucceeded effect)', () => {
    hookState.placeBid = { isPending: false, isError: false, isSuccess: true };
    render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('renders Pick button as plain anchor (no disabled prop) when auctionEnded', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    const pickBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Pick the next Niji'),
    );
    expect(pickBtn).not.toBeUndefined();
    expect(pickBtn?.disabled).toBe(false);
  });

  it('clicking Pick opens /crystal-ball in new tab (does not call settleAuction directly)', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    const pickBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Pick the next Niji'),
    );
    fireEvent.click(pickBtn!);
    expect(openSpy).toHaveBeenCalledWith('/crystal-ball', '_blank', 'noopener,noreferrer');
    expect(settleAuctionMock).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('toast.error on settleAuction failure (didSettleFail effect) when auctionEnded', () => {
    hookState.settleAuction = {
      isPending: false,
      isSuccess: false,
      isError: true,
      isIdle: false,
      error: { message: 'settle boom' },
    };
    render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it('toast.success on settleAuction success when auctionEnded=true', () => {
    hookState.settleAuction = {
      isPending: false,
      isSuccess: true,
      isError: false,
      isIdle: false,
      error: null,
    };
    render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('shows Spinner inside Bid button while isPlacingBid is true (Bid label hidden)', () => {
    hookState.placeBid = { isPending: true, isError: false, isSuccess: false };
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const spinner = container.querySelector('.spinner-border');
    expect(spinner).not.toBeNull();
  });
});
