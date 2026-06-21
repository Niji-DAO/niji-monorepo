import type { GetLatestAuctionsQuery } from '@/subgraphs/graphql';

import { nijiAuctionHouseAddress } from '@niji/sdk/react';
import { useQuery } from '@tanstack/react-query';
import { parseAbiItem } from 'viem';
import { usePublicClient } from 'wagmi';

import config, { CHAIN_ID } from '@/config';

type AnyPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

// Base Sepolia public RPC は eth_getLogs を 10k block 上限で reject するため、
// 安全側で 9k chunk に区切る。 mainnet / 他 RPC でも上限を下回る共通値。
const PAGINATE_CHUNK_SIZE = 9_000n;

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
 * chain の event log から過去 auction 履歴を構築する hook。
 *
 * - dev (anvil) では subgraph 未起動の primary 経路として常時 enable
 * - prod (Base Sepolia 等) では subgraph 障害時の degrade fallback として opt-in
 *
 * paginate (PAGINATE_CHUNK_SIZE block 単位) で getLogs を分割し、 prod の
 * 数十万 block 範囲でも RPC を枯渇させない。 deploy block (env) から scan 起点を
 * 絞る。 GetLatestAuctionsQuery 形状で返すので addPastAuctions reducer にそのまま流せる。
 *
 * @param enabled hook 起動を opt-in 制御する。 prod は subgraph 健康時 false、 障害時 true を渡す。
 */
export function useChainPastAuctions(enabled: boolean = true): {
  data: GetLatestAuctionsQuery | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const publicClient = usePublicClient();
  const chainId = Number(CHAIN_ID) as keyof typeof nijiAuctionHouseAddress;
  const auctionHouse = nijiAuctionHouseAddress[chainId];
  const deployBlock = config.app.deployBlock;

  const { data, isLoading, error } = useQuery({
    queryKey: ['chain-past-auctions', auctionHouse, deployBlock?.toString() ?? '0'],
    enabled: enabled && publicClient !== undefined && auctionHouse !== undefined,
    refetchInterval: 10_000,
    queryFn: async ({ signal }) => {
      if (import.meta.env.DEV) {
        console.log(
          '[chain-past] fetch start, auctionHouse=',
          auctionHouse,
          'fromBlock=',
          deployBlock?.toString() ?? '0',
        );
      }
      const r = await fetchChainPastAuctions(publicClient!, auctionHouse, deployBlock, signal);
      if (import.meta.env.DEV) {
        console.log('[chain-past] fetched auctions=', r.auctions.length);
      }
      return r;
    },
  });

  return { data, isLoading, error: error as Error | null };
}

type AnyLog = Awaited<ReturnType<AnyPublicClient['getLogs']>>[number];

/**
 * fromBlock 〜 latest を PAGINATE_CHUNK_SIZE 単位で chunk 分割し getLogs を順次呼ぶ。
 * abort signal を受けて mid-flight cancel する。 RPC の block range 上限に縛られる
 * Base Sepolia / mainnet で全 chain scan を可能にする。
 */
async function getLogsPaginated(
  client: AnyPublicClient,
  args: { address: `0x${string}`; event: typeof AUCTION_CREATED },
  fromBlock: bigint,
  latestBlock: bigint,
  signal: AbortSignal | undefined,
): Promise<AnyLog[]>;
async function getLogsPaginated(
  client: AnyPublicClient,
  args: { address: `0x${string}`; event: typeof AUCTION_SETTLED },
  fromBlock: bigint,
  latestBlock: bigint,
  signal: AbortSignal | undefined,
): Promise<AnyLog[]>;
async function getLogsPaginated(
  client: AnyPublicClient,
  args: { address: `0x${string}`; event: typeof AUCTION_BID },
  fromBlock: bigint,
  latestBlock: bigint,
  signal: AbortSignal | undefined,
): Promise<AnyLog[]>;
async function getLogsPaginated(
  client: AnyPublicClient,
  args: { address: `0x${string}`; event: AnyEvent },
  fromBlock: bigint,
  latestBlock: bigint,
  signal: AbortSignal | undefined,
): Promise<AnyLog[]> {
  const out: AnyLog[] = [];
  let cursor = fromBlock;
  while (cursor <= latestBlock) {
    if (signal?.aborted) throw new Error('aborted');
    const to = cursor + PAGINATE_CHUNK_SIZE - 1n;
    const toBlock = to > latestBlock ? latestBlock : to;
    const logs = await client.getLogs({
      address: args.address,
      event: args.event,
      fromBlock: cursor,
      toBlock,
    });
    out.push(...logs);
    cursor = toBlock + 1n;
  }
  return out;
}

type AnyEvent = typeof AUCTION_CREATED | typeof AUCTION_SETTLED | typeof AUCTION_BID;

async function fetchChainPastAuctions(
  client: AnyPublicClient,
  auctionHouse: `0x${string}`,
  deployBlock: bigint | undefined,
  signal?: AbortSignal,
): Promise<GetLatestAuctionsQuery> {
  // prod (Base Sepolia / mainnet) は deploy block 起点で paginate、 dev (anvil) は
  // env 未設定で 0 から scan + chunk size が大きいので実質 1 chunk で完了する。
  // deploy block 未設定の prod 環境では WARN を出す (RPC 枯渇 risk)。
  const fromBlock = deployBlock ?? 0n;
  if (!deployBlock && CHAIN_ID !== 31337 && import.meta.env.DEV) {
    console.warn(
      '[chain-past] deployBlock not set for prod chain — falling back to fromBlock=0n (high RPC cost)',
    );
  }
  const latestBlock = await client.getBlockNumber();

  const [created, settled, bids] = await Promise.all([
    getLogsPaginated(
      client,
      { address: auctionHouse, event: AUCTION_CREATED },
      fromBlock,
      latestBlock,
      signal,
    ),
    getLogsPaginated(
      client,
      { address: auctionHouse, event: AUCTION_SETTLED },
      fromBlock,
      latestBlock,
      signal,
    ),
    getLogsPaginated(
      client,
      { address: auctionHouse, event: AUCTION_BID },
      fromBlock,
      latestBlock,
      signal,
    ),
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
