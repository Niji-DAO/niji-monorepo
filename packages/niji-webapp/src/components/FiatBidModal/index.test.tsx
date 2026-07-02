/**
 * FiatBidModal behavior test (Issue #3009 Phase D、 spec T13-T15)
 *
 * spec で要求される 3 挙動 —
 * (1) modal 開閉 + stepper 遷移 (T13)
 * (2) bid 上限 100 万円超過で validation エラー + submit disable (T14)
 * (3) Terms checkbox 未 check で submit disable (追加、 spec 完了条件 6 番)
 * (4) modal 内 submit で authorize 呼出 → step="three-ds" 遷移
 */

import type { AuthorizeResponse, PlaceBidResponse } from '@/hooks/useFiatBid';
import type { SpotRate } from '@/hooks/useSpotRate';

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { BID_LIMIT_JPY, FiatBidModal, validateJpyAmount } from './index';

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

describe('validateJpyAmount', () => {
  it('空文字で ng', () => {
    const r = validateJpyAmount('');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('JPY 額');
  });

  it('負数で ng', () => {
    const r = validateJpyAmount('-100');
    expect(r.ok).toBe(false);
  });

  it('BID_LIMIT_JPY 超過で ng', () => {
    const r = validateJpyAmount(`${BID_LIMIT_JPY + 1}`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('bid 上限');
  });

  it('BID_LIMIT_JPY ちょうどで ok', () => {
    const r = validateJpyAmount(`${BID_LIMIT_JPY}`);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(BID_LIMIT_JPY);
  });

  it('正常値で ok', () => {
    const r = validateJpyAmount('50000');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(50_000);
  });
});

describe('FiatBidModal 開閉 + submit → stepper 遷移 (T13、 T15)', () => {
  it('open=true で modal 描画、 JPY 入力 → Terms check → submit で authorize 呼出 + stepper 表示', async () => {
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
        generateCardToken={() => 'mock-tok-fixed'}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 取得が終わるまで待機
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-rate-summary').textContent).toContain('500,000');
    });

    // JPY 入力
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: '50000' } });

    // Terms 未 check なら submit disable
    const submit = screen.getByTestId('fiat-bid-submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    // Terms check
    const terms = screen.getByTestId('fiat-bid-terms-checkbox') as HTMLInputElement;
    fireEvent.click(terms);
    expect(submit.disabled).toBe(false);

    // submit
    fireEvent.click(submit);

    // authorize 呼出 + stepper 表示 + redirect
    await waitFor(() => {
      expect(authorize).toHaveBeenCalledWith({
        auctionId: '42',
        bidderWallet: '0xUSER',
        bidderEmail: undefined,
        jpyAmount: 50_000,
        cardToken: 'mock-tok-fixed',
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

describe('bid 上限超過 validation (T14)', () => {
  it('JPY 100 万円超過入力で validation エラー表示 + submit disable', async () => {
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

    const jpyInput = screen.getByTestId('fiat-bid-jpy-input') as HTMLInputElement;
    fireEvent.change(jpyInput, { target: { value: `${BID_LIMIT_JPY + 1}` } });

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
