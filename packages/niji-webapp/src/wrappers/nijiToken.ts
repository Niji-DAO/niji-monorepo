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

  const tupleSeed = seed as Partial<Record<keyof INounSeed, bigint | number>> & {
    [index: number]: bigint | number | undefined;
  };

  return {
    special: Number(tupleSeed.special ?? tupleSeed[0] ?? 0),
    choker: Number(tupleSeed.choker ?? tupleSeed[1] ?? 0),
    headphone: Number(tupleSeed.headphone ?? tupleSeed[2] ?? 0),
    leftHand: Number(tupleSeed.leftHand ?? tupleSeed[3] ?? 0),
    hat: Number(tupleSeed.hat ?? tupleSeed[4] ?? 0),
    clothing: Number(tupleSeed.clothing ?? tupleSeed[5] ?? 0),
    ear: Number(tupleSeed.ear ?? tupleSeed[6] ?? 0),
    back: Number(tupleSeed.back ?? tupleSeed[7] ?? 0),
    backDecoration: Number(tupleSeed.backDecoration ?? tupleSeed[8] ?? 0),
    background: Number(tupleSeed.background ?? tupleSeed[9] ?? 0),
    solidBackground: Number(tupleSeed.solidBackground ?? tupleSeed[10] ?? 0),
    hair: Number(tupleSeed.hair ?? tupleSeed[11] ?? 0),
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
  const { data: response } = useReadNijiTokenSeeds({
    chainId: defaultChain.id,
    args: [nounId],
    query: { enabled: !seed },
  });

  if (response) {
    const seedData = toSeedObject(response as unknown as ContractSeedTuple);
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
  const { data } = useReadNijiTokenIsApprovedForAll({
    args: address ? [address, nijiGovernorAddress[chainId]] : undefined,
    query: { enabled: !!address },
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
