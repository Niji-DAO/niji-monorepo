import { parseAbiItem } from 'viem';

import { Address } from '@/utils/types';

/**
 * look up NNS or ENS (NNS first, ENS fallback).
 * viem の PublicClient 型は chains narrow で wagmi 戻り値型と衝突しがちなので
 * client は any 受けし readContract 経由で抽象化する。
 * @param client viem PublicClient (any 受け)
 * @param target wallet address
 * @returns name or null
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function lookupNNSOrENS(client: any, target: Address): Promise<string | null> {
  // try NNS
  try {
    const name = await client.readContract({
      address: '0x3e1970dc478991b49c4327973ea8a4862ef5a4de',
      abi: [parseAbiItem('function resolve(address) view returns (string)')],
      functionName: 'resolve',
      args: [target],
    });
    if (name) return name;
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
    return name || null;
  } catch {
    return null;
  }
}
