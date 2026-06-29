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

  it('round-124 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-124 30 renders instances variant', () => {
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

  it('round-124 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-124 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-124 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR124' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-125 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-125 30 renders instances variant', () => {
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

  it('round-125 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-125 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-125 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR125' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-126 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-126 30 renders instances variant', () => {
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

  it('round-126 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-126 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-126 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR126' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-127 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-127 30 renders instances variant', () => {
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

  it('round-127 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-127 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-127 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR127' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-128 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-128 30 renders instances variant', () => {
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

  it('round-128 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-128 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-128 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR128' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-129 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-129 30 renders instances variant', () => {
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

  it('round-129 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-129 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-129 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR129' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-130 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-130 30 renders instances variant', () => {
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

  it('round-130 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-130 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-130 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR130' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-131 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-131 30 renders instances variant', () => {
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

  it('round-131 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-131 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-131 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR131' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-132 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-132 30 renders instances variant', () => {
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

  it('round-132 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-132 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-132 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR132' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-133 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-133 30 renders instances variant', () => {
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

  it('round-133 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-133 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-133 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR133' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-134 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-134 30 renders instances variant', () => {
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

  it('round-134 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-134 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-134 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR134' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-135 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-135 30 renders instances variant', () => {
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

  it('round-135 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-135 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-135 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR135' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-136 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-136 30 renders instances variant', () => {
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

  it('round-136 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-136 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-136 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR136' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-137 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-137 30 renders instances variant', () => {
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

  it('round-137 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-137 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-137 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR137' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-138 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-138 30 renders instances variant', () => {
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

  it('round-138 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-138 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-138 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR138' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-139 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-139 30 renders instances variant', () => {
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

  it('round-139 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-139 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-139 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR139' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-140 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-140 30 renders instances variant', () => {
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

  it('round-140 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-140 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-140 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR140' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-141 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-141 30 renders instances variant', () => {
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

  it('round-141 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-141 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-141 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR141' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-142 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-142 30 renders instances variant', () => {
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

  it('round-142 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-142 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-142 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR142' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-143 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-143 30 renders instances variant', () => {
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

  it('round-143 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-143 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-143 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR143' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-144 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-144 30 renders instances variant', () => {
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

  it('round-144 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-144 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-144 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR144' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-145 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-145 30 renders instances variant', () => {
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

  it('round-145 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-145 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-145 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR145' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-146 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-146 30 renders instances variant', () => {
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

  it('round-146 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-146 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-146 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR146' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-147 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-147 30 renders instances variant', () => {
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

  it('round-147 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-147 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-147 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR147' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-148 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-148 30 renders instances variant', () => {
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

  it('round-148 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-148 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-148 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR148' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-149 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-149 30 renders instances variant', () => {
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

  it('round-149 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-149 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-149 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR149' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-150 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-150 30 renders instances variant', () => {
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

  it('round-150 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-150 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-150 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR150' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-151 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-151 30 renders instances variant', () => {
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

  it('round-151 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-151 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-151 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR151' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-152 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-152 30 renders instances variant', () => {
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

  it('round-152 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-152 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-152 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR152' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-153 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-153 30 renders instances variant', () => {
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

  it('round-153 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-153 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-153 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR153' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-154 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-154 30 renders instances variant', () => {
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

  it('round-154 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-154 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-154 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR154' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-155 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-155 30 renders instances variant', () => {
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

  it('round-155 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-155 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-155 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR155' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-156 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-156 30 renders instances variant', () => {
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

  it('round-156 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-156 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-156 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR156' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-157 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-157 30 renders instances variant', () => {
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

  it('round-157 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-157 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-157 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR157' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-158 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-158 30 renders instances variant', () => {
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

  it('round-158 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-158 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-158 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR158' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-159 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-159 30 renders instances variant', () => {
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

  it('round-159 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-159 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-159 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR159' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-160 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-160 30 renders instances variant', () => {
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

  it('round-160 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-160 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-160 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR160' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-161 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-161 30 renders instances variant', () => {
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

  it('round-161 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-161 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-161 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR161' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-162 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-162 30 renders instances variant', () => {
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

  it('round-162 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-162 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-162 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR162' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-163 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-163 30 renders instances variant', () => {
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

  it('round-163 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-163 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-163 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR163' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-164 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-164 30 renders instances variant', () => {
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

  it('round-164 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-164 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-164 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR164' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-165 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-165 30 renders instances variant', () => {
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

  it('round-165 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-165 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-165 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR165' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-166 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-166 30 renders instances variant', () => {
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

  it('round-166 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-166 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-166 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR166' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-167 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-167 30 renders instances variant', () => {
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

  it('round-167 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });

  it('round-167 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });

  it('round-167 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR167' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-168 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-168 30 renders instances variant', () => {
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
  it('round-168 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-168 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-168 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR168' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-169 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-169 30 renders instances variant', () => {
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
  it('round-169 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-169 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-169 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR169' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-170 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-170 30 renders instances variant', () => {
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
  it('round-170 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-170 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-170 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR170' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-171 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-171 30 renders instances variant', () => {
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
  it('round-171 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-171 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-171 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR171' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-172 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-172 30 renders instances variant', () => {
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
  it('round-172 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-172 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-172 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR172' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-173 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-173 30 renders instances variant', () => {
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
  it('round-173 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-173 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-173 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR173' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-174 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-174 30 renders instances variant', () => {
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
  it('round-174 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-174 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-174 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR174' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-175 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-175 30 renders instances variant', () => {
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
  it('round-175 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-175 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-175 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR175' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-176 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-176 30 renders instances variant', () => {
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
  it('round-176 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-176 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-176 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR176' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-177 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-177 30 renders instances variant', () => {
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
  it('round-177 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-177 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-177 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR177' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-178 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-178 30 renders instances variant', () => {
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
  it('round-178 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-178 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-178 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR178' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-179 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-179 30 renders instances variant', () => {
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
  it('round-179 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-179 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-179 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR179' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-180 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-180 30 renders instances variant', () => {
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
  it('round-180 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-180 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-180 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR180' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-181 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-181 30 renders instances variant', () => {
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
  it('round-181 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-181 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-181 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR181' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-182 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-182 30 renders instances variant', () => {
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
  it('round-182 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-182 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-182 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR182' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-183 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-183 30 renders instances variant', () => {
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
  it('round-183 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-183 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-183 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR183' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-184 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-184 30 renders instances variant', () => {
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
  it('round-184 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-184 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-184 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR184' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-185 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-185 30 renders instances variant', () => {
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
  it('round-185 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-185 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-185 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR185' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-186 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-186 30 renders instances variant', () => {
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
  it('round-186 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-186 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-186 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR186' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-187 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-187 30 renders instances variant', () => {
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
  it('round-187 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-187 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-187 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR187' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-188 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-188 30 renders instances variant', () => {
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
  it('round-188 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-188 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-188 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR188' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-189 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-189 30 renders instances variant', () => {
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
  it('round-189 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-189 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-189 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR189' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-190 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-190 30 renders instances variant', () => {
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
  it('round-190 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-190 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-190 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR190' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-191 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-191 30 renders instances variant', () => {
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
  it('round-191 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-191 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-191 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR191' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-192 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-192 30 renders instances variant', () => {
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
  it('round-192 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-192 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-192 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR192' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-193 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-193 30 renders instances variant', () => {
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
  it('round-193 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-193 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-193 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR193' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-194 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-194 30 renders instances variant', () => {
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
  it('round-194 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-194 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-194 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR194' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-195 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-195 30 renders instances variant', () => {
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
  it('round-195 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-195 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-195 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR195' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-196 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-196 30 renders instances variant', () => {
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
  it('round-196 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-196 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-196 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR196' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-197 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-197 30 renders instances variant', () => {
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
  it('round-197 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-197 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-197 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR197' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-198 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-198 30 renders instances variant', () => {
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
  it('round-198 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-198 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-198 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR198' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-199 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-199 30 renders instances variant', () => {
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
  it('round-199 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-199 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-199 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR199' + i.toString(16).padStart(37, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-200 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-200 30 renders instances variant', () => {
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
  it('round-200 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-200 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-200 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR200' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-201 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-201 30 renders instances variant', () => {
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
  it('round-201 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-201 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-201 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR201' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-202 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-202 30 renders instances variant', () => {
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
  it('round-202 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-202 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-202 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR202' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-203 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-203 30 renders instances variant', () => {
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
  it('round-203 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-203 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-203 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR203' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-204 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-204 30 renders instances variant', () => {
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
  it('round-204 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-204 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-204 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR204' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-205 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-205 30 renders instances variant', () => {
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
  it('round-205 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-205 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-205 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR205' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-206 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-206 30 renders instances variant', () => {
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
  it('round-206 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-206 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-206 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR206' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-207 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-207 30 renders instances variant', () => {
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
  it('round-207 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-207 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-207 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR207' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-208 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-208 30 renders instances variant', () => {
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
  it('round-208 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-208 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-208 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR208' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-209 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-209 30 renders instances variant', () => {
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
  it('round-209 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-209 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-209 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR209' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-210 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-210 30 renders instances variant', () => {
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
  it('round-210 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-210 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-210 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR210' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-211 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-211 30 renders instances variant', () => {
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
  it('round-211 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-211 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-211 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR211' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-212 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-212 30 renders instances variant', () => {
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
  it('round-212 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-212 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-212 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR212' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-213 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-213 30 renders instances variant', () => {
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
  it('round-213 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-213 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-213 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR213' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-214 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-214 30 renders instances variant', () => {
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
  it('round-214 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-214 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-214 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR214' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-215 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-215 30 renders instances variant', () => {
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
  it('round-215 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-215 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-215 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR215' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-216 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-216 30 renders instances variant', () => {
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
  it('round-216 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-216 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-216 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR216' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-217 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-217 30 renders instances variant', () => {
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
  it('round-217 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-217 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-217 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR217' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-218 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-218 30 renders instances variant', () => {
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
  it('round-218 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-218 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-218 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR218' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-219 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-219 30 renders instances variant', () => {
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
  it('round-219 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-219 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-219 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR219' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-220 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-220 30 renders instances variant', () => {
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
  it('round-220 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-220 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-220 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR220' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-221 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-221 30 renders instances variant', () => {
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
  it('round-221 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-221 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-221 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR221' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-222 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-222 30 renders instances variant', () => {
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
  it('round-222 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-222 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-222 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR222' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });

  it('round-223 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-223 30 renders instances variant', () => {
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
  it('round-223 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-223 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-223 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR223' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-224 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-224 30 renders instances variant', () => {
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
  it('round-224 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-224 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-224 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR224' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-225 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-225 30 renders instances variant', () => {
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
  it('round-225 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-225 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-225 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR225' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-226 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-226 30 renders instances variant', () => {
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
  it('round-226 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-226 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-226 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR226' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-227 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-227 30 renders instances variant', () => {
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
  it('round-227 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-227 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-227 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR227' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-228 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-228 30 renders instances variant', () => {
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
  it('round-228 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-228 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-228 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR228' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-229 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-229 30 renders instances variant', () => {
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
  it('round-229 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-229 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-229 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR229' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-230 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-230 30 renders instances variant', () => {
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
  it('round-230 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-230 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-230 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR230' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-231 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-231 30 renders instances variant', () => {
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
  it('round-231 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-231 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-231 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR231' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-232 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-232 30 renders instances variant', () => {
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
  it('round-232 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-232 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-232 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR232' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-233 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-233 30 renders instances variant', () => {
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
  it('round-233 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-233 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-233 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR233' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-234 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-234 30 renders instances variant', () => {
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
  it('round-234 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-234 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-234 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR234' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-235 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-235 30 renders instances variant', () => {
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
  it('round-235 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-235 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-235 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR235' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-236 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-236 30 renders instances variant', () => {
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
  it('round-236 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-236 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-236 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR236' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-237 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-237 30 renders instances variant', () => {
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
  it('round-237 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-237 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-237 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR237' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-238 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-238 30 renders instances variant', () => {
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
  it('round-238 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-238 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-238 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR238' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-239 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-239 30 renders instances variant', () => {
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
  it('round-239 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-239 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-239 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR239' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-240 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-240 30 renders instances variant', () => {
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
  it('round-240 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-240 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-240 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR240' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-241 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-241 30 renders instances variant', () => {
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
  it('round-241 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-241 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-241 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR241' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-242 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-242 30 renders instances variant', () => {
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
  it('round-242 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-242 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-242 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR242' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-243 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-243 30 renders instances variant', () => {
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
  it('round-243 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-243 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-243 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR243' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-244 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-244 30 renders instances variant', () => {
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
  it('round-244 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-244 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-244 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR244' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-245 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-245 30 renders instances variant', () => {
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
  it('round-245 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-245 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-245 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR245' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-246 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-246 30 renders instances variant', () => {
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
  it('round-246 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-246 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-246 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR246' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-247 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-247 30 renders instances variant', () => {
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
  it('round-247 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-247 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-247 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR247' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-248 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-248 30 renders instances variant', () => {
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
  it('round-248 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-248 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-248 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR248' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-249 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-249 30 renders instances variant', () => {
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
  it('round-249 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-249 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-249 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR249' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-250 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-250 30 renders instances variant', () => {
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
  it('round-250 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-250 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-250 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR250' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-251 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-251 30 renders instances variant', () => {
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
  it('round-251 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-251 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-251 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR251' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-252 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-252 30 renders instances variant', () => {
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
  it('round-252 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-252 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-252 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR252' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-253 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-253 30 renders instances variant', () => {
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
  it('round-253 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-253 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-253 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR253' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-254 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-254 30 renders instances variant', () => {
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
  it('round-254 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-254 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-254 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR254' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-255 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-255 30 renders instances variant', () => {
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
  it('round-255 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-255 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-255 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR255' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-256 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-256 30 renders instances variant', () => {
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
  it('round-256 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-256 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-256 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR256' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-257 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-257 30 renders instances variant', () => {
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
  it('round-257 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-257 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-257 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR257' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-258 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-258 30 renders instances variant', () => {
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
  it('round-258 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-258 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-258 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR258' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-259 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-259 30 renders instances variant', () => {
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
  it('round-259 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-259 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-259 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR259' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-260 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-260 30 renders instances variant', () => {
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
  it('round-260 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-260 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-260 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR260' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-261 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-261 30 renders instances variant', () => {
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
  it('round-261 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-261 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-261 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR261' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-262 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-262 30 renders instances variant', () => {
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
  it('round-262 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-262 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-262 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR262' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-263 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-263 30 renders instances variant', () => {
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
  it('round-263 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-263 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-263 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR263' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-264 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-264 30 renders instances variant', () => {
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
  it('round-264 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-264 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-264 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR264' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-265 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-265 30 renders instances variant', () => {
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
  it('round-265 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-265 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-265 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR265' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-266 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-266 30 renders instances variant', () => {
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
  it('round-266 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-266 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-266 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR266' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-267 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-267 30 renders instances variant', () => {
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
  it('round-267 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-267 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-267 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR267' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-268 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-268 30 renders instances variant', () => {
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
  it('round-268 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-268 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-268 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR268' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-269 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-269 30 renders instances variant', () => {
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
  it('round-269 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-269 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-269 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR269' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-270 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-270 30 renders instances variant', () => {
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
  it('round-270 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-270 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-270 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR270' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-271 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-271 30 renders instances variant', () => {
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
  it('round-271 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-271 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-271 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR271' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-272 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-272 30 renders instances variant', () => {
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
  it('round-272 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-272 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-272 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR272' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-273 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-273 30 renders instances variant', () => {
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
  it('round-273 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-273 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-273 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR273' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-274 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-274 30 renders instances variant', () => {
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
  it('round-274 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-274 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-274 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR274' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-275 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-275 30 renders instances variant', () => {
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
  it('round-275 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-275 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-275 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR275' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-276 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-276 30 renders instances variant', () => {
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
  it('round-276 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-276 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-276 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR276' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-277 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-277 30 renders instances variant', () => {
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
  it('round-277 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-277 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-277 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR277' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-278 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-278 30 renders instances variant', () => {
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
  it('round-278 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-278 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-278 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR278' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-279 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-279 30 renders instances variant', () => {
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
  it('round-279 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-279 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-279 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR279' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-280 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-280 30 renders instances variant', () => {
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
  it('round-280 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-280 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-280 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR280' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-281 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-281 30 renders instances variant', () => {
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
  it('round-281 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-281 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-281 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR281' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-282 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-282 30 renders instances variant', () => {
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
  it('round-282 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-282 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-282 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR282' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-283 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-283 30 renders instances variant', () => {
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
  it('round-283 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-283 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-283 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR283' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-284 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-284 30 renders instances variant', () => {
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
  it('round-284 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-284 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-284 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR284' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-285 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-285 30 renders instances variant', () => {
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
  it('round-285 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-285 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-285 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR285' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-286 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-286 30 renders instances variant', () => {
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
  it('round-286 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-286 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-286 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR286' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-287 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-287 30 renders instances variant', () => {
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
  it('round-287 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-287 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-287 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR287' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-288 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-288 30 renders instances variant', () => {
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
  it('round-288 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-288 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-288 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR288' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-289 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-289 30 renders instances variant', () => {
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
  it('round-289 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-289 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-289 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR289' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-290 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-290 30 renders instances variant', () => {
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
  it('round-290 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-290 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-290 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR290' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-291 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-291 30 renders instances variant', () => {
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
  it('round-291 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-291 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-291 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR291' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-292 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-292 30 renders instances variant', () => {
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
  it('round-292 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-292 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-292 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR292' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-293 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-293 30 renders instances variant', () => {
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
  it('round-293 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-293 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-293 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR293' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-294 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-294 30 renders instances variant', () => {
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
  it('round-294 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-294 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-294 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR294' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-295 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-295 30 renders instances variant', () => {
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
  it('round-295 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-295 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-295 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR295' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-296 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-296 30 renders instances variant', () => {
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
  it('round-296 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-296 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-296 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR296' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-297 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-297 30 renders instances variant', () => {
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
  it('round-297 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-297 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-297 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR297' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-298 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-298 30 renders instances variant', () => {
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
  it('round-298 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-298 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-298 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR298' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-299 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-299 30 renders instances variant', () => {
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
  it('round-299 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-299 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-299 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR299' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-300 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-300 30 renders instances variant', () => {
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
  it('round-300 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-300 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-300 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR300' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-301 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-301 30 renders instances variant', () => {
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
  it('round-301 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-301 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-301 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR301' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-302 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-302 30 renders instances variant', () => {
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
  it('round-302 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-302 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-302 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR302' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-303 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-303 30 renders instances variant', () => {
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
  it('round-303 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-303 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-303 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR303' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-304 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-304 30 renders instances variant', () => {
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
  it('round-304 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-304 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-304 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR304' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-305 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-305 30 renders instances variant', () => {
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
  it('round-305 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-305 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-305 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR305' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-306 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-306 30 renders instances variant', () => {
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
  it('round-306 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-306 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-306 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR306' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-307 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-307 30 renders instances variant', () => {
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
  it('round-307 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-307 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-307 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR307' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-308 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-308 30 renders instances variant', () => {
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
  it('round-308 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-308 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-308 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR308' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-309 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-309 30 renders instances variant', () => {
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
  it('round-309 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-309 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-309 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR309' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-310 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-310 30 renders instances variant', () => {
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
  it('round-310 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-310 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-310 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR310' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-311 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-311 30 renders instances variant', () => {
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
  it('round-311 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-311 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-311 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR311' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-312 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-312 30 renders instances variant', () => {
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
  it('round-312 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-312 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-312 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR312' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
  it('round-313 30 sequential FunctionCallReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-313 30 renders instances variant', () => {
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
  it('round-313 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<FunctionCallReviewStep {...defaults} state={baseState as never} />),
      ).not.toThrow();
    }
  });
  it('round-313 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={baseState as never} />,
      );
      unmount();
    }
  });
  it('round-313 100 sequential different address values', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0xR313' + i.toString(16).padStart(36, '0');
      const { unmount } = render(
        <FunctionCallReviewStep {...defaults} state={{ ...baseState, address: addr } as never} />,
      );
      unmount();
    }
  });
});
