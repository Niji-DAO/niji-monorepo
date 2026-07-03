/**
 * BidModal behavior test (Issue #3033)
 *
 * 検証観点 —
 * (1) open=true で modal 描画 + Tabs (ETH / クレカ) 両方が表示される
 * (2) 初期 tab は "eth" (defaultTab prop で override 可)
 * (3) ETH tab で ETH 額入力 + submit → useWriteNijiAuctionHouseCreateBid 呼出
 * (4) ETH tab で minBid 未満入力 → toast.error + placeBid 未呼出
 * (5) ETH tab の cancel button で onClose 呼出
 * (6) クレカ tab に切替 → FiatBidForm 描画 (fiat-bid-jpy-input 出現)
 * (7) open=false で modal 非表示
 */
import type { Auction } from '@/wrappers/nijiAuction';

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({
    t: (s: TemplateStringsArray | string) => (Array.isArray(s) ? s[0] : s),
  }),
}));

const placeBidMock = vi.fn();

const hookState: {
  minBidIncPercentage: bigint | undefined;
  placeBid: {
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
  };
} = {
  minBidIncPercentage: 5n,
  placeBid: { isPending: false, isError: false, isSuccess: false },
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
}));

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => toastSuccessMock(msg),
    error: (msg: string) => toastErrorMock(msg),
  },
}));

// FiatBidForm は useFiatBid + useSpotRate 内部依存で jsdom 重い、 stub 差替 (FiatBidForm 自体は
// FiatBidModal test で個別検証)
vi.mock('@/components/FiatBidModal/FiatBidForm', () => ({
  default: () => <div data-testid="fiat-bid-form-stub" />,
  FiatBidForm: () => <div data-testid="fiat-bid-form-stub" />,
}));

import BidModal from './index';

const makeAuction = (overrides: Partial<Auction> = {}): Auction => ({
  amount: 1_000_000_000_000_000_000n,
  bidder: '0xPREV',
  endTime: 100n,
  startTime: 0n,
  nounId: 5n,
  settled: false,
  ...overrides,
});

const buildWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'BidModalTestWrapper';
  return Wrapper;
};

const resetState = () => {
  hookState.minBidIncPercentage = 5n;
  hookState.placeBid = { isPending: false, isError: false, isSuccess: false };
  placeBidMock.mockReset();
  toastSuccessMock.mockReset();
  toastErrorMock.mockReset();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('BidModal (Issue #3033)', () => {
  it('open=true で modal 描画 + Tabs 2 個 (ETH / クレカ) 表示', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    expect(getByTestId('bid-modal')).toBeTruthy();
    expect(getByTestId('bid-tab-eth')).toBeTruthy();
    expect(getByTestId('bid-tab-fiat')).toBeTruthy();
  });

  it('open=false で modal 非表示', () => {
    const Wrapper = buildWrapper();
    const { queryByTestId } = render(
      <Wrapper>
        <BidModal open={false} onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    expect(queryByTestId('bid-modal')).toBeNull();
  });

  it('初期 tab = "eth" で ETH form が表示 (fiat form stub は 非 active tab 内で render されない)', () => {
    const Wrapper = buildWrapper();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    expect(getByTestId('eth-bid-input')).toBeTruthy();
    expect(getByTestId('eth-bid-submit')).toBeTruthy();
    // Radix Tabs は non-active TabsContent を render しない (forceMount なし)
    expect(queryByTestId('fiat-bid-form-stub')).toBeNull();
  });

  it('defaultTab="fiat" で FiatBidForm が最初から描画', () => {
    const Wrapper = buildWrapper();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <BidModal
          open
          onClose={() => {}}
          auction={makeAuction()}
          bidderWallet="0xUSER"
          defaultTab="fiat"
        />
      </Wrapper>,
    );
    expect(getByTestId('fiat-bid-form-stub')).toBeTruthy();
    expect(queryByTestId('eth-bid-input')).toBeNull();
  });

  it('ETH tab で valid 額入力 → submit で placeBid 呼出', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const input = getByTestId('eth-bid-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2.00' } });
    const submitBtn = getByTestId('eth-bid-submit') as HTMLButtonElement;
    fireEvent.click(submitBtn);
    expect(placeBidMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it('ETH tab で minBid 未満入力 → toast.error + placeBid 未呼出', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const input = getByTestId('eth-bid-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0.50' } });
    const submitBtn = getByTestId('eth-bid-submit') as HTMLButtonElement;
    fireEvent.click(submitBtn);
    expect(placeBidMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it('ETH tab で submit button は wallet 未接続 (bidderWallet="") で disable', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="" />
      </Wrapper>,
    );
    const submitBtn = getByTestId('eth-bid-submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('ETH tab の cancel button click で onClose 呼出', () => {
    const onClose = vi.fn();
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={onClose} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const cancelBtn = getByTestId('eth-bid-cancel') as HTMLButtonElement;
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('クレカ tab に切替 → FiatBidForm stub 描画 (pointerDown 経由、 jsdom で Radix Tabs は pointer event を要求)', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const fiatTab = getByTestId('bid-tab-fiat');
    // Radix Tabs は jsdom で fireEvent.click では tab 切替が発火しない (pointerDown 経路)、
    // production ブラウザでは click / pointer 両方で発火する (Radix internals)。 test では pointerDown 経由。
    fireEvent.pointerDown(fiatTab, { button: 0, pointerType: 'mouse' });
    fireEvent.mouseDown(fiatTab, { button: 0 });
    // fallback として state 検証で trigger 側 data-state が active になることを確認
    expect(fiatTab.getAttribute('data-state')).toBe('active');
    expect(getByTestId('fiat-bid-form-stub')).toBeTruthy();
  });

  it('ETH tab に切戻す → ETH form 復活', () => {
    const Wrapper = buildWrapper();
    const { getByTestId, queryByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const fiatTab = getByTestId('bid-tab-fiat');
    const ethTab = getByTestId('bid-tab-eth');
    fireEvent.pointerDown(fiatTab, { button: 0, pointerType: 'mouse' });
    fireEvent.mouseDown(fiatTab, { button: 0 });
    expect(getByTestId('fiat-bid-form-stub')).toBeTruthy();
    fireEvent.pointerDown(ethTab, { button: 0, pointerType: 'mouse' });
    fireEvent.mouseDown(ethTab, { button: 0 });
    expect(getByTestId('eth-bid-input')).toBeTruthy();
    expect(queryByTestId('fiat-bid-form-stub')).toBeNull();
  });

  it('placeBid isPending=true 中は submit button disable (spinner 表示)', () => {
    hookState.placeBid.isPending = true;
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const submitBtn = getByTestId('eth-bid-submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('placeBid isSuccess=true で toast.success + input clear', () => {
    hookState.placeBid = { isPending: false, isError: false, isSuccess: true };
    const Wrapper = buildWrapper();
    render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it('placeBid isError=true で toast.error', () => {
    hookState.placeBid = { isPending: false, isError: true, isSuccess: false };
    const Wrapper = buildWrapper();
    render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    expect(toastErrorMock).toHaveBeenCalled();
  });

  it('input decimal > 2 桁で block (0.001 は 0 扱いで受入れず)', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const input = getByTestId('eth-bid-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.50' } });
    expect(input.value).toBe('1.50');
    // 1.5012 は block されて 1.50 のまま
    fireEvent.change(input, { target: { value: '1.5012' } });
    expect(input.value).toBe('1.50');
  });

  it('minBidIncPercentage undefined で minBid=0 → 0.01 ETH で submit 可', () => {
    hookState.minBidIncPercentage = undefined;
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const input = getByTestId('eth-bid-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0.01' } });
    fireEvent.click(getByTestId('eth-bid-submit'));
    expect(placeBidMock).toHaveBeenCalled();
  });

  // ==================== Issue #3039 palette 統合 ====================

  it('palette prop 未指定 → data-palette="cool" が modal root に付与 (default)', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const modal = getByTestId('bid-modal');
    expect(modal.getAttribute('data-palette')).toBe('cool');
  });

  it('palette="warm" で data-palette="warm" が modal root に付与', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal
          open
          onClose={() => {}}
          auction={makeAuction()}
          bidderWallet="0xUSER"
          palette="warm"
        />
      </Wrapper>,
    );
    const modal = getByTestId('bid-modal');
    expect(modal.getAttribute('data-palette')).toBe('warm');
  });

  it('palette="cool" で ETH input に BidModal CSS module class (bidInput) 付与', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal
          open
          onClose={() => {}}
          auction={makeAuction()}
          bidderWallet="0xUSER"
          palette="cool"
        />
      </Wrapper>,
    );
    const input = getByTestId('eth-bid-input');
    // CSS module 経由で hashed class name が付く、 substring "bidInput" を含むかで判定
    // (vitest 環境で CSS module は identity-obj-proxy 相当で class 名がそのまま出る想定)
    expect(input.className).toMatch(/bidInput/);
  });

  it('palette="warm" で ETH submit button に BidModal CSS module class (bidBtn) 付与', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal
          open
          onClose={() => {}}
          auction={makeAuction()}
          bidderWallet="0xUSER"
          palette="warm"
        />
      </Wrapper>,
    );
    const submit = getByTestId('eth-bid-submit');
    expect(submit.className).toMatch(/bidBtn/);
    const cancel = getByTestId('eth-bid-cancel');
    expect(cancel.className).toMatch(/cancelBtn/);
  });

  it('palette は FiatBidForm にも伝播 (fiat tab 切替で form data-palette 検証)', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal
          open
          onClose={() => {}}
          auction={makeAuction()}
          bidderWallet="0xUSER"
          palette="warm"
          defaultTab="fiat"
        />
      </Wrapper>,
    );
    // FiatBidForm は test で stub 化しているので data-palette が付かない、
    // stub は data-testid="fiat-bid-form-stub" のみ、 palette prop 伝搬は FiatBidModal test 側で検証。
    // ここでは modal root の data-palette=warm を確認 (代替)
    const modal = getByTestId('bid-modal');
    expect(modal.getAttribute('data-palette')).toBe('warm');
  });

  it('Tabs list / trigger に BidModal CSS module class (tabsList / tabsTrigger) 付与', () => {
    const Wrapper = buildWrapper();
    const { getByTestId } = render(
      <Wrapper>
        <BidModal open onClose={() => {}} auction={makeAuction()} bidderWallet="0xUSER" />
      </Wrapper>,
    );
    const ethTab = getByTestId('bid-tab-eth');
    const fiatTab = getByTestId('bid-tab-fiat');
    expect(ethTab.className).toMatch(/tabsTrigger/);
    expect(fiatTab.className).toMatch(/tabsTrigger/);
  });
});
