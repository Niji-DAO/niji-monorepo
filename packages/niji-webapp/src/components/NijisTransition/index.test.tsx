import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      onClick,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: React.MouseEventHandler<HTMLDivElement>;
    }) => (
      <div className={className} onClick={onClick} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

import NijisTransition from './index';

const styles = {
  enteringStyle: { opacity: 0 },
  enteredStyle: { opacity: 1 },
  exitingStyle: { opacity: 0 },
  exitedStyle: { opacity: 0 },
};

describe('NijisTransition', () => {
  it('renders children when show=true', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>visible</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')?.textContent).toBe('visible');
  });

  it('renders nothing when show=false', () => {
    const { container } = render(
      <NijisTransition show={false} transitionStyes={styles}>
        <span>hidden</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')).toBeNull();
  });

  it('applies className to motion.div', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} className="my-class">
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.className).toBe('my-class');
  });

  it('fires onClick on motion.div click', () => {
    const onClick = vi.fn();
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} onClick={onClick}>
        <span>x</span>
      </NijisTransition>,
    );
    const div = container.querySelector('[data-testid="motion-div"]');
    if (div) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles default children (empty fragment) without crash', () => {
    const { container } = render(<NijisTransition show={true} transitionStyes={styles} />);
    expect(container.querySelector('[data-testid="motion-div"]')).not.toBeNull();
  });

  it('fires onClick on repeated clicks (3 times)', () => {
    const onClick = vi.fn();
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} onClick={onClick}>
        <span>x</span>
      </NijisTransition>,
    );
    const div = container.querySelector('[data-testid="motion-div"]');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('handles empty className', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} className="">
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.className).toBe('');
  });

  it('renders numeric children', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        {42}
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('42');
  });

  it('renders exactly 1 motion-div when show=true', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelectorAll('[data-testid="motion-div"]').length).toBe(1);
  });

  it('toggle show: true → false → true via rerender', () => {
    const { container, rerender } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')).not.toBeNull();
    rerender(
      <NijisTransition show={false} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')).toBeNull();
    rerender(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('renders nested children correctly', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <div data-testid="outer">
          <span data-testid="inner">nested</span>
        </div>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="outer"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('nested');
  });

  it('show=false renders no motion-div', () => {
    const { container } = render(
      <NijisTransition show={false} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelectorAll('[data-testid="motion-div"]').length).toBe(0);
  });

  it('does not crash without onClick', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    const div = container.querySelector('[data-testid="motion-div"]');
    expect(() => {
      if (div) fireEvent.click(div);
    }).not.toThrow();
  });

  it('renders multiple sibling children', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span data-testid="s1">a</span>
        <span data-testid="s2">b</span>
        <span data-testid="s3">c</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="s1"]')?.textContent).toBe('a');
    expect(container.querySelector('[data-testid="s2"]')?.textContent).toBe('b');
    expect(container.querySelector('[data-testid="s3"]')?.textContent).toBe('c');
  });

  it('renders string children directly', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        hello world
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('hello world');
  });

  it('className updates on rerender', () => {
    const { container, rerender } = render(
      <NijisTransition show={true} transitionStyes={styles} className="a">
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.className).toBe('a');
    rerender(
      <NijisTransition show={true} transitionStyes={styles} className="b">
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.className).toBe('b');
  });

  it('unicode children render verbatim', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        こんにちは
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('こんにちは');
  });

  it('multiple instances with show=true render 2 motion-divs', () => {
    const { container } = render(
      <>
        <NijisTransition show={true} transitionStyes={styles}>
          <span>a</span>
        </NijisTransition>
        <NijisTransition show={true} transitionStyes={styles}>
          <span>b</span>
        </NijisTransition>
      </>,
    );
    expect(container.querySelectorAll('[data-testid="motion-div"]').length).toBe(2);
  });

  it('show=false then onClick assert no crash (no motion-div)', () => {
    const onClick = vi.fn();
    const { container } = render(
      <NijisTransition show={false} transitionStyes={styles} onClick={onClick}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('long children string (500 chars) renders fully', () => {
    const long = 'a'.repeat(500);
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        {long}
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent?.length).toBe(500);
  });

  it('Fragment children render inside motion-div', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <>
          <span>x</span>
          <span>y</span>
        </>
      </NijisTransition>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('emoji children render verbatim', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        🎉
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('🎉');
  });

  it('repeated show toggle rerenders preserve content when last show=true', () => {
    const { container, rerender } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    rerender(
      <NijisTransition show={false} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    rerender(
      <NijisTransition show={true} transitionStyes={styles}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('span')?.textContent).toBe('x');
  });

  it('multiple onClick fires N times', () => {
    const onClick = vi.fn();
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} onClick={onClick}>
        <span>x</span>
      </NijisTransition>,
    );
    const div = container.querySelector('[data-testid="motion-div"]');
    if (div) {
      for (let i = 0; i < 5; i++) fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('long className (100+ chars) accepted', () => {
    const long = 'a'.repeat(120);
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles} className={long}>
        <span>x</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.className).toContain(long);
  });

  it('rerender from string to ReactNode children works', () => {
    const { container, rerender } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        text
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="motion-div"]')?.textContent).toBe('text');
    rerender(
      <NijisTransition show={true} transitionStyes={styles}>
        <span data-testid="nested">nested</span>
      </NijisTransition>,
    );
    expect(container.querySelector('[data-testid="nested"]')?.textContent).toBe('nested');
  });

  it('renders without crash with null children', () => {
    expect(() =>
      render(
        <NijisTransition show={true} transitionStyes={styles}>
          {null}
        </NijisTransition>,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <NijisTransition key={i} show={true} transitionStyes={styles}>
            <div>item-{i}</div>
          </NijisTransition>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="motion-div"]').length).toBe(5);
  });

  it('rerender from "A" to "B" updates content', () => {
    const { container, rerender } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        A
      </NijisTransition>,
    );
    expect(container.textContent).toContain('A');
    rerender(
      <NijisTransition show={true} transitionStyes={styles}>
        B
      </NijisTransition>,
    );
    expect(container.textContent).toContain('B');
  });

  it('renders 300 char long content', () => {
    const longStr = 'x'.repeat(300);
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        {longStr}
      </NijisTransition>,
    );
    expect(container.textContent).toContain(longStr);
  });

  it('renders unicode content', () => {
    const { container } = render(
      <NijisTransition show={true} transitionStyes={styles}>
        {'日本語'}
      </NijisTransition>,
    );
    expect(container.textContent).toContain('日本語');
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r2-x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r2-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r2-children-{i}</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r3-x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r3-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-3 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r3-c-{i}</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r4</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r4-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r4-c-{i}</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r5</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r5-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r5-c-{i}</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r6</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r6-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r6-c-{i}</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r7</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r7-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-7 30 sequential show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r8</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r8-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>x</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-8 30 sequential show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r9</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <div>r9-{i}</div>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <div>r9</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <div>r9</div>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-9 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={i % 2 === 0} transitionStyes={styles}>
            <div>x</div>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 30 sequential NijisTransition mount-unmount cycles', () => {
    const styles = {} as never;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <span>r10-{i}</span>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    const styles = {} as never;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijisTransition key={i} show={true} transitionStyes={styles}>
              <span>r10-i-{i}</span>
            </NijisTransition>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    const styles = {} as never;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NijisTransition show={true} transitionStyes={styles}>
            <span>r10-s-{i}</span>
          </NijisTransition>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    const styles = {} as never;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijisTransition show={false} transitionStyes={styles}>
          <span>r10-m-{i}</span>
        </NijisTransition>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    const styles = {} as never;
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijisTransition show={true} transitionStyes={styles}>
          <span>r10-c-{i}</span>
        </NijisTransition>,
      );
      unmount();
    }
  });
});
