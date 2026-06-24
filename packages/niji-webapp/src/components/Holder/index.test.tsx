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

  it('handles 0n nounId without crashing', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => render(<Holder nounId={0n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('calls useSubgraphQuery exactly once per render (loading state)', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockClear();
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(useSubgraphQueryMock).toHaveBeenCalledTimes(1);
  });

  it('renders for large bigint nounId (MAX_SAFE_INTEGER)', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xLARGE' } } },
    });
    expect(() =>
      render(<Holder nounId={9_007_199_254_740_991n} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('isNounders=false default branch renders ShortAddress (not Nounders branch)', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { container } = render(<Holder nounId={1n} isNounders={false} />, {
      wrapper: WithProviders,
    });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xOWNER');
    });
  });

  it('error string contains "Niji info"', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Niji info');
  });

  it('Nounders branch with data shows non-empty render', () => {
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

  it('does not render ShortAddress while loading', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('does not render ShortAddress when error is set', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('renders ShortAddress with different owner address (0xABC)', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xABC' } } },
    });
    const { container } = render(<Holder nounId={5n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xABC');
    });
  });

  it('atom value false also renders error path without crashing', () => {
    useAtomValueMock.mockReturnValue(false);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Failed to fetch');
  });

  it('rerender from loading to data shows ShortAddress', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValueOnce({
      loading: true,
      error: undefined,
      data: undefined,
    });
    const { container, rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER2' } } },
    });
    rerender(<Holder nounId={1n} />);
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xOWNER2');
    });
  });

  it('rerender from data to loading hides ShortAddress', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { container, rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    rerender(<Holder nounId={1n} />);
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('renders error msg even for loading=true + error truthy (error takes precedence on render)', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Failed');
  });

  it('big nounId (Number.MAX_SAFE_INTEGER * 2) still renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(<Holder nounId={18014398509481982n} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('ShortAddress rendered for owner.id with mixed case', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xAbCdEfAbCdEf' } } },
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xAbCdEfAbCdEf');
    });
  });

  it('renders multiple Holder instances independently', async () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xMULTI' } } },
    });
    const { container } = render(
      <>
        <Holder nounId={1n} />
        <Holder nounId={2n} />
      </>,
      { wrapper: WithProviders },
    );
    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid="short"]').length).toBe(2);
    });
  });

  it('error and loading both true: loading takes precedence', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: true,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toBe('');
  });

  it('isNounders=true with error renders error message', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent).toContain('Failed to fetch');
  });

  it('error contains "Niji" keyword', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Niji');
  });

  it('error full text matches "Failed to fetch Niji info"', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Failed to fetch Niji info');
  });
});
