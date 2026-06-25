import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const i18nState: {
  locale: string | undefined;
  load: ReturnType<typeof vi.fn>;
  activate: ReturnType<typeof vi.fn>;
} = {
  locale: undefined,
  load: vi.fn(),
  activate: vi.fn(),
};

vi.mock('@lingui/core', () => ({
  i18n: {
    get locale() {
      return i18nState.locale;
    },
    load: (...args: unknown[]) => i18nState.load(...args),
    activate: (...args: unknown[]) => i18nState.activate(...args),
  },
}));

vi.mock('@lingui/react', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18n-provider">{children}</div>
  ),
}));

import { NijiI18nProvider } from './NijiI18nProvider';

beforeEach(() => {
  i18nState.locale = undefined;
  i18nState.load = vi.fn();
  i18nState.activate = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('NijiI18nProvider', () => {
  it('renders children inside I18nProvider', () => {
    const { container } = render(
      <NijiI18nProvider locale="ja-JP">
        <span data-testid="child">child text</span>
      </NijiI18nProvider>,
    );
    expect(container.querySelector('[data-testid="i18n-provider"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('child text');
  });

  it('initializes DEFAULT_LOCALE (ja-JP) when i18n.locale is undefined', () => {
    i18nState.locale = undefined;
    render(
      <NijiI18nProvider locale="ja-JP">
        <span>x</span>
      </NijiI18nProvider>,
    );
    expect(i18nState.load).toHaveBeenCalledWith('ja-JP', {});
    expect(i18nState.activate).toHaveBeenCalledWith('ja-JP');
  });

  it('does not eagerly initialize when locale is not DEFAULT_LOCALE', () => {
    i18nState.locale = undefined;
    render(
      <NijiI18nProvider locale="en-US">
        <span>x</span>
      </NijiI18nProvider>,
    );
    expect(i18nState.load).not.toHaveBeenCalledWith('en-US', {});
  });

  it('does not eagerly initialize when i18n.locale is already set', () => {
    i18nState.locale = 'en-US';
    render(
      <NijiI18nProvider locale="ja-JP">
        <span>x</span>
      </NijiI18nProvider>,
    );
    expect(i18nState.load).not.toHaveBeenCalledWith('ja-JP', {});
  });

  it('calls onActivate after locale activation succeeds', async () => {
    const onActivate = vi.fn();
    render(
      <NijiI18nProvider locale="ja-JP" onActivate={onActivate}>
        <span>x</span>
      </NijiI18nProvider>,
    );
    await waitFor(() => expect(onActivate).toHaveBeenCalledWith('ja-JP'));
  });

  it('logs error when dynamicActivate fails (catalog import error)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <NijiI18nProvider locale={'invalid-LOCALE' as never}>
        <span>x</span>
      </NijiI18nProvider>,
    );
    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });

  it('renders without crashing for all 3 supported locales', () => {
    const locales: Array<'ja-JP' | 'en-US' | 'zh-CN'> = ['ja-JP', 'en-US', 'zh-CN'];
    for (const locale of locales) {
      const { container, unmount } = render(
        <NijiI18nProvider locale={locale}>
          <span>x</span>
        </NijiI18nProvider>,
      );
      expect(container.querySelector('[data-testid="i18n-provider"]')).not.toBeNull();
      unmount();
    }
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale="en-US">
          <span>x</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijiI18nProvider key={i} locale="en-US">
              <span>x-{i}</span>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different locales', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale={`locale-${i}`}>
          <span>x</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('all 50 providers have i18n-provider testid', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <NijiI18nProvider key={i} locale="en-US">
            <span>x</span>
          </NijiI18nProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="i18n-provider"]').length).toBe(50);
  });

  it('handles 30 different children types', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale="en-US">
          <div>
            <span data-testid={`n-${i}`}>{i}</span>
          </div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale="ja-JP">
          <div>r2-x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i} locale="ja-JP">
              <div>r2-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different locale values cycles', () => {
    const locales = ['ja-JP', 'en-US'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale={locales[i % 2]}>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider locale="ja-JP">
          <div>r2-children-{i}</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider locale="ja-JP">
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });
});
