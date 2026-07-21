/**
 * Cloudflare Workers entry = authorize-fincode + capture-fincode の edge deploy 版
 *
 * local Node hono server (authorize-fincode-server.ts) の stateless refactor:
 * - in-memory Map (CaptureAwareFincodeClient.capturedMap) → Cloudflare KV (FINCODE_STATE binding、 TTL 1h)
 * - FincodeClient は Workers 互換 fetch API 使用 (Node.js 依存なし)
 * - SpotRateFetcher は MockSpotRateFetcher で固定 rate (env `USE_SPOT_RATE_MOCK`)
 * - hono `fetch` export で Workers scheduler が invoke
 *
 * SSOT — packages/niji-api/src/authorize-fincode-server.ts (Node 版、 local 起動用)、
 *        decision-log 2026-07-16-niji-cloudflare-hybrid-deploy.md
 */

import type { FincodeAuthorizationResult } from '../services/fincode/types.js';

import { nijiAuctionHouseAbi } from '@niji/sdk/react/auction-house';
import { nijiTokenAbi } from '@niji/sdk/react/token';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseAbiItem,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { createAuthorizeFincodeApp } from '../handlers/fiat-bid/authorize-fincode.js';
import { type FiatBidRecord, type FiatBidStore } from '../handlers/fiat-bid/authorize.js';
import {
  createCaptureFincodeApp,
  type FincodeCaptureStore,
} from '../handlers/fiat-bid/capture-fincode.js';
import { FincodeClient } from '../services/fincode/client.js';
import { SpotRateFetcher, type SpotRate } from '../services/spotRate/index.js';

/**
 * Cloudflare Workers types minimum stub (npm install 経路の @cloudflare/workers-types なしで compile 通す)
 * runtime は Cloudflare Workers runtime が実 type を提供、 本 stub は tsc 側の型 check のみ用。
 */
type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};
type ScheduledEvent = { scheduledTime: number; cron: string };
type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

/** Cloudflare Workers env bindings (wrangler.toml 定義) */
export type Env = {
  FINCODE_STATE: KVNamespace;
  // Secrets (wrangler secret put)
  FINCODE_API_KEY_SECRET: string;
  OPERATOR_PK: string;
  // Vars (wrangler.toml [vars])
  RPC_URL: string;
  AUCTION_HOUSE_ADDRESS: string;
  NIJI_TOKEN_ADDRESS: string;
  CHAIN_ID?: string;
  USE_FINCODE_MOCK?: string;
  USE_SPOT_RATE_MOCK?: string;
  MOCK_SPOT_RATE_JPY_PER_ETH?: string;
};

/** in-memory FiatBidStore (Workers は request 単位 stateless、 record は KV に別途保存) */
class NoOpFiatBidStore implements FiatBidStore {
  async insertPending(record: FiatBidRecord): Promise<void> {
    console.log(`[worker] insertPending authId=${record.authId} status=${record.status}`);
  }
}

/**
 * FincodeClient extend override = authorize call 時に orderId + accessId を KV に保存、
 * 後段 capture handler が KV から lookup する pattern。 TTL 1 時間で自動 expiry。
 */
class KVAwareFincodeClient extends FincodeClient {
  constructor(
    options: ConstructorParameters<typeof FincodeClient>[0],
    private readonly kv: KVNamespace,
  ) {
    super(options);
  }

  async authorize(input: {
    orderId: string;
    amount: number;
    cardToken: string;
    tds2RetUrl?: string;
  }): Promise<FincodeAuthorizationResult> {
    const result = await super.authorize(input);
    await this.kv.put(
      `capture:${result.authId}`,
      JSON.stringify({
        orderId: result.orderId,
        accessId: result.accessId,
        jpyAmount: input.amount,
      }),
      { expirationTtl: 3600 },
    );
    console.log(`[worker] KV put capture:${result.authId}`);
    return result;
  }
}

/** KV から authId で orderId + accessId を lookup する capture store */
class KVFincodeCaptureStore implements FincodeCaptureStore {
  constructor(private readonly kv: KVNamespace) {}
  async findAuthorized(authId: string) {
    const raw = await this.kv.get(`capture:${authId}`);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { orderId: string; accessId: string; jpyAmount: number };
    return { authId, ...parsed };
  }
  async updateCaptureStatus(input: {
    authId: string;
    status: 'captured' | 'capture-failed';
  }): Promise<void> {
    console.log(`[worker] capture status ${input.authId}: ${input.status}`);
  }
}

/** MockSpotRateFetcher (Node 版 authorize-fincode-server と同 pattern、 method name = handler の呼出と一致) */
class MockSpotRateFetcher extends SpotRateFetcher {
  constructor(private readonly rate: number) {
    super({
      gmoCoinEndpoint: 'http://stub-primary',
      coingeckoEndpoint: 'http://stub-fallback',
    });
  }
  async getEthJpyRate(): Promise<SpotRate> {
    return {
      rate: this.rate,
      source: 'mock',
      cachedAt: Date.now(),
      expiresAt: Date.now() + 5_000,
    };
  }
  async fetchEthJpyRate(): Promise<SpotRate> {
    return this.getEthJpyRate();
  }
}

/** Base Sepolia chain 定義 (viem chain object、 wrangler.toml の CHAIN_ID / RPC_URL で override 可能) */
const buildChain = (env: Env) =>
  defineChain({
    id: Number(env.CHAIN_ID ?? '84532'),
    name: 'Base Sepolia',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: [env.RPC_URL] } },
  });

/** operator EOA から chain client 群を組立 */
const buildChainClients = (env: Env) => {
  const chain = buildChain(env);
  const publicClient = createPublicClient({ chain, transport: http(env.RPC_URL) });
  const account = privateKeyToAccount(env.OPERATOR_PK as Hex);
  const walletClient = createWalletClient({
    chain,
    account,
    transport: http(env.RPC_URL),
  });
  return { chain, publicClient, walletClient, operatorAddress: account.address };
};

/**
 * KV に fiat_bid record を保存する経路 (place-bid で発火、 SettlementDaemon が lookup)。
 * Key pattern:
 *   fiat_bid:${authId}         = { chainAuctionId, bidderWallet, orderId, accessId, jpyAmount }
 *   fiat_bid_by_auction:${nounId} = authId (逆引き map、 SettlementDaemon 使用)
 *   cron_cursor:from_block     = 次 poll の fromBlock (SettlementDaemon が使う)
 */
const putFiatBidRecord = async (
  kv: KVNamespace,
  authId: string,
  record: {
    chainAuctionId: string;
    bidderWallet: string;
    orderId: string;
    accessId: string;
    jpyAmount: number;
    lifecycle: 'bid-placed' | 'won' | 'lost' | 'captured' | 'transferred' | 'cancelled' | 'failed';
    createdAt: number;
  },
) => {
  await kv.put(`fiat_bid:${authId}`, JSON.stringify(record));
  await kv.put(`fiat_bid_by_auction:${record.chainAuctionId}`, authId);
};

const getFiatBidByAuction = async (
  kv: KVNamespace,
  auctionId: bigint,
): Promise<{ authId: string; record: Record<string, unknown> } | null> => {
  const authId = await kv.get(`fiat_bid_by_auction:${auctionId.toString()}`);
  if (authId === null) return null;
  const raw = await kv.get(`fiat_bid:${authId}`);
  if (raw === null) return { authId, record: {} };
  return { authId, record: JSON.parse(raw) as Record<string, unknown> };
};

const updateFiatBidLifecycle = async (
  kv: KVNamespace,
  authId: string,
  update: Record<string, unknown>,
) => {
  const raw = await kv.get(`fiat_bid:${authId}`);
  if (raw === null) return;
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  await kv.put(`fiat_bid:${authId}`, JSON.stringify({ ...parsed, ...update }));
};

/**
 * place-bid handler = webapp が authorize 直後に呼ぶ endpoint、 chain 上代理入札発火 + fiat_bid record KV 保存。
 * body: { authId, bidderWallet }
 */
const createPlaceBidHandler = (env: Env) => {
  const app = new Hono();
  app.post('/place-bid', async c => {
    const raw = await c.req.json().catch(() => ({}));
    const authId = (raw as { authId?: string }).authId ?? '';
    const bidderWallet = (raw as { bidderWallet?: string }).bidderWallet as Address | undefined;
    if (authId === '' || bidderWallet === undefined) {
      return c.json({ error: 'InvalidRequest', message: 'authId + bidderWallet 必須' }, 400);
    }
    // KV から capture:${authId} lookup (authorize 時に KVAwareFincodeClient が保存済)
    const captureRaw = await env.FINCODE_STATE.get(`capture:${authId}`);
    if (captureRaw === null) {
      return c.json(
        { error: 'NotFound', message: `authId=${authId} の capture 情報が KV に無い` },
        404,
      );
    }
    const capture = JSON.parse(captureRaw) as {
      orderId: string;
      accessId: string;
      jpyAmount: number;
    };

    try {
      const { publicClient, walletClient } = buildChainClients(env);
      const auction = (await publicClient.readContract({
        address: env.AUCTION_HOUSE_ADDRESS as Address,
        abi: nijiAuctionHouseAbi,
        functionName: 'auction',
      })) as { nounId: bigint; amount: bigint };
      const auctionId = auction.nounId;

      // spot rate = mock (env override 可能) で jpyAmount → ethAmount 換算 (worker 版は簡易 mock)
      const mockRate = Number.parseInt(env.MOCK_SPOT_RATE_JPY_PER_ETH ?? '500000', 10);
      const ethAmount = BigInt(Math.floor((capture.jpyAmount / mockRate) * 1e18));

      const txHash = await walletClient.writeContract({
        address: env.AUCTION_HOUSE_ADDRESS as Address,
        abi: nijiAuctionHouseAbi,
        functionName: 'createBid',
        args: [auctionId],
        value: ethAmount,
      });

      await putFiatBidRecord(env.FINCODE_STATE, authId, {
        chainAuctionId: auctionId.toString(),
        bidderWallet,
        orderId: capture.orderId,
        accessId: capture.accessId,
        jpyAmount: capture.jpyAmount,
        lifecycle: 'bid-placed',
        createdAt: Date.now(),
      });

      console.log(
        `[worker] place-bid REAL: authId=${authId} auctionId=${auctionId} ethAmount=${ethAmount} bidder=${bidderWallet} txHash=${txHash}`,
      );
      return c.json(
        {
          authId,
          status: 'bid-placed',
          txHash,
          message: `代理入札成功 (auctionId=${auctionId}、 落札時 ${bidderWallet} に transferFrom)`,
        },
        200,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[worker] place-bid FAIL authId=${authId}: ${message}`);
      return c.json({ authId, status: 'cancelled', txHash: null, message }, 200);
    }
  });
  return app;
};

/**
 * AuctionKeeper (Cron Triggers 経路) = auction endTime 経過 + 未 settle を検知して
 * settleCurrentAndCreateNewAuction() を operator EOA から発火、 次 auction を開始する。
 *
 * Nouns 系 auction は自動進行機構を持たず、 anvil では auto-settler script が担っていた役割の
 * Cloudflare Workers 版。 24h auction (Base Sepolia) では 1 日 1 回だけ tx 発火 (残りは read only)、
 * settle が AuctionSettled event を emit → 同 cron の runSettlementDaemon (or 次回 cron) が拾って
 * fiat winner の capture/transfer を実行する 2 段連動。
 *
 * revert 条件 (contract _settleAuction) = startTime != 0 && !settled && now >= endTime、
 * 3 条件満たす時だけ tx を送り、 空振り tx (gas 無駄) を回避する。
 */
const runAuctionKeeper = async (env: Env): Promise<void> => {
  const { publicClient, walletClient } = buildChainClients(env);

  let auction: { startTime: number; endTime: number; settled: boolean };
  try {
    auction = (await publicClient.readContract({
      address: env.AUCTION_HOUSE_ADDRESS as Address,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as { startTime: number; endTime: number; settled: boolean };
  } catch (err) {
    console.error(
      `[keeper] auction read FAIL: ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const started = Number(auction.startTime) !== 0;
  const ended = now >= Number(auction.endTime);
  if (!started || auction.settled || !ended) {
    // まだ settle 不要 (未開始 / 既 settle / 24h 未経過) = read only で終了、 tx 送らない
    console.log(
      `[keeper] skip: started=${started} settled=${auction.settled} ended=${ended} (endTime=${auction.endTime} now=${now})`,
    );
    return;
  }

  try {
    const txHash = await walletClient.writeContract({
      address: env.AUCTION_HOUSE_ADDRESS as Address,
      abi: nijiAuctionHouseAbi,
      functionName: 'settleCurrentAndCreateNewAuction',
      args: [],
    });
    console.log(`[keeper] settle + create next auction: tx=${txHash}`);
    // receipt を待って次 auction 開始を confirm (nonce 順を daemon より前に確定)
    await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 60_000 });
    console.log(`[keeper] settle confirmed, next auction started`);
  } catch (err) {
    // pause 中 / gas 不足 / 既に他 keeper が settle 済 (race) 等は warn のみで継続
    console.error(`[keeper] settle FAIL: ${err instanceof Error ? err.message : String(err)}`);
  }
};

/**
 * SettlementDaemon (Cron Triggers 経路) = fromBlock cursor 以降の AuctionSettled event を取得、
 * KV fiat_bid record と突合して勝敗判定 → capture + transferFrom or cancel を発火する。
 * wrangler.toml の [triggers] crons で 1 min 毎起動、 event miss 防止で cursor は KV 永続。
 */
const runSettlementDaemon = async (env: Env): Promise<void> => {
  const { publicClient, walletClient, operatorAddress } = buildChainClients(env);
  const fincodeClient = new FincodeClient({ apiKeySecret: env.FINCODE_API_KEY_SECRET });

  // fromBlock cursor 取得 (KV)、 未 set なら latest - 10 (直近のみ)
  const cursorRaw = await env.FINCODE_STATE.get('cron_cursor:from_block');
  const latestBlock = await publicClient.getBlockNumber();
  // cursor があればそこから、 なければ latest-10 (初回は直近のみ scan して RPC 負荷を抑える)
  let fromBlock: bigint;
  if (cursorRaw !== null) {
    fromBlock = BigInt(cursorRaw);
  } else {
    fromBlock = latestBlock > 10n ? latestBlock - 10n : 0n;
  }
  const toBlock = latestBlock;

  console.log(`[cron] SettlementDaemon: fromBlock=${fromBlock} toBlock=${toBlock}`);

  // AuctionSettled event = (nounId indexed, winner indexed, amount)
  const auctionSettledEvent = parseAbiItem(
    'event AuctionSettled(uint256 indexed nounId, address indexed winner, uint256 amount)',
  );
  const logs = await publicClient.getLogs({
    address: env.AUCTION_HOUSE_ADDRESS as Address,
    event: auctionSettledEvent,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    const nounId = log.args.nounId!;
    const winner = log.args.winner!;
    const amount = log.args.amount!;
    console.log(`[cron] AuctionSettled: nounId=${nounId} winner=${winner} amount=${amount}`);

    const hit = await getFiatBidByAuction(env.FINCODE_STATE, nounId);
    if (hit === null) {
      console.log(`[cron] nounId=${nounId} no fiat_bid record (crypto bid、 skip)`);
      continue;
    }
    const isFiatWin = winner.toLowerCase() === operatorAddress.toLowerCase();
    const bidderWallet = hit.record['bidderWallet'] as string;
    const orderId = hit.record['orderId'] as string;
    const accessId = hit.record['accessId'] as string;

    if (!isFiatWin) {
      console.log(`[cron] fiat LOST authId=${hit.authId}`);
      await updateFiatBidLifecycle(env.FINCODE_STATE, hit.authId, { lifecycle: 'lost' });
      try {
        await fincodeClient.cancelPayment(orderId, accessId);
        console.log(`[cron] fincode cancel OK authId=${hit.authId}`);
      } catch (err) {
        console.error(
          `[cron] fincode cancel FAIL authId=${hit.authId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      continue;
    }

    console.log(`[cron] fiat WON authId=${hit.authId} tokenId=${nounId} bidder=${bidderWallet}`);
    await updateFiatBidLifecycle(env.FINCODE_STATE, hit.authId, { lifecycle: 'won' });

    // capture
    try {
      const captureResult = await fincodeClient.capturePayment(orderId, accessId);
      await updateFiatBidLifecycle(env.FINCODE_STATE, hit.authId, {
        lifecycle: 'captured',
        captureTxId: captureResult.transaction_id,
        capturedAt: Date.now(),
      });
      console.log(
        `[cron] fincode capture OK authId=${hit.authId} txId=${captureResult.transaction_id}`,
      );
    } catch (err) {
      console.error(
        `[cron] fincode capture FAIL authId=${hit.authId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    // transferFrom (operator → user wallet)
    try {
      const transferTxHash = await walletClient.writeContract({
        address: env.NIJI_TOKEN_ADDRESS as Address,
        abi: nijiTokenAbi,
        functionName: 'transferFrom',
        args: [operatorAddress, bidderWallet as Address, nounId],
      });
      await updateFiatBidLifecycle(env.FINCODE_STATE, hit.authId, {
        lifecycle: 'transferred',
        transferTxHash,
      });
      console.log(
        `[cron] transferFrom OK authId=${hit.authId} tokenId=${nounId} to=${bidderWallet} tx=${transferTxHash}`,
      );
    } catch (err) {
      console.error(
        `[cron] transferFrom FAIL authId=${hit.authId} tokenId=${nounId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // cursor 更新 (次 poll は toBlock+1 以降)
  await env.FINCODE_STATE.put('cron_cursor:from_block', (toBlock + 1n).toString());
};

/** env → process.env 注入 (FincodeClient / MockFetcher が process.env 経由で config 読む pattern に対応) */
const injectProcessEnv = (env: Env): void => {
  const envMap = {
    FINCODE_API_KEY_SECRET: env.FINCODE_API_KEY_SECRET,
    FINCODE_TEST_ENDPOINT: 'https://api.test.fincode.jp',
    FINCODE_LIVE_ENDPOINT: 'https://api.fincode.jp',
    USE_FINCODE_MOCK: env.USE_FINCODE_MOCK ?? 'false',
    USE_SPOT_RATE_MOCK: env.USE_SPOT_RATE_MOCK ?? 'true',
    MOCK_SPOT_RATE_JPY_PER_ETH: env.MOCK_SPOT_RATE_JPY_PER_ETH ?? '500000',
  };
  if (typeof globalThis.process === 'undefined') {
    (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process = {
      env: envMap,
    };
  } else {
    for (const [k, v] of Object.entries(envMap)) {
      globalThis.process.env[k] = v;
    }
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    injectProcessEnv(env);

    const app = new Hono();
    // CORS 対応 = webapp Pages URL (別 origin) からの fetch を許可
    app.use(
      '*',
      cors({
        origin: '*',
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    const mockRate = Number.parseInt(env.MOCK_SPOT_RATE_JPY_PER_ETH ?? '500000', 10);
    const spotRateFetcher = new MockSpotRateFetcher(Number.isFinite(mockRate) ? mockRate : 500_000);
    const fincodeClient = new KVAwareFincodeClient(
      { apiKeySecret: env.FINCODE_API_KEY_SECRET },
      env.FINCODE_STATE,
    );
    const store = new NoOpFiatBidStore();
    const captureStore = new KVFincodeCaptureStore(env.FINCODE_STATE);

    app.route(
      '/api/v1/fiat-bid',
      createAuthorizeFincodeApp({ fincodeClient, spotRateFetcher, store }),
    );
    app.route('/api/v1/fiat-bid', createCaptureFincodeApp({ fincodeClient, store: captureStore }));
    // 2026-07-17 追加 = place-bid endpoint (chain 上代理入札 + KV fiat_bid record 保存)
    app.route('/api/v1/fiat-bid', createPlaceBidHandler(env));

    return app.fetch(request);
  },

  /**
   * Cloudflare Cron Triggers 経路 (wrangler.toml `[triggers] crons = ["* * * * *"]`) で 1 min 毎起動。
   * 2 段 = (1) AuctionKeeper が endTime 経過 auction を settle + 次 auction 開始、
   *        (2) SettlementDaemon が AuctionSettled event を拾って fiat winner の capture/transfer/cancel。
   * keeper → daemon の直列 = keeper の settle tx が emit する AuctionSettled event を、
   * 同回 or 次回 cron の daemon getLogs が拾う (cursor 経路で miss なし)。 同 operator EOA の nonce 順も保つ。
   */
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    injectProcessEnv(env);
    ctx.waitUntil(
      (async () => {
        await runAuctionKeeper(env);
        await runSettlementDaemon(env);
      })(),
    );
  },
};
