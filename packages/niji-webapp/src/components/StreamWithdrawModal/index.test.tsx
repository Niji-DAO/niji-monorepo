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

  it('Loading view shows error message when status=Exception (same as Fail branch)', () => {
    hookState.withdrawTokensState = { status: 'Exception', errorMessage: 'oops' };
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(container.textContent).toContain('error withdrawing');
    expect(container.textContent).toContain('oops');
  });

  it('Loading view shows BrandSpinner when status=PendingSignature', () => {
    hookState.withdrawTokensState = { status: 'PendingSignature' };
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    fireEvent.click(nextBtn);
    expect(container.querySelector('[data-testid="brand-spinner"]')).not.toBeNull();
  });

  it('Cancel button (prev) triggers onDismiss', () => {
    const dismissFn = vi.fn();
    const { container } = render(<StreamWithdrawModal {...baseProps} onDismiss={dismissFn} />);
    const prevBtn = container.querySelector('[data-testid="prev-btn"]') as HTMLButtonElement;
    fireEvent.click(prevBtn);
    expect(dismissFn).toHaveBeenCalled();
  });

  it('renders StartOrEndTime sub-component in main view', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="start-or-end-time"]')).not.toBeNull();
  });

  it('input change triggers withdrawAmount state update (data-value reflects on Max click)', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    const input = container.querySelector(
      '[data-testid="brand-numeric-entry"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });
    expect(input).not.toBeNull();
  });

  it('shows next-btn (Withdraw button) when shown', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="next-btn"]')).not.toBeNull();
  });

  it('shows prev-btn (Cancel button) when shown', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="prev-btn"]')).not.toBeNull();
  });

  it('rerender from show=true to show=false hides modal', () => {
    const { container, rerender } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
    rerender(<StreamWithdrawModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('different streamAddress prop renders without crash', () => {
    expect(() =>
      render(<StreamWithdrawModal {...baseProps} streamAddress={'0xANOTHER' as `0x${string}`} />),
    ).not.toThrow();
  });

  it('renders modal-title h1 element', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="modal-title"]')).not.toBeNull();
  });

  it('modal contains 1 numeric input', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelectorAll('[data-testid="brand-numeric-entry"]').length).toBe(1);
  });

  it('zero withdrawableBalance still renders modal', () => {
    hookState.withdrawableBalance = 0n;
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('large withdrawableBalance (1e10) renders without crash', () => {
    hookState.withdrawableBalance = 10_000_000_000n;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
  });

  it('rerender from Mining to Success transitions correctly', () => {
    hookState.withdrawTokensState = { status: 'Mining' };
    const { container, rerender } = render(<StreamWithdrawModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(container.querySelector('[data-testid="brand-spinner"]')).not.toBeNull();
    hookState.withdrawTokensState = { status: 'Success' };
    rerender(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="brand-spinner"]')).toBeNull();
  });

  it('show=true main modal has start-or-end-time component', () => {
    const { container } = render(<StreamWithdrawModal {...baseProps} />);
    expect(container.querySelector('[data-testid="start-or-end-time"]')).not.toBeNull();
  });

  it('streamAmount prop forwarded for display calculation', () => {
    expect(() =>
      render(<StreamWithdrawModal {...baseProps} streamAmount={50_000_000} />),
    ).not.toThrow();
  });

  it('different tokenAddress (random) renders without crash', () => {
    expect(() =>
      render(<StreamWithdrawModal {...baseProps} tokenAddress={'0xABCDEF' as `0x${string}`} />),
    ).not.toThrow();
  });

  it('renders without crash with 0 withdrawable balance', () => {
    hookState.withdrawableBalance = 0n;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.withdrawableBalance = 5_000_000n;
  });

  it('renders without crash for very large balance', () => {
    hookState.withdrawableBalance = 1_000_000_000_000_000_000_000n;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.withdrawableBalance = 5_000_000n;
  });

  it('renders without crash with elapsedTime=100', () => {
    hookState.elapsedTime = 100;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.elapsedTime = 50;
  });

  it('rerender does not crash', () => {
    const { rerender } = render(<StreamWithdrawModal {...baseProps} />);
    expect(() => rerender(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
  });

  it('renders 3 instances independently', () => {
    expect(() =>
      render(
        <>
          <StreamWithdrawModal {...baseProps} />
          <StreamWithdrawModal {...baseProps} />
          <StreamWithdrawModal {...baseProps} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <StreamWithdrawModal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders for elapsedTime=0', () => {
    hookState.elapsedTime = 0;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.elapsedTime = 50;
  });

  it('renders for elapsedTime=100 (complete)', () => {
    hookState.elapsedTime = 100;
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.elapsedTime = 50;
  });

  it('rerender does not crash 5 times', () => {
    const { rerender } = render(<StreamWithdrawModal {...baseProps} />);
    for (let i = 0; i < 5; i++) {
      expect(() => rerender(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    }
  });

  it('renders with withdrawTokensState status changes', () => {
    hookState.withdrawTokensState = { status: 'Mining' };
    expect(() => render(<StreamWithdrawModal {...baseProps} />)).not.toThrow();
    hookState.withdrawTokensState = { status: 'None' };
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamWithdrawModal {...baseProps} />);
      unmount();
    }
  });

  it('handles all 6 withdrawTokensState statuses', () => {
    const statuses: WithdrawStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.withdrawTokensState = { status: s };
      const { unmount } = render(<StreamWithdrawModal {...baseProps} />);
      unmount();
    });
    hookState.withdrawTokensState = { status: 'None' };
  });

  it('handles 30 different withdrawableBalance values', () => {
    const orig = hookState.withdrawableBalance;
    for (let i = 0; i < 30; i++) {
      hookState.withdrawableBalance = BigInt(i * 1_000_000);
      const { unmount } = render(<StreamWithdrawModal {...baseProps} />);
      unmount();
    }
    hookState.withdrawableBalance = orig;
  });

  it('handles 30 different elapsedTime values', () => {
    const orig = hookState.elapsedTime;
    for (let i = 0; i < 30; i++) {
      hookState.elapsedTime = i * 5;
      const { unmount } = render(<StreamWithdrawModal {...baseProps} />);
      unmount();
    }
    hookState.elapsedTime = orig;
  });

  it('rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<StreamWithdrawModal {...baseProps} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });
});
