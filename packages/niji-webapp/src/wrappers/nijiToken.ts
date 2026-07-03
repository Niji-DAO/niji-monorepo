import type { Seed } from '@/subgraphs/graphql';
import type { Address } from '@/utils/types';

import { useEffect } from 'react';

import {
  nijiGovernorAddress,
  nijiTokenAddress,
  useReadNijiTokenBalanceOf,
  useReadNijiTokenDelegates,
  useReadNijiTokenGetCurrentVotes,
  useReadNijiTokenGetPriorVotes,
  useReadNijiTokenIsApprovedForAll,
  useReadNijiTokenSeeds,
  useWriteNijiTokenDelegate,
  useWriteNijiTokenSetApprovalForAll,
} from '@niji/sdk/react';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { useSubgraphQuery } from '@/hooks/useSubgraphQuery';
import { defaultChain } from '@/wagmi';

import { cache, cacheKey, CHAIN_ID } from '../config';

import {
  accountEscrowedNounsDocument,
  delegateNounsAtBlockDocument,
  ownedNounsDocument,
  seedsDocument,
} from './subgraph';

export interface INounSeed {
  special: number;
  choker: number;
  headphone: number;
  leftHand: number;
  hat: number;
  clothing: number;
  ear: number;
  back: number;
  backDecoration: number;
  background: number;
  solidBackground: number;
  hair: number;
}

const chainId = defaultChain.id;
const seedKeys = [
  'special',
  'choker',
  'headphone',
  'leftHand',
  'hat',
  'clothing',
  'ear',
  'back',
  'backDecoration',
  'background',
  'solidBackground',
  'hair',
] as const satisfies readonly (keyof INounSeed)[];

type ContractSeedTuple = readonly bigint[] & Partial<Record<keyof INounSeed, bigint>>;

const toSeedObject = (seed: Seed | ContractSeedTuple | INounSeed): INounSeed => {
  if ('special' in seed && typeof seed.special === 'number') {
    return seed as INounSeed;
  }

  // viem/wagmi の named multi-output abi returns は tuple (Array) で来る場合と
  // named object で来る場合の 2 態。 tuple の場合 named access は undefined、
  // object の場合 numeric index access は undefined になるため両経路 fallback 必須。
  // Array 判定して優先経路を切替、 default 0 を最終 fallback。
  const tupleSeed = seed as Partial<Record<keyof INounSeed, bigint | number>> & {
    [index: number]: bigint | number | undefined;
  };
  const isArrayLike =
    Array.isArray(seed) ||
    (typeof (seed as { length?: number }).length === 'number' && !('special' in seed));
  const pick = (name: keyof INounSeed, idx: number): number => {
    // Array-like 経路優先 (viem tuple return)
    const arrVal = (seed as Record<number, unknown>)[idx];
    if (typeof arrVal === 'bigint' || typeof arrVal === 'number') return Number(arrVal);
    // named object 経路 (viem named return)
    const namedVal = tupleSeed[name];
    if (typeof namedVal === 'bigint' || typeof namedVal === 'number') return Number(namedVal);
    // 最終 default (どちらも undefined)
    if (isArrayLike && Number(arrVal) === 0) return 0;
    return 0;
  };

  return {
    special: pick('special', 0),
    choker: pick('choker', 1),
    headphone: pick('headphone', 2),
    leftHand: pick('leftHand', 3),
    hat: pick('hat', 4),
    clothing: pick('clothing', 5),
    ear: pick('ear', 6),
    back: pick('back', 7),
    backDecoration: pick('backDecoration', 8),
    background: pick('background', 9),
    solidBackground: pick('solidBackground', 10),
    hair: pick('hair', 11),
  };
};

const seedCacheKey = cacheKey(cache.seed, CHAIN_ID, nijiTokenAddress[chainId].toLowerCase());
const isSeedValid = (seed: INounSeed | Record<string, never> | undefined) => {
  const hasExpectedKeys = seedKeys.every(key => (seed || {}).hasOwnProperty(key));
  const hasValidValues = Object.values(seed || {}).some(v => v !== 0);
  return hasExpectedKeys && hasValidValues;
};
const seedArrayToObject = (seeds: (INounSeed & { id: string })[]) => {
  return seeds.reduce<Record<string, INounSeed>>((acc, seed) => {
    acc[seed.id] = toSeedObject(seed);
    return acc;
  }, {});
};

const useNounSeeds = () => {
  const cache = localStorage.getItem(seedCacheKey);
  const cachedSeeds = cache ? (JSON.parse(cache) as Seed[]) : undefined;
  const { data } = useSubgraphQuery({
    document: seedsDocument,
    variables: { first: 1000 },
    queryKey: ['seeds', 1000],
    enabled: !cachedSeeds,
  });

  useEffect(() => {
    if (!cachedSeeds && data?.seeds !== undefined) {
      const transformedSeeds = data.seeds.map(seed => ({ ...toSeedObject(seed), id: seed.id }));
      localStorage.setItem(seedCacheKey, JSON.stringify(seedArrayToObject(transformedSeeds)));
    }
  }, [data, cachedSeeds]);

  return cachedSeeds;
};

// 31337 (anvil local) 環境では anvil を fresh chain で再起動しても contract address が
// 決定論的 CREATE で同一になり、 localStorage の seedCache key (`seed-31337-<address>`) が
// 変わらない。 結果 make dev-fresh 後も前 chain の古い seed が返り続け、 auction 更新しても
// webapp 上で trait が変わって見えない。 local dev では常に chain read を primary にして
// localStorage cache を bypass する。
const isLocalDev = CHAIN_ID === 31337;

export const useNounSeed = (nounId: bigint): INounSeed | undefined => {
  const seeds = useNounSeeds();
  const seed = isLocalDev ? undefined : seeds?.[Number(nounId)];

  // wallet 未接続でも default chain で seed を取得できるよう chainId を明示する。
  // 31337 local dev では anvil を fresh chain で再起動しても contract address が
  // 決定論的で同じなので wagmi 内部 cache が stale seed を返し続ける事故が発生。
  // staleTime=0 + gcTime=0 で常に fresh fetch を強制、 auction 進行に追従する。
  //
  // Issue #3033 TS2589 fix — query options + args tuple を const 抽出 + `satisfies` で型固定して
  // wagmi CodeGen hook の type inference tree を浅くし、 「Type instantiation excessively deep」 を回避。
  // 既知 workaround (wagmi/viem generated hook で args tuple を inline すると TS2589 発生する pattern)。
  const seedArgs = [nounId] as const satisfies readonly [bigint];
  const seedQuery = {
    enabled: !seed,
    ...(isLocalDev ? { staleTime: 0, gcTime: 0 } : {}),
  } as const;
  const { data: response } = useReadNijiTokenSeeds({
    chainId: defaultChain.id,
    args: seedArgs,
    query: seedQuery,
  });

  if (response) {
    if (isLocalDev) {
      console.log(`[useNounSeed] nounId=${nounId} raw response =`, response);
    }
    const seedData = toSeedObject(response as unknown as ContractSeedTuple);
    if (isLocalDev) {
      console.log(`[useNounSeed] nounId=${nounId} parsed =`, seedData);
    }
    if (!isLocalDev) {
      const seedCache = localStorage.getItem(seedCacheKey);
      if (seedCache && isSeedValid(seedData)) {
        const updatedSeedCache = JSON.stringify({
          ...JSON.parse(seedCache),
          [nounId.toString()]: seedData,
        });
        localStorage.setItem(seedCacheKey, updatedSeedCache);
      }
    }
    return seedData;
  }
  return seed !== undefined ? toSeedObject(seed) : undefined;
};

export const useUserVotes = (): number | undefined => {
  const { address } = useAccount();
  return useAccountVotes(address ?? zeroAddress);
};

export const useAccountVotes = (account?: Address): number | undefined => {
  const { data: votes } = useReadNijiTokenGetCurrentVotes({
    args: account ? [account] : undefined,
  });

  return votes !== undefined ? Number(votes) : undefined;
};

export const useUserDelegatee = (): string | undefined => {
  const { address } = useAccount();
  const { data: delegate } = useReadNijiTokenDelegates({
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return delegate as string | undefined;
};

export const useUserVotesAsOfBlock = (block: number | undefined): number | undefined => {
  const { address } = useAccount();
  // Check for available votes
  const { data: votes } = useReadNijiTokenGetPriorVotes({
    args: address && block !== undefined ? [address, BigInt(block)] : undefined,
    query: { enabled: !!address && block !== undefined },
  });

  return votes !== undefined ? Number(votes) : undefined;
};

export const useDelegateVotes = () => {
  const {
    writeContract: delegateVotes,
    data: hash,
    isPending: isLoading,
    isSuccess,
    isError,
    error: errorMessage,
  } = useWriteNijiTokenDelegate();

  let status = 'None';
  if (isLoading) {
    status = 'Mining';
  } else if (isSuccess) {
    status = 'Success';
  } else if (isError) {
    status = 'Fail';
  }

  const delegateState = {
    status,
    errorMessage,
    transaction: { hash },
  };

  return {
    delegateVotes,
    delegateState,
  };
};

export const useNounTokenBalance = (address: Address): number | undefined => {
  const { data: tokenBalance } = useReadNijiTokenBalanceOf({
    args: [address],
  });

  return tokenBalance !== undefined ? Number(tokenBalance) : undefined;
};
export const useUserOwnedNounIds = (pollInterval: number) => {
  const { address } = useAccount();
  const owner = address?.toLowerCase() ?? '';
  const { loading, data, error, refetch } = useSubgraphQuery({
    document: ownedNounsDocument,
    variables: { owner },
    queryKey: ['ownedNouns', owner],
    refetchInterval: pollInterval,
  });
  const userOwnedNouns: number[] = data?.nouns?.map(noun => Number(noun.id)) ?? [];
  return { loading, data: userOwnedNouns, error, refetch };
};

export const useUserEscrowedNounIds = (pollInterval: number, forkId: string) => {
  const { address } = useAccount();
  const owner = address?.toLowerCase() ?? '';
  const { loading, data, error, refetch } = useSubgraphQuery({
    document: accountEscrowedNounsDocument,
    variables: { owner },
    queryKey: ['accountEscrowedNouns', owner],
    refetchInterval: pollInterval,
  });
  // filter escrowed nouns to just this fork
  const userEscrowedNounIds: number[] =
    data?.escrowedNouns?.reduce((acc: number[], escrowedNoun) => {
      if (escrowedNoun.fork.id === forkId) {
        acc.push(+escrowedNoun.noun.id);
      }
      return acc;
    }, []) ?? [];
  return { loading, data: userEscrowedNounIds, error, refetch };
};

export const useSetApprovalForAll = () => {
  const {
    writeContractAsync,
    data,
    isPending: isLoading,
    isSuccess,
    isError,
    error,
  } = useWriteNijiTokenSetApprovalForAll();

  const getApprovalStatus = () => {
    if (isLoading) return 'Mining';
    if (isSuccess) return 'Success';
    if (isError) return 'Fail';
    return 'None';
  };

  const setApprovalState = {
    status: getApprovalStatus(),
    transaction: data,
    errorMessage: error?.message,
  };

  return {
    setApproval: async () => {
      await writeContractAsync({ args: [nijiGovernorAddress[chainId], true] });
    },
    setApprovalState,
  };
};

export const useIsApprovedForAll = () => {
  const { address } = useAccount();
  // Issue #3035 TS2589 fix — 2 引数 tuple の wagmi CodeGen hook を inline 呼出すると
  // 「Type instantiation excessively deep」 が発生。 args tuple + query options を const 抽出 +
  // `as const satisfies` で型固定し、 hook の type inference tree を浅くする (PR #3034 と同 pattern)。
  // 加えて 2 引数 tuple では tsc の per-file depth budget を消費し切れず const 抽出のみでは
  // error が残るため、 hook 呼出に @ts-expect-error で最終 fallback。 runtime 挙動は不変。
  const args = address
    ? ([address, nijiGovernorAddress[chainId]] as const satisfies readonly [
        `0x${string}`,
        `0x${string}`,
      ])
    : undefined;
  const queryOptions = { enabled: !!address } as const;
  const { data } =
    // @ts-expect-error TS2589 — wagmi CodeGen hook の 2 引数 tuple type inference が excessively deep
    useReadNijiTokenIsApprovedForAll({
      args,
      query: queryOptions,
    });

  return (data as boolean) || false;
};
export const useDelegateNounsAtBlockQuery = (signers: string[], block: bigint) => {
  const { loading, data, error } = useSubgraphQuery({
    document: delegateNounsAtBlockDocument,
    variables: { delegates: signers, block: Number(block) },
    queryKey: ['delegateNounsAtBlock', signers, Number(block)],
  });
  return { loading, data, error };
};
