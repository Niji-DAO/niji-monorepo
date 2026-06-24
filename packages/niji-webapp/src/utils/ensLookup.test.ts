import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const lookupNNSOrENSMock = vi.fn();
vi.mock('./lookupNNSOrENS', () => ({
  lookupNNSOrENS: (...args: unknown[]) => lookupNNSOrENSMock(...args),
}));

const usePublicClientMock = vi.fn();
vi.mock('wagmi', () => ({
  usePublicClient: () => usePublicClientMock(),
}));

vi.mock('@/config', () => ({
  cache: { ens: 'ens' },
  cacheKey: (bucket: string, chainId: number, address: string) => `${bucket}-${chainId}-${address}`,
  CHAIN_ID: 1,
}));

import { ensCacheKey, useReverseENSLookUp } from './ensLookup';

beforeEach(() => {
  lookupNNSOrENSMock.mockReset();
  usePublicClientMock.mockReset();
  usePublicClientMock.mockReturnValue({ chain: { id: 1 } });
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('ensCacheKey', () => {
  it('builds key with bucket "ens" + chainId + address', () => {
    expect(ensCacheKey('0xABC')).toBe('ens-1-0xABC');
  });

  it('different addresses produce different keys', () => {
    expect(ensCacheKey('0xABC')).not.toBe(ensCacheKey('0xDEF'));
  });
});

describe('useReverseENSLookUp', () => {
  const validAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;

  it('returns cached ens name when localStorage has unexpired entry', () => {
    const futureExpires = Date.now() / 1000 + 1000;
    localStorage.setItem(
      ensCacheKey(validAddress),
      JSON.stringify({ name: 'cached.eth', expires: futureExpires }),
    );
    const { result } = renderHook(() => useReverseENSLookUp(validAddress));
    expect(result.current).toBe('cached.eth');
    expect(lookupNNSOrENSMock).not.toHaveBeenCalled();
  });

  it('removes expired cache entry and calls lookupNNSOrENS', async () => {
    const pastExpires = Date.now() / 1000 - 1000;
    localStorage.setItem(
      ensCacheKey(validAddress),
      JSON.stringify({ name: 'old.eth', expires: pastExpires }),
    );
    lookupNNSOrENSMock.mockResolvedValue('fresh.eth');
    const { result } = renderHook(() => useReverseENSLookUp(validAddress));
    await waitFor(() => expect(lookupNNSOrENSMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current).toBe('fresh.eth'));
  });

  it('skips when address is empty', () => {
    renderHook(() => useReverseENSLookUp('' as `0x${string}`));
    expect(lookupNNSOrENSMock).not.toHaveBeenCalled();
  });

  it('skips when publicClient is undefined', () => {
    usePublicClientMock.mockReturnValue(undefined);
    renderHook(() => useReverseENSLookUp(validAddress));
    expect(lookupNNSOrENSMock).not.toHaveBeenCalled();
  });

  it('stores resolved ens name in localStorage with 30 min ttl', async () => {
    lookupNNSOrENSMock.mockResolvedValue('user.eth');
    const { result } = renderHook(() => useReverseENSLookUp(validAddress));
    await waitFor(() => expect(result.current).toBe('user.eth'));
    const stored = localStorage.getItem(ensCacheKey(validAddress));
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored ?? '{}');
    expect(parsed.name).toBe('user.eth');
    expect(parsed.expires).toBeGreaterThan(Date.now() / 1000);
  });

  it('does nothing when lookupNNSOrENS returns falsy (no cache write)', async () => {
    lookupNNSOrENSMock.mockResolvedValue(null);
    renderHook(() => useReverseENSLookUp(validAddress));
    await waitFor(() => expect(lookupNNSOrENSMock).toHaveBeenCalled());
    expect(localStorage.getItem(ensCacheKey(validAddress))).toBeNull();
  });

  it('catches lookupNNSOrENS rejection via console.warn (no crash)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    lookupNNSOrENSMock.mockRejectedValue(new Error('rpc fail'));
    renderHook(() => useReverseENSLookUp(validAddress));
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    warnSpy.mockRestore();
  });

  it('returns undefined initially when no cache and lookup is pending', () => {
    lookupNNSOrENSMock.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useReverseENSLookUp(validAddress));
    expect(result.current).toBeUndefined();
  });

  it('removes expired cache entry from localStorage immediately', async () => {
    const pastExpires = Date.now() / 1000 - 1000;
    localStorage.setItem(
      ensCacheKey(validAddress),
      JSON.stringify({ name: 'old.eth', expires: pastExpires }),
    );
    lookupNNSOrENSMock.mockResolvedValue('fresh.eth');
    renderHook(() => useReverseENSLookUp(validAddress));
    // 期限切れ後 cache 削除 → 新 lookup → 新 cache が書かれる、 結果 fresh.eth で上書き
    await waitFor(() => {
      const stored = localStorage.getItem(ensCacheKey(validAddress));
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed.name).toBe('fresh.eth');
    });
  });

  it('does not invoke lookup when cache has unexpired entry (no double fetch)', () => {
    const futureExpires = Date.now() / 1000 + 1000;
    localStorage.setItem(
      ensCacheKey(validAddress),
      JSON.stringify({ name: 'cached.eth', expires: futureExpires }),
    );
    renderHook(() => useReverseENSLookUp(validAddress));
    expect(lookupNNSOrENSMock).toHaveBeenCalledTimes(0);
  });

  it('writes ttl ~30 min (1800 sec) in the future', async () => {
    lookupNNSOrENSMock.mockResolvedValue('ttl.eth');
    renderHook(() => useReverseENSLookUp(validAddress));
    await waitFor(() => expect(lookupNNSOrENSMock).toHaveBeenCalled());
    await waitFor(() => {
      const stored = localStorage.getItem(ensCacheKey(validAddress));
      const parsed = JSON.parse(stored ?? '{}');
      const ttlSec = Number(parsed.expires) - Date.now() / 1000;
      // 30 min = 1800 sec、 多少の test 実行時間遅延を許容
      expect(ttlSec).toBeGreaterThan(1700);
      expect(ttlSec).toBeLessThanOrEqual(1801);
    });
  });

  it('different addresses produce different cache slots (no collision)', async () => {
    const addrA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
    const addrB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as `0x${string}`;
    lookupNNSOrENSMock.mockResolvedValue('shared.eth');
    renderHook(() => useReverseENSLookUp(addrA));
    renderHook(() => useReverseENSLookUp(addrB));
    await waitFor(() => expect(lookupNNSOrENSMock).toHaveBeenCalledTimes(2));
    expect(ensCacheKey(addrA)).not.toBe(ensCacheKey(addrB));
  });

  it('ensCacheKey 3-arg format (bucket-chainId-address)', () => {
    // mock cacheKey は `${bucket}-${chainId}-${address}` 固定
    expect(ensCacheKey('0xABC')).toBe('ens-1-0xABC');
    expect(ensCacheKey('vitalik.eth')).toBe('ens-1-vitalik.eth');
  });
});
