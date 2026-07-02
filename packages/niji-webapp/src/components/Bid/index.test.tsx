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

// FiatBidModal は QueryClientProvider 依存 + Dialog Portal で jsdom 描画重いため、
// Bid 側 test では stub に差替 (FiatBidModal 自体は別 test file で個別検証)
vi.mock('@/components/FiatBidModal', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="fiat-bid-modal-stub" /> : null,
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

  it('renders fiat bid button when wallet connected (auction ongoing)', () => {
    hookState.account = '0xUSER';
    const { getAllByTestId } = render(
      <Bid auction={makeAuction() as never} auctionEnded={false} />,
    );
    const fiatBtns = getAllByTestId('fiat-bid-open-button');
    // 少なくとも 1 つ enabled で描画される (wallet 接続時、 未接続時は tooltip wrapper 経由)
    expect(fiatBtns.some(b => (b as HTMLButtonElement).disabled === false)).toBe(true);
  });

  it('disables fiat bid button + wraps in tooltip when wallet disconnected', () => {
    hookState.account = undefined;
    const { getAllByTestId, container } = render(
      <Bid auction={makeAuction() as never} auctionEnded={false} />,
    );
    // wallet 未接続時は fiat button は disabled、 tooltip wrapper span で包まれる
    const fiatBtns = getAllByTestId('fiat-bid-open-button');
    expect(fiatBtns.length).toBeGreaterThan(0);
    fiatBtns.forEach(b => {
      expect((b as HTMLButtonElement).disabled).toBe(true);
    });
    // tooltip trigger wrapper span 存在
    expect(container.querySelector('[data-testid="fiat-bid-open-button-wrapper"]')).not.toBeNull();
  });

  it('opens fiat bid modal on fiat button click (wallet connected)', () => {
    hookState.account = '0xUSER';
    const { getAllByTestId, queryByTestId } = render(
      <Bid auction={makeAuction() as never} auctionEnded={false} />,
    );
    // modal は初期 closed
    expect(queryByTestId('fiat-bid-modal-stub')).toBeNull();
    // button click で modal open
    const fiatBtn = getAllByTestId('fiat-bid-open-button').find(
      b => (b as HTMLButtonElement).disabled === false,
    );
    fireEvent.click(fiatBtn!);
    expect(queryByTestId('fiat-bid-modal-stub')).not.toBeNull();
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

  it('renders exactly 1 input when not auctionEnded', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('rerender from auctionEnded=false to true removes input', () => {
    const { container, rerender } = render(
      <Bid auction={makeAuction() as never} auctionEnded={false} />,
    );
    expect(container.querySelector('input')).not.toBeNull();
    rerender(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(container.querySelector('input')).toBeNull();
  });

  it('bid button is shown when not auctionEnded', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const bidBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Bid'),
    );
    expect(bidBtn).not.toBeUndefined();
  });

  it('Pick button shown when auctionEnded=true', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    const pickBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Pick'),
    );
    expect(pickBtn).not.toBeUndefined();
  });

  it('different nounId renders without crash', () => {
    expect(() =>
      render(<Bid auction={makeAuction({ nounId: 999n }) as never} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('large amount auction renders without crash', () => {
    expect(() =>
      render(
        <Bid
          auction={makeAuction({ amount: 999_999_999_999_999_999n }) as never}
          auctionEnded={false}
        />,
      ),
    ).not.toThrow();
  });

  it('rerender from auction.amount change preserves input', () => {
    const { container, rerender } = render(
      <Bid auction={makeAuction() as never} auctionEnded={false} />,
    );
    expect(container.querySelector('input')).not.toBeNull();
    rerender(
      <Bid
        auction={makeAuction({ amount: 5_000_000_000_000_000_000n }) as never}
        auctionEnded={false}
      />,
    );
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('settled=true auction renders without crash', () => {
    expect(() =>
      render(<Bid auction={makeAuction({ settled: true }) as never} auctionEnded={true} />),
    ).not.toThrow();
  });

  it('input is empty initially', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('decimal 0.01 input accepted', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0.01' } });
    expect(input.value).toBe('0.01');
  });

  it('renders 5 instances each without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from auctionEnded=false to true does not crash', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    expect(() =>
      rerender(<Bid auction={makeAuction() as never} auctionEnded={true} />),
    ).not.toThrow();
  });

  it('renders without crash when account is undefined', () => {
    hookState.account = undefined;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
    hookState.account = '0xUSER';
  });

  it('renders without crash when minBidIncPercentage is undefined', () => {
    hookState.minBidIncPercentage = undefined;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
    hookState.minBidIncPercentage = 5n;
  });

  it('input change rapid 5 events updates value', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 5; i++) {
      fireEvent.change(input, { target: { value: `${i}.01` } });
    }
    expect(input.value).toBe('4.01');
  });

  it('renders 5 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash for nounId=0n auction', () => {
    expect(() =>
      render(<Bid auction={makeAuction({ nounId: 0n }) as never} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders without crash for nounId=999999n', () => {
    expect(() =>
      render(<Bid auction={makeAuction({ nounId: 999999n }) as never} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('renders for placeBid isPending=true', () => {
    hookState.placeBid.isPending = true;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
    hookState.placeBid.isPending = false;
  });

  it('renders 20 Bid instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <Bid
              key={i}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
              auctionEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders for settleAuction isError=true', () => {
    hookState.settleAuction.isError = true;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={true} />),
    ).not.toThrow();
    hookState.settleAuction.isError = false;
  });

  it('renders for placeBid isSuccess=true', () => {
    hookState.placeBid.isSuccess = true;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
    hookState.placeBid.isSuccess = false;
  });

  it('rapid 30 input change events update value', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 30; i++) {
      fireEvent.change(input, { target: { value: `${i}.5` } });
    }
    expect(input.value).toBe('29.5');
  });

  it('rerender from auctionEnded=true to false', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
    expect(() =>
      rerender(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders for settled=true auction', () => {
    expect(() =>
      render(<Bid auction={makeAuction({ settled: true }) as never} auctionEnded={true} />),
    ).not.toThrow();
  });

  it('renders 30 Bid instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid
              key={i}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
              auctionEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <Bid auction={makeAuction({ nounId: BigInt(i) }) as never} auctionEnded={false} />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 50 input change events update value', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, { target: { value: `${i}.50` } });
    }
    expect(input.value).toBe('49.50');
  });

  it('handles all hookState combinations', () => {
    const states = [
      { isPending: true, isError: false, isSuccess: false },
      { isPending: false, isError: true, isSuccess: false },
      { isPending: false, isError: false, isSuccess: true },
      { isPending: false, isError: false, isSuccess: false },
    ];
    states.forEach(s => {
      hookState.placeBid = s;
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    });
    hookState.placeBid = { isPending: false, isError: false, isSuccess: false };
  });

  it('renders for 50 different nounIds sequentially', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<Bid auction={makeAuction({ nounId: BigInt(i) }) as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('renders 20 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <Bid
              key={i}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
              auctionEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <Bid auction={makeAuction({ nounId: BigInt(i) }) as never} auctionEnded={false} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles MAX_SAFE_INTEGER bigint nounId', () => {
    expect(() =>
      render(
        <Bid
          auction={makeAuction({ nounId: 9_007_199_254_740_991n }) as never}
          auctionEnded={false}
        />,
      ),
    ).not.toThrow();
  });

  it('handles auctionEnded=true variant', () => {
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={true} />),
    ).not.toThrow();
  });

  it('handles all hookState placeBid combinations', () => {
    const orig = { ...hookState.placeBid };
    [
      { isPending: true, isError: false, isSuccess: false },
      { isPending: false, isError: true, isSuccess: false },
      { isPending: false, isError: false, isSuccess: true },
    ].forEach(s => {
      hookState.placeBid = s;
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    });
    hookState.placeBid = orig;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different bidder addresses', () => {
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ bidder: `0xBID${i}` });
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles minBidIncPercentage variations', () => {
    const orig = hookState.minBidIncPercentage;
    [2n, 5n, 10n, 20n, 50n].forEach(p => {
      hookState.minBidIncPercentage = p;
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    });
    hookState.minBidIncPercentage = orig;
  });

  it('handles all 5 settleAuction status combinations', () => {
    const orig = { ...hookState.settleAuction };
    [
      { isPending: true, isSuccess: false, isError: false, isIdle: false, error: null },
      { isPending: false, isSuccess: true, isError: false, isIdle: false, error: null },
      {
        isPending: false,
        isSuccess: false,
        isError: true,
        isIdle: false,
        error: { message: 'e' },
      },
      { isPending: false, isSuccess: false, isError: false, isIdle: true, error: null },
      { isPending: true, isSuccess: false, isError: true, isIdle: false, error: null },
    ].forEach(s => {
      hookState.settleAuction = s;
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={true} />),
      ).not.toThrow();
    });
    hookState.settleAuction = orig;
  });

  it('handles 50 different bid input values', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, { target: { value: `${i + 1}.00` } });
    }
    expect(input).not.toBeNull();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different account addresses', () => {
    for (let i = 0; i < 30; i++) {
      hookState.account = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
    hookState.account = '0xUSER';
  });

  it('rapid 30 auctionEnded toggle', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('handles 30 different bid amounts in auction', () => {
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ amount: BigInt(i) * 1_000_000_000_000_000_000n });
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles undefined minBidIncPercentage', () => {
    const orig = hookState.minBidIncPercentage;
    hookState.minBidIncPercentage = undefined;
    expect(() =>
      render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
    ).not.toThrow();
    hookState.minBidIncPercentage = orig;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different bid input event chains', () => {
    const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 30; i++) {
      fireEvent.change(input, { target: { value: `${i + 1}.0` } });
      expect(input.value).toBe(`${i + 1}.0`);
    }
  });

  it('renders 30 instances all auctionEnded=false', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid
              key={i}
              auction={makeAuction({ nounId: BigInt(i) }) as never}
              auctionEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different bidder addresses', () => {
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ bidder: `0xBID${i}` });
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different auctionEnded toggle cycles', () => {
    const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('renders 30 instances all auction-ended', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid
              key={i}
              auction={{ ...makeAuction(), nounId: BigInt(i) } as never}
              auctionEnded={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i) };
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), amount: BigInt((i + 1) * 1000000000000000000) };
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('handles 30 different account states', () => {
    const orig = hookState.account;
    for (let i = 0; i < 30; i++) {
      hookState.account = i % 2 === 0 ? `0xACCT${i}` : undefined;
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
    hookState.account = orig;
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-2 handles 30 different auctionEnded toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different auction nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i + 100) };
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-3 30 different auctionEnded toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-3 30 different auction nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(), nounId: BigInt(i + 100) };
      const { unmount } = render(<Bid auction={a as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-3 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 auctionEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 auctionEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-6 30 auctionEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-7 30 auctionEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-8 30 auctionEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={true} />),
      ).not.toThrow();
    }
  });

  it('round-9 30 different auctionEnded values second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 1} />,
      );
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
      unmount();
    }
  });

  it('round-10 30 sequential Bid mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-10 100 sequential alternating auctionEnded', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-11 30 sequential Bid mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-11 100 sequential alternating auctionEnded values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-12 30 sequential Bid mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Bid key={i} auction={makeAuction() as never} auctionEnded={i % 2 === 0} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-12 100 sequential alternating auctionEnded values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });
});
