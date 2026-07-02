import { index, onchainEnum, onchainTable, primaryKey, relations } from 'ponder';

export const noun = onchainTable('nouns', t => ({
  id: t.bigint().primaryKey(),
  head: t.integer().notNull(),
  body: t.integer().notNull(),
  accessory: t.integer().notNull(),
  background: t.integer().notNull(),
  createdAt: t.timestamp().notNull(),
  createdAtBlock: t.bigint().notNull(),
  createdAtTransaction: t.text().notNull(),
}));

export const nounRelations = relations(noun, ({ one }) => ({
  auction: one(auction, {
    fields: [noun.id],
    references: [auction.nounId],
  }),
}));

export const proposal = onchainTable('proposal', t => ({
  id: t.bigint().primaryKey(),
  proposer: t.hex().notNull(),
  description: t.text().notNull(),
  createdAt: t.timestamp().notNull(),
  createdAtBlock: t.bigint().notNull(),
  createdAtTransaction: t.text().notNull(),
}));

export const proposalRelations = relations(proposal, ({ many }) => ({
  transactions: many(transaction),
  streams: many(stream),
}));

export const transaction = onchainTable(
  'transaction',
  t => ({
    index: t.integer(),
    proposalId: t.bigint().notNull(),
    target: t.hex().notNull(),
    value: t.bigint().notNull(),
    signature: t.text().notNull(),
    calldata: t.hex().notNull(),
  }),
  t => ({
    primaryKey: primaryKey({ columns: [t.index, t.proposalId] }),
  }),
);

export const transactionRelations = relations(transaction, ({ one }) => ({
  proposal: one(proposal, {
    fields: [transaction.proposalId],
    references: [proposal.id],
  }),
}));

export const auction = onchainTable('nounsAuctionHouseV2', t => ({
  nounId: t.bigint().primaryKey(),
  startTime: t.timestamp().notNull(),
  endTime: t.timestamp().notNull(),
  createdAt: t.timestamp().notNull(),
  createdAtBlock: t.bigint().notNull(),
  createdAtTransaction: t.text().notNull(),
}));

export const auctionRelations = relations(auction, ({ one, many }) => ({
  noun: one(noun, {
    fields: [auction.nounId],
    references: [noun.id],
  }),
  bids: many(bid),
}));

export const bid = onchainTable(
  'bid',
  t => ({
    nounId: t.bigint().notNull(),
    value: t.bigint().notNull(),
    bidder: t.hex().notNull(),
    clientId: t.integer(),
    createdAt: t.timestamp().notNull(),
    createdAtBlock: t.bigint().notNull(),
    createdAtTransaction: t.text().notNull(),
  }),
  t => ({
    primaryKey: primaryKey({ columns: [t.nounId, t.value] }),
  }),
);

export const bidRelations = relations(bid, ({ one }) => ({
  auction: one(auction, {
    fields: [bid.nounId],
    references: [auction.nounId],
  }),
}));

const streamStatusValues = ['active', 'cancelled', 'concluded'] as const;
export type StreamStatus = (typeof streamStatusValues)[number];
export const streamStatus = onchainEnum('streamStatus', streamStatusValues);

export const stream = onchainTable(
  'stream',
  t => ({
    proposalId: t.bigint(),
    streamAddress: t.hex().primaryKey(),
    status: streamStatus().notNull(),
    creator: t.hex().notNull(),
    payer: t.hex().notNull(),
    recipient: t.hex().notNull(),
    tokenAmount: t.bigint().notNull(),
    withdrawnAmount: t.bigint().notNull(),
    tokenAddress: t.hex().notNull(),
    startTime: t.timestamp().notNull(),
    stopTime: t.timestamp().notNull(),
    createdAt: t.timestamp().notNull(),
    createdAtBlock: t.bigint().notNull(),
    createdAtTransaction: t.text().notNull(),
  }),
  t => ({
    createdAtBlockIndex: index().on(t.createdAtBlock),
  }),
);

export const streamRelations = relations(stream, ({ one }) => ({
  proposal: one(proposal, {
    fields: [stream.proposalId],
    references: [proposal.id],
  }),
}));

/**
 * fiat_bid status enum (Issue #3006、 GMO 与信枠 hold → capture → transferFrom flow の進行状態)
 * - pending        ... authorize 成功、 3DS 認証待ち
 * - 3ds-verified   ... 3DS 認証完了、 bid tx 発火待ち (Issue #3007 で更新)
 * - bid-placed     ... bid tx broadcast 成功 (Issue #3008 で更新)
 * - captured       ... GMO SALES capture 成功 (Issue #3010 で更新)
 * - transferred    ... NFT transferFrom 完了 (Issue #3010 で更新)
 * - cancelled      ... 敗札 / user cancel / capture fail 等で cancel
 */
const fiatBidStatusValues = [
  'pending',
  '3ds-verified',
  'bid-placed',
  'captured',
  'transferred',
  'cancelled',
] as const;
export type FiatBidStatus = (typeof fiatBidStatusValues)[number];
export const fiatBidStatus = onchainEnum('fiatBidStatus', fiatBidStatusValues);

export const fiatBid = onchainTable('fiat_bid', t => ({
  /** GMO auth ID (accessId、 client.authorize が返す authId と一致) */
  authId: t.text().primaryKey(),
  /** bidder wallet address (代理 bid 発火時の代理先) */
  bidderWallet: t.hex().notNull(),
  /** bidder email (nullable、 落札通知送信用、 Issue #3013 で使う) */
  bidderEmail: t.text(),
  /** 対象 auction (Noun ID) */
  auctionId: t.bigint().notNull(),
  /** authorize 時の JPY 額 (円単位) */
  jpyAmount: t.integer().notNull(),
  /** JPY → ETH 換算後の ETH 額 (wei 単位、 bigint) */
  ethAmount: t.bigint().notNull(),
  /** 換算に使った spot rate (JPY per 1 ETH、 記録用) */
  spotRate: t.integer().notNull(),
  /** spot rate の取得元 (gmo-coin / coingecko) */
  spotRateSource: t.text().notNull(),
  /** 進行状態 */
  status: fiatBidStatus().notNull(),
  /** authorize 成功時刻 */
  createdAt: t.timestamp().notNull(),
  /** GMO capture 成功時刻 (nullable、 Issue #3010 で埋める) */
  capturedAt: t.timestamp(),
  /** NFT transferFrom 成功時刻 (nullable、 Issue #3010 で埋める) */
  transferredAt: t.timestamp(),
}));
