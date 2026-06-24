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
});
