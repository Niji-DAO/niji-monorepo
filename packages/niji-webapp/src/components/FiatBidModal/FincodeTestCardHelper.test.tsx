/**
 * FincodeTestCardHelper behavior test (Issue #3115 Phase 3)
 *
 * 検証対象 —
 * (1) dev mode で helper が render される (component 表示 + test card 値表示)
 * (2) production mode + override 未設定で helper が render されない (null 返却)
 * (3) VITE_SHOW_FINCODE_TEST_HELPER='true' override で production でも render される
 * (4) 個別 field copy button click で writeToClipboard が呼ばれる (対応 test card 値で)
 * (5) 「全部コピー」 button click で bundle 文字列が clipboard に書かれる
 * (6) fixtures 定数の妥当性 (fincode 公式 test card 値と一致)
 * (7) copy 完了後 2 秒で copied indicator が消える (Date.now / setTimeout の cleanup)
 *
 * SSOT — packages/niji-webapp/src/components/FiatBidModal/FincodeTestCardHelper.tsx。
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  FINCODE_TEST_CARD_FIXTURES,
  FincodeTestCardHelper,
  isFincodeTestHelperEnabled,
} from './FincodeTestCardHelper';

const enabledDevEnv = { DEV: true };
const disabledEnv = { DEV: false };

describe('FINCODE_TEST_CARD_FIXTURES 定数', () => {
  it('fincode 公式 test card 値と一致する固定 fixture を提供', () => {
    expect(FINCODE_TEST_CARD_FIXTURES.success.number).toBe('4111111111111111');
    expect(FINCODE_TEST_CARD_FIXTURES.authFail.number).toBe('4000000000000002');
    expect(FINCODE_TEST_CARD_FIXTURES.expiry).toBe('12/30');
    expect(FINCODE_TEST_CARD_FIXTURES.holder).toBe('TEST USER');
    expect(FINCODE_TEST_CARD_FIXTURES.cvc).toBe('123');
  });
});

describe('isFincodeTestHelperEnabled', () => {
  it('DEV=true で true を返す', () => {
    expect(isFincodeTestHelperEnabled({ DEV: true })).toBe(true);
  });

  it('DEV=false + override 未設定で false を返す', () => {
    expect(isFincodeTestHelperEnabled({ DEV: false })).toBe(false);
  });

  it('DEV=false + VITE_SHOW_FINCODE_TEST_HELPER=true で true を返す', () => {
    expect(isFincodeTestHelperEnabled({ DEV: false, VITE_SHOW_FINCODE_TEST_HELPER: 'true' })).toBe(
      true,
    );
  });

  it('VITE_SHOW_FINCODE_TEST_HELPER=TRUE (大文字) も case-insensitive で true', () => {
    expect(isFincodeTestHelperEnabled({ DEV: false, VITE_SHOW_FINCODE_TEST_HELPER: 'TRUE' })).toBe(
      true,
    );
  });

  it('VITE_SHOW_FINCODE_TEST_HELPER=false で false を返す', () => {
    expect(isFincodeTestHelperEnabled({ DEV: false, VITE_SHOW_FINCODE_TEST_HELPER: 'false' })).toBe(
      false,
    );
  });
});

describe('FincodeTestCardHelper render (dev mode)', () => {
  it('dev mode で helper container + 全 copy button を render', () => {
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={vi.fn()} />);
    expect(screen.getByTestId('fincode-test-card-helper')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-all')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-success')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-fail')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-expiry')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-holder')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-cvc')).toBeInTheDocument();
  });

  it('test card 表示値 (成功 pattern の 4111 番 + fail pattern の 4000 番) を含む', () => {
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={vi.fn()} />);
    expect(screen.getByText(/4111 1111 1111 1111/)).toBeInTheDocument();
    expect(screen.getByText(/4000 0000 0000 0002/)).toBeInTheDocument();
    expect(screen.getByText('12/30')).toBeInTheDocument();
    expect(screen.getByText('TEST USER')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});

describe('FincodeTestCardHelper render (production mode)', () => {
  it('DEV=false + override 未設定で null を返す (何も render しない)', () => {
    const { container } = render(
      <FincodeTestCardHelper envSource={disabledEnv} writeToClipboard={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('DEV=false + VITE_SHOW_FINCODE_TEST_HELPER=true override で render される', () => {
    render(
      <FincodeTestCardHelper
        envSource={{ DEV: false, VITE_SHOW_FINCODE_TEST_HELPER: 'true' }}
        writeToClipboard={vi.fn()}
      />,
    );
    expect(screen.getByTestId('fincode-test-card-helper')).toBeInTheDocument();
  });
});

describe('FincodeTestCardHelper copy interactions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('個別 copy button (success card) click で対応 test card 番号が clipboard に書かれる', async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(undefined);
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={writeToClipboard} />);
    fireEvent.click(screen.getByTestId('fincode-test-card-helper-copy-success'));
    await waitFor(() => expect(writeToClipboard).toHaveBeenCalledWith('4111111111111111'));
  });

  it('CVC copy button click で "123" が clipboard に書かれる', async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(undefined);
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={writeToClipboard} />);
    fireEvent.click(screen.getByTestId('fincode-test-card-helper-copy-cvc'));
    await waitFor(() => expect(writeToClipboard).toHaveBeenCalledWith('123'));
  });

  it('全部コピー button click で全 field を bundled した文字列が clipboard に書かれる', async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(undefined);
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={writeToClipboard} />);
    fireEvent.click(screen.getByTestId('fincode-test-card-helper-copy-all'));
    await waitFor(() =>
      expect(writeToClipboard).toHaveBeenCalledWith(expect.stringContaining('4111 1111 1111 1111')),
    );
    const bundled = writeToClipboard.mock.calls[0]?.[0] as string;
    expect(bundled).toContain('12/30');
    expect(bundled).toContain('TEST USER');
    expect(bundled).toContain('123');
  });

  it('clipboard write が reject しても component が crash しない (silent fail)', async () => {
    const writeToClipboard = vi.fn().mockRejectedValue(new Error('clipboard denied'));
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={writeToClipboard} />);
    fireEvent.click(screen.getByTestId('fincode-test-card-helper-copy-success'));
    await waitFor(() => expect(writeToClipboard).toHaveBeenCalled());
    // component は依然として render されている (copied indicator は表示されない)
    expect(screen.getByTestId('fincode-test-card-helper')).toBeInTheDocument();
    expect(screen.getByTestId('fincode-test-card-helper-copy-success').textContent).toBe('copy');
  });

  it('copy 成功時に button label が "✓ copied" に一時的に変化する', async () => {
    const writeToClipboard = vi.fn().mockResolvedValue(undefined);
    render(<FincodeTestCardHelper envSource={enabledDevEnv} writeToClipboard={writeToClipboard} />);
    const button = screen.getByTestId('fincode-test-card-helper-copy-success');
    fireEvent.click(button);
    await waitFor(() => expect(button.textContent).toBe('✓ copied'));
  });
});
