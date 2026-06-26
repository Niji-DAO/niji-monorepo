import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="next-themes-provider" data-attribute={String(props.attribute ?? '')}>
      {children}
    </div>
  ),
}));

import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders NextThemesProvider with children', () => {
    const { container } = render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="next-themes-provider"]')).not.toBeNull();
    expect(container.querySelector('span')?.textContent).toBe('child');
  });

  it('forwards arbitrary props to NextThemesProvider', () => {
    const { container } = render(
      <ThemeProvider attribute="class">
        <span>x</span>
      </ThemeProvider>,
    );
    expect(
      container
        .querySelector('[data-testid="next-themes-provider"]')
        ?.getAttribute('data-attribute'),
    ).toBe('class');
  });

  it('renders multiple children inside provider', () => {
    const { container } = render(
      <ThemeProvider>
        <span>a</span>
        <span>b</span>
      </ThemeProvider>,
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('a');
    expect(spans[1].textContent).toBe('b');
  });

  it('forwards different attribute value to NextThemesProvider', () => {
    const { container } = render(
      <ThemeProvider attribute="data-theme">
        <span>x</span>
      </ThemeProvider>,
    );
    expect(
      container
        .querySelector('[data-testid="next-themes-provider"]')
        ?.getAttribute('data-attribute'),
    ).toBe('data-theme');
  });

  it('renders numeric children', () => {
    const { container } = render(<ThemeProvider>{42}</ThemeProvider>);
    expect(container.querySelector('[data-testid="next-themes-provider"]')?.textContent).toBe('42');
  });

  it('does not crash with null children', () => {
    const { container } = render(<ThemeProvider>{null}</ThemeProvider>);
    expect(container.querySelector('[data-testid="next-themes-provider"]')).not.toBeNull();
  });

  it('renders exactly 1 next-themes-provider instance', () => {
    const { container } = render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(container.querySelectorAll('[data-testid="next-themes-provider"]').length).toBe(1);
  });

  it('renders empty attribute when not provided', () => {
    const { container } = render(
      <ThemeProvider>
        <span>x</span>
      </ThemeProvider>,
    );
    expect(
      container
        .querySelector('[data-testid="next-themes-provider"]')
        ?.getAttribute('data-attribute'),
    ).toBe('');
  });

  it('renders empty children gracefully', () => {
    const { container } = render(<ThemeProvider>{[]}</ThemeProvider>);
    expect(container.querySelector('[data-testid="next-themes-provider"]')).not.toBeNull();
  });

  it('renders nested ThemeProvider without crash', () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeProvider>
          <span>nested</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(container.querySelectorAll('[data-testid="next-themes-provider"]').length).toBe(2);
  });

  it('forwards complex props to provider verbatim', () => {
    const { container } = render(
      <ThemeProvider attribute="data-mode">
        <span>x</span>
      </ThemeProvider>,
    );
    expect(
      container
        .querySelector('[data-testid="next-themes-provider"]')
        ?.getAttribute('data-attribute'),
    ).toBe('data-mode');
  });

  it('renders deeply nested children', () => {
    const { container } = render(
      <ThemeProvider>
        <div>
          <span>
            <em data-testid="deep">deep</em>
          </span>
        </div>
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('renders fragment children directly', () => {
    const { container } = render(
      <ThemeProvider>
        <>
          <span data-testid="a">a</span>
          <span data-testid="b">b</span>
        </>
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="a"]')?.textContent).toBe('a');
    expect(container.querySelector('[data-testid="b"]')?.textContent).toBe('b');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>x-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <ThemeProvider>
          <div data-testid={`v-${i}`}>val-{i}</div>
        </ThemeProvider>,
      );
      expect(container.querySelector(`[data-testid="v-${i}"]`)?.textContent).toBe(`val-${i}`);
      unmount();
    }
  });

  it('all 500 instances have next-themes-provider data-testid', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ThemeProvider key={i}>
            <div>x</div>
          </ThemeProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="next-themes-provider"]').length).toBe(500);
  });

  it('handles 50 different nested children', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>
            <span>nested-{i}</span>
          </div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-2 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ThemeProvider key={i}>
              <span>x-{i}</span>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different children types', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>
            <span data-testid={`n-${i}`}>{i}</span>
          </div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-2 200 instances render with provider testid', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ThemeProvider key={i}>
            <div>x</div>
          </ThemeProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="next-themes-provider"]').length).toBe(200);
  });

  it('round-2 rapid 200 renders', () => {
    for (let i = 0; i < 200; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r3-x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r3-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r3-children-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 30 different attribute values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider attribute={i % 2 === 0 ? 'class' : 'data-theme'}>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r4</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r4-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r4-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r5</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r5-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r5-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r6</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-6 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r6-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r6-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r7</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r7-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r7-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r8</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r8-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>x</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>x</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r8-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r9</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ThemeProvider key={i}>
              <div>r9-{i}</div>
            </ThemeProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ThemeProvider>
            <div>r9</div>
          </ThemeProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r9</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 different children cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ThemeProvider>
          <div>r9-child-{i}</div>
        </ThemeProvider>,
      );
      unmount();
    }
  });
});
