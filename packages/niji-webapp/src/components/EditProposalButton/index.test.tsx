import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    number: (n: number) => String(n),
  },
}));

import EditProposalButton from './index';

const defaults = {
  isLoading: false,
  hasActiveOrPendingProposal: false,
  hasEnoughVote: true,
  isFormInvalid: false,
  handleCreateProposal: () => {},
};

describe('EditProposalButton', () => {
  it('renders "Update Proposal" by default (proposal)', () => {
    const { container } = render(<EditProposalButton {...defaults} />);
    expect(container.textContent).toBe('Update Proposal');
  });

  it('renders "Update Proposal Candidate" when isCandidate=true', () => {
    const { container } = render(<EditProposalButton {...defaults} isCandidate={true} />);
    expect(container.textContent).toBe('Update Proposal Candidate');
  });

  it('shows warning when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasActiveOrPendingProposal={true} />,
    );
    expect(container.textContent).toContain('You already have an active or pending proposal');
  });

  it('shows threshold warning when no enough votes + threshold set', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={2} />,
    );
    expect(container.textContent).toContain('3 votes to submit a proposal');
  });

  it('shows generic warning when no enough votes + no threshold', () => {
    const { container } = render(<EditProposalButton {...defaults} hasEnoughVote={false} />);
    expect(container.textContent).toContain("don't have enough votes");
  });

  it('renders Spinner when isLoading=true', () => {
    const { container } = render(<EditProposalButton {...defaults} isLoading={true} />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('button disabled when invalid form / no votes / active', () => {
    const { container: a } = render(<EditProposalButton {...defaults} isFormInvalid={true} />);
    const { container: b } = render(<EditProposalButton {...defaults} hasEnoughVote={false} />);
    const { container: c } = render(
      <EditProposalButton {...defaults} hasActiveOrPendingProposal={true} />,
    );
    expect(a.querySelector('button')?.disabled).toBe(true);
    expect(b.querySelector('button')?.disabled).toBe(true);
    expect(c.querySelector('button')?.disabled).toBe(true);
  });

  it('fires handleCreateProposal on click when enabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
