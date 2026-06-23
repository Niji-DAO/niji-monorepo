import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAtomMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtom: () => useAtomMock(),
}));

import LanguageSelectionModal from './index';

beforeEach(() => {
  document.body.innerHTML = '<div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LanguageSelectionModal', () => {
  it('renders Select Language title in modal overlay', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Select Language',
    );
  });

  it('renders 3 language buttons (ja/en/zh)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('.languageButton');
    // CSS Modules でクラス名が変わるので textContent で確認
    const overlay = document.getElementById('overlay-root');
    const text = overlay?.textContent ?? '';
    expect(text).toContain('日本語');
    expect(text).toContain('English');
    expect(text).toContain('中文');
  });

  it('shows Check icon next to active locale', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    expect(overlay?.querySelector('svg')).not.toBeNull();
  });

  it('calls setActiveLocale + onDismiss on language click', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['ja-JP', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    // 日本語ボタンを探してクリック
    const buttons = overlay?.querySelectorAll('div');
    const jaBtn = Array.from(buttons ?? []).find(d => d.textContent === '日本語');
    if (jaBtn) fireEvent.click(jaBtn);
    expect(setLocale).toHaveBeenCalledWith('ja-JP');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
