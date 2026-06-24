import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    number: (n: number) => String(n),
    date: () => 'formatted-date',
  },
}));

vi.mock('@/components/ByLineHoverCard', () => ({
  default: () => <span data-testid="byline-hover" />,
}));

vi.mock('@/components/HoverCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="hover-card">{children}</span>
  ),
}));

vi.mock('@/components/ProposalContent', () => ({
  transactionIconLink: (hash: string) => <a data-testid="tx-link">{hash}</a>,
}));

vi.mock('@/components/ProposalStatus', () => ({
  default: ({ status }: { status: number }) => <span data-testid="proposal-status">{status}</span>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short-address">{address}</span>,
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

const useBlockTimestampMock = vi.fn();
vi.mock('@/hooks/useBlockTimestamp', () => ({
  useBlockTimestamp: () => useBlockTimestampMock(),
}));

vi.mock('@/i18n/locales', () => ({
  Locales: { ja_JP: 'ja-JP', en_US: 'en-US' },
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
}));

const isMobileMock = vi.fn();
vi.mock('@/utils/isMobile', () => ({
  isMobileScreen: () => isMobileMock(),
}));

vi.mock('@/utils/timeUtils', () => ({
  relativeTimestamp: () => '1 day ago',
}));

const useBlockNumberMock = vi.fn();
vi.mock('wagmi', () => ({
  useBlockNumber: () => ({ data: useBlockNumberMock() }),
}));

const hookState: {
  hasVoted: boolean;
  proposalVote: string;
  availableVotes: number;
  isDaoGteV3: boolean;
} = {
  hasVoted: false,
  proposalVote: 'For',
  availableVotes: 5,
  isDaoGteV3: true,
};

vi.mock('@/wrappers/nijiDao', () => ({
  useHasVotedOnProposal: () => hookState.hasVoted,
  useIsDaoGteV3: () => hookState.isDaoGteV3,
  useProposalVote: () => hookState.proposalVote,
}));

vi.mock('@/wrappers/nijiToken', () => ({
  useUserVotesAsOfBlock: () => hookState.availableVotes,
}));

import ProposalHeader from './index';

const makeProposal = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: '42',
    title: 'My Proposal',
    status: 1,
    proposer: '0xPROPOSER',
    voteSnapshotBlock: 100n,
    transactionHash: '0xtx',
    signers: [],
    createdBlock: 50n,
    createdTimestamp: 1700000000n,
    ...overrides,
  }) as never;

const submitMock = vi.fn();
const baseProps = {
  proposal: makeProposal(),
  isActiveForVoting: true,
  isWalletConnected: true,
  isObjectionPeriod: false,
  submitButtonClickHandler: submitMock,
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  hookState.hasVoted = false;
  hookState.proposalVote = 'For';
  hookState.availableVotes = 5;
  hookState.isDaoGteV3 = true;
  submitMock.mockReset();
  useActiveLocaleMock.mockReturnValue('en-US');
  useBlockTimestampMock.mockReturnValue(1700000000);
  useBlockNumberMock.mockReturnValue(150n);
  isMobileMock.mockReturnValue(false);
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProposalHeader', () => {
  it('renders proposal.title in h1', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.querySelector('h1')?.textContent).toContain('My Proposal');
  });

  it('uses title prop over proposal.title when provided', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} title="Override title" />);
    expect(container.querySelector('h1')?.textContent).toContain('Override title');
  });

  it('renders Proposal id number', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('Proposal 42');
  });

  it('renders ProposalStatus child', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.querySelector('[data-testid="proposal-status"]')).not.toBeNull();
  });

  it('renders ShortAddress for proposer', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.querySelector('[data-testid="short-address"]')?.textContent).toBe(
      '0xPROPOSER',
    );
  });

  it('renders "Sponsored by" section when signers exist', () => {
    const proposal = makeProposal({ signers: [{ id: '0xSIGNER1' }] });
    const { container } = wrap(<ProposalHeader {...baseProps} proposal={proposal} />);
    expect(container.textContent).toContain('Sponsored by');
  });

  it('renders Submit vote button when active for voting + not objection period', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('Submit vote');
  });

  it('shows "Connect a wallet to vote" when not connected', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} isWalletConnected={false} />);
    expect(container.textContent).toContain('Connect a wallet to vote');
  });

  it('shows "You have no votes" when connected but no votes', () => {
    hookState.availableVotes = 0;
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('You have no votes');
  });

  it('Submit vote button is disabled when hasVoted=true', () => {
    hookState.hasVoted = true;
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    const btn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit vote'),
    );
    expect(btn?.disabled).toBe(true);
  });

  it('shows "voted For" alert when hasVoted + proposalVote=For', () => {
    hookState.hasVoted = true;
    hookState.proposalVote = 'For';
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('You voted');
    expect(container.textContent).toContain('For');
  });

  it('shows ja-JP layout "Proposed by:" when locale is ja-JP', () => {
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('Proposed by:');
  });

  it('shows Version link when hasManyVersions + isDaoGteV3', () => {
    const versions = [{ createdAt: 1700000000n }, { createdAt: 1700100000n }];
    const { container } = wrap(
      <ProposalHeader {...baseProps} proposalVersions={versions as never} versionNumber={2n} />,
    );
    expect(container.querySelector('a[href="/vote/42/history/"]')).not.toBeNull();
    expect(container.textContent).toContain('Version 2');
  });

  it('shows Version 1 without link when single version', () => {
    const versions = [{ createdAt: 1700000000n }];
    const { container } = wrap(
      <ProposalHeader {...baseProps} proposalVersions={versions as never} versionNumber={1n} />,
    );
    expect(container.textContent).toContain('Version 1');
    expect(container.querySelector('a[href="/vote/42/history/"]')).toBeNull();
  });

  it('hides Version block when isDaoGteV3=false', () => {
    hookState.isDaoGteV3 = false;
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).not.toContain('Version');
  });

  it('hides Submit vote button when isActiveForVoting=false', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} isActiveForVoting={false} />);
    expect(container.textContent).not.toContain('Submit vote');
  });

  it('shows "voted Against" alert when hasVoted + proposalVote=Against', () => {
    hookState.hasVoted = true;
    hookState.proposalVote = 'Against';
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('You voted');
    expect(container.textContent).toContain('Against');
  });

  it('shows "Abstained" alert when hasVoted + proposalVote=Abstain', () => {
    hookState.hasVoted = true;
    hookState.proposalVote = 'Abstain';
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.textContent).toContain('Abstained');
  });

  it('submit button click triggers submitButtonClickHandler when enabled', () => {
    submitMock.mockReset();
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    const btn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit vote'),
    );
    if (btn) btn.click();
    expect(submitMock).toHaveBeenCalled();
  });

  it('renders multi-signer "Sponsored by" with 3 ShortAddress entries', () => {
    const proposal = makeProposal({
      signers: [{ id: '0xS1' }, { id: '0xS2' }, { id: '0xS3' }],
    });
    const { container } = wrap(<ProposalHeader {...baseProps} proposal={proposal} />);
    const addresses = container.querySelectorAll('[data-testid="short-address"]');
    // 1 (proposer) + 3 (signers) = 4
    expect(addresses.length).toBeGreaterThanOrEqual(4);
  });

  it('proposal status badge renders', () => {
    const { container } = wrap(<ProposalHeader {...baseProps} />);
    expect(container.querySelector('[data-testid="proposal-status"]')).not.toBeNull();
  });

  it('rerender without crash', () => {
    const { rerender } = wrap(<ProposalHeader {...baseProps} />);
    expect(() =>
      rerender(
        <MemoryRouter>
          <ProposalHeader {...baseProps} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('mobile (isMobile=true) renders without crash', () => {
    isMobileMock.mockReturnValue(true);
    expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
  });

  it('hasVoted=true renders without crash', () => {
    hookState.hasVoted = true;
    expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
  });

  it('availableVotes=0 renders without crash', () => {
    hookState.availableVotes = 0;
    expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
  });

  it('rerender does not crash (same MemoryRouter wrapper)', () => {
    expect(() => {
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
    }).not.toThrow();
  });

  it('renders without crash 10 times', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 3 instances each independently', () => {
    expect(() => {
      wrap(
        <>
          <ProposalHeader {...baseProps} />
          <ProposalHeader {...baseProps} />
          <ProposalHeader {...baseProps} />
        </>,
      );
    }).not.toThrow();
  });

  it('renders without crash with default baseProps', () => {
    expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
  });

  it('renders consecutive 3 times without crash', () => {
    expect(() => {
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
    }).not.toThrow();
  });
});
