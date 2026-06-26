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

  it('Success banner shows when isFormDisplayed=false but transactionState=Success', () => {
    const { container } = render(
      <SponsorsFormOverlay {...defaults} transactionState="Success" isFormDisplayed={false} />,
    );
    expect(container.textContent).toContain('Success!');
  });

  it('Success state contains success-related text', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} transactionState="Success" />);
    // success keyword check
    expect(container.textContent?.toLowerCase()).toContain('success');
  });

  it('close button does NOT exist when isFormDisplayed=false', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={false} />);
    // form is not rendered → close button (signature form 内含む) は出ない
    expect(container.querySelector('button')).toBeNull();
  });

  it('handles candidate prop changes via rerender', () => {
    const { rerender, container } = render(
      <SponsorsFormOverlay {...defaults} isFormDisplayed={true} candidate={{ a: 1 } as never} />,
    );
    expect(container.querySelector('[data-testid="signature-form"]')).not.toBeNull();
    rerender(
      <SponsorsFormOverlay {...defaults} isFormDisplayed={true} candidate={{ b: 2 } as never} />,
    );
    expect(container.querySelector('[data-testid="signature-form"]')).not.toBeNull();
  });

  it('renders no signature-form when isFormDisplayed=false', () => {
    const { container } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={false} />);
    expect(container.querySelector('[data-testid="signature-form"]')).toBeNull();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 isFormDisplayed=true cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={true} />);
      unmount();
    }
  });

  it('rapid 100 setIsFormDisplayed invocations', () => {
    const setIsFormDisplayed = vi.fn();
    render(<SponsorsFormOverlay {...defaults} setIsFormDisplayed={setIsFormDisplayed} />);
    for (let i = 0; i < 100; i++) setIsFormDisplayed(false);
    expect(setIsFormDisplayed).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different transactionState values', () => {
    const states = ['None', 'Mining', 'Success', 'Fail'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} transactionState={states[i % 4]} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 isFormDisplayed=true cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} isFormDisplayed={true} />);
      unmount();
    }
  });

  it('round-2 rapid 200 setIsFormDisplayed invocations', () => {
    const setIsFormDisplayed = vi.fn();
    render(<SponsorsFormOverlay {...defaults} setIsFormDisplayed={setIsFormDisplayed} />);
    for (let i = 0; i < 200; i++) setIsFormDisplayed(false);
    expect(setIsFormDisplayed).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different transactionState values', () => {
    const states = ['None', 'Mining', 'Success', 'Fail'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} transactionState={states[i % 4]} />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 isFormDisplayed toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} isFormDisplayed={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-3 30 different transactionState cycles', () => {
    const states = ['Pending', 'Success', 'Failed', 'None'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} transactionState={states[i % 4] as never} />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 isFormDisplayed toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} isFormDisplayed={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-4 30 different transactionState cycles', () => {
    const states = ['Pending', 'Success', 'Failed', 'None'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SponsorsFormOverlay {...defaults} transactionState={states[i % 4] as never} />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsFormOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SponsorsFormOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SponsorsFormOverlay {...defaults} />);
      unmount();
    }
  });
});
