/**
 * Spot rate independent Hono server (Issue #3065、 Plan A、 port 42070)
 *
 * root cause SSOT — Ponder 0.12 indexer が Base Sepolia の historical sync (block 数万件、 10-30 秒 -
 * 数分) を完了するまで hono `context.get('graphql')` 経路の全 route が実質未応答となる。
 * spot-rate endpoint は event data に依存せず GMO / CoinGecko 外部 API + in-memory cache のみで
 * 完結するため、 Ponder 非依存の独立 server で expose すれば sync 状態と無関係に 200 応答できる。
 *
 * PGlite 制約 (Ponder が sync 完了まで database schema を確定させない = topup / capture 等の
 * DB access 経路は独立 server から呼べない) のため、 本 server は spot-rate 単独。
 * fiat-bid endpoint 全体 (authorize / 3ds-callback / place-bid / capture / transfer-nft / topup) は
 * 従来通り Ponder 側 (port 42069) に維持する。 dev 実運用では auction settle event 後にのみ
 * fiat bid の実 flow が発火するため、 Ponder sync 完了 (10-30 秒) が起点となり実用範囲。
 *
 * Plan B (全 endpoint 分離) は Postgres 移行 + Docker 依存増加が発生するため回避、
 * root cause である spot-rate 分離のみで user 実機の「クルクル継続」 症状を解消する。
 *
 * SSOT — packages/niji-api/README (Issue #3065 追記予定) + docs/operations/gmo-fiat-bid.md § port 分離 architecture
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { createSpotRateApp } from './handlers/spot-rate.js';

/**
 * spot rate 独立 server の app instance を生成する factory。
 * 本 factory を export することで integration test (spot-rate-server.test.ts) から
 * server 起動なしで route の存在確認ができる (hono `app.request()` 経路)。
 */
export const createSpotRateServerApp = (): Hono => {
  const app = new Hono();
  app.route('/api/v1/spot-rate', createSpotRateApp());
  return app;
};

/**
 * server 起動 entrypoint。 `pnpm dev:spot-rate` (tsx watch) 経由で invoke される。
 *
 * port は env `NIJI_SPOT_RATE_API_PORT` で override 可能 (default = 42070)、
 * Ponder (default 42069) と衝突しない番号に固定する。 dev では localhost 直接 listen で十分、
 * 本番切替時は reverse proxy 経由で公開する想定。
 *
 * import.meta.url === entrypoint 判定で test import 時の副作用 (server listen) を回避する。
 */
export const startSpotRateServer = (): { port: number } => {
  const port = Number.parseInt(process.env['NIJI_SPOT_RATE_API_PORT'] ?? '42070', 10);
  const resolvedPort = Number.isFinite(port) && port > 0 ? port : 42070;
  const app = createSpotRateServerApp();
  serve({ fetch: app.fetch, port: resolvedPort }, info => {
    console.log(`[spot-rate-server] listening on http://127.0.0.1:${info.port}`);
  });
  return { port: resolvedPort };
};

// entrypoint 判定 = tsx / node で本 file を直接実行した時のみ server 起動
// test import 時は listen しない (副作用回避)
const isEntrypoint = (): boolean => {
  const argv1 = process.argv[1];
  if (argv1 === undefined) return false;
  // import.meta.url = file:///.../spot-rate-server.ts
  // argv[1] = /.../spot-rate-server.ts or .js (tsx compile 後)
  const normalizedArgv = argv1.replace(/\.js$/, '.ts');
  return import.meta.url === `file://${argv1}` || import.meta.url === `file://${normalizedArgv}`;
};

if (isEntrypoint()) {
  startSpotRateServer();
}
