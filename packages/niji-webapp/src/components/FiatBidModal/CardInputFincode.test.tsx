/**
 * CardInputFincode unit test (Issue #3121)。
 *
 * @fincode/js を module mock、 initFincode / getCardToken の呼出 shape + ref.getToken() の
 * token 返却 + VITE_FINCODE_PUBLIC_KEY 未設定時 error state の 3 経路を検証する。
 * 実 fincode iframe は jsdom で mount 不可のため、 mount() は spy で呼出確認のみ。
 */
import { createRef } from 'react';

import { render, act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CardInputFincode, type CardInputFincodeHandle } from './CardInputFincode';

const initFincodeMock = vi.fn();
const getCardTokenMock = vi.fn();
const uiCreateMock = vi.fn();
const uiMountMock = vi.fn();

vi.mock('@fincode/js', () => ({
  initFincode: (args: unknown) => initFincodeMock(args),
  getCardToken: (args: unknown) => getCardTokenMock(args),
}));

const makeFincodeInstance = () => ({
  ui: () => ({
    create: uiCreateMock,
    mount: uiMountMock,
    getFormData: vi.fn(),
  }),
});

describe('CardInputFincode', () => {
  const originalKey = import.meta.env.VITE_FINCODE_PUBLIC_KEY;

  beforeEach(() => {
    initFincodeMock.mockReset();
    getCardTokenMock.mockReset();
    uiCreateMock.mockReset();
    uiMountMock.mockReset();
    import.meta.env.VITE_FINCODE_PUBLIC_KEY = 'p_test_dummy';
    // window.Fincode を pre-set して preloadFincodeScript の早期 resolve 経路を通す (unit test で
    // 実 CDN fetch を発生させないため)。
    (window as unknown as { Fincode: (key: string) => unknown }).Fincode = () => ({});
  });

  afterEach(() => {
    import.meta.env.VITE_FINCODE_PUBLIC_KEY = originalKey;
  });

  it('publicKey 設定時に initFincode + ui.create + ui.mount が正しい引数で呼ばれる', async () => {
    initFincodeMock.mockResolvedValue(makeFincodeInstance());
    render(<CardInputFincode />);
    await waitFor(() => expect(initFincodeMock).toHaveBeenCalledTimes(1));
    expect(initFincodeMock).toHaveBeenCalledWith({
      publicKey: 'p_test_dummy',
      isLiveMode: false,
    });
    await waitFor(() => expect(uiMountMock).toHaveBeenCalledTimes(1));
    // appearance は色 / font 等の見た目値を多数含むため exact match にしない。
    // 意味を持つ 4 点 (token 発行 mode / 縦並び / auction bid に不要な field の非表示 / 日本語 label) だけを固定し、
    // 配色調整のたびに test が落ちる状態を避ける。
    expect(uiCreateMock).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        layout: 'vertical',
        hideHolderName: true,
        hidePayTimes: true,
        labelCardNo: 'カード番号',
        labelExpire: '有効期限',
        labelCVC: 'セキュリティコード',
      }),
    );
    expect(uiMountMock).toHaveBeenCalledWith('niji-fincode-card-mount', '100%');
  });

  it('ready 完了で onReadyChange(true) が呼ばれる', async () => {
    initFincodeMock.mockResolvedValue(makeFincodeInstance());
    const onReadyChange = vi.fn();
    render(<CardInputFincode onReadyChange={onReadyChange} />);
    await waitFor(() => expect(onReadyChange).toHaveBeenCalledWith(true));
  });

  it('ref.current.getToken() が fincode getCardToken の token を返す', async () => {
    initFincodeMock.mockResolvedValue(makeFincodeInstance());
    getCardTokenMock.mockResolvedValue({ list: [{ token: 'tok_test_abc123' }] });
    // eslint-disable-next-line @eslint-react/no-create-ref
    const ref = createRef<CardInputFincodeHandle>();
    render(<CardInputFincode ref={ref} />);
    await waitFor(() => expect(uiMountMock).toHaveBeenCalled());
    const token = await act(async () => await ref.current!.getToken());
    expect(token).toBe('tok_test_abc123');
    expect(getCardTokenMock).toHaveBeenCalledTimes(1);
  });

  it('getCardToken response に token 欠落時は throw する', async () => {
    initFincodeMock.mockResolvedValue(makeFincodeInstance());
    getCardTokenMock.mockResolvedValue({ list: [] });
    // eslint-disable-next-line @eslint-react/no-create-ref
    const ref = createRef<CardInputFincodeHandle>();
    render(<CardInputFincode ref={ref} />);
    await waitFor(() => expect(uiMountMock).toHaveBeenCalled());
    await expect(ref.current!.getToken()).rejects.toThrow(
      'fincode getCardToken response に token が含まれていません',
    );
  });

  it('publicKey 未設定時は initFincode 呼ばず error message 表示 + onReadyChange(false)', async () => {
    import.meta.env.VITE_FINCODE_PUBLIC_KEY = '';
    const onReadyChange = vi.fn();
    const { getByTestId } = render(<CardInputFincode onReadyChange={onReadyChange} />);
    await waitFor(() => expect(onReadyChange).toHaveBeenCalledWith(false));
    expect(initFincodeMock).not.toHaveBeenCalled();
    expect(getByTestId('card-input-fincode-error').textContent).toContain(
      'VITE_FINCODE_PUBLIC_KEY 未設定',
    );
  });

  it('initFincode reject 時は error state 表示 + onReadyChange(false)', async () => {
    initFincodeMock.mockRejectedValue(new Error('network fail'));
    const onReadyChange = vi.fn();
    const { getByTestId } = render(<CardInputFincode onReadyChange={onReadyChange} />);
    await waitFor(() =>
      expect(getByTestId('card-input-fincode-error').textContent).toContain('network fail'),
    );
    expect(onReadyChange).toHaveBeenCalledWith(false);
  });

  it('mount target element が data-testid で render される', async () => {
    initFincodeMock.mockResolvedValue(makeFincodeInstance());
    const { getByTestId } = render(<CardInputFincode />);
    const mountEl = getByTestId('card-input-fincode-mount');
    expect(mountEl.id).toBe('niji-fincode-card-mount');
  });
});
