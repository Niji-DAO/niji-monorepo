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
});
