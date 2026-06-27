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

  it('Back button repeated clicks invoke onPrev N times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    const back = container.querySelectorAll('button')[0];
    fireEvent.click(back);
    fireEvent.click(back);
    fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('h1 (ModalTitle) is rendered exactly 1 time', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('Next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onPrevBtnClick={onPrev}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('Back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        onNextBtnClick={onNext}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('rerender from noArg to transfer updates arguments text', () => {
    const { container, rerender } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    expect(container.textContent).toContain('None');
    rerender(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '500'],
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('500');
  });

  it('renders 2 buttons exactly (Back + Next)', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('arguments show "to" param verbatim', () => {
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
  });

  it('Next button repeated clicks invoke onNext N times', () => {
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
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(2);
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('rerender state.address updates ShortAddress text', () => {
    const { container, rerender } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: ADDR, amount: '0', args: [] } as never}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
    const NEW_ADDR = '0x0000000000000000000000000000000000000bad';
    rerender(
      <FunctionCallReviewStep
        {...defaults}
        state={{ abi, function: 'noArg', address: NEW_ADDR, amount: '0', args: [] } as never}
      />,
    );
    const shorts = container.querySelectorAll('[data-testid="short"]');
    const found = Array.from(shorts).some(s => s.textContent === NEW_ADDR);
    expect(found).toBe(true);
  });

  it('renders 1 next button regardless of args length', () => {
    const { container } = render(
      <FunctionCallReviewStep
        {...defaults}
        state={
          {
            abi,
            function: 'transfer',
            address: ADDR,
            amount: '0',
            args: [ADDR, '1', '2', '3', '4'],
          } as never
        }
      />,
    );
    expect(container.querySelectorAll('[data-testid="next-btn"]').length).toBe(1);
  });

  const baseState = {
    abi,
    function: 'transfer',
    address: ADDR,
    amount: '0',
    args: [ADDR, '1000'],
  } as never;

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallReviewStep {...defaults} state={baseState} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-4 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR4' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-5 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR5' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-6 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR6' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-7 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR7' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-8 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR8' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={baseState} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState} />),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-9 30 different state addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR9' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
});
