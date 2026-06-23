import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

const useSubgraphQueryMock = vi.fn();
vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: () => useSubgraphQueryMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

vi.mock('@/wrappers/subgraph', () => ({
  nounDocument: 'NOUN_DOCUMENT',
}));

import { WithProviders } from '@/test-utils/providers';

import Holder from './index';

describe('Holder', () => {
  it('renders nothing while loading', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toBe('');
  });

  it('renders error message when query fails', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc down'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Failed to fetch Niji info');
  });

  it('renders ShortAddress when data has owner', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xOWNER');
    });
  });

  it('renders Nounders branch when isNounders=true', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { container } = render(<Holder nounId={1n} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
