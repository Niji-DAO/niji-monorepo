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
});
