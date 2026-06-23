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
});
