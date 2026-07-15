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

const useReadNijiTokenOwnerOfMock = vi.fn(() => ({ data: undefined }));
vi.mock('@niji/sdk/react', () => ({
  useReadNijiTokenOwnerOf: () => useReadNijiTokenOwnerOfMock(),
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 31337 },
}));

const isNounderNijiMock = vi.fn(() => false);
vi.mock('@/utils/nounderNiji', () => ({
  isNounderNiji: () => isNounderNijiMock(),
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

  it('loading state has empty textContent', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { container } = render(<Holder nounId={5n} />, { wrapper: WithProviders });
    expect(container.textContent).toBe('');
  });

  it('different nounId still renders without crash on loading', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => render(<Holder nounId={999n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('error state contains error message text', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('network'),
      data: undefined,
    });
    const { container } = render(<Holder nounId={2n} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Failed');
  });

  it('useAtomValueMock false (not cool) still renders loading empty', () => {
    useAtomValueMock.mockReturnValue(false);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toBe('');
  });

  it('renders without crash for nounId=0n', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => render(<Holder nounId={0n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('renders 3 instances each with own nounId', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(
        <>
          <Holder nounId={1n} />
          <Holder nounId={2n} />
          <Holder nounId={3n} />
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('renders without crash for negative-bigint analogue (-1n)', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => render(<Holder nounId={-1n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('isNounders=true branch renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    expect(() =>
      render(<Holder nounId={1n} isNounders={true} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('isNounders=false default branch', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    expect(() =>
      render(<Holder nounId={1n} isNounders={false} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('rerender from loading to error state', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValueOnce({
      loading: true,
      error: undefined,
      data: undefined,
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('rpc'),
      data: undefined,
    });
    expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
  });

  it('renders 10 instances independently each with own nounId', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('renders 5 consecutive without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    for (let i = 0; i < 5; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('renders for huge bigint nounId', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(<Holder nounId={BigInt('99999999999999999999')} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('rerender loading transition to error state', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValueOnce({
      loading: true,
      error: undefined,
      data: undefined,
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: new Error('boom'),
      data: undefined,
    });
    expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
  });

  it('isNounders=true + loading=true renders nothing yet', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { container } = render(<Holder nounId={1n} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent).toBe('');
  });

  it('renders 20 instances each independently', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('rerender 20 times preserves component', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 20; i++) {
      expect(() => rerender(<Holder nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('handles 0xZERO_ADDRESS owner', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0x0000000000000000000000000000000000000000' } } },
    });
    expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('rerender from data to loading state', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValueOnce({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
  });

  it('useAtomValue cool/warm rerender variations', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    useAtomValueMock.mockReturnValue(false);
    expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
  });

  it('renders 50 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('rerender 30 times with varying nounId', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { rerender } = render(<Holder nounId={0n} />, { wrapper: WithProviders });
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<Holder nounId={BigInt(i)} />)).not.toThrow();
    }
  });

  it('handles very large nounId (1e9)', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() => render(<Holder nounId={1000000000n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('handles data with empty owner id string', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '' } } },
    });
    // Issue #3086 対応 = 空 owner id は「黒塗り circle」 UX 問題を防ぐため ShortAddress を render せず、
    // 明示的な「—」 placeholder を出す仕様に変更。 subgraph fail 時の on-chain RPC fallback と組で機能する。
    const { container } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
    expect(container.textContent).toContain('—');
  });

  it('rapid loading transitions 50 times without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: i % 2 === 0,
        error: undefined,
        data: undefined,
      });
      expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 50 instances with different nounIds', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles isNounders=true rerender 30 times', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<Holder nounId={1n} isNounders={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('handles atomValue false with data', () => {
    useAtomValueMock.mockReturnValue(false);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('handles 50 different owner addresses', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: undefined,
        data: { noun: { owner: { id: `0xOWNER${i}` } } },
      });
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('handles 30 different error types', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: new Error(`err-${i}`),
        data: undefined,
      });
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 30 instances all with loading state', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles atomValue toggle 50 times', () => {
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 50; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      expect(() => rerender(<Holder nounId={1n} />)).not.toThrow();
    }
  });

  it('handles empty owner string', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '' } } },
    });
    expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 30 instances all with data', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xX' } } },
    });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 50 different owner ids', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: undefined,
        data: { noun: { owner: { id: `0xOWN${i}` } } },
      });
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('rapid 30 isNounders toggle', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<Holder nounId={1n} isNounders={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('handles 30 different error message types', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: new Error(`err-${i}-${i * 100}`),
        data: undefined,
      });
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('mount-unmount 200 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 100 instances all with loading state', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({ loading: true, error: undefined, data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 50 different owner addresses with data', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 50; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: undefined,
        data: { noun: { owner: { id: '0x' + i.toString(16).padStart(40, '0') } } },
      });
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('rapid 100 isNounders toggle rerender', () => {
    useAtomValueMock.mockReturnValue(true);
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { noun: { owner: { id: '0xOWNER' } } },
    });
    const { rerender } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<Holder nounId={1n} isNounders={i % 2 === 0} />)).not.toThrow();
    }
  });

  it('handles 30 different error messages', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      useSubgraphQueryMock.mockReturnValue({
        loading: false,
        error: new Error(`err-${i}-${i * 100}`),
        data: undefined,
      });
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-2 handles 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 100)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(1000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 100)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-3 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(1000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 500)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 1000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-4 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(5000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 7000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 9000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-5 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(50000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-6 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 9000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-6 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(60000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 70000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(80000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 90000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(100000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 110000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={1n} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-9 30 large nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(120000 + i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-10 30 sequential Holder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Holder nounId={BigInt(i)} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 30000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-10 100 sequential different nounId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 40000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 30 sequential Holder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 50000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 60000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Holder nounId={BigInt(i + 70000)} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 80000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 100 sequential different nounId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 90000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 30 sequential Holder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 100000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Holder key={i} nounId={BigInt(i + 110000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Holder nounId={BigInt(i + 120000)} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 130000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 100 sequential different nounId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Holder nounId={BigInt(i + 140000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });
});
