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

  it('Next stays disabled when only 1 of 2 args filled', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], {
      target: { value: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next stays disabled when address arg is invalid (e.g. "0xBAD")', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: '0xBAD' } });
    fireEvent.change(inputs[1], { target: { value: '100' } });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next button calls setState with valid args (transfer path)', () => {
    const onNext = vi.fn();
    const setState = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onNextBtnClick={onNext}
        setState={setState}
        state={{ abi, function: 'transfer' } as never}
      />,
    );
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], {
      target: { value: '0x5FbDB2315678afecb367f032d93F642f64180aa3' },
    });
    fireEvent.change(inputs[1], { target: { value: '1000' } });
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('Back click is independent of arg validity (always works)', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'transfer' } as never}
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('Next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg' } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('Back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onNextBtnClick={onNext}
        state={{ abi, function: 'noArg' } as never}
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('multiple Back clicks invoke onPrev N times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallEnterArgsStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg' } as never}
      />,
    );
    const back = container.querySelectorAll('button')[0];
    fireEvent.click(back);
    fireEvent.click(back);
    fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('h1 (ModalTitle) renders exactly 1 time', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('rerender from transfer to noArg removes inputs', () => {
    const { container, rerender } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(2);
    rerender(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(0);
  });

  it('rerender from noArg to transfer adds inputs', () => {
    const { container, rerender } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(0);
    rerender(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(2);
  });

  it('Next button repeated clicks invoke onNext N times', () => {
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
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('transfer function shows 2 inputs (address + uint256)', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'transfer' } as never} />,
    );
    expect(container.querySelectorAll('input').length).toBe(2);
  });

  it('h1 title exactly 1 instance', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('Back + Next buttons count exactly 2', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('h1 title contains "Add Function Call Arguments"', () => {
    const { container } = render(
      <FunctionCallEnterArgsStep {...defaults} state={{ abi, function: 'noArg' } as never} />,
    );
    expect(container.querySelector('h1')?.textContent).toContain('Add Function Call Arguments');
  });
});
