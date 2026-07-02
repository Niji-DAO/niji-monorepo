/**
 * ThreeDSReturn behavior test (Issue #3007)
 *
 * 検証対象 —
 * (1) URL query = result=success で callback 呼出 + state="3ds-verified" 応答 → "認証が完了しました" 表示
 * (2) URL query = result=fail で callback 呼出 + state="cancelled" 応答 → "認証に失敗しました" 表示
 * (3) URL query が欠損 (transactionId 無し / result 無し / accessId 無し) → "不正なアクセスです" 表示
 * (4) callback API が throw した時 → "認証に失敗しました" + error message 表示
 * (5) pending state 復元経路 = URL query に accessId 無くても localStorage の authId で fallback
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠。
 */

import type { FiatBidPendingState } from './ThreeDSRedirect';

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ThreeDSReturn } from './ThreeDSReturn';

const mockPending: FiatBidPendingState = {
  authId: 'mock-access-1',
  auctionId: '42',
  jpyAmount: 100000,
  bidderWallet: '0x123',
  spotRate: 500000,
  ethAmount: '200000000000000000',
};

const renderWithQuery = (query: string, props: Parameters<typeof ThreeDSReturn>[0]) => {
  return render(
    <MemoryRouter initialEntries={[`/fiat-bid/3ds-return${query}`]}>
      <Routes>
        <Route path="/fiat-bid/3ds-return" element={<ThreeDSReturn {...props} />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ThreeDSReturn', () => {
  it('success 経路 = callback 応答 3ds-verified で "認証が完了しました" 表示、 clearState 呼出', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const clearState = vi.fn();
    const loadState = vi.fn(() => mockPending);

    renderWithQuery('?result=success&transactionId=tds2-tran-9&accessId=mock-access-1', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('認証が完了しました')).toBeTruthy();
    });
    expect(callbackFn).toHaveBeenCalledWith({
      authId: 'mock-access-1',
      transactionId: 'tds2-tran-9',
      result: 'success',
    });
    expect(clearState).toHaveBeenCalled();
  });

  it('fail 経路 = callback 応答 cancelled で "認証に失敗しました" 表示', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'cancelled' as const,
    }));
    const loadState = vi.fn(() => mockPending);
    const clearState = vi.fn();

    renderWithQuery('?result=fail&transactionId=tds2-tran-9&accessId=mock-access-1', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeTruthy();
    });
    expect(callbackFn).toHaveBeenCalledWith({
      authId: 'mock-access-1',
      transactionId: 'tds2-tran-9',
      result: 'fail',
    });
    expect(clearState).toHaveBeenCalled();
  });

  it('必須 URL query 欠損時 (transactionId 無し) は callback 呼ばず "不正なアクセスです" 表示', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const loadState = vi.fn(() => mockPending);
    const clearState = vi.fn();

    renderWithQuery('?result=success&accessId=mock-access-1', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('不正なアクセスです')).toBeTruthy();
    });
    expect(callbackFn).not.toHaveBeenCalled();
    expect(clearState).not.toHaveBeenCalled();
  });

  it('result enum 外 (timeout) は callback 呼ばず invalid 表示', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const loadState = vi.fn(() => mockPending);
    const clearState = vi.fn();

    renderWithQuery('?result=timeout&transactionId=tds2-tran-9&accessId=mock-access-1', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('不正なアクセスです')).toBeTruthy();
    });
    expect(callbackFn).not.toHaveBeenCalled();
  });

  it('callback API throw で failure 表示 + error message 表示', async () => {
    const callbackFn = vi.fn(async () => {
      throw new Error('DB unreachable');
    });
    const loadState = vi.fn(() => mockPending);
    const clearState = vi.fn();

    renderWithQuery('?result=success&transactionId=tds2-tran-9&accessId=mock-access-1', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeTruthy();
    });
    expect(screen.getByText(/DB unreachable/)).toBeTruthy();
    expect(clearState).not.toHaveBeenCalled();
  });

  it('URL query に accessId 無くても localStorage 保存済 authId で fallback して callback 呼出', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const loadState = vi.fn(() => mockPending);
    const clearState = vi.fn();

    renderWithQuery('?result=success&transactionId=tds2-tran-9', {
      callbackFn,
      loadState,
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('認証が完了しました')).toBeTruthy();
    });
    expect(callbackFn).toHaveBeenCalledWith({
      authId: 'mock-access-1',
      transactionId: 'tds2-tran-9',
      result: 'success',
    });
  });
});
