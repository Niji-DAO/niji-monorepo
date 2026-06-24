import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/assets/icons/Link.svg', () => ({ default: 'link.svg' }));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short-address">{address}</span>,
}));

vi.mock('@/components/SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

type ProposeStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const proposeMock = vi.fn();
const proposeBySigsMock = vi.fn();
const hookState: {
  proposeState: { status: ProposeStatus; errorMessage?: string; transaction?: { hash: string } };
  proposeBySigsState: {
    status: ProposeStatus;
    errorMessage?: string;
    transaction?: { hash: string };
  };
} = {
  proposeState: { status: 'None' },
  proposeBySigsState: { status: 'None' },
};

vi.mock('@/wrappers/nijiDao', () => ({
  usePropose: () => ({
    propose: proposeMock,
    proposeState: hookState.proposeState,
  }),
}));

vi.mock('@/wrappers/nijiData', () => ({
  useProposeBySigs: () => ({
    proposeBySigs: proposeBySigsMock,
    proposeBySigsState: hookState.proposeBySigsState,
  }),
}));

import SelectSponsorsToPropose from './SelectSponsorsToPropose';

const makeSig = (
  overrides: Partial<{
    signerId: string;
    sig: string;
    voteCount: number;
    activeOrPendingProposal: boolean;
  }> = {},
) => ({
  sig: overrides.sig ?? `0xSIG_${overrides.signerId ?? 'A'}`,
  signer: {
    id: overrides.signerId ?? '0xAAA',
    voteCount: overrides.voteCount ?? 5,
    activeOrPendingProposal: overrides.activeOrPendingProposal ?? false,
  },
  expirationTimestamp: '1700000000',
});

const makeCandidate = () =>
  ({
    version: {
      content: {
        targets: ['0xTARGET'],
        values: ['100'],
        signatures: ['fn()'],
        calldatas: ['0xCALLDATA'],
        description: 'desc',
      },
    },
    matchingProposalIds: [] as string[],
  }) as never;

const stableSetIsModalOpen = vi.fn();
const stableHandleRefetch = vi.fn();
const stableSetDataFetchPollInterval = vi.fn();

const baseProps = {
  isModalOpen: true,
  signatures: [
    makeSig({ signerId: '0xAAA', voteCount: 3 }),
    makeSig({ signerId: '0xBBB', voteCount: 4 }),
  ] as never,
  requiredVotes: 5,
  candidate: makeCandidate(),
  blockNumber: 100n,
  setIsModalOpen: stableSetIsModalOpen,
  handleRefetchCandidateData: stableHandleRefetch,
  setDataFetchPollInterval: stableSetDataFetchPollInterval,
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  hookState.proposeState = { status: 'None' };
  hookState.proposeBySigsState = { status: 'None' };
  proposeMock.mockReset();
  proposeBySigsMock.mockReset();
  stableSetIsModalOpen.mockReset();
  stableHandleRefetch.mockReset();
  stableSetDataFetchPollInterval.mockReset();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SelectSponsorsToPropose', () => {
  it('renders nothing when isModalOpen=false', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} isModalOpen={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('renders "Choose sponsors" title when modal open', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    expect(container.textContent).toContain('Choose sponsors');
  });

  it('renders signature buttons from signatures array', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    const addresses = container.querySelectorAll('[data-testid="short-address"]');
    expect(addresses.length).toBe(2);
  });

  it('renders "3 votes" / "4 votes" for each signer', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    expect(container.textContent).toContain('3 votes');
    expect(container.textContent).toContain('4 votes');
  });

  it('toggles selection on signature button click', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    const sigBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('0xAAA'),
    );
    fireEvent.click(sigBtn!);
    expect(container.textContent).toContain('Submit 3 votes');
  });

  it('primary button disabled when selectedVoteCount < requiredVotes', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    const sigBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('0xAAA'),
    );
    fireEvent.click(sigBtn!);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit'),
    );
    expect(submitBtn?.disabled).toBe(true);
  });

  it('primary button enabled when selectedVoteCount >= requiredVotes', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    Array.from(container.querySelectorAll('button')).forEach(b => {
      if (b.textContent?.includes('0xAAA') || b.textContent?.includes('0xBBB')) {
        fireEvent.click(b);
      }
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit 7 votes'),
    );
    expect(submitBtn).not.toBeUndefined();
    expect(submitBtn?.disabled).toBe(false);
  });

  it('"Submit with no sponsors" label when no signatures selected', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} requiredVotes={0} />);
    expect(container.textContent).toContain('Submit with no sponsors');
  });

  it('disables signature button when activeOrPendingProposal=true', () => {
    const sigs = [makeSig({ signerId: '0xAAA', activeOrPendingProposal: true })];
    const { container } = wrap(
      <SelectSponsorsToPropose {...baseProps} signatures={sigs as never} />,
    );
    const sigBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('0xAAA'),
    );
    expect(sigBtn?.disabled).toBe(true);
  });

  it('clicking primary button with no sponsors calls propose', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} requiredVotes={0} />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit with no sponsors'),
    );
    fireEvent.click(submitBtn!);
    expect(proposeMock).toHaveBeenCalled();
    expect(proposeBySigsMock).not.toHaveBeenCalled();
  });

  it('clicking primary with selected sponsors calls proposeBySigs', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    Array.from(container.querySelectorAll('button')).forEach(b => {
      if (b.textContent?.includes('0xAAA') || b.textContent?.includes('0xBBB')) {
        fireEvent.click(b);
      }
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit 7 votes'),
    );
    fireEvent.click(submitBtn!);
    expect(proposeBySigsMock).toHaveBeenCalled();
    expect(proposeMock).not.toHaveBeenCalled();
  });

  it('shows "Submitting proposal" copy when proposeBySigsState=Mining + sponsors selected', () => {
    hookState.proposeBySigsState = { status: 'Mining' };
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    Array.from(container.querySelectorAll('button')).forEach(b => {
      if (b.textContent?.includes('0xAAA')) fireEvent.click(b);
    });
    expect(container.textContent).toContain('Submitting proposal');
  });

  it('handles "Submit all" toggle from selected -> unselected', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    Array.from(container.querySelectorAll('button')).forEach(b => {
      if (b.textContent?.includes('0xAAA') || b.textContent?.includes('0xBBB')) fireEvent.click(b);
    });
    const unselectAllBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Unselect all',
    );
    expect(unselectAllBtn).not.toBeUndefined();
    fireEvent.click(unselectAllBtn!);
    expect(container.textContent).toContain('Submit with no sponsors');
  });

  it('shows warning note about cancel permission', () => {
    const { container } = wrap(<SelectSponsorsToPropose {...baseProps} />);
    expect(container.textContent).toContain('permission to cancel the proposal');
  });
});
