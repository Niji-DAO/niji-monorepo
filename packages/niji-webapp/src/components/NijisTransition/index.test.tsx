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
});
