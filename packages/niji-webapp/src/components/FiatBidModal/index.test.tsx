/**
 * FiatBidModal behavior test (Issue #3009 Phase D、 spec T13-T15 + Issue #3025 Phase 2 増額 branch、
 *                              Issue #3051 で入力軸 JPY → ETH に反転)
 *
 * Phase 1 (新規 bid mode) の 3 挙動 —
 * (1) modal 開閉 + stepper 遷移 (T13)
 * (2) JPY 換算 100 万円超過で validation エラー + submit disable (T14、 ETH 額 × spot rate で判定)
 * (3) Terms checkbox 未 check で submit disable (追加、 spec 完了条件 6 番)
 * (4) modal 内 submit で authorize 呼出 (ethAmount / spotRate / jpyAmount 3 値送信) → step="three-ds" 遷移
 *
 * Phase 2 (増額 bid mode、 Issue #3025) の 3 挙動 —
 * (T1) existingFiatBid prop 存在時に「増額 bid」 modal 表示 (title / submit label / existing bid summary)
 * (T2) validateTopupEthAmount 経由の validation error (newEth <= oldEth) 表示 + submit disable
 * (T3) submit で topup endpoint 呼出 (newEthAmount / newSpotRate / newJpyAmount 3 値送信) + 5 phase stepper 表示 + cleanup disclaimer 表示
 */

import type { AuthorizeResponse, PlaceBidResponse, TopupResponse } from '@/hooks/useFiatBid';
import type { SpotRate } from '@/hooks/useSpotRate';

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { BID_LIMIT_JPY, FiatBidModal, validateEthAmount, validateTopupEthAmount } from './index';

// fincode SDK を stub、 token 取得を deterministic な 'tok_stub' に固定。
// FiatBidForm は自作 CardInput の raw 値を fincode.tokens() で token 化する経路のため、
// instance に tokens (callback 形式) を持たせる。 ui() 経路は CardInputFincode 側でのみ使う。
vi.mock('@fincode/js', () => ({
  initFincode: vi.fn().mockResolvedValue({
    tokens: (_params: unknown, onSuccess: (status: number, response: unknown) => void): void => {
      onSuccess(200, { list: [{ token: 'tok_stub' }] });
    },
    ui: () => ({ create: vi.fn(), mount: vi.fn(), getFormData: vi.fn() }),
  }),
  getCardToken: vi.fn().mockResolvedValue({ list: [{ token: 'tok_stub' }] }),
}));

// fincode.js の CDN script 読込を skip させる。 preloadFincodeScript は window.Fincode が
// 既に居れば即 resolve するため、 jsdom で実 fetch を発生させずに init 経路へ進める。
(window as unknown as { Fincode: (key: string) => unknown }).Fincode = () => ({});
// SDK init は publicKey 未設定で早期 return するため、 test 用 key を入れて init を通す。
import.meta.env.VITE_FINCODE_PUBLIC_KEY = 'p_test_dummy';

// Radix Tooltip Portal を jsdom で render するため Provider を wrap

const buildWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = 'FiatBidModalTestWrapper';
  return Wrapper;
};

const successRate: SpotRate = {
  rate: 500_000,
  source: 'gmo',
  cachedAt: '2026-07-01T00:00:00.000Z',
  expiresAt: '2026-07-01T00:00:05.000Z',
};

const authResponse: AuthorizeResponse = {
  authId: 'auth-1',
  tds2Url: 'https://3ds.example/redirect',
  jpyAmount: 50_000,
  ethAmount: '100000000000000000',
  spotRate: 500_000,
  spotRateSource: 'gmo',
};

const placeBidResponse: PlaceBidResponse = {
  authId: 'auth-1',
  status: 'bid-placed',
  txHash: '0xTXHASH',
  message: 'bid tx を broadcast しました。',
};

const topupResponse: TopupResponse = {
  authId: 'auth-2-new',
  oldAuthId: 'auth-1',
  status: 'bid-placed',
  txHash: '0xTXHASH2',
  jpyAmount: 80_000,
  ethAmount: '160000000000000000',
  spotRate: 500_000,
  spotRateSource: 'gmo',
  message: '増額 bid tx を broadcast しました。',
};

describe('validateEthAmount (Issue #3051、 ETH 入力軸)', () => {
  const rate = 500_000; // spot rate 500,000 JPY/ETH

  it('空文字で ng', () => {
    const r = validateEthAmount('', 0.01, rate);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('ETH 額');
  });

  it('負数で ng', () => {
    const r = validateEthAmount('-0.1', 0.01, rate);
    expect(r.ok).toBe(false);
  });

  it('spot rate undefined で ng (spot rate 取得中)', () => {
    const r = validateEthAmount('0.1', 0.01, undefined);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('spot rate');
  });

  it('minBidEth 未満で ng', () => {
    const r = validateEthAmount('0.005', 0.01, rate);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('minimum bid');
  });

  it('minBidEth と同額で ok', () => {
    const r = validateEthAmount('0.01', 0.01, rate);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(0.01);
      expect(r.jpyEquivalent).toBe(5_000); // 0.01 * 500000 = 5000
    }
  });

  it('JPY 換算 100 万円超過で ng (2.001 ETH × 500,000 rate = 1,000,500 JPY)', () => {
    const r = validateEthAmount('2.001', 0.01, rate);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('bid 上限');
  });

  it('JPY 換算 100 万円ちょうどで ok (2 ETH × 500,000 rate = 1,000,000 JPY)', () => {
    const r = validateEthAmount('2', 0.01, rate);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(2);
      expect(r.jpyEquivalent).toBe(BID_LIMIT_JPY);
    }
  });

  it('minBidEth undefined 時は minimum check skip (0.001 ETH でも ok)', () => {
    const r = validateEthAmount('0.001', undefined, rate);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(0.001);
      expect(r.jpyEquivalent).toBe(500); // 0.001 * 500000
    }
  });

  it('正常値 0.05 ETH で ok (JPY 換算 25,000 円)', () => {
    const r = validateEthAmount('0.05', 0.01, rate);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(0.05);
      expect(r.jpyEquivalent).toBe(25_000);
    }
  });
});

describe('FiatBidModal 開閉 + submit → stepper 遷移 (T13、 T15、 Issue #3051 で ETH 入力軸)', () => {
  it('open=true で modal 描画、 ETH 入力 → Terms check → submit で authorize 呼出 (ethAmount / spotRate / jpyAmount 3 値送信) + stepper 表示', async () => {
    const authorize = vi.fn().mockResolvedValue(authResponse);
    const placeBid = vi.fn().mockResolvedValue(placeBidResponse);
    const spotFetcher = vi.fn().mockResolvedValue(successRate);
    const saveState = vi.fn();
    const redirect = vi.fn();

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize, placeBid },
          saveState,
          redirect,
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 取得が終わるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary').textContent).toContain('500,000');
    });

    // ETH 入力 (0.1 ETH = 500,000 JPY 換算)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '50000' } });

    // JPY 換算表示が反映
    expect(screen.getByTestId('fiat-bid-eth-display').textContent).toContain('0.1000');

    // Terms 未 check なら submit disable
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    // Terms check
    const terms = screen.getByTestId('fiat-bid-terms-checkbox') as HTMLInputElement;
    fireEvent.click(terms);
    expect(submit.disabled).toBe(false);

    // submit
    fireEvent.click(submit);

    // authorize 呼出 (ETH primary + spotRate + jpyAmount) + stepper 表示 + redirect
    await waitFor(() => {
      expect(authorize).toHaveBeenCalledWith({
        auctionId: '42',
        bidderWallet: '0xUSER',
        bidderEmail: undefined,
        ethAmount: '100000000000000000', // 0.1 ETH = 1e17 wei
        spotRate: 500_000,
        jpyAmount: 50_000,
        cardToken: 'tok_stub',
      });
    });
    await waitFor(() => {
      const stepper = screen.getByTestId('fiat-bid-stepper');
      expect(stepper.getAttribute('data-step')).toBe('three-ds');
      expect(stepper.textContent).toContain('3D セキュア 2.0 認証中');
    });
    expect(saveState).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('https://3ds.example/redirect');
  });
});

describe('bid 上限超過 validation (T14、 Issue #3051 で JPY 換算 100 万円で判定)', () => {
  it('ETH * spot rate で JPY 換算 100 万円超過入力で validation エラー表示 + submit disable', async () => {
    const authorize = vi.fn();
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize, placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary').textContent).toContain('500,000');
    });

    // 2.001 ETH * 500,000 JPY/ETH = 1,000,500 JPY (100 万円超過)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '1000500' } });

    // validation エラー表示
    await waitFor(() => {
      const err = screen.getByTestId('fiat-bid-jpy-error');
      expect(err.textContent).toContain('bid 上限');
    });

    // Terms check しても submit disable
    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(authorize).not.toHaveBeenCalled();
    // BID_LIMIT_JPY export は残存する (backend との共通契約 constant として)
    expect(BID_LIMIT_JPY).toBe(1_000_000);
  });
});

describe('modal close', () => {
  it('キャンセル button で onClose callback が呼ばれる', async () => {
    const onClose = vi.fn();
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={onClose}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('fiat-bid-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});

// ====================================================================
// Phase 2 増額 bid mode (Issue #3025 T10-T11)
// ====================================================================

describe('validateTopupEthAmount (Phase 2 増額 bid mode、 Issue #3051 で ETH 入力軸)', () => {
  const rate = 500_000; // spot rate 500,000 JPY/ETH

  it('旧 ethAmount と同額で ng (増額のみ受付)', () => {
    const r = validateTopupEthAmount('0.1', 0.01, rate, 0.1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('増額のみ受付可能');
  });

  it('旧 ethAmount 未満で ng', () => {
    const r = validateTopupEthAmount('0.05', 0.01, rate, 0.1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('増額のみ受付可能');
  });

  it('JPY 換算 100 万円超過で ng', () => {
    // 2.001 ETH * 500,000 = 1,000,500 JPY
    const r = validateTopupEthAmount('2.001', 0.01, rate, 0.1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('bid 上限');
  });

  it('旧 ethAmount より大 + JPY 換算 100 万円以下で ok', () => {
    const r = validateTopupEthAmount('0.15', 0.01, rate, 0.1);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(0.15);
      expect(r.jpyEquivalent).toBe(75_000); // 0.15 * 500000
    }
  });

  it('空文字で ng', () => {
    const r = validateTopupEthAmount('', 0.01, rate, 0.1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('ETH 額');
  });

  it('minBidEth 未満で ng (増額 branch 実行前に base validation で reject)', () => {
    const r = validateTopupEthAmount('0.005', 0.01, rate, 0.001);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('minimum bid');
  });
});

describe('FiatBidModal 増額 bid mode (Issue #3025 T10-T11、 Issue #3051 で ETH 入力軸に更新)', () => {
  it('existingFiatBid 存在時に「増額 bid」 modal 表示 (title / summary / submit label)', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 0.1, jpyAmount: 50_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });

    // modal data-mode="topup" に切替済
    const modal = screen.getByTestId('fiat-bid-modal');
    expect(modal.getAttribute('data-mode')).toBe('topup');

    // 既存 bid summary 表示 (ETH + JPY 換算 + authId)
    const summary = screen.getByTestId('fiat-topup-existing-bid-summary');
    expect(summary.textContent).toContain('0.1');
    expect(summary.textContent).toContain('50,000');
    expect(summary.textContent).toContain('auth-1');

    // submit button の label が「増額入札」 に切替 (ETH tab の「入札」 と揃えた語彙、 2026-07-23)
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.textContent).toContain('増額入札');

    // 通知 email 欄は増額 mode では非表示
    expect(screen.queryByTestId('fiat-bid-email-input')).toBeNull();
  });

  it('増額額 <= 旧 ethAmount 入力で validation エラー + submit disable', async () => {
    const topup = vi.fn();
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 0.1, jpyAmount: 50_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });

    // 旧 ethAmount と同額入力 (増額のみ受付なので ng)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '50000' } });

    await waitFor(() => {
      const err = screen.getByTestId('fiat-bid-jpy-error');
      expect(err.textContent).toContain('増額のみ受付可能');
    });

    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(topup).not.toHaveBeenCalled();
  });

  it('JPY 換算 > BID_LIMIT_JPY で validation エラー + submit disable', async () => {
    const topup = vi.fn();
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 1.0, jpyAmount: 500_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });

    // 2.001 ETH × 500,000 rate = 1,000,500 JPY (100 万円超過)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '1000500' } });

    await waitFor(() => {
      const err = screen.getByTestId('fiat-bid-jpy-error');
      expect(err.textContent).toContain('bid 上限');
    });

    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(topup).not.toHaveBeenCalled();
  });

  it('palette prop 未指定で data-palette="cool" が modal + form root に付与 (default)', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);
    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 0.1, jpyAmount: 50_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });
    const modal = screen.getByTestId('fiat-bid-modal');
    expect(modal.getAttribute('data-palette')).toBe('cool');
    const form = screen.getByTestId('fiat-bid-form');
    expect(form.getAttribute('data-palette')).toBe('cool');
  });

  it('palette="warm" で data-palette="warm" が modal + form root に付与', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);
    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        palette="warm"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 0.1, jpyAmount: 50_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });
    const modal = screen.getByTestId('fiat-bid-modal');
    expect(modal.getAttribute('data-palette')).toBe('warm');
    const form = screen.getByTestId('fiat-bid-form');
    expect(form.getAttribute('data-palette')).toBe('warm');
  });

  it('ETH input / submit button / cancel button に FiatBidForm CSS module class 付与', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);
    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary')).toBeInTheDocument();
    });
    expect(screen.getByTestId('fiat-bid-jpy-input').className).toMatch(/ethInput/);
    expect(screen.getByTestId('fiat-bid-submit').className).toMatch(/submitBtn/);
    expect(screen.getByTestId('fiat-bid-cancel').className).toMatch(/cancelBtn/);
  });

  it('submit で topup endpoint 呼出 + 5 phase stepper 表示 + cleanup disclaimer', async () => {
    const topup = vi.fn().mockResolvedValue(topupResponse);
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidModal
        open
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        existingFiatBid={{ authId: 'auth-1', ethAmount: 0.1, jpyAmount: 50_000 }}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn(), topup },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary').textContent).toContain('500,000');
    });

    // 増額額 0.16 ETH 入力 (旧 0.1 ETH より大、 500,000 rate で 80,000 JPY 換算)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '80000' } });

    // Terms check
    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));

    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(false);

    // submit → topup endpoint 呼出 (ETH primary + spotRate + jpyAmount 3 値送信)
    fireEvent.click(submit);

    await waitFor(() => {
      expect(topup).toHaveBeenCalledWith({
        authId: 'auth-1',
        newEthAmount: '160000000000000000', // 0.16 ETH = 1.6e17 wei
        newSpotRate: 500_000,
        newJpyAmount: 80_000,
        cardToken: 'tok_stub',
      });
    });

    // topup 応答後 stepper が「cleanup-queued」 phase に遷移 (endpoint 完了時点で 4 phase 完了扱い)
    await waitFor(() => {
      const stepper = screen.getByTestId('fiat-topup-stepper');
      expect(stepper.getAttribute('data-step')).toBe('cleanup-queued');
      expect(stepper.textContent).toContain('cleanup 中');
    });

    // cleanup disclaimer 表示
    const disclaimer = screen.getByTestId('fiat-topup-cleanup-disclaimer');
    expect(disclaimer.textContent).toContain('非同期');
    expect(disclaimer.textContent).toContain('別 tab');
  });
});
