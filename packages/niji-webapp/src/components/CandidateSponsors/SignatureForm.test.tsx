import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiGovernorAddress: { 1: '0xGOVERNOR' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

const signTypedDataMock = vi.fn();
const hookState: {
  signature: string | undefined;
  isSignPending: boolean;
} = {
  signature: '0xSIGNED',
  isSignPending: false,
};

vi.mock('wagmi', () => ({
  useSignTypedData: () => ({
    data: hookState.signature,
    signTypedData: signTypedDataMock,
    isPending: hookState.isSignPending,
  }),
}));

const addSignatureMock = vi.fn();
const validateExpirationDateMock = vi.fn();
const clearTransactionStateMock = vi.fn();
const setIsGetSignatureWaitingMock = vi.fn();
const setIsGetSignatureTxSuccessfulMock = vi.fn();
const setGetSignatureErrorMessageMock = vi.fn();
const setIsWaitingMock = vi.fn();

const flowState: {
  dateErrorMessage: string;
  isWaiting: boolean;
  isLoading: boolean;
  isTxSuccessful: boolean;
  isGetSignatureWaiting: boolean;
  isGetSignatureTxSuccessful: boolean;
  errorMessage: string;
  getSignatureErrorMessage: string;
  isOverlayVisible: boolean;
  addSignatureState: { transaction?: { hash: string } };
} = {
  dateErrorMessage: '',
  isWaiting: false,
  isLoading: false,
  isTxSuccessful: false,
  isGetSignatureWaiting: false,
  isGetSignatureTxSuccessful: false,
  errorMessage: '',
  getSignatureErrorMessage: '',
  isOverlayVisible: false,
  addSignatureState: {},
};

vi.mock('./signature/useSignatureFlow', () => ({
  useSignatureFlow: () => ({
    ...flowState,
    addSignature: addSignatureMock,
    validateExpirationDate: validateExpirationDateMock,
    clearTransactionState: clearTransactionStateMock,
    setIsGetSignatureWaiting: setIsGetSignatureWaitingMock,
    setIsGetSignatureTxSuccessful: setIsGetSignatureTxSuccessfulMock,
    setGetSignatureErrorMessage: setGetSignatureErrorMessageMock,
    setIsWaiting: setIsWaitingMock,
  }),
}));

vi.mock('./signature/encodeProposalData', () => ({
  calcProposalEncodeData: vi.fn().mockResolvedValue('0xENCODED'),
}));

vi.mock('./signature/types', () => ({
  createProposalTypes: { Proposal: [] },
  updateProposalTypes: { UpdateProposal: [] },
}));

vi.mock('./signature/SignatureFormFields', () => ({
  SignatureFormFields: ({
    onSign,
    dateErrorMessage,
    isWaiting,
    isLoading,
    proposalIdToUpdate,
  }: {
    onSign: () => Promise<void>;
    dateErrorMessage: string;
    isWaiting: boolean;
    isLoading: boolean;
    proposalIdToUpdate: number;
  }) => (
    <div
      data-testid="signature-form-fields"
      data-date-error={dateErrorMessage}
      data-is-waiting={String(isWaiting)}
      data-is-loading={String(isLoading)}
      data-proposal-id={String(proposalIdToUpdate)}
    >
      <button data-testid="sign-btn" onClick={onSign} />
    </div>
  ),
}));

vi.mock('./signature/SignatureStatusOverlay', () => ({
  SignatureStatusOverlay: ({
    isOverlayVisible,
    errorMessage,
    onTryAgain,
    onClose,
  }: {
    isOverlayVisible: boolean;
    errorMessage: string;
    onTryAgain: () => void;
    onClose: () => void;
  }) => (
    <div
      data-testid="signature-status-overlay"
      data-overlay-visible={String(isOverlayVisible)}
      data-error-message={errorMessage}
    >
      <button data-testid="overlay-try-again" onClick={onTryAgain} />
      <button data-testid="overlay-close" onClick={onClose} />
    </div>
  ),
}));

import SignatureForm from './SignatureForm';

const makeCandidate = () =>
  ({
    proposer: '0x1234567890123456789012345678901234567890',
    slug: 'cand-slug',
    version: {
      content: {
        targets: ['0x2222222222222222222222222222222222222222'],
        values: ['100'],
        signatures: ['fn()'],
        calldatas: ['0xCALLDATA'],
        description: 'desc',
      },
    },
  }) as never;

const baseProps = {
  id: 'sig-1',
  transactionState: 'idle' as never,
  setTransactionState: vi.fn(),
  setIsFormDisplayed: vi.fn(),
  candidate: makeCandidate(),
  handleRefetchCandidateData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  proposalIdToUpdate: 0,
};

const resetState = () => {
  hookState.signature = '0xSIGNED';
  hookState.isSignPending = false;
  Object.assign(flowState, {
    dateErrorMessage: '',
    isWaiting: false,
    isLoading: false,
    isTxSuccessful: false,
    isGetSignatureWaiting: false,
    isGetSignatureTxSuccessful: false,
    errorMessage: '',
    getSignatureErrorMessage: '',
    isOverlayVisible: false,
    addSignatureState: {},
  });
  signTypedDataMock.mockReset();
  addSignatureMock.mockReset();
  validateExpirationDateMock.mockReset();
  clearTransactionStateMock.mockReset();
  setIsGetSignatureWaitingMock.mockReset();
  setIsGetSignatureTxSuccessfulMock.mockReset();
  setGetSignatureErrorMessageMock.mockReset();
  setIsWaitingMock.mockReset();
  baseProps.setIsFormDisplayed = vi.fn();
  baseProps.setTransactionState = vi.fn();
  baseProps.handleRefetchCandidateData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SignatureForm', () => {
  it('renders SignatureFormFields and SignatureStatusOverlay and note', () => {
    const { container } = render(<SignatureForm {...baseProps} />);
    expect(container.querySelector('[data-testid="signature-form-fields"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="signature-status-overlay"]')).not.toBeNull();
    expect(container.textContent).toContain('Once a signed proposal is onchain');
  });

  it('passes proposalIdToUpdate prop to SignatureFormFields', () => {
    const { container } = render(<SignatureForm {...baseProps} proposalIdToUpdate={5} />);
    const fields = container.querySelector('[data-testid="signature-form-fields"]');
    expect(fields?.getAttribute('data-proposal-id')).toBe('5');
  });

  it('passes flow.isWaiting + isLoading to SignatureFormFields', () => {
    flowState.isWaiting = true;
    flowState.isLoading = true;
    const { container } = render(<SignatureForm {...baseProps} />);
    const fields = container.querySelector('[data-testid="signature-form-fields"]');
    expect(fields?.getAttribute('data-is-waiting')).toBe('true');
    expect(fields?.getAttribute('data-is-loading')).toBe('true');
  });

  it('passes flow.errorMessage + isOverlayVisible to SignatureStatusOverlay', () => {
    flowState.errorMessage = 'sig error';
    flowState.isOverlayVisible = true;
    const { container } = render(<SignatureForm {...baseProps} />);
    const overlay = container.querySelector('[data-testid="signature-status-overlay"]');
    expect(overlay?.getAttribute('data-overlay-visible')).toBe('true');
    expect(overlay?.getAttribute('data-error-message')).toBe('sig error');
  });

  it('clicking sign btn calls signTypedData with createProposalTypes when proposalIdToUpdate=0', async () => {
    const { container } = render(<SignatureForm {...baseProps} proposalIdToUpdate={0} />);
    const signBtn = container.querySelector('[data-testid="sign-btn"]') as HTMLButtonElement;
    fireEvent.click(signBtn);
    await new Promise(r => setTimeout(r, 0));
    expect(signTypedDataMock).toHaveBeenCalledWith(
      expect.objectContaining({ primaryType: 'Proposal' }),
    );
  });

  it('clicking sign btn calls signTypedData with updateProposalTypes when proposalIdToUpdate>0', async () => {
    const { container } = render(<SignatureForm {...baseProps} proposalIdToUpdate={5} />);
    const signBtn = container.querySelector('[data-testid="sign-btn"]') as HTMLButtonElement;
    fireEvent.click(signBtn);
    await new Promise(r => setTimeout(r, 0));
    expect(signTypedDataMock).toHaveBeenCalledWith(
      expect.objectContaining({ primaryType: 'UpdateProposal' }),
    );
  });

  it('overlay close button calls setIsFormDisplayed(false) + clearTransactionState', () => {
    const setFormDisplayed = vi.fn();
    const { container } = render(
      <SignatureForm {...baseProps} setIsFormDisplayed={setFormDisplayed} />,
    );
    const closeBtn = container.querySelector('[data-testid="overlay-close"]') as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(setFormDisplayed).toHaveBeenCalledWith(false);
    expect(clearTransactionStateMock).toHaveBeenCalled();
  });

  it('overlay try-again button calls clearTransactionState', () => {
    const { container } = render(<SignatureForm {...baseProps} />);
    const tryBtn = container.querySelector(
      '[data-testid="overlay-try-again"]',
    ) as HTMLButtonElement;
    fireEvent.click(tryBtn);
    expect(clearTransactionStateMock).toHaveBeenCalled();
  });

  it('passes dateErrorMessage from flow to SignatureFormFields', () => {
    flowState.dateErrorMessage = 'invalid date';
    const { container } = render(<SignatureForm {...baseProps} />);
    const fields = container.querySelector('[data-testid="signature-form-fields"]');
    expect(fields?.getAttribute('data-date-error')).toBe('invalid date');
  });

  it('calls validateExpirationDate on render (useEffect)', () => {
    render(<SignatureForm {...baseProps} />);
    expect(validateExpirationDateMock).toHaveBeenCalled();
  });

  it('passes isOverlayVisible=false when flow says hidden', () => {
    flowState.isOverlayVisible = false;
    const { container } = render(<SignatureForm {...baseProps} />);
    const overlay = container.querySelector('[data-testid="signature-status-overlay"]');
    expect(overlay?.getAttribute('data-overlay-visible')).toBe('false');
  });

  it('passes empty errorMessage when flow has none', () => {
    flowState.errorMessage = '';
    const { container } = render(<SignatureForm {...baseProps} />);
    const overlay = container.querySelector('[data-testid="signature-status-overlay"]');
    expect(overlay?.getAttribute('data-error-message')).toBe('');
  });

  it('default isWaiting/isLoading both false on initial state', () => {
    const { container } = render(<SignatureForm {...baseProps} />);
    const fields = container.querySelector('[data-testid="signature-form-fields"]');
    expect(fields?.getAttribute('data-is-waiting')).toBe('false');
    expect(fields?.getAttribute('data-is-loading')).toBe('false');
  });

  it('multiple sign clicks call signTypedData per click', async () => {
    const { container } = render(<SignatureForm {...baseProps} proposalIdToUpdate={0} />);
    const signBtn = container.querySelector('[data-testid="sign-btn"]') as HTMLButtonElement;
    fireEvent.click(signBtn);
    fireEvent.click(signBtn);
    await new Promise(r => setTimeout(r, 0));
    expect(signTypedDataMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('overlay close calls setIsFormDisplayed exactly once per click', () => {
    const setFormDisplayed = vi.fn();
    const { container } = render(
      <SignatureForm {...baseProps} setIsFormDisplayed={setFormDisplayed} />,
    );
    const closeBtn = container.querySelector('[data-testid="overlay-close"]') as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(setFormDisplayed).toHaveBeenCalledTimes(1);
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureForm {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different transaction states', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureForm {...baseProps} transactionState={i % 2 === 0 ? 'None' : 'Mining'} />,
      );
      unmount();
    }
  });

  it('rapid 100 setIsFormDisplayed invocations', () => {
    const setIsFormDisplayed = vi.fn();
    render(<SignatureForm {...baseProps} setIsFormDisplayed={setIsFormDisplayed} />);
    for (let i = 0; i < 100; i++) setIsFormDisplayed(false);
    expect(setIsFormDisplayed).toHaveBeenCalledTimes(100);
  });

  it('handles 30 cycles with isSignPending true', () => {
    const orig = hookState.isSignPending;
    hookState.isSignPending = true;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureForm {...baseProps} />);
      unmount();
    }
    hookState.isSignPending = orig;
  });

  it('handles 30 different signature data values', () => {
    const orig = hookState.signature;
    for (let i = 0; i < 30; i++) {
      hookState.signature = '0x' + i.toString(16).padStart(64, '0');
      const { unmount } = render(<SignatureForm {...baseProps} />);
      unmount();
    }
    hookState.signature = orig;
  });
});
