import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type DelegateStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const delegateVotesMock = vi.fn();
const hookState: {
  account: string | undefined;
  ensResolved: string | undefined;
  ensFetched: boolean;
  delegateState: {
    status: DelegateStatus;
    errorMessage?: { message: string } | string;
    transaction?: { hash: string };
  };
  nounTokenBalance: number;
  proposalThreshold: number;
  userDelegatee: string | undefined;
  accountVotes: number;
  locale: string;
} = {
  account: '0xUSER',
  ensResolved: undefined,
  ensFetched: true,
  delegateState: { status: 'None' },
  nounTokenBalance: 5,
  proposalThreshold: 1,
  userDelegatee: '0xOLD',
  accountVotes: 5,
  locale: 'en-US',
};

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookState.account }),
  useEnsAddress: () => ({ data: hookState.ensResolved, isFetched: hookState.ensFetched }),
}));

vi.mock('@/components/BrandSpinner', () => ({
  default: () => <span data-testid="brand-spinner" />,
}));

vi.mock('@/components/DelegationCandidateInfo', () => ({
  default: ({ address }: { address: string }) => (
    <div data-testid="delegation-candidate-info">{address}</div>
  ),
}));

vi.mock('@/components/NavBarButton', () => ({
  default: ({
    buttonText,
    onClick,
    disabled,
  }: {
    buttonText: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid="nav-btn" onClick={onClick} disabled={disabled}>
      {buttonText}
    </button>
  ),
  NavBarButtonStyle: {
    DELEGATE_PRIMARY: 'primary',
    DELEGATE_SECONDARY: 'secondary',
    DELEGATE_BACK: 'back',
    DELEGATE_DISABLED: 'disabled',
  },
}));

vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => hookState.locale,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

vi.mock('@/utils/pickByState', async () => {
  const actual = await vi.importActual<typeof import('@/utils/pickByState')>('@/utils/pickByState');
  return actual;
});

vi.mock('@/wrappers/nijiDao', () => ({
  useProposalThreshold: () => hookState.proposalThreshold,
}));

vi.mock('@/wrappers/nijiToken', () => ({
  useNounTokenBalance: () => hookState.nounTokenBalance,
  useDelegateVotes: () => ({
    delegateVotes: delegateVotesMock,
    delegateState: hookState.delegateState,
  }),
  useUserDelegatee: () => hookState.userDelegatee,
  useAccountVotes: () => hookState.accountVotes,
}));

import ChangeDelegatePanel from './index';

const resetState = () => {
  hookState.account = '0xUSER';
  hookState.ensResolved = undefined;
  hookState.ensFetched = true;
  hookState.delegateState = { status: 'None' };
  hookState.nounTokenBalance = 5;
  hookState.proposalThreshold = 1;
  hookState.userDelegatee = '0xOLD';
  hookState.accountVotes = 5;
  hookState.locale = 'en-US';
  delegateVotesMock.mockReset();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

const validAddress = '0x1234567890123456789012345678901234567890';
const dismissMock = vi.fn();

describe('ChangeDelegatePanel', () => {
  it('renders default "Update Delegate" title in ENTER state', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('Update Delegate');
  });

  it('renders input field in ENTER state without delegateTo', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('updates delegate input on change', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    expect(input.value).toBe(validAddress);
  });

  it('shows DelegationCandidateInfo when valid address entered', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    expect(container.querySelector('[data-testid="delegation-candidate-info"]')).not.toBeNull();
  });

  it('shows "already delegated" when input matches current delegate', () => {
    hookState.userDelegatee = validAddress;
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    expect(container.textContent).toContain("You've already delegated to this address");
  });

  it('Delegate button calls delegateVotes with address arg', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    const buttons = Array.from(container.querySelectorAll('button'));
    const delegateBtn = buttons.find(b => b.textContent?.includes('Delegate'));
    fireEvent.click(delegateBtn!);
    expect(delegateVotesMock).toHaveBeenCalledWith({ args: [validAddress] });
  });

  it('Delegate button disabled when no input', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const delegateBtn = buttons.find(b => b.textContent?.includes('Delegate'));
    expect(delegateBtn?.disabled).toBe(true);
  });

  it('Delegate button disabled when availableVotes=0', () => {
    hookState.nounTokenBalance = 0;
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    const buttons = Array.from(container.querySelectorAll('button'));
    const delegateBtn = buttons.find(b => b.textContent?.includes('Delegate'));
    expect(delegateBtn?.disabled).toBe(true);
  });

  it('shows CHANGING title when delegateState is Mining', () => {
    hookState.delegateState = { status: 'Mining' };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('Updating...');
  });

  it('shows CHANGE_SUCCESS title when delegateState is Success', () => {
    hookState.delegateState = { status: 'Success' };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('Delegate Updated!');
  });

  it('shows CHANGE_FAILURE title when delegateState is Fail', () => {
    hookState.delegateState = { status: 'Fail', errorMessage: 'Tx reverted' };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('Delegate Update Failed');
    expect(container.textContent).toContain('Tx reverted');
  });

  it('Close button calls onDismiss', () => {
    dismissMock.mockReset();
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const closeBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.trim() === 'Close',
    );
    fireEvent.click(closeBtn!);
    expect(dismissMock).toHaveBeenCalled();
  });

  it('shows threshold warning when accountVotes - availableVotes < threshold + 1', () => {
    hookState.accountVotes = 5;
    hookState.nounTokenBalance = 5;
    hookState.proposalThreshold = 10;
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('less than');
  });

  it('renders BrandSpinner when delegateTo provided but address not yet resolved', () => {
    const { container } = render(
      <ChangeDelegatePanel onDismiss={dismissMock} delegateTo="not-yet-resolved.eth" />,
    );
    expect(container.querySelector('[data-testid="brand-spinner"]')).not.toBeNull();
  });
});
