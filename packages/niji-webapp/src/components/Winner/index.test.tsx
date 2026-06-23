import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAccountMock = vi.fn();
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import { WithProviders } from '@/test-utils/providers';

import Winner from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('Winner', () => {
  it('renders ShortAddress when winner is not connected user', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
  });

  it('renders "you" branch when winner === connected user', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('renders Nounders branch when isNounders=true', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('handles ja-JP locale layout column variant', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.toLowerCase()).toContain('you');
  });
});
