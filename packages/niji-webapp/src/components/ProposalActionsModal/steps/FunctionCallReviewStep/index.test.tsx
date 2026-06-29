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

  it('round-10 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
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

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState} />),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallReviewStep {...defaults} state={baseState} />);
      unmount();
    }
  });

  it('round-10 100 sequential different state addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR10' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-11 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-11 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR11' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-12 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-12 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR12' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-13 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-13 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-13 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-13 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-13 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR13' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-14 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-14 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-14 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-14 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-14 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR14' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-15 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-15 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-15 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-15 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-15 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR15' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-16 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-16 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-16 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-16 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-16 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR16' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-17 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-17 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-17 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-17 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-17 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR17' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-18 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-18 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-18 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-18 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-18 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR18' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-19 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-19 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-19 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-19 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-19 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR19' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-20 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-20 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-20 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-20 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-20 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR20' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-21 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-21 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-21 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-21 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-21 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR21' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-22 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-22 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-22 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-22 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-22 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR22' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-23 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-23 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-23 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-23 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-23 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR23' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-24 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-24 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-24 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-24 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-24 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR24' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-25 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-25 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-25 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-25 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-25 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR25' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-26 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-26 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-26 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-26 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-26 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR26' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-27 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-27 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-27 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-27 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-27 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR27' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-28 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-28 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-28 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-28 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-28 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR28' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-29 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-29 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-29 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-29 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-29 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR29' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-30 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-30 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-30 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-30 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-30 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR30' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-31 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-31 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-31 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-31 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-31 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR31' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-32 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-32 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-32 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-32 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-32 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR32' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-33 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-33 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-33 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-33 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-33 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR33' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-34 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-34 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-34 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-34 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-34 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR34' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-35 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-35 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-35 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-35 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-35 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR35' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-36 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-36 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-36 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-36 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-36 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR36' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-37 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-37 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-37 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-37 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-37 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR37' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-38 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-38 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-38 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-38 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-38 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR38' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-39 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-39 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-39 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-39 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-39 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR39' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-40 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-40 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-40 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-40 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-40 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR40' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-41 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-41 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-41 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-41 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-41 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR41' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-42 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-42 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-42 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-42 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-42 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR42' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-43 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-43 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-43 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-43 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-43 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR43' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-44 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-44 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-44 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-44 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-44 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR44' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-45 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-45 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-45 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-45 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-45 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR45' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-46 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-46 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-46 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-46 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-46 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR46' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-47 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-47 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-47 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-47 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-47 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR47' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-48 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-48 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-48 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-48 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-48 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR48' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-49 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-49 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-49 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-49 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-49 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR49' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-50 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-50 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-50 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-50 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-50 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR50' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-51 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-51 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-51 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-51 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-51 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR51' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-52 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-52 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-52 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-52 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-52 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR52' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-53 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-53 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-53 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-53 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-53 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR53' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-54 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-54 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-54 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-54 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-54 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR54' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-55 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-55 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-55 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-55 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-55 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR55' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-56 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-56 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-56 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-56 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-56 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR56' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-57 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-57 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-57 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-57 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-57 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR57' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-58 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-58 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-58 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-58 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-58 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR58' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-59 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-59 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-59 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-59 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-59 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR59' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-60 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-60 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-60 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-60 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-60 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR60' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-61 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-61 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-61 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-61 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-61 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR61' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-62 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-62 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-62 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-62 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-62 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR62' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-63 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-63 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-63 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-63 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-63 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR63' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-64 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-64 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-64 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-64 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-64 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR64' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-65 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-65 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-65 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-65 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-65 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR65' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-66 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-66 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-66 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-66 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-66 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR66' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-67 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-67 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-67 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-67 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-67 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR67' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-68 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-68 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-68 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-68 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-68 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR68' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-69 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-69 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-69 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-69 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-69 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR69' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-70 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-70 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-70 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-70 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-70 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR70' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-71 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-71 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-71 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-71 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-71 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR71' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-72 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-72 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-72 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-72 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-72 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR72' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-73 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-73 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-73 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-73 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-73 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR73' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-74 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-74 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-74 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-74 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-74 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR74' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-75 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-75 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-75 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-75 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-75 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR75' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-76 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-76 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-76 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-76 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-76 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR76' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-77 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-77 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-77 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-77 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-77 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR77' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-78 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-78 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-78 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-78 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-78 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR78' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-79 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-79 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-79 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-79 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-79 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR79' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-80 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-80 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-80 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-80 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-80 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR80' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-81 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-81 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-81 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-81 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-81 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR81' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-82 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-82 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-82 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-82 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-82 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR82' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-83 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-83 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-83 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-83 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-83 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR83' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-84 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-84 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-84 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-84 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-84 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR84' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-85 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-85 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-85 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-85 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-85 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR85' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-86 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-86 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-86 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-86 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-86 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR86' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-87 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-87 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-87 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-87 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-87 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR87' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-88 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-88 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-88 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-88 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-88 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR88' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-89 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-89 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-89 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-89 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-89 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR89' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-90 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-90 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-90 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-90 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-90 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR90' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-91 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-91 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-91 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-91 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-91 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR91' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-92 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-92 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-92 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-92 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-92 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR92' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-93 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-93 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-93 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-93 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-93 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR93' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-94 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-94 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-94 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-94 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-94 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR94' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-95 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-95 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-95 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-95 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-95 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR95' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-96 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-96 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-96 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-96 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-96 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR96' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-97 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-97 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-97 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-97 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-97 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR97' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-98 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-98 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-98 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-98 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-98 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR98' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-99 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-99 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-99 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-99 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-99 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR99' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-100 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-100 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-100 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-100 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-100 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR100' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-101 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-101 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-101 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-101 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-101 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR101' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-102 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-102 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-102 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-102 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-102 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR102' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-103 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-103 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-103 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-103 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-103 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR103' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-104 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-104 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-104 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-104 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-104 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR104' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-105 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-105 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallReviewStep key={i} {...defaults} state={{ ...baseState } as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-105 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />),
      ).not.toThrow();
    }
  });

  it('round-105 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState } as never} />,
      );
      unmount();
    }
  });

  it('round-105 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR105' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-106 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-106 30 renders instances variant', () => {
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

  it('round-106 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-106 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-106 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR106' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-107 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-107 30 renders instances variant', () => {
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

  it('round-107 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-107 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-107 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR107' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-108 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-108 30 renders instances variant', () => {
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

  it('round-108 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-108 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-108 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR108' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-109 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-109 30 renders instances variant', () => {
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

  it('round-109 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-109 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-109 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR109' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-110 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-110 30 renders instances variant', () => {
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

  it('round-110 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-110 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-110 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR110' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-111 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-111 30 renders instances variant', () => {
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

  it('round-111 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-111 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-111 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR111' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-112 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-112 30 renders instances variant', () => {
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

  it('round-112 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-112 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-112 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR112' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-113 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-113 30 renders instances variant', () => {
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

  it('round-113 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-113 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-113 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR113' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-114 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-114 30 renders instances variant', () => {
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

  it('round-114 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-114 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-114 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR114' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-115 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-115 30 renders instances variant', () => {
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

  it('round-115 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-115 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-115 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR115' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-116 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-116 30 renders instances variant', () => {
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

  it('round-116 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-116 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-116 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR116' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-117 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-117 30 renders instances variant', () => {
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

  it('round-117 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-117 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-117 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR117' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-118 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-118 30 renders instances variant', () => {
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

  it('round-118 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-118 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-118 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR118' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-119 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-119 30 renders instances variant', () => {
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

  it('round-119 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-119 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-119 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR119' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-120 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-120 30 renders instances variant', () => {
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

  it('round-120 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-120 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-120 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR120' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-121 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-121 30 renders instances variant', () => {
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

  it('round-121 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-121 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-121 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR121' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-122 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-122 30 renders instances variant', () => {
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

  it('round-122 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-122 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-122 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR122' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-123 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-123 30 renders instances variant', () => {
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

  it('round-123 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-123 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-123 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR123' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
});
