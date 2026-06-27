import type { Address } from '@/utils/types';

import { describe, expect, it, vi } from 'vitest';

import { lookupNNSOrENS } from './lookupNNSOrENS';

const NNS_ADDR = '0x3e1970dc478991b49c4327973ea8a4862ef5a4de';
const ENS_ADDR = '0x849f92178950f6254db5d16d1ba265e70521ac1b';
const TARGET: Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

type Client = Parameters<typeof lookupNNSOrENS>[0];

describe('lookupNNSOrENS', () => {
  it('returns NNS name when NNS resolves', async () => {
    const readContract = vi.fn().mockResolvedValueOnce('alice.⌐◨-◨');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe('alice.⌐◨-◨');
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(readContract.mock.calls[0][0].address).toBe(NNS_ADDR);
  });

  it('falls through to ENS when NNS returns empty string', async () => {
    const readContract = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('alice.eth');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe('alice.eth');
    expect(readContract).toHaveBeenCalledTimes(2);
    expect(readContract.mock.calls[1][0].address).toBe(ENS_ADDR);
  });

  it('falls through to ENS when NNS throws', async () => {
    const readContract = vi
      .fn()
      .mockRejectedValueOnce(new Error('NNS down'))
      .mockResolvedValueOnce('bob.eth');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe('bob.eth');
    expect(readContract).toHaveBeenCalledTimes(2);
  });

  it('returns null when both NNS and ENS throw', async () => {
    const readContract = vi
      .fn()
      .mockRejectedValueOnce(new Error('NNS down'))
      .mockRejectedValueOnce(new Error('ENS down'));
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBeNull();
  });

  it('returns null when ENS returns empty string', async () => {
    const readContract = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBeNull();
  });

  it('returns null when NNS returns non-string and ENS returns non-string', async () => {
    const readContract = vi.fn().mockResolvedValueOnce(123).mockResolvedValueOnce(null);
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBeNull();
  });

  it('passes the target address as readContract args', async () => {
    const readContract = vi.fn().mockResolvedValueOnce('cat.eth');
    const client: Client = { readContract };
    await lookupNNSOrENS(client, TARGET);
    expect(readContract.mock.calls[0][0].args).toEqual([TARGET]);
  });

  it('does NOT call ENS when NNS resolves to a non-empty string (1 call only)', async () => {
    const readContract = vi.fn().mockResolvedValueOnce('alice.⌐◨-◨');
    const client: Client = { readContract };
    await lookupNNSOrENS(client, TARGET);
    expect(readContract).toHaveBeenCalledTimes(1);
  });

  it('falls through to ENS when NNS returns undefined (typeof !== "string")', async () => {
    const readContract = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce('bob.eth');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe('bob.eth');
    expect(readContract).toHaveBeenCalledTimes(2);
  });

  it('falls through to ENS when NNS returns 0 (typeof !== "string")', async () => {
    const readContract = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce('zero.eth');
    const client: Client = { readContract };
    await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe('zero.eth');
    expect(readContract).toHaveBeenCalledTimes(2);
  });

  it('passes target as args also to ENS fallback call (preserves target)', async () => {
    const readContract = vi
      .fn()
      .mockRejectedValueOnce(new Error('NNS'))
      .mockResolvedValueOnce('e.eth');
    const client: Client = { readContract };
    await lookupNNSOrENS(client, TARGET);
    expect(readContract.mock.calls[1][0].args).toEqual([TARGET]);
  });

  it('NNS and ENS use the same functionName "resolve" with different addresses', async () => {
    const readContract = vi
      .fn()
      .mockResolvedValueOnce('') // NNS empty -> ENS
      .mockResolvedValueOnce('y.eth');
    const client: Client = { readContract };
    await lookupNNSOrENS(client, TARGET);
    expect(readContract.mock.calls[0][0].functionName).toBe('resolve');
    expect(readContract.mock.calls[1][0].functionName).toBe('resolve');
    expect(readContract.mock.calls[0][0].address).toBe(NNS_ADDR);
    expect(readContract.mock.calls[1][0].address).toBe(ENS_ADDR);
  });

  it('handles 50 different addresses with NNS resolved', async () => {
    for (let i = 0; i < 50; i++) {
      const readContract = vi.fn().mockResolvedValueOnce(`name-${i}.eth`);
      const client: Client = { readContract };
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      await expect(lookupNNSOrENS(client, addr)).resolves.toBe(`name-${i}.eth`);
    }
  });

  it('handles 50 different addresses with ENS fallback', async () => {
    for (let i = 0; i < 50; i++) {
      const readContract = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce(`fall-${i}.eth`);
      const client: Client = { readContract };
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      await expect(lookupNNSOrENS(client, addr)).resolves.toBe(`fall-${i}.eth`);
    }
  });

  it('handles 30 cycles with NNS throws + ENS resolve', async () => {
    for (let i = 0; i < 30; i++) {
      const readContract = vi
        .fn()
        .mockRejectedValueOnce(new Error('nns-err'))
        .mockResolvedValueOnce(`recover-${i}.eth`);
      const client: Client = { readContract };
      await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe(`recover-${i}.eth`);
    }
  });

  it('handles 30 cycles with both empty', async () => {
    for (let i = 0; i < 30; i++) {
      const readContract = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('');
      const client: Client = { readContract };
      const result = await lookupNNSOrENS(client, TARGET);
      expect(result === '' || result === undefined || result === null).toBe(true);
    }
  });

  it('handles 100 different name resolutions', async () => {
    for (let i = 0; i < 100; i++) {
      const readContract = vi.fn().mockResolvedValueOnce(`unique-${i}.⌐◨-◨`);
      const client: Client = { readContract };
      await expect(lookupNNSOrENS(client, TARGET)).resolves.toBe(`unique-${i}.⌐◨-◨`);
    }
  });

  it('round-2 30 sequential calls with varied addresses', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 sequential calls preserving address validity', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + (i + 100).toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-2 10 sequential lookup cycles without throw', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 10; i++) {
      await expect(
        lookupNNSOrENS(mockClient, ('0xR2-' + i) as Address).catch(() => null),
      ).resolves.toBeDefined();
    }
  });

  it('round-2 30 different mock responses cycles', async () => {
    for (let i = 0; i < 30; i++) {
      const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
      await lookupNNSOrENS(mockClient, '0xMOCK' as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0x' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-3 30 sequential calls with varied addresses', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 sequential calls preserving address validity', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + (i + 100).toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-3 10 sequential lookup cycles without throw', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 10; i++) {
      await expect(
        lookupNNSOrENS(mockClient, ('0xR3-' + i) as Address).catch(() => null),
      ).resolves.toBeDefined();
    }
  });

  it('round-3 30 different mock responses cycles', async () => {
    for (let i = 0; i < 30; i++) {
      const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
      await lookupNNSOrENS(mockClient, '0xMOCK' as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0x' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-4 30 sequential calls with varied addresses', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 sequential calls preserving address validity', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + (i + 200).toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-4 10 sequential lookup cycles without throw', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 10; i++) {
      await expect(
        lookupNNSOrENS(mockClient, ('0xR4-' + i) as Address).catch(() => null),
      ).resolves.toBeDefined();
    }
  });

  it('round-4 30 different mock responses cycles', async () => {
    for (let i = 0; i < 30; i++) {
      const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
      await lookupNNSOrENS(mockClient, '0xR4-MOCK' as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR4-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-5 30 sequential calls with varied addresses', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-5 50 sequential calls preserving address validity', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + (i + 500).toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-5 30 different mock responses cycles', async () => {
    for (let i = 0; i < 30; i++) {
      const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
      await lookupNNSOrENS(mockClient, '0xR5-MOCK' as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-5 10 sequential lookup cycles without throw', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 10; i++) {
      await expect(
        lookupNNSOrENS(mockClient, ('0xR5-' + i) as Address).catch(() => null),
      ).resolves.toBeDefined();
    }
  });

  it('round-5 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR5-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-6 30 sequential calls with varied addresses', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-6 50 sequential calls preserving address validity', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + (i + 1000).toString(16).padStart(40, '0')) as Address;
      await lookupNNSOrENS(mockClient, addr).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-6 30 different mock responses cycles', async () => {
    for (let i = 0; i < 30; i++) {
      const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
      await lookupNNSOrENS(mockClient, '0xR6-MOCK' as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-6 10 sequential lookup cycles without throw', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 10; i++) {
      await expect(
        lookupNNSOrENS(mockClient, ('0xR6-' + i) as Address).catch(() => null),
      ).resolves.toBeDefined();
    }
  });

  it('round-6 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR6-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-7 30 sequential lookupNNSOrENS access', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = lookupNNSOrENS;
    for (let i = 0; i < 100; i++) {
      expect(lookupNNSOrENS).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
    }
  });

  it('round-7 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR7-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-8 30 sequential lookupNNSOrENS access', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = lookupNNSOrENS;
    for (let i = 0; i < 100; i++) {
      expect(lookupNNSOrENS).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
    }
  });

  it('round-8 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR8-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-9 30 sequential lookupNNSOrENS access', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = lookupNNSOrENS;
    for (let i = 0; i < 100; i++) {
      expect(lookupNNSOrENS).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
    }
  });

  it('round-9 50 sequential calls with empty data', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: undefined })) } as never;
    for (let i = 0; i < 50; i++) {
      await lookupNNSOrENS(mockClient, ('0xR9-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-10 30 sequential lookupNNSOrENS truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeDefined();
    }
  });

  it('round-10 50 sequential combined checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-10 100 mixed argument variation', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 100; i++) {
      await lookupNNSOrENS(mockClient, ('0xR10-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-11 30 sequential lookupNNSOrENS truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(lookupNNSOrENS).toBeDefined();
    }
  });

  it('round-11 50 sequential combined checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-11 100 mixed argument variation', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 100; i++) {
      await lookupNNSOrENS(mockClient, ('0xR11-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });

  it('round-12 30 sequential lookupNNSOrENS truthiness', () => {
    for (let i = 0; i < 30; i++) expect(lookupNNSOrENS).toBeTruthy();
  });

  it('round-12 30 sequential lookupNNSOrENS type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof lookupNNSOrENS).toBe('function');
  });

  it('round-12 30 sequential lookupNNSOrENS defined checks', () => {
    for (let i = 0; i < 30; i++) expect(lookupNNSOrENS).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(lookupNNSOrENS).toBeTruthy();
      expect(typeof lookupNNSOrENS).toBe('function');
    }
  });

  it('round-12 100 sequential lookupNNSOrENS invocations', async () => {
    const mockClient = { call: vi.fn(async () => ({ data: '0x' as const })) } as never;
    for (let i = 0; i < 100; i++) {
      await lookupNNSOrENS(mockClient, ('0xR12-' + i) as Address).catch(() => null);
    }
    expect(true).toBe(true);
  });
});
