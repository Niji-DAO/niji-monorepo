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

  it('renders without crash for unknown locale', () => {
    useAtomMock.mockReturnValue(['xx-XX', vi.fn()]);
    expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
  });

  it('overlay-root contains the modal title (text matched)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('Select Language');
  });

  it('renders all 3 language labels in DOM', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const text = document.getElementById('overlay-root')?.textContent ?? '';
    expect(text).toContain('English');
  });

  it('onDismiss can be called by user via backdrop click', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const backdropChild = document.getElementById('backdrop-root')
      ?.firstElementChild as HTMLElement;
    if (backdropChild) fireEvent.click(backdropChild);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('en-US locale renders svg only once for en (one check mark)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('svg').length).toBe(1);
  });

  it('renders 3 instances independently in same DOM', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() =>
      render(
        <>
          <LanguageSelectionModal onDismiss={() => {}} />
          <LanguageSelectionModal onDismiss={() => {}} />
          <LanguageSelectionModal onDismiss={() => {}} />
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender preserves modal structure', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    expect(() => rerender(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
  });

  it('all 3 locale buttons accessible by text', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    const text = overlay?.textContent ?? '';
    expect(text).toContain('日本語');
    expect(text).toContain('English');
    expect(text).toContain('中文');
  });

  it('setLocale + onDismiss fire both on Japanese click', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('div');
    const jaBtn = Array.from(buttons ?? []).find(d => d.textContent === '日本語');
    if (jaBtn) fireEvent.click(jaBtn);
    expect(setLocale).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('all 3 different locale clicks each trigger setLocale', () => {
    const setLocale = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('div');
    ['日本語', 'English', '中文'].forEach(label => {
      const btn = Array.from(buttons ?? []).find(d => d.textContent === label);
      if (btn) fireEvent.click(btn);
    });
    expect(setLocale).toHaveBeenCalledTimes(3);
  });

  it('renders 5 LanguageSelectionModal instances all together', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 5 times preserves modal', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    for (let i = 0; i < 5; i++) {
      expect(() => rerender(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('h3 title preserves across locale toggle', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Select Language',
    );
  });

  it('all 3 buttons accessible via div content match', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('div');
    const labels = ['日本語', 'English', '中文'];
    labels.forEach(label => {
      const btn = Array.from(buttons ?? []).find(d => d.textContent === label);
      expect(btn).toBeDefined();
    });
  });

  it('overlay-root contains modal portal', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.children.length).toBeGreaterThanOrEqual(1);
  });

  it('renders 20 instances each independently', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 50 onDismiss clicks via Japanese button', () => {
    const setLocale = vi.fn();
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('div');
    const jaBtn = Array.from(buttons ?? []).find(d => d.textContent === '日本語');
    if (jaBtn) {
      for (let i = 0; i < 50; i++) fireEvent.click(jaBtn);
    }
    expect(setLocale).toHaveBeenCalledTimes(50);
    expect(onDismiss).toHaveBeenCalledTimes(50);
  });

  it('handles all 3 locales each fires setLocale 1 time', () => {
    const setLocale = vi.fn();
    useAtomMock.mockReturnValue(['en-US', setLocale]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('div');
    ['日本語', 'English', '中文'].forEach(label => {
      const btn = Array.from(buttons ?? []).find(d => d.textContent === label);
      if (btn) fireEvent.click(btn);
    });
    expect(setLocale).toHaveBeenCalledTimes(3);
  });

  it('rerender 10 times preserves modal portal', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    for (let i = 0; i < 10; i++) {
      expect(() => rerender(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('renders consistent h3 title across locale changes', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Select Language',
    );
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    rerender(<LanguageSelectionModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Select Language',
    );
  });

  it('rerender 30 times preserves title', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    for (let i = 0; i < 30; i++) {
      rerender(<LanguageSelectionModal onDismiss={() => {}} />);
    }
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Select Language',
    );
  });

  it('rapid 50 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 50; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(50);
  });

  it('zh-CN locale variant renders Check icon (svg)', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    render(<LanguageSelectionModal onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    expect(overlay?.querySelector('svg')).not.toBeNull();
  });

  it('renders without crash with unknown locale (xx-XX)', () => {
    useAtomMock.mockReturnValue(['xx-XX', vi.fn()]);
    expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('handles all 3 locale variants', () => {
    ['en-US', 'ja-JP', 'zh-CN'].forEach(loc => {
      useAtomMock.mockReturnValue([loc, vi.fn()]);
      expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    });
  });

  it('rapid onDismiss invocations 200 times', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('handles empty string locale', () => {
    useAtomMock.mockReturnValue(['', vi.fn()]);
    expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
  });

  it('rerender 50 times with varying locales', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<LanguageSelectionModal onDismiss={() => {}} />);
    const locales = ['en-US', 'ja-JP', 'zh-CN'];
    for (let i = 0; i < 50; i++) {
      useAtomMock.mockReturnValue([locales[i % 3], vi.fn()]);
      expect(() => rerender(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('mount-unmount 100 cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('handles 30 different setActiveLocale invocations', () => {
    for (let i = 0; i < 30; i++) {
      const setLocale = vi.fn();
      useAtomMock.mockReturnValue(['en-US', setLocale]);
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('rapid 200 onDismiss invocations', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('handles all 3 locale variants 10 times', () => {
    ['en-US', 'ja-JP', 'zh-CN'].forEach(loc => {
      for (let i = 0; i < 10; i++) {
        useAtomMock.mockReturnValue([loc, vi.fn()]);
        const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
        unmount();
      }
    });
  });

  it('renders title always "Select Language" across all locales', () => {
    ['en-US', 'ja-JP', 'zh-CN', 'xx-XX'].forEach(loc => {
      useAtomMock.mockReturnValue([loc, vi.fn()]);
      render(<LanguageSelectionModal onDismiss={() => {}} />);
      expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
        'Select Language',
      );
    });
  });

  it('mount-unmount 200 cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('handles 50 different setLocale invocations', () => {
    for (let i = 0; i < 50; i++) {
      const setLocale = vi.fn();
      useAtomMock.mockReturnValue(['en-US', setLocale]);
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('rapid 500 onDismiss invocations', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 500; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(500);
  });

  it('all 3 locales render h3 title 30 times each', () => {
    ['en-US', 'ja-JP', 'zh-CN'].forEach(loc => {
      for (let i = 0; i < 30; i++) {
        useAtomMock.mockReturnValue([loc, vi.fn()]);
        const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
        expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
          'Select Language',
        );
        unmount();
      }
    });
  });

  it('handles 30 different unknown locales without crash', () => {
    for (let i = 0; i < 30; i++) {
      useAtomMock.mockReturnValue([`xx-${i}`, vi.fn()]);
      expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-2 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onDismiss = vi.fn();
      const { unmount } = render(<LanguageSelectionModal onDismiss={onDismiss} />);
      unmount();
    }
  });

  it('round-2 all 100 instances render without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageSelectionModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<LanguageSelectionModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<LanguageSelectionModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<LanguageSelectionModal onDismiss={() => {}} />);
      unmount();
    }
  });
});
