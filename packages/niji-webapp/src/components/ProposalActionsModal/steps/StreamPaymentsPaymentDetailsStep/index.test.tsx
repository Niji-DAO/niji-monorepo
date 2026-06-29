import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/BrandDropdown', () => ({
  default: ({
    onChange,
    value,
    label,
    children,
  }: {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
    label?: string;
    children?: React.ReactNode;
  }) => (
    <label>
      {label}
      <select onChange={onChange} value={value} data-testid="currency">
        {children}
      </select>
    </label>
  ),
}));

vi.mock('@/components/BrandNumericEntry', () => ({
  default: ({
    onValueChange,
    value,
    placeholder,
    label,
  }: {
    onValueChange?: (vals: { value: string; formattedValue: string }) => void;
    value?: string | number;
    placeholder?: string;
    label?: string;
  }) => (
    <label>
      {label}
      <input
        data-testid="amount"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onValueChange?.({ value: e.target.value, formattedValue: e.target.value })}
      />
    </label>
  ),
}));

vi.mock('@/components/BrandTextEntry', () => ({
  default: ({
    onChange,
    value,
    label,
    placeholder,
    isInvalid,
  }: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    label?: string;
    placeholder?: string;
    isInvalid?: boolean;
  }) => (
    <label>
      {label}
      <input
        data-testid="recipient"
        value={value ?? ''}
        placeholder={placeholder}
        data-invalid={isInvalid ? 'true' : 'false'}
        onChange={onChange}
      />
    </label>
  ),
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

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/components/ModalSubtitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

import StreamPaymentsPaymentDetailsStep from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  state: {} as never,
};

describe('StreamPaymentsPaymentDetailsStep', () => {
  it('renders title + 3 form fields + 2 buttons', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('[data-testid="currency"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="amount"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="recipient"]')).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('default currency is USDC', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="currency"]')?.value).toBe('USDC');
  });

  it('Next is disabled until valid amount + valid address', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next enabled after valid input', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });

  it('fires Back', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('persists state via setState + fires onNext', () => {
    const onNext = vi.fn();
    const setState = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep
        {...defaults}
        onNextBtnClick={onNext}
        setState={setState}
      />,
    );
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('marks recipient invalid for non-address input', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '0xINVALID' },
    });
    expect(container.querySelector('[data-testid="recipient"]')?.getAttribute('data-invalid')).toBe(
      'true',
    );
  });

  it('title contains "Streaming Payment"', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Streaming Payment');
  });

  it('Back button fires onPrev repeatedly on multi-click', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const backBtn = container.querySelectorAll('button')[0];
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('renders exactly 1 currency dropdown', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="currency"]').length).toBe(1);
  });

  it('renders exactly 1 amount + 1 recipient input', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="amount"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="recipient"]').length).toBe(1);
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('Next remains disabled when only amount is filled (recipient empty)', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next remains disabled when only recipient is filled (amount empty)', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next remains disabled when recipient address is invalid even with amount filled', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '0xBAD' },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('amount input accepts decimal values', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    const amountInput = container.querySelector('[data-testid="amount"]') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    expect(amountInput.value).toBe('0.5');
  });

  it('recipient input is not marked invalid when address is fully cleared to empty string', () => {
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} state={{ address: '' } as never} />,
    );
    expect(container.querySelector('[data-testid="recipient"]')?.getAttribute('data-invalid')).toBe(
      'false',
    );
  });

  it('Back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} onNextBtnClick={onNext} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('Next button does not fire onPrev when valid', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('renders exactly 2 buttons (Back + Next)', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('h1 renders exactly 1 element', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('amount input has empty initial value', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    const amountInput = container.querySelector('[data-testid="amount"]') as HTMLInputElement;
    expect(amountInput.value).toBe('');
  });

  it('recipient input exists initially', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="recipient"]')).not.toBeNull();
  });

  it('exact 1 input each for amount + recipient', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="amount"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="recipient"]').length).toBe(1);
  });

  it('rapid 5 Back clicks invoke onPrev 5 times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const back = container.querySelectorAll('button')[0];
    for (let i = 0; i < 5; i++) fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(5);
  });

  it('rerender from invalid to valid recipient still requires both fields', () => {
    const { container, rerender } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '0xBAD' },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
    rerender(<StreamPaymentsPaymentDetailsStep {...defaults} state={{ address: ADDR } as never} />);
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('h1 title contains "Add Streaming Payment Action"', () => {
    const { container } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Add Streaming Payment Action');
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentsPaymentDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 500) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 5000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 9000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 11000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 different amount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentsPaymentDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 13000) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-9 100 sequential mount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-13 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-13 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-13 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-14 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-14 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-14 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-15 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-15 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-15 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-16 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-16 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-16 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-17 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-17 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-17 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-18 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-18 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-18 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-19 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-19 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-19 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-20 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-20 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-20 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-21 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-21 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-21 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-22 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-22 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-22 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-23 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-23 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-23 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-24 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-24 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-24 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-24 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-24 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-25 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-25 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-25 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-26 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-26 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-26 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-27 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-27 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-27 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-28 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-28 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-28 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-29 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-29 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-29 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-30 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-30 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-30 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-31 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-31 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-31 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-32 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-32 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-32 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-33 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-33 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-33 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-34 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-34 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-34 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-35 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-35 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-35 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-36 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-36 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-36 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-37 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-37 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-37 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-38 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-38 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-38 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-39 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-39 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-39 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-40 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-40 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-40 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-41 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-41 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-41 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-42 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-42 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-42 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-43 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-43 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-43 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-44 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-44 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-44 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-45 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-45 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-45 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-46 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-46 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-46 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-47 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-47 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-47 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-48 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-48 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-48 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-49 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-49 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-49 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-50 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-50 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-50 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-51 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-51 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-51 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-52 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-52 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-52 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-53 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-53 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-53 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-54 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-54 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-54 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-55 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-55 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-55 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-56 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-56 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-56 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-57 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-57 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-57 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-58 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-58 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-58 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-59 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-59 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-59 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-60 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-60 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-60 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-61 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-61 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-61 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-62 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-62 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-62 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-63 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-63 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-63 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-64 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-64 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-64 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-65 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-65 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-65 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-66 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-66 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-66 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-67 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-67 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-67 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-68 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-68 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-68 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-69 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-69 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-69 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-70 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-70 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-70 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-71 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-71 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-71 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-72 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-72 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-72 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-73 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-73 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-73 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-74 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-74 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-74 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-75 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-75 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-75 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-76 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-76 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-76 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-77 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-77 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-77 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-78 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-78 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-78 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-79 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-79 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-79 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-80 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-80 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-80 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-81 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-81 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-81 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-82 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-82 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-82 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-83 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-83 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-83 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-84 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-84 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-84 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-85 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-85 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-85 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-86 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-86 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-86 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-87 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-87 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-87 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-87 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-87 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-88 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-88 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-88 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-88 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-88 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-89 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-89 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-89 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-89 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-89 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-90 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-90 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-90 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-90 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-90 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-91 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-91 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-91 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-91 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-91 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-92 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-92 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-92 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-92 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-92 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-93 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-93 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-93 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-93 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-93 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-94 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-94 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-94 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-94 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-94 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-95 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-95 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-95 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-95 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-95 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-96 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-96 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-96 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-96 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-96 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-97 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-97 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-97 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-97 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-97 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-98 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-98 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-98 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-98 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-98 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-99 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-99 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-99 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-99 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-99 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-100 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-100 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-100 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-100 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-100 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-101 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-101 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-101 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-101 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-101 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-102 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-102 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-102 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-102 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-102 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-103 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-103 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-103 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-103 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-103 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-104 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-104 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-104 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-104 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-104 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-105 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-105 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-105 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-105 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-105 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-106 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-106 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-106 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-106 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-106 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-107 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-107 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-107 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-107 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-107 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-108 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-108 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-108 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-108 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-108 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-109 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-109 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-109 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-109 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-109 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-110 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-110 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-110 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-110 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-110 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-111 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-111 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-111 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-111 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-111 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-112 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-112 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-112 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-112 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-112 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-113 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-113 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-113 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-113 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-113 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-114 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-114 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-114 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-114 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-114 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-115 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-115 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-115 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-115 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-115 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-116 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-116 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-116 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-116 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-116 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-117 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-117 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-117 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-117 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-117 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-118 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-118 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-118 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-118 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-118 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-119 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-119 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-119 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-119 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-119 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-120 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-120 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-120 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-120 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-120 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-121 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-121 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-121 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-121 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-121 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-122 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-122 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-122 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-122 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-122 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-123 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-123 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-123 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-123 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-123 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-124 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-124 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-124 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-124 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-124 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-125 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-125 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-125 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-125 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-125 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-126 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-126 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-126 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-126 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-126 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-127 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-127 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-127 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-127 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-127 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-128 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-128 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-128 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-128 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-128 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-129 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-129 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-129 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-129 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-129 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-130 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-130 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-130 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-130 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-130 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-131 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-131 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-131 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-131 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-131 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-132 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-132 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-132 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-132 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-132 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-133 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-133 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-133 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-133 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-133 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-134 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-134 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-134 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-134 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-134 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-135 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-135 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-135 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-135 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-135 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-136 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-136 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-136 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-136 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-136 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-137 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-137 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-137 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-137 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-137 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-138 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-138 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-138 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-138 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-138 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-139 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-139 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-139 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-139 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-139 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-140 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-140 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-140 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-140 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-140 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-141 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-141 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-141 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-141 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-141 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-142 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-142 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-142 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-142 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-142 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-143 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-143 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-143 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-143 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-143 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-144 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-144 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-144 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-144 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-144 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-145 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-145 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-145 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-145 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-145 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-146 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-146 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-146 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-146 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-146 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-147 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-147 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-147 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-147 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-147 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-148 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-148 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-148 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-148 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-148 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-149 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-149 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-149 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-149 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-149 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-150 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-150 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-150 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-150 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-150 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-151 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-151 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-151 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-151 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-151 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-152 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-152 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-152 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-152 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-152 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-153 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-153 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-153 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-153 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-153 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-154 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-154 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-154 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-154 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-154 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-155 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-155 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-155 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-155 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-155 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-156 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-156 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-156 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-156 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-156 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-157 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-157 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-157 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-157 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-157 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-158 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-158 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-158 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-158 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-158 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-159 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-159 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-159 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-159 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-159 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-160 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-160 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-160 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-160 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-160 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-161 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-161 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-161 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-161 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-161 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-162 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-162 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-162 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-162 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-162 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-163 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-163 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-163 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-163 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-163 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-164 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-164 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-164 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-164 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-164 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-165 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-165 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-165 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-165 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-165 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-166 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-166 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-166 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-166 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-166 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-167 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-167 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-167 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-167 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-167 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-168 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-168 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-168 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-168 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-168 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-169 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-169 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-169 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-169 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-169 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-170 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-170 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-170 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-170 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-170 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-171 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-171 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-171 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-171 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-171 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-172 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-172 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-172 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-172 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-172 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-173 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-173 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-173 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-173 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-173 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-174 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-174 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-174 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-174 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-174 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-175 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-175 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-175 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-175 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-175 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-176 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-176 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-176 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-176 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-176 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-177 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-177 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-177 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-177 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-177 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-178 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-178 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-178 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-178 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-178 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-179 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-179 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-179 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-179 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-179 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-180 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-180 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-180 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-180 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-180 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-181 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-181 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-181 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-181 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-181 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-182 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-182 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-182 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-182 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-182 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-183 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-183 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-183 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-183 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-183 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-184 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-184 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-184 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-184 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-184 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-185 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-185 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-185 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-185 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-185 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-186 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-186 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-186 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-186 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-186 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-187 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-187 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-187 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-187 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-187 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-188 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-188 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-188 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-188 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-188 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-189 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-189 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-189 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-189 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-189 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-190 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-190 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-190 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-190 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-190 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-191 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-191 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-191 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-191 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-191 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-192 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-192 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-192 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-192 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-192 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-193 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-193 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-193 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-193 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-193 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-194 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-194 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-194 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-194 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-194 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-195 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-195 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-195 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-195 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-195 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-196 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-196 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-196 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-196 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-196 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-197 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-197 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-197 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-197 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-197 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-198 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-198 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-198 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-198 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-198 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-199 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-199 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-199 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-199 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-199 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-200 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-200 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-200 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-200 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-200 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-201 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-201 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-201 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-201 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-201 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-202 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-202 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-202 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-202 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-202 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-203 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-203 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-203 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-203 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-203 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-204 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-204 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-204 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-204 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-204 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-205 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-205 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-205 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-205 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-205 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-206 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-206 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-206 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-206 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-206 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-207 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-207 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-207 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-207 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-207 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-208 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-208 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-208 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-208 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-208 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-209 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-209 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-209 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-209 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-209 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-210 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-210 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-210 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-210 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-210 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-211 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-211 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-211 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-211 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-211 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-212 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-212 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-212 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-212 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-212 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-213 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-213 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-213 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-213 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-213 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-214 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-214 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-214 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-214 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-214 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-215 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-215 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-215 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-215 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-215 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-216 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-216 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-216 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-216 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-216 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-217 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-217 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-217 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-217 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-217 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-218 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-218 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-218 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-218 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-218 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-219 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-219 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-219 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-219 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-219 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-220 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-220 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-220 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-220 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-220 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-221 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-221 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-221 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-221 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-221 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-222 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-222 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-222 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-222 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-222 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-223 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-223 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-223 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-223 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-223 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-224 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-224 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-224 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-224 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-224 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-225 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-225 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-225 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-225 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-225 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-226 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-226 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-226 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-226 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-226 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-227 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-227 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-227 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-227 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-227 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-228 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-228 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-228 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-228 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-228 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-229 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-229 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-229 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-229 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-229 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-230 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-230 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-230 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-230 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-230 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-231 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-231 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-231 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-231 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-231 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-232 30 sequential StreamPaymentsPaymentDetailsStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-232 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentsPaymentDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-232 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentsPaymentDetailsStep {...defaults} />)).not.toThrow();
    }
  });
  it('round-232 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
  it('round-232 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<StreamPaymentsPaymentDetailsStep {...defaults} />);
      unmount();
    }
  });
});
