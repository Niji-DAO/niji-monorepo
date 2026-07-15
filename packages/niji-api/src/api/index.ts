import { nijiAuctionHouseAddress, nijiTokenAddress } from '@niji/sdk/actions';
import { and, eq, inArray, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { graphql } from 'ponder';
import { db } from 'ponder:api';
import schema from 'ponder:schema';

import {
  createThreeDsCallbackApp,
  type ThreeDsCallbackStore,
} from '../handlers/fiat-bid/3ds-callback.js';
import { createAuthorizeFincodeApp } from '../handlers/fiat-bid/authorize-fincode.js';
import { createAuthorizeApp, type FiatBidStore } from '../handlers/fiat-bid/authorize.js';
import { createCaptureApp, type CaptureStore } from '../handlers/fiat-bid/capture.js';
import { createPlaceBidApp, type PlaceBidStore } from '../handlers/fiat-bid/place-bid.js';
import { createTopupApp, type TopupStore } from '../handlers/fiat-bid/topup.js';
import { createTransferNftApp, type TransferNftStore } from '../handlers/fiat-bid/transfer-nft.js';
// spot-rate route は Issue #3065 で独立 server (port 42070、 spot-rate-server.ts) に分離、
// Ponder indexer の historical sync 完了待ちで spot-rate が実質未応答になる root cause 解消のため。
// fiat-bid endpoint (authorize / 3ds-callback / place-bid / capture / transfer-nft / topup) は
// Ponder DB (fiat_bid table) 経由で writable なため、 本 file (port 42069) に維持。
import { AuthCleanupQueue } from '../services/authCleanup/index.js';
import {
  BidRelay,
  createBaseSepoliaPublicClient,
  createEnvSigner,
} from '../services/bidRelay/index.js';
import { FincodeClient } from '../services/fincode/client.js';
import { GmoClient } from '../services/gmo/client.js';
import {
  ReauthorizationWorker,
  type FiatBidRecordForReauth,
  type ReauthorizationExecutor,
  type ReauthorizationStore,
} from '../services/reauthorization/index.js';
import {
  TransferRelay,
  createTransferEnvSigner,
  createTransferPublicClient,
} from '../services/settlement/index.js';
import { SpotRateFetcher } from '../services/spotRate/index.js';

/**
 * Ponder 0.12 の api-side `db` は型上 `ReadonlyDrizzle` で insert / update が strip されているが、
 * 実 runtime instance は full Drizzle である (`ReadonlyDrizzle = Omit<Drizzle, "insert" | ...>`)。
 * offchain 書込 (Phase 1 fiat_bid は auction 独立、 HTTP 経由でのみ書かれる) が必要な場合、
 * 型 assertion で write API + update を露出する。
 * Phase 2 で Ponder が offchain table + api write の official 経路を提供した時に置換する。
 */
type WritableDb = {
  insert: <TTable>(table: TTable) => {
    values: (values: unknown) => Promise<unknown>;
  };
  update: <TTable>(table: TTable) => {
    set: (values: unknown) => {
      where: (condition: unknown) => Promise<unknown>;
    };
  };
};
const writableDb = db as unknown as WritableDb;

const app = new Hono();

app.use('/', graphql({ db, schema }));
app.use('/graphql', graphql({ db, schema }));

// Issue #3005 — GET /api/v1/spot-rate/eth-jpy (ETH/JPY spot rate 取得)
// Issue #3065 — 本 route は spot-rate-server.ts (port 42070) に分離済 (Ponder sync 非依存化)、
//               本 file (port 42069) では登録しない。 webapp は VITE_GMO_API_ENDPOINT_SPOT_RATE 経由で 42070 を叩く。

/**
 * Issue #3006 — POST /api/v1/fiat-bid/authorize (与信枠取得)
 * SpotRateFetcher / GmoClient は module-level singleton (cache / connection reuse)。
 * fiat_bid store は Ponder db を wrap した最小 adapter で INSERT のみ実施、
 * 後段 handler (Issue #3007+) が status update する。
 */
const spotRateFetcher = new SpotRateFetcher();
const gmoClient = new GmoClient();
/**
 * Phase 2 fincode byGMO API client (Issue #3115、 GMO PGマルチペイメント → fincode byGMO product 差替)
 * 決済 vendor = GMO Payment Gateway, Inc. 継続、 product だけ差替。 GMO 経路と並列共存で feature flag 経路確保。
 */
const fincodeClient = new FincodeClient();
/**
 * Ponder 0.12 の api-side `db` は ReadonlyDrizzle (insert / update / delete が型 strip 済)。
 * offchain write は `db.sql` (raw drizzle instance、 full Drizzle exposed via Db.sql) 経由で実施する。
 * Ponder 内部 schema は onchain table 扱いだが、 SQL 発行自体は許容される (write 責務は indexing 層と HTTP 層で分担、
 * Phase 1 の fiat_bid は auction event と独立に HTTP 経由でしか書かれない)。
 */
const fiatBidStore: FiatBidStore = {
  insertPending: async record => {
    await writableDb.insert(schema.fiatBid).values({
      authId: record.authId,
      bidderWallet: record.bidderWallet,
      bidderEmail: record.bidderEmail,
      auctionId: record.auctionId,
      jpyAmount: record.jpyAmount,
      ethAmount: record.ethAmount,
      spotRate: record.spotRate,
      spotRateSource: record.spotRateSource,
      status: record.status,
      createdAt: record.createdAt,
    });
  },
};
app.route(
  '/api/v1/fiat-bid',
  createAuthorizeApp({ gmoClient, spotRateFetcher, store: fiatBidStore }),
);

/**
 * Phase 2 fincode byGMO — POST /api/v1/fiat-bid/authorize-fincode (与信枠取得)
 * GMO PG 経路 (authorize.ts) と並列共存、 webapp 側 VITE_USE_FINCODE_UI で経路振り分け。
 * cardToken 引数 = fincode.js iframe tokenize 発行の card_id を格納 (GMO PG 経路の GMO Token 相当)。
 * Issue #3115。
 */
app.route(
  '/api/v1/fiat-bid',
  createAuthorizeFincodeApp({ fincodeClient, spotRateFetcher, store: fiatBidStore }),
);

/**
 * Issue #3007 — POST /api/v1/fiat-bid/3ds-callback (3DS 認証結果 verify + status 遷移)
 * accessPass は fiat_bid record に永続化されていないため、
 * Phase 1 mock 環境では GmoClient.verifyTds2 / cancelAuthorization に accessPass を渡す時に
 * fiat_bid record 由来の value を使う。 実 GMO は entryTran で発行された accessPass を保存する必要があり、
 * 本 handler の store.findPending は accessPass を返す拡張が必要 (Phase 1 では authId と同 value で seed)。
 *
 * Phase 1 = accessPass field は fiat_bid schema に無いため、 mock の nextMockId 経由で決定的に
 * 生成された authId (accessId) に対して accessPass を DI 経由で決めておく設計とする。
 * 実 GMO 切替時 (Phase 3) に fiat_bid schema へ accessPass field 追加 + entryTran 応答保存に切替。
 */
const threeDsCallbackStore: ThreeDsCallbackStore = {
  findPending: async authId => {
    // fiat_bid record を authId で lookup、 accessPass は Phase 1 では authId から派生する mock 実装
    // (実 GMO 切替時に fiat_bid.accessPass field 追加 + entryTran 応答値保存へ移行)
    // NOTE: db.select は ReadonlyDrizzle にあるので read は素直に呼べる
    // Ponder 0.12 の select signature は from(table) 経由
    const rows = await (db
      .select()
      .from(schema.fiatBid)
      .where(eq(schema.fiatBid.authId, authId)) as unknown as Promise<
      Array<{ authId: string; status: string }>
    >);
    const row = rows[0];
    if (!row) return null;
    // Phase 1 mock 環境の accessPass 派生 = authId の mock-access- prefix を mock-pass- 相当に変換、
    // または env で override 可能 (実 GMO 切替時に schema field 追加で置換)
    // mock ID 生成は counter 順で access → pass が交互発行される (nextMockId counter+=1 の連続 2 呼出)、
    // よって accessId が 'mock-access-N' なら accessPass は 'mock-pass-(N+1)' に相当する。
    const accessPass = authId.startsWith('mock-access-')
      ? `mock-pass-${(Number(authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
      : `${authId}-pass`;
    return { authId: row.authId, accessPass, status: row.status };
  },
  updateStatus: async input => {
    await writableDb
      .update(schema.fiatBid)
      .set({ status: input.status })
      .where(eq(schema.fiatBid.authId, input.authId));
  },
};
app.route('/api/v1/fiat-bid', createThreeDsCallbackApp({ gmoClient, store: threeDsCallbackStore }));

/**
 * Issue #3008 — POST /api/v1/fiat-bid/place-bid (運営 EOA 代理 bid tx 発火)
 *
 * fiat_bid.status = "3ds-verified" record を lookup → NijiAuctionHouseV3.createBid tx broadcast →
 * fiat_bid.status = "bid-placed" UPDATE + txHash 返却。
 *
 * revert (BidTooLow / AuctionEnded / gas 高騰 / RPC 障害) 時は GMO alterTran cancel + fiat_bid.status = "cancelled"。
 *
 * 秘密鍵管理 = Phase 1 は env OPERATOR_EOA_PRIVATE_KEY 直、 SignerProvider interface で抽象化 (Phase 3 KMS 移行想定)。
 *
 * NijiAuctionHouseV3 address = Base Sepolia (chainId=84532) は sdk 側 nijiAuctionHouseAddress で 0x0 placeholder、
 * 実 deploy 後は env NIJI_AUCTION_HOUSE_ADDRESS で override 可能。
 */
const operatorPrivateKeyRaw = process.env['OPERATOR_EOA_PRIVATE_KEY'] ?? '';
const baseSepoliaRpcUrl =
  process.env['BASE_SEPOLIA_RPC_URL'] ??
  process.env['PONDER_RPC_URL_84532'] ??
  'https://sepolia.base.org';
const nijiAuctionHouseAddressOverride = process.env['NIJI_AUCTION_HOUSE_ADDRESS'];
const auctionHouseAddress = (nijiAuctionHouseAddressOverride ??
  nijiAuctionHouseAddress[84532]) as `0x${string}`;

/**
 * BidRelay singleton は operatorPrivateKey が env に設定されている時のみ生成する。
 * env 未設定時は place-bid endpoint は 500 応答するが、 module load 時 crash を避ける
 * (test / codegen / typecheck 時に env 不要の設計)。
 */
let placeBidStore: PlaceBidStore | null = null;
let bidRelay: BidRelay | null = null;
const isValidOperatorKey =
  operatorPrivateKeyRaw.length === 66 && operatorPrivateKeyRaw.startsWith('0x');
if (
  isValidOperatorKey &&
  (auctionHouseAddress as string) !== '0x0000000000000000000000000000000000000000'
) {
  const operatorPrivateKey = operatorPrivateKeyRaw as `0x${string}`;
  const signer = createEnvSigner({
    privateKey: operatorPrivateKey,
    rpcUrl: baseSepoliaRpcUrl,
  });
  const publicClient = createBaseSepoliaPublicClient(baseSepoliaRpcUrl);
  bidRelay = new BidRelay({
    signer,
    publicClient,
    auctionHouseAddress,
  });

  placeBidStore = {
    findVerified: async authId => {
      const rows = await (db
        .select()
        .from(schema.fiatBid)
        .where(eq(schema.fiatBid.authId, authId)) as unknown as Promise<
        Array<{
          authId: string;
          status: string;
          ethAmount: bigint;
        }>
      >);
      const row = rows[0];
      if (!row) return null;
      // Phase 1 mock 環境の accessPass 派生 (3ds-callback と同一 logic、 実 GMO 切替時に schema field 追加で置換)
      const accessPass = authId.startsWith('mock-access-')
        ? `mock-pass-${(Number(authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
        : `${authId}-pass`;
      return {
        authId: row.authId,
        status: row.status,
        ethAmount: row.ethAmount,
        accessPass,
      };
    },
    updateStatus: async input => {
      const update: Record<string, unknown> = { status: input.status };
      // txHash 保存 field は Phase 1 schema に無い、 Phase 2 で fiat_bid.bidTxHash 追加時に配線
      // (現状は log / operational trace のみで管理)
      await writableDb
        .update(schema.fiatBid)
        .set(update)
        .where(eq(schema.fiatBid.authId, input.authId));
    },
  };
  app.route('/api/v1/fiat-bid', createPlaceBidApp({ bidRelay, gmoClient, store: placeBidStore }));

  /**
   * Issue #3023 — POST /api/v1/fiat-bid/topup (bid 増額 5 phase sequential)
   *
   * fiat_bid.status = "bid-placed" record を lookup → 新 GMO authorize + BidRelay.placeBid →
   * 旧 authId を AuthCleanupQueue に enqueue → 新 authId で fiat_bid record UPDATE。
   *
   * revert (BidTooLow / AuctionEnded 等) 時は新 auth を GMO alterTran(VOID) cancel、 旧 auth は保持
   * (増額前状態のまま bid-placed で継続、 store は変更しない)。
   *
   * cleanup 経路 = AuthCleanupQueue (5 秒 delay + 1 req/sec rate limit + 3 回 retry、 Issue #3022 経由)。
   * BidRelay / GmoClient / SpotRateFetcher は Issue #3005 / #3006 / #3008 の service を再利用。
   */
  const authCleanupQueue = new AuthCleanupQueue({
    executor: {
      cancelAuthorization: async (authId: string) => {
        // Phase 1 mock 環境の accessPass 派生 (authorize / place-bid と同一 logic、 実 GMO 切替時 schema field で置換)
        const accessPass = authId.startsWith('mock-access-')
          ? `mock-pass-${(Number(authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
          : `${authId}-pass`;
        await gmoClient.cancelAuthorization({ accessId: authId, accessPass });
      },
    },
  });

  const topupStore: TopupStore = {
    findBidPlaced: async authId => {
      const rows = await (db
        .select()
        .from(schema.fiatBid)
        .where(eq(schema.fiatBid.authId, authId)) as unknown as Promise<
        Array<{
          authId: string;
          status: string;
          jpyAmount: number;
          ethAmount: bigint;
          bidderWallet: `0x${string}`;
          bidderEmail: string | null;
          auctionId: bigint;
          createdAt: Date;
        }>
      >);
      const row = rows[0];
      if (!row) return null;
      const accessPass = authId.startsWith('mock-access-')
        ? `mock-pass-${(Number(authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
        : `${authId}-pass`;
      return {
        authId: row.authId,
        status: row.status,
        jpyAmount: row.jpyAmount,
        ethAmount: row.ethAmount,
        bidderWallet: row.bidderWallet,
        bidderEmail: row.bidderEmail,
        auctionId: row.auctionId,
        accessPass,
        createdAt: row.createdAt,
      };
    },
    updateToNewAuth: async input => {
      // 旧 authId (PK) を新 authId に置換 + jpyAmount / ethAmount / spotRate 更新
      // Phase 2 mvp = SQL UPDATE で PK 変更 (Postgres は PK 変更を許容、 参照整合性は fiat_bid 単一 table 内で完結)
      await writableDb
        .update(schema.fiatBid)
        .set({
          authId: input.newAuthId,
          jpyAmount: input.newJpyAmount,
          ethAmount: input.newEthAmount,
          spotRate: input.spotRate,
          spotRateSource: input.spotRateSource,
        })
        .where(eq(schema.fiatBid.authId, input.oldAuthId));
    },
  };

  app.route(
    '/api/v1/fiat-bid',
    createTopupApp({
      bidRelay,
      gmoClient,
      spotRateFetcher,
      cleanupQueue: authCleanupQueue,
      store: topupStore,
    }),
  );
}

/**
 * Issue #3010 — POST /api/v1/fiat-bid/capture + /transfer (落札後 capture + transferFrom)
 *
 * capture — fiat_bid.status = "bid-placed" record を GMO alterTran(SALES) で実売上確定、
 *           status = "captured" + capturedAt UPDATE。 fail 時は運営 alert + status = "cancelled"。
 * transfer — fiat_bid.status = "captured" record に対し 運営 EOA から user wallet に
 *            NijiToken.transferFrom を viem で発火、 status = "transferred" + transferredAt UPDATE。
 *
 * NijiToken address = Base Sepolia は sdk 側 nijiTokenAddress で 0x0 placeholder、
 * 実 deploy 後は env NIJI_TOKEN_ADDRESS で override 可能。
 */
const captureStore: CaptureStore = {
  findBidPlaced: async authId => {
    const rows = await (db
      .select()
      .from(schema.fiatBid)
      .where(eq(schema.fiatBid.authId, authId)) as unknown as Promise<
      Array<{
        authId: string;
        status: string;
        jpyAmount: number;
      }>
    >);
    const row = rows[0];
    if (!row) return null;
    const accessPass = authId.startsWith('mock-access-')
      ? `mock-pass-${(Number(authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
      : `${authId}-pass`;
    return {
      authId: row.authId,
      status: row.status,
      accessPass,
      jpyAmount: row.jpyAmount,
    };
  },
  updateCaptureStatus: async input => {
    const update: Record<string, unknown> = { status: input.status };
    if (input.capturedAt !== undefined) {
      update['capturedAt'] = input.capturedAt;
    }
    await writableDb
      .update(schema.fiatBid)
      .set(update)
      .where(eq(schema.fiatBid.authId, input.authId));
  },
};
app.route('/api/v1/fiat-bid', createCaptureApp({ gmoClient, store: captureStore }));

/**
 * transfer endpoint は operatorPrivateKey + NIJI_TOKEN address が揃っている場合のみ register
 * env 未設定時は module load 時 crash を避け、 endpoint 呼出時に 404 相当となる
 */
const nijiTokenAddressOverride = process.env['NIJI_TOKEN_ADDRESS'];
const tokenAddress = (nijiTokenAddressOverride ?? nijiTokenAddress[84532]) as `0x${string}`;
if (
  isValidOperatorKey &&
  (tokenAddress as string) !== '0x0000000000000000000000000000000000000000'
) {
  const operatorPrivateKey = operatorPrivateKeyRaw as `0x${string}`;
  const transferSigner = createTransferEnvSigner({
    privateKey: operatorPrivateKey,
    rpcUrl: baseSepoliaRpcUrl,
  });
  const transferPublicClient = createTransferPublicClient(baseSepoliaRpcUrl);
  const transferRelay = new TransferRelay({
    signer: transferSigner,
    publicClient: transferPublicClient,
    nijiTokenAddress: tokenAddress,
  });

  const transferStore: TransferNftStore = {
    findCaptured: async authId => {
      const rows = await (db
        .select()
        .from(schema.fiatBid)
        .where(eq(schema.fiatBid.authId, authId)) as unknown as Promise<
        Array<{
          authId: string;
          status: string;
          bidderWallet: `0x${string}`;
          auctionId: bigint;
        }>
      >);
      const row = rows[0];
      if (!row) return null;
      return {
        authId: row.authId,
        status: row.status,
        bidderWallet: row.bidderWallet,
        auctionId: row.auctionId,
      };
    },
    updateTransferStatus: async input => {
      // txHash は Phase 1 schema に無い、 Phase 2 で fiat_bid.transferTxHash 追加時に配線
      await writableDb
        .update(schema.fiatBid)
        .set({
          status: input.status,
          transferredAt: input.transferredAt,
        })
        .where(eq(schema.fiatBid.authId, input.authId));
    },
  };
  app.route('/api/v1/fiat-bid', createTransferNftApp({ transferRelay, store: transferStore }));
}

/**
 * Issue #3024 — 45 日超 fallback ReauthorizationWorker
 *
 * 1h 周期 (env `REAUTHORIZATION_INTERVAL_HOURS` で override 可能) で fiat_bid table を scan、
 * createdAt > 45 日 & status ∈ {pending, 3ds-verified, bid-placed} record を検出 → GMO 再 authorize 発火。
 * 成功時 reauthorizationCount++ + lastReauthorizedAt UPDATE、 失敗時 status=cancelled + 運営 alert + user 通知。
 *
 * env `REAUTHORIZATION_WORKER_ENABLED` truthy 判定 —
 * dev / test / codegen 時に不要な interval 起動を避けるため opt-in 制御。 production では true 必須。
 * mock 完結前提 (USE_GMO_MOCK=true) では cardToken は mock server が受入れる placeholder を使用。
 */
const reauthEnabledRaw = process.env['REAUTHORIZATION_WORKER_ENABLED'] ?? 'false';
const reauthEnabled = ['true', '1', 'yes'].includes(reauthEnabledRaw.trim().toLowerCase());

if (reauthEnabled) {
  const reauthStore: ReauthorizationStore = {
    findEligibleRecords: async input => {
      const rows = await (db
        .select()
        .from(schema.fiatBid)
        .where(
          and(
            lte(schema.fiatBid.createdAt, input.cutoffDate),
            inArray(schema.fiatBid.status, ['pending', '3ds-verified', 'bid-placed']),
          ),
        ) as unknown as Promise<
        Array<{
          authId: string;
          bidderWallet: `0x${string}`;
          bidderEmail: string | null;
          auctionId: bigint;
          jpyAmount: number;
          ethAmount: bigint;
          status: string;
          createdAt: Date;
          reauthorizationCount: number;
        }>
      >);
      return rows.map((row): FiatBidRecordForReauth => {
        // Phase 1/2 mock 環境の accessPass 派生 (authorize / place-bid / topup と同一 logic)
        const accessPass = row.authId.startsWith('mock-access-')
          ? `mock-pass-${(Number(row.authId.replace('mock-access-', '')) + 1).toString().padStart(8, '0')}`
          : `${row.authId}-pass`;
        return {
          authId: row.authId,
          accessPass,
          bidderWallet: row.bidderWallet,
          bidderEmail: row.bidderEmail,
          auctionId: row.auctionId,
          jpyAmount: row.jpyAmount,
          ethAmount: row.ethAmount,
          createdAt: row.createdAt,
          status: row.status,
          reauthorizationCount: row.reauthorizationCount,
        };
      });
    },
    updateAfterReauthSuccess: async input => {
      // primary key (authId) を旧→新 で置換 + reauthorizationCount + lastReauthorizedAt
      await writableDb
        .update(schema.fiatBid)
        .set({
          authId: input.newAuthId,
          reauthorizationCount: input.newReauthorizationCount,
          lastReauthorizedAt: input.lastReauthorizedAt,
        })
        .where(eq(schema.fiatBid.authId, input.oldAuthId));
    },
    updateStatusCancelled: async input => {
      await writableDb
        .update(schema.fiatBid)
        .set({ status: 'cancelled' })
        .where(eq(schema.fiatBid.authId, input.authId));
    },
  };

  const reauthExecutor: ReauthorizationExecutor = {
    reauthorize: async input => {
      // mock 環境ではどの cardToken でも通る、 実 GMO では PG Token を bidder 経由で再取得する必要がある
      // (Phase 4 で bidder 再認証 UI 追加時に PG Token 再取得経路を配線)。
      const cardToken = process.env['GMO_REAUTH_PLACEHOLDER_TOKEN'] ?? 'mock-card-token-reauth';
      const result = await gmoClient.reauthorize({
        oldAccessId: input.oldAuthId,
        oldAccessPass: input.oldAccessPass,
        newOrderId: input.newOrderId,
        jpyAmount: input.jpyAmount,
        cardToken,
      });
      return { authId: result.authId, accessPass: result.accessPass };
    },
  };

  const reauthWorker = new ReauthorizationWorker({
    store: reauthStore,
    executor: reauthExecutor,
  });
  reauthWorker.start();
}

export default app;
