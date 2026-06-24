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

  it('does NOT fire handleCreateProposal when disabled (no enough votes)', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handle).not.toHaveBeenCalled();
  });

  it('renders exactly 1 button element', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('hasActiveOrPendingProposal warning takes precedence over Create text', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).not.toContain('Create Proposal');
    expect(container.textContent).toContain('active or pending');
  });

  it('threshold warning uses proposalThreshold + 1 formula', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        proposalThreshold={10}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // 10 + 1 = 11 votes
    expect(container.textContent).toContain('11 votes to submit a proposal');
  });

  it('multi-click on enabled button fires handler N times', () => {
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
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(3);
  });

  it('button is enabled by default (all good)', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('isLoading does NOT disable button (only invalid/votes/active disables)', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('rerender from default to isLoading shows spinner', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create Proposal');
    rerender(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('threshold = 1 → 2 votes warning', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        proposalThreshold={1}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('2 votes to submit a proposal');
  });

  it('threshold = 100 → 101 votes warning', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        proposalThreshold={100}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('101 votes to submit a proposal');
  });

  it('button text hidden when both isLoading=true and hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={true}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).not.toContain('Create Proposal');
  });
});
