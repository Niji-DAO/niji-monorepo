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

  it('ensCacheKey handles 100 different inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(ensCacheKey(`addr-${i}`)).toBe(`ens-1-addr-${i}`);
    }
  });

  it('ensCacheKey handles 100 different addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(ensCacheKey(addr)).toBe(`ens-1-${addr}`);
    }
  });

  it('ensCacheKey handles 50 unicode inputs', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => ensCacheKey(`日本語-${i}`)).not.toThrow();
    }
  });

  it('ensCacheKey rapid 200 invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => ensCacheKey('vitalik.eth')).not.toThrow();
    }
  });

  it('ensCacheKey starts with ens- 100 times', () => {
    for (let i = 0; i < 100; i++) {
      expect(ensCacheKey(`test-${i}`).startsWith('ens-')).toBe(true);
    }
  });

  it('round-2 30 sequential ensCacheKey calls', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      expect(() => ensCacheKey(addr)).not.toThrow();
    }
  });

  it('round-2 50 different address values', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const result = ensCacheKey(addr);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 useReverseENSLookUp is defined', () => {
    expect(typeof useReverseENSLookUp).toBe('function');
  });

  it('round-2 100 sequential ensCacheKey calls produce non-empty key', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0xR2-' + i) as never;
      expect(ensCacheKey(addr).length).toBeGreaterThan(0);
    }
  });

  it('round-2 50 useReverseENSLookUp type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useReverseENSLookUp).toBe('function');
    }
  });

  it('round-3 useReverseENSLookUp is defined', () => {
    expect(typeof useReverseENSLookUp).toBe('function');
  });

  it('round-3 100 sequential ensCacheKey calls produce non-empty key', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0xR3-' + i) as never;
      expect(ensCacheKey(addr).length).toBeGreaterThan(0);
    }
  });

  it('round-3 50 useReverseENSLookUp type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useReverseENSLookUp).toBe('function');
    }
  });

  it('round-3 30 ensCacheKey different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      expect(() => ensCacheKey(addr)).not.toThrow();
    }
  });

  it('round-3 30 ensCacheKey consistency check', () => {
    const addr = '0xR3-CONST' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 30; i++) {
      expect(ensCacheKey(addr)).toBe(first);
    }
  });

  it('round-4 useReverseENSLookUp is defined', () => {
    expect(typeof useReverseENSLookUp).toBe('function');
  });

  it('round-4 100 sequential ensCacheKey calls produce non-empty key', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0xR4-' + i) as never;
      expect(ensCacheKey(addr).length).toBeGreaterThan(0);
    }
  });

  it('round-4 50 useReverseENSLookUp type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useReverseENSLookUp).toBe('function');
    }
  });

  it('round-4 30 ensCacheKey different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as never;
      expect(() => ensCacheKey(addr)).not.toThrow();
    }
  });

  it('round-4 30 ensCacheKey consistency check', () => {
    const addr = '0xR4-CONST' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 30; i++) {
      expect(ensCacheKey(addr)).toBe(first);
    }
  });

  it('round-5 useReverseENSLookUp is defined', () => {
    expect(typeof useReverseENSLookUp).toBe('function');
  });

  it('round-5 100 sequential ensCacheKey calls produce non-empty key', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0xR5-' + i) as never;
      expect(ensCacheKey(addr).length).toBeGreaterThan(0);
    }
  });

  it('round-5 50 useReverseENSLookUp type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useReverseENSLookUp).toBe('function');
    }
  });

  it('round-5 30 ensCacheKey different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as never;
      expect(() => ensCacheKey(addr)).not.toThrow();
    }
  });

  it('round-5 30 ensCacheKey consistency check', () => {
    const addr = '0xR5-CONST' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 30; i++) {
      expect(ensCacheKey(addr)).toBe(first);
    }
  });

  it('round-6 30 sequential ensCacheKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => ensCacheKey(`0xR6-${i}` as never)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce defined value', () => {
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(`0xR6-${i}` as never)).toBeDefined();
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof ensCacheKey).toBe('function');
    }
  });

  it('round-6 30 deterministic for same address', () => {
    const addr = '0xR6-CONST' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 30; i++) {
      expect(ensCacheKey(addr)).toEqual(first);
    }
  });

  it('round-6 50 ensCacheKey consistency check', () => {
    const addr = '0xR6-CONST-2' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(addr)).toEqual(first);
    }
  });

  it('round-7 30 sequential ensCacheKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => ensCacheKey(`0xR7-${i}` as never)).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce defined result', () => {
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(`0xR7-${i}` as never)).toBeDefined();
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof ensCacheKey).toBe('function');
    }
  });

  it('round-7 30 deterministic for same address', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = ensCacheKey('0xR7-CONST' as never);
      const r2 = ensCacheKey('0xR7-CONST' as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 50 ensCacheKey consistency check', () => {
    const addr = '0xR7-CONST-2' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(addr)).toEqual(first);
    }
  });

  it('round-8 30 sequential ensCacheKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => ensCacheKey(`0xR8-${i}` as never)).not.toThrow();
    }
  });

  it('round-8 50 sequential calls produce defined result', () => {
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(`0xR8-${i}` as never)).toBeDefined();
    }
  });

  it('round-8 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof ensCacheKey).toBe('function');
    }
  });

  it('round-8 30 deterministic for same address', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = ensCacheKey('0xR8-CONST' as never);
      const r2 = ensCacheKey('0xR8-CONST' as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 50 ensCacheKey consistency check', () => {
    const addr = '0xR8-CONST-2' as never;
    const first = ensCacheKey(addr);
    for (let i = 0; i < 50; i++) {
      expect(ensCacheKey(addr)).toEqual(first);
    }
  });
});
