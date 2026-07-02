# Phase 2 Master Spec — bid 増額 + 45 日超 fallback

## タスクサマリ

Phase 1 で確立した fiat bid end-to-end 経路 (1 発 bid のみ) を拡張し、 fiat bidder が同 auction 内で bid 増額できる 5 phase sequential 経路と、 auction 期間が 45 日を超えた場合の GMO 与信枠再 authorization fallback を実装する。
Phase 1 と同じ Base Sepolia + GMO mock server 環境で e2e 検証、 subgraph 側の fiat 別 track は Phase 3 に外出し。

## 前提設計 (grilling P3-a + P3-b + Phase 2 判断確定 SSOT)

- bid 増額 = grilling P3-b A 案 (5 phase sequential + 非同期 cleanup) を Phase 2 で実装
- 5 phase = frontend「増額 bid」 button → backend pre-flight で GMO 新 auth 取得 → chain bid tx 発火 (viem writeContract) → tx confirm 後 status 更新 → async cleanup queue で旧 auth alterTran VOID
- 45 日超 fallback = grilling P3-a A 案 (24h auction + 45 日超で再 authorization fallback) を Phase 2 で実装
- backend cron worker で fiat_bid.createdAt から経過日数計算、 45 日超で再 authorization 発火
- subgraph 別 track = **Phase 2 では実装しない**、 Phase 3 本番切替時に subgraph 改修と同時実施 (backend DB fiat_bid table で observability 担保済)
- bid 上限 = Phase 1 の 100 万円 / bid を維持、 増額後の合計額も 100 万円上限で強制

## 受入条件 (AC、 YES/NO 検証可能)

- AC 1 — Base Sepolia 上で fiat bidder が同 auction 内で 2 回目 bid (増額) を実行、 GMO 新 authorization + chain bid tx 発火 + 旧 authorization async cleanup の 5 phase が sequential 完走する
- AC 2 — 増額 bid で JPY 額が Phase 1 bid 額を下回る場合、 client-side + backend validation の 2 層で「増額のみ受付」 エラー表示 + bid 不可
- AC 3 — 増額 bid 合計額 (Phase 1 + 増額差分) が 100 万円超過時に validation エラー表示 + bid 不可
- AC 4 — 旧 authorization の async cleanup queue が 5 秒 delay + 1 req/sec rate limit + 3 回 retry で GMO alterTran VOID を実行、 fail 時運営 log 通知
- AC 5 — fiat_bid.createdAt から 45 日経過した pending record を backend cron が 1h ごとに検出、 GMO 再 authorization API 発火 + reauthorizationCount + lastReauthorizedAt UPDATE
- AC 6 — 45 日超 fallback で新 authorization 失敗時、 fiat_bid.status = cancelled + 運営 alert log + user 通知 email
- AC 7 — 増額 bid Playwright e2e test で「Phase 1 bid → 他 bidder 上乗せ → 増額 bid → 落札 → capture → transferFrom」 の golden path が Base Sepolia + GMO mock で 1 spec pass

## スコープ境界

### in (本 Phase で対応)

- bid 増額 5 phase sequential 実装 (webapp button + backend pre-flight + BidRelay 再利用 + async cleanup queue)
- 増額 bid client-side + backend validation (JPY 増額のみ / 100 万円上限)
- 45 日超 fallback backend cron worker + 再 authorization API
- fiat_bid schema 拡張 (reauthorizationCount / lastReauthorizedAt 追加)
- 増額 bid Playwright e2e golden path 1 spec
- operations runbook 追記 (bid 増額 flow + 45 日超対応手順)

### out (本 Phase で対応しない、 Phase 3 以降)

- subgraph fiat 別 track → Phase 3 (Base Mainnet 切替と同時)
- Base Mainnet 切替 (env + contract address + subgraph endpoint) → Phase 3
- GMO 本番環境切替 (3DS 本番認証 / PCI DSS 監査) → Phase 3
- retry queue 自動化 (transfer fail / capture fail) → Phase 4
- 監視 dashboard + 運営 alert 自動化 → Phase 4
- Stripe fallback provider → Phase 4 (or GMO revoke 時のみ)
- bidder 側独自 KYC (対応しない、 Terms 宣誓 + 3DS 2.0 で代替、 Phase 1 と同じ)

## 反例ケース

- 反例 1 — 3 回目 bid (2 回目増額) → Phase 2 では対応、 5 phase sequential は N 回反復可能な設計 (旧 auth cleanup queue が回数分 enqueue)
- 反例 2 — 同時 bid 増額 (2 fiat bidder が同時に増額) → auction contract 側の BidTooLow revert で 1 名のみ成功、 revert 側は fiat_bid.status = cancelled + user 通知 (Phase 1 の revert 経路踏襲)
- 反例 3 — 45 日超 fallback 実行中に auction settle → 再 authorization は skip、 settlement 経路が優先 (fiat_bid.status = 3ds-verified または bid-placed のみ再 auth 対象)
- 反例 4 — Base Mainnet 環境での動作保証 → Phase 3 で env 変更、 Phase 2 は Sepolia 前提 hardcode 継続
- 反例 5 — subgraph 側の fiat 落札可視化 → Phase 3、 Phase 2 は backend DB のみで観測

## 影響範囲 (touched file 候補)

### packages/niji-webapp

- `src/components/FiatBidModal/index.tsx` — 「増額 bid」 branch 追加 (既存 bid record 存在時の UI 差分)
- `src/hooks/useFiatBid.ts` — 増額 bid endpoint 呼出 + 5 phase state 管理
- `src/state/atoms/auctionAtom.ts` — 増額 bid state 追加
- `tests/e2e/fiat-bid-topup.spec.ts` — 新規、 Playwright 増額 bid golden path

### packages/niji-api

- `src/handlers/fiat-bid/topup.ts` — 新規、 POST /api/v1/fiat-bid/topup で増額 bid pre-flight
- `src/handlers/fiat-bid/topup.test.ts` — 新規、 behavior test 3 case
- `src/services/bidRelay/index.ts` — 拡張、 増額 bid の tx 発火再利用
- `src/services/authCleanup/index.ts` — 新規、 async cleanup queue (5 秒 delay + rate limit + retry)
- `src/services/authCleanup/index.test.ts` — 新規
- `src/services/reauthorization/index.ts` — 新規、 45 日超 fallback cron worker
- `src/services/reauthorization/index.test.ts` — 新規
- `src/api/index.ts` — topup route + cron worker 起動
- `ponder.schema.ts` — fiat_bid table に reauthorizationCount / lastReauthorizedAt 追加

### packages/niji-contracts

- 完全無改修 (Phase 1 と同じ、 NijiAuctionHouseV3 未変更)

### packages/niji-subgraph

- 完全無改修 (fiat 別 track は Phase 3)

### docs

- `docs/operations/gmo-fiat-bid.md` — 拡張、 bid 増額 flow + 45 日超対応手順 追記

## 既知のリスク・前提

- Ponder framework の cron worker 実装経路は Ponder 0.12 の scheduler API を活用、 未提供機能なら別 service (node-cron) 分離
- GMO 再 authorization API の実 endpoint 仕様は Phase 3 本番切替時に GMO デモ環境再取得で確定 (Phase 2 mock は entryTran 再呼出で simulate)
- 45 日超 fallback で auction 期間が 60 日超えた場合の cascading failure は Phase 4 で監視 dashboard 追加
- 増額 bid の async cleanup queue が backend crash で消えた場合の rebuild 経路は Phase 4 で orphan auth 検出 API 追加
