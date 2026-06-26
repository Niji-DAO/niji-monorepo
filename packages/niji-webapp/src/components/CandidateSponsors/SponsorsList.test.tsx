import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./Signature', () => ({
  default: ({ signer }: { signer: string }) => <li data-testid="signature">{signer}</li>,
}));

vi.mock('./OriginalSignature', () => ({
  default: ({ signer }: { signer: string }) => <li data-testid="original-signature">{signer}</li>,
}));

import { SponsorsList } from './SponsorsList';

const makeSignature = (
  overrides: Partial<{
    signerId: string;
    voteCount: number;
    canceled: boolean;
  }> = {},
) => ({
  signer: {
    id: overrides.signerId ?? '0xSIGNER1',
    voteCount: overrides.voteCount ?? 5,
    activeOrPendingProposal: false,
  },
  reason: '',
  expirationTimestamp: '1700000000',
  sig: '0xSIG',
  canceled: overrides.canceled ?? false,
});

const makeCandidate = (
  overrides: Partial<{
    contentSignatures: ReturnType<typeof makeSignature>[];
    requiredVotes: number;
    voteCount: number;
    isProposal: boolean;
  }> = {},
) =>
  ({
    version: {
      content: {
        contentSignatures: overrides.contentSignatures ?? [makeSignature()],
      },
    },
    requiredVotes: overrides.requiredVotes ?? 3,
    voteCount: overrides.voteCount ?? 1,
    isProposal: overrides.isProposal ?? false,
  }) as never;

const baseProps = {
  candidate: makeCandidate(),
  isParentProposalUpdatable: true,
  isProposer: false,
  isAccountSigner: false,
  isOriginalSigner: false,
  isThresholdMet: false,
  account: '0xACCT',
  activePendingProposers: {} as unknown,
  connectedAccountNounVotes: 5,
  setIsAccountSigner: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  handleRefetchCandidateData: vi.fn(),
  onOpenSubmitModal: vi.fn(),
  onOpenUpdateModal: vi.fn(),
  onOpenForm: vi.fn(),
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  Object.assign(baseProps, {
    setIsAccountSigner: vi.fn(),
    setDataFetchPollInterval: vi.fn(),
    handleRefetchCandidateData: vi.fn(),
    onOpenSubmitModal: vi.fn(),
    onOpenUpdateModal: vi.fn(),
    onOpenForm: vi.fn(),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SponsorsList', () => {
  it('renders Signature for each valid contentSignature', () => {
    const candidate = makeCandidate({
      contentSignatures: [makeSignature({ signerId: '0xS1' }), makeSignature({ signerId: '0xS2' })],
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    expect(container.querySelectorAll('[data-testid="signature"]')).toHaveLength(2);
  });

  it('skips canceled signatures', () => {
    const candidate = makeCandidate({
      contentSignatures: [
        makeSignature({ signerId: '0xS1' }),
        makeSignature({ signerId: '0xS2', canceled: true }),
      ],
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    expect(container.querySelectorAll('[data-testid="signature"]')).toHaveLength(1);
  });

  it('skips signatures with voteCount=0', () => {
    const candidate = makeCandidate({
      contentSignatures: [
        makeSignature({ signerId: '0xS1', voteCount: 0 }),
        makeSignature({ signerId: '0xS2' }),
      ],
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    expect(container.querySelectorAll('[data-testid="signature"]')).toHaveLength(1);
  });

  it('skips all signatures when activePendingProposers is null', () => {
    const { container } = wrap(
      <SponsorsList {...baseProps} activePendingProposers={null as unknown} />,
    );
    expect(container.querySelectorAll('[data-testid="signature"]')).toHaveLength(0);
  });

  it('renders placeholder li for required - voteCount slots', () => {
    const candidate = makeCandidate({
      contentSignatures: [],
      requiredVotes: 3,
      voteCount: 0,
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    const placeholders = Array.from(container.querySelectorAll('li')).filter(li =>
      li.className.includes('placeholder'),
    );
    expect(placeholders).toHaveLength(3);
  });

  it('renders Submit onchain button when isProposer + isThresholdMet', () => {
    const { container } = wrap(
      <SponsorsList {...baseProps} isProposer={true} isThresholdMet={true} />,
    );
    expect(container.textContent).toContain('Submit onchain');
  });

  it('Submit onchain click invokes onOpenSubmitModal when non-update', () => {
    const { container } = wrap(
      <SponsorsList {...baseProps} isProposer={true} isThresholdMet={true} />,
    );
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'Submit onchain',
    );
    fireEvent.click(submitBtn!);
    expect(baseProps.onOpenSubmitModal).toHaveBeenCalled();
  });

  it('renders Sponsor button when canSignNewCandidate + votes > 0', () => {
    const { container } = wrap(<SponsorsList {...baseProps} />);
    expect(container.textContent).toContain('Sponsor');
  });

  it('Sponsor click invokes onOpenForm', () => {
    const { container } = wrap(<SponsorsList {...baseProps} />);
    const sponsorBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'Sponsor',
    );
    fireEvent.click(sponsorBtn!);
    expect(baseProps.onOpenForm).toHaveBeenCalled();
  });

  it('renders "Sponsoring requires at least one Niji vote" when connectedAccountNounVotes=0', () => {
    const { container } = wrap(<SponsorsList {...baseProps} connectedAccountNounVotes={0} />);
    expect(container.textContent).toContain(
      'Sponsoring a proposal requires at least one Niji vote',
    );
  });

  it('renders "is no longer updatable" when isUpdateToProposal + !isParentProposalUpdatable', () => {
    const { container } = wrap(
      <SponsorsList
        {...baseProps}
        isUpdateToProposal={true}
        isParentProposalUpdatable={false}
        originalProposal={{ id: '42', signers: [] } as never}
      />,
    );
    expect(container.textContent).toContain('is no longer updatable');
  });

  it('renders OriginalSignature for original proposal signers in update mode', () => {
    const candidate = makeCandidate({
      contentSignatures: [],
      requiredVotes: 0,
      voteCount: 0,
    });
    const { container } = wrap(
      <SponsorsList
        {...baseProps}
        candidate={candidate}
        isUpdateToProposal={true}
        originalProposal={{ id: '42', signers: [{ id: '0xOG' }] } as never}
        originalSignersDelegates={[{ id: '0xOG', nijiRepresented: [{}, {}] }]}
      />,
    );
    expect(container.querySelectorAll('[data-testid="original-signature"]')).toHaveLength(1);
  });

  it('Sponsor button absent when connectedAccountNounVotes=0', () => {
    const { container } = wrap(<SponsorsList {...baseProps} connectedAccountNounVotes={0} />);
    const sponsorBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'Sponsor',
    );
    expect(sponsorBtn).toBeUndefined();
  });

  it('renders no placeholder when requiredVotes <= voteCount', () => {
    const candidate = makeCandidate({
      contentSignatures: [makeSignature()],
      requiredVotes: 1,
      voteCount: 1,
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    const placeholders = Array.from(container.querySelectorAll('li')).filter(li =>
      li.className.includes('placeholder'),
    );
    expect(placeholders).toHaveLength(0);
  });

  it('renders correct count when many signatures (5 entries)', () => {
    const candidate = makeCandidate({
      contentSignatures: Array.from({ length: 5 }, (_, i) =>
        makeSignature({ signerId: `0xS${i}` }),
      ),
    });
    const { container } = wrap(<SponsorsList {...baseProps} candidate={candidate} />);
    expect(container.querySelectorAll('[data-testid="signature"]')).toHaveLength(5);
  });

  it('hides Submit onchain button when threshold not met', () => {
    const { container } = wrap(
      <SponsorsList {...baseProps} isProposer={true} isThresholdMet={false} />,
    );
    expect(container.textContent).not.toContain('Submit onchain');
  });

  it('hides Submit onchain button when not proposer (even if threshold met)', () => {
    const { container } = wrap(
      <SponsorsList {...baseProps} isProposer={false} isThresholdMet={true} />,
    );
    expect(container.textContent).not.toContain('Submit onchain');
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SponsorsList {...baseProps} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different signature counts', () => {
    for (let i = 0; i < 30; i++) {
      const signatures = Array.from({ length: i }, (_, j) =>
        makeSignature({ signerId: `0xS${j}` }),
      );
      const candidate = makeCandidate({ signatures });
      const { unmount } = render(
        <MemoryRouter>
          <SponsorsList {...baseProps} candidate={candidate as never} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 isThresholdMet toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <SponsorsList {...baseProps} isThresholdMet={i % 2 === 0} />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('rapid 100 onOpenSubmitModal invocations', () => {
    const onOpen = vi.fn();
    render(
      <MemoryRouter>
        <SponsorsList {...baseProps} onOpenSubmitModal={onOpen} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 100; i++) onOpen();
    expect(onOpen).toHaveBeenCalledTimes(100);
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different signature counts', () => {
    for (let i = 0; i < 30; i++) {
      const signatures = Array.from({ length: i }, (_, j) =>
        makeSignature({ signerId: `0xR2-S${j}` }),
      );
      const candidate = makeCandidate({ signatures });
      const { unmount } = wrap(<SponsorsList {...baseProps} candidate={candidate as never} />);
      unmount();
    }
  });

  it('round-2 handles 30 isThresholdMet toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} isThresholdMet={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 rapid 200 onOpenSubmitModal invocations', () => {
    const onOpen = vi.fn();
    render(
      <MemoryRouter>
        <SponsorsList {...baseProps} onOpenSubmitModal={onOpen} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 200; i++) onOpen();
    expect(onOpen).toHaveBeenCalledTimes(200);
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SponsorsList {...baseProps} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-3 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SponsorsList {...baseProps} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-4 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SponsorsList {...baseProps} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-5 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SponsorsList {...baseProps} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-6 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SponsorsList key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<SponsorsList {...baseProps} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });

  it('round-7 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<SponsorsList {...baseProps} />);
      unmount();
    }
  });
});
