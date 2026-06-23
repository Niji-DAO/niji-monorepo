import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ProposalState } from '@/wrappers/nijiDao';

import ProposalStatusCopy from './index';

const makeProposal = (status: ProposalState) =>
  ({
    status,
  }) as never;

describe('ProposalStatusCopy', () => {
  const cases: Array<[ProposalState, string]> = [
    [ProposalState.PENDING, 'Pending'],
    [ProposalState.ACTIVE, 'Active'],
    [ProposalState.SUCCEEDED, 'Succeeded'],
    [ProposalState.EXECUTED, 'Executed'],
    [ProposalState.DEFEATED, 'Defeated'],
    [ProposalState.QUEUED, 'Queued'],
    [ProposalState.CANCELLED, 'Canceled'],
    [ProposalState.VETOED, 'Vetoed'],
    [ProposalState.EXPIRED, 'Expired'],
  ];

  it.each(cases)('renders "%s" for status=%s', (status, expected) => {
    const { container } = render(<ProposalStatusCopy proposal={makeProposal(status)} />);
    expect(container.textContent).toBe(expected);
  });

  it('renders "Undetermined" for default branch (UNDETERMINED)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.UNDETERMINED)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for OBJECTION_PERIOD (no case)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.OBJECTION_PERIOD)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for UPDATABLE (no case)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.UPDATABLE)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });
});
