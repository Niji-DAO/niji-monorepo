/**
 * FiatBidForm behavior test (Issue #3053、 決済 UI 磨き込み 3 fix)
 *
 * Phase B — spot rate 取得中の spinner + 「取得中」 表示検証。
 * spot rate 未取得 (rate === undefined) 状態で、
 * (1) 現在 spot rate 欄に spinner + 「取得中」 表示
 * (2) JPY 換算欄に spinner + 「取得中」 表示
 * (3) rateSummary root に aria-busy="true" が付与される
 *
 * Phase A の 2 column card layout は CSS module 経路の変更 (visual)、
 * 挙動 test で覆う対象は「取得済 branch で spot rate 値 + JPY 換算値が
 * それぞれ rateSummaryValue class 系 element に表示される」 の 1 点。
 */

import type { SpotRate } from '@/hooks/useSpotRate';

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { FiatBidForm } from './FiatBidForm';

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
  Wrapper.displayName = 'FiatBidFormTestWrapper';
  return Wrapper;
};

const successRate: SpotRate = {
  rate: 500_000,
  source: 'gmo',
  cachedAt: '2026-07-01T00:00:00.000Z',
  expiresAt: '2026-07-01T00:00:05.000Z',
};

describe('FiatBidForm loading spinner (Issue #3053 Phase B)', () => {
  it('spot rate 未取得時に「現在 spot rate」 + 「JPY 換算」 両欄で spinner + 「取得中」 表示', () => {
    // spot rate fetcher = pending Promise (never resolve) で undefined 保持
    const pendingFetcher = vi.fn(() => new Promise<SpotRate>(() => {}));

    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: pendingFetcher, refetchInterval: 0 }}
        isDev={true}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 欄の spinner + 「取得中」
    const rateLoading = screen.getByTestId('fiat-bid-rate-summary-loading');
    expect(rateLoading).toBeInTheDocument();
    expect(rateLoading.textContent).toContain('取得中');

    // JPY 換算欄の spinner + 「取得中」
    const jpyLoading = screen.getByTestId('fiat-bid-jpy-display-loading');
    expect(jpyLoading).toBeInTheDocument();
    expect(jpyLoading.textContent).toContain('取得中');

    // rateSummary root に aria-busy="true" 付与 (screen reader 対応)
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.getAttribute('aria-busy')).toBe('true');
  });

  it('spot rate 取得後は spinner 非表示、 spot rate 値 + source が rateSummaryValue で表示', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
        isDev={true}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 取得完了まで待機
    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    // rateSummary root の aria-busy="false" (取得完了 state)
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.getAttribute('aria-busy')).toBe('false');

    // 現在 spot rate 表示 (500,000 JPY / ETH)
    expect(rateSummary.textContent).toContain('500,000');
    expect(rateSummary.textContent).toContain('JPY / ETH');
    // source 表示
    expect(rateSummary.textContent).toContain('source: gmo');

    // JPY 換算欄 (ETH 未入力 state = 「—」 表示、 spinner 非表示)
    expect(screen.queryByTestId('fiat-bid-jpy-display-loading')).toBeNull();
    const jpyDisplay = screen.getByTestId('fiat-bid-jpy-display');
    expect(jpyDisplay).toBeInTheDocument();
    expect(jpyDisplay.textContent).toContain('—');
  });
});
