/**
 * Bid component behavior tests (Issue #3033 で UI 統合後の refactor)
 *
 * Issue #3033 以降 —
 * (1) Bid は 単一「Bid」 button のみ描画、 click で BidModal を open (中身の Tabs は BidModal test で検証)
 * (2) wallet 未接続時は button disable + tooltip wrapper 追加
 * (3) auction 終了時は「Pick the next Niji」 + SettleManuallyBtn を維持
 *
 * BidModal は別 test file (BidModal/index.test.tsx) で個別検証、 本 file では stub で差替。
 */
import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({
    t: (s: TemplateStringsArray | string) => (Array.isArray(s) ? s[0] : s),
  }),
}));

const settleAuctionMock = vi.fn();

const hookState: {
  account: string | undefined;
  isCoolAuction: boolean;
  settleAuction: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;
    error: { message: string } | null;
  };
} = {
  account: '0xUSER',
  isCoolAuction: true,
  settleAuction: {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    error: null,
  },
};

vi.mock('@niji/sdk/react', () => ({
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

// jotai の useAtomValue を Bid が使うのは isCoolBackgroundAtom (cool/warm 判定) のみ、
// 他 atom 参照は無いため、 hookState.isCoolAuction をそのまま返す stub で十分。
vi.mock('jotai/react', () => ({
  useAtomValue: () => hookState.isCoolAuction,
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

// BidModal は Dialog Portal + Tabs で jsdom 描画重い + wagmi hook 依存、 Bid test では stub 差替。
// BidModal 自体の behavior は BidModal/index.test.tsx で検証。
vi.mock('@/components/BidModal', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="bid-modal-stub" /> : null),
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
  hookState.isCoolAuction = true;
  hookState.settleAuction = {
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    error: null,
  };
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

describe('Bid (Issue #3033 単一 button + BidModal 経路)', () => {
  describe('auctionEnded=false (ongoing auction)', () => {
    it('renders single Bid button (not 2 separate buttons)', () => {
      const { getAllByTestId, queryByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtns = getAllByTestId('bid-open-button');
      expect(bidBtns.length).toBeGreaterThan(0);
      // 従来の「クレカで bid (JPY)」 button は存在しない
      expect(queryByTestId('fiat-bid-open-button')).toBeNull();
    });

    it('does not render an ETH bid input inline (moved to BidModal)', () => {
      const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      // 従来 Bid inline にあった数値 input は無くなる (BidModal 内に移動)
      expect(container.querySelector('input[type="number"]')).toBeNull();
    });

    it('opens BidModal on Bid button click when wallet connected', () => {
      hookState.account = '0xUSER';
      const { getAllByTestId, queryByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      expect(queryByTestId('bid-modal-stub')).toBeNull();
      const bidBtn = getAllByTestId('bid-open-button').find(
        b => (b as HTMLButtonElement).disabled === false,
      );
      expect(bidBtn).not.toBeUndefined();
      fireEvent.click(bidBtn!);
      expect(queryByTestId('bid-modal-stub')).not.toBeNull();
    });

    it('disables Bid button + wraps in tooltip when wallet disconnected', () => {
      hookState.account = undefined;
      const { getAllByTestId, container } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtns = getAllByTestId('bid-open-button');
      expect(bidBtns.length).toBeGreaterThan(0);
      bidBtns.forEach(b => {
        expect((b as HTMLButtonElement).disabled).toBe(true);
      });
      // tooltip trigger wrapper span 存在
      expect(container.querySelector('[data-testid="bid-open-button-wrapper"]')).not.toBeNull();
    });

    it('does not render BidModal when wallet disconnected', () => {
      hookState.account = undefined;
      const { queryByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      // wallet 未接続時は BidModal は render されない (親側で条件付き render)
      expect(queryByTestId('bid-modal-stub')).toBeNull();
    });

    it('Bid button click on disconnected wallet does not open modal', () => {
      hookState.account = undefined;
      const { getAllByTestId, queryByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtn = getAllByTestId('bid-open-button')[0];
      // disabled button だが try で click しても modal は開かない
      fireEvent.click(bidBtn);
      expect(queryByTestId('bid-modal-stub')).toBeNull();
    });
  });

  describe('cool/warm palette accent (Issue #3037)', () => {
    it('assigns data-palette="cool" when isCoolBackgroundAtom is true (wallet connected)', () => {
      hookState.account = '0xUSER';
      hookState.isCoolAuction = true;
      const { getAllByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtn = getAllByTestId('bid-open-button')[0];
      expect(bidBtn.getAttribute('data-palette')).toBe('cool');
    });

    it('assigns data-palette="warm" when isCoolBackgroundAtom is false (wallet connected)', () => {
      hookState.account = '0xUSER';
      hookState.isCoolAuction = false;
      const { getAllByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtn = getAllByTestId('bid-open-button')[0];
      expect(bidBtn.getAttribute('data-palette')).toBe('warm');
    });

    it('assigns data-palette="cool" on disabled button when wallet disconnected + cool auction', () => {
      hookState.account = undefined;
      hookState.isCoolAuction = true;
      const { getAllByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtn = getAllByTestId('bid-open-button')[0];
      expect(bidBtn.getAttribute('data-palette')).toBe('cool');
      expect((bidBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('assigns data-palette="warm" on disabled button when wallet disconnected + warm auction', () => {
      hookState.account = undefined;
      hookState.isCoolAuction = false;
      const { getAllByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      const bidBtn = getAllByTestId('bid-open-button')[0];
      expect(bidBtn.getAttribute('data-palette')).toBe('warm');
      expect((bidBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('data-palette toggles across rerender when isCoolAuction flips (cool → warm)', () => {
      hookState.account = '0xUSER';
      hookState.isCoolAuction = true;
      const { getAllByTestId, rerender } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      expect(getAllByTestId('bid-open-button')[0].getAttribute('data-palette')).toBe('cool');

      hookState.isCoolAuction = false;
      rerender(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      expect(getAllByTestId('bid-open-button')[0].getAttribute('data-palette')).toBe('warm');
    });
  });

  describe('auctionEnded=true (settle phase)', () => {
    it('does not render Bid button when auctionEnded', () => {
      const { queryByTestId } = render(
        <Bid auction={makeAuction() as never} auctionEnded={true} />,
      );
      expect(queryByTestId('bid-open-button')).toBeNull();
    });

    it('shows "Pick the next Niji" button when auctionEnded', () => {
      const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
      expect(container.textContent).toContain('Pick the next Niji');
    });

    it('shows SettleManuallyBtn when auctionEnded + wallet connected', () => {
      hookState.account = '0xUSER';
      const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
      expect(container.querySelector('[data-testid="settle-btn"]')).not.toBeNull();
    });

    it('hides SettleManuallyBtn when wallet disconnected', () => {
      hookState.account = undefined;
      const { container } = render(<Bid auction={makeAuction() as never} auctionEnded={true} />);
      expect(container.querySelector('[data-testid="settle-btn"]')).toBeNull();
    });

    it('clicking Pick opens /crystal-ball in new tab (does not call settleAuction)', () => {
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

    it('toast.error on settleAuction failure (didSettleFail effect)', () => {
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

    it('toast.success on settleAuction success when auctionEnded', () => {
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
  });

  describe('render stability + rerender scenarios', () => {
    it('rerender from auctionEnded=false to true removes Bid button', () => {
      const { queryByTestId, rerender } = render(
        <Bid auction={makeAuction() as never} auctionEnded={false} />,
      );
      expect(queryByTestId('bid-open-button')).not.toBeNull();
      rerender(<Bid auction={makeAuction() as never} auctionEnded={true} />);
      expect(queryByTestId('bid-open-button')).toBeNull();
    });

    it('rerender from auctionEnded=true to false adds Bid button', () => {
      const { queryByTestId, rerender } = render(
        <Bid auction={makeAuction() as never} auctionEnded={true} />,
      );
      expect(queryByTestId('bid-open-button')).toBeNull();
      rerender(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      expect(queryByTestId('bid-open-button')).not.toBeNull();
    });

    it('different nounId renders without crash', () => {
      expect(() =>
        render(<Bid auction={makeAuction({ nounId: 999n }) as never} auctionEnded={false} />),
      ).not.toThrow();
    });

    it('nounId=0n auction renders without crash', () => {
      expect(() =>
        render(<Bid auction={makeAuction({ nounId: 0n }) as never} auctionEnded={false} />),
      ).not.toThrow();
    });

    it('MAX_SAFE_INTEGER bigint nounId renders without crash', () => {
      expect(() =>
        render(
          <Bid
            auction={makeAuction({ nounId: 9_007_199_254_740_991n }) as never}
            auctionEnded={false}
          />,
        ),
      ).not.toThrow();
    });

    it('settled=true auction renders without crash', () => {
      expect(() =>
        render(<Bid auction={makeAuction({ settled: true }) as never} auctionEnded={true} />),
      ).not.toThrow();
    });

    it('renders 5 instances without crash', () => {
      expect(() =>
        render(
          <>
            {Array.from({ length: 5 }, (_, i) => (
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

    it('renders without crash when account is undefined', () => {
      hookState.account = undefined;
      expect(() =>
        render(<Bid auction={makeAuction() as never} auctionEnded={false} />),
      ).not.toThrow();
      hookState.account = '0xUSER';
    });

    it('handles all settleAuction status combinations', () => {
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
      ].forEach(s => {
        hookState.settleAuction = s;
        expect(() =>
          render(<Bid auction={makeAuction() as never} auctionEnded={true} />),
        ).not.toThrow();
      });
      hookState.settleAuction = orig;
    });

    it('mount-unmount 10 cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
        unmount();
      }
    });

    it('rapid auctionEnded toggle 10 cycles', () => {
      const { rerender } = render(<Bid auction={makeAuction() as never} auctionEnded={false} />);
      for (let i = 0; i < 10; i++) {
        expect(() =>
          rerender(<Bid auction={makeAuction() as never} auctionEnded={i % 2 === 0} />),
        ).not.toThrow();
      }
    });
  });
});
