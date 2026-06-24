import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

vi.mock('./SignatureForm', () => ({
  default: () => <div data-testid="signature-form" />,
}));

import { SponsorsFormOverlay } from './SponsorsFormOverlay';

const defaults = {
  isFormDisplayed: false,
  candidate: {} as never,
  id: 'cand-1',
  transactionState: 'None' as const,
  setTransactionState: () => {},
  setIsFormDisplayed: () => {},
  handleRefetchCandidateData: () => {},
  setDataFetchPollInterval: () => {},
  proposalIdToUpdate: 0,
};

describe('SponsorsFormOverlay', () => {
  it('does not render motion overlay when isFormDisplayed=false', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} />);
    expect(container.querySelector('[data-testid="motion-div"]')).toBeNull();
  });

  it('renders motion overlay when isFormDisplayed=true', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={true} />);
    expect(container.querySelector('[data-testid="motion-div"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="signature-form"]')).not.toBeNull();
  });

  it('renders Success banner when transactionState=Success', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} transactionState="Success" />);
    expect(container.textContent).toContain('Success!');
  });

  it('does NOT render Success banner for other transactionState', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} />);
    expect(container.textContent).not.toContain('Success!');
  });

  it('close button calls setIsFormDisplayed(false) + setDataFetchPollInterval(0)', () => {
    const setIsForm = vi.fn();
    const setPoll = vi.fn();
    const { container } = render(
      <SponsorsFormOverlay
        {...defaults}
        isFormDisplayed={true}
        setIsFormDisplayed={setIsForm}
        setDataFetchPollInterval={setPoll}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(setIsForm).toHaveBeenCalledWith(false);
    expect(setPoll).toHaveBeenCalledWith(0);
  });

  it('does NOT render Success banner for transactionState=Failed', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} transactionState="Failed" />);
    expect(container.textContent).not.toContain('Success!');
  });

  it('does NOT render Success banner for transactionState=Pending', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} transactionState="Pending" />);
    expect(container.textContent).not.toContain('Success!');
  });

  it('repeated close clicks call setIsFormDisplayed multiple times', () => {
    const setIsForm = vi.fn();
    const setPoll = vi.fn();
    const { container } = render(
      <SponsorsFormOverlay
        {...defaults}
        isFormDisplayed={true}
        setIsFormDisplayed={setIsForm}
        setDataFetchPollInterval={setPoll}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(setIsForm).toHaveBeenCalledTimes(2);
    expect(setPoll).toHaveBeenCalledTimes(2);
  });

  it('renders exactly 1 signature-form when isFormDisplayed=true', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={true} />);
    expect(container.querySelectorAll('[data-testid="signature-form"]').length).toBe(1);
  });

  it('accepts different proposalIdToUpdate value without crash', () => {
    expect(() =>
      render(<SponsorsFormOverlay {...defaults} proposalIdToUpdate={42} />),
    ).not.toThrow();
  });
});
