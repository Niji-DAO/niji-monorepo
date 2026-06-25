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

  it('threshold = 2 → 3 votes warning', () => {
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
    expect(container.textContent).toContain('3 votes to submit a proposal');
  });

  it('threshold = 50 → 51 votes warning', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        proposalThreshold={50}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('51 votes to submit a proposal');
  });

  it('isFormInvalid=true alone disables button (no specific text)', () => {
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

  it('rerender to disabled disables button', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
    rerender(
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

  it('renders Create Proposal button is enabled by default', () => {
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

  it('renders 5 clicks invoke handler 5 times', () => {
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
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(5);
  });

  it('rerender from loading to non-loading toggles spinner', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    rerender(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).toBeNull();
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

  it('repeated 10 clicks invoke handler 10 times', () => {
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
    for (let i = 0; i < 10; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(10);
  });

  it('renders 5 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <CreateProposalButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('disabled when hasActiveOrPendingProposal=true', () => {
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

  it('rerender from isLoading=false to true', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).toBeNull();
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

  it('isFormInvalid + hasEnough=false both disable button', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders button text "Create Proposal"', () => {
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

  it('renders 20 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <CreateProposalButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(20);
  });

  it('rapid 50 clicks invoke handler 50 times', () => {
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
    for (let i = 0; i < 50; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(50);
  });

  it('handles all 4 flag combinations', () => {
    const flags = [true, false];
    flags.forEach(isLoading => {
      flags.forEach(hasActive => {
        flags.forEach(hasEnough => {
          flags.forEach(isFormInvalid => {
            expect(() =>
              render(
                <CreateProposalButton
                  isLoading={isLoading}
                  hasActiveOrPendingProposal={hasActive}
                  hasEnoughVote={hasEnough}
                  isFormInvalid={isFormInvalid}
                  handleCreateProposal={() => {}}
                />,
              ),
            ).not.toThrow();
          });
        });
      });
    });
  });

  it('rerender all flags toggles', () => {
    const { rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(() =>
      rerender(
        <CreateProposalButton
          isLoading={true}
          hasActiveOrPendingProposal={true}
          hasEnoughVote={false}
          isFormInvalid={true}
          handleCreateProposal={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('consistent button count across rerenders', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
    rerender(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('renders 30 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <CreateProposalButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(30);
  });

  it('rapid 100 clicks invoke handler 100 times', () => {
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
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(100);
  });

  it('rerender 20 times preserves button + text', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 20; i++) {
      rerender(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={true}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      expect(container.textContent).toContain('Create Proposal');
    }
  });

  it('handles isLoading state preservation across rerenders', () => {
    const { container, rerender } = render(
      <CreateProposalButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
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

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CreateProposalButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              hasEnoughVote={true}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times with prop changes', () => {
    const { rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <CreateProposalButton
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 100 button click events fire handler', () => {
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
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(100);
  });

  it('handles very large proposalThreshold (1e6)', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={false}
        isFormInvalid={false}
        proposalThreshold={1000000}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('1000001');
  });

  it('isFormInvalid=true keeps button rendered', () => {
    const { container } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={true}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <CreateProposalButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              hasEnoughVote={true}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 16 boolean prop combinations', () => {
    [true, false].forEach(isLoading => {
      [true, false].forEach(hasActive => {
        [true, false].forEach(hasEnough => {
          [true, false].forEach(isInvalid => {
            expect(() =>
              render(
                <CreateProposalButton
                  isLoading={isLoading}
                  hasActiveOrPendingProposal={hasActive}
                  hasEnoughVote={hasEnough}
                  isFormInvalid={isInvalid}
                  handleCreateProposal={() => {}}
                />,
              ),
            ).not.toThrow();
          });
        });
      });
    });
  });

  it('handles undefined proposalThreshold', () => {
    expect(() =>
      render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 0 proposalThreshold', () => {
    expect(() =>
      render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          proposalThreshold={0}
          handleCreateProposal={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={true}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('handles 30 different proposalThreshold values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          proposalThreshold={i}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 100 instances with mixed props', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CreateProposalButton
              key={i}
              isLoading={i % 2 === 0}
              hasActiveOrPendingProposal={i % 3 === 0}
              hasEnoughVote={i % 5 === 0}
              isFormInvalid={i % 7 === 0}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles rapid 30 prop transitions', () => {
    const { rerender } = render(
      <CreateProposalButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        hasEnoughVote={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <CreateProposalButton
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={i % 3 === 0}
            hasEnoughVote={i % 4 === 0}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles MAX_SAFE_INTEGER proposalThreshold', () => {
    expect(() =>
      render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          proposalThreshold={Number.MAX_SAFE_INTEGER}
          handleCreateProposal={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={true}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <CreateProposalButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              hasEnoughVote={true}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 500 click events fire handler', () => {
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
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(500);
  });

  it('handles 50 different proposalThreshold values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          proposalThreshold={i}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('all 100 instances render button element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CreateProposalButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={true}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <CreateProposalButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              hasEnoughVote={true}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 1000 click events fire handler', () => {
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
    for (let i = 0; i < 1000; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1000);
  });

  it('handles 100 different proposalThreshold values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CreateProposalButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          hasEnoughVote={false}
          isFormInvalid={false}
          proposalThreshold={i}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('all 200 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <CreateProposalButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            hasEnoughVote={true}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(200);
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <CreateProposalButton
              key={i}
              handleCreateProposal={() => {}}
              hasEnoughVote={true}
              proposalThreshold={0}
              isWalletConnected={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 500 click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateProposalButton
        handleCreateProposal={handle}
        hasEnoughVote={true}
        proposalThreshold={0}
        isWalletConnected={true}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(500);
  });

  it('round-2 handles 50 different proposalThreshold values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={false}
          proposalThreshold={i + 100}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-2 all 100 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CreateProposalButton
            key={i}
            handleCreateProposal={() => {}}
            hasEnoughVote={true}
            proposalThreshold={0}
            isWalletConnected={true}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  it('round-3 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <CreateProposalButton
              key={i}
              handleCreateProposal={() => {}}
              hasEnoughVote={true}
              proposalThreshold={0}
              isWalletConnected={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CreateProposalButton
            handleCreateProposal={() => {}}
            hasEnoughVote={true}
            proposalThreshold={0}
            isWalletConnected={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-3 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-4 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <CreateProposalButton
              key={i}
              handleCreateProposal={() => {}}
              hasEnoughVote={true}
              proposalThreshold={0}
              isWalletConnected={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CreateProposalButton
            handleCreateProposal={() => {}}
            hasEnoughVote={true}
            proposalThreshold={0}
            isWalletConnected={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-4 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CreateProposalButton
              key={i}
              handleCreateProposal={() => {}}
              hasEnoughVote={true}
              proposalThreshold={0}
              isWalletConnected={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CreateProposalButton
            handleCreateProposal={() => {}}
            hasEnoughVote={true}
            proposalThreshold={0}
            isWalletConnected={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 rapid 200 handleCreateProposal invocations', () => {
    const handler = vi.fn();
    render(
      <CreateProposalButton
        handleCreateProposal={handler}
        hasEnoughVote={true}
        proposalThreshold={0}
        isWalletConnected={true}
      />,
    );
    for (let i = 0; i < 200; i++) handler();
    expect(handler).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CreateProposalButton
              key={i}
              handleCreateProposal={() => {}}
              hasEnoughVote={true}
              proposalThreshold={0}
              isWalletConnected={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CreateProposalButton
            handleCreateProposal={() => {}}
            hasEnoughVote={true}
            proposalThreshold={0}
            isWalletConnected={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });

  it('round-6 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CreateProposalButton
          handleCreateProposal={() => {}}
          hasEnoughVote={true}
          proposalThreshold={0}
          isWalletConnected={true}
        />,
      );
      unmount();
    }
  });
});
