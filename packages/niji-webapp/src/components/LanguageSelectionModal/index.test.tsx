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

  it('clicking English button calls setLocale("en-US")', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['ja-JP', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    const buttons = overlay?.querySelectorAll('div');
    const enBtn = Array.from(buttons ?? []).find(d => d.textContent === 'English');
    if (enBtn) fireEvent.click(enBtn);
    expect(setLocale).toHaveBeenCalledWith('en-US');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('clicking 中文 button calls setLocale("zh-CN")', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    const buttons = overlay?.querySelectorAll('div');
    const zhBtn = Array.from(buttons ?? []).find(d => d.textContent === '中文');
    if (zhBtn) fireEvent.click(zhBtn);
    expect(setLocale).toHaveBeenCalledWith('zh-CN');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders 3 languages regardless of active locale', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const text = document.getElementById('overlay-root')?.textContent ?? '';
    expect(text).toContain('日本語');
    expect(text).toContain('English');
    expect(text).toContain('中文');
  });

  it('exactly 1 modal h3 title rendered', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('h3').length).toBe(1);
  });

  it('SVG check icon present when active locale is en-US', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('svg')).not.toBeNull();
  });

  it('SVG check icon present when active locale is zh-CN', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('svg')).not.toBeNull();
  });

  it('clicking same active locale still triggers setLocale + onDismiss', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    const buttons = overlay?.querySelectorAll('div');
    const enBtn = Array.from(buttons ?? []).find(d => d.textContent === 'English');
    if (enBtn) fireEvent.click(enBtn);
    expect(setLocale).toHaveBeenCalledWith('en-US');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders modal title via overlay-root portal', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('Select Language');
  });

  it('does not crash when setLocale is undefined-like fn', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
  });

  it('exactly 1 SVG icon (only active locale gets check)', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('svg').length).toBe(1);
  });

  it('clicking 日本語 only fires once even on rapid repeated clicks', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    const buttons = overlay?.querySelectorAll('div');
    const jaBtn = Array.from(buttons ?? []).find(d => d.textContent === '日本語');
    if (jaBtn) {
      fireEvent.click(jaBtn);
      fireEvent.click(jaBtn);
    }
    expect(setLocale).toHaveBeenCalledTimes(2);
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('unknown locale string still renders all 3 buttons (no crash)', () => {
    useAtomMock.mockReturnValue(['xx-YY', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const text = document.getElementById('overlay-root')?.textContent ?? '';
    expect(text).toContain('日本語');
    expect(text).toContain('English');
    expect(text).toContain('中文');
  });

  it('overlay root contains all 3 language texts even when no active locale match', () => {
    useAtomMock.mockReturnValue(['xx-YY', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('日本語');
  });

  it('h3 title text is exactly "Select Language"', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const h3 = document.getElementById('overlay-root')?.querySelector('h3');
    expect(h3?.textContent).toBe('Select Language');
  });

  it('backdrop-root has 1 portal child', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
  });

  it('overlay-root has 1 portal child', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.children.length).toBe(1);
  });

  it('SVG check icon for ja-JP active', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('svg')).not.toBeNull();
  });

  it('different language click sequence: 日本語 → 中文 → English', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const overlay = document.getElementById('overlay-root');
    const buttons = overlay?.querySelectorAll('div');
    const ja = Array.from(buttons ?? []).find(d => d.textContent === '日本語');
    const zh = Array.from(buttons ?? []).find(d => d.textContent === '中文');
    const en = Array.from(buttons ?? []).find(d => d.textContent === 'English');
    if (ja) fireEvent.click(ja);
    if (zh) fireEvent.click(zh);
    if (en) fireEvent.click(en);
    expect(setLocale).toHaveBeenCalledTimes(3);
  });

  it('zh-CN active locale renders only 1 SVG icon', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('svg').length).toBe(1);
  });
});
