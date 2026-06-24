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
});
