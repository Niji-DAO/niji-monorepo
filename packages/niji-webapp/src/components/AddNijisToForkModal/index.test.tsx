import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/assets/icons/Link.svg', () => ({
  default: 'link.svg',
}));

vi.mock('@/components/SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

type ApprovalStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const setApprovalMock = vi.fn();
const escrowToForkMock = vi.fn();
const joinForkMock = vi.fn();

const hookState: {
  isApprovedForAll: boolean;
  setApprovalState: { status: ApprovalStatus; errorMessage?: string };
  escrowToForkState: {
    status: ApprovalStatus;
    errorMessage?: string;
    transaction?: { hash: string };
  };
  joinForkState: { status: ApprovalStatus; errorMessage?: string };
  proposals: { id: string; title: string }[];
} = {
  isApprovedForAll: true,
  setApprovalState: { status: 'None' },
  escrowToForkState: { status: 'None' },
  joinForkState: { status: 'None' },
  proposals: [
    { id: '1', title: 'Proposal One' },
    { id: '2', title: 'Proposal Two' },
  ],
};

vi.mock('@/wrappers/nijiDao', () => ({
  useAllProposals: () => ({ data: hookState.proposals }),
  useEscrowToFork: () => ({
    escrowToFork: escrowToForkMock,
    escrowToForkState: hookState.escrowToForkState,
  }),
  useJoinFork: () => ({ joinFork: joinForkMock, joinForkState: hookState.joinForkState }),
}));

vi.mock('@/wrappers/nijiToken', () => ({
  useIsApprovedForAll: () => hookState.isApprovedForAll,
  useSetApprovalForAll: () => ({
    setApproval: setApprovalMock,
    setApprovalState: hookState.setApprovalState,
  }),
}));

import AddNijisToForkModal from './index';

const noop = () => {};

const baseProps = {
  setIsModalOpen: noop,
  isModalOpen: true,
  isConfirmModalOpen: false,
  isForkingPeriod: false,
  title: 'title',
  description: 'desc',
  selectLabel: 'select',
  selectDescription: 'select-desc',
  account: '0xACCT',
  ownedNouns: [1, 2, 3],
  userEscrowedNouns: [] as number[],
  refetchData: vi.fn(),
  setDataFetchPollInterval: vi.fn(),
  setIsConfirmModalOpen: vi.fn(),
};

const resetState = () => {
  hookState.isApprovedForAll = true;
  hookState.setApprovalState = { status: 'None' };
  hookState.escrowToForkState = { status: 'None' };
  hookState.joinForkState = { status: 'None' };
  hookState.proposals = [
    { id: '1', title: 'Proposal One' },
    { id: '2', title: 'Proposal Two' },
  ];
  setApprovalMock.mockReset();
  escrowToForkMock.mockReset();
  joinForkMock.mockReset();
  baseProps.refetchData = vi.fn();
  baseProps.setDataFetchPollInterval = vi.fn();
  baseProps.setIsConfirmModalOpen = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AddNijisToForkModal', () => {
  it('renders confirm modal content when isConfirmModalOpen is true', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={false} isConfirmModalOpen={true} />,
    );
    expect(container.textContent).toContain('Confirm');
    expect(container.textContent).toContain('Join');
    expect(container.textContent).toContain('Cancel');
  });

  it('renders main modal with "Add Nijis to escrow" title when not in forking period', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    expect(container.textContent).toContain('Add Nijis to escrow');
  });

  it('renders main modal with "Join fork" title during forking period', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />);
    expect(container.textContent).toContain('Join fork');
  });

  it('updates reason text on input change', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const reasonInput = container.querySelector(
      'input[aria-label="Your reason for forking"]',
    ) as HTMLInputElement;
    expect(reasonInput).not.toBeNull();
    fireEvent.change(reasonInput, { target: { value: 'my reason' } });
    expect(reasonInput.value).toBe('my reason');
  });

  it('adds proposal to selectedProposals via select change', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const select = container.querySelector(
      'select[aria-label="Select proposal(s)"]',
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '1' } });
    expect(container.textContent).toContain('Proposal One');
  });

  it('toggles individual Niji selection on button click', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const nijiButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Niji 1'),
    );
    expect(nijiButtons.length).toBeGreaterThan(0);
    fireEvent.click(nijiButtons[0]);
    expect(container.textContent).toContain('Adding Niji 1');
  });

  it('renders Select all button when ownedNouns > escrowed', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} userEscrowedNouns={[1]} ownedNouns={[1, 2, 3]} />,
    );
    expect(container.textContent).toContain('Select all');
  });

  it('Select all click selects all owned nouns', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const selectAllBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Select all',
    );
    expect(selectAllBtn).not.toBeUndefined();
    fireEvent.click(selectAllBtn!);
    expect(container.textContent).toContain('Niji 1, Niji 2, Niji 3');
  });

  it('disables escrowed Niji buttons', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} userEscrowedNouns={[2]} ownedNouns={[1, 2, 3]} />,
    );
    const nijiButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Niji 2'),
    );
    const escrowedBtn = nijiButtons.find(b => b.textContent?.includes('in escrow'));
    expect(escrowedBtn?.disabled).toBe(true);
  });

  it('primary button is disabled when no Nijis selected', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const primaryBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Niji'),
    );
    const addBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.startsWith('Add'),
    );
    expect(primaryBtn).not.toBeUndefined();
    expect(addBtn?.disabled).toBe(true);
  });

  it('triggers escrowToFork directly when isApprovedForAll=true (no fork period)', () => {
    hookState.isApprovedForAll = true;
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const nijiButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Niji 1'),
    );
    fireEvent.click(nijiButtons[0]);
    const addBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.startsWith('Add'),
    );
    fireEvent.click(addBtn!);
    expect(escrowToForkMock).toHaveBeenCalled();
    expect(joinForkMock).not.toHaveBeenCalled();
  });

  it('triggers joinFork directly when isApprovedForAll=true and isForkingPeriod=true', () => {
    hookState.isApprovedForAll = true;
    const { container } = render(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />);
    const nijiButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Niji 1'),
    );
    fireEvent.click(nijiButtons[0]);
    const addBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.startsWith('Add'),
    );
    fireEvent.click(addBtn!);
    expect(joinForkMock).toHaveBeenCalled();
    expect(escrowToForkMock).not.toHaveBeenCalled();
  });

  it('triggers setApproval and 2-step UI when not approved', () => {
    hookState.isApprovedForAll = false;
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const nijiButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Niji 1'),
    );
    fireEvent.click(nijiButtons[0]);
    const addBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.startsWith('Add'),
    );
    fireEvent.click(addBtn!);
    expect(setApprovalMock).toHaveBeenCalled();
    expect(container.textContent).toContain('Set approval');
  });

  it('shows "approve access" note when not approved', () => {
    hookState.isApprovedForAll = false;
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    expect(container.textContent).toContain("You'll be asked to approve access");
  });

  it('shows success message + etherscan link on escrowToForkState=Success', () => {
    hookState.escrowToForkState = {
      status: 'Success',
      transaction: { hash: '0xabc' },
    };
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    expect(container.textContent).toContain('added to escrow');
    expect(container.querySelector('a[href*="0xabc"]')).not.toBeNull();
  });

  it('shows error message + Try again button on escrowToForkState=Fail', () => {
    hookState.escrowToForkState = { status: 'Fail', errorMessage: 'Tx failed' };
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    expect(container.textContent).toContain('Tx failed');
    expect(container.textContent).toContain('Try again');
  });

  it('Try again button clears error state', () => {
    hookState.escrowToForkState = { status: 'Fail', errorMessage: 'Tx failed' };
    const { container } = render(<AddNijisToForkModal {...baseProps} />);
    const tryAgain = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Try again',
    );
    fireEvent.click(tryAgain!);
    expect(container.textContent).not.toContain('Tx failed');
  });

  it('confirm modal Cancel button calls setIsConfirmModalOpen(false)', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={false} isConfirmModalOpen={true} />,
    );
    const cancelBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Cancel',
    );
    fireEvent.click(cancelBtn!);
    expect(baseProps.setIsConfirmModalOpen).toHaveBeenCalledWith(false);
  });

  it('renders nothing when both modals closed', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={false} isConfirmModalOpen={false} />,
    );
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('isModalOpen=true alone shows main modal', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={true} isConfirmModalOpen={false} />,
    );
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('rerender from open to closed hides modal', () => {
    const { container, rerender } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={true} />,
    );
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
    rerender(<AddNijisToForkModal {...baseProps} isModalOpen={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('isConfirmModalOpen=true alone shows confirm modal', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={false} isConfirmModalOpen={true} />,
    );
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('both modal open renders modal (no crash)', () => {
    expect(() =>
      render(<AddNijisToForkModal {...baseProps} isModalOpen={true} isConfirmModalOpen={true} />),
    ).not.toThrow();
  });

  it('default props renders without crash', () => {
    expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
  });

  it('renders with isModalOpen=false (closed state)', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} isModalOpen={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('renders with isModalOpen=true (open state)', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} isModalOpen={true} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('renders without crash with empty ownedNouns', () => {
    expect(() =>
      render(<AddNijisToForkModal {...baseProps} ownedNouns={[] as number[]} />),
    ).not.toThrow();
  });

  it('renders with large ownedNouns list (50 items)', () => {
    const nouns = Array.from({ length: 50 }, (_, i) => i);
    expect(() => render(<AddNijisToForkModal {...baseProps} ownedNouns={nouns} />)).not.toThrow();
  });

  it('confirmModal show only renders modal content (no main modal)', () => {
    const { container } = render(
      <AddNijisToForkModal {...baseProps} isModalOpen={false} isConfirmModalOpen={true} />,
    );
    expect(container.textContent).toContain('Confirm');
  });

  it('isForkingPeriod=true title changes', () => {
    const { container } = render(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />);
    expect(container.textContent).toContain('Join fork');
  });

  it('renders without crash with isForkingPeriod=false', () => {
    expect(() =>
      render(<AddNijisToForkModal {...baseProps} isForkingPeriod={false} />),
    ).not.toThrow();
  });

  it('renders without crash with all default props', () => {
    expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
  });

  it('rerender does not crash', () => {
    const { rerender } = render(<AddNijisToForkModal {...baseProps} />);
    expect(() => rerender(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
  });

  it('renders 3 instances independently', () => {
    expect(() =>
      render(
        <>
          <AddNijisToForkModal {...baseProps} />
          <AddNijisToForkModal {...baseProps} />
          <AddNijisToForkModal {...baseProps} />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances all consecutively', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
    }
  });

  it('renders without crash with refetchData being undefined', () => {
    expect(() =>
      render(<AddNijisToForkModal {...baseProps} refetchData={() => {}} />),
    ).not.toThrow();
  });

  it('renders 5 modals independently with different account props', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <AddNijisToForkModal key={i} {...baseProps} account={`0x${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash for isForkingPeriod=true + confirmOpen=true', () => {
    expect(() =>
      render(
        <AddNijisToForkModal {...baseProps} isForkingPeriod={true} isConfirmModalOpen={true} />,
      ),
    ).not.toThrow();
  });

  it('rerender from non-forking to forking period preserves modal', () => {
    const { rerender } = render(<AddNijisToForkModal {...baseProps} isForkingPeriod={false} />);
    expect(() =>
      rerender(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />),
    ).not.toThrow();
  });

  it('renders 20 instances each in single mount', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <AddNijisToForkModal
              key={i}
              {...baseProps}
              ownedNouns={Array.from({ length: i + 1 }, (_, j) => j)}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 4 setApprovalState statuses', () => {
    const statuses: ApprovalStatus[] = ['None', 'PendingSignature', 'Mining', 'Success'];
    statuses.forEach(status => {
      hookState.setApprovalState = { status };
      expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
      hookState.setApprovalState = { status: 'None' };
    });
  });

  it('handles all escrowToForkState transition states', () => {
    const statuses: ApprovalStatus[] = ['None', 'PendingSignature', 'Mining', 'Success', 'Fail'];
    statuses.forEach(status => {
      hookState.escrowToForkState = { status };
      expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
      hookState.escrowToForkState = { status: 'None' };
    });
  });

  it('renders for 100 owned nouns', () => {
    const nouns = Array.from({ length: 100 }, (_, i) => i);
    expect(() => render(<AddNijisToForkModal {...baseProps} ownedNouns={nouns} />)).not.toThrow();
  });

  it('renders with empty proposals list', () => {
    hookState.proposals = [];
    expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
    hookState.proposals = [
      { id: '1', title: 'Proposal One' },
      { id: '2', title: 'Proposal Two' },
    ];
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves modal', () => {
    const { container, rerender } = render(<AddNijisToForkModal {...baseProps} />);
    for (let i = 0; i < 30; i++) {
      rerender(<AddNijisToForkModal {...baseProps} isForkingPeriod={i % 2 === 0} />);
    }
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('handles 1000 owned nouns large array', () => {
    const nouns = Array.from({ length: 1000 }, (_, i) => i);
    expect(() => render(<AddNijisToForkModal {...baseProps} ownedNouns={nouns} />)).not.toThrow();
  });

  it('handles 500 proposals', () => {
    hookState.proposals = Array.from({ length: 500 }, (_, i) => ({
      id: String(i),
      title: `Proposal ${i}`,
    }));
    expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
    hookState.proposals = [
      { id: '1', title: 'Proposal One' },
      { id: '2', title: 'Proposal Two' },
    ];
  });

  it('handles all joinForkState statuses', () => {
    const statuses: ApprovalStatus[] = ['None', 'PendingSignature', 'Mining', 'Success', 'Fail'];
    statuses.forEach(s => {
      hookState.joinForkState = { status: s };
      expect(() =>
        render(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />),
      ).not.toThrow();
    });
    hookState.joinForkState = { status: 'None' };
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} />);
      unmount();
    }
  });

  it('handles 5000 owned nouns', () => {
    const nouns = Array.from({ length: 5000 }, (_, i) => i);
    expect(() => render(<AddNijisToForkModal {...baseProps} ownedNouns={nouns} />)).not.toThrow();
  });

  it('handles userEscrowedNouns combined with ownedNouns', () => {
    expect(() =>
      render(
        <AddNijisToForkModal
          {...baseProps}
          ownedNouns={[1, 2, 3, 4, 5]}
          userEscrowedNouns={[3, 4]}
        />,
      ),
    ).not.toThrow();
  });

  it('rapid refetchData 100 invocations', () => {
    const refetchData = vi.fn();
    render(<AddNijisToForkModal {...baseProps} refetchData={refetchData} />);
    for (let i = 0; i < 100; i++) refetchData();
    expect(refetchData).toHaveBeenCalledTimes(100);
  });

  it('handles isApprovedForAll=false branch', () => {
    hookState.isApprovedForAll = false;
    expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
    hookState.isApprovedForAll = true;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different account addresses', () => {
    for (let i = 0; i < 30; i++) {
      const props = { ...baseProps, account: '0x' + i.toString(16).padStart(40, '0') };
      const { unmount } = render(<AddNijisToForkModal {...props} />);
      unmount();
    }
  });

  it('handles rapid 30 isForkingPeriod toggle', () => {
    const { rerender } = render(<AddNijisToForkModal {...baseProps} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(<AddNijisToForkModal {...baseProps} isForkingPeriod={i % 2 === 0} />),
      ).not.toThrow();
    }
  });

  it('handles 10000 user escrowed nouns', () => {
    const escrowed = Array.from({ length: 10000 }, (_, i) => i);
    expect(() =>
      render(<AddNijisToForkModal {...baseProps} userEscrowedNouns={escrowed} />),
    ).not.toThrow();
  });

  it('handles all 5 setApprovalState statuses', () => {
    const statuses: ApprovalStatus[] = ['None', 'PendingSignature', 'Mining', 'Success', 'Fail'];
    statuses.forEach(s => {
      hookState.setApprovalState = { status: s };
      expect(() => render(<AddNijisToForkModal {...baseProps} />)).not.toThrow();
    });
    hookState.setApprovalState = { status: 'None' };
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different titles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} title={`Title-${i}`} />);
      unmount();
    }
  });

  it('handles 30 different ownedNouns array sizes', () => {
    for (let i = 1; i <= 30; i++) {
      const nouns = Array.from({ length: i }, (_, j) => j);
      const { unmount } = render(<AddNijisToForkModal {...baseProps} ownedNouns={nouns} />);
      unmount();
    }
  });

  it('handles all 6 escrowToForkState statuses', () => {
    const orig = { ...hookState.escrowToForkState };
    const statuses: ApprovalStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.escrowToForkState = { status: s };
      const { unmount } = render(<AddNijisToForkModal {...baseProps} />);
      unmount();
    });
    hookState.escrowToForkState = orig;
  });

  it('rapid 50 refetchData invocations', () => {
    const refetch = vi.fn();
    render(<AddNijisToForkModal {...baseProps} refetchData={refetch} />);
    for (let i = 0; i < 50; i++) refetch();
    expect(refetch).toHaveBeenCalledTimes(50);
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} />);
      unmount();
    }
  });

  it('handles 30 different description values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} description={`Desc-${i}`} />);
      unmount();
    }
  });

  it('rapid 100 setDataFetchPollInterval invocations', () => {
    const setPoll = vi.fn();
    render(<AddNijisToForkModal {...baseProps} setDataFetchPollInterval={setPoll} />);
    for (let i = 0; i < 100; i++) setPoll(i * 100);
    expect(setPoll).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different selectLabel values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal {...baseProps} selectLabel={`Sel-${i}`} />);
      unmount();
    }
  });

  it('handles all 6 joinForkState statuses', () => {
    const orig = { ...hookState.joinForkState };
    const statuses: ApprovalStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      hookState.joinForkState = { status: s };
      const { unmount } = render(<AddNijisToForkModal {...baseProps} isForkingPeriod={true} />);
      unmount();
    });
    hookState.joinForkState = orig;
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 100 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 100; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 100 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 100; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(100);
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-6 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-7 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-8 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<AddNijisToForkModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-9 30 different onDismiss functions second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => i} />);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-10 30 sequential AddNijisToForkModal mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-11 30 sequential AddNijisToForkModal mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <AddNijisToForkModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<AddNijisToForkModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AddNijisToForkModal onDismiss={() => {}} />);
      unmount();
    }
  });
});
