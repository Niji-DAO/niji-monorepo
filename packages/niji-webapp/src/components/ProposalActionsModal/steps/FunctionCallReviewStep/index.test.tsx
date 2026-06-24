import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
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

import FunctionCallReviewStep from './index';

const abi = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'noArg',
    inputs: [],
    outputs: [],
    stateMutability: 'view',
  },
];

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  onDismiss: () => {},
};

describe('FunctionCallReviewStep', () => {
  it('renders Review title', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('shows ShortAddress for target', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBeGreaterThan(0);
  });

  it('shows Arguments section', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('Arguments');
  });

  it('shows "None" for Arguments when noArg function', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    expect(container.textContent).toContain('None');
  });

  it('renders argument names + values for each input', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('to');
    expect(container.textContent).toContain('amount');
    expect(container.textContent).toContain('1000');
  });

  it('Back button fires onPrevBtnClick', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('Next button fires handleActionAdd + onDismiss', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onNextBtnClick={onNext}
        onDismiss={onDismiss}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('Next button works for noArg path (fallback signature="")', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onNextBtnClick={onNext}
        onDismiss={onDismiss}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders address via ShortAddress', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    const shorts = container.querySelectorAll('[data-testid="short"]');
    const found = Array.from(shorts).some(s => s.textContent === ADDR);
    expect(found).toBe(true);
  });

  it('shows function name "transfer" in review content', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1000'],
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('transfer');
  });

  it('Back button click is independent of state args', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '999'],
          } as never
        }
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('renders large argument values without crash', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '999999999999999999',
            args: [ADDR, '999999999999999999'],
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('999999999999999999');
  });

  it('Next + Back click sequence works in any order', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onPrevBtnClick={onPrev}
        onNextBtnClick={onNext}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelectorAll('button')[0]);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(2);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });
});
