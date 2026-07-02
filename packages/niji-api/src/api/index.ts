import { Hono } from 'hono';
import { graphql } from 'ponder';
import { db } from 'ponder:api';
import schema from 'ponder:schema';

import { createAuthorizeApp, type FiatBidStore } from '../handlers/fiat-bid/authorize.js';
import { createSpotRateApp } from '../handlers/spot-rate.js';
import { GmoClient } from '../services/gmo/client.js';
import { SpotRateFetcher } from '../services/spotRate/index.js';

/**
 * Ponder 0.12 の api-side `db` は型上 `ReadonlyDrizzle` で insert が strip されているが、
 * 実 runtime instance は full Drizzle である (`ReadonlyDrizzle = Omit<Drizzle, "insert" | ...>`)。
 * offchain 書込 (Phase 1 fiat_bid は auction 独立、 HTTP 経由でのみ書かれる) が必要な場合、
 * 型 assertion で write API を露出する。
 * Phase 2 で Ponder が offchain table + api write の official 経路を提供した時に置換する。
 */
type WritableDb = {
  insert: <TTable>(table: TTable) => {
    values: (values: unknown) => Promise<unknown>;
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

export default app;
