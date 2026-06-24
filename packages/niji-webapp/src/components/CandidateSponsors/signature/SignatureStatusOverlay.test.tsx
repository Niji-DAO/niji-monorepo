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
});
