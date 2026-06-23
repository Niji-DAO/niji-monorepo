import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiPayerAbi: [
    {
      type: 'function',
      name: 'sendOrRegisterDebt',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
  ],
  nijiPayerAddress: { 1: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  stEthAddress: { 1: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/components/ModalBottomButtonRow', () => ({
  default: ({
    onPrevBtnClick,
    onNextBtnClick,
    prevBtnText,
    nextBtnText,
  }: {
    onPrevBtnClick: React.MouseEventHandler<HTMLDivElement>;
    onNextBtnClick: React.MouseEventHandler<HTMLDivElement>;
    prevBtnText: React.ReactNode;
    nextBtnText: React.ReactNode;
  }) => (
    <>
      <button onClick={onPrevBtnClick as never}>{prevBtnText}</button>
      <button onClick={onNextBtnClick as never} data-testid="next-btn">
        {nextBtnText}
      </button>
    </>
  ),
}));

import { SupportedCurrency } from '../TransferFundsDetailsStep';

import TransferFundsReviewStep from './index';

const baseState = {
  amount: '2.5',
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  TransferFundsCurrency: SupportedCurrency.ETH,
} as never;

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  onDismiss: () => {},
  state: baseState,
};

describe('TransferFundsReviewStep', () => {
  it('renders Review title + Pay/To labels', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Review Transfer Funds Action');
    expect(container.textContent).toContain('Pay');
    expect(container.textContent).toContain('To');
  });

  it('shows amount + currency', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.textContent).toContain('2.5');
    expect(container.textContent).toContain('ETH');
  });

  it('shows ShortAddress for recipient', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    );
  });

  it('Back button fires onPrevBtnClick', () => {
    const onPrev = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('Next button fires onNextBtnClick (via handleActionAdd) + onDismiss for ETH', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} onDismiss={onDismiss} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Next button works for STETH currency (BigInt JSON.stringify replacer 経路)', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const state = { ...baseState, TransferFundsCurrency: SupportedCurrency.STETH };
    const { container } = render(
      <TransferFundsReviewStep
        {...defaults}
        state={state}
        onNextBtnClick={onNext}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    // BigInt が "2500000000000000000" 等の文字列として直列化されているか
    const callArg = (onNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.decodedCalldata).toContain('2500000000000000000');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Next button works for USDC currency', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const state = { ...baseState, TransferFundsCurrency: SupportedCurrency.USDC };
    const { container } = render(
      <TransferFundsReviewStep
        {...defaults}
        state={state}
        onNextBtnClick={onNext}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
