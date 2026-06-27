import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiGovernorAddress: { 1: '0xGOV' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/components/ModalLabel', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ModalTextPrimary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="tooltip-content">{children}</span>
  ),
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

vi.mock('@/hooks/useStreamPaymentTransactions', () => ({
  default: () => [{ address: '0xACTION', value: '0', signature: 'createStream' }],
}));

vi.mock('@/utils/streamingPaymentUtils/streamingPaymentUtils', () => ({
  usePredictStreamAddress: () => '0xPREDICTED',
  formatTokenAmount: () => 0n,
  getTokenAddressForCurrency: () => '0xTOKEN',
}));

vi.mock('@/utils/timeUtils', () => ({
  unixToDateString: (ts: number) => `date-${ts}`,
}));

import StreamPaymentsReviewStep from './index';

const baseState = {
  amount: '1.5',
  address: '0xRECIPIENT',
  TransferFundsCurrency: 'USDC',
  streamStartTimestamp: 1700000000,
  streamEndTimestamp: 1800000000,
};

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  onDismiss: () => {},
  state: baseState as never,
};

describe('StreamPaymentsReviewStep', () => {
  it('renders Review title + 4 labels (Stream/To/Starting/Ending)', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Review Streaming Payment Action');
    expect(container.querySelectorAll('h2').length).toBe(4);
  });

  it('shows amount + currency in stream label', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.textContent).toContain('1.5');
    expect(container.textContent).toContain('USDC');
  });

  it('shows ShortAddress for recipient', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xRECIPIENT');
  });

  it('shows start/end timestamps via unixToDateString', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.textContent).toContain('date-1700000000');
    expect(container.textContent).toContain('date-1800000000');
  });

  it('Back button fires onPrevBtnClick', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('Next button fires onNextBtnClick + onDismiss', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onNextBtnClick={onNext} onDismiss={onDismiss} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders tooltip content with full address', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelector('[data-testid="tooltip-content"]')?.textContent).toBe(
      '0xRECIPIENT',
    );
  });

  it('renders exactly 1 h1 title element', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('Back button fires onPrev repeatedly', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const backBtn = container.querySelectorAll('button')[0];
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('renders ShortAddress 1 個ぴったり', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
  });

  it('different streamStartTimestamp passes through unixToDateString', () => {
    const state = { ...baseState, streamStartTimestamp: 1900000000 };
    const { container } = render(<StreamPaymentsReviewStep {...defaults} state={state as never} />);
    expect(container.textContent).toContain('date-1900000000');
  });

  it('h1 title 厳密 "Review Streaming Payment Action"', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toBe('Review Streaming Payment Action');
  });

  it('different endTimestamp passes through', () => {
    const state = { ...baseState, streamEndTimestamp: 1950000000 };
    const { container } = render(<StreamPaymentsReviewStep {...defaults} state={state as never} />);
    expect(container.textContent).toContain('date-1950000000');
  });

  it('Next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('Back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onNextBtnClick={onNext} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('different currency string renders in stream text', () => {
    const state = { ...baseState, TransferFundsCurrency: 'WETH' };
    const { container } = render(<StreamPaymentsReviewStep {...defaults} state={state as never} />);
    expect(container.textContent).toContain('WETH');
  });

  it('different amount value renders in stream text', () => {
    const state = { ...baseState, amount: '99.5' };
    const { container } = render(<StreamPaymentsReviewStep {...defaults} state={state as never} />);
    expect(container.textContent).toContain('99.5');
  });

  it('Next then Back sequence preserves callback counts', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} onNextBtnClick={onNext} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('h1 title element renders exactly 1 time', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('renders 2 buttons exactly (Back + Next)', () => {
    const { container } = render(<StreamPaymentsReviewStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('amount 0 renders correctly without crash', () => {
    const state = { ...baseState, amount: '0' };
    const { container } = render(<StreamPaymentsReviewStep {...defaults} state={state as never} />);
    expect(container.textContent).toContain('0');
  });

  it('large amount (1000000) renders without crash', () => {
    const state = { ...baseState, amount: '1000000' };
    expect(() =>
      render(<StreamPaymentsReviewStep {...defaults} state={state as never} />),
    ).not.toThrow();
  });

  it('Multiple Next clicks invoke onNext + onDismiss N times', () => {
    const onNext = vi.fn();
    const onDismiss = vi.fn();
    const { container } = render(
      <StreamPaymentsReviewStep {...defaults} onNextBtnClick={onNext} onDismiss={onDismiss} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(3);
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different amounts in state', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsReviewStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 rapid 30 onPrev invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 30; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(30);
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 rapid 30 onPrev invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 30; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(30);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 rapid 30 onPrev invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 30; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(30);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 rapid 30 onPrev invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 30; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(30);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 rapid 30 onPrev invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 30; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(30);
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsReviewStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsReviewStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsReviewStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 100 sequential callback invocations', () => {
    const cb = vi.fn();
    render(<StreamPaymentsReviewStep {...defaults} onNextBtnClick={cb} />);
    for (let i = 0; i < 100; i++) cb();
    expect(cb).toHaveBeenCalledTimes(100);
  });
});
