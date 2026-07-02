import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { graphql } from 'ponder';
import { db } from 'ponder:api';
import schema from 'ponder:schema';

import {
  createThreeDsCallbackApp,
  type ThreeDsCallbackStore,
} from '../handlers/fiat-bid/3ds-callback.js';
import { createAuthorizeApp, type FiatBidStore } from '../handlers/fiat-bid/authorize.js';
import { createSpotRateApp } from '../handlers/spot-rate.js';
import { GmoClient } from '../services/gmo/client.js';
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
app.route('/api/v1/spot-rate', createSpotRateApp());

/**
 * Issue #3006 — POST /api/v1/fiat-bid/authorize (与信枠取得)
 * SpotRateFetcher / GmoClient は module-level singleton (cache / connection reuse)。
 * fiat_bid store は Ponder db を wrap した最小 adapter で INSERT のみ実施、
 * 後段 handler (Issue #3007+) が status update する。
 */
const spotRateFetcher = new SpotRateFetcher();
const gmoClient = new GmoClient();
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

export default app;
