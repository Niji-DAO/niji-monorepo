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
});
