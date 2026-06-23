import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import CreateCandidateButton from './index';

describe('CreateCandidateButton', () => {
  it('renders "Create proposal candidate" by default', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
  });

  it('renders warning text when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('You already have an active or pending proposal');
  });

  it('renders react-bootstrap Spinner when isLoading=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // react-bootstrap Spinner は spinner-border class を付与
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    // 通常テキストは isLoading 中は出ない
    expect(container.textContent).not.toContain('Create proposal candidate');
  });

  it('disables button when isFormInvalid=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('disables button when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('fires handleCreateProposal on click when enabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });
});
