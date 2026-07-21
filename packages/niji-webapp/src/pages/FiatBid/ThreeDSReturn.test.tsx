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

  // transactionId は GMO 経路の目印。 無い場合は fincode 経路として扱うため invalid にはしない
  // (fincode は tds2_ret_url に MD だけを付けて戻す)。 GMO の callback は呼ばれない。
  it('transactionId 無しは GMO callback を呼ばず fincode 経路に入る', async () => {
    const callbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const fincodeCallbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: '3ds-verified' as const,
    }));
    const placeBidFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'bid-placed' as const,
      txHash: '0xabc',
    }));

    renderWithQuery('?accessId=mock-access-1', {
      callbackFn,
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(fincodeCallbackFn).toHaveBeenCalledWith({ authId: 'mock-access-1' });
    });
    expect(callbackFn).not.toHaveBeenCalled();
  });

  it('authId が URL にも pending state にも無い場合は invalid 表示', async () => {
    const callbackFn = vi.fn();
    const fincodeCallbackFn = vi.fn();

    renderWithQuery('?result=success', {
      callbackFn,
      fincodeCallbackFn,
      loadState: vi.fn(() => null),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('不正なアクセスです')).toBeTruthy();
    });
    expect(callbackFn).not.toHaveBeenCalled();
    expect(fincodeCallbackFn).not.toHaveBeenCalled();
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

/**
 * fincode 経路の behavior test。
 *
 * fincode は tds2_ret_url に `MD` (= access_id) を付けて戻す。 認証が通っても与信は確定していないため、
 * page が 3ds-callback-fincode を呼んで与信を確定させ、 続けて place-bid まで進める必要がある。
 * この配線が無いと 3DS 必須カードで入札が成立しない。
 */
describe('ThreeDSReturn — fincode 経路', () => {
  const verified = {
    authId: 'mock-access-1',
    status: '3ds-verified' as const,
  };

  it('MD query から authId を取り、 認証成功後に place-bid まで進めて success 表示', async () => {
    const fincodeCallbackFn = vi.fn(async () => verified);
    const placeBidFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'bid-placed' as const,
      txHash: '0xTX',
    }));
    const clearState = vi.fn();

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState,
    });

    await waitFor(() => {
      expect(screen.getByText('認証が完了しました')).toBeTruthy();
    });
    expect(fincodeCallbackFn).toHaveBeenCalledWith({ authId: 'mock-access-1' });
    // bidderWallet は pending state から復元して渡す (backend 必須 field、 欠落で 400)
    expect(placeBidFn).toHaveBeenCalledWith({
      authId: 'mock-access-1',
      bidderWallet: '0x123',
    });
    expect(clearState).toHaveBeenCalled();
  });

  it('チャレンジ認証が必要なら challengeUrl に遷移し pending state を消さない', async () => {
    const fincodeCallbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'challenge-required' as const,
      challengeUrl: 'https://acs.example/challenge',
    }));
    const placeBidFn = vi.fn();
    const clearState = vi.fn();
    const redirect = vi.fn();

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState,
      redirect,
    });

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('https://acs.example/challenge');
    });
    // challenge から戻って再開するので state を残す
    expect(clearState).not.toHaveBeenCalled();
    expect(placeBidFn).not.toHaveBeenCalled();
  });

  it('retry=1 は callback に retry を立てて結果を取り直す (challenge 復帰経路)', async () => {
    const fincodeCallbackFn = vi.fn(async () => verified);
    const placeBidFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'bid-placed' as const,
      txHash: '0xTX',
    }));

    renderWithQuery('?MD=mock-access-1&retry=1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(fincodeCallbackFn).toHaveBeenCalledWith({ authId: 'mock-access-1', retry: true });
    });
  });

  it('認証拒否は place-bid を呼ばず理由付きで failure 表示', async () => {
    const fincodeCallbackFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'cancelled' as const,
      reason: 'issuer rejected',
    }));
    const placeBidFn = vi.fn();

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeTruthy();
    });
    expect(screen.getByText(/issuer rejected/)).toBeTruthy();
    expect(placeBidFn).not.toHaveBeenCalled();
  });

  it('bidderWallet を復元できない場合は place-bid を呼ばず failure 表示 (400 を出しに行かない)', async () => {
    const fincodeCallbackFn = vi.fn(async () => verified);
    const placeBidFn = vi.fn();

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => ({ ...mockPending, bidderWallet: '' })),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeTruthy();
    });
    expect(placeBidFn).not.toHaveBeenCalled();
  });

  it('place-bid が cancelled を返したら message 付きで failure 表示', async () => {
    const fincodeCallbackFn = vi.fn(async () => verified);
    const placeBidFn = vi.fn(async () => ({
      authId: 'mock-access-1',
      status: 'cancelled' as const,
      txHash: null,
      message: '最低入札額を下回っています',
    }));

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn,
      loadState: vi.fn(() => mockPending),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('最低入札額を下回っています')).toBeTruthy();
    });
  });

  it('callback が throw したら failure に落ちて message を出す', async () => {
    const fincodeCallbackFn = vi.fn(async () => {
      throw new Error('3ds callback failed: ThreeDsAuthFailed');
    });

    renderWithQuery('?MD=mock-access-1', {
      fincodeCallbackFn,
      placeBidFn: vi.fn(),
      loadState: vi.fn(() => mockPending),
      clearState: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText(/ThreeDsAuthFailed/)).toBeTruthy();
    });
  });
});
