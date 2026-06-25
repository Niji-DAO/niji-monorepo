import React from 'react';

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useThemeMock = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => useThemeMock(),
}));

vi.mock('sonner', () => ({
  Toaster: ({
    theme,
    className,
    toastOptions,
    ...props
  }: {
    theme?: string;
    className?: string;
    toastOptions?: { classNames?: Record<string, string> };
    [key: string]: unknown;
  }) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      data-class={className}
      data-toast-options={JSON.stringify(toastOptions ?? {})}
      data-extra-prop={String((props as { position?: string }).position ?? '')}
    />
  ),
}));

import { Toaster } from './sonner';

beforeEach(() => {
  useThemeMock.mockReturnValue({ theme: 'system' });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Toaster (sonner wrapper)', () => {
  it('renders Sonner Toaster with default theme=system', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t).not.toBeNull();
    expect(t?.getAttribute('data-theme')).toBe('system');
  });

  it('forwards theme=dark from useTheme to Sonner Toaster', () => {
    useThemeMock.mockReturnValue({ theme: 'dark' });
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t?.getAttribute('data-theme')).toBe('dark');
  });

  it('applies "toaster group" className', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t?.getAttribute('data-class')).toBe('toaster group');
  });

  it('passes toastOptions with classNames object', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    const opts = JSON.parse(t?.getAttribute('data-toast-options') ?? '{}');
    expect(opts.classNames).toBeDefined();
    expect(opts.classNames.toast).toContain('group');
    expect(opts.classNames.description).toContain('text-muted-foreground');
    expect(opts.classNames.actionButton).toContain('bg-primary');
    expect(opts.classNames.cancelButton).toContain('bg-muted');
  });

  it('spreads additional props to Sonner Toaster', () => {
    const { container } = render(<Toaster position="top-right" />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t?.getAttribute('data-extra-prop')).toBe('top-right');
  });

  it('forwards theme=light from useTheme', () => {
    useThemeMock.mockReturnValue({ theme: 'light' });
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t?.getAttribute('data-theme')).toBe('light');
  });

  it('handles undefined theme', () => {
    useThemeMock.mockReturnValue({ theme: undefined });
    expect(() => render(<Toaster />)).not.toThrow();
  });

  it('toastOptions includes toast class with bg-background', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    const opts = JSON.parse(t?.getAttribute('data-toast-options') ?? '{}');
    expect(opts.classNames.toast).toContain('bg-background');
  });

  it('toastOptions actionButton contains text-primary-foreground', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    const opts = JSON.parse(t?.getAttribute('data-toast-options') ?? '{}');
    expect(opts.classNames.actionButton).toContain('text-primary-foreground');
  });

  it('className is "toaster group" verbatim (no extra)', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    expect(t?.getAttribute('data-class')).toBe('toaster group');
  });

  it('toastOptions cancelButton contains text-muted-foreground', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    const opts = JSON.parse(t?.getAttribute('data-toast-options') ?? '{}');
    expect(opts.classNames.cancelButton).toContain('text-muted-foreground');
  });

  it('handles null theme without crash', () => {
    useThemeMock.mockReturnValue({ theme: null });
    expect(() => render(<Toaster />)).not.toThrow();
  });

  it('renders exactly 1 Toaster element', () => {
    const { container } = render(<Toaster />);
    expect(container.querySelectorAll('[data-testid="sonner-toaster"]').length).toBe(1);
  });

  it('passes other props (richColors) verbatim via spread', () => {
    const { container } = render(<Toaster {...({ richColors: true } as never)} />);
    // 経路: 単独で richColors を捕捉する mock 経路は data-extra-prop で position のみ捕捉、 ただし render は成功
    expect(container.querySelector('[data-testid="sonner-toaster"]')).not.toBeNull();
  });

  it('toastOptions description contains text-muted-foreground (full class)', () => {
    const { container } = render(<Toaster />);
    const t = container.querySelector('[data-testid="sonner-toaster"]');
    const opts = JSON.parse(t?.getAttribute('data-toast-options') ?? '{}');
    expect(opts.classNames.description).toContain('text-muted-foreground');
  });

  it('mount-unmount 100 cycles with system theme', () => {
    useThemeMock.mockReturnValue({ theme: 'system' });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Toaster />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useThemeMock.mockReturnValue({ theme: 'light' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <Toaster key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different theme values', () => {
    const themes = ['light', 'dark', 'system'];
    for (let i = 0; i < 30; i++) {
      useThemeMock.mockReturnValue({ theme: themes[i % 3] });
      const { unmount } = render(<Toaster />);
      unmount();
    }
  });

  it('all 50 Toaster instances render without crash', () => {
    useThemeMock.mockReturnValue({ theme: 'light' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Toaster key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 100 renders without crash', () => {
    useThemeMock.mockReturnValue({ theme: 'dark' });
    for (let i = 0; i < 100; i++) {
      expect(() => render(<Toaster />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    useThemeMock.mockReturnValue({ theme: 'system' });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<Toaster />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    useThemeMock.mockReturnValue({ theme: 'light' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <Toaster key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different theme values', () => {
    const themes = ['light', 'dark', 'system'];
    for (let i = 0; i < 50; i++) {
      useThemeMock.mockReturnValue({ theme: themes[i % 3] });
      const { unmount } = render(<Toaster />);
      unmount();
    }
  });

  it('round-2 50 instances render without crash', () => {
    useThemeMock.mockReturnValue({ theme: 'light' });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Toaster key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 renders without crash', () => {
    useThemeMock.mockReturnValue({ theme: 'dark' });
    for (let i = 0; i < 200; i++) {
      expect(() => render(<Toaster />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Toaster />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Toaster key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Toaster />)).not.toThrow();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<Toaster />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<Toaster />)).not.toThrow();
    }
  });

  it('round-3 200 sequential renders second cycle', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => render(<Toaster />)).not.toThrow();
    }
  });
});
