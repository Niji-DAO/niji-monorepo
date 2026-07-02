/**
 * useSpotRate hook behavior test (Issue #3009 Phase D)
 *
 * (1) fetcher 応答で rate / source が hook state に反映
 * (2) fetcher 失敗で error が伝播
 * (3) jpyToEthWei / formatEthFromWei helper の丸め挙動
 */

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { formatEthFromWei, jpyToEthWei, useSpotRate, type SpotRate } from './useSpotRate';

const buildWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  Wrapper.displayName = 'UseSpotRateTestWrapper';
  return Wrapper;
};

describe('useSpotRate', () => {
  it('fetcher 応答で rate / source が state に反映', async () => {
    const mockRate: SpotRate = {
      rate: 500_000,
      source: 'gmo',
      cachedAt: '2026-07-01T00:00:00.000Z',
      expiresAt: '2026-07-01T00:00:05.000Z',
    };
    const fetcher = vi.fn().mockResolvedValue(mockRate);

    const { result } = renderHook(() => useSpotRate({ fetcher, refetchInterval: 0 }), {
      wrapper: buildWrapper(),
    });

    await waitFor(() => {
      expect(result.current.rate).toBe(500_000);
    });
    expect(result.current.source).toBe('gmo');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('fetcher 失敗で error が hook に伝播', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('spot rate 503'));

    const { result } = renderHook(() => useSpotRate({ fetcher, refetchInterval: 0 }), {
      wrapper: buildWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe('spot rate 503');
    });
    expect(result.current.rate).toBeUndefined();
  });

  it('enabled=false で fetcher を呼ばない', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      rate: 500_000,
      source: 'gmo' as const,
      cachedAt: '2026-07-01T00:00:00.000Z',
      expiresAt: '2026-07-01T00:00:05.000Z',
    });

    renderHook(() => useSpotRate({ fetcher, enabled: false, refetchInterval: 0 }), {
      wrapper: buildWrapper(),
    });

    // 少し待って呼ばれていないことを確認
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('jpyToEthWei', () => {
  it('JPY 500000 + rate 500000 = 1 ETH (1e18 wei)', () => {
    expect(jpyToEthWei(500_000, 500_000)).toBe(1_000_000_000_000_000_000n);
  });

  it('JPY 50000 + rate 500000 = 0.1 ETH', () => {
    expect(jpyToEthWei(50_000, 500_000)).toBe(100_000_000_000_000_000n);
  });

  it('invalid input (0 or negative) で 0n を返す', () => {
    expect(jpyToEthWei(0, 500_000)).toBe(0n);
    expect(jpyToEthWei(1_000_000, 0)).toBe(0n);
    expect(jpyToEthWei(-1, 500_000)).toBe(0n);
    expect(jpyToEthWei(Number.NaN, 500_000)).toBe(0n);
  });
});

describe('formatEthFromWei', () => {
  it('1 ETH は 1.0000 表示', () => {
    expect(formatEthFromWei(1_000_000_000_000_000_000n)).toBe('1.0000');
  });

  it('0.1 ETH は 0.1000 表示', () => {
    expect(formatEthFromWei(100_000_000_000_000_000n)).toBe('0.1000');
  });

  it('0 wei は 0.0000 表示', () => {
    expect(formatEthFromWei(0n)).toBe('0.0000');
  });
});
