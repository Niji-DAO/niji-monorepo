/**
 * fiat 入札の落札 (settle) 監視 script
 *
 * 用途 —
 * fiat 入札を出した後、 auction の終了は最大 24 時間先になる。
 * その間に SettlementDaemon (Cloudflare Workers の cron、 1 分毎) が
 * AuctionSettled を拾って capture と transferFrom を実行するが、
 * これが実際に動いたかは chain と NFT の所有者を見ないと分からない。
 *
 * 本 script は「今どの段階にいるか」 を 1 コマンドで表示する。
 * 実行例 —
 *   pnpm --filter @niji/api watch:settlement
 *   pnpm --filter @niji/api watch:settlement -- --watch     # 60 秒毎に再表示
 *   pnpm --filter @niji/api watch:settlement -- --token 1   # 指定 tokenId の所有者も確認
 *
 * 判定する 4 段階 —
 * (1) 入札中     = auction 未終了、 最高額入札者が operator なら fiat 入札が現在勝っている
 * (2) 終了待ち   = endTime 経過、 settled=false = AuctionKeeper の settle tx 待ち
 * (3) settle 済  = 次 auction が開始済、 直前 auction の落札者を AuctionSettled から判定
 * (4) 引渡し済   = 落札 tokenId の owner が operator でなく入札者 wallet = transferFrom 完了
 *
 * env —
 *   RPC_URL               (default https://sepolia.base.org)
 *   AUCTION_HOUSE_ADDRESS (default Base Sepolia の deploy 済 address)
 *   NIJI_TOKEN_ADDRESS    (default 同上)
 *   OPERATOR_ADDRESS      (default Base Sepolia の運営 EOA)
 */

import { nijiAuctionHouseAbi } from '@niji/sdk/react/auction-house';
import { nijiTokenAbi } from '@niji/sdk/react/token';
import {
  createPublicClient,
  defineChain,
  formatEther,
  http,
  parseAbiItem,
  type Address,
} from 'viem';

const RPC_URL = process.env['RPC_URL'] ?? 'https://sepolia.base.org';
const AUCTION_HOUSE = (process.env['AUCTION_HOUSE_ADDRESS'] ??
  '0x449E337180402643Ea90148230fD57E534344225') as Address;
const NIJI_TOKEN = (process.env['NIJI_TOKEN_ADDRESS'] ??
  '0xE8470ff7F6028d37f60C8c8CA79C7426031b3D35') as Address;
const OPERATOR = (process.env['OPERATOR_ADDRESS'] ??
  '0xaEa7cd3F6DC66543D1bE9394b394a669D868c62B') as Address;

/**
 * Base の public RPC は eth_getLogs を 2000 block/request に制限する。
 * 範囲を超えると error になるため、 分割して取得する。
 */
const LOG_CHUNK = 2000n;
/** 遡る最大 chunk 数 (2000 block × 15 ≒ 16 時間ぶん、 24 時間 auction の直近 settle を拾える) */
const MAX_CHUNKS = 15;

const chain = defineChain({
  id: Number(process.env['CHAIN_ID'] ?? '84532'),
  name: 'Base Sepolia',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const client = createPublicClient({ chain, transport: http(RPC_URL) });

const auctionSettledEvent = parseAbiItem(
  'event AuctionSettled(uint256 indexed nounId, address indexed winner, uint256 amount)',
);

const isOperator = (address: string): boolean => address.toLowerCase() === OPERATOR.toLowerCase();

const formatDuration = (sec: number): string => {
  const abs = Math.abs(sec);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return `${sec < 0 ? '-' : ''}${h}時間${m}分`;
};

/** 直近の AuctionSettled を chunk 分割で遡って取得する */
const fetchRecentSettled = async (): Promise<
  Array<{ nounId: bigint; winner: Address; amount: bigint; blockNumber: bigint }>
> => {
  const latest = await client.getBlockNumber();
  const collected: Array<{
    nounId: bigint;
    winner: Address;
    amount: bigint;
    blockNumber: bigint;
  }> = [];
  for (let i = 0; i < MAX_CHUNKS; i += 1) {
    const toBlock = latest - LOG_CHUNK * BigInt(i);
    const fromBlock = toBlock - (LOG_CHUNK - 1n);
    if (fromBlock <= 0n) break;
    try {
      const logs = await client.getLogs({
        address: AUCTION_HOUSE,
        event: auctionSettledEvent,
        fromBlock,
        toBlock,
      });
      for (const log of logs) {
        collected.push({
          nounId: log.args.nounId!,
          winner: log.args.winner!,
          amount: log.args.amount!,
          blockNumber: log.blockNumber,
        });
      }
    } catch {
      // 単一 chunk の失敗は握って残りを活かす (部分欠けでも判定材料にはなる)
    }
  }
  return collected.sort((a, b) => Number(a.blockNumber - b.blockNumber));
};

const reportOnce = async (tokenIdArg: bigint | undefined): Promise<void> => {
  const now = Math.floor(Date.now() / 1000);
  const auction = (await client.readContract({
    address: AUCTION_HOUSE,
    abi: nijiAuctionHouseAbi,
    functionName: 'auction',
  })) as {
    nounId: bigint;
    amount: bigint;
    startTime: bigint | number;
    endTime: bigint | number;
    bidder: Address;
    settled: boolean;
  };

  const endTime = Number(auction.endTime);
  const remaining = endTime - now;

  console.log(`\n===== ${new Date().toISOString()} =====`);
  console.log(`auction house : ${AUCTION_HOUSE}`);
  console.log(`operator EOA  : ${OPERATOR}`);
  console.log('');
  console.log(`現在の auction : Niji ${auction.nounId.toString()}`);
  console.log(`最高額        : ${formatEther(auction.amount)} ETH`);
  console.log(
    `最高額入札者  : ${auction.bidder}${isOperator(auction.bidder) ? '  ← operator (fiat 入札が現在勝っている)' : ''}`,
  );
  console.log(`終了時刻      : ${new Date(endTime * 1000).toISOString()}`);
  console.log(
    remaining > 0
      ? `残り          : ${formatDuration(remaining)}`
      : `経過          : 終了から ${formatDuration(remaining)}`,
  );
  console.log(`settled       : ${auction.settled}`);

  // 段階判定
  let stage: string;
  if (remaining > 0) {
    stage = isOperator(auction.bidder)
      ? '(1) 入札中 — fiat 入札が現在の最高額'
      : '(1) 入札中 — fiat 入札は現在の最高額ではない';
  } else if (!auction.settled) {
    stage = '(2) 終了待ち — AuctionKeeper (cron 1 分毎) の settle tx 待ち';
  } else {
    stage = '(3) settle 済';
  }
  console.log(`\n段階          : ${stage}`);

  const settled = await fetchRecentSettled();
  if (settled.length === 0) {
    console.log('直近 settle    : 取得範囲内に AuctionSettled なし');
  } else {
    console.log('\n直近 settle (古い順):');
    for (const s of settled.slice(-5)) {
      console.log(
        `  Niji ${s.nounId.toString().padStart(3)}  ${formatEther(s.amount).padStart(20)} ETH  winner=${s.winner}${isOperator(s.winner) ? '  ← fiat 落札' : ''}`,
      );
    }
  }

  // NFT 所有者確認 = transferFrom が完了したかの最終判定
  const fiatWon = settled.filter(s => isOperator(s.winner));
  const targets = tokenIdArg !== undefined ? [tokenIdArg] : fiatWon.map(s => s.nounId);
  if (targets.length === 0) {
    console.log('\n所有者確認     : fiat 落札 token なし (確認対象なし)');
    return;
  }
  console.log('\n所有者確認 (fiat 落札 token):');
  for (const tokenId of targets) {
    try {
      const owner = (await client.readContract({
        address: NIJI_TOKEN,
        abi: nijiTokenAbi,
        functionName: 'ownerOf',
        args: [tokenId],
      })) as Address;
      const done = !isOperator(owner);
      console.log(
        `  Niji ${tokenId.toString().padStart(3)}  owner=${owner}  → ${done ? '(4) 引渡し済 (transferFrom 完了)' : '(3) capture / transferFrom 待ち (owner が operator のまま)'}`,
      );
    } catch (err) {
      console.log(
        `  Niji ${tokenId.toString().padStart(3)}  ownerOf 取得失敗: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const watch = argv.includes('--watch');
  const tokenIdx = argv.indexOf('--token');
  const tokenRaw = tokenIdx >= 0 ? argv[tokenIdx + 1] : undefined;
  const tokenIdArg =
    tokenRaw !== undefined && /^\d+$/.test(tokenRaw) ? BigInt(tokenRaw) : undefined;

  await reportOnce(tokenIdArg);
  if (!watch) return;

  console.log('\n--watch 指定、 60 秒毎に再表示する (Ctrl+C で終了)');
  for (;;) {
    await new Promise(resolve => setTimeout(resolve, 60_000));
    await reportOnce(tokenIdArg);
  }
};

void main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
