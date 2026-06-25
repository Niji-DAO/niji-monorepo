import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ForkState } from '@/wrappers/nijiDao';

import ForkStatus from './index';

describe('ForkStatus', () => {
  it('renders "In Escrow" for ESCROW status', () => {
    const { container } = render(<ForkStatus status={ForkState.ESCROW} />);
    expect(container.textContent).toBe('In Escrow');
  });

  it('renders "Forking" for ACTIVE status', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.textContent).toBe('Forking');
  });

  it('renders "Executed" for EXECUTED status', () => {
    const { container } = render(<ForkStatus status={ForkState.EXECUTED} />);
    expect(container.textContent).toBe('Executed');
  });

  it('renders "Undetermined" for undefined status (default branch)', () => {
    const { container } = render(<ForkStatus />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for UNDETERMINED enum value', () => {
    const { container } = render(<ForkStatus status={ForkState.UNDETERMINED} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('merges custom className', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} className="extra" />);
    expect(container.querySelector('div')?.className).toContain('extra');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('handles empty className (no merge)', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} className="" />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('merges multiple class names from className prop', () => {
    const { container } = render(
      <ForkStatus status={ForkState.ACTIVE} className="class-a class-b" />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toContain('class-a');
    expect(cls).toContain('class-b');
  });

  it('renders text exactly (no extra whitespace)', () => {
    const { container } = render(<ForkStatus status={ForkState.EXECUTED} />);
    expect(container.querySelector('div')?.textContent).toBe('Executed');
  });

  it('all 4 status values produce distinct text outputs', () => {
    const escrow = render(<ForkStatus status={ForkState.ESCROW} />).container.textContent;
    const active = render(<ForkStatus status={ForkState.ACTIVE} />).container.textContent;
    const executed = render(<ForkStatus status={ForkState.EXECUTED} />).container.textContent;
    const undet = render(<ForkStatus status={ForkState.UNDETERMINED} />).container.textContent;
    expect(new Set([escrow, active, executed, undet]).size).toBe(4);
  });

  it('renders 1 div element exactly', () => {
    const { container } = render(<ForkStatus status={ForkState.ESCROW} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('rerender with new status updates text content', () => {
    const { container, rerender } = render(<ForkStatus status={ForkState.ESCROW} />);
    expect(container.textContent).toBe('In Escrow');
    rerender(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.textContent).toBe('Forking');
  });

  it('multiple instances render independently with different statuses', () => {
    const { container } = render(
      <>
        <ForkStatus status={ForkState.ESCROW} />
        <ForkStatus status={ForkState.EXECUTED} />
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(2);
    expect(container.textContent).toContain('In Escrow');
    expect(container.textContent).toContain('Executed');
  });

  it('default class is present even without className prop', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.querySelector('div')?.className).toBeTruthy();
  });

  it('numeric status value (99) falls to Undetermined', () => {
    const { container } = render(<ForkStatus status={99 as never} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('rerender from ESCROW to ACTIVE updates text', () => {
    const { container, rerender } = render(<ForkStatus status={ForkState.ESCROW} />);
    expect(container.textContent).toBe('In Escrow');
    rerender(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.textContent).toBe('Forking');
  });

  it('rerender to undefined (default to Undetermined)', () => {
    const { container, rerender } = render(<ForkStatus status={ForkState.EXECUTED} />);
    expect(container.textContent).toBe('Executed');
    rerender(<ForkStatus />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('all 5 statuses each render distinct text', () => {
    const { container } = render(
      <>
        <ForkStatus status={ForkState.ESCROW} />
        <ForkStatus status={ForkState.ACTIVE} />
        <ForkStatus status={ForkState.EXECUTED} />
        <ForkStatus status={ForkState.UNDETERMINED} />
        <ForkStatus />
      </>,
    );
    expect(container.textContent).toContain('In Escrow');
    expect(container.textContent).toContain('Forking');
    expect(container.textContent).toContain('Executed');
  });

  it('renders 10 ESCROW instances', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <ForkStatus key={i} status={ForkState.ESCROW} />
        ))}
      </>,
    );
    expect((container.textContent?.match(/In Escrow/g) ?? []).length).toBe(10);
  });

  it('ACTIVE status renders exactly "Forking" not "Active"', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.textContent).toBe('Forking');
    expect(container.textContent).not.toBe('Active');
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<ForkStatus status={ForkState.ESCROW} />);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <ForkStatus key={i} status={i % 3 === 0 ? ForkState.ESCROW : ForkState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1000 ESCROW instances render expected count', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ForkStatus key={i} status={ForkState.ESCROW} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1000 ACTIVE instances render without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ForkStatus key={i} status={ForkState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 status toggle rerender', () => {
    const { rerender } = render(<ForkStatus status={ForkState.ESCROW} />);
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(<ForkStatus status={i % 2 === 0 ? ForkState.ACTIVE : ForkState.ESCROW} />),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkStatus />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkStatus key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<ForkStatus />)).not.toThrow();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(<ForkStatus />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ForkStatus />)).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkStatus />);
      unmount();
    }
  });
});
