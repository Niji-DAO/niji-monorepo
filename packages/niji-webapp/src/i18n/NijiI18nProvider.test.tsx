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

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r3</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r3-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r3-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r4</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r4-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r4-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r5</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r5-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r5-child-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r6</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r6-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r6-child-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r7</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r7-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r7-child-{i}</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r8</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r8-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>x</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>x</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r8-child-{i}</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r9</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <div>r9-{i}</div>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <div>r9</div>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r9</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 different children cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <div>r9-child-{i}</div>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 sequential NijiI18nProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r10-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <span>r10-i-{i}</span>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <span>r10-s-{i}</span>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r10-m-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r10-c-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 sequential NijiI18nProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r11-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <span>r11-i-{i}</span>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <span>r11-s-{i}</span>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r11-m-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r11-c-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-12 30 sequential NijiI18nProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r12-m-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiI18nProvider key={i}>
              <span>r12-i-{i}</span>
            </NijiI18nProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijiI18nProvider>
            <span>r12-s-{i}</span>
          </NijiI18nProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r12-m2-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiI18nProvider>
          <span>r12-c-{i}</span>
        </NijiI18nProvider>,
      );
      unmount();
    }
  });
});
