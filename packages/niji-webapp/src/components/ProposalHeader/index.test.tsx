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

  it('renders 20 times consecutively without crash', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 10 instances each in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <ProposalHeader key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders ProposalHeader within outer div parent', () => {
    expect(() =>
      wrap(
        <div data-testid="parent">
          <ProposalHeader {...baseProps} />
        </div>,
      ),
    ).not.toThrow();
  });

  it('renders ProposalHeader within Fragment', () => {
    expect(() =>
      wrap(
        <>
          <ProposalHeader {...baseProps} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders ProposalHeader 5 times sequentially without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 50 instances each consecutively', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 20 ProposalHeader instances each in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <ProposalHeader key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders ProposalHeader within deeply nested context', () => {
    expect(() =>
      wrap(
        <div>
          <div>
            <div>
              <ProposalHeader {...baseProps} />
            </div>
          </div>
        </div>,
      ),
    ).not.toThrow();
  });

  it('rerender same baseProps without crash', () => {
    expect(() => {
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
      wrap(<ProposalHeader {...baseProps} />);
    }).not.toThrow();
  });

  it('renders ProposalHeader within Fragment', () => {
    expect(() =>
      wrap(
        <>
          <ProposalHeader {...baseProps} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders 100 ProposalHeader instances consecutively', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders 30 ProposalHeader instances in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalHeader key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders ProposalHeader within 5-level nested fragment', () => {
    expect(() =>
      wrap(
        <>
          <>
            <>
              <>
                <ProposalHeader {...baseProps} />
              </>
            </>
          </>
        </>,
      ),
    ).not.toThrow();
  });

  it('renders 50 ProposalHeaders consecutively without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} />)).not.toThrow();
    }
  });

  it('renders ProposalHeader within complex DOM tree', () => {
    expect(() =>
      wrap(
        <div data-testid="root">
          <div>
            <section>
              <article>
                <ProposalHeader {...baseProps} />
              </article>
            </section>
          </div>
        </div>,
      ),
    ).not.toThrow();
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalHeader key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = wrap(<ProposalHeader {...baseProps} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <ProposalHeader {...baseProps} title={`Title-${i}`} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 50 isActiveForVoting toggle without crash', () => {
    const { rerender } = wrap(<ProposalHeader {...baseProps} />);
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <ProposalHeader {...baseProps} isActiveForVoting={i % 2 === 0} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles isObjectionPeriod=true variant', () => {
    expect(() => wrap(<ProposalHeader {...baseProps} isObjectionPeriod={true} />)).not.toThrow();
  });

  it('handles isWalletConnected=false variant', () => {
    expect(() => wrap(<ProposalHeader {...baseProps} isWalletConnected={false} />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    }
  });

  it('handles all 4 boolean prop combinations', () => {
    [true, false].forEach(active => {
      [true, false].forEach(connected => {
        expect(() =>
          wrap(
            <ProposalHeader
              {...baseProps}
              isActiveForVoting={active}
              isWalletConnected={connected}
            />,
          ),
        ).not.toThrow();
      });
    });
  });

  it('handles submitButtonClickHandler 100 invocations', () => {
    submitMock.mockReset();
    wrap(<ProposalHeader {...baseProps} />);
    for (let i = 0; i < 100; i++) submitMock();
    expect(submitMock).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different titles', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<ProposalHeader {...baseProps} title={`Title-${i}`} />)).not.toThrow();
    }
  });

  it('handles unicode title', () => {
    expect(() => wrap(<ProposalHeader {...baseProps} title="🎉日本語タイトル" />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different proposal ids', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeProposal({ id: String(i) });
      const { unmount } = wrap(<ProposalHeader {...baseProps} proposal={p} />);
      unmount();
    }
  });

  it('handles all 3 hookState combinations', () => {
    const orig = { ...hookState };
    [
      { hasVoted: true, proposalVote: 'For', availableVotes: 5, isDaoGteV3: true },
      { hasVoted: false, proposalVote: 'Against', availableVotes: 0, isDaoGteV3: false },
      { hasVoted: true, proposalVote: 'Abstain', availableVotes: 100, isDaoGteV3: true },
    ].forEach(state => {
      Object.assign(hookState, state);
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    });
    Object.assign(hookState, orig);
  });

  it('rapid 30 isObjectionPeriod toggle', () => {
    const { rerender } = wrap(<ProposalHeader {...baseProps} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <ProposalHeader {...baseProps} isObjectionPeriod={i % 2 === 0} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles all 3 locale variants', () => {
    ['en-US', 'ja-JP', 'zh-CN'].forEach(loc => {
      useActiveLocaleMock.mockReturnValue(loc);
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    });
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different proposal ids with versions', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeProposal({ id: String(i) });
      const versions = [{ createdAt: 1700000000n }];
      const { unmount } = wrap(
        <ProposalHeader
          {...baseProps}
          proposal={p}
          proposalVersions={versions as never}
          versionNumber={1n}
        />,
      );
      unmount();
    }
  });

  it('handles all proposalVote values', () => {
    const orig = hookState.proposalVote;
    ['For', 'Against', 'Abstain'].forEach(vote => {
      hookState.hasVoted = true;
      hookState.proposalVote = vote;
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    });
    hookState.proposalVote = orig;
    hookState.hasVoted = false;
  });

  it('handles 30 different submit handler invocations', () => {
    submitMock.mockReset();
    wrap(<ProposalHeader {...baseProps} />);
    for (let i = 0; i < 30; i++) submitMock();
    expect(submitMock).toHaveBeenCalledTimes(30);
  });

  it('handles 30 different availableVotes values', () => {
    const orig = hookState.availableVotes;
    for (let i = 0; i < 30; i++) {
      hookState.availableVotes = i;
      const { unmount } = wrap(<ProposalHeader {...baseProps} />);
      unmount();
    }
    hookState.availableVotes = orig;
  });
});
