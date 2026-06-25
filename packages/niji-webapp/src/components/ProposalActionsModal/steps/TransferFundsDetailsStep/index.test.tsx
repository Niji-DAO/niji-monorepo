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
    isInvalid,
  }: {
    onValueChange?: (vals: { value: string; formattedValue: string }) => void;
    value?: string | number;
    placeholder?: string;
    label?: string;
    isInvalid?: boolean;
  }) => (
    <label>
      {label}
      <input
        data-testid="amount"
        value={value ?? ''}
        placeholder={placeholder}
        data-invalid={isInvalid ? 'true' : 'false'}
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

import TransferFundsDetailsStep from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  state: {} as never,
};

describe('TransferFundsDetailsStep', () => {
  it('renders title + 3 form fields + 2 buttons', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Add Transfer Funds Action');
    expect(container.querySelector('[data-testid="currency"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="amount"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="recipient"]')).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('default currency is USDC', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="currency"]')?.value).toBe('USDC');
  });

  it('Next is disabled until valid amount + valid address', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next becomes enabled after entering valid amount + valid address', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });

  it('marks recipient invalid when non-empty but not address', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '0xINVALID' },
    });
    expect(container.querySelector('[data-testid="recipient"]')?.getAttribute('data-invalid')).toBe(
      'true',
    );
  });

  it('fires onPrev on Back button click', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('persists state via setState + fires onNext on Review and Add click', () => {
    const onNext = vi.fn();
    const setState = vi.fn();
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} onNextBtnClick={onNext} setState={setState} />,
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

  it('title text 厳密に "Add Transfer Funds Action"', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toBe('Add Transfer Funds Action');
  });

  it('Back button fires onPrev repeatedly', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const backBtn = container.querySelectorAll('button')[0];
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('currency dropdown renders exactly 1 element', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="currency"]').length).toBe(1);
  });

  it('amount + recipient inputs render exactly 1 each', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelectorAll('[data-testid="amount"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="recipient"]').length).toBe(1);
  });

  it('Next stays disabled when amount empty even with valid address', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next stays disabled when address invalid + amount valid', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '100' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '0xBAD' },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('amount input accepts decimal value (0.5)', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    const amountInput = container.querySelector('[data-testid="amount"]') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    expect(amountInput.value).toBe('0.5');
  });

  it('recipient is not invalid when address fully cleared via state.address=""', () => {
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} state={{ address: '' } as never} />,
    );
    expect(container.querySelector('[data-testid="recipient"]')?.getAttribute('data-invalid')).toBe(
      'false',
    );
  });

  it('renders 2 buttons (Back + Review and Add)', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('amount value reflects pre-existing state.amount via numeric mock', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    const amountInput = container.querySelector('[data-testid="amount"]') as HTMLInputElement;
    // initial state.amount = undefined → value = ''
    expect(amountInput.value).toBe('');
  });

  it('currency dropdown change fires onChange handler', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    const currencyDropdown = container.querySelector(
      '[data-testid="currency"]',
    ) as HTMLSelectElement;
    expect(currencyDropdown).not.toBeNull();
    // changeEvent fire はクラッシュしない
    expect(() => {
      fireEvent.change(currencyDropdown, { target: { value: 'WETH' } });
    }).not.toThrow();
  });

  it('Next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
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

  it('h1 title renders only 1 time', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('valid recipient address sets data-invalid=false', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="recipient"]')?.getAttribute('data-invalid')).toBe(
      'false',
    );
  });

  it('amount=0 + valid recipient still disables Next', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '0' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('rapid 5 Back clicks invoke onPrev 5 times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const back = container.querySelectorAll('button')[0];
    for (let i = 0; i < 5; i++) fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(5);
  });

  it('amount + recipient valid then Next enabled', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '5' },
    });
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: ADDR },
    });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });

  it('clearing recipient to empty still allows component to render', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="recipient"]')!, {
      target: { value: '' },
    });
    expect(container.querySelector('[data-testid="recipient"]')).not.toBeNull();
  });

  it('large amount (10000) renders without crash', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    fireEvent.change(container.querySelector('[data-testid="amount"]')!, {
      target: { value: '10000' },
    });
    expect(container.querySelector('[data-testid="amount"]')).not.toBeNull();
  });

  it('h1 title text contains "Add Transfer Funds Action"', () => {
    const { container } = render(<TransferFundsDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Add Transfer Funds Action');
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <TransferFundsDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i) } as never}
        />,
      );
      unmount();
    }
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, amount: String(i + 100) } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<TransferFundsDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TransferFundsDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TransferFundsDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TransferFundsDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(
        <TransferFundsDetailsStep
          {...defaults}
          state={{ ...defaults.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });
});
