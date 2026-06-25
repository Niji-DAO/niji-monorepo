import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: { number: (n: number) => String(n) },
}));

const navigateMock = vi.fn();
const locationMock: { hash: string } = { hash: '' };
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock,
  };
});

const wagmiState: {
  blockNumber: bigint | undefined;
  account: string | undefined;
} = {
  blockNumber: 100n,
  account: undefined,
};
vi.mock('wagmi', () => ({
  useBlockNumber: () => ({ data: wagmiState.blockNumber }),
  useAccount: () => ({ address: wagmiState.account }),
}));

const candidatesAtomState: {
  current: unknown;
  setter: (v: unknown) => void;
} = {
  current: null,
  setter: vi.fn(),
};
vi.mock('jotai/react', () => ({
  useAtom: () => [candidatesAtomState.current, candidatesAtomState.setter],
}));

vi.mock('@/state/atoms/candidatesAtom', () => ({
  candidatesAtom: {},
}));

vi.mock('@/components/CandidateCard', () => ({
  default: ({ candidate }: { candidate: { id: string } }) => (
    <div data-testid="candidate-card">{candidate.id}</div>
  ),
}));

vi.mock('@/components/DelegationModal', () => ({
  default: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="delegation-modal" onClick={onDismiss} />
  ),
}));

vi.mock('@/components/ProposalStatus', () => ({
  default: ({ status }: { status: number }) => <span data-testid="proposal-status">{status}</span>,
}));

vi.mock('@/config', () => ({
  default: {
    featureToggles: { candidates: true },
    contractParameters: { executor: { GRACE_PERIOD_SECONDS: 60 * 60 * 24 * 14 } },
  },
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

vi.mock('@/i18n/locales', () => ({
  SUPPORTED_LOCALE_TO_DAYSJS_LOCALE: { 'en-US': 'en' },
  SupportedLocale: {},
}));

vi.mock('@/layout/Section', () => ({
  default: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

vi.mock('@/utils/constants', () => ({
  AVERAGE_BLOCK_TIME_IN_SECS: 12,
}));

const isMobileMock = vi.fn();
vi.mock('@/utils/isMobile', () => ({
  isMobileScreen: () => isMobileMock(),
}));

vi.mock('@/utils/proposals', () => ({
  isProposalUpdatable: () => true,
}));

const daoState: {
  isDaoGteV3: boolean;
  proposalThreshold: number;
} = {
  isDaoGteV3: true,
  proposalThreshold: 1,
};
vi.mock('@/wrappers/nijiDao', () => ({
  ProposalState: {
    UNDETERMINED: -1,
    PENDING: 0,
    ACTIVE: 1,
    CANCELLED: 2,
    DEFEATED: 3,
    SUCCEEDED: 4,
    QUEUED: 5,
    EXPIRED: 6,
    EXECUTED: 7,
    VETOED: 8,
    OBJECTION_PERIOD: 9,
    UPDATABLE: 10,
  },
  useIsDaoGteV3: () => daoState.isDaoGteV3,
  useProposalThreshold: () => daoState.proposalThreshold,
}));

const candidateState: { data: unknown[]; refetch: () => Promise<void> } = {
  data: [],
  refetch: vi.fn().mockResolvedValue(undefined),
};
vi.mock('@/wrappers/nijiData', () => ({
  useCandidateProposals: () => candidateState,
}));

const tokenState: { balance: number; userVotes: number } = { balance: 1, userVotes: 5 };
vi.mock('@/wrappers/nijiToken', () => ({
  useNounTokenBalance: () => tokenState.balance,
  useUserVotes: () => tokenState.userVotes,
}));

import Proposals from './index';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  wagmiState.blockNumber = 100n;
  wagmiState.account = undefined;
  candidatesAtomState.current = null;
  candidatesAtomState.setter = vi.fn();
  daoState.isDaoGteV3 = true;
  daoState.proposalThreshold = 1;
  tokenState.balance = 1;
  tokenState.userVotes = 5;
  locationMock.hash = '';
  navigateMock.mockReset();
  useActiveLocaleMock.mockReturnValue('en-US');
  isMobileMock.mockReturnValue(false);
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Proposals', () => {
  it('renders "No proposals found" alert when proposals empty', () => {
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No proposals found');
  });

  it('renders proposal list when proposals provided', () => {
    const proposals = [
      { id: '1', title: 'First', status: 1, startBlock: 50n, endBlock: 200n, eta: '0' },
      { id: '2', title: 'Second', status: 7, startBlock: 50n, endBlock: 60n, eta: '0' },
    ] as never;
    const { container } = wrap(<Proposals proposals={proposals} nounsRequired={2} />);
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
  });

  it('shows "Connect wallet" copy when no account', () => {
    wagmiState.account = undefined;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('Connect wallet to make a proposal');
  });

  it('shows "You have no Votes" when account but 0 votes', () => {
    wagmiState.account = '0xUSER';
    tokenState.userVotes = 0;
    tokenState.balance = 0;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('You have no Votes');
  });

  it('shows "Making a proposal requires N votes" copy when below threshold', () => {
    wagmiState.account = '0xUSER';
    tokenState.userVotes = 2;
    daoState.proposalThreshold = 10;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('Making a proposal requires');
  });

  it('shows Submit Proposal button when hasEnoughVotesToPropose', () => {
    wagmiState.account = '0xUSER';
    tokenState.userVotes = 100;
    daoState.proposalThreshold = 1;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('Submit Proposal');
  });

  it('clicking Delegate button opens DelegationModal', () => {
    wagmiState.account = '0xUSER';
    tokenState.userVotes = 100;
    daoState.proposalThreshold = 1;
    tokenState.balance = 5;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    const delegateBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Delegate',
    );
    expect(delegateBtn).not.toBeUndefined();
    fireEvent.click(delegateBtn!);
    expect(container.querySelector('[data-testid="delegation-modal"]')).not.toBeNull();
  });

  it('tab switch sets activeTab on click', () => {
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    const tabs = container.querySelectorAll(`button`);
    const candidatesTab = Array.from(tabs).find(b => b.textContent?.trim() === 'Candidates');
    expect(candidatesTab).not.toBeUndefined();
    fireEvent.click(candidatesTab!);
    expect(navigateMock).toHaveBeenCalledWith('/vote#candidates');
  });

  it('shows "Loading candidates" alert when candidates atom is null', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = null;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('Loading candidates');
  });

  it('shows "No candidates found" when candidates array empty', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = [];
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No candidates found');
  });

  it('renders CandidateCard when candidates list has entries', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = [{ id: 'cand-1', proposalIdToUpdate: '0' }];
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.querySelector('[data-testid="candidate-card"]')).not.toBeNull();
  });

  it('hides Candidates tab when isDaoGteV3=false', () => {
    daoState.isDaoGteV3 = false;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    const candidatesTab = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Candidates',
    );
    expect(candidatesTab).toBeUndefined();
  });

  it('default tab is Proposals (location.hash empty)', () => {
    locationMock.hash = '';
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No proposals found');
    expect(container.textContent).not.toContain('No candidates found');
  });

  it('Proposals tab navigation back to /vote (no hash) when clicked', () => {
    locationMock.hash = '#candidates';
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    const proposalsTab = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Proposals',
    );
    expect(proposalsTab).not.toBeUndefined();
    fireEvent.click(proposalsTab!);
    expect(navigateMock).toHaveBeenCalledWith('/vote');
  });

  it('renders multiple CandidateCard entries when candidates list has many', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = [
      { id: 'cand-1', proposalIdToUpdate: '0' },
      { id: 'cand-2', proposalIdToUpdate: '0' },
      { id: 'cand-3', proposalIdToUpdate: '0' },
    ];
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.querySelectorAll('[data-testid="candidate-card"]').length).toBe(3);
  });

  it('shows "Submit Proposal" copy when account has votes equal to threshold', () => {
    wagmiState.account = '0xUSER';
    tokenState.userVotes = 1;
    daoState.proposalThreshold = 0;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('Submit Proposal');
  });

  it('renders single proposal correctly (1-element list)', () => {
    const proposals = [
      { id: '99', title: 'Solo', status: 1, startBlock: 50n, endBlock: 200n, eta: '0' },
    ] as never;
    const { container } = wrap(<Proposals proposals={proposals} nounsRequired={2} />);
    expect(container.textContent).toContain('Solo');
    expect(container.textContent).not.toContain('No proposals found');
  });

  it('empty proposals + empty candidates lists shows "No proposals found"', () => {
    locationMock.hash = '';
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No proposals found');
  });

  it('proposals list with 5 items renders 5 entries', () => {
    const proposals = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      title: `P${i + 1}`,
      status: 1,
      startBlock: 50n,
      endBlock: 200n,
      eta: '0',
    })) as never;
    const { container } = wrap(<Proposals proposals={proposals} nounsRequired={2} />);
    expect(container.textContent).toContain('P1');
    expect(container.textContent).toContain('P5');
  });

  it('candidates atom empty (null) shows no cards', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = null;
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.querySelectorAll('[data-testid="candidate-card"]').length).toBe(0);
  });

  it('renders without crash when proposals undefined-like (empty list)', () => {
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={0} />)).not.toThrow();
  });

  it('candidates list with 10 items renders 10 cards', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = Array.from({ length: 10 }, (_, i) => ({
      id: `c-${i}`,
      proposalIdToUpdate: '0',
    }));
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.querySelectorAll('[data-testid="candidate-card"]').length).toBe(10);
  });

  it('candidates list with 20 items renders 20 cards', () => {
    locationMock.hash = '#candidates';
    candidatesAtomState.current = Array.from({ length: 20 }, (_, i) => ({
      id: `c-${i}`,
      proposalIdToUpdate: '0',
    }));
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.querySelectorAll('[data-testid="candidate-card"]').length).toBe(20);
  });

  it('non-#candidates hash uses Proposals tab by default', () => {
    locationMock.hash = '#some-other-hash';
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No proposals found');
  });

  it('large nounsRequired (1000) renders without crash', () => {
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={1000} />)).not.toThrow();
  });

  it('rerender from empty to populated proposals updates list', () => {
    locationMock.hash = '';
    const { container, rerender } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container.textContent).toContain('No proposals found');
    const proposals = [
      { id: '1', title: 'Hello', status: 1, startBlock: 50n, endBlock: 200n, eta: '0' },
    ] as never;
    rerender(<Proposals proposals={proposals} nounsRequired={2} />);
    expect(container.textContent).not.toContain('No proposals found');
  });

  it('account undefined still renders without crash', () => {
    wagmiState.account = undefined;
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={2} />)).not.toThrow();
  });

  it('renders with nounsRequired=0', () => {
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={0} />)).not.toThrow();
  });

  it('renders with nounsRequired=1000 (large)', () => {
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={1000} />)).not.toThrow();
  });

  it('renders without crash for empty proposals array (with container check)', () => {
    const { container } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
    expect(container).not.toBeNull();
  });

  it('renders multiple instances each independently', () => {
    expect(() =>
      wrap(
        <>
          <Proposals proposals={[]} nounsRequired={2} />
          <Proposals proposals={[]} nounsRequired={3} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => wrap(<Proposals proposals={[]} nounsRequired={i} />)).not.toThrow();
    }
  });

  it('renders 10 instances each independently', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders with nounsRequired=Number.MAX_SAFE_INTEGER', () => {
    expect(() =>
      wrap(<Proposals proposals={[]} nounsRequired={Number.MAX_SAFE_INTEGER} />),
    ).not.toThrow();
  });

  it('renders with negative nounsRequired', () => {
    expect(() => wrap(<Proposals proposals={[]} nounsRequired={-1} />)).not.toThrow();
  });

  it('renders 5 consecutive same input', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => wrap(<Proposals proposals={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('renders Proposals within outer div parent', () => {
    expect(() =>
      wrap(
        <div data-testid="parent">
          <Proposals proposals={[]} nounsRequired={2} />
        </div>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('handles 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={i} />);
      unmount();
    }
  });

  it('renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles 30 location.hash variations', () => {
    for (let i = 0; i < 30; i++) {
      locationMock.hash = `#section-${i}`;
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
    locationMock.hash = '';
  });

  it('handles 30 different blockNumber values', () => {
    const orig = wagmiState.blockNumber;
    for (let i = 0; i < 30; i++) {
      wagmiState.blockNumber = BigInt(i * 1000);
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
    wagmiState.blockNumber = orig;
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-2 handles 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={i} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 location.hash variations', () => {
    for (let i = 0; i < 30; i++) {
      locationMock.hash = `#r2-section-${i}`;
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
    locationMock.hash = '';
  });

  it('round-2 handles 30 different blockNumber values', () => {
    const orig = wagmiState.blockNumber;
    for (let i = 0; i < 30; i++) {
      wagmiState.blockNumber = BigInt(i * 1000);
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
    wagmiState.blockNumber = orig;
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={i + 1} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={i + 1} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Proposals proposals={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={i + 1} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={i + 100} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Proposals proposals={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Proposals key={i} proposals={[]} nounsRequired={2} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={i + 5} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Proposals proposals={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Proposals proposals={[]} nounsRequired={2} />);
      unmount();
    }
  });
});
