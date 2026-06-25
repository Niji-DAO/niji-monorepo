import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useAccountMock = vi.fn();
const switchChainMock = vi.fn();
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
  useSwitchChain: () => ({ switchChain: switchChainMock }),
}));

vi.mock('@/config', () => ({
  CHAIN_ID: 1,
}));

vi.mock('@/wagmi', () => ({
  config: { chains: [{ id: 1 }, { id: 11155111 }] },
}));

import NetworkAlert from './index';

describe('NetworkAlert', () => {
  beforeEach(() => {
    switchChainMock.mockReset();
  });

  it('renders nothing (null)', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    const { container } = render(<NetworkAlert />);
    expect(container.firstChild).toBeNull();
  });

  it('does not call switchChain when not connected', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('does not call switchChain when chainId is null', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: null });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('does not call switchChain when already on target chain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('calls switchChain when on wrong chain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('calls switchChain when chainId is 0 (truthy isConnected, chainId !== target)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 0 });
    render(<NetworkAlert />);
    // chainId 0 !== CHAIN_ID 1 で switchChain 呼出 (実装は != null check のみ)
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('does not call switchChain when chainId is undefined', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: undefined });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('renders null DOM (firstChild is null) when connected on wrong chain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    const { container } = render(<NetworkAlert />);
    // switchChain は呼ばれるが DOM 自体は null (UI なし)
    expect(container.firstChild).toBeNull();
  });

  it('calls switchChain with target chainId from config (CHAIN_ID=1)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 137 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('does not re-call switchChain when correct chain after wrong (idempotent)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('does not call switchChain when isConnected=false even with chainId=1', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: 1 });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('calls switchChain when on layer-2 wrong chain (Polygon=137)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 137 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledTimes(1);
  });

  it('renders null when disconnected (no error display)', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: 11155111 });
    const { container } = render(<NetworkAlert />);
    expect(container.firstChild).toBeNull();
  });

  it('switch invoked with correct config chainId (1)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 31337 });
    render(<NetworkAlert />);
    expect(switchChainMock.mock.calls[0][0].chainId).toBe(1);
  });

  it('renders no DOM elements (always returns null UI)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    const { container } = render(<NetworkAlert />);
    expect(container.children.length).toBe(0);
  });

  it('switchChain called exactly once per render when on wrong chain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledTimes(1);
  });

  it('multiple wrong-chain renders trigger multiple switchChain calls', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledTimes(3);
  });

  it('chainId 56 (BSC) triggers switchChain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 56 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('switchChain not called when isConnected=undefined (treat as false)', () => {
    useAccountMock.mockReturnValue({ isConnected: undefined, chainId: 11155111 });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('renders null with no children regardless of wrong chain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 99 });
    const { container } = render(<NetworkAlert />);
    expect(container.children.length).toBe(0);
  });

  it('chain 31337 (Hardhat) triggers switchChain to mainnet', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 31337 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('chainId 137 (Polygon) triggers switchChain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 137 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('rerender from disconnected to connected with wrong chain triggers switchChain', () => {
    useAccountMock.mockReturnValueOnce({ isConnected: false, chainId: undefined });
    const { rerender } = render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 11155111 });
    rerender(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalled();
  });

  it('multiple renders with correct chain do not call switchChain', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('chainId=10 (Optimism) wrong chain triggers switch', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 10 });
    render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('rerender from wrong chain to correct stops further switchChain calls', () => {
    useAccountMock.mockReturnValueOnce({ isConnected: true, chainId: 11155111 });
    const { rerender } = render(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledTimes(1);
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    rerender(<NetworkAlert />);
    expect(switchChainMock).toHaveBeenCalledTimes(1);
  });

  it('renders null when chainId matches CHAIN_ID', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    const { container } = render(<NetworkAlert />);
    expect(container.firstChild).toBeNull();
  });

  it('does not call switchChain when chainId matches CHAIN_ID', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    render(<NetworkAlert />);
    expect(switchChainMock).not.toHaveBeenCalled();
  });

  it('multiple instances render null independently', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    const { container } = render(
      <>
        <NetworkAlert />
        <NetworkAlert />
        <NetworkAlert />
      </>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('rerender when connected state changes does not crash', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    const { rerender } = render(<NetworkAlert />);
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 1 });
    expect(() => rerender(<NetworkAlert />)).not.toThrow();
  });

  it('renders null for chainId=undefined', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    const { container } = render(<NetworkAlert />);
    expect(container.firstChild).toBeNull();
  });

  it('mount-unmount 500 cycles (disconnected)', () => {
    useAccountMock.mockReturnValue({ isConnected: false, chainId: undefined });
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NetworkAlert />);
      unmount();
    }
  });

  it('mount-unmount 500 cycles (wrong network)', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 999 });
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NetworkAlert />);
      unmount();
    }
  });

  it('handles 100 different wrong chainId values', () => {
    for (let i = 100; i < 200; i++) {
      useAccountMock.mockReturnValue({ isConnected: true, chainId: i });
      const { unmount } = render(<NetworkAlert />);
      unmount();
    }
  });

  it('renders 100 instances all wrong network', () => {
    useAccountMock.mockReturnValue({ isConnected: true, chainId: 999 });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NetworkAlert key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles isConnected toggle 100 times', () => {
    const { rerender } = render(<NetworkAlert />);
    for (let i = 0; i < 100; i++) {
      useAccountMock.mockReturnValue({
        isConnected: i % 2 === 0,
        chainId: i % 2 === 0 ? 999 : 1,
      });
      expect(() => rerender(<NetworkAlert />)).not.toThrow();
    }
  });
});
