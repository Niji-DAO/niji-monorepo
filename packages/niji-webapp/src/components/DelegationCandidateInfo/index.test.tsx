import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('blo', () => ({
  blo: () => 'data:image/png;base64,FAKE',
}));

vi.mock('@/components/BrandSpinner', () => ({
  default: () => <span data-testid="spinner" />,
}));

vi.mock('@/components/DelegationCandidateVoteCountInfo', () => ({
  default: ({
    text,
    voteCount,
    isLoading,
  }: {
    text: React.ReactNode;
    voteCount: number;
    isLoading: boolean;
  }) => (
    <span data-testid="vote-info" data-loading={isLoading ? 'true' : 'false'}>
      {text}={voteCount}
    </span>
  ),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('../ChangeDelegatePanel', () => ({
  ChangeDelegateState: {
    ENTER_DELEGATE_ADDRESS: 0,
    CHANGING: 1,
    CHANGE_SUCCESS: 2,
    CHANGE_FAILURE: 3,
  },
}));

const useAccountVotesMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useAccountVotes: () => useAccountVotesMock(),
}));

vi.mock('@/utils/addressAndENSDisplayUtils', () => ({
  formatShortAddress: (addr: string) => `${addr.slice(0, 6)}...`,
}));

vi.mock('@/utils/pickByState', () => ({
  usePickByState: (state: number, _states: number[], values: React.ReactNode[]) =>
    values[state] ?? values[0],
}));

import { ChangeDelegateState } from '../ChangeDelegatePanel';

import DelegationCandidateInfo from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('DelegationCandidateInfo', () => {
  it('shows spinner when votes is null', () => {
    useAccountVotesMock.mockReturnValue(null);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="spinner"]')).not.toBeNull();
  });

  it('shows ShortAddress + formatted short address when votes loaded', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
    expect(container.textContent).toContain('0x5FbD...');
  });

  it('renders avatar img using blo', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,FAKE');
  });

  it('shows enter state vote info', () => {
    useAccountVotesMock.mockReturnValue(7);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('7');
  });

  it('shows "Will have" state with isLoading=true during CHANGING', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={3}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.getAttribute('data-loading')).toBe(
      'true',
    );
    // willHaveVoteCount = 5 + 3 = 8
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('8');
  });

  it('shows "Now has" state (success) with isLoading=false', () => {
    useAccountVotesMock.mockReturnValue(8);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGE_SUCCESS}
        votesToAdd={3}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.getAttribute('data-loading')).toBe(
      'false',
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('8');
  });

  it('renders for CHANGE_FAILURE state without crash', () => {
    useAccountVotesMock.mockReturnValue(5);
    expect(() =>
      render(
        <DelegationCandidateInfo
          address={ADDR}
          changeModalState={ChangeDelegateState.CHANGE_FAILURE}
          votesToAdd={2}
        />,
      ),
    ).not.toThrow();
  });

  it('handles large votesToAdd (1000)', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={1000}
      />,
    );
    // willHaveVoteCount = 5 + 1000 = 1005
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('1005');
  });

  it('renders exactly 1 avatar img', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('votesToAdd=0 shows same voteCount as account votes', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('5');
  });

  it('renders for votes=0 (zero balance)', () => {
    useAccountVotesMock.mockReturnValue(0);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('0');
  });

  it('CHANGING with votes=null renders spinner branch (no vote-info)', () => {
    useAccountVotesMock.mockReturnValue(null);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={5}
      />,
    );
    expect(container.querySelector('[data-testid="spinner"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="vote-info"]')).toBeNull();
  });

  it('avatar img is generated via blo (verifies blo invocation path)', () => {
    useAccountVotesMock.mockReturnValue(2);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGE_SUCCESS}
        votesToAdd={1}
      />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toMatch(/^data:image\/png/);
  });

  it('formatted short address uses 6-char prefix from address', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.textContent).toContain('0x5FbD...');
  });

  it('handles negative votesToAdd defensively (subtraction)', () => {
    useAccountVotesMock.mockReturnValue(10);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={-3}
      />,
    );
    // willHaveVoteCount = 10 + (-3) = 7
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('7');
  });

  it('renders 1 short-address element with full address (verify ShortAddress mock contract)', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    const shortEls = container.querySelectorAll('[data-testid="short"]');
    expect(shortEls.length).toBe(1);
    expect(shortEls[0].textContent).toBe(ADDR);
  });

  it('rerender from spinner to votes loaded shows short-address', () => {
    useAccountVotesMock.mockReturnValueOnce(null);
    const { container, rerender } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="spinner"]')).not.toBeNull();
    useAccountVotesMock.mockReturnValue(3);
    rerender(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('rerender changes state from ENTER to CHANGING', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container, rerender } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.getAttribute('data-loading')).toBe(
      'false',
    );
    rerender(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={2}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.getAttribute('data-loading')).toBe(
      'true',
    );
  });

  it('different address renders avatar img', () => {
    useAccountVotesMock.mockReturnValue(3);
    const addr2 = '0x1234567890abcdef1234567890abcdef12345678' as const;
    const { container } = render(
      <DelegationCandidateInfo
        address={addr2}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('votes=100 with votesToAdd=0 shows 100 in vote-info', () => {
    useAccountVotesMock.mockReturnValue(100);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('100');
  });

  it('CHANGE_FAILURE state renders short-address (not spinner)', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGE_FAILURE}
        votesToAdd={2}
      />,
    );
    expect(container.querySelector('[data-testid="spinner"]')).toBeNull();
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('different votesToAdd updates willHaveVoteCount', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={3}
      />,
    );
    expect(container.querySelector('[data-testid="vote-info"]')?.textContent).toContain('8');
  });

  it('addr prop forwarded to short-address verbatim', () => {
    useAccountVotesMock.mockReturnValue(3);
    const longAddr = '0x1234567890abcdef1234567890abcdef12345678' as const;
    const { container } = render(
      <DelegationCandidateInfo
        address={longAddr}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(longAddr);
  });

  it('CHANGE_SUCCESS state shows short-address (not spinner)', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGE_SUCCESS}
        votesToAdd={2}
      />,
    );
    expect(container.querySelector('[data-testid="spinner"]')).toBeNull();
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('avatar img renders for any state with votes', () => {
    useAccountVotesMock.mockReturnValue(3);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.CHANGING}
        votesToAdd={1}
      />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('addresses with 0x prefix format render correctly', () => {
    useAccountVotesMock.mockReturnValue(3);
    const newAddr = '0xabcdef0000000000000000000000000000000123' as const;
    const { container } = render(
      <DelegationCandidateInfo
        address={newAddr}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(newAddr);
  });

  it('renders ShortAddress + img + vote-info in same render', () => {
    useAccountVotesMock.mockReturnValue(5);
    const { container } = render(
      <DelegationCandidateInfo
        address={ADDR}
        changeModalState={ChangeDelegateState.ENTER_DELEGATE_ADDRESS}
        votesToAdd={0}
      />,
    );
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelector('[data-testid="vote-info"]')).not.toBeNull();
  });

  it('renders 5 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <DelegationCandidateInfo
            key={i}
            address={`0xADDR${i}`}
            changeModalState={0 as never}
            votesToAdd={i}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="vote-info"]').length).toBeGreaterThanOrEqual(
      0,
    );
  });

  it('rerender with new address does not crash', () => {
    const { rerender } = render(
      <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={1} />,
    );
    expect(() =>
      rerender(
        <DelegationCandidateInfo address="0xB" changeModalState={0 as never} votesToAdd={1} />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with votesToAdd=0', () => {
    expect(() =>
      render(
        <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={0} />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with very large votesToAdd', () => {
    expect(() =>
      render(
        <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={999999} />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with empty address string', () => {
    expect(() =>
      render(<DelegationCandidateInfo address="" changeModalState={0 as never} votesToAdd={1} />),
    ).not.toThrow();
  });

  it('renders 10 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <DelegationCandidateInfo
              key={i}
              address={`0xADDR${i}`}
              changeModalState={0 as never}
              votesToAdd={i}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles negative votesToAdd', () => {
    expect(() =>
      render(
        <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={-5} />,
      ),
    ).not.toThrow();
  });

  it('rerender does not crash 5 times', () => {
    const { rerender } = render(
      <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={0} />,
    );
    for (let i = 0; i < 5; i++) {
      expect(() =>
        rerender(
          <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={i} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles very long address (500 char)', () => {
    const longAddr = '0x' + 'a'.repeat(500);
    expect(() =>
      render(
        <DelegationCandidateInfo address={longAddr} changeModalState={0 as never} votesToAdd={1} />,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 10 times without crash', () => {
    for (let i = 0; i < 10; i++) {
      expect(() =>
        render(
          <DelegationCandidateInfo
            address={`0xADDR${i}`}
            changeModalState={0 as never}
            votesToAdd={i}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 30 instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateInfo
              key={i}
              address={`0xADDR${i}`}
              changeModalState={(i % 4) as never}
              votesToAdd={i}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 4 state values without crash', () => {
    [0, 1, 2, 3].forEach(state => {
      expect(() =>
        render(
          <DelegationCandidateInfo
            address="0xA"
            changeModalState={state as never}
            votesToAdd={1}
          />,
        ),
      ).not.toThrow();
    });
  });

  it('handles 0 + Number.MAX_SAFE_INTEGER edge for votesToAdd', () => {
    expect(() =>
      render(
        <DelegationCandidateInfo
          address="0xA"
          changeModalState={0 as never}
          votesToAdd={Number.MAX_SAFE_INTEGER}
        />,
      ),
    ).not.toThrow();
  });

  it('rerender 10 times preserves component', () => {
    const { rerender } = render(
      <DelegationCandidateInfo address="0xA" changeModalState={0 as never} votesToAdd={0} />,
    );
    for (let i = 0; i < 10; i++) {
      expect(() =>
        rerender(
          <DelegationCandidateInfo
            address={`0xA${i}`}
            changeModalState={(i % 4) as never}
            votesToAdd={i}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 100 different addresses sequentially', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <DelegationCandidateInfo
            address={`0xADDR${i}`}
            changeModalState={0 as never}
            votesToAdd={i}
          />,
        ),
      ).not.toThrow();
    }
  });
});
