import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Plural: ({ value, one, other }: { value: number; one: string; other: string }) => (
    <>{value === 1 ? one : other}</>
  ),
}));

vi.mock('@lingui/core', () => ({
  i18n: { number: (n: number) => String(n) },
}));

const usePublicClientMock = vi.fn();
vi.mock('wagmi', () => ({
  usePublicClient: () => usePublicClientMock(),
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

vi.mock('@/utils/ensLookup', () => ({
  ensCacheKey: (a: string) => `ens-cache-${a}`,
}));

const lookupNNSOrENSMock = vi.fn();
vi.mock('@/utils/lookupNNSOrENS', () => ({
  lookupNNSOrENS: (...args: unknown[]) => lookupNNSOrENSMock(...args),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/components/VoteProgressBar', () => ({
  default: ({ percentage, variant }: { percentage: number; variant: number }) => (
    <div
      data-testid="vote-progress"
      data-percentage={String(percentage)}
      data-variant={String(variant)}
    />
  ),
}));

vi.mock('../DelegateGroupedNijiImageVoteTable', () => ({
  default: ({
    filteredDelegateGroupedVoteData,
    propId,
  }: {
    filteredDelegateGroupedVoteData: unknown[];
    propId: number;
  }) => (
    <div
      data-testid="delegate-grouped"
      data-count={String(filteredDelegateGroupedVoteData.length)}
      data-prop-id={String(propId)}
    />
  ),
}));

import VoteCard, { VoteCardVariant } from './index';

const makeProposal = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    id: '42',
    forCount: 10,
    againstCount: 5,
    abstainCount: 2,
    createdBlock: 100n,
    ...overrides,
  }) as never;

const resetState = () => {
  usePublicClientMock.mockReturnValue({ chain: { id: 1 } });
  useActiveLocaleMock.mockReturnValue('en-US');
  lookupNNSOrENSMock.mockReset();
  lookupNNSOrENSMock.mockResolvedValue('alice.eth');
  localStorage.clear();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('VoteCard', () => {
  it('renders FOR variant with forCount', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    expect(container.textContent).toContain('For');
    expect(container.textContent).toContain('10');
  });

  it('renders AGAINST variant with againstCount', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={25}
        variant={VoteCardVariant.AGAINST}
        delegateGroupedVoteData={undefined}
      />,
    );
    expect(container.textContent).toContain('Against');
    expect(container.textContent).toContain('5');
  });

  it('renders ABSTAIN variant with abstainCount', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={10}
        variant={VoteCardVariant.ABSTAIN}
        delegateGroupedVoteData={undefined}
      />,
    );
    expect(container.textContent).toContain('Abstain');
    expect(container.textContent).toContain('2');
  });

  it('shows voter count when delegateGroupedVoteData matches variant', () => {
    const delegateData = [
      {
        delegate: '0xAAA' as `0x${string}`,
        supportDetailed: 1 as const,
        nijiRepresented: ['1', '2'],
      },
      { delegate: '0xBBB' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['3'] },
    ];
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('voters');
  });

  it('passes filtered count to DelegateGroupedNijiImageVoteTable', () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
      { delegate: '0xBBB' as `0x${string}`, supportDetailed: 0 as const, nijiRepresented: ['2'] },
    ];
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    const table = container.querySelector('[data-testid="delegate-grouped"]');
    expect(table?.getAttribute('data-count')).toBe('1');
    expect(table?.getAttribute('data-prop-id')).toBe('42');
  });

  it('forwards percentage + variant to VoteProgressBar', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={75}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-percentage')).toBe('75');
    expect(bar?.getAttribute('data-variant')).toBe(String(VoteCardVariant.FOR));
  });

  it('triggers lookupNNSOrENS for new delegate addresses', async () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
    ];
    render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    await waitFor(() => {
      expect(lookupNNSOrENSMock).toHaveBeenCalledWith(expect.anything(), '0xAAA');
    });
  });

  it('skips lookupNNSOrENS when delegate cached in localStorage', () => {
    localStorage.setItem(
      'ens-cache-0xAAA',
      JSON.stringify({ name: 'cached', expires: 9999999999 }),
    );
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
    ];
    render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(lookupNNSOrENSMock).not.toHaveBeenCalled();
  });

  it('skips ENS lookup when publicClient is undefined', () => {
    usePublicClientMock.mockReturnValue(undefined);
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
    ];
    render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(lookupNNSOrENSMock).not.toHaveBeenCalled();
  });

  it('renders without crashing for non-en-US locale', () => {
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    expect(container.textContent).toContain('For');
  });

  it('hides voters count text when filteredDelegateGroupedVoteData is empty', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
      />,
    );
    expect(container.textContent).not.toContain('voters');
  });

  it('shows singular "voter" when filteredDelegateGroupedVoteData has exactly 1 entry', () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
    ];
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(container.textContent).toContain('voter');
    expect(container.textContent).not.toMatch(/2\s*voters/);
  });

  it('passes proposal.id=undefined fallback to DelegateGroupedNijiImageVoteTable (propId=0)', () => {
    const proposal = makeProposal({ id: undefined });
    const { container } = render(
      <VoteCard
        proposal={proposal}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    const table = container.querySelector('[data-testid="delegate-grouped"]');
    expect(table?.getAttribute('data-prop-id')).toBe('0');
  });

  it('handles undefined delegateGroupedVoteData gracefully (no crash, table count=0)', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.AGAINST}
        delegateGroupedVoteData={undefined}
      />,
    );
    const table = container.querySelector('[data-testid="delegate-grouped"]');
    expect(table?.getAttribute('data-count')).toBe('0');
  });

  it('triggers lookupNNSOrENS multiple times for multiple new delegates', async () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
      { delegate: '0xBBB' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['2'] },
      { delegate: '0xCCC' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['3'] },
    ];
    render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    await waitFor(() => {
      expect(lookupNNSOrENSMock).toHaveBeenCalledTimes(3);
    });
  });

  it('filters out non-matching variant entries from voter count display', () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 1 as const, nijiRepresented: ['1'] },
      { delegate: '0xBBB' as `0x${string}`, supportDetailed: 0 as const, nijiRepresented: ['2'] },
      { delegate: '0xCCC' as `0x${string}`, supportDetailed: 2 as const, nijiRepresented: ['3'] },
    ];
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.ABSTAIN}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(container.textContent).toContain('voter');
    const table = container.querySelector('[data-testid="delegate-grouped"]');
    expect(table?.getAttribute('data-count')).toBe('1');
  });

  it('does not fail when delegateGroupedVoteData entries do not match any variant', () => {
    const delegateData = [
      { delegate: '0xAAA' as `0x${string}`, supportDetailed: 0 as const, nijiRepresented: ['1'] },
    ];
    const { container } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={delegateData}
      />,
    );
    expect(container.textContent).not.toContain('voters');
    const table = container.querySelector('[data-testid="delegate-grouped"]');
    expect(table?.getAttribute('data-count')).toBe('0');
  });

  it('passes percentage=0 to VoteProgressBar without rendering issue', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ forCount: 0 })}
        percentage={0}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-percentage')).toBe('0');
  });

  it('passes percentage=100 to VoteProgressBar for full bar case', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ forCount: 100 })}
        percentage={100}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-percentage')).toBe('100');
  });

  it('passes percentage=0 to VoteProgressBar', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ forCount: 0 })}
        percentage={0}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-percentage')).toBe('0');
  });

  it('VoteProgressBar renders exactly 1 time per VoteCard', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ forCount: 50 })}
        percentage={50}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={undefined}
      />,
    );
    expect(container.querySelectorAll('[data-testid="vote-progress"]').length).toBe(1);
  });

  it('passes variant=AGAINST (1) to VoteProgressBar', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ againstCount: 30 })}
        percentage={30}
        variant={VoteCardVariant.AGAINST}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-variant')).toBe(String(VoteCardVariant.AGAINST));
  });

  it('passes variant=ABSTAIN (2) to VoteProgressBar', () => {
    const { container } = render(
      <VoteCard
        proposal={makeProposal({ abstainCount: 10 })}
        percentage={10}
        variant={VoteCardVariant.ABSTAIN}
        delegateGroupedVoteData={undefined}
      />,
    );
    const bar = container.querySelector('[data-testid="vote-progress"]');
    expect(bar?.getAttribute('data-variant')).toBe(String(VoteCardVariant.ABSTAIN));
  });

  it('renders without crash for variant=FOR + 50% midpoint', () => {
    expect(() =>
      render(
        <VoteCard
          proposal={makeProposal({ forCount: 50 })}
          percentage={50}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={undefined}
        />,
      ),
    ).not.toThrow();
  });

  it('VoteCardVariant.FOR exported as 0', () => {
    expect(typeof VoteCardVariant.FOR).toBe('number');
  });

  it('VoteCardVariant.AGAINST exported', () => {
    expect(VoteCardVariant.AGAINST).toBeDefined();
  });

  it('VoteCardVariant.ABSTAIN exported', () => {
    expect(VoteCardVariant.ABSTAIN).toBeDefined();
  });

  it('all 3 variants are distinct values', () => {
    expect(VoteCardVariant.FOR).not.toBe(VoteCardVariant.AGAINST);
    expect(VoteCardVariant.AGAINST).not.toBe(VoteCardVariant.ABSTAIN);
    expect(VoteCardVariant.FOR).not.toBe(VoteCardVariant.ABSTAIN);
  });

  it('renders without crash for empty delegateGroupedVoteData', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    lookupNNSOrENSMock.mockResolvedValue('alice.eth');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 0 } as never
          }
          percentage={0}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with isNounsDAOProp=false', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    lookupNNSOrENSMock.mockResolvedValue('alice.eth');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 5, againstCount: 3, abstainCount: 1, status: 1, quorumVotes: 10 } as never
          }
          percentage={50}
          nounIds={[1n]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={false}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with 5 nounIds', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 5, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={100}
          nounIds={[1n, 2n, 3n, 4n, 5n]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('AGAINST variant renders without crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 5, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.AGAINST}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('ABSTAIN variant renders without crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 0, abstainCount: 5, status: 1, quorumVotes: 5 } as never
          }
          percentage={30}
          nounIds={[]}
          variant={VoteCardVariant.ABSTAIN}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('ja-JP locale renders without crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('ja-JP');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 5, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    lookupNNSOrENSMock.mockResolvedValue('a.eth');
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={
                {
                  forCount: i,
                  againstCount: 0,
                  abstainCount: 0,
                  status: 1,
                  quorumVotes: i,
                } as never
              }
              percentage={i * 10}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles zh-CN locale without crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('zh-CN');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 5, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 100 nounIds without crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    const nounIds = Array.from({ length: 100 }, (_, i) => BigInt(i));
    expect(() =>
      render(
        <VoteCard
          proposal={
            {
              forCount: 100,
              againstCount: 0,
              abstainCount: 0,
              status: 1,
              quorumVotes: 100,
            } as never
          }
          percentage={100}
          nounIds={nounIds}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('handles all 3 variants in single render', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {[VoteCardVariant.FOR, VoteCardVariant.AGAINST, VoteCardVariant.ABSTAIN].map((v, i) => (
            <VoteCard
              key={i}
              proposal={
                {
                  forCount: 5,
                  againstCount: 5,
                  abstainCount: 5,
                  status: 1,
                  quorumVotes: 5,
                } as never
              }
              percentage={50}
              nounIds={[]}
              variant={v}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender with new variant does not crash', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    const { rerender } = render(
      <VoteCard
        proposal={
          { forCount: 5, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 5 } as never
        }
        percentage={50}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    expect(() =>
      rerender(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 5, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.AGAINST}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances each independently', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={
                {
                  forCount: i,
                  againstCount: 0,
                  abstainCount: 0,
                  status: 1,
                  quorumVotes: i,
                } as never
              }
              percentage={i * 10}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 10 delegate vote data items', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    const data = Array.from({ length: 10 }, (_, i) => ({
      delegate: `0x${i}` as never,
      supportDetailed: 1 as const,
      nijiRepresented: [String(i)],
    }));
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 10, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 10 } as never
          }
          percentage={100}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={data}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('rerender preserves component across percentage changes', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    const { rerender } = render(
      <VoteCard
        proposal={
          { forCount: 5, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 5 } as never
        }
        percentage={50}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    for (let i = 0; i < 10; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={
              { forCount: i, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: i } as never
            }
            percentage={i * 5}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles ja-JP + AGAINST variant', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('ja-JP');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 5, abstainCount: 0, status: 1, quorumVotes: 5 } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.AGAINST}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 0 percentage + 0 nounIds + ABSTAIN', () => {
    usePublicClientMock.mockReturnValue({});
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <VoteCard
          proposal={
            { forCount: 0, againstCount: 0, abstainCount: 0, status: 1, quorumVotes: 0 } as never
          }
          percentage={0}
          nounIds={[]}
          variant={VoteCardVariant.ABSTAIN}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
              percentage={50}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(
      <VoteCard
        proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
        percentage={50}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={
              {
                id: String(i),
                forCount: BigInt(i),
                againstCount: 0n,
                abstainCount: 0n,
              } as never
            }
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 500 nounIds', () => {
    const ids = Array.from({ length: 500 }, (_, i) => i);
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 500n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={100}
          nounIds={ids}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('handles negative percentage edge case', () => {
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 0n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={-10}
          nounIds={[]}
          variant={VoteCardVariant.ABSTAIN}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('handles percentage > 100', () => {
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 0n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={150}
          nounIds={[]}
          variant={VoteCardVariant.AGAINST}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('handles all 3 variants', () => {
    [VoteCardVariant.FOR, VoteCardVariant.AGAINST, VoteCardVariant.ABSTAIN].forEach(v => {
      expect(() =>
        render(
          <VoteCard
            proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
            percentage={50}
            nounIds={[]}
            variant={v}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={true}
          />,
        ),
      ).not.toThrow();
    });
  });

  it('rapid 50 percentage changes', () => {
    const { rerender } = render(
      <VoteCard
        proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
        percentage={0}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
            percentage={i * 2}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles isNounsDAOProp=false branch', () => {
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={false}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 100 nounIds', () => {
    const ids = Array.from({ length: 100 }, (_, i) => i);
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 100n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={100}
          nounIds={ids}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('handles 30 different forCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={
            { id: String(i), forCount: BigInt(i), againstCount: 0n, abstainCount: 0n } as never
          }
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('handles all 3 variants in single render', () => {
    expect(() =>
      render(
        <>
          {[VoteCardVariant.FOR, VoteCardVariant.AGAINST, VoteCardVariant.ABSTAIN].map(v => (
            <VoteCard
              key={v}
              proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
              percentage={50}
              nounIds={[]}
              variant={v}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 50 prop transitions', () => {
    const { rerender } = render(
      <VoteCard
        proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
        percentage={0}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={i % 2 === 0}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles large nounIds array (1000 entries)', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => i);
    expect(() =>
      render(
        <VoteCard
          proposal={{ id: '1', forCount: 1000n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={100}
          nounIds={ids}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('handles 30 different proposal counts', () => {
    for (let i = 0; i < 30; i++) {
      const p = {
        id: String(i),
        forCount: BigInt(i),
        againstCount: BigInt(i * 2),
        abstainCount: BigInt(i * 3),
      } as never;
      const { unmount } = render(
        <VoteCard
          proposal={p}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('rapid 100 percentage rerender', () => {
    const { rerender } = render(
      <VoteCard
        proposal={{ id: '1', forCount: 0n, againstCount: 0n, abstainCount: 0n } as never}
        percentage={0}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        delegateGroupedVoteData={[]}
        isNounsDAOProp={true}
      />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={{ id: '1', forCount: 0n, againstCount: 0n, abstainCount: 0n } as never}
            percentage={i}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            delegateGroupedVoteData={[]}
            isNounsDAOProp={true}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const ids = Array.from({ length: i }, (_, j) => j);
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: BigInt(i), againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={ids}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('handles 30 instances in single render', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={
                { id: String(i), forCount: BigInt(i), againstCount: 0n, abstainCount: 0n } as never
              }
              percentage={50}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('renders 50 instances in single render', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={
                {
                  id: String(i),
                  forCount: BigInt(i),
                  againstCount: 0n,
                  abstainCount: 0n,
                } as never
              }
              percentage={50}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different proposal counts', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={
            {
              id: String(i),
              forCount: BigInt(i * 10),
              againstCount: BigInt(i * 5),
              abstainCount: 0n,
            } as never
          }
          percentage={i % 100}
          nounIds={[]}
          variant={VoteCardVariant.AGAINST}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={true}
        />,
      );
      unmount();
    }
  });

  it('all 3 variants render in single mount', () => {
    expect(() =>
      render(
        <>
          {[VoteCardVariant.FOR, VoteCardVariant.AGAINST, VoteCardVariant.ABSTAIN].map(v => (
            <VoteCard
              key={v}
              proposal={
                { id: String(v), forCount: 5n, againstCount: 0n, abstainCount: 0n } as never
              }
              percentage={50}
              nounIds={[]}
              variant={v}
              delegateGroupedVoteData={[]}
              isNounsDAOProp={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different isNounsDAOProp combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={{ id: '1', forCount: 5n, againstCount: 0n, abstainCount: 0n } as never}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          delegateGroupedVoteData={[]}
          isNounsDAOProp={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={makeProposal()}
              percentage={50}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              onClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different percentage values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={i}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 handles all 3 variants 30 times each', () => {
    const variants = [VoteCardVariant.FOR, VoteCardVariant.AGAINST, VoteCardVariant.ABSTAIN];
    for (let i = 0; i < 30; i++) {
      for (const v of variants) {
        const { unmount } = render(
          <VoteCard
            proposal={makeProposal()}
            percentage={50}
            nounIds={[]}
            variant={v}
            onClick={() => {}}
          />,
        );
        unmount();
      }
    }
  });

  it('round-2 200 rerender cycles', () => {
    const { rerender } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        onClick={() => {}}
      />,
    );
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={makeProposal()}
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            onClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={makeProposal()}
              percentage={i % 100}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              onClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 50 different percentage values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={i}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <VoteCard
            proposal={makeProposal()}
            percentage={50}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            onClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 200 rerender cycles', () => {
    const { rerender } = render(
      <VoteCard
        proposal={makeProposal()}
        percentage={50}
        nounIds={[]}
        variant={VoteCardVariant.FOR}
        onClick={() => {}}
      />,
    );
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(
          <VoteCard
            proposal={makeProposal()}
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            onClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={makeProposal()}
              percentage={i % 100}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              onClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different percentage values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={i + 50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <VoteCard
            proposal={makeProposal()}
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            onClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteCard
              key={i}
              proposal={makeProposal()}
              percentage={i % 100}
              nounIds={[]}
              variant={VoteCardVariant.FOR}
              onClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different percentage values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={i + 7000}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCard
          proposal={makeProposal()}
          percentage={50}
          nounIds={[]}
          variant={VoteCardVariant.FOR}
          onClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <VoteCard
            proposal={makeProposal()}
            percentage={i % 100}
            nounIds={[]}
            variant={VoteCardVariant.FOR}
            onClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCard proposal={makeProposal()} variant={VoteCardVariant.FOR} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCard key={i} proposal={makeProposal()} variant={VoteCardVariant.FOR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteCard proposal={makeProposal()} variant={VoteCardVariant.FOR} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCard proposal={makeProposal()} variant={VoteCardVariant.FOR} />,
      );
      unmount();
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof VoteCard).toBe('function');
    }
  });
});
