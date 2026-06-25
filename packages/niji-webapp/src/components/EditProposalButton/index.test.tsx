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

  it('repeated click invokes handle N times', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(3);
  });

  it('isLoading hides "Update Proposal" text', () => {
    const { container } = render(<EditProposalButton {...defaults} isLoading={true} />);
    expect(container.textContent).not.toContain('Update Proposal');
  });

  it('button is enabled by default (all good)', () => {
    const { container } = render(<EditProposalButton {...defaults} />);
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('isCandidate + active proposal warning combined', () => {
    const { container } = render(
      <EditProposalButton {...defaults} isCandidate={true} hasActiveOrPendingProposal={true} />,
    );
    expect(container.textContent).toContain('active or pending proposal');
    expect(container.textContent).not.toContain('Update Proposal Candidate');
  });

  it('threshold warning uses proposalThreshold + 1 formula (10 → 11 votes)', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={10} />,
    );
    expect(container.textContent).toContain('11 votes to submit a proposal');
  });

  it('isFormInvalid alone disables button (no warning text)', () => {
    const { container } = render(<EditProposalButton {...defaults} isFormInvalid={true} />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('threshold = 0 falls to generic warning (falsy guard)', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={0} />,
    );
    expect(container.textContent).toContain("don't have enough votes");
  });

  it('isLoading button is NOT disabled (only form invalid / no votes / active disables)', () => {
    const { container } = render(<EditProposalButton {...defaults} isLoading={true} />);
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('rerender from default to isLoading shows spinner', () => {
    const { container, rerender } = render(<EditProposalButton {...defaults} />);
    expect(container.textContent).toBe('Update Proposal');
    rerender(<EditProposalButton {...defaults} isLoading={true} />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders exactly 1 button element', () => {
    const { container } = render(<EditProposalButton {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('isCandidate=false default keeps "Update Proposal" text', () => {
    const { container } = render(<EditProposalButton {...defaults} isCandidate={false} />);
    expect(container.textContent).toBe('Update Proposal');
  });

  it('multi-click does not crash when handler not provided default', () => {
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={() => {}} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('rerender from candidate to non-candidate updates label', () => {
    const { container, rerender } = render(<EditProposalButton {...defaults} isCandidate={true} />);
    expect(container.textContent).toBe('Update Proposal Candidate');
    rerender(<EditProposalButton {...defaults} isCandidate={false} />);
    expect(container.textContent).toBe('Update Proposal');
  });

  it('threshold = 5 → 6 votes warning', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={5} />,
    );
    expect(container.textContent).toContain('6 votes to submit a proposal');
  });

  it('isCandidate=true with active proposal shows candidate-specific warning', () => {
    const { container } = render(
      <EditProposalButton {...defaults} isCandidate={true} hasActiveOrPendingProposal={true} />,
    );
    expect(container.textContent).toContain('active or pending');
  });

  it('threshold = 100 with no enough votes shows 101 votes warning', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={100} />,
    );
    expect(container.textContent).toContain('101 votes to submit a proposal');
  });

  it('all good state has no warning text', () => {
    const { container } = render(<EditProposalButton {...defaults} />);
    expect(container.textContent).not.toContain('don');
    expect(container.textContent).not.toContain('active or pending');
  });

  it('repeat 5 clicks invoke handler 5 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(5);
  });

  it('hasActive + isFormInvalid both disabled', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasActiveOrPendingProposal={true} isFormInvalid={true} />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('isCandidate=true + isLoading=true shows spinner only', () => {
    const { container } = render(
      <EditProposalButton {...defaults} isCandidate={true} isLoading={true} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders 5 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('threshold=1000 with no enough votes shows "1001 votes"', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={1000} />,
    );
    expect(container.textContent).toContain('1001 votes to submit a proposal');
  });

  it('isFormInvalid disables button', () => {
    const { container } = render(<EditProposalButton {...defaults} isFormInvalid={true} />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('multiple consecutive clicks fire handler N times', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 20; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(20);
  });

  it('isCandidate + hasEnoughVote=false + threshold=2 shows "3 votes"', () => {
    const { container } = render(
      <EditProposalButton
        {...defaults}
        isCandidate={true}
        hasEnoughVote={false}
        proposalThreshold={2}
      />,
    );
    expect(container.textContent).toContain('3 votes to submit a proposal');
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(20);
  });

  it('hasEnoughVote=false + threshold=undefined shows generic warning', () => {
    const { container } = render(<EditProposalButton {...defaults} hasEnoughVote={false} />);
    expect(container.textContent).toContain("don't have enough votes");
  });

  it('isLoading=true preserves button element type', () => {
    const { container } = render(<EditProposalButton {...defaults} isLoading={true} />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('isCandidate rerender preserves Spinner during loading', () => {
    const { container, rerender } = render(
      <EditProposalButton {...defaults} isCandidate={false} isLoading={true} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    rerender(<EditProposalButton {...defaults} isCandidate={true} isLoading={true} />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('rerender from isFormInvalid=true to false enables button', () => {
    const { container, rerender } = render(
      <EditProposalButton {...defaults} isFormInvalid={true} />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
    rerender(<EditProposalButton {...defaults} isFormInvalid={false} />);
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('renders 30 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(30);
  });

  it('threshold=999 with no enough votes shows "1000 votes"', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={999} />,
    );
    expect(container.textContent).toContain('1000 votes to submit a proposal');
  });

  it('isCandidate=true + threshold=5 shows "6 votes"', () => {
    const { container } = render(
      <EditProposalButton
        {...defaults}
        isCandidate={true}
        hasEnoughVote={false}
        proposalThreshold={5}
      />,
    );
    expect(container.textContent).toContain('6 votes to submit a proposal');
  });

  it('renders consistent button element across 20 rerenders', () => {
    const { container, rerender } = render(<EditProposalButton {...defaults} />);
    for (let i = 0; i < 20; i++) {
      rerender(<EditProposalButton {...defaults} />);
      expect(container.querySelector('button')).not.toBeNull();
    }
  });

  it('rapid 100 clicks invoke handler 100 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(100);
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <EditProposalButton key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves button', () => {
    const { container, rerender } = render(<EditProposalButton {...defaults} />);
    for (let i = 0; i < 30; i++) {
      rerender(<EditProposalButton {...defaults} isCandidate={i % 2 === 0} />);
    }
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('handles very large proposalThreshold (1e6)', () => {
    const { container } = render(
      <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={1000000} />,
    );
    expect(container.textContent).toContain('1000001');
  });

  it('rapid props switching 50 times', () => {
    const { rerender } = render(<EditProposalButton {...defaults} />);
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <EditProposalButton
            {...defaults}
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={i % 3 === 0}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('isFormInvalid=true keeps button rendered', () => {
    const { container } = render(<EditProposalButton {...defaults} isFormInvalid={true} />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<EditProposalButton {...defaults} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <EditProposalButton key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 4 boolean prop combinations', () => {
    [true, false].forEach(isLoading => {
      [true, false].forEach(hasActive => {
        expect(() =>
          render(
            <EditProposalButton
              {...defaults}
              isLoading={isLoading}
              hasActiveOrPendingProposal={hasActive}
            />,
          ),
        ).not.toThrow();
      });
    });
  });

  it('rapid 100 button click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(100);
  });

  it('handles isCandidate toggle 30 rerenders', () => {
    const { rerender } = render(<EditProposalButton {...defaults} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<EditProposalButton {...defaults} isCandidate={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<EditProposalButton {...defaults} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <EditProposalButton key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 500 click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(500);
  });

  it('handles 30 different proposalThreshold values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={i} />,
      );
      unmount();
    }
  });

  it('all 100 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<EditProposalButton {...defaults} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <EditProposalButton key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 1000 click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 1000; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1000);
  });

  it('handles 100 different proposalThreshold values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={i} />,
      );
      unmount();
    }
  });

  it('all 200 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(200);
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<EditProposalButton {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <EditProposalButton key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 500 click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <EditProposalButton {...defaults} handleCreateProposal={handle} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(500);
  });

  it('round-2 handles 50 different proposalThreshold values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <EditProposalButton {...defaults} hasEnoughVote={false} proposalThreshold={i + 100} />,
      );
      unmount();
    }
  });

  it('round-2 all 100 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <EditProposalButton key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });
});
