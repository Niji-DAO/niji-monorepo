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
});
