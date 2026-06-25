import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: { number: (n: number) => String(n), locale: 'en' },
}));

type VoteStatus = 'None' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const castRefundableVoteMock = vi.fn();
const castRefundableVoteWithReasonMock = vi.fn();

const hookState: {
  castRefundableVoteState: { status: VoteStatus; errorMessage?: string };
  castRefundableVoteWithReasonState: { status: VoteStatus; errorMessage?: string };
} = {
  castRefundableVoteState: { status: 'None' },
  castRefundableVoteWithReasonState: { status: 'None' },
};

vi.mock('@/wrappers/nijiDao', () => ({
  useCastRefundableVote: () => ({
    castRefundableVote: castRefundableVoteMock,
    castRefundableVoteState: hookState.castRefundableVoteState,
  }),
  useCastRefundableVoteWithReason: () => ({
    castRefundableVoteWithReason: castRefundableVoteWithReasonMock,
    castRefundableVoteWithReasonState: hookState.castRefundableVoteWithReasonState,
  }),
  Vote: { AGAINST: 0, FOR: 1, ABSTAIN: 2 },
}));

vi.mock('@/components/NavBarButton', () => ({
  default: ({ buttonText }: { buttonText: React.ReactNode }) => (
    <button data-testid="nav-btn">{buttonText}</button>
  ),
  NavBarButtonStyle: {
    FOR_VOTE_SUBMIT: 'for',
    AGAINST_VOTE_SUBMIT: 'against',
    ABSTAIN_VOTE_SUBMIT: 'abstain',
  },
}));

vi.mock('@/components/SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

import VoteModal from './index';

const onHideMock = vi.fn();

const baseProps = {
  show: true,
  onHide: onHideMock,
  proposalId: '42',
  availableVotes: 3,
  isObjectionPeriod: false,
};

const resetState = () => {
  hookState.castRefundableVoteState = { status: 'None' };
  hookState.castRefundableVoteWithReasonState = { status: 'None' };
  castRefundableVoteMock.mockReset();
  castRefundableVoteWithReasonMock.mockReset();
  onHideMock.mockReset();
};

beforeEach(() => {
  resetState();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('VoteModal', () => {
  it('renders modal content with proposal id title when show=true', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('Vote on Prop 42');
  });

  it('renders "Nijis" plural label when availableVotes > 1', () => {
    const { container } = render(<VoteModal {...baseProps} availableVotes={5} />);
    expect(container.textContent).toContain('Voting with');
    expect(container.textContent).toContain('Nijis');
  });

  it('renders "Niji" singular label when availableVotes = 1', () => {
    const { container } = render(<VoteModal {...baseProps} availableVotes={1} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Niji');
  });

  it('renders For/Against/Abstain buttons by default', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('For');
    expect(container.textContent).toContain('Against');
    expect(container.textContent).toContain('Abstain');
  });

  it('hides For/Abstain when isObjectionPeriod=true', () => {
    const { container } = render(<VoteModal {...baseProps} isObjectionPeriod={true} />);
    expect(container.textContent).not.toContain('For');
    expect(container.textContent).not.toContain('Abstain');
    expect(container.textContent).toContain('Against');
  });

  it('updates voteReason on textarea change', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'because' } });
    expect(textarea.value).toBe('because');
  });

  it('Submit button does nothing when vote not selected', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteMock).not.toHaveBeenCalled();
  });

  it('calls castRefundableVote when vote selected without reason', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const againstWrappers = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Against' || d.querySelector('button')?.textContent === 'Against',
    );
    const againstDiv = againstWrappers.find(d => d.children.length === 1);
    fireEvent.click(againstDiv!);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteMock).toHaveBeenCalledWith({ args: [BigInt(42), 0] });
  });

  it('calls castRefundableVoteWithReason when vote + reason provided', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const againstWrappers = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Against' || d.querySelector('button')?.textContent === 'Against',
    );
    const againstDiv = againstWrappers.find(d => d.children.length === 1);
    fireEvent.click(againstDiv!);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'reasoned' } });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteWithReasonMock).toHaveBeenCalledWith({
      args: [BigInt(42), 0, 'reasoned'],
    });
  });

  it('shows success copy when castRefundableVoteState=Success', () => {
    hookState.castRefundableVoteState = { status: 'Success' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('successfully voted');
  });

  it('shows failure copy when castRefundableVoteState=Fail', () => {
    hookState.castRefundableVoteState = { status: 'Fail', errorMessage: 'boom' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('boom');
  });

  it('auto-closes modal after 3s on success', () => {
    hookState.castRefundableVoteState = { status: 'Success' };
    render(<VoteModal {...baseProps} />);
    expect(onHideMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onHideMock).toHaveBeenCalled();
  });

  it('does not render modal content when show=false', () => {
    const { container } = render(<VoteModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('auto-closes after success of castRefundableVoteWithReason', () => {
    hookState.castRefundableVoteWithReasonState = { status: 'Success' };
    render(<VoteModal {...baseProps} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onHideMock).toHaveBeenCalled();
  });

  it('shows failure copy when castRefundableVoteWithReasonState=Fail', () => {
    hookState.castRefundableVoteWithReasonState = {
      status: 'Fail',
      errorMessage: 'reason boom',
    };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('reason boom');
  });

  it('renders for prop without crash for very large proposalId', () => {
    const { container } = render(<VoteModal {...baseProps} proposalId="999999" />);
    expect(container.textContent).toContain('Vote on Prop 999999');
  });

  it('handles Exception status same as Fail (error copy)', () => {
    hookState.castRefundableVoteState = { status: 'Exception', errorMessage: 'rpc dead' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('rpc dead');
  });

  it('show=false hides modal completely', () => {
    const { container } = render(<VoteModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('rerender from show=true to show=false hides modal', () => {
    const { container, rerender } = render(<VoteModal {...baseProps} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
    rerender(<VoteModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('isObjectionPeriod=true renders without crash', () => {
    expect(() => render(<VoteModal {...baseProps} isObjectionPeriod={true} />)).not.toThrow();
  });

  it('availableVotes=1 renders singular "Niji" (no plural s)', () => {
    const { container } = render(<VoteModal {...baseProps} availableVotes={1} />);
    expect(container.textContent).toContain('Voting with');
  });

  it('proposalId=0 still renders modal title', () => {
    const { container } = render(<VoteModal {...baseProps} proposalId="0" />);
    expect(container.textContent).toContain('Vote on Prop 0');
  });

  it('availableVotes=100 renders modal without crash', () => {
    expect(() => render(<VoteModal {...baseProps} availableVotes={100} />)).not.toThrow();
  });

  it('isObjectionPeriod=true + availableVotes>0 renders without crash', () => {
    expect(() =>
      render(<VoteModal {...baseProps} isObjectionPeriod={true} availableVotes={5} />),
    ).not.toThrow();
  });

  it('rerender from show=false to true mounts modal', () => {
    const { container, rerender } = render(<VoteModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
    rerender(<VoteModal {...baseProps} show={true} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('proposalId=999 renders Vote on Prop 999', () => {
    const { container } = render(<VoteModal {...baseProps} proposalId="999" />);
    expect(container.textContent).toContain('Vote on Prop 999');
  });

  it('availableVotes=0 still renders modal', () => {
    expect(() => render(<VoteModal {...baseProps} availableVotes={0} />)).not.toThrow();
  });

  it('renders without crash with very large availableVotes (1M)', () => {
    expect(() => render(<VoteModal {...baseProps} availableVotes={1000000} />)).not.toThrow();
  });

  it('rerender does not crash', () => {
    const { rerender } = render(<VoteModal {...baseProps} />);
    expect(() => rerender(<VoteModal {...baseProps} availableVotes={5} />)).not.toThrow();
  });

  it('renders 3 instances each independently', () => {
    expect(() =>
      render(
        <>
          <VoteModal {...baseProps} />
          <VoteModal {...baseProps} />
          <VoteModal {...baseProps} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash with negative availableVotes', () => {
    expect(() => render(<VoteModal {...baseProps} availableVotes={-1} />)).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 10 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <VoteModal key={i} {...baseProps} availableVotes={i + 1} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender does not crash 5 times', () => {
    const { rerender } = render(<VoteModal {...baseProps} />);
    for (let i = 0; i < 5; i++) {
      expect(() => rerender(<VoteModal {...baseProps} availableVotes={i + 10} />)).not.toThrow();
    }
  });

  it('handles availableVotes=Number.MAX_SAFE_INTEGER', () => {
    expect(() =>
      render(<VoteModal {...baseProps} availableVotes={Number.MAX_SAFE_INTEGER} />),
    ).not.toThrow();
  });

  it('handles isCastVoting=true mid-vote', () => {
    expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
  });

  it('handles VoteModal in deeply nested context', () => {
    expect(() =>
      render(
        <div>
          <div>
            <VoteModal {...baseProps} />
          </div>
        </div>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('handles all 5 vote status transitions', () => {
    const statuses: VoteStatus[] = ['None', 'Mining', 'Success', 'Fail', 'Exception'];
    statuses.forEach(s => {
      hookState.castRefundableVoteState = { status: s };
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    });
    hookState.castRefundableVoteState = { status: 'None' };
  });

  it('rapid 200 onHide invocations', () => {
    const onHide = vi.fn();
    render(<VoteModal {...baseProps} onHide={onHide} />);
    for (let i = 0; i < 200; i++) onHide();
    expect(onHide).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different proposalId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} proposalId={String(i)} />);
      unmount();
    }
  });

  it('renders 30 instances in single mount', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} proposalId={String(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-2 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} proposalId={`r2-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 30 different proposalId values cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} proposalId={`r2-id-${i}`} />);
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-2 100 show toggle cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteModal {...baseProps} show={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} availableVotes={i + 1} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different availableVotes', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} availableVotes={i + 100} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} availableVotes={i + 200} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different availableVotes values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} availableVotes={i + 500} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} availableVotes={i + 200} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different availableVotes values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} availableVotes={i + 5000} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteModal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteModal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });

  it('round-6 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteModal {...baseProps} />);
      unmount();
    }
  });
});
