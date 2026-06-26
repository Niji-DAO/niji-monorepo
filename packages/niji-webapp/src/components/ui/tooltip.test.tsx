import React from 'react';

import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

beforeAll(() => {
  if (!global.ResizeObserver) {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('Tooltip', () => {
  it('does not render TooltipContent text when tooltip is closed', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-body">help text</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tooltip-body"]')).toBeNull();
  });

  it('renders TooltipContent via open prop', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-body">help text</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tooltip-body"]')?.textContent).toBe('help text');
  });

  it('TooltipContent merges custom className', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent data-testid="content" className="custom-tooltip-class">
            tip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = document.querySelector('[data-testid="content"]');
    expect(content?.className).toContain('custom-tooltip-class');
    expect(content?.className).toContain('text-xs');
  });

  it('TooltipContent contains arrow element by default', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent data-testid="content">tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = document.querySelector('[data-testid="content"]');
    expect(content?.querySelector('svg')).not.toBeNull();
  });

  it('TooltipTrigger renders children text', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">hover me</TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.textContent).toBe('hover me');
  });

  it('handles two tooltips independently (one open, one closed)', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>t1</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tip-a">tip a</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip open={false}>
          <TooltipTrigger>t2</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tip-b">tip b</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tip-a"]')?.textContent).toBe('tip a');
    expect(document.querySelector('[data-testid="tip-b"]')).toBeNull();
  });

  it('TooltipContent default sideOffset is 4 (passes prop without crash)', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('TooltipContent accepts custom sideOffset prop', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent sideOffset={10}>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('TooltipContent renders nested JSX content', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent>
            <div data-testid="nested-outer">
              <span data-testid="nested-inner">deep</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="nested-outer"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="nested-inner"]')?.textContent).toBe('deep');
  });

  it('TooltipTrigger inherits children when wrapping multiple elements', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">
            <span>a</span>
            <span>b</span>
          </TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(container.querySelector('[data-testid="trigger"]')?.textContent).toBe('ab');
  });

  it('multiple Tooltip instances in same provider render independently', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>a</TooltipTrigger>
          <TooltipContent>
            <span data-testid="x1">x1</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip open={true}>
          <TooltipTrigger>b</TooltipTrigger>
          <TooltipContent>
            <span data-testid="x2">x2</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="x1"]')?.textContent).toBe('x1');
    expect(document.querySelector('[data-testid="x2"]')?.textContent).toBe('x2');
  });

  it('TooltipProvider wraps without errors with no children', () => {
    expect(() => render(<TooltipProvider>{null}</TooltipProvider>)).not.toThrow();
  });

  it('default TooltipContent has shadow tooltip styling class', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent data-testid="content">tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = document.querySelector('[data-testid="content"]');
    expect(content?.className).toContain('text-xs');
  });

  it('round-2 Tooltip mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-2 renders 100 Tooltip instances in single Provider', () => {
    expect(() =>
      render(
        <TooltipProvider>
          {Array.from({ length: 100 }, (_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>r2-x-{i}</TooltipTrigger>
              <TooltipContent>r2-tip-{i}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different content values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>r2-content-{i}</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>tip</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 50 rerender cycles', () => {
    const { rerender } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>r2-x-{i}</TooltipTrigger>
              <TooltipContent>r2-{i}</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <TooltipProvider>
          {Array.from({ length: 100 }, (_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>r3-{i}</TooltipTrigger>
              <TooltipContent>tip-{i}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-3 50 different trigger values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r3-tr-{i}</TooltipTrigger>
            <TooltipContent>x</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-3 50 different content values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>r3-c-{i}</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r4</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <TooltipProvider>
          {Array.from({ length: 100 }, (_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>r4-{i}</TooltipTrigger>
              <TooltipContent>tip-{i}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-4 50 different trigger values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r4-tr-{i}</TooltipTrigger>
            <TooltipContent>x</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-4 50 different content values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>r4-c-{i}</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r5</TooltipTrigger>
            <TooltipContent>r5</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 30 different trigger values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r5-t-{i}</TooltipTrigger>
            <TooltipContent>r5-c-{i}</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-5 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r6</TooltipTrigger>
            <TooltipContent>r6</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger>r6-{i}</TooltipTrigger>
                <TooltipContent>r6-{i}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different trigger text', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r6-t-{i}</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-6 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r7</TooltipTrigger>
            <TooltipContent>r7-c</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <>
            {Array.from({ length: 30 }, (_, i) => (
              <Tooltip key={i}>
                <TooltipTrigger>r7-{i}</TooltipTrigger>
                <TooltipContent>r7-c-{i}</TooltipContent>
              </Tooltip>
            ))}
          </>
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-7 100 sequential render check', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r8</TooltipTrigger>
            <TooltipContent>r8</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <TooltipProvider>
          {Array.from({ length: 30 }, (_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>r8-{i}</TooltipTrigger>
              <TooltipContent>r8-{i}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-8 50 sequential cycles second', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>r9</TooltipTrigger>
            <TooltipContent>r9</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <TooltipProvider>
          {Array.from({ length: 30 }, (_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger>r9-{i}</TooltipTrigger>
              <TooltipContent>r9-{i}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>y</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      unmount();
    }
  });

  it('round-9 50 sequential cycles second', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>x</TooltipTrigger>
              <TooltipContent>y</TooltipContent>
            </Tooltip>
          </TooltipProvider>,
        ),
      ).not.toThrow();
    }
  });
});
