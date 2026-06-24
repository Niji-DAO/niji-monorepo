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

  it('isLoading=true + isFormInvalid=true で spinner 表示 + disabled', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders exactly 1 button element', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('renders exactly 1 spinner when isLoading=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('.spinner-border').length).toBe(1);
  });

  it('does NOT fire handleCreateProposal on click when disabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    // disabled button は click event を propagate しない
    expect(handle).toHaveBeenCalledTimes(0);
  });

  it('hasActiveOrPendingProposal=true takes precedence over default text', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // warning text のみが render される
    expect(container.textContent).not.toContain('Create proposal candidate');
    expect(container.textContent).toContain('active or pending proposal');
  });

  it('isLoading=true でも button タグ自体は 1 つだけ存在', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('multi-click on enabled button fires handler N 回', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
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

  it('isFormInvalid=true で disable + click 時 handler 呼ばれない', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    expect(handle).not.toHaveBeenCalled();
  });

  it('isLoading=true 単独では disabled にならない (Spinner 表示のみ、 click 可能)', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('hasActiveOrPendingProposal=true 時に warning text + button disabled の両立', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('active or pending proposal');
    expect(container.querySelector('button')?.disabled).toBe(true);
  });
});
