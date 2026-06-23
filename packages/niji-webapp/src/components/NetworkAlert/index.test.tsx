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
});
