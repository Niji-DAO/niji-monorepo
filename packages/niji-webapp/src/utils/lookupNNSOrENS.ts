import { parseAbiItem } from 'viem';

import { Address } from '@/utils/types';

/**
 * Minimum surface we need from viem's PublicClient. Avoids `any` while staying compatible
 * with both wagmi v2 client types and stock viem clients (chain narrowing differences make
 * the full PublicClient generic awkward to import here).
 */
type ReadContractClient = {
  readContract: (args: {
    address: Address;
    abi: ReadonlyArray<ReturnType<typeof parseAbiItem>>;
    functionName: 'resolve';
    args: readonly [Address];
  }) => Promise<unknown>;
};

/**
 * look up NNS or ENS (NNS first, ENS fallback).
 * @param client viem PublicClient compatible client (must expose `readContract`)
 * @param target wallet address
 * @returns name or null
 */
export async function lookupNNSOrENS(
  client: ReadContractClient,
  target: Address,
): Promise<string | null> {
  // try NNS
  try {
    const name = await client.readContract({
      address: '0x3e1970dc478991b49c4327973ea8a4862ef5a4de',
      abi: [parseAbiItem('function resolve(address) view returns (string)')],
      functionName: 'resolve',
      args: [target],
    });
    if (typeof name === 'string' && name) return name;
  } catch {
    // no biggie, NNS miss
  }

  // fallback ENS
  try {
    const name = await client.readContract({
      address: '0x849f92178950f6254db5d16d1ba265e70521ac1b',
      abi: [parseAbiItem('function resolve(address) view returns (string)')],
      functionName: 'resolve',
      args: [target],
    });
    return typeof name === 'string' && name ? name : null;
  } catch {
    return null;
  }
}
