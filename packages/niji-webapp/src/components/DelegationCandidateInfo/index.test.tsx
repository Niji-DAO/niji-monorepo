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
});
