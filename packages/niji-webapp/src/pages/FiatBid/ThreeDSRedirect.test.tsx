/**
 * ThreeDSRedirect behavior test (Issue #3007)
 *
 * 検証対象 —
 * (1) URL query 揃うと redirect + localStorage 保存が発生する
 * (2) 必須 param 欠損時は redirect も保存も呼ばない
 * (3) jpyAmount 非数値時は redirect も保存も呼ばない
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠。
 */

import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ThreeDSRedirect, FIAT_BID_STATE_KEY } from './ThreeDSRedirect';

const renderWithQuery = (query: string, props: Parameters<typeof ThreeDSRedirect>[0]) => {
  return render(
    <MemoryRouter initialEntries={[`/fiat-bid/3ds-redirect${query}`]}>
      <Routes>
        <Route path="/fiat-bid/3ds-redirect" element={<ThreeDSRedirect {...props} />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('ThreeDSRedirect', () => {
  it('URL query が全て揃うと redirect + saveState が呼ばれる', () => {
    const redirect = vi.fn();
    const saveState = vi.fn();
    const query =
      '?tds2Url=http%3A%2F%2Fmock%2F3ds&authId=mock-access-1&auctionId=42&jpyAmount=100000' +
      '&bidderWallet=0x123&spotRate=500000&ethAmount=200000000000000000';

    renderWithQuery(query, { redirect, saveState });

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('http://mock/3ds');

    expect(saveState).toHaveBeenCalledTimes(1);
    expect(saveState).toHaveBeenCalledWith({
      authId: 'mock-access-1',
      auctionId: '42',
      jpyAmount: 100000,
      bidderWallet: '0x123',
      spotRate: 500000,
      ethAmount: '200000000000000000',
    });
  });

  it('tds2Url 欠損時は redirect / saveState 呼ばれない', () => {
    const redirect = vi.fn();
    const saveState = vi.fn();
    renderWithQuery('?authId=mock-access-1&auctionId=42&jpyAmount=100000&bidderWallet=0x123', {
      redirect,
      saveState,
    });
    expect(redirect).not.toHaveBeenCalled();
    expect(saveState).not.toHaveBeenCalled();
  });

  it('jpyAmount 非数値時は redirect / saveState 呼ばれない', () => {
    const redirect = vi.fn();
    const saveState = vi.fn();
    renderWithQuery(
      '?tds2Url=http%3A%2F%2Fmock%2F3ds&authId=mock-access-1&auctionId=42&jpyAmount=abc&bidderWallet=0x123',
      { redirect, saveState },
    );
    expect(redirect).not.toHaveBeenCalled();
    expect(saveState).not.toHaveBeenCalled();
  });

  it('default saveState は localStorage に FIAT_BID_STATE_KEY で書込む', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const redirect = vi.fn();
    const query =
      '?tds2Url=http%3A%2F%2Fmock%2F3ds&authId=mock-access-1&auctionId=42&jpyAmount=100000' +
      '&bidderWallet=0x123&spotRate=500000&ethAmount=200000000000000000';

    renderWithQuery(query, { redirect });

    // localStorage.setItem が FIAT_BID_STATE_KEY で呼ばれた
    const call = setItemSpy.mock.calls.find(c => c[0] === FIAT_BID_STATE_KEY);
    expect(call).toBeDefined();
    const saved = JSON.parse(call![1] as string) as { authId: string; auctionId: string };
    expect(saved.authId).toBe('mock-access-1');
    expect(saved.auctionId).toBe('42');
    setItemSpy.mockRestore();
  });
});
