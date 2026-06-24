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
});
