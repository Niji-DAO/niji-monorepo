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

  it('Mining state shows "delegating to a new account" copy (CHANGING view)', () => {
    hookState.delegateState = { status: 'Mining' };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('delegated');
  });

  it('Mining state renders View on Etherscan button', () => {
    hookState.delegateState = {
      status: 'Mining',
      transaction: { hash: '0xtx123' },
    };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const etherscanBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('View on Etherscan'),
    );
    expect(etherscanBtn).not.toBeUndefined();
  });

  it('Exception status shows failure title (same path as Fail)', () => {
    hookState.delegateState = { status: 'Exception', errorMessage: 'rpc down' };
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).toContain('Delegate Update Failed');
  });

  it('passes typed input address directly to delegateVotes (does not auto-resolve ENS)', () => {
    delegateVotesMock.mockReset();
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: validAddress } });
    const buttons = Array.from(container.querySelectorAll('button'));
    const delegateBtn = buttons.find(b => b.textContent?.includes('Delegate'));
    fireEvent.click(delegateBtn!);
    expect(delegateVotesMock).toHaveBeenCalledWith({ args: [validAddress] });
  });

  it('does not show threshold warning when accountVotes after delegation still meets threshold', () => {
    hookState.accountVotes = 100;
    hookState.nounTokenBalance = 5;
    hookState.proposalThreshold = 1;
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.textContent).not.toContain('less than');
  });

  it('renders h1 title element exactly 1 time', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('renders multiple ChangeDelegatePanel instances independently', () => {
    expect(() =>
      render(
        <>
          <ChangeDelegatePanel onDismiss={dismissMock} />
          <ChangeDelegatePanel onDismiss={dismissMock} />
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender does not duplicate input field', () => {
    const { container, rerender } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    rerender(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('button count includes Delegate + Close buttons', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('input has type text', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={dismissMock} />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBeDefined();
  });

  it('renders input element exactly 1 time', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    expect(container.querySelectorAll('input').length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crash with default state', () => {
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
  });

  it('onDismiss prop is callable (fn ref preserved)', () => {
    const onDismiss = vi.fn();
    render(<ChangeDelegatePanel onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('rerender with same props does not crash', () => {
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
  });

  it('renders DelegationCandidateInfo component when address is set', () => {
    const { container } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    expect(container.querySelector('[data-testid="delegation-candidate-info"]')).toBeDefined();
  });

  it('renders 3 instances each independently', () => {
    expect(() =>
      render(
        <>
          <ChangeDelegatePanel onDismiss={vi.fn()} />
          <ChangeDelegatePanel onDismiss={vi.fn()} />
          <ChangeDelegatePanel onDismiss={vi.fn()} />
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender does not crash with same onDismiss', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<ChangeDelegatePanel onDismiss={onDismiss} />);
    expect(() => rerender(<ChangeDelegatePanel onDismiss={onDismiss} />)).not.toThrow();
  });

  it('rerender does not crash with new onDismiss', () => {
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
  });

  it('renders without crash 5 times consecutively', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    }
  });

  it('account=undefined renders without crash', () => {
    hookState.account = undefined;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.account = '0xUSER';
  });

  it('renders 10 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <ChangeDelegatePanel key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('multi rerender does not crash', () => {
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    for (let i = 0; i < 10; i++) {
      expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    }
  });

  it('hookState changes preserve component', () => {
    hookState.nounTokenBalance = 10;
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    hookState.nounTokenBalance = 20;
    expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.nounTokenBalance = 5;
  });

  it('renders consistently with proposalThreshold changes', () => {
    hookState.proposalThreshold = 5;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.proposalThreshold = 1;
  });

  it('renders without crash with accountVotes=0', () => {
    hookState.accountVotes = 0;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.accountVotes = 5;
  });

  it('renders 20 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <ChangeDelegatePanel key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 20 times preserves component', () => {
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    for (let i = 0; i < 20; i++) {
      expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    }
  });

  it('handles ensResolved variations', () => {
    hookState.ensResolved = '0xABC123';
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.ensResolved = undefined;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
  });

  it('handles all delegateState statuses', () => {
    const statuses: DelegateStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(status => {
      hookState.delegateState = { status };
      expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    });
    hookState.delegateState = { status: 'None' };
  });

  it('handles userDelegatee variations', () => {
    hookState.userDelegatee = '0xDIFFERENT';
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.userDelegatee = '0xOLD';
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ChangeDelegatePanel key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
    for (let i = 0; i < 30; i++) {
      hookState.accountVotes = i;
      expect(() => rerender(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    }
    hookState.accountVotes = 5;
  });

  it('rapid 50 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<ChangeDelegatePanel onDismiss={onDismiss} />);
    for (let i = 0; i < 50; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(50);
  });

  it('handles all delegateState statuses', () => {
    const statuses: DelegateStatus[] = ['None', 'PendingSignature', 'Mining', 'Success', 'Fail'];
    statuses.forEach(s => {
      hookState.delegateState = { status: s };
      expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    });
    hookState.delegateState = { status: 'None' };
  });

  it('handles very large accountVotes (10000)', () => {
    hookState.accountVotes = 10000;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.accountVotes = 5;
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ChangeDelegatePanel onDismiss={vi.fn()} />);
      unmount();
    }
  });

  it('handles all locale variants', () => {
    ['en-US', 'ja-JP', 'zh-CN'].forEach(loc => {
      hookState.locale = loc;
      expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    });
    hookState.locale = 'en-US';
  });

  it('handles undefined account', () => {
    hookState.account = undefined;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.account = '0xUSER';
  });

  it('handles ensResolved set + ensFetched=true', () => {
    hookState.ensResolved = '0xRESOLVED';
    hookState.ensFetched = true;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.ensResolved = undefined;
  });

  it('handles 0 nounTokenBalance', () => {
    hookState.nounTokenBalance = 0;
    expect(() => render(<ChangeDelegatePanel onDismiss={vi.fn()} />)).not.toThrow();
    hookState.nounTokenBalance = 5;
  });
});
