/**
 * Cloudflare Workers entry = authorize-fincode + capture-fincode の edge deploy 版
 *
 * local Node hono server (authorize-fincode-server.ts) の stateless refactor:
 * - in-memory Map (CaptureAwareFincodeClient.capturedMap) → Cloudflare KV (FINCODE_STATE binding、 TTL 1h)
 * - 与信時に確定した ethAmount を KV に保存し、 place-bid は再換算せずその値で入札する
 * - FincodeClient は Workers 互換 fetch API 使用 (Node.js 依存なし)
 * - SpotRateFetcher は単一 instance を spot-rate route / authorize / place-bid で共有 (env `USE_SPOT_RATE_MOCK`
 *   が true なら固定 rate、 false なら GMO コイン primary + CoinGecko fallback の実 rate)
 * - hono `fetch` export で Workers scheduler が invoke
 *
 * SSOT — packages/niji-api/src/authorize-fincode-server.ts (Node 版、 local 起動用)、
 *        decision-log 2026-07-16-niji-cloudflare-hybrid-deploy.md
 */

import type { FincodeAuthorizationResult } from '../services/fincode/types.js';

import { nijiAuctionHouseAbi } from '@niji/sdk/react/auction-house';

/**
 * V3 に追加された createBidFor の minimal ABI (2026-07-23 upgrade)。
 * @niji/sdk gen file は etherscan verify 未完 + wagmi cli 再生成待ちのため暫定 local 定義。
 */
const nijiAuctionHouseV3ExtraAbi = [
  {
    type: 'function',
    name: 'createBidFor',
    stateMutability: 'payable',
    inputs: [
      { name: 'nounId', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [],
  },
] as const;
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  fallback,
  http,
  parseAbiItem,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  createThreeDsCallbackFincodeApp,
  type ThreeDsFincodeStore,
} from '../handlers/fiat-bid/3ds-callback-fincode.js';
import { createAuthorizeFincodeApp } from '../handlers/fiat-bid/authorize-fincode.js';
import { type FiatBidRecord, type FiatBidStore } from '../handlers/fiat-bid/authorize.js';
import {
  createCaptureFincodeApp,
  type FincodeCaptureStore,
} from '../handlers/fiat-bid/capture-fincode.js';
import { createSpotRateApp } from '../handlers/spot-rate.js';
import { FincodeClient } from '../services/fincode/client.js';
import { SpotRateFetcher } from '../services/spotRate/index.js';

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
  /**
   * Alchemy API key (2026-07-23 追加、 secret 経路)。
   * 設定されていれば `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}` を primary transport
   * として使う。 未設定なら RPC_URL / RPC_FALLBACK_URLS のみで動作 (Alchemy 経由をスキップ)。
   */
  ALCHEMY_API_KEY?: string;
  // Vars (wrangler.toml [vars])
  RPC_URL: string;
  /**
   * fallback RPC URL のカンマ区切り (2026-07-23 追加)。
   * 例: `https://base-sepolia.drpc.org,https://base-sepolia-rpc.publicnode.com`
   * primary (Alchemy or RPC_URL) が rate limit / network error で失敗した時に順次 rotate。
   */
  RPC_FALLBACK_URLS?: string;
  AUCTION_HOUSE_ADDRESS: string;
  NIJI_TOKEN_ADDRESS: string;
  CHAIN_ID?: string;
  USE_FINCODE_MOCK?: string;
  USE_SPOT_RATE_MOCK?: string;
  MOCK_SPOT_RATE_JPY_PER_ETH?: string;
  /**
   * 3DS 2.0 の戻り先 URL (webapp の /fiat-bid/3ds-return)。
   * 設定すると authorize が fincode に tds2_ret_url を渡し、 3DS 必須カードで認証画面を挟む。
   * 未設定なら 3DS を要求しない (fincode 仕様) ため、 本番 deploy では必ず設定する。
   */
  TDS2_RET_URL?: string;
};

/** KV に保存する authorize 済 bid の state (`capture:{authId}` の値) */
type CaptureState = {
  orderId: string;
  accessId: string;
  jpyAmount: number;
  /**
   * 与信時に確定した入札 ETH 量 (wei、 bigint は JSON に載らないため 10 進 string)。
   * place-bid はこの値をそのまま chain に投げ、 spot rate による再換算を行わない。
   * 再換算すると与信 JPY 額を確定した時刻と入札時刻の rate 差がそのまま金額差になるため。
   */
  ethAmount?: string;
  /** 与信時の rate (JPY / 1 ETH)、 監査 log 用 */
  spotRate?: number;
  /** 3DS 認証の結果 (認証を経た場合のみ)。 audit 用で分岐には使わない */
  threeDsStatus?: string;
  threeDsTransResult?: string;
};

/**
 * authorize handler の store 実装 = 与信確定値を `capture:{authId}` に merge する。
 *
 * KVAwareFincodeClient.authorize が先に同 key へ orderId / accessId / jpyAmount を書き、
 * その直後に本 store が ethAmount / spotRate を足す 2 段構成。 fincode 応答を待たないと
 * authId が決まらないため書込を 1 回にまとめられず、 read-modify-write で合流させる。
 */
class KVFiatBidStore implements FiatBidStore {
  constructor(private readonly kv: KVNamespace) {}

  async insertPending(record: FiatBidRecord): Promise<void> {
    const key = `capture:${record.authId}`;
    const raw = await this.kv.get(key);
    const base = (raw === null ? {} : JSON.parse(raw)) as Partial<CaptureState>;
    const merged: CaptureState = {
      orderId: record.orderId ?? base.orderId ?? '',
      accessId: record.accessId ?? base.accessId ?? '',
      jpyAmount: record.jpyAmount,
      ethAmount: record.ethAmount.toString(),
      spotRate: record.spotRate,
    };
    await this.kv.put(key, JSON.stringify(merged), { expirationTtl: 3600 });
    console.log(
      `[worker] insertPending authId=${record.authId} status=${record.status} ethAmount=${merged.ethAmount} rate=${record.spotRate}`,
    );
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

/**
 * KV から authId で orderId + accessId を lookup する store。
 * capture handler と 3DS callback handler が同じ `capture:{authId}` record を参照する。
 */
class KVFincodeCaptureStore implements FincodeCaptureStore, ThreeDsFincodeStore {
  constructor(private readonly kv: KVNamespace) {}
  async findAuthorized(authId: string) {
    const raw = await this.kv.get(`capture:${authId}`);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as { orderId: string; accessId: string; jpyAmount: number };
    return { authId, ...parsed };
  }

  /** 3DS 認証結果を record に追記する。 place-bid 側の判定には使わず audit 用に残す */
  async updateThreeDsStatus(input: {
    authId: string;
    status: string;
    transResult?: string;
  }): Promise<void> {
    const key = `capture:${input.authId}`;
    const raw = await this.kv.get(key);
    if (raw === null) return;
    const parsed = JSON.parse(raw) as CaptureState;
    const next: CaptureState = { ...parsed, threeDsStatus: input.status };
    if (input.transResult !== undefined) next.threeDsTransResult = input.transResult;
    await this.kv.put(key, JSON.stringify(next), { expirationTtl: 3600 });
    console.log(
      `[worker] 3ds status authId=${input.authId} status=${input.status} transResult=${input.transResult ?? 'n/a'}`,
    );
  }
  async updateCaptureStatus(input: {
    authId: string;
    status: 'captured' | 'capture-failed';
  }): Promise<void> {
    console.log(`[worker] capture status ${input.authId}: ${input.status}`);
  }
}

/**
 * RPC URL の優先順を組立てる (2026-07-23、 Base 公式 public endpoint 429 対策)。
 *
 * 順序:
 *   (1) Alchemy = `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}` (secret 設定時のみ)
 *   (2) RPC_URL (wrangler.toml vars、 従来値)
 *   (3) RPC_FALLBACK_URLS (カンマ区切り、 空なら組込 default 3 個)
 *
 * dedupe + 空文字除去。 一つでも成功すれば tx が通る = 全滅は極めて稀。
 */
export const resolveRpcUrls = (env: Env): string[] => {
  const urls: string[] = [];
  if (env.ALCHEMY_API_KEY !== undefined && env.ALCHEMY_API_KEY !== '') {
    urls.push(`https://base-sepolia.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`);
  }
  if (env.RPC_URL !== undefined && env.RPC_URL !== '') {
    urls.push(env.RPC_URL);
  }
  const fallbackEnv = env.RPC_FALLBACK_URLS?.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const fallbackDefaults = [
    'https://base-sepolia.drpc.org',
    'https://base-sepolia-rpc.publicnode.com',
    'https://sepolia.base.org',
  ];
  urls.push(
    ...(fallbackEnv !== undefined && fallbackEnv.length > 0 ? fallbackEnv : fallbackDefaults),
  );
  return [...new Set(urls.filter(u => u.length > 0))];
};

/**
 * viem `fallback` transport で URL リストを順次試す。
 * 各 URL に retryCount:1 = 1 回だけ再試行、 失敗したら次 URL に rotate。
 * rank:false = 固定順序 (Alchemy 優先を維持、 latency 変動での順序入替を防ぐ)。
 */
const buildTransport = (env: Env) => {
  const urls = resolveRpcUrls(env);
  if (urls.length === 0) {
    throw new Error(
      'No RPC URL configured (ALCHEMY_API_KEY / RPC_URL / RPC_FALLBACK_URLS all empty)',
    );
  }
  return fallback(
    urls.map(url => http(url, { retryCount: 1, retryDelay: 200 })),
    { retryCount: 0, rank: false },
  );
};

/** Base Sepolia chain 定義 (viem chain object、 wrangler.toml の CHAIN_ID で override 可能) */
const buildChain = (env: Env) =>
  defineChain({
    id: Number(env.CHAIN_ID ?? '84532'),
    name: 'Base Sepolia',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: resolveRpcUrls(env) } },
  });

/** operator EOA から chain client 群を組立 */
const buildChainClients = (env: Env) => {
  const chain = buildChain(env);
  const transport = buildTransport(env);
  const publicClient = createPublicClient({ chain, transport });
  const account = privateKeyToAccount(env.OPERATOR_PK as Hex);
  const walletClient = createWalletClient({ chain, account, transport });
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
    /** 実際に chain へ投げた入札額 (wei、 10 進 string)。 settle 後の金額突合用 */
    ethAmount: string;
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
 *
 * 入札 ETH 量は与信時に確定した `capture:{authId}` の ethAmount をそのまま使い、 ここで rate を
 * 引き直さない。 Cloudflare Workers は request ごとに handler を実行するため SpotRateFetcher の
 * 5 秒 cache が request を跨がず、 再換算すると authorize 時と place-bid 時の rate 差が
 * そのまま「user に見せた与信額」 と「chain に投げた ETH 量」 のずれになる。
 *
 * spotRateFetcher は ethAmount 未保存の record に対する移行期 fallback 専用。
 */
const createPlaceBidHandler = (env: Env, spotRateFetcher: SpotRateFetcher) => {
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
    const capture = JSON.parse(captureRaw) as CaptureState;

    try {
      const { publicClient, walletClient } = buildChainClients(env);
      const auction = (await publicClient.readContract({
        address: env.AUCTION_HOUSE_ADDRESS as Address,
        abi: nijiAuctionHouseAbi,
        functionName: 'auction',
      })) as { nounId: bigint; amount: bigint };
      const auctionId = auction.nounId;

      // 与信時に確定した ETH 量をそのまま使う。 rate 再取得なし = 与信額と入札額が定義上一致する。
      // ethAmount 不在は本 handler 変更前に authorize 済で TTL 1 時間内に残っている record のみ。
      // その場合に限り旧経路 (rate 再換算) に落として in-flight の入札を落とさない。
      let ethAmount: bigint;
      if (typeof capture.ethAmount === 'string' && capture.ethAmount !== '') {
        ethAmount = BigInt(capture.ethAmount);
      } else {
        const { rate: jpyPerEth } = await spotRateFetcher.getEthJpyRate();
        ethAmount = BigInt(Math.floor((capture.jpyAmount / jpyPerEth) * 1e18));
        console.warn(
          `[worker] place-bid authId=${authId}: capture record に ethAmount 無し、 rate ${jpyPerEth} で再換算 (移行期 fallback)`,
        );
      }

      // createBid の前に record を書く。 chain へ入札した後に record 書込が失敗すると、
      // settle 時に cron が「record 無し = crypto bid」 と誤判定して transferFrom を skip し、
      // NFT が operator に留まる (Niji 1 で実際に発生)。 先に書けば createBid revert 時の
      // orphan record は settle 時に operator が winner にならず lost 判定 → cancel され無害。
      await putFiatBidRecord(env.FINCODE_STATE, authId, {
        chainAuctionId: auctionId.toString(),
        bidderWallet,
        orderId: capture.orderId,
        accessId: capture.accessId,
        jpyAmount: capture.jpyAmount,
        ethAmount: ethAmount.toString(),
        lifecycle: 'bid-placed',
        createdAt: Date.now(),
      });

      // NijiAuctionHouseV3.createBidFor(auctionId, bidderWallet) を relayer (operator EOA) から
      // broadcast、 value = ethAmount。 auctionStorage.bidder = user wallet に set され、
      // 落札時は contract 側 _settleAuction が nouns.transferFrom を自動発火 = cron の
      // transferFrom 経路 (Step B) は撤去済 (下段の runSettlementDaemon 参照)。
      const txHash = await walletClient.writeContract({
        address: env.AUCTION_HOUSE_ADDRESS as Address,
        abi: nijiAuctionHouseV3ExtraAbi,
        functionName: 'createBidFor',
        args: [auctionId, bidderWallet],
        value: ethAmount,
      });

      console.log(
        `[worker] place-bid REAL (createBidFor): authId=${authId} auctionId=${auctionId} jpy=${capture.jpyAmount} rate=${capture.spotRate ?? 'n/a'} ethAmount=${ethAmount} recipient=${bidderWallet} txHash=${txHash}`,
      );
      return c.json(
        {
          authId,
          status: 'bid-placed',
          txHash,
          message: `代理入札成功 (auctionId=${auctionId}、 recipient=${bidderWallet} が bidder として chain 上に記録)`,
        },
        200,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[worker] place-bid FAIL authId=${authId}: ${message}`);
      return c.json({ authId, status: 'cancelled', txHash: null, message }, 200);
    }
  });

  /**
   * 2026-07-23 追加 = webapp が auction ページで「chain 上 bidder = 運営 EOA」 の raw address を
   * user wallet (recipient) に透過置換するための join endpoint。 subgraph 側 BidPlacedFor handler
   * は upgrade block (44505557) 以降の event でのみ発火するため、 upgrade 前 fiat bid の recipient
   * 情報は subgraph に存在しない。 KV の fiat_bid_by_auction 経路で復元して webapp に返す。
   *
   * GET /api/v1/fiat-bid/by-auction/:auctionId → 200 { auctionId, bidderWallet, jpyAmount, lifecycle }
   *                                             or 404 { error: 'not_found' } (crypto bid or 未 fiat)
   */
  app.get('/by-auction/:auctionId', async c => {
    const auctionIdParam = c.req.param('auctionId');
    let auctionId: bigint;
    try {
      auctionId = BigInt(auctionIdParam);
    } catch {
      return c.json({ error: 'invalid_auction_id' }, 400);
    }
    const hit = await getFiatBidByAuction(env.FINCODE_STATE, auctionId);
    if (hit === null) {
      return c.json({ error: 'not_found' }, 404);
    }
    const rec = hit.record;
    return c.json(
      {
        auctionId: auctionIdParam,
        authId: hit.authId,
        bidderWallet: (rec['bidderWallet'] as string | undefined) ?? null,
        jpyAmount: (rec['jpyAmount'] as number | undefined) ?? null,
        ethAmount: (rec['ethAmount'] as string | undefined) ?? null,
        lifecycle: (rec['lifecycle'] as string | undefined) ?? null,
      },
      200,
    );
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
 * getLogs の 1 回あたり最大走査 block 数。 Base の公開 RPC の eth_getLogs 2000 block/req 制限より
 * 安全側に取り、 cursor が古すぎる場合の窓をこの値で cap する。
 */
const SETTLEMENT_MAX_SCAN_WINDOW = 1500n;

/**
 * idle 時 (AuctionSettled event なし) に cursor を書き進める間隔 (block)。
 * この値ごとにしか KV write しないことで、 毎分書込 (1440/日) → 無料枠超過を回避する。
 * Base の 2 秒 block 換算で約 10 分ごと = 1 日あたり最大 ~144 write に収まる。
 */
const SETTLEMENT_CURSOR_ADVANCE = 300n;

/**
 * SettlementDaemon (Cron Triggers 経路) = fromBlock cursor 以降の AuctionSettled event を取得、
 * KV fiat_bid record と突合して勝敗判定 → capture + transferFrom or cancel を発火する。
 * wrangler.toml の [triggers] crons で 1 min 毎起動、 event miss 防止で cursor は KV 永続。
 *
 * cursor 書込は毎回ではなく「event 処理時」 か「窓が SETTLEMENT_CURSOR_ADVANCE を超えた時」 に限定し、
 * KV write 無料枠 (1000/日) を超えないようにする (2026-07-22 に毎分書込で 90% 到達したため)。
 */
const runSettlementDaemon = async (env: Env): Promise<void> => {
  // walletClient は Step B (backend transferFrom) 撤去 (2026-07-23) に伴い未使用化。
  // buildChainClients の返り値そのままだと unused-vars で lint エラーになるため
  // destructure から外し、 必要になった時に options.walletClient で個別取得する。
  const { publicClient, operatorAddress } = buildChainClients(env);
  const fincodeClient = new FincodeClient({ apiKeySecret: env.FINCODE_API_KEY_SECRET });

  // fromBlock cursor 取得 (KV)、 未 set なら latest - 10 (直近のみ)
  const cursorRaw = await env.FINCODE_STATE.get('cron_cursor:from_block');
  const latestBlock = await publicClient.getBlockNumber();
  // cursor があればそこから、 なければ latest-10 (初回は直近のみ scan して RPC 負荷を抑える)。
  // ただし cursor が古すぎる (長時間 outage 後等) 場合は窓を MAX_SCAN_WINDOW で切る。
  // Base の公開 RPC は eth_getLogs を 2000 block/req に制限するため、 それ未満に収める。
  let fromBlock: bigint;
  if (cursorRaw !== null) {
    const stored = BigInt(cursorRaw);
    fromBlock =
      latestBlock - stored > SETTLEMENT_MAX_SCAN_WINDOW
        ? latestBlock - SETTLEMENT_MAX_SCAN_WINDOW
        : stored;
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
      // winner が operator なら fiat 代理入札のはず。 record 無しは place-bid の record 書込漏れ等の
      // 異常で、 silent skip すると NFT が operator に留まったまま気づけない (Niji 1 で発生)。
      if (winner.toLowerCase() === operatorAddress.toLowerCase()) {
        console.error(
          `[cron] ALERT: nounId=${nounId} winner=operator だが fiat_bid record 無し。 ` +
            `fiat 代理入札の record が欠落し transferFrom 不能。 手動で受取先を特定して転送が必要。`,
        );
      } else {
        console.log(`[cron] nounId=${nounId} no fiat_bid record (crypto bid、 skip)`);
      }
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

    // 2026-07-23 contract upgrade (createBidFor + BidPlacedFor 追加) 以降、 NFT 転送は
    // NijiAuctionHouseV3._settleAuction が自動発火 (auctionStorage.bidder = recipient への
    // nouns.transferFrom)。 cron の Step B = walletClient.writeContract(transferFrom) 経路は撤去、
    // fincode capture (実カード請求) のみ発火。 capture 失敗時は fiat_bid record を failed に落と
    // すが NFT は既に user wallet に届いている (chain settle は独立発火)、 revenue 側 manual 対応。
    console.log(
      `[cron] fiat WON authId=${hit.authId} tokenId=${nounId} recipient=${bidderWallet} (NFT 転送は auction settle 経由で自動)`,
    );
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
    }
  }

  // cursor 更新。 毎回書くと 1 分 cron × 1440 回/日 = KV 無料枠 (1000 write/日) を突破するため
  // (2026-07-22 実測 90% 到達)、 「event を処理した時」 か「未処理でも窓が広がりすぎた時」 に限る。
  // idle 時は SETTLEMENT_CURSOR_ADVANCE block ごと (= 約 10 分ごと) にだけ書いて窓の暴走を防ぐ。
  const shouldPersistCursor = logs.length > 0 || toBlock - fromBlock >= SETTLEMENT_CURSOR_ADVANCE;
  if (shouldPersistCursor) {
    await env.FINCODE_STATE.put('cron_cursor:from_block', (toBlock + 1n).toString());
    console.log(
      `[cron] cursor persisted → ${toBlock + 1n} (logs=${logs.length} window=${toBlock - fromBlock})`,
    );
  } else {
    console.log(`[cron] cursor write skip (idle, window=${toBlock - fromBlock}) — KV write 節約`);
  }
};

/** env → process.env 注入 (FincodeClient / MockFetcher が process.env 経由で config 読む pattern に対応) */
const injectProcessEnv = (env: Env): void => {
  const envMap = {
    FINCODE_API_KEY_SECRET: env.FINCODE_API_KEY_SECRET,
    FINCODE_TEST_ENDPOINT: 'https://api.test.fincode.jp',
    FINCODE_LIVE_ENDPOINT: 'https://api.fincode.jp',
    USE_FINCODE_MOCK: env.USE_FINCODE_MOCK ?? 'false',
    // 未設定時は実 rate 経路 = 誤って mock 金額で与信 / 入札する事故を防ぐ安全側 default
    USE_SPOT_RATE_MOCK: env.USE_SPOT_RATE_MOCK ?? 'false',
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
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // spot rate の単一 source。 mock / 実 rate の切替は env `USE_SPOT_RATE_MOCK` が担い、
    // instance を共有することで 5 秒 cache も spot-rate route と place-bid で共通になる。
    const spotRateFetcher = new SpotRateFetcher();
    const fincodeClient = new KVAwareFincodeClient(
      { apiKeySecret: env.FINCODE_API_KEY_SECRET },
      env.FINCODE_STATE,
    );
    const store = new KVFiatBidStore(env.FINCODE_STATE);
    const captureStore = new KVFincodeCaptureStore(env.FINCODE_STATE);

    const authorizeOptions: Parameters<typeof createAuthorizeFincodeApp>[0] = {
      fincodeClient,
      spotRateFetcher,
      store,
    };
    if (typeof env.TDS2_RET_URL === 'string' && env.TDS2_RET_URL.trim() !== '') {
      authorizeOptions.tds2RetUrl = env.TDS2_RET_URL.trim();
    }
    app.route('/api/v1/fiat-bid', createAuthorizeFincodeApp(authorizeOptions));
    app.route('/api/v1/fiat-bid', createCaptureFincodeApp({ fincodeClient, store: captureStore }));
    // 2026-07-22 追加 = 3DS callback endpoint。 authorize が tds2_ret_url を渡した場合、
    // webapp は認証画面から戻った直後にここを呼ぶ。 これを通さないと与信が確定しない。
    app.route(
      '/api/v1/fiat-bid',
      createThreeDsCallbackFincodeApp({ fincodeClient, store: captureStore }),
    );
    // 2026-07-17 追加 = place-bid endpoint (chain 上代理入札 + KV fiat_bid record 保存)
    app.route('/api/v1/fiat-bid', createPlaceBidHandler(env, spotRateFetcher));
    // 2026-07-21 追加 = spot-rate endpoint (GET /api/v1/spot-rate/eth-jpy)。
    // webapp の useSpotRate が polling して現在 rate と ETH 換算を表示する経路、
    // 未配線だと webapp 側は 404 を受けて rate 表示が空のままになる。
    app.route('/api/v1/spot-rate', createSpotRateApp(spotRateFetcher));

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
