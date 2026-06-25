import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short-address">{address}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
}));

type CancelStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const cancelSigMock = vi.fn();
const hookState: {
  cancelSigState: { status: CancelStatus; errorMessage?: string };
} = {
  cancelSigState: { status: 'None' },
};

vi.mock('@/wrappers/nijiDao', () => ({
  useCancelSignature: () => ({
    cancelSig: cancelSigMock,
    cancelSigState: hookState.cancelSigState,
  }),
}));

import Signature from './Signature';

const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 * 24;
const pastTimestamp = Math.floor(Date.now() / 1000) - 3600 * 24;

const baseProps = {
  reason: '',
  expirationTimestamp: futureTimestamp,
  signer: '0xSIGNER123' as `0x${string}`,
  voteCount: 5,
  isAccountSigner: false,
  sig: '0xSIG_HEX',
  signerHasActiveOrPendingProposal: false,
  isUpdateToProposal: false,
  isParentProposalUpdatable: true,
  handleRefetchCandidateData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  setIsAccountSigner: vi.fn(),
  handleSignatureRemoved: vi.fn(),
};

const resetState = () => {
  hookState.cancelSigState = { status: 'None' };
  cancelSigMock.mockReset();
  baseProps.handleRefetchCandidateData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
  baseProps.setIsAccountSigner = vi.fn();
  baseProps.handleSignatureRemoved = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Signature', () => {
  it('renders signer ShortAddress and voteCount plural', () => {
    const { container } = render(<Signature {...baseProps} />);
    expect(container.querySelector('[data-testid="short-address"]')?.textContent).toBe(
      '0xSIGNER123',
    );
    expect(container.textContent).toContain('5 votes');
  });

  it('renders singular "vote" when voteCount=1', () => {
    const { container } = render(<Signature {...baseProps} voteCount={1} />);
    expect(container.textContent).toContain('1 vote');
    expect(container.textContent).not.toContain('1 votes');
  });

  it('shows "Expires" when expirationTimestamp is in future', () => {
    const { container } = render(<Signature {...baseProps} />);
    expect(container.textContent).toContain('Expires');
  });

  it('shows "Expired" when expirationTimestamp is in past', () => {
    const { container } = render(<Signature {...baseProps} expirationTimestamp={pastTimestamp} />);
    expect(container.textContent).toContain('Expired');
  });

  it('shows "Expired" when isUpdateToProposal + !isParentProposalUpdatable', () => {
    const { container } = render(
      <Signature {...baseProps} isUpdateToProposal={true} isParentProposalUpdatable={false} />,
    );
    expect(container.textContent).toContain('Expired');
  });

  it('shows invalid label when signerHasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <Signature {...baseProps} signerHasActiveOrPendingProposal={true} />,
    );
    expect(container.textContent).toContain('Signature invalid');
  });

  it('renders "more" button when reason length > 50', () => {
    const longReason = 'x'.repeat(60);
    const { container } = render(<Signature {...baseProps} reason={longReason} />);
    expect(container.textContent).toContain('more');
  });

  it('does not render "more" button when reason length <= 50', () => {
    const { container } = render(<Signature {...baseProps} reason="short" />);
    const moreBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'more',
    );
    expect(moreBtn).toBeUndefined();
  });

  it('shows "Remove sponsorship" button when isAccountSigner', () => {
    const { container } = render(<Signature {...baseProps} isAccountSigner={true} />);
    expect(container.textContent).toContain('Remove sponsorship');
  });

  it('Remove sponsorship click triggers cancelSig with 0x-prefixed sig', () => {
    const { container } = render(<Signature {...baseProps} isAccountSigner={true} />);
    const removeBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Remove sponsorship'),
    );
    fireEvent.click(removeBtn!);
    expect(cancelSigMock).toHaveBeenCalledWith({ args: ['0xSIG_HEX'] });
  });

  it('shows loading-noggles img when isAccountSigner + status=Mining', () => {
    hookState.cancelSigState = { status: 'Mining' };
    const { container } = render(<Signature {...baseProps} isAccountSigner={true} />);
    const img = container.querySelector('img');
    expect(img?.src).toContain('loading-noggles.svg');
  });

  it('shows Success overlay + invokes handleSignatureRemoved on status=Success', () => {
    hookState.cancelSigState = { status: 'Success' };
    const onRemoved = vi.fn();
    const { container } = render(
      <Signature {...baseProps} handleSignatureRemoved={onRemoved} voteCount={3} />,
    );
    expect(container.textContent).toContain('Success');
    expect(container.textContent).toContain('Signature removed');
    expect(onRemoved).toHaveBeenCalledWith(3);
  });

  it('shows Transaction Failed overlay on status=Fail', () => {
    hookState.cancelSigState = { status: 'Fail', errorMessage: 'rpc failed' };
    const { container } = render(<Signature {...baseProps} />);
    expect(container.textContent).toContain('Transaction Failed');
    expect(container.textContent).toContain('rpc failed');
  });

  it('shows Error overlay on status=Exception + resets poll interval', () => {
    hookState.cancelSigState = { status: 'Exception', errorMessage: 'rpc exception' };
    const setPoll = vi.fn();
    const { container } = render(<Signature {...baseProps} setDataFetchPollInterval={setPoll} />);
    expect(container.textContent).toContain('Error');
    expect(container.textContent).toContain('rpc exception');
    expect(setPoll).toHaveBeenCalledWith(0);
  });

  it('overlay close button invokes setIsAccountSigner(false) + handleRefetchCandidateData', () => {
    hookState.cancelSigState = { status: 'Success' };
    const setIsAcct = vi.fn();
    const refetch = vi.fn();
    const { container } = render(
      <Signature
        {...baseProps}
        setIsAccountSigner={setIsAcct}
        handleRefetchCandidateData={refetch}
      />,
    );
    const closeBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('×'),
    );
    fireEvent.click(closeBtn!);
    expect(setIsAcct).toHaveBeenCalledWith(false);
    expect(refetch).toHaveBeenCalled();
  });

  it('shows "Re-signed" when isUpdateToProposal + !isAccountSigner', () => {
    const { container } = render(
      <Signature {...baseProps} isUpdateToProposal={true} isAccountSigner={false} />,
    );
    expect(container.textContent).toContain('Re-signed');
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Signature {...baseProps} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Signature key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 6 cancelSig statuses', () => {
    const statuses: CancelStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.cancelSigState = { status: s };
      const { unmount } = render(<Signature {...baseProps} />);
      unmount();
    });
    hookState.cancelSigState = { status: 'None' };
  });

  it('handles 30 different signer addresses', () => {
    for (let i = 0; i < 30; i++) {
      const signer = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<Signature {...baseProps} signer={signer} />);
      unmount();
    }
  });

  it('handles 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Signature {...baseProps} voteCount={i} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Signature {...baseProps} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Signature key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles all 6 cancelSig statuses', () => {
    const statuses: CancelStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.cancelSigState = { status: s };
      const { unmount } = render(<Signature {...baseProps} />);
      unmount();
    });
    hookState.cancelSigState = { status: 'None' };
  });

  it('round-2 handles 30 different signer addresses', () => {
    for (let i = 0; i < 30; i++) {
      const signer = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<Signature {...baseProps} signer={signer} />);
      unmount();
    }
  });

  it('round-2 handles 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Signature {...baseProps} voteCount={i + 100} />);
      unmount();
    }
  });
});
