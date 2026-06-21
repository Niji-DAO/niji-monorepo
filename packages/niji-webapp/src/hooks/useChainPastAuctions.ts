import type { GetLatestAuctionsQuery } from '@/subgraphs/graphql';

import { nijiAuctionHouseAddress } from '@niji/sdk/react';
import { useQuery } from '@tanstack/react-query';
import { parseAbiItem } from 'viem';
import { usePublicClient } from 'wagmi';

import { CHAIN_ID } from '@/config';

type AnyPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

// settle 未完 auction の owner placeholder。 prod subgraph は実際の holder を返すが、
// chain fallback では「落札者なし」 を示すため zero address を使う。 これにより
// NijiInfoRowHolder 等の Etherscan link が NijiToken contract に向く誤動作を防ぐ。
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const AUCTION_CREATED = parseAbiItem(
  'event AuctionCreated(uint256 indexed nounId, uint256 startTime, uint256 endTime)',
);
const AUCTION_SETTLED = parseAbiItem(
  'event AuctionSettled(uint256 indexed nounId, address winner, uint256 amount)',
);
const AUCTION_BID = parseAbiItem(
  'event AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended)',
);

/**
 * subgraph 未起動の dev 環境 (anvil 等) 向けに、 chain の event log から
 * 過去 auction 履歴を構築するための hook。 prod (Base Sepolia) では従来通り
 * subgraph 経路を使い、 dev だけここに切り替える前提。
 *
 * GetLatestAuctionsQuery 形状に整形して返すので addPastAuctions reducer に
 * そのまま流せる。
 */
export function useChainPastAuctions(): {
  data: GetLatestAuctionsQuery | undefined;
  isLoading: boolean;
} {
  const publicClient = usePublicClient();
  const chainId = Number(CHAIN_ID) as keyof typeof nijiAuctionHouseAddress;
  const auctionHouse = nijiAuctionHouseAddress[chainId];

  const { data, isLoading } = useQuery({
    queryKey: ['chain-past-auctions', auctionHouse],
    enabled: publicClient !== undefined && auctionHouse !== undefined,
    refetchInterval: 10_000,
    queryFn: async () => {
      if (import.meta.env.DEV) {
        console.log('[chain-past] fetch start, auctionHouse=', auctionHouse);
      }
      const r = await fetchChainPastAuctions(publicClient!, auctionHouse);
      if (import.meta.env.DEV) {
        console.log('[chain-past] fetched auctions=', r.auctions.length);
      }
      return r;
    },
  });

  return { data, isLoading };
}

async function fetchChainPastAuctions(
  client: AnyPublicClient,
  auctionHouse: `0x${string}`,
): Promise<GetLatestAuctionsQuery> {
  // anvil なら全 block range を一発で取れる。 Base Sepolia 等で deploy block 以降に
  // 限定したくなったら deploy block を env 経由で受ける改修を別途。
  const [created, settled, bids] = await Promise.all([
    client.getLogs({
      address: auctionHouse,
      event: AUCTION_CREATED,
      fromBlock: 0n,
      toBlock: 'latest',
    }),
    client.getLogs({
      address: auctionHouse,
      event: AUCTION_SETTLED,
      fromBlock: 0n,
      toBlock: 'latest',
    }),
    client.getLogs({ address: auctionHouse, event: AUCTION_BID, fromBlock: 0n, toBlock: 'latest' }),
  ]);

  // bid event に出てくる unique blockNumber を集めて Promise.all で batch 取得 (Issue #179)。
  // 同 block に複数 bid がある場合は 1 回しか fetch しない、 RPC call 数を最小化。
  type BidLog = (typeof bids)[number];
  const blockSet = new Set<bigint>();
  for (const b of bids as BidLog[]) {
    if (b.blockNumber !== null && b.blockNumber !== undefined) {
      blockSet.add(b.blockNumber);
    }
  }
  const uniqueBlocks: bigint[] = Array.from(blockSet);
  const blockTimestamps = new Map<bigint, bigint>();
  await Promise.all(
    uniqueBlocks.map(async (bn: bigint) => {
      const block = await client.getBlock({ blockNumber: bn });
      blockTimestamps.set(bn, block.timestamp);
    }),
  );

  // nounId 別に bid 履歴を集約
  const bidsByNoun = new Map<
    bigint,
    Array<{
      amount: bigint;
      sender: `0x${string}`;
      blockNumber: bigint;
      blockTimestamp: bigint;
      txHash: string;
      txIndex: bigint;
    }>
  >();
  for (const log of bids) {
    const nounId = log.args.nounId!;
    const sender = log.args.sender!;
    const value = log.args.value!;
    const arr = bidsByNoun.get(nounId) ?? [];
    arr.push({
      amount: value,
      sender,
      blockNumber: log.blockNumber!,
      blockTimestamp: blockTimestamps.get(log.blockNumber!) ?? 0n,
      txHash: log.transactionHash!,
      txIndex: BigInt(log.transactionIndex!),
    });
    bidsByNoun.set(nounId, arr);
  }

  // settle 済 auction の落札 amount / bidder
  const settledByNoun = new Map<bigint, { winner: `0x${string}`; amount: bigint }>();
  for (const log of settled) {
    settledByNoun.set(log.args.nounId!, { winner: log.args.winner!, amount: log.args.amount! });
  }

  // AuctionCreated を起点に各 auction を構築。 redux store / TanStack Query の
  // JSON serialize で BigInt が落ちるため全 bigint 値を string で詰める
  // (reducer 側 reduxSafePastAuctions が BigInt(string) で再生成するので互換)。
  type CreatedLog = (typeof created)[number];
  const auctions = created
    .map((log: CreatedLog) => {
      const nounId = log.args.nounId!;
      const startTime = log.args.startTime!;
      const endTime = log.args.endTime!;
      const winner = settledByNoun.get(nounId);
      const nounBids = bidsByNoun.get(nounId) ?? [];

      return {
        __typename: 'Auction' as const,
        id: nounId.toString(),
        amount: (winner?.amount ?? 0n).toString(),
        settled: winner !== undefined,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        bidder: winner ? { __typename: 'Account' as const, id: winner.winner } : null,
        noun: {
          __typename: 'Noun' as const,
          id: nounId.toString(),
          owner: { __typename: 'Account' as const, id: (winner?.winner ?? ZERO_ADDRESS) as string },
        },
        bids: nounBids.map(b => ({
          __typename: 'Bid' as const,
          id: `${b.txHash}-${b.txIndex}`,
          amount: b.amount.toString(),
          blockNumber: b.blockNumber.toString(),
          blockTimestamp: b.blockTimestamp.toString(),
          txHash: b.txHash as 'Byte',
          txIndex: b.txIndex.toString(),
          bidder: { __typename: 'Account' as const, id: b.sender },
        })),
      };
    })
    .sort((a: { id: string }, b: { id: string }) => Number(BigInt(b.id) - BigInt(a.id))); // startTime desc 相当 (id desc で代用)

  // GetLatestAuctionsQuery の type 上 bigint だが、 reducer は BigInt(string) で
  // 受け入れるので runtime 互換、 unknown 経由でキャスト
  return { __typename: 'Query', auctions } as unknown as GetLatestAuctionsQuery;
}
