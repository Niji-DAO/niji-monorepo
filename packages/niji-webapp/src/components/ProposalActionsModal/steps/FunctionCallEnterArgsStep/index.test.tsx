import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    isNextBtnDisabled,
  }: {
    onPrevBtnClick: React.MouseEventHandler<HTMLDivElement>;
    onNextBtnClick: React.MouseEventHandler<HTMLDivElement>;
    prevBtnText: React.ReactNode;
    nextBtnText: React.ReactNode;
    isNextBtnDisabled?: boolean;
  }) => (
    <>
      <button onClick={onPrevBtnClick as never}>{prevBtnText}</button>
      <button onClick={onNextBtnClick as never} disabled={isNextBtnDisabled} data-testid="next-btn">
        {nextBtnText}
      </button>
    </>
  ),
}));

import FunctionCallEnterArgsStep from './index';

const abi = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
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

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
};

describe('FunctionCallEnterArgsStep', () => {
  it('renders title', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelector('h1')?.textContent).toContain('Add Function Call Arguments');
  });

  it('renders input per ABI argument (transfer = 2)', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(2);
  });

  it('shows "No arguments required" when no inputs', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.textContent).toContain('No arguments required');
    expect(container.querySelectorAll('input').length).toBe(0);
  });

  it('Next is enabled when no args required', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });

  it('Next is disabled until args valid', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Back button fires onPrevBtnClick', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg' } as never}
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('Next button persists state + fires onNext (noArg path)', () => {
    const onNext = vi.fn();
    const setState = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onNextBtnClick={onNext}
        setState={setState}
        state={{ abi, function: 'noArg' } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('renders input names + types as labels', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.textContent).toContain('to');
    expect(container.textContent).toContain('amount');
    expect(container.textContent).toContain('address');
    expect(container.textContent).toContain('uint256');
  });

  it('updates args via input typing (Next becomes enabled with valid args)', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], {
      target: { value: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
    });
    fireEvent.change(inputs[1], { target: { value: '1000' } });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });
});
