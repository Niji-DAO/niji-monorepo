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
});
