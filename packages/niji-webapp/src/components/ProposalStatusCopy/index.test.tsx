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

  it('renders only text (no html children)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.children.length).toBe(0);
  });

  it('CANCELLED renders "Canceled" (US spelling)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />,
    );
    expect(container.textContent).toBe('Canceled');
  });

  it('VETOED renders "Vetoed" verbatim', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.VETOED)} />,
    );
    expect(container.textContent).toBe('Vetoed');
  });

  it('rerender with new state updates text', () => {
    const { container, rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.textContent).toBe('Pending');
    rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.EXECUTED)} />);
    expect(container.textContent).toBe('Executed');
  });

  it('multiple instances render distinct texts', () => {
    const { container } = render(
      <>
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.EXECUTED)} />
      </>,
    );
    expect(container.textContent).toContain('Active');
    expect(container.textContent).toContain('Executed');
  });
});
