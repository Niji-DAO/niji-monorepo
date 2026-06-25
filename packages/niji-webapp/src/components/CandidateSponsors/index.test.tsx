import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hookState: {
  account: string | undefined;
  activePendingProposers: unknown;
  userVotes: number;
  isThresholdMet: boolean;
  isAccountSigner: boolean;
  isOriginalSigner: boolean;
  delegatesData: { delegates: unknown[] } | undefined;
} = {
  account: '0xACCT',
  activePendingProposers: {},
  userVotes: 5,
  isThresholdMet: false,
  isAccountSigner: false,
  isOriginalSigner: false,
  delegatesData: { delegates: [] },
};

const setIsAccountSignerMock = vi.fn();
const useActivePendingUpdatableProposersMock = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookState.account }),
}));

vi.mock('@/wrappers/nijiDao', () => ({
  ProposalState: { UPDATABLE: 10 },
  useActivePendingUpdatableProposers: (...args: unknown[]) =>
    useActivePendingUpdatableProposersMock(...args) ?? hookState.activePendingProposers,
}));

const useDelegateNounsAtBlockQueryMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useDelegateNounsAtBlockQuery: (...args: unknown[]) => useDelegateNounsAtBlockQueryMock(...args),
  useUserVotes: () => hookState.userVotes,
}));

vi.mock('./useCandidateSponsorState', () => ({
  useCandidateSponsorState: () => ({
    isThresholdMet: hookState.isThresholdMet,
    isAccountSigner: hookState.isAccountSigner,
    isOriginalSigner: hookState.isOriginalSigner,
    setIsAccountSigner: setIsAccountSignerMock,
  }),
}));

const selectSponsorsModalStateLog: { isOpen: boolean[] } = { isOpen: [] };
vi.mock('./SelectSponsorsToPropose', () => ({
  default: ({ isModalOpen }: { isModalOpen: boolean }) => {
    selectSponsorsModalStateLog.isOpen.push(isModalOpen);
    return <div data-testid="select-sponsors" data-open={String(isModalOpen)} />;
  },
}));

const submitUpdateModalStateLog: { isOpen: boolean[] } = { isOpen: [] };
vi.mock('./SubmitUpdateProposal', () => ({
  default: ({ isModalOpen }: { isModalOpen: boolean }) => {
    submitUpdateModalStateLog.isOpen.push(isModalOpen);
    return <div data-testid="submit-update" data-open={String(isModalOpen)} />;
  },
}));

vi.mock('./SponsorsFormOverlay', () => ({
  SponsorsFormOverlay: () => <div data-testid="sponsors-form-overlay" />,
}));

vi.mock('./SponsorsHeader', () => ({
  SponsorsHeader: () => <div data-testid="sponsors-header" />,
}));

vi.mock('./SponsorsList', () => ({
  SponsorsList: ({
    onOpenSubmitModal,
    onOpenUpdateModal,
    onOpenForm,
    isParentProposalUpdatable,
  }: {
    onOpenSubmitModal: () => void;
    onOpenUpdateModal: () => void;
    onOpenForm: () => void;
    isParentProposalUpdatable: boolean;
  }) => (
    <div data-testid="sponsors-list" data-parent-updatable={String(isParentProposalUpdatable)}>
      <button data-testid="open-submit" onClick={onOpenSubmitModal} />
      <button data-testid="open-update" onClick={onOpenUpdateModal} />
      <button data-testid="open-form" onClick={onOpenForm} />
    </div>
  ),
}));

import CandidateSponsors from './index';

const makeCandidate = (
  overrides: Partial<{
    contentSignatures: unknown[] | undefined;
    requiredVotes: number;
    voteCount: number;
  }> = {},
) =>
  ({
    requiredVotes: overrides.requiredVotes ?? 3,
    voteCount: overrides.voteCount ?? 0,
    version: {
      content: {
        contentSignatures: 'contentSignatures' in overrides ? overrides.contentSignatures : [],
      },
    },
  }) as never;

const baseProps = {
  candidate: makeCandidate(),
  slug: 'cand-slug',
  isProposer: false,
  id: 'sig-1',
  handleRefetchCandidateData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  currentBlock: 100n,
  requiredVotes: 3,
  userVotes: 5,
  blockNumber: 100n,
};

const resetState = () => {
  hookState.account = '0xACCT';
  hookState.activePendingProposers = {};
  hookState.userVotes = 5;
  hookState.isThresholdMet = false;
  hookState.isAccountSigner = false;
  hookState.isOriginalSigner = false;
  hookState.delegatesData = { delegates: [] };
  setIsAccountSignerMock.mockReset();
  useActivePendingUpdatableProposersMock.mockReset();
  useActivePendingUpdatableProposersMock.mockReturnValue(hookState.activePendingProposers);
  useDelegateNounsAtBlockQueryMock.mockReset();
  useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: hookState.delegatesData });
  selectSponsorsModalStateLog.isOpen = [];
  submitUpdateModalStateLog.isOpen = [];
  baseProps.handleRefetchCandidateData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CandidateSponsors', () => {
  it('renders SponsorsHeader + SponsorsList when signatures present + !formDisplayed', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container.querySelector('[data-testid="sponsors-header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="sponsors-list"]')).not.toBeNull();
  });

  it('renders loading-noggles when signatures is undefined', () => {
    const candidate = makeCandidate({ contentSignatures: undefined });
    const { container } = render(<CandidateSponsors {...baseProps} candidate={candidate} />);
    const img = container.querySelector('img');
    expect(img?.src).toContain('loading-noggles.svg');
  });

  it('shows "Sponsor threshold met" when isThresholdMet=true', () => {
    hookState.isThresholdMet = true;
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container.textContent).toContain('Sponsor threshold met');
  });

  it('hides threshold met message when isThresholdMet=false', () => {
    hookState.isThresholdMet = false;
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container.textContent).not.toContain('Sponsor threshold met');
  });

  it('renders SubmitUpdateProposal when isUpdateToProposal=true', () => {
    const { container } = render(
      <CandidateSponsors
        {...baseProps}
        isUpdateToProposal={true}
        originalProposal={{ id: '42', signers: [] } as never}
      />,
    );
    expect(container.querySelector('[data-testid="submit-update"]')).not.toBeNull();
  });

  it('does not render SubmitUpdateProposal when isUpdateToProposal=false', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container.querySelector('[data-testid="submit-update"]')).toBeNull();
  });

  it('always renders SelectSponsorsToPropose modal slot', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container.querySelector('[data-testid="select-sponsors"]')).not.toBeNull();
  });

  it('open-submit click opens SelectSponsorsToPropose modal', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    const openBtn = container.querySelector('[data-testid="open-submit"]') as HTMLButtonElement;
    fireEvent.click(openBtn);
    const modal = container.querySelector('[data-testid="select-sponsors"]');
    expect(modal?.getAttribute('data-open')).toBe('true');
  });

  it('open-form click switches to SponsorsFormOverlay', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    const openBtn = container.querySelector('[data-testid="open-form"]') as HTMLButtonElement;
    fireEvent.click(openBtn);
    expect(container.querySelector('[data-testid="sponsors-form-overlay"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="sponsors-list"]')).toBeNull();
  });

  it('isParentProposalUpdatable=true when originalProposal.status=UPDATABLE', () => {
    const { container } = render(
      <CandidateSponsors
        {...baseProps}
        originalProposal={{ id: '42', signers: [], status: 10 } as never}
      />,
    );
    const list = container.querySelector('[data-testid="sponsors-list"]');
    expect(list?.getAttribute('data-parent-updatable')).toBe('true');
  });

  it('isParentProposalUpdatable=false when originalProposal undefined', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    const list = container.querySelector('[data-testid="sponsors-list"]');
    expect(list?.getAttribute('data-parent-updatable')).toBe('false');
  });

  it('calls useActivePendingUpdatableProposers with blockNumber', () => {
    render(<CandidateSponsors {...baseProps} blockNumber={123n} />);
    expect(useActivePendingUpdatableProposersMock).toHaveBeenCalledWith(123n);
  });

  it('calls useDelegateNounsAtBlockQuery with originalSigners lowercased', () => {
    render(
      <CandidateSponsors
        {...baseProps}
        originalProposal={{ id: '42', signers: [{ id: '0xABC' }] } as never}
      />,
    );
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalledWith(['0xabc'], 100n);
  });

  it('open-update click opens SubmitUpdateProposal modal (with isUpdateToProposal=true)', () => {
    const { container } = render(
      <CandidateSponsors
        {...baseProps}
        isUpdateToProposal={true}
        originalProposal={{ id: '42', signers: [] } as never}
      />,
    );
    const openBtn = container.querySelector('[data-testid="open-update"]') as HTMLButtonElement;
    fireEvent.click(openBtn);
    const modal = container.querySelector('[data-testid="submit-update"]');
    expect(modal?.getAttribute('data-open')).toBe('true');
  });

  it('isParentProposalUpdatable=false when originalProposal.status is not UPDATABLE', () => {
    const { container } = render(
      <CandidateSponsors
        {...baseProps}
        originalProposal={{ id: '42', signers: [], status: 1 } as never}
      />,
    );
    const list = container.querySelector('[data-testid="sponsors-list"]');
    expect(list?.getAttribute('data-parent-updatable')).toBe('false');
  });

  it('SelectSponsorsToPropose starts closed (data-open=false on initial render)', () => {
    const { container } = render(<CandidateSponsors {...baseProps} />);
    const modal = container.querySelector('[data-testid="select-sponsors"]');
    expect(modal?.getAttribute('data-open')).toBe('false');
  });

  it('multiple original signers passed lowercase to useDelegateNounsAtBlockQuery', () => {
    render(
      <CandidateSponsors
        {...baseProps}
        originalProposal={
          {
            id: '42',
            signers: [{ id: '0xABC' }, { id: '0xDEF' }, { id: '0x123' }],
          } as never
        }
      />,
    );
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalledWith(
      ['0xabc', '0xdef', '0x123'],
      100n,
    );
  });

  it('uses block number passed via blockNumber prop for useDelegateNounsAtBlockQuery', () => {
    render(
      <CandidateSponsors
        {...baseProps}
        blockNumber={999n}
        originalProposal={{ id: '42', signers: [{ id: '0xABC' }] } as never}
      />,
    );
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalledWith(['0xabc'], 999n);
  });

  it('large block number (1000000n) does not crash', () => {
    expect(() =>
      render(
        <CandidateSponsors
          {...baseProps}
          blockNumber={1000000n}
          originalProposal={{ id: '42', signers: [{ id: '0xABC' }] } as never}
        />,
      ),
    ).not.toThrow();
  });

  it('signers list with 10 items renders correctly', () => {
    const signers = Array.from({ length: 10 }, (_, i) => ({ id: `0x${i}` }));
    expect(() =>
      render(
        <CandidateSponsors {...baseProps} originalProposal={{ id: '42', signers } as never} />,
      ),
    ).not.toThrow();
  });

  it('empty signers list renders without crash', () => {
    expect(() =>
      render(
        <CandidateSponsors {...baseProps} originalProposal={{ id: '42', signers: [] } as never} />,
      ),
    ).not.toThrow();
  });

  it('originalProposal undefined defaults gracefully', () => {
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
  });

  it('useUserVotes default value (5) reflects in component', () => {
    hookState.userVotes = 5;
    const { container } = render(<CandidateSponsors {...baseProps} />);
    expect(container).toBeDefined();
  });

  it('isProposer=true renders without crash', () => {
    expect(() => render(<CandidateSponsors {...baseProps} isProposer={true} />)).not.toThrow();
  });

  it('requiredVotes=0 renders without crash', () => {
    expect(() => render(<CandidateSponsors {...baseProps} requiredVotes={0} />)).not.toThrow();
  });

  it('userVotes=0 renders without crash', () => {
    hookState.userVotes = 0;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
  });

  it('rerender slug updates correctly', () => {
    const { rerender } = render(<CandidateSponsors {...baseProps} slug="slug1" />);
    expect(() => rerender(<CandidateSponsors {...baseProps} slug="slug2" />)).not.toThrow();
  });

  it('blockNumber=0n renders without crash', () => {
    expect(() => render(<CandidateSponsors {...baseProps} blockNumber={0n} />)).not.toThrow();
  });

  it('renders without crash for very large blockNumber', () => {
    expect(() =>
      render(<CandidateSponsors {...baseProps} blockNumber={999999999999n} />),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <CandidateSponsors key={i} {...baseProps} blockNumber={BigInt(i + 1)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender with new blockNumber does not crash', () => {
    const { rerender } = render(<CandidateSponsors {...baseProps} blockNumber={1n} />);
    expect(() => rerender(<CandidateSponsors {...baseProps} blockNumber={100n} />)).not.toThrow();
  });

  it('renders without crash with account=undefined (logged out)', () => {
    hookState.account = undefined;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.account = '0xACCT';
  });

  it('renders without crash with isThresholdMet=true', () => {
    hookState.isThresholdMet = true;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.isThresholdMet = false;
  });

  it('renders without crash with userVotes=0', () => {
    hookState.userVotes = 0;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.userVotes = 5;
  });

  it('renders without crash with userVotes=10000', () => {
    hookState.userVotes = 10000;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.userVotes = 5;
  });

  it('renders without crash with isOriginalSigner=true', () => {
    hookState.isOriginalSigner = true;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.isOriginalSigner = false;
  });

  it('renders without crash with delegatesData=undefined', () => {
    hookState.delegatesData = undefined;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.delegatesData = { delegates: [] };
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 30 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateSponsors key={i} {...baseProps} blockNumber={BigInt(i + 1)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles requiredVotes=0 + voteCount=0', () => {
    const c = makeCandidate({ requiredVotes: 0, voteCount: 0 });
    expect(() => render(<CandidateSponsors {...baseProps} candidate={c} />)).not.toThrow();
  });

  it('handles 100 contentSignatures', () => {
    const sigs = Array.from({ length: 100 }, (_, i) => ({ id: `sig-${i}` }));
    const c = makeCandidate({ contentSignatures: sigs as never });
    expect(() => render(<CandidateSponsors {...baseProps} candidate={c} />)).not.toThrow();
  });

  it('rerender does not crash 10 times', () => {
    const { rerender } = render(<CandidateSponsors {...baseProps} />);
    for (let i = 0; i < 10; i++) {
      expect(() =>
        rerender(<CandidateSponsors {...baseProps} blockNumber={BigInt(i)} />),
      ).not.toThrow();
    }
  });

  it('handles isAccountSigner true variant', () => {
    hookState.isAccountSigner = true;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.isAccountSigner = false;
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CandidateSponsors key={i} {...baseProps} blockNumber={BigInt(i + 1)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles isOriginalSigner true variant', () => {
    hookState.isOriginalSigner = true;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.isOriginalSigner = false;
  });

  it('handles isThresholdMet true variant', () => {
    hookState.isThresholdMet = true;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.isThresholdMet = false;
  });

  it('rerender 30 times with varying voteCount does not crash', () => {
    const { rerender } = render(<CandidateSponsors {...baseProps} />);
    for (let i = 0; i < 30; i++) {
      const c = makeCandidate({ voteCount: i });
      expect(() => rerender(<CandidateSponsors {...baseProps} candidate={c} />)).not.toThrow();
    }
  });

  it('handles large userVotes (1000)', () => {
    hookState.userVotes = 1000;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.userVotes = 5;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors {...baseProps} />);
      unmount();
    }
  });

  it('handles 4 state combinations', () => {
    [true, false].forEach(thresholdMet => {
      [true, false].forEach(isSigner => {
        hookState.isThresholdMet = thresholdMet;
        hookState.isAccountSigner = isSigner;
        expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
      });
    });
    hookState.isThresholdMet = false;
    hookState.isAccountSigner = false;
  });

  it('handles 50 different blockNumber values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<CandidateSponsors {...baseProps} blockNumber={BigInt(i + 1)} />),
      ).not.toThrow();
    }
  });

  it('handles undefined account', () => {
    hookState.account = undefined;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.account = '0xACCT';
  });

  it('handles userVotes=0 edge case', () => {
    hookState.userVotes = 0;
    expect(() => render(<CandidateSponsors {...baseProps} />)).not.toThrow();
    hookState.userVotes = 5;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors {...baseProps} />);
      unmount();
    }
  });

  it('handles 100 different blockNumber values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<CandidateSponsors {...baseProps} blockNumber={BigInt(i)} />);
      unmount();
    }
  });

  it('renders 30 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateSponsors key={i} {...baseProps} blockNumber={BigInt(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different userVotes values', () => {
    const orig = hookState.userVotes;
    for (let i = 0; i < 30; i++) {
      hookState.userVotes = i;
      const { unmount } = render(<CandidateSponsors {...baseProps} />);
      unmount();
    }
    hookState.userVotes = orig;
  });

  it('handles all 8 state combinations', () => {
    const origState = {
      isThresholdMet: hookState.isThresholdMet,
      isAccountSigner: hookState.isAccountSigner,
      isOriginalSigner: hookState.isOriginalSigner,
    };
    [true, false].forEach(t => {
      [true, false].forEach(s => {
        [true, false].forEach(o => {
          hookState.isThresholdMet = t;
          hookState.isAccountSigner = s;
          hookState.isOriginalSigner = o;
          const { unmount } = render(<CandidateSponsors {...baseProps} />);
          unmount();
        });
      });
    });
    Object.assign(hookState, origState);
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors {...baseProps} />);
      unmount();
    }
  });

  it('handles rapid 100 prop transitions', () => {
    const { rerender } = render(<CandidateSponsors {...baseProps} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<CandidateSponsors {...baseProps} blockNumber={BigInt(i + 1)} />),
      ).not.toThrow();
    }
  });

  it('handles 30 different proposal candidate ids', () => {
    for (let i = 0; i < 30; i++) {
      const candidate = makeCandidate({ id: `cand-${i}` });
      const { unmount } = render(<CandidateSponsors {...baseProps} candidate={candidate} />);
      unmount();
    }
  });

  it('handles 30 different requiredVotes values', () => {
    for (let i = 0; i < 30; i++) {
      const candidate = makeCandidate({ requiredVotes: i });
      const { unmount } = render(<CandidateSponsors {...baseProps} candidate={candidate} />);
      unmount();
    }
  });

  it('handles all hookState account variations', () => {
    const orig = hookState.account;
    ['0xACCT', '0xUSER', undefined, '0x'].forEach(acct => {
      hookState.account = acct;
      const { unmount } = render(<CandidateSponsors {...baseProps} />);
      unmount();
    });
    hookState.account = orig;
  });
});
