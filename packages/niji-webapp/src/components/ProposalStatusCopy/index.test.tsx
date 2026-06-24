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

  it('renders empty when proposal is undefined-like (no crash)', () => {
    const { container } = render(<ProposalStatusCopy proposal={{ status: undefined } as never} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders for arbitrary numeric status (99) — Undetermined fallback', () => {
    const { container } = render(<ProposalStatusCopy proposal={{ status: 99 } as never} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('PENDING is rendered as "Pending" verbatim', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.textContent).toBe('Pending');
  });

  it('renders different content (Defeated) for DEFEATED state', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.DEFEATED)} />,
    );
    expect(container.textContent).toBe('Defeated');
  });

  it('renders Queued for QUEUED state (alphabetical sorting check)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.QUEUED)} />,
    );
    expect(container.textContent).toBe('Queued');
  });
});
