/**
 * useFiatBid hook behavior test (Issue #3009 Phase D)
 *
 * (1) authorize 成功で step = "three-ds"、 saveState + redirect 呼出
 * (2) authorize 失敗で step = "failure" + errorMessage 設定
 * (3) placeBid 成功で step = "success"、 placeBid.status = "cancelled" で step = "failure"
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFiatBid } from './useFiatBid';

describe('useFiatBid.authorize', () => {
  it('authorize 成功で step = "three-ds"、 saveState + redirect が呼ばれる', async () => {
    const authorize = vi.fn().mockResolvedValue({
      authId: 'auth-1',
      tds2Url: 'https://3ds.example/redirect',
      jpyAmount: 50_000,
      ethAmount: '100000000000000000',
      spotRate: 500_000,
      spotRateSource: 'gmo' as const,
    });
    const placeBid = vi.fn();
    const saveState = vi.fn();
    const redirect = vi.fn();

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: { authorize, placeBid },
        saveState,
        redirect,
      }),
    );

    expect(result.current.step).toBe('idle');

    await act(async () => {
      await result.current.authorize({
        auctionId: '42',
        bidderWallet: '0xUSER',
        jpyAmount: 50_000,
        cardToken: 'mock-tok-123',
      });
    });

    expect(result.current.step).toBe('three-ds');
    expect(authorize).toHaveBeenCalledOnce();
    expect(saveState).toHaveBeenCalledWith({
      authId: 'auth-1',
      auctionId: '42',
      jpyAmount: 50_000,
      bidderWallet: '0xUSER',
      spotRate: 500_000,
      ethAmount: '100000000000000000',
    });
    expect(redirect).toHaveBeenCalledWith('https://3ds.example/redirect');
  });

  it('authorize 失敗で step = "failure"、 errorMessage 設定', async () => {
    const authorize = vi.fn().mockRejectedValue(new Error('BidLimitExceeded'));
    const placeBid = vi.fn();
    const saveState = vi.fn();
    const redirect = vi.fn();

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: { authorize, placeBid },
        saveState,
        redirect,
      }),
    );

    await act(async () => {
      await result.current.authorize({
        auctionId: '42',
        bidderWallet: '0xUSER',
        jpyAmount: 2_000_000,
        cardToken: 'mock-tok-123',
      });
    });

    await waitFor(() => {
      expect(result.current.step).toBe('failure');
    });
    expect(result.current.errorMessage).toBe('BidLimitExceeded');
    expect(saveState).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('useFiatBid.placeBid', () => {
  it('placeBid 成功で step = "success"、 placeBidResult 保持', async () => {
    const placeBid = vi.fn().mockResolvedValue({
      authId: 'auth-1',
      status: 'bid-placed' as const,
      txHash: '0xTXHASH',
      message: 'bid tx を broadcast しました。',
    });

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: {
          authorize: vi.fn(),
          placeBid,
        },
      }),
    );

    await act(async () => {
      await result.current.placeBid('auth-1');
    });

    expect(result.current.step).toBe('success');
    expect(result.current.placeBidResult?.txHash).toBe('0xTXHASH');
  });

  it('placeBid status = "cancelled" で step = "failure"、 message を errorMessage に設定', async () => {
    const placeBid = vi.fn().mockResolvedValue({
      authId: 'auth-1',
      status: 'cancelled' as const,
      txHash: null,
      message: '他の入札者に上乗せされました。',
    });

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: {
          authorize: vi.fn(),
          placeBid,
        },
      }),
    );

    await act(async () => {
      await result.current.placeBid('auth-1');
    });

    expect(result.current.step).toBe('failure');
    expect(result.current.errorMessage).toBe('他の入札者に上乗せされました。');
  });

  it('placeBid で例外 throw で step = "failure"、 error 内容 errorMessage', async () => {
    const placeBid = vi.fn().mockRejectedValue(new Error('network fail'));

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: {
          authorize: vi.fn(),
          placeBid,
        },
      }),
    );

    await act(async () => {
      await result.current.placeBid('auth-1');
    });

    expect(result.current.step).toBe('failure');
    expect(result.current.errorMessage).toBe('network fail');
  });
});

describe('useFiatBid.reset', () => {
  it('reset で step = "idle"、 各 state 初期化', async () => {
    const authorize = vi.fn().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useFiatBid({
        fetchers: { authorize, placeBid: vi.fn() },
        saveState: vi.fn(),
        redirect: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.authorize({
        auctionId: '42',
        bidderWallet: '0xUSER',
        jpyAmount: 50_000,
        cardToken: 'mock-tok',
      });
    });
    expect(result.current.step).toBe('failure');

    act(() => {
      result.current.reset();
    });
    expect(result.current.step).toBe('idle');
    expect(result.current.errorMessage).toBeUndefined();
  });
});
