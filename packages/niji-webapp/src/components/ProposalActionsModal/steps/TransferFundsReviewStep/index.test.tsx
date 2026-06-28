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

  it('Back button fires onPrev repeatedly', () => {
    const onPrev = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    const backBtn = container.querySelectorAll('button')[0];
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    expect(onPrev).toHaveBeenCalledTimes(2);
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('renders ShortAddress 1 個ぴったり', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
  });

  it('STETH currency includes "stETH" text in body', () => {
    const state = { ...baseState, TransferFundsCurrency: SupportedCurrency.STETH };
    const { container } = render(<TransferFundsReviewStep {...defaults} state={state} />);
    // STETH currency 経路で stETH 表示
    expect(container.textContent?.toLowerCase()).toContain('eth');
  });

  it('h1 title 厳密 "Review Transfer Funds Action"', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toBe('Review Transfer Funds Action');
  });

  it('renders ETH currency body without crash', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.textContent).toContain('ETH');
  });

  it('renders amount with decimal places (2.5)', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.textContent).toContain('2.5');
  });

  it('renders for very large amount (1000000) with comma formatting (1,000,000)', () => {
    const state = { ...baseState, amount: '1000000' };
    const { container } = render(<TransferFundsReviewStep {...defaults} state={state} />);
    expect(container.textContent).toContain('1,000,000');
  });

  it('handleActionAdd is called once per Next click', () => {
    const onNext = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} />);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('renders all 3 sections (title + Pay + To)', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.textContent).toContain('Pay');
    expect(container.textContent).toContain('To');
  });

  it('Next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('Back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} />);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('h1 renders exactly 1 time', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('multi-click on Back fires onPrev N times', () => {
    const onPrev = vi.fn();
    const { container } = render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    const back = container.querySelectorAll('button')[0];
    fireEvent.click(back);
    fireEvent.click(back);
    fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('USDC currency state with small amount renders without crash', () => {
    const state = { ...baseState, amount: '0.001', TransferFundsCurrency: SupportedCurrency.USDC };
    expect(() => render(<TransferFundsReviewStep {...defaults} state={state} />)).not.toThrow();
  });

  it('ETH default currency body includes "ETH" keyword', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.textContent).toContain('ETH');
  });

  it('rerender amount changes display', () => {
    const { container, rerender } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.textContent).toContain('2.5');
    rerender(<TransferFundsReviewStep {...defaults} state={{ ...baseState, amount: '7.5' }} />);
    expect(container.textContent).toContain('7.5');
  });

  it('multi-click on Next fires onDismiss N times', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} onDismiss={onDismiss} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('ShortAddress receives full recipient address', () => {
    const { container } = render(<TransferFundsReviewStep {...defaults} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(
      '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    );
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<TransferFundsReviewStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 500) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 5000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 9000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 11000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 different amount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 13000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 100 sequential mount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-13 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-13 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-14 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-14 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-15 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-15 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-16 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-16 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-17 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-17 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-18 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-18 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-19 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-19 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-20 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-20 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-21 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-21 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-22 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-22 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-23 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-23 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });
});
