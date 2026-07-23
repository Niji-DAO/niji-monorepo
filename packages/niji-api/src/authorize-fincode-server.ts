/**
 * Fincode authorize independent Hono server (e2e real fincode 経路 verify 用、 port 42071)
 *
 * root cause SSOT — Ponder 0.12 indexer が sync 完了まで hono `context.get('graphql')` 経路の全 route が
 * 実質未応答となる問題 (Issue #3065、 spot-rate-server と同 root cause)。 authorize-fincode handler は
 * FincodeClient (env `FINCODE_API_KEY_SECRET` 経由 real fincode /v1/authorize hit) + SpotRateFetcher +
 * FiatBidStore の 3 依存で完結、 DB access が INSERT のみで参照 (SELECT) なし = in-memory store で
 * 独立 server 化可能。
 *
 * spot-rate-server (port 42070) と同 pattern で expose、 e2e 側は authorize page.route mock を外して
 * real endpoint hit → real fincode /v1/authorize → real 3DS URL 受領経路を verify できる。
 * 本 server は e2e verify 専用、 production 実運用は Ponder 側 (port 42069) が担当継続。
 *
 * SSOT — packages/niji-api/src/spot-rate-server.ts (pattern) + packages/niji-api/src/handlers/fiat-bid/authorize-fincode.ts (handler logic)
 */

import { serve } from '@hono/node-server';
import { config as loadEnvFile } from 'dotenv';
import { Hono } from 'hono';

// .env / .env.local を明示 load (niji-api の ponder.config.ts と同 pattern)、
// FINCODE_API_KEY_SECRET / FINCODE_TENANT_SHOP_ID 等を env に注入する。
// niji-api の dev script (dev:local) は cp .env.local .env で .env を作成する経路のため、
// tsx で本 server を直接叩く場合は .env が最新でない可能性 = .env.local を最優先で load する。
loadEnvFile({ path: '.env.local' });
loadEnvFile();

// 2026-07-17 fix — env `FINCODE_TEST_ENDPOINT` / `FINCODE_LIVE_ENDPOINT` が過去 session の
// local mock 経路 (http://127.0.0.1:2427) を指す場合、 mock server 未起動で connection refused
// → fetch failed になる。 https:// 始まり以外は real fincode endpoint に自動 override する。
const fincodeTestEndpoint = process.env['FINCODE_TEST_ENDPOINT'];
if (typeof fincodeTestEndpoint !== 'string' || !fincodeTestEndpoint.startsWith('https://')) {
  process.env['FINCODE_TEST_ENDPOINT'] = 'https://api.test.fincode.jp';
  console.log(
    `[authorize-fincode-server] FINCODE_TEST_ENDPOINT auto-override (was ${fincodeTestEndpoint ?? '<unset>'}) → https://api.test.fincode.jp`,
  );
}
const fincodeLiveEndpoint = process.env['FINCODE_LIVE_ENDPOINT'];
if (typeof fincodeLiveEndpoint !== 'string' || !fincodeLiveEndpoint.startsWith('https://')) {
  process.env['FINCODE_LIVE_ENDPOINT'] = 'https://api.fincode.jp';
  console.log(
    `[authorize-fincode-server] FINCODE_LIVE_ENDPOINT auto-override (was ${fincodeLiveEndpoint ?? '<unset>'}) → https://api.fincode.jp`,
  );
}
// 2026-07-17 fix — client.ts resolveEndpoint() の USE_FINCODE_MOCK default が 'true' で
// mock mode 発火、 FINCODE_MOCK_ENDPOINT default = http://127.0.0.1:2427 を fetch、 mock server
// 未起動で fail。 本 server は real fincode API hit 目的なので env override で mock 経路無効化する。
if (process.env['USE_FINCODE_MOCK'] === undefined || process.env['USE_FINCODE_MOCK'] === '') {
  process.env['USE_FINCODE_MOCK'] = 'false';
  console.log('[authorize-fincode-server] USE_FINCODE_MOCK auto-override (was <unset>) → false');
}
// debug 用 = apiKey prefix + tenantShopId 存在確認 (masking で secret 露出防止)。
const apiKeyPrefix = (process.env['FINCODE_API_KEY_SECRET'] ?? '').slice(0, 8);
const tenantShopIdLen = (process.env['FINCODE_TENANT_SHOP_ID'] ?? '').length;
console.log(
  `[authorize-fincode-server] fincode env: apiKey.prefix="${apiKeyPrefix}...", tenantShopId.len=${tenantShopIdLen}, USE_FINCODE_MOCK=${process.env['USE_FINCODE_MOCK']}`,
);

import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { createAuthorizeFincodeApp } from './handlers/fiat-bid/authorize-fincode.js';
import { type FiatBidRecord, type FiatBidStore } from './handlers/fiat-bid/authorize.js';
import {
  createCaptureFincodeApp,
  type FincodeCaptureStore,
} from './handlers/fiat-bid/capture-fincode.js';
import { FincodeClient } from './services/fincode/client.js';

import type { FincodeAuthorizationResult } from './services/fincode/types.js';

import { SpotRateFetcher, type SpotRate } from './services/spotRate/index.js';

import { nijiAuctionHouseAbi } from '@niji/sdk/react/auction-house';

/**
 * V3 に追加された createBidFor / BidPlacedFor / grantRelayer の minimal ABI。
 * @niji/sdk/react/auction-house は base-sepolia proxy upgrade (2026-07-23、 tx
 * 0x7528d63ed5e59264279ae6b6b4f1ccbf47a7fac706e90f5488780b7f5a3310d2) 直後で etherscan verify 未完
 * のため wagmi cli 経由の gen file がまだ古い実装 ABI を保持する。 verify + gen 更新までの
 * 暫定として backend 内で minimal ABI を local 定義し writeContract に注入する。
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
  {
    type: 'function',
    name: 'isRelayer',
    stateMutability: 'view',
    inputs: [{ name: 'relayer', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
] as const;

/**
 * in-memory FiatBidStore 実装。 authorize handler は insertPending のみ呼出 = Map で受けて no-op。
 * e2e verify では insert 済 record を後続 handler で lookup しない (real fincode を hit するのみ) ため、
 * 保存内容は debug 用 log 出力に留める。
 */
/**
 * 2026-07-17 拡張 = FiatBidStore + FincodeCaptureStore + Settlement daemon 用 lookup method 群を統合。
 * fincode capture / cancel / transferFrom / auctionSettled 経路の全 store 依存を単一 in-memory class で吸収。
 */
type FiatBidLifecycle =
  | 'pending'
  | 'bid-placed'
  | 'won'
  | 'captured'
  | 'transferred'
  | 'lost'
  | 'cancelled'
  | 'failed';

type FiatBidEnriched = FiatBidRecord & {
  lifecycle: FiatBidLifecycle;
  chainAuctionId?: bigint;
  captureTxId?: string;
  transferTxHash?: string;
  capturedAt?: Date;
};

class InMemoryFiatBidStore implements FiatBidStore, FincodeCaptureStore {
  private readonly records = new Map<string, FiatBidEnriched>();
  private readonly auctionIdToAuthId = new Map<string, string>();

  async insertPending(record: FiatBidRecord): Promise<void> {
    this.records.set(record.authId, { ...record, lifecycle: 'pending' });
    console.log(
      `[store] insertPending authId=${record.authId} bidder=${record.bidderWallet} accessId=${record.accessId ?? 'unset'} orderId=${record.orderId ?? 'unset'}`,
    );
  }

  /** place-bid handler が ethAmount lookup で使う */
  getRecord(authId: string): FiatBidRecord | undefined {
    return this.records.get(authId);
  }

  /** place-bid 発火直後、 authId ↔ chainAuctionId 関連付けを登録する (SettlementDaemon 逆引き用) */
  attachAuctionId(authId: string, chainAuctionId: bigint): void {
    const rec = this.records.get(authId);
    if (rec === undefined) return;
    rec.chainAuctionId = chainAuctionId;
    rec.lifecycle = 'bid-placed';
    this.auctionIdToAuthId.set(chainAuctionId.toString(), authId);
    console.log(`[store] attachAuctionId authId=${authId} chainAuctionId=${chainAuctionId}`);
  }

  /** place-bid 発火時、 user が指定した bidderWallet を record に追記 (transferFrom 送付先) */
  attachBidderWallet(authId: string, bidderWallet: string): void {
    const rec = this.records.get(authId);
    if (rec === undefined) return;
    rec.bidderWallet = bidderWallet as `0x${string}`;
  }

  /** SettlementDaemon が AuctionSettled event 受信時に auctionId → fiat_bid record を lookup */
  findByChainAuctionId(chainAuctionId: bigint): FiatBidEnriched | undefined {
    const authId = this.auctionIdToAuthId.get(chainAuctionId.toString());
    if (authId === undefined) return undefined;
    return this.records.get(authId);
  }

  /** SettlementDaemon が「勝敗判定」 後に lifecycle 更新 */
  markWon(authId: string): void {
    const rec = this.records.get(authId);
    if (rec !== undefined) rec.lifecycle = 'won';
  }
  markLost(authId: string): void {
    const rec = this.records.get(authId);
    if (rec !== undefined) rec.lifecycle = 'lost';
  }
  markTransferred(authId: string, txHash: string): void {
    const rec = this.records.get(authId);
    if (rec !== undefined) {
      rec.lifecycle = 'transferred';
      rec.transferTxHash = txHash;
    }
  }

  // ==== FincodeCaptureStore interface ====
  async findAuthorized(
    authId: string,
  ): Promise<{ authId: string; accessId: string; orderId: string; jpyAmount: number } | null> {
    const rec = this.records.get(authId);
    if (rec === undefined || rec.accessId === undefined || rec.orderId === undefined) return null;
    return {
      authId: rec.authId,
      accessId: rec.accessId,
      orderId: rec.orderId,
      jpyAmount: rec.jpyAmount,
    };
  }

  async updateCaptureStatus(input: {
    authId: string;
    status: 'captured' | 'capture-failed';
    capturedAt?: Date;
    transactionId?: string;
  }): Promise<void> {
    const rec = this.records.get(input.authId);
    if (rec === undefined) return;
    rec.lifecycle = input.status === 'captured' ? 'captured' : 'failed';
    if (input.capturedAt !== undefined) rec.capturedAt = input.capturedAt;
    if (input.transactionId !== undefined) rec.captureTxId = input.transactionId;
    console.log(
      `[store] updateCaptureStatus authId=${input.authId} status=${input.status} txId=${input.transactionId ?? 'none'}`,
    );
  }

  /** debug 用 = 全 record snapshot (test / verify で lifecycle 一覧確認) */
  snapshot(): FiatBidEnriched[] {
    return Array.from(this.records.values());
  }
}

/**
 * FincodeClient を extend override して authorize call 時に orderId + accessId を capture map に保存、
 * 後段 capture-fincode handler の store が同 map から lookup する。 authorize と capture が同 server
 * 内で in-memory state 共有する pattern (backend PR 化まで別 store 統合不要な shortcut)。
 */
class CaptureAwareFincodeClient extends FincodeClient {
  public readonly capturedMap = new Map<
    string,
    { orderId: string; accessId: string; jpyAmount: number }
  >();
  async authorize(input: {
    orderId: string;
    amount: number;
    cardToken: string;
    tds2RetUrl?: string;
  }): Promise<FincodeAuthorizationResult> {
    const result = await super.authorize(input);
    this.capturedMap.set(result.authId, {
      orderId: result.orderId,
      accessId: result.accessId,
      jpyAmount: input.amount,
    });
    console.log(
      `[authorize-fincode-server] captured for capture: authId=${result.authId} orderId=${result.orderId} accessId=${result.accessId}`,
    );
    return result;
  }
}

class InMemoryFincodeCaptureStore implements FincodeCaptureStore {
  constructor(
    private readonly captureMap: Map<
      string,
      { orderId: string; accessId: string; jpyAmount: number }
    >,
  ) {}
  async findAuthorized(authId: string) {
    const entry = this.captureMap.get(authId);
    if (entry === undefined) return null;
    return {
      authId,
      accessId: entry.accessId,
      orderId: entry.orderId,
      jpyAmount: entry.jpyAmount,
    };
  }
  async updateCaptureStatus(input: {
    authId: string;
    status: 'captured' | 'capture-failed';
  }): Promise<void> {
    console.log(
      `[authorize-fincode-server] capture status updated: authId=${input.authId} status=${input.status}`,
    );
  }
}

/**
 * MOCK SpotRateFetcher (e2e verify 用、 GMO Coin / CoinGecko の外部通信を bypass)。
 * env `USE_SPOT_RATE_MOCK=true` + `MOCK_SPOT_RATE_JPY_PER_ETH` で 固定 rate 応答、
 * spot-rate-server と同 mock 値 (500000 JPY/ETH) を default 使用。
 */
class MockSpotRateFetcher extends SpotRateFetcher {
  constructor(private readonly rate: number) {
    super({
      gmoCoinEndpoint: 'http://stub-primary',
      coingeckoEndpoint: 'http://stub-fallback',
    });
  }
  // handler は `getEthJpyRate()` を呼び出す (authorize-fincode.ts:115)、 method name mismatch で
  // override 効かない bug を fix。 併せて旧 name も残置して SpotRateFetcher 側 rename 時の安全側とする。
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

export const createAuthorizeFincodeServerApp = (): Hono => {
  const app = new Hono();
  const mockRate = Number.parseInt(process.env['MOCK_SPOT_RATE_JPY_PER_ETH'] ?? '500000', 10);
  const spotRateFetcher = new MockSpotRateFetcher(Number.isFinite(mockRate) ? mockRate : 500_000);
  const fincodeClient = new CaptureAwareFincodeClient();
  const store = new InMemoryFiatBidStore();
  const captureStore = new InMemoryFincodeCaptureStore(fincodeClient.capturedMap);
  // authorize + capture 両方を同 in-memory state 共有で expose (server 内 map で authId lookup)
  app.route(
    '/api/v1/fiat-bid',
    createAuthorizeFincodeApp({ fincodeClient, spotRateFetcher, store }),
  );
  app.route('/api/v1/fiat-bid', createCaptureFincodeApp({ fincodeClient, store: captureStore }));

  // 2026-07-17 = /api/v1/fiat-bid/place-bid の anvil real chain bid 経路実装。
  // 既存 BidRelay は `chain: baseSepolia` hardcode (chainId 84532) で anvil (chainId 31337) 不一致 fail、
  // shortcut で anvil chain (defineChain 31337) 使った独自 viem walletClient を本 server 内で組立、
  // NijiAuctionHouseV3.createBid tx を運営 EOA (Makefile SSOT の deployer PK) から broadcast する。
  //
  // env `AUCTION_HOUSE_ADDRESS` (anvil deploy log 現状値) + `DEPLOYER_PK` (Makefile SSOT)
  // + `ANVIL_RPC` (Makefile SSOT) の 3 環境変数 override 可能、 未設定なら default。
  const auctionHouseAddress = (process.env['AUCTION_HOUSE_ADDRESS'] ??
    '0x1Dbbf529D78d6507B0dd71F6c02f41138d828990') as Address;
  const deployerPk = (process.env['DEPLOYER_PK'] ??
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as Hex;
  const anvilRpcUrl = process.env['ANVIL_RPC'] ?? 'http://127.0.0.1:8547';
  const anvilChain = defineChain({
    id: 31337,
    name: 'Anvil',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: [anvilRpcUrl] } },
  });
  const deployerAccount = privateKeyToAccount(deployerPk);
  const bidPublicClient = createPublicClient({ chain: anvilChain, transport: http(anvilRpcUrl) });
  const bidWalletClient = createWalletClient({
    chain: anvilChain,
    account: deployerAccount,
    transport: http(anvilRpcUrl),
  });
  console.log(
    `[authorize-fincode-server] anvil BidRelay init: auctionHouse=${auctionHouseAddress} rpc=${anvilRpcUrl} deployer=${deployerAccount.address}`,
  );

  const placeBidApp = new Hono();
  placeBidApp.post('/place-bid', async c => {
    const raw = await c.req.json().catch(() => ({}));
    const authId = (raw as { authId?: string }).authId ?? 'unknown-auth-id';
    const bidderWallet = (raw as { bidderWallet?: string }).bidderWallet as Address | undefined;

    // ethAmount lookup = in-memory store から (authorize で保存済)、 無ければ env fallback
    const storedRecord = store.getRecord?.(authId);
    const ethAmountFromStore = storedRecord?.ethAmount;
    const ethAmountEnv = process.env['MOCK_BID_ETH_WEI'] ?? '10000000000000000'; // 0.01 ETH default
    const ethAmount = ethAmountFromStore ?? BigInt(ethAmountEnv);

    // 2026-07-17 本番想定 pattern = chain 上 bidder は常に運営 EOA (deployer)、
    // fiat_bid record に bidderWallet を保存して SettlementDaemon が capture 成功後に
    // NijiToken.transferFrom(運営 EOA, bidderWallet, tokenId) で NFT を実 user wallet に送付する。
    // impersonation 経路は revert (本番 chain で使えず fiat_bid pattern と乖離するため)。

    // fiat_bid record に bidderWallet を追加保存 (SettlementDaemon の transferFrom 経路で使用)
    if (bidderWallet !== undefined) {
      store.attachBidderWallet?.(authId, bidderWallet);
    }

    try {
      // 現在の auction ID を chain から readContract 経由取得
      const auction = (await bidPublicClient.readContract({
        address: auctionHouseAddress,
        abi: nijiAuctionHouseAbi,
        functionName: 'auction',
      })) as { nounId: bigint };
      const auctionId = auction.nounId;

      // NijiAuctionHouseV3.createBidFor(uint256, address) を運営 EOA (relayer) から broadcast、
      // value = ethAmount、 recipient = bidderWallet (user 接続 wallet)。
      // これで auctionStorage.bidder = user wallet に set され、 落札時 settle 経路で
      // NijiToken.transferFrom(auctionHouse, user wallet, tokenId) が自動発火。
      // 旧 createBid 経路 + SettlementDaemon の transferFrom (2 段構造) は撤去、 contract 側の
      // createBidFor + settle だけで完結する。
      // bidderWallet が undefined / 空文字なら backend 400、 zero-address bid 経路を封じる。
      if (bidderWallet === undefined || bidderWallet.length === 0) {
        return c.json(
          {
            authId,
            status: 'cancelled',
            txHash: null,
            message: 'bidderWallet is required (webapp から接続 wallet 未取得)',
          },
          400,
        );
      }
      const txHash = await bidWalletClient.writeContract({
        address: auctionHouseAddress,
        abi: nijiAuctionHouseV3ExtraAbi,
        functionName: 'createBidFor',
        args: [auctionId, bidderWallet],
        value: ethAmount,
      });

      // auctionId → authId 逆引き map に登録 (SettlementDaemon が AuctionSettled event で fiat_bid record を lookup)
      store.attachAuctionId?.(authId, auctionId);

      console.log(
        `[authorize-fincode-server] place-bid REAL (createBidFor): authId=${authId} auctionId=${auctionId} ethAmount=${ethAmount} relayer=${deployerAccount.address} recipient=${bidderWallet} txHash=${txHash}`,
      );
      return c.json(
        {
          authId,
          status: 'bid-placed',
          txHash,
          message: `createBidFor 経路成功 (relayer=${deployerAccount.address} recipient=${bidderWallet})`,
        },
        200,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[authorize-fincode-server] place-bid FAIL: authId=${authId} message="${message}"`,
      );
      return c.json(
        {
          authId,
          status: 'cancelled',
          txHash: null,
          message: `bid tx broadcast 失敗: ${message}`,
        },
        200,
      );
    }
  });
  app.route('/api/v1/fiat-bid', placeBidApp);

  // 2026-07-17 debug = fincode server side payment status 取得 (external verify で real API 状態確認)
  app.get('/debug/fincode-payment/:orderId', async c => {
    const orderId = c.req.param('orderId');
    const apiKey = process.env['FINCODE_API_KEY_SECRET'] ?? '';
    const endpoint = process.env['FINCODE_TEST_ENDPOINT'] ?? 'https://api.test.fincode.jp';
    const url = `${endpoint}/v1/payments/${encodeURIComponent(orderId)}?pay_type=Card`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const body = await res.json();
      return c.json({ ok: res.ok, status: res.status, body }, 200);
    } catch (err) {
      return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
    }
  });

  // 2026-07-17 debug endpoint = store snapshot 出力 (e2e verify で lifecycle 状態確認用)
  app.get('/debug/store', c => {
    const snap = store.snapshot();
    const serialized = snap.map(r => ({
      authId: r.authId,
      bidderWallet: r.bidderWallet,
      auctionId: r.auctionId.toString(),
      chainAuctionId: r.chainAuctionId?.toString() ?? null,
      jpyAmount: r.jpyAmount,
      ethAmount: r.ethAmount.toString(),
      lifecycle: r.lifecycle,
      accessId: r.accessId ?? null,
      orderId: r.orderId ?? null,
      captureTxId: r.captureTxId ?? null,
      transferTxHash: r.transferTxHash ?? null,
      capturedAt: r.capturedAt?.toISOString() ?? null,
    }));
    return c.json({ count: snap.length, records: serialized }, 200);
  });

  // 2026-07-17 = SettlementDaemon 起動 (AuctionSettled watcher)
  // NijiToken address = deploy log 現状値、 env NIJI_TOKEN_ADDRESS で override 可能。
  const nijiTokenAddress = (process.env['NIJI_TOKEN_ADDRESS'] ??
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9') as Address;
  startSettlementDaemon({
    store,
    fincodeClient,
    publicClient: bidPublicClient,
    walletClient: bidWalletClient,
    operatorAddress: deployerAccount.address,
    auctionHouseAddress,
    nijiTokenAddress,
  });

  return app;
};

/**
 * 2026-07-17 = SettlementDaemon = AuctionSettled event を watch し、 fiat_bid record と突合して
 * 勝敗判定 → 勝てば capture + transferFrom / 負ければ cancel を発火する本番想定 flow の中核。
 *
 * flow —
 * (1) NijiAuctionHouseV3.AuctionSettled(nounId, winner, amount) を viem watchContractEvent で監視
 * (2) event 受信時 nounId で fiat_bid store を lookup、 該当 record なければ crypto bid = skip
 * (3) winner == operator EOA (deployer) なら「fiat 勝ち」 → fincode capture + NijiToken.transferFrom
 * (4) winner != operator EOA なら「fiat 負け」 → fincode cancel (auth 解放)
 */
export const startSettlementDaemon = (options: {
  store: InMemoryFiatBidStore;
  fincodeClient: FincodeClient;
  publicClient: ReturnType<typeof createPublicClient>;
  walletClient: ReturnType<typeof createWalletClient>;
  operatorAddress: Address;
  auctionHouseAddress: Address;
  nijiTokenAddress: Address;
}): (() => void) => {
  // walletClient / nijiTokenAddress は Step B (backend transferFrom) 撤去に伴い未使用化。
  // options interface からは互換性のため残す、 destructure しないで options.X 直参照 or 非参照。
  const { store, fincodeClient, publicClient, operatorAddress, auctionHouseAddress } = options;
  void options.walletClient;
  void options.nijiTokenAddress;

  console.log(
    `[settlement-daemon] watching AuctionSettled on ${auctionHouseAddress}, operator=${operatorAddress} (transferFrom は auction settle 経由で自動発火、 backend からは非発火)`,
  );

  const unwatch = publicClient.watchContractEvent({
    address: auctionHouseAddress,
    abi: nijiAuctionHouseAbi,
    eventName: 'AuctionSettled',
    onLogs: async logs => {
      for (const log of logs) {
        const args = (
          log as unknown as { args: { nounId: bigint; winner: Address; amount: bigint } }
        ).args;
        const { nounId, winner, amount } = args;
        console.log(
          `[settlement-daemon] AuctionSettled: nounId=${nounId} winner=${winner} amount=${amount}`,
        );

        const rec = store.findByChainAuctionId(nounId);
        if (rec === undefined) {
          console.log(
            `[settlement-daemon] nounId=${nounId} no fiat_bid record (crypto bid、 skip)`,
          );
          continue;
        }

        const isFiatWin = winner.toLowerCase() === operatorAddress.toLowerCase();
        if (!isFiatWin) {
          // 敗北 → fincode cancel で auth 解放
          console.log(
            `[settlement-daemon] fiat LOST: authId=${rec.authId} winner=${winner} (operator=${operatorAddress})`,
          );
          store.markLost(rec.authId);
          if (rec.accessId !== undefined && rec.orderId !== undefined) {
            try {
              await fincodeClient.cancelPayment(rec.orderId, rec.accessId);
              // lifecycle は markLost 済 (lost) で保持、 updateCaptureStatus は呼ばない
              // (呼ぶと lifecycle=failed に上書きされる bug 回避)
              console.log(
                `[settlement-daemon] fincode cancel OK: authId=${rec.authId} orderId=${rec.orderId}`,
              );
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error(
                `[settlement-daemon] fincode cancel FAIL: authId=${rec.authId} message="${message}"`,
              );
            }
          }
          continue;
        }

        // 勝利 → fincode capture (実カード請求) のみ発火。
        // 2026-07-23 contract upgrade (createBidFor + BidPlacedFor 追加) 以降、 NFT 転送は
        // NijiAuctionHouseV3._settleAuction が nouns.transferFrom(auctionHouse, recipient, tokenId)
        // として自動発火する (recipient = user wallet を auctionStorage.bidder に set 済のため)。
        // 旧 Step B = walletClient.writeContract(transferFrom) 経路は撤去。
        console.log(
          `[settlement-daemon] fiat WON: authId=${rec.authId} tokenId=${nounId} recipient=${rec.bidderWallet} (NFT 転送は auction settle 経由で自動)`,
        );
        store.markWon(rec.authId);

        // fincode capture (実カード請求)。 capture 失敗時は fiat_bid record を failed に落とすが
        // NFT は既に user wallet に届いている (chain settle は独立発火のため)。 revenue 側の
        // manual 対応が要る。
        if (rec.accessId === undefined || rec.orderId === undefined) {
          console.error(
            `[settlement-daemon] capture SKIP: authId=${rec.authId} accessId/orderId 欠落`,
          );
          continue;
        }
        try {
          const captureResult = await fincodeClient.capturePayment(rec.orderId, rec.accessId);
          const transactionId = captureResult.transaction_id ?? '';
          await store.updateCaptureStatus({
            authId: rec.authId,
            status: 'captured',
            capturedAt: new Date(),
            transactionId,
          });
          console.log(
            `[settlement-daemon] fincode capture OK: authId=${rec.authId} txId=${transactionId}`,
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(
            `[settlement-daemon] fincode capture FAIL: authId=${rec.authId} message="${message}"`,
          );
        }
      }
    },
    onError: err => {
      console.error(`[settlement-daemon] watch error: ${err.message}`);
    },
  });

  return unwatch;
};

export const startAuthorizeFincodeServer = (): { port: number } => {
  const port = Number.parseInt(process.env['NIJI_AUTHORIZE_FINCODE_API_PORT'] ?? '42071', 10);
  const resolvedPort = Number.isFinite(port) && port > 0 ? port : 42071;
  const app = createAuthorizeFincodeServerApp();
  serve({ fetch: app.fetch, port: resolvedPort }, info => {
    console.log(`[authorize-fincode-server] listening on http://127.0.0.1:${info.port}`);
  });
  return { port: resolvedPort };
};

const isEntrypoint = (): boolean => {
  const argv1 = process.argv[1];
  if (argv1 === undefined) return false;
  const normalizedArgv = argv1.replace(/\.js$/, '.ts');
  return import.meta.url === `file://${argv1}` || import.meta.url === `file://${normalizedArgv}`;
};

if (isEntrypoint()) {
  startAuthorizeFincodeServer();
}
