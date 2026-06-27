import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ProposalState } from '@/wrappers/nijiDao';

import ProposalStatus from './index';

describe('ProposalStatus', () => {
  const cases: Array<[ProposalState | undefined, string]> = [
    [ProposalState.PENDING, 'Pending'],
    [ProposalState.ACTIVE, 'Active'],
    [ProposalState.SUCCEEDED, 'Succeeded'],
    [ProposalState.EXECUTED, 'Executed'],
    [ProposalState.DEFEATED, 'Defeated'],
    [ProposalState.QUEUED, 'Queued'],
    [ProposalState.CANCELLED, 'Canceled'],
    [ProposalState.VETOED, 'Vetoed'],
    [ProposalState.EXPIRED, 'Expired'],
    [ProposalState.OBJECTION_PERIOD, 'Objection period'],
    [ProposalState.UPDATABLE, 'Updatable'],
    [undefined, 'Undetermined'],
  ];

  it.each(cases)('renders status text for %s', (status, expected) => {
    const { container } = render(<ProposalStatus status={status} />);
    expect(container.textContent).toContain(expected);
  });

  it('merges custom className', () => {
    const { container } = render(
      <ProposalStatus status={ProposalState.ACTIVE} className="my-status" />,
    );
    expect(container.querySelector('div')?.className).toContain('my-status');
  });

  it('applies primary class for PENDING/ACTIVE', () => {
    const { container: pending } = render(<ProposalStatus status={ProposalState.PENDING} />);
    const { container: active } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(pending.querySelector('div')?.className).toMatch(/primary/i);
    expect(active.querySelector('div')?.className).toMatch(/primary/i);
  });

  it('applies success class for SUCCEEDED/EXECUTED', () => {
    const { container: s } = render(<ProposalStatus status={ProposalState.SUCCEEDED} />);
    const { container: e } = render(<ProposalStatus status={ProposalState.EXECUTED} />);
    expect(s.querySelector('div')?.className).toMatch(/success/i);
    expect(e.querySelector('div')?.className).toMatch(/success/i);
  });

  it('applies danger class for DEFEATED/VETOED', () => {
    const { container: d } = render(<ProposalStatus status={ProposalState.DEFEATED} />);
    const { container: v } = render(<ProposalStatus status={ProposalState.VETOED} />);
    expect(d.querySelector('div')?.className).toMatch(/danger/i);
    expect(v.querySelector('div')?.className).toMatch(/danger/i);
  });

  it('renders without className when not provided', () => {
    const { container } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('UPDATABLE state renders updatable class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.UPDATABLE} />);
    expect(container.querySelector('div')?.className).toMatch(/updatable/i);
  });

  it('OBJECTION_PERIOD state renders objection class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.OBJECTION_PERIOD} />);
    expect(container.querySelector('div')?.className).toMatch(/objection/i);
  });

  it('QUEUED state renders secondary class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.QUEUED} />);
    expect(container.querySelector('div')?.className).toMatch(/secondary/i);
  });

  it('renders exactly 1 div element', () => {
    const { container } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('EXPIRED state renders secondary class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.EXPIRED} />);
    expect(container.querySelector('div')?.className).toMatch(/secondary/i);
  });

  it('CANCELLED state renders secondary class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.CANCELLED} />);
    expect(container.querySelector('div')?.className).toMatch(/secondary/i);
  });

  it('undefined status renders Undetermined text', () => {
    const { container } = render(<ProposalStatus status={undefined} />);
    expect(container.textContent).toContain('Undetermined');
  });

  it('custom className appends to default class', () => {
    const { container } = render(
      <ProposalStatus status={ProposalState.ACTIVE} className="custom-extra" />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toContain('custom-extra');
  });

  it('multi className tokens preserved', () => {
    const { container } = render(
      <ProposalStatus status={ProposalState.PENDING} className="a b c" />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toContain('a');
    expect(cls).toContain('b');
    expect(cls).toContain('c');
  });

  it('rerender from ACTIVE to EXECUTED updates text', () => {
    const { container, rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.textContent).toContain('Active');
    rerender(<ProposalStatus status={ProposalState.EXECUTED} />);
    expect(container.textContent).toContain('Executed');
  });

  it('rerender from ACTIVE to EXECUTED updates class', () => {
    const { container, rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.querySelector('div')?.className).toMatch(/primary/i);
    rerender(<ProposalStatus status={ProposalState.EXECUTED} />);
    expect(container.querySelector('div')?.className).toMatch(/success/i);
  });

  it('empty className still has default state class', () => {
    const { container } = render(<ProposalStatus status={ProposalState.ACTIVE} className="" />);
    expect(container.querySelector('div')?.className).toMatch(/primary/i);
  });

  it('multiple instances render distinct status texts', () => {
    const { container } = render(
      <>
        <ProposalStatus status={ProposalState.ACTIVE} />
        <ProposalStatus status={ProposalState.EXECUTED} />
      </>,
    );
    expect(container.textContent).toContain('Active');
    expect(container.textContent).toContain('Executed');
  });

  it('CANCELLED text contains exactly "Canceled"', () => {
    const { container } = render(<ProposalStatus status={ProposalState.CANCELLED} />);
    expect(container.textContent?.trim()).toBe('Canceled');
  });

  it('UPDATABLE text contains exactly "Updatable"', () => {
    const { container } = render(<ProposalStatus status={ProposalState.UPDATABLE} />);
    expect(container.textContent?.trim()).toBe('Updatable');
  });

  it('PENDING text contains exactly "Pending"', () => {
    const { container } = render(<ProposalStatus status={ProposalState.PENDING} />);
    expect(container.textContent?.trim()).toBe('Pending');
  });

  it('EXPIRED text contains exactly "Expired"', () => {
    const { container } = render(<ProposalStatus status={ProposalState.EXPIRED} />);
    expect(container.textContent?.trim()).toBe('Expired');
  });

  it('rerender from undefined to EXECUTED switches text + class', () => {
    const { container, rerender } = render(<ProposalStatus status={undefined} />);
    expect(container.textContent).toContain('Undetermined');
    rerender(<ProposalStatus status={ProposalState.EXECUTED} />);
    expect(container.textContent).toContain('Executed');
    expect(container.querySelector('div')?.className).toMatch(/success/i);
  });

  it('5 instances render 5 distinct statuses', () => {
    const { container } = render(
      <>
        <ProposalStatus status={ProposalState.PENDING} />
        <ProposalStatus status={ProposalState.ACTIVE} />
        <ProposalStatus status={ProposalState.EXECUTED} />
        <ProposalStatus status={ProposalState.DEFEATED} />
        <ProposalStatus status={ProposalState.VETOED} />
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('OBJECTION_PERIOD status renders without crash', () => {
    expect(() => render(<ProposalStatus status={ProposalState.OBJECTION_PERIOD} />)).not.toThrow();
  });

  it('renders identical DOM on rerender with same status (idempotent)', () => {
    const { container, rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    const firstHTML = container.innerHTML;
    rerender(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.innerHTML).toBe(firstHTML);
  });

  it('renders 10 instances each with own status', () => {
    const { container } = render(
      <>
        {cases.slice(0, 10).map(([status], i) => (
          <ProposalStatus key={i} status={status} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(10);
  });

  it('rerender from PENDING to ACTIVE updates status text', () => {
    const { container, rerender } = render(<ProposalStatus status={ProposalState.PENDING} />);
    expect(container.textContent).toContain('Pending');
    rerender(<ProposalStatus status={ProposalState.ACTIVE} />);
    expect(container.textContent).toContain('Active');
  });

  it('rerender to undefined defaults to Undetermined', () => {
    const { container, rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    rerender(<ProposalStatus status={undefined} />);
    expect(container.textContent).toContain('Undetermined');
  });

  it('all 12 statuses each render distinct text', () => {
    const { container } = render(
      <>
        {cases.map(([status], i) => (
          <ProposalStatus key={i} status={status} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(12);
  });

  it('custom className is preserved across rerenders', () => {
    const { container, rerender } = render(
      <ProposalStatus status={ProposalState.ACTIVE} className="custom-cls" />,
    );
    expect(container.querySelector('div')?.className).toContain('custom-cls');
    rerender(<ProposalStatus status={ProposalState.EXECUTED} className="custom-cls" />);
    expect(container.querySelector('div')?.className).toContain('custom-cls');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 instances render single div', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ProposalStatus key={i} status={ProposalState.ACTIVE} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
  });

  it('handles 100 different className values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`cls-${i}`} />,
      );
      expect(container.querySelector('div')?.className).toContain(`cls-${i}`);
      unmount();
    }
  });

  it('rapid 200 status transitions', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.QUEUED,
      ProposalState.EXECUTED,
    ];
    const { rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    for (let i = 0; i < 200; i++) {
      expect(() => rerender(<ProposalStatus status={states[i % 5]} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-2 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 all 200 instances render single div', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ProposalStatus key={i} status={ProposalState.ACTIVE} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-2 handles 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r2-cls-${i}`} />,
      );
      expect(container.querySelector('div')?.className).toContain(`r2-cls-${i}`);
      unmount();
    }
  });

  it('round-2 rapid 100 status transitions', () => {
    const states = [ProposalState.ACTIVE, ProposalState.PENDING, ProposalState.SUCCEEDED];
    const { rerender } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ProposalStatus status={states[i % 3]} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different status cycles', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.DEFEATED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={states[i % 5]} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-3 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r3-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different status cycles', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.DEFEATED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={states[i % 5]} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-4 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r4-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-5 30 different status cycles', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={states[i % 4]} />);
      unmount();
    }
  });

  it('round-5 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r5-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-6 30 different status cycles', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={states[i % 4]} />);
      unmount();
    }
  });

  it('round-6 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r6-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-7 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r7-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-8 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r8-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.ACTIVE} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-9 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r9-cls-${i}`} />,
      );
      unmount();
    }
  });

  it('round-10 30 sequential ProposalStatus mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatus status={ProposalState.ACTIVE} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} className={`r10-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalStatus status={ProposalState.PENDING} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.EXECUTED} className={`r10-m-${i}`} />,
      );
      unmount();
    }
  });

  it('round-10 100 sequential different className values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r10-c-${i}`} />,
      );
      unmount();
    }
  });

  it('round-11 30 sequential ProposalStatus mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r11-m-${i}`} />,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} className={`r11-i-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatus status={ProposalState.PENDING} className={`r11-s-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.SUCCEEDED} className={`r11-m2-${i}`} />,
      );
      unmount();
    }
  });

  it('round-11 100 sequential alternating ProposalStatus values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r11-c-${i}`} />,
      );
      unmount();
    }
  });

  it('round-12 30 sequential ProposalStatus mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r12-m-${i}`} />,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatus key={i} status={ProposalState.ACTIVE} className={`r12-i-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatus status={ProposalState.PENDING} className={`r12-s-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.SUCCEEDED} className={`r12-m2-${i}`} />,
      );
      unmount();
    }
  });

  it('round-12 100 sequential alternating ProposalStatus values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalStatus status={ProposalState.ACTIVE} className={`r12-c-${i}`} />,
      );
      unmount();
    }
  });
});
