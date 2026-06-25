import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignatureFormFields } from './SignatureFormFields';

const defaults = {
  reasonText: '',
  setReasonText: () => {},
  setExpirationDate: () => {},
  expirationDate: 1700000000,
  dateErrorMessage: '',
  isWaiting: false,
  isLoading: false,
  proposalIdToUpdate: 0,
  transactionState: '',
  onSign: () => {},
};

describe('SignatureFormFields', () => {
  it('renders "Sponsor this proposal candidate" header', () => {
    const { container } = render(<SignatureFormFields {...defaults} />);
    expect(container.textContent).toContain('Sponsor this proposal candidate');
  });

  it('renders textarea + date input', () => {
    const { container } = render(<SignatureFormFields {...defaults} />);
    expect(container.querySelector('textarea')).not.toBeNull();
    expect(container.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('fires setReasonText on textarea change', () => {
    const setReason = vi.fn();
    const { container } = render(<SignatureFormFields {...defaults} setReasonText={setReason} />);
    const ta = container.querySelector('textarea');
    if (ta) fireEvent.change(ta, { target: { value: 'because' } });
    expect(setReason).toHaveBeenCalledWith('because');
  });

  it('disables textarea + input when isWaiting=true', () => {
    const { container } = render(<SignatureFormFields {...defaults} isWaiting={true} />);
    expect(container.querySelector('textarea')?.disabled).toBe(true);
    expect(container.querySelector('input[type="date"]')?.disabled).toBe(true);
  });

  it('disables when isLoading=true', () => {
    const { container } = render(<SignatureFormFields {...defaults} isLoading={true} />);
    expect(container.querySelector('textarea')?.disabled).toBe(true);
  });

  it('shows date error message when provided', () => {
    const { container } = render(
      <SignatureFormFields {...defaults} dateErrorMessage="Invalid date" />,
    );
    expect(container.textContent).toContain('Invalid date');
  });

  it('renders "Sponsor" button by default (proposalIdToUpdate=0)', () => {
    const { container } = render(<SignatureFormFields {...defaults} />);
    expect(container.querySelector('button')?.textContent).toBe('Sponsor');
  });

  it('renders "Re-sign" when proposalIdToUpdate > 0', () => {
    const { container } = render(<SignatureFormFields {...defaults} proposalIdToUpdate={42} />);
    expect(container.querySelector('button')?.textContent).toBe('Re-sign');
  });

  it('disables sign button when transactionState=Mining', () => {
    const { container } = render(<SignatureFormFields {...defaults} transactionState="Mining" />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('disables sign button when expirationDate is undefined', () => {
    const { container } = render(<SignatureFormFields {...defaults} expirationDate={undefined} />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('disables sign button when dateErrorMessage is non-empty', () => {
    const { container } = render(<SignatureFormFields {...defaults} dateErrorMessage="bad" />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders loading-noggles img when isWaiting=true (no button)', () => {
    const { container } = render(<SignatureFormFields {...defaults} isWaiting={true} />);
    expect(container.querySelector('img[alt="loading"]')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('fires onSign when sign button clicked', () => {
    const onSign = vi.fn();
    const { container } = render(<SignatureFormFields {...defaults} onSign={onSign} />);
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onSign).toHaveBeenCalledTimes(1);
  });

  it('renders reason text in textarea (pre-set)', () => {
    const { container } = render(<SignatureFormFields {...defaults} reasonText="pre-existing" />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('pre-existing');
  });

  it('disables button when dateErrorMessage is non-empty + transactionState=None', () => {
    const { container } = render(<SignatureFormFields {...defaults} dateErrorMessage="boom" />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders fewer textarea changes (1 trigger)', () => {
    const setReason = vi.fn();
    const { container } = render(<SignatureFormFields {...defaults} setReasonText={setReason} />);
    const ta = container.querySelector('textarea');
    if (ta) fireEvent.change(ta, { target: { value: 'a' } });
    expect(setReason).toHaveBeenCalledTimes(1);
  });

  it('multi click on sign button fires onSign N times', () => {
    const onSign = vi.fn();
    const { container } = render(<SignatureFormFields {...defaults} onSign={onSign} />);
    const btn = container.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(onSign).toHaveBeenCalledTimes(2);
  });

  it('isLoading=true disables textarea and input', () => {
    const { container } = render(<SignatureFormFields {...defaults} isLoading={true} />);
    expect(container.querySelector('textarea')?.disabled).toBe(true);
    expect(container.querySelector('input[type="date"]')?.disabled).toBe(true);
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<SignatureFormFields {...defaults} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <SignatureFormFields key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different reasonText values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SignatureFormFields {...defaults} reasonText={`r-${i}`} />);
      unmount();
    }
  });

  it('handles 100 different expirationDate values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <SignatureFormFields {...defaults} expirationDate={1700000000 + i * 86400} />,
      );
      unmount();
    }
  });

  it('rapid 500 setReasonText events', () => {
    const setReasonText = vi.fn();
    const { container } = render(
      <SignatureFormFields {...defaults} setReasonText={setReasonText} />,
    );
    const textarea = container.querySelector('textarea')!;
    for (let i = 0; i < 500; i++) {
      fireEvent.change(textarea, { target: { value: `r-${i}` } });
    }
    expect(setReasonText).toHaveBeenCalledTimes(500);
  });
});
