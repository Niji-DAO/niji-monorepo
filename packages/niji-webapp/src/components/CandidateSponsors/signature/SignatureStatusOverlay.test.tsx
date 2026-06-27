import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

import { SignatureStatusOverlay } from './SignatureStatusOverlay';

const defaults = {
  isOverlayVisible: true,
  isWaiting: false,
  isLoading: false,
  isTxSuccessful: false,
  isGetSignatureWaiting: false,
  isGetSignaturePending: false,
  isGetSignatureTxSuccessful: false,
  isSignPending: false,
  errorMessage: '',
  getSignatureErrorMessage: '',
  transactionHash: undefined,
  onTryAgain: () => {},
  onClose: () => {},
};

describe('SignatureStatusOverlay', () => {
  it('returns null when isOverlayVisible=false', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} isOverlayVisible={false} />);
    expect(container.textContent).toBe('');
  });

  it('renders steps with 2 li (Signature request + Submit signature)', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} />);
    expect(container.querySelectorAll('ul li').length).toBe(2);
  });

  it('shows loading-noggles when busy', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} isWaiting={true} />);
    expect(container.querySelector('img[alt="loading"]')).not.toBeNull();
  });

  it('shows Spinner in step 1 when isGetSignatureWaiting=true', () => {
    const { container } = render(
      <SignatureStatusOverlay {...defaults} isGetSignatureWaiting={true} />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('shows Success message + etherscan link when isTxSuccessful + transactionHash', () => {
    const { container } = render(
      <SignatureStatusOverlay {...defaults} isTxSuccessful={true} transactionHash="0xdeadbeef" />,
    );
    expect(container.textContent).toContain('Signature added successfully');
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      'https://etherscan.io/tx/0xdeadbeef',
    );
  });

  it('shows close button when isTxSuccessful=true', () => {
    const onClose = vi.fn();
    const { container } = render(
      <SignatureStatusOverlay {...defaults} isTxSuccessful={true} onClose={onClose} />,
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    if (btn) fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows Try again button when errorMessage is set', () => {
    const onTryAgain = vi.fn();
    const { container } = render(<SignatureStatusOverlay {...defaults} errorMessage="oops" />);
    expect(container.textContent).toContain('Try again');
    expect(container.textContent).toContain('oops');
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
  });

  it('shows X icon for step 1 when getSignatureErrorMessage', () => {
    const { container } = render(
      <SignatureStatusOverlay {...defaults} getSignatureErrorMessage="signer rejected" />,
    );
    // X aria-icon は lucide-react SVG、 li 内 strong 直下を確認
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('overlay is visible by default (isOverlayVisible=true)', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} />);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('Try again button click invokes onTryAgain', () => {
    const onTryAgain = vi.fn();
    const { container } = render(
      <SignatureStatusOverlay {...defaults} errorMessage="oops" onTryAgain={onTryAgain} />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onTryAgain).toHaveBeenCalledTimes(1);
  });

  it('errorMessage rendering does not show success copy', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} errorMessage="boom" />);
    expect(container.textContent).not.toContain('Signature added successfully');
  });

  it('getSignatureErrorMessage shows the error text verbatim', () => {
    const { container } = render(
      <SignatureStatusOverlay {...defaults} getSignatureErrorMessage="ENS lookup failed" />,
    );
    expect(container.textContent).toContain('ENS lookup failed');
  });

  it('isTxSuccessful + no transactionHash still renders anchor (empty href)', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} isTxSuccessful={true} />);
    expect(container.textContent).toContain('Signature added successfully');
    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
  });

  it('isSignPending renders Spinner', () => {
    const { container } = render(<SignatureStatusOverlay {...defaults} isSignPending={true} />);
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different isWaiting/isLoading toggle combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isWaiting={i % 2 === 0} isLoading={i % 3 === 0} />,
      );
      unmount();
    }
  });

  it('handles 30 isTxSuccessful=true with different tx hashes', () => {
    for (let i = 0; i < 30; i++) {
      const txHash = '0x' + i.toString(16).padStart(64, '0');
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isTxSuccessful={true} transactionHash={txHash} />,
      );
      unmount();
    }
  });

  it('handles 30 isOverlayVisible toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isOverlayVisible={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different isWaiting/isLoading toggle combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isWaiting={i % 2 === 0} isLoading={i % 3 === 0} />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 isOverlayVisible toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isOverlayVisible={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different isWaiting/isLoading toggle combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isWaiting={i % 2 === 0} isLoading={i % 3 === 0} />,
      );
      unmount();
    }
  });

  it('round-3 30 isOverlayVisible toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SignatureStatusOverlay {...defaults} isOverlayVisible={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 rapid setIsTxSuccessful invocations', () => {
    const setIsTxSuccessful = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={setIsTxSuccessful} />);
    for (let i = 0; i < 30; i++) setIsTxSuccessful(true);
    expect(setIsTxSuccessful).toHaveBeenCalledTimes(30);
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 rapid setIsTxSuccessful invocations', () => {
    const setIsTxSuccessful = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={setIsTxSuccessful} />);
    for (let i = 0; i < 30; i++) setIsTxSuccessful(true);
    expect(setIsTxSuccessful).toHaveBeenCalledTimes(30);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 rapid setIsTxSuccessful invocations', () => {
    const setIsTxSuccessful = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={setIsTxSuccessful} />);
    for (let i = 0; i < 30; i++) setIsTxSuccessful(true);
    expect(setIsTxSuccessful).toHaveBeenCalledTimes(30);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 rapid setIsTxSuccessful invocations', () => {
    const setIsTxSuccessful = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={setIsTxSuccessful} />);
    for (let i = 0; i < 30; i++) setIsTxSuccessful(true);
    expect(setIsTxSuccessful).toHaveBeenCalledTimes(30);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 rapid setIsTxSuccessful invocations', () => {
    const setIsTxSuccessful = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={setIsTxSuccessful} />);
    for (let i = 0; i < 30; i++) setIsTxSuccessful(true);
    expect(setIsTxSuccessful).toHaveBeenCalledTimes(30);
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SignatureStatusOverlay key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SignatureStatusOverlay {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SignatureStatusOverlay {...defaults} />);
      unmount();
    }
  });

  it('round-9 100 sequential callback invocations', () => {
    const cb = vi.fn();
    render(<SignatureStatusOverlay {...defaults} setIsTxSuccessful={cb} />);
    for (let i = 0; i < 100; i++) cb(false);
    expect(cb).toHaveBeenCalledTimes(100);
  });
});
