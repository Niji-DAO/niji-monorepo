import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@niji/sdk/react', () => ({
  usdcAddress: { 1: '0xUSDC' },
}));

type WithdrawStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const withdrawTokensMock = vi.fn();
const hookState: {
  withdrawableBalance: bigint;
  withdrawTokensState: { status: WithdrawStatus; errorMessage?: string };
  elapsedTime: number;
} = {
  withdrawableBalance: 5_000_000n,
  withdrawTokensState: { status: 'None' },
  elapsedTime: 50,
};

vi.mock('@/wrappers/nijiStream', () => ({
  useStreamRemainingBalance: () => hookState.withdrawableBalance,
  useWithdrawTokens: () => ({
    withdrawTokens: withdrawTokensMock,
    withdrawTokensState: hookState.withdrawTokensState,
  }),
  useElapsedTime: () => hookState.elapsedTime,
}));

vi.mock('@/components/BrandNumericEntry', () => ({
  default: ({
    value,
    onValueChange,
    isInvalid,
  }: {
    value: number;
    onValueChange: (e: { floatValue?: number }) => void;
    isInvalid: boolean;
  }) => (
    <input
      data-testid="brand-numeric-entry"
      data-invalid={String(isInvalid)}
      data-value={String(value)}
      defaultValue={value}
      onChange={e => onValueChange({ floatValue: Number(e.target.value) })}
    />
  ),
}));

vi.mock('@/components/BrandSpinner', () => ({
  default: () => <span data-testid="brand-spinner" />,
}));

vi.mock('@/components/ModalBottomButtonRow', () => ({
  default: ({
    prevBtnText,
    onPrevBtnClick,
    nextBtnText,
    onNextBtnClick,
    isNextBtnDisabled,
  }: {
    prevBtnText: React.ReactNode;
    onPrevBtnClick: () => void;
    nextBtnText: React.ReactNode;
    onNextBtnClick: () => void;
    isNextBtnDisabled: boolean;
  }) => (
    <div>
      <button data-testid="prev-btn" onClick={onPrevBtnClick}>
        {prevBtnText}
      </button>
      <button data-testid="next-btn" onClick={onNextBtnClick} disabled={isNextBtnDisabled}>
        {nextBtnText}
      </button>
    </div>
  ),
}));

vi.mock('@/components/ModalLabel', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="modal-label">{children}</label>
  ),
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="modal-title">{children}</h1>
  ),
}));

vi.mock('@/components/ProposalActionsModal/steps/TransferFundsDetailsStep', () => ({
  SupportedCurrency: { USDC: 'USDC', WETH: 'WETH' },
}));

vi.mock('@/components/SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

vi.mock('@/components/StartOrEndTime', () => ({
  default: () => <span data-testid="start-or-end-time" />,
}));

vi.mock('@/utils/numberUtils', () => ({
  countDecimals: () => 2,
}));

vi.mock('@/utils/streamingPaymentUtils/streamingPaymentUtils', () => ({
  formatTokenAmount: (amount: number) => amount,
}));

vi.mock('@/utils/usdcUtils', () => ({
  contract2humanUSDCFormat: (n: unknown) => String(Number(n) / 1_000_000),
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

import StreamWithdrawModal from './index';

const baseProps = {
  show: true,
  onDismiss: vi.fn(),
  streamAddress: '0xSTREAM' as `0x${string}`,
  endTime: 200,
  startTime: 100,
  streamAmount: 10_000_000,
  tokenAddress: '0xUSDC' as `0x${string}`,
};

const resetState = () => {
  hookState.withdrawableBalance = 5_000_000n;
  hookState.withdrawTokensState = { status: 'None' };
  hookState.elapsedTime = 50;
  withdrawTokensMock.mockReset();
  baseProps.onDismiss = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('StreamWithdrawModal', () => {
  it('renders nothing when show=false', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('renders modal title "Withdraw from Stream"', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.textContent).toContain('Withdraw from Stream');
  });

  it('displays USDC unit when tokenAddress matches usdcAddress', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.textContent).toContain('USDC');
  });

  it('displays WETH unit when tokenAddress is not USDC', () => {
    const { container } = render(
      <StreamWithdrawModal {...baseProps} tokenAddress={'0xWETH' as `0x${string}`} />,
    );
    expect(container.textContent).toContain('WETH');
  });

  it('renders BrandNumericEntry input', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="brand-numeric-entry"]')).not.toBeNull();
  });

  it('Max click sets withdraw amount', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const allDivs = Array.from(container.querySelectorAll('div'));
    const maxDiv = allDivs.find(d => d.children.length === 0 && d.textContent?.trim() === 'Max');
    expect(maxDiv).not.toBeUndefined();
    fireEvent.click(maxDiv!);
    const input = container.querySelector(
      '[data-testid="brand-numeric-entry"]',
    ) as HTMLInputElement;
    expect(Number(input.dataset.value)).toBeGreaterThan(0);
  });

  it('Withdraw button triggers withdrawTokens and shows loading view', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(withdrawTokensMock).toHaveBeenCalled();
  });

  it('Loading view shows BrandSpinner when status=Mining', () => {
    hookState.withdrawTokensState = { status: 'Mining' };
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(container.querySelector('[data-testid="brand-spinner"]')).not.toBeNull();
  });

  it('Loading view shows success message when status=Success', () => {
    hookState.withdrawTokensState = { status: 'Success' };
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(container.textContent).toContain('successfully withdrawn');
  });

  it('Loading view shows error message when status=Fail', () => {
    hookState.withdrawTokensState = { status: 'Fail', errorMessage: 'boom' };
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(container.textContent).toContain('error withdrawing');
    expect(container.textContent).toContain('boom');
  });
});
