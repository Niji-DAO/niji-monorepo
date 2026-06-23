import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/assets/icons/Link.svg', () => ({
  default: 'link.svg',
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

type UpdateStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const updateProposalBySigsMock = vi.fn();
const hookState: {
  updateProposalBySigsState: {
    status: UpdateStatus;
    errorMessage?: string;
    transaction?: { hash: string };
  };
} = {
  updateProposalBySigsState: { status: 'None' },
};

vi.mock('@/wrappers/nijiData', () => ({
  useUpdateProposalBySigs: () => ({
    updateProposalBySigs: updateProposalBySigsMock,
    updateProposalBySigsState: hookState.updateProposalBySigsState,
  }),
}));

vi.mock('../SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

import SubmitUpdateProposal from './SubmitUpdateProposal';

const makeCandidate = () =>
  ({
    version: {
      content: {
        targets: ['0xTARGET1', '0xTARGET2'],
        values: ['100', '200'],
        signatures: ['fn1()', 'fn2()'],
        calldatas: ['0xCALLDATA1', '0xCALLDATA2'],
        description: 'test description',
      },
    },
  }) as never;

const makeSignatures = () => [
  {
    sig: '0xSIG_B',
    signer: { id: '0xBBB' },
    expirationTimestamp: '1700000000',
  },
  {
    sig: '0xSIG_A',
    signer: { id: '0xAAA' },
    expirationTimestamp: '1700000000',
  },
];

const baseProps = {
  isModalOpen: true,
  signatures: makeSignatures() as never,
  candidate: makeCandidate(),
  setIsModalOpen: vi.fn(),
  handleRefetchCandidateData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  proposalIdToUpdate: '42',
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  hookState.updateProposalBySigsState = { status: 'None' };
  updateProposalBySigsMock.mockReset();
  baseProps.setIsModalOpen = vi.fn();
  baseProps.handleRefetchCandidateData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SubmitUpdateProposal', () => {
  it('renders modal content when isModalOpen=true', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Update proposal');
    expect(container.textContent).toContain('Add an optional message');
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Optional message');
  });

  it('does not render modal when isModalOpen=false', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('updates reason on textarea change', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'my reason' } });
    expect(textarea.value).toBe('my reason');
  });

  it('Submit update click invokes updateProposalBySigs with sorted signers', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Submit update',
    );
    fireEvent.click(submitBtn!);
    expect(updateProposalBySigsMock).toHaveBeenCalledTimes(1);
    const call = updateProposalBySigsMock.mock.calls[0][0];
    const sortedSigs = call.args[1];
    expect(sortedSigs[0].signer).toBe('0xAAA');
    expect(sortedSigs[1].signer).toBe('0xBBB');
  });

  it('shows "Awaiting confirmation" when status=PendingSignature', () => {
    hookState.updateProposalBySigsState = { status: 'PendingSignature' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Awaiting confirmation');
  });

  it('shows "Submitting proposal" when status=Mining', () => {
    hookState.updateProposalBySigsState = { status: 'Mining' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Submitting proposal');
  });

  it('shows Success message + etherscan link when status=Success', () => {
    hookState.updateProposalBySigsState = {
      status: 'Success',
      transaction: { hash: '0xabc' },
    };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Success!');
    expect(container.querySelector('a[href*="0xabc"]')).not.toBeNull();
  });

  it('shows error message when status=Fail', () => {
    hookState.updateProposalBySigsState = { status: 'Fail', errorMessage: 'rpc failed' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('rpc failed');
    expect(container.textContent).toContain('Try again');
  });

  it('Try again click clears error state', () => {
    hookState.updateProposalBySigsState = { status: 'Fail', errorMessage: 'rpc failed' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const tryAgain = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Try again',
    );
    fireEvent.click(tryAgain!);
    expect(container.textContent).not.toContain('rpc failed');
  });
});
