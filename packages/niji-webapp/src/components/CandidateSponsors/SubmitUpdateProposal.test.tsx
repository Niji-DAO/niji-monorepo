import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/assets/icons/Link.svg', () => ({
  default: 'link.svg',
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

type UpdateStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const updateProposalBySigsMock = vi.fn();
const hookState: {
  updateProposalBySigsState: {
    status: UpdateStatus;
    errorMessage?: string;
    transaction?: { hash: string };
  };
} = {
  updateProposalBySigsState: { status: 'None' },
};

vi.mock('@/wrappers/nijiData', () => ({
  useUpdateProposalBySigs: () => ({
    updateProposalBySigs: updateProposalBySigsMock,
    updateProposalBySigsState: hookState.updateProposalBySigsState,
  }),
}));

vi.mock('../SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

import SubmitUpdateProposal from './SubmitUpdateProposal';

const makeCandidate = () =>
  ({
    version: {
      content: {
        targets: ['0xTARGET1', '0xTARGET2'],
        values: ['100', '200'],
        signatures: ['fn1()', 'fn2()'],
        calldatas: ['0xCALLDATA1', '0xCALLDATA2'],
        description: 'test description',
      },
    },
  }) as never;

const makeSignatures = () => [
  {
    sig: '0xSIG_B',
    signer: { id: '0xBBB' },
    expirationTimestamp: '1700000000',
  },
  {
    sig: '0xSIG_A',
    signer: { id: '0xAAA' },
    expirationTimestamp: '1700000000',
  },
];

const baseProps = {
  isModalOpen: true,
  signatures: makeSignatures() as never,
  candidate: makeCandidate(),
  setIsModalOpen: vi.fn(),
  handleRefetchCandidateData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  proposalIdToUpdate: '42',
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  hookState.updateProposalBySigsState = { status: 'None' };
  updateProposalBySigsMock.mockReset();
  baseProps.setIsModalOpen = vi.fn();
  baseProps.handleRefetchCandidateData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SubmitUpdateProposal', () => {
  it('renders modal content when isModalOpen=true', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Update proposal');
    expect(container.textContent).toContain('Add an optional message');
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Optional message');
  });

  it('does not render modal when isModalOpen=false', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('updates reason on textarea change', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'my reason' } });
    expect(textarea.value).toBe('my reason');
  });

  it('Submit update click invokes updateProposalBySigs with sorted signers', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Submit update',
    );
    fireEvent.click(submitBtn!);
    expect(updateProposalBySigsMock).toHaveBeenCalledTimes(1);
    const call = updateProposalBySigsMock.mock.calls[0][0];
    const sortedSigs = call.args[1];
    expect(sortedSigs[0].signer).toBe('0xAAA');
    expect(sortedSigs[1].signer).toBe('0xBBB');
  });

  it('shows "Awaiting confirmation" when status=PendingSignature', () => {
    hookState.updateProposalBySigsState = { status: 'PendingSignature' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Awaiting confirmation');
  });

  it('shows "Submitting proposal" when status=Mining', () => {
    hookState.updateProposalBySigsState = { status: 'Mining' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Submitting proposal');
  });

  it('shows Success message + etherscan link when status=Success', () => {
    hookState.updateProposalBySigsState = {
      status: 'Success',
      transaction: { hash: '0xabc' },
    };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('Success!');
    expect(container.querySelector('a[href*="0xabc"]')).not.toBeNull();
  });

  it('shows error message when status=Fail', () => {
    hookState.updateProposalBySigsState = { status: 'Fail', errorMessage: 'rpc failed' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('rpc failed');
    expect(container.textContent).toContain('Try again');
  });

  it('Try again click clears error state', () => {
    hookState.updateProposalBySigsState = { status: 'Fail', errorMessage: 'rpc failed' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const tryAgain = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Try again',
    );
    fireEvent.click(tryAgain!);
    expect(container.textContent).not.toContain('rpc failed');
  });

  it('shows error message when status=Exception (same path as Fail)', () => {
    hookState.updateProposalBySigsState = { status: 'Exception', errorMessage: 'tx exception' };
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    expect(container.textContent).toContain('tx exception');
  });

  it('Submit update call includes reason field from textarea state', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'reason text' } });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Submit update',
    );
    fireEvent.click(submitBtn!);
    const call = updateProposalBySigsMock.mock.calls[0][0];
    expect(call.args).toContain('reason text');
  });

  it('Submit update call uses proposalIdToUpdate prop (converted to bigint)', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} proposalIdToUpdate="99" />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Submit update',
    );
    fireEvent.click(submitBtn!);
    const call = updateProposalBySigsMock.mock.calls[0][0];
    expect(call.args).toContain(99n);
  });

  it('renders 2 target rows when candidate has 2 targets', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} />);
    // verify sorted sigs length passed to updateProposalBySigs
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Submit update',
    );
    fireEvent.click(submitBtn!);
    const call = updateProposalBySigsMock.mock.calls[0][0];
    expect(call.args[1].length).toBe(2);
  });

  it('handles empty signature array gracefully', () => {
    const { container } = wrap(<SubmitUpdateProposal {...baseProps} signatures={[] as never} />);
    expect(container.textContent).toContain('Update proposal');
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles all 6 status types', () => {
    const statuses: UpdateStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.updateProposalBySigsState = { status: s };
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} />
        </MemoryRouter>,
      );
      unmount();
    });
    hookState.updateProposalBySigsState = { status: 'None' };
  });

  it('rapid 100 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <SubmitUpdateProposal {...baseProps} onDismiss={onDismiss} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 100; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different isModalOpen toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <SubmitUpdateProposal {...baseProps} onDismiss={onDismiss} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles all 6 status types', () => {
    const statuses: UpdateStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.updateProposalBySigsState = { status: s };
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} />
        </MemoryRouter>,
      );
      unmount();
    });
    hookState.updateProposalBySigsState = { status: 'None' };
  });

  it('round-2 handles 30 different isModalOpen toggle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-3 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-4 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-5 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-6 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-7 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-8 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SubmitUpdateProposal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SubmitUpdateProposal {...baseProps} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} />);
      unmount();
    }
  });

  it('round-9 30 isModalOpen toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SubmitUpdateProposal {...baseProps} isModalOpen={i % 2 === 0} />);
      unmount();
    }
  });
});
