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

import CreateProposalButton from './index';

describe('CreateProposalButton', () => {
  it('renders "Create Proposal" by default (hasEnough + no active)', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create Proposal');
  });

  it('shows warning text when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('You already have an active or pending proposal');
  });

  it('shows threshold warning when no enough votes + proposalThreshold set', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        proposalThreshold={2}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // threshold + 1 = 3 票必要
    expect(container.textContent).toContain('3 votes to submit a proposal');
  });

  it('shows generic warning when no enough votes + no threshold', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain("don't have enough votes");
  });

  it('renders react-bootstrap Spinner when isLoading=true', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.textContent).not.toContain('Create Proposal');
  });

  it('button is disabled when no enough votes', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('button is disabled when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('button is disabled when isFormInvalid=true', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('fires handleCreateProposal on click when enabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
