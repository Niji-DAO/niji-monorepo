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
});
