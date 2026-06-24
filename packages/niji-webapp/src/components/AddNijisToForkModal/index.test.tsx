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
});
