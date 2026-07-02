# Phase 2 Impact Analysis — 影響範囲と grep ベース列挙

## 影響範囲 summary

| package | 変更種別 | 主な変更内容 | 推定行数 |
|---|---|---|---|
| niji-webapp | 拡張 | FiatBidModal に「増額 bid」 branch + useFiatBid 拡張 + auctionAtom 追加 | 300-450 行 |
| niji-api | 拡張 + 新規 | topup endpoint + AuthCleanupQueue + ReauthorizationWorker + schema 拡張 | 700-900 行 |
| niji-contracts | 完全無改修 | grilling 確定、 一切触らない | 0 行 |
| niji-subgraph | 完全無改修 | Phase 3 まで fiat 別 track 実装しない | 0 行 |
| docs | 拡張 | operations runbook 追記 | 50-100 行 |
| tests | 新規 | Playwright e2e 増額 bid golden path | 100-200 行 |

## grep ベース列挙

### niji-webapp 側の既存 file (触る予定)

- `packages/niji-webapp/src/components/FiatBidModal/index.tsx` — 既存 bid record 存在時の「増額 bid」 branch 追加
- `packages/niji-webapp/src/components/FiatBidModal/index.test.tsx` — 増額 bid case 追加
- `packages/niji-webapp/src/hooks/useFiatBid.ts` — topup endpoint 呼出 + 5 phase state 管理
- `packages/niji-webapp/src/state/atoms/auctionAtom.ts` — 増額 bid state 追加

### niji-webapp 側の新規 file

- `packages/niji-webapp/tests/e2e/fiat-bid-topup.spec.ts` (100-200 行、 Playwright golden path)

### niji-api 側の既存 file (触る予定)

- `packages/niji-api/ponder.schema.ts` — fiat_bid table に reauthorizationCount / lastReauthorizedAt 追加
- `packages/niji-api/src/api/index.ts` — topup route 追加 + cron worker 起動
- `packages/niji-api/src/services/bidRelay/index.ts` — 増額 bid の tx 発火再利用 (interface 拡張不要)
- `packages/niji-api/src/services/gmo/client.ts` — 再 authorization API method 追加 (verifyTds2 / alterTran と同じ pattern)

### niji-api 側の新規 file

- `packages/niji-api/src/handlers/fiat-bid/topup.ts` (150-200 行、 hono handler)
- `packages/niji-api/src/handlers/fiat-bid/topup.test.ts` (150-200 行、 behavior test 3 case)
- `packages/niji-api/src/services/authCleanup/index.ts` (150-200 行、 queue + rate limit + retry)
- `packages/niji-api/src/services/authCleanup/index.test.ts` (100-150 行、 behavior test)
- `packages/niji-api/src/services/reauthorization/index.ts` (150-200 行、 cron worker)
- `packages/niji-api/src/services/reauthorization/index.test.ts` (100-150 行、 behavior test)

### niji-api 側の設定変更

- `packages/niji-api/.env.example` — REAUTHORIZATION_INTERVAL_HOURS (default 1) 追加

### docs / operations

- `docs/operations/gmo-fiat-bid.md` — bid 増額 flow (5 phase の詳細) + 45 日超対応手順 追記 (50-100 行)

## 触らないファイル (negative scope)

- `packages/niji-contracts/**` — grilling 確定、 完全無改修
- `packages/niji-subgraph/**` — Phase 3 まで fiat 別 track 実装しない
- `packages/niji-sdk/**` — contract ABI / address は既存活用、 変更不要
- `packages/niji-assets/**` — NFT trait data 関連、 payment flow と無関係
- `packages/niji-docs/**` — 公開 docs、 Phase 2 も operations doc のみ内部運用
- `packages/niji-webapp/src/components/FiatSettlementModal/**` — 落札後 flow は Phase 1 で完成、 Phase 2 では触らない
- `packages/niji-api/src/handlers/fiat-bid/{authorize,3ds-callback,place-bid,capture,transfer-nft}.ts` — Phase 1 の 5 endpoint、 Phase 2 では topup のみ追加

## test scope

### 単体 test (Vitest)

- `packages/niji-api/src/handlers/fiat-bid/topup.test.ts` — pre-flight 成功 / 増額額 validation / 100 万円上限 の 3 case
- `packages/niji-api/src/services/authCleanup/index.test.ts` — enqueue / rate limit / retry / fail 通知 の 4 case
- `packages/niji-api/src/services/reauthorization/index.test.ts` — 45 日超検出 / 再 auth 成功 / 再 auth 失敗 の 3 case
- `packages/niji-webapp/src/components/FiatBidModal/index.test.tsx` — 増額 bid button 表示条件 / 5 phase stepper / validation 3 case 追加

### e2e test (Playwright)

- `packages/niji-webapp/tests/e2e/fiat-bid-topup.spec.ts` — golden path 1 spec (Phase 1 bid → 他 bidder 上乗せ → 増額 bid → 落札 → capture → transferFrom)、 Base Sepolia + GMO mock 前提

## 依存 package 追加

### niji-webapp

- なし (既存 wagmi / viem / TanStack Query / shadcn/ui で完結)

### niji-api

- なし (既存 msw / vitest / undici / hono / ponder で完結、 cron worker は Ponder scheduler API 活用予定)

## rollback 経路

Phase 2 実装中に「やっぱり方針変える」 場合の rollback 経路。

- Issue P2-1 (schema + cleanup queue) は独立性高い、 単独 revert 容易
- Issue P2-2 (topup endpoint) は P2-1 依存、 全部 revert or 全部 keep の 2 択
- Issue P2-3 (cron worker) は P2-1 のみ依存、 単独 revert 可能
- Issue P2-4 (UI) は P2-2 依存
- Issue P2-5 (e2e + runbook) は全 Issue 依存

git branch strategy —

- 各 Issue = 個別 branch `feature/{issue-num}-{slug}`、 master に直接 PR (Phase 1 と同じ)
- Phase 2 完了時に統合 branch なし、 各 PR 独立 merge

## 完了判定

Phase 2 完了 = 以下 3 marker 全 active。

- `test-passed-{repo-slug}-phase2-gmo-fiat-bid` — 全 Issue の unit test + e2e golden path pass
- `verify-passed-{repo-slug}-phase2-gmo-fiat-bid` — Layer 3 compile pass (typecheck + build)
- `review-passed-{repo-slug}-phase2-gmo-fiat-bid` — `/code-review-router` 完了

3 marker 全 active で AI 自律 merge 可、 Issue #3012 修正で通常 merge 経路確立済のため admin merge 不要 (期待)。
