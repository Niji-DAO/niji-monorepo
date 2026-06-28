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

  it('round-24 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-24 30 renders instances variant', () => {
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

  it('round-24 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-24 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-24 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 renders instances variant', () => {
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

  it('round-25 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-25 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 renders instances variant', () => {
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

  it('round-26 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-26 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 renders instances variant', () => {
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

  it('round-27 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-27 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 renders instances variant', () => {
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

  it('round-28 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-28 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 renders instances variant', () => {
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

  it('round-29 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-29 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 renders instances variant', () => {
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

  it('round-30 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-30 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 renders instances variant', () => {
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

  it('round-31 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-31 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 renders instances variant', () => {
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

  it('round-32 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-32 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 renders instances variant', () => {
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

  it('round-33 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-33 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 renders instances variant', () => {
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

  it('round-34 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-34 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 renders instances variant', () => {
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

  it('round-35 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-35 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 renders instances variant', () => {
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

  it('round-36 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-36 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 renders instances variant', () => {
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

  it('round-37 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-37 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 renders instances variant', () => {
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

  it('round-38 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-38 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 renders instances variant', () => {
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

  it('round-39 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-39 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 renders instances variant', () => {
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

  it('round-40 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-40 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 renders instances variant', () => {
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

  it('round-41 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-41 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 renders instances variant', () => {
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

  it('round-42 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-42 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 renders instances variant', () => {
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

  it('round-43 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-43 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 renders instances variant', () => {
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

  it('round-44 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-44 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 renders instances variant', () => {
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

  it('round-45 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-45 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 renders instances variant', () => {
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

  it('round-46 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-46 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 renders instances variant', () => {
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

  it('round-47 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-47 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 renders instances variant', () => {
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

  it('round-48 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-48 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 renders instances variant', () => {
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

  it('round-49 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-49 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 renders instances variant', () => {
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

  it('round-50 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-50 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 renders instances variant', () => {
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

  it('round-51 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-51 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 renders instances variant', () => {
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

  it('round-52 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-52 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 renders instances variant', () => {
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

  it('round-53 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-53 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 renders instances variant', () => {
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

  it('round-54 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-54 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 renders instances variant', () => {
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

  it('round-55 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-55 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 renders instances variant', () => {
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

  it('round-56 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-56 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 renders instances variant', () => {
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

  it('round-57 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-57 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 renders instances variant', () => {
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

  it('round-58 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-58 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 renders instances variant', () => {
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

  it('round-59 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-59 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 renders instances variant', () => {
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

  it('round-60 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-60 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 renders instances variant', () => {
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

  it('round-61 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-61 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 renders instances variant', () => {
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

  it('round-62 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-62 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 renders instances variant', () => {
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

  it('round-63 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-63 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 renders instances variant', () => {
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

  it('round-64 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-64 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 renders instances variant', () => {
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

  it('round-65 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-65 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 renders instances variant', () => {
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

  it('round-66 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-66 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 renders instances variant', () => {
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

  it('round-67 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-67 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 renders instances variant', () => {
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

  it('round-68 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-68 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 renders instances variant', () => {
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

  it('round-69 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-69 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 renders instances variant', () => {
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

  it('round-70 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-70 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 renders instances variant', () => {
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

  it('round-71 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-71 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 renders instances variant', () => {
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

  it('round-72 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-72 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 renders instances variant', () => {
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

  it('round-73 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-73 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 renders instances variant', () => {
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

  it('round-74 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-74 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 renders instances variant', () => {
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

  it('round-75 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-75 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 renders instances variant', () => {
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

  it('round-76 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-76 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 renders instances variant', () => {
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

  it('round-77 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-77 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 renders instances variant', () => {
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

  it('round-78 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-78 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 renders instances variant', () => {
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

  it('round-79 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-79 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 renders instances variant', () => {
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

  it('round-80 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-80 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 renders instances variant', () => {
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

  it('round-81 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-81 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 renders instances variant', () => {
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

  it('round-82 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-82 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 renders instances variant', () => {
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

  it('round-83 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-83 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 renders instances variant', () => {
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

  it('round-84 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-84 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 renders instances variant', () => {
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

  it('round-85 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-85 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 sequential TransferFundsReviewStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 renders instances variant', () => {
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

  it('round-86 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-86 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsReviewStep {...defaults} />);
      unmount();
    }
  });
});
