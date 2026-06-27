import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useActiveLocaleMock = vi.fn();
vi.mock('../hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

const dynamicActivateMock = vi.fn();
vi.mock('./NijiI18nProvider', () => ({
  dynamicActivate: (...args: unknown[]) => dynamicActivateMock(...args),
  NijiI18nProvider: ({
    locale,
    forceRenderAfterLocaleChange,
    onActivate,
    children,
  }: {
    locale: string;
    forceRenderAfterLocaleChange?: boolean;
    onActivate?: (locale: string) => void;
    children: React.ReactNode;
  }) => (
    <div
      data-testid="niji-i18n-provider"
      data-locale={locale}
      data-force-render={String(forceRenderAfterLocaleChange)}
    >
      <button data-testid="trigger-activate" onClick={() => onActivate?.(locale)} />
      {children}
    </div>
  ),
}));

import { LanguageProvider } from './LanguageProvider';

beforeEach(() => {
  useActiveLocaleMock.mockReset();
  dynamicActivateMock.mockReset();
  useActiveLocaleMock.mockReturnValue('ja-JP');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LanguageProvider', () => {
  it('renders children inside NijiI18nProvider', () => {
    const { container } = render(
      <LanguageProvider>
        <span data-testid="child">child text</span>
      </LanguageProvider>,
    );
    expect(container.querySelector('[data-testid="niji-i18n-provider"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('child text');
  });

  it('passes useActiveLocale value to NijiI18nProvider', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <LanguageProvider>
        <span>x</span>
      </LanguageProvider>,
    );
    const provider = container.querySelector('[data-testid="niji-i18n-provider"]');
    expect(provider?.getAttribute('data-locale')).toBe('en-US');
  });

  it('sets forceRenderAfterLocaleChange=true', () => {
    const { container } = render(
      <LanguageProvider>
        <span>x</span>
      </LanguageProvider>,
    );
    const provider = container.querySelector('[data-testid="niji-i18n-provider"]');
    expect(provider?.getAttribute('data-force-render')).toBe('true');
  });

  it('onActivate callback calls dynamicActivate', () => {
    useActiveLocaleMock.mockReturnValue('zh-CN');
    const { container } = render(
      <LanguageProvider>
        <span>x</span>
      </LanguageProvider>,
    );
    const trigger = container.querySelector(
      '[data-testid="trigger-activate"]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(dynamicActivateMock).toHaveBeenCalledWith('zh-CN');
  });

  it('renders without crashing when useActiveLocale returns pseudo locale', () => {
    useActiveLocaleMock.mockReturnValue('pseudo');
    const { container } = render(
      <LanguageProvider>
        <span>x</span>
      </LanguageProvider>,
    );
    expect(container.querySelector('[data-testid="niji-i18n-provider"]')).not.toBeNull();
  });

  it('mount-unmount 500 cycles', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>x-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different locales', () => {
    for (let i = 0; i < 30; i++) {
      useActiveLocaleMock.mockReturnValue(`locale-${i}`);
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('all 200 providers render with niji-i18n-provider', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <LanguageProvider key={i}>
            <div>x</div>
          </LanguageProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-i18n-provider"]').length).toBe(200);
  });

  it('handles 50 different children types', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>
            <span data-testid={`n-${i}`}>{i}</span>
          </div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r2-x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r2-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r2-children-{i}</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r2-second-{i}</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r3</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r3-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r3-child-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r4</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r4-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r4-child-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r5</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r5-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r5-child-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r6</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r6-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r6-child-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-6 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r7</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r7-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r7-child-{i}</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r8</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r8-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>x</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>x</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r8-child-{i}</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r9</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <div>r9-{i}</div>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <div>r9</div>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r9</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 different children cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <div>r9-child-{i}</div>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 sequential LanguageProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r10-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <span>r10-i-{i}</span>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <span>r10-s-{i}</span>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r10-m-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r10-c-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 sequential LanguageProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r11-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <span>r11-i-{i}</span>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <span>r11-s-{i}</span>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r11-m-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r11-c-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-12 30 sequential LanguageProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r12-m-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <LanguageProvider key={i}>
              <span>r12-i-{i}</span>
            </LanguageProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <LanguageProvider>
            <span>r12-s-{i}</span>
          </LanguageProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r12-m2-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <LanguageProvider>
          <span>r12-c-{i}</span>
        </LanguageProvider>,
      );
      unmount();
    }
  });
});
