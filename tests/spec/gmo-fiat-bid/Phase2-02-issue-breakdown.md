# Phase 2 Issue Breakdown — 5 Issue 分割案

## 分割方針

rules/dev-flow.md § Issue 粒度 (1 Issue = 1 PR = 1 branch、 1 PR 300 行目安) に整合させるため、 Phase 2 全体 (推定 1000-1500 行) を 5 Issue に分割。 各 Issue は独立実装可能 + 依存関係を明示。

## Issue 一覧

### Issue P2-1 — Ponder schema 拡張 + async cleanup queue (backend)

- スコープ — packages/niji-api の ponder.schema.ts に reauthorizationCount / lastReauthorizedAt を fiat_bid table に追加、 src/services/authCleanup/index.ts に AuthCleanupQueue class を Write (5 秒 delay + 1 req/sec rate limit + 3 回 retry で GMO alterTran VOID)
- AC — pending 状態の旧 authorization を 5 秒後 queue enqueue → 1 req/sec 順次実行 → 3 回 retry で fail 通知
- 依存 — なし (Phase 2 base infra)
- 推定 — 200-300 行、 8-10 時間

### Issue P2-2 — bid 増額 topup endpoint (backend)

- スコープ — packages/niji-api/src/handlers/fiat-bid/topup.ts に hono handler + POST /api/v1/fiat-bid/topup、 pre-flight で GMO 新 auth + AuthCleanupQueue enqueue + BidRelay 再利用で chain tx 発火
- AC — 増額 bid 額を受付、 pre-flight 新 auth + tx broadcast + 旧 auth cleanup enqueue まで完走
- 依存 — Issue P2-1 (AuthCleanupQueue)
- 推定 — 250-350 行、 10-14 時間

### Issue P2-3 — 45 日超 fallback cron worker (backend)

- スコープ — packages/niji-api/src/services/reauthorization/index.ts に ReauthorizationWorker class、 1h 周期で fiat_bid.createdAt から 45 日超の pending/3ds-verified/bid-placed record を検出 → GMO 再 authorization API 発火 + reauthorizationCount + lastReauthorizedAt UPDATE
- AC — 45 日超 record を 1h ごと検出 + 再 authorization 発火、 失敗時 fiat_bid.status = cancelled + user 通知 email
- 依存 — Issue P2-1 (schema 拡張)
- 推定 — 200-250 行、 8-10 時間

### Issue P2-4 — 増額 bid UI (webapp)

- スコープ — packages/niji-webapp/src/components/FiatBidModal/index.tsx に「増額 bid」 branch 追加 (既存 bid record 存在時の UI 差分)、 useFiatBid hook で topup endpoint 呼出 + 5 phase state 管理、 client-side validation (増額のみ / 100 万円上限)
- AC — 増額 bid button 表示条件 + modal 開閉 + 5 phase stepper + validation エラー表示
- 依存 — Issue P2-2 (topup endpoint)
- 推定 — 200-300 行、 8-12 時間

### Issue P2-5 — Playwright e2e + operations runbook 更新

- スコープ — packages/niji-webapp/tests/e2e/fiat-bid-topup.spec.ts に増額 bid golden path spec、 docs/operations/gmo-fiat-bid.md に bid 増額 flow + 45 日超対応手順 追記
- AC — e2e で「Phase 1 bid → 他 bidder 上乗せ → 増額 bid → 落札 → capture → transferFrom」 golden path 1 spec pass、 runbook に 2 手順追加
- 依存 — Issue P2-3, P2-4
- 推定 — 150-200 行、 6-8 時間

## 依存関係 graph

```
Issue P2-1 (schema + AuthCleanupQueue)
├─ Issue P2-2 (topup endpoint)
│   └─ Issue P2-4 (UI)
│       └─ Issue P2-5 (e2e + runbook)
└─ Issue P2-3 (45 日超 cron)
    └─ Issue P2-5 (e2e + runbook)
```

## 推定合計

- 実装行数 = 1000-1500 行
- 開発時間 = 40-54 時間 (1-2 週間、 1 人 fulltime 換算)
- Issue 数 = 5 (grilling 想定の 4-5 の上限に着地)

## GitHub Issue 起票

Linear free issue limit で GitHub 単一経路 (Phase 1 と同じ)。 label = `phase-2-gmo-fiat-bid` を作成、 全 Issue に付与。 依存関係は body 内 「Blocked by #NNNN」 で明記。
