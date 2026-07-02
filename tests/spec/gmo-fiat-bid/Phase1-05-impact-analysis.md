# Phase 1 Impact Analysis — 影響範囲と grep ベース列挙

## 影響範囲 summary

| package | 変更種別 | 主な変更内容 | 推定行数 |
|---|---|---|---|
| niji-webapp | 拡張 + 新規 | Bid component 拡張、 FiatBidModal + FiatSettlementModal + Tokushoho page 新規、 state atom + route 追加 | 700-900 行 |
| niji-api | 拡張 + 新規 | hono handler 5 endpoint + services (GMO client / spotRate / bidRelay / settlement) + Ponder schema 追加 + env 変数 | 900-1300 行 |
| niji-contracts | 完全無改修 | grilling 確定、 一切触らない | 0 行 |
| niji-subgraph | 完全無改修 | fiat / crypto 区別は backend DB 側 | 0 行 |
| docs | 新規 | operations/gmo-fiat-bid.md runbook | 100-200 行 |
| tests | 新規 | Playwright e2e golden path spec | 100-200 行 |

## grep ベース列挙

### niji-webapp 側の既存 file (触る予定)

```bash
grep -rl "auction\|bid" packages/niji-webapp/src/ | head -10
```

結果 (実行済) —

- `packages/niji-webapp/src/index.tsx` — router 追加、 footer link 追加
- `packages/niji-webapp/src/state/atoms/auctionAtom.ts` — fiat bid 状態 atom 追加
- `packages/niji-webapp/src/components/NijiContent/index.tsx` — 落札後 modal 表示 trigger 追加
- `packages/niji-webapp/src/components/Bid/index.tsx` — 「クレカで bid (JPY)」 button + fiat modal 呼出
- `packages/niji-webapp/src/components/Bid/index.test.tsx` — fiat button 表示 test 追加
- `packages/niji-webapp/src/pages/CrystalBall/index.tsx` — 影響なし (auction 別画面、 触らない)

### niji-webapp 側の新規 file

- `packages/niji-webapp/src/components/FiatBidModal/index.tsx` (300-400 行)
- `packages/niji-webapp/src/components/FiatBidModal/index.test.tsx` (100-150 行)
- `packages/niji-webapp/src/components/FiatSettlementModal/index.tsx` (250-350 行)
- `packages/niji-webapp/src/components/FiatSettlementModal/index.test.tsx` (100-150 行)
- `packages/niji-webapp/src/pages/Legal/Tokushoho.tsx` (100-150 行、 static content 中心)
- `packages/niji-webapp/src/hooks/useFiatBid.ts` (150-200 行、 backend endpoint 呼出 wrapper)
- `packages/niji-webapp/src/hooks/useSpotRate.ts` (100-150 行、 spot rate polling + cache)
- `packages/niji-webapp/tests/e2e/fiat-bid.spec.ts` (150-200 行、 Playwright)

### niji-api 側の既存 file (触る予定)

```bash
grep -rl "auction\|bid" packages/niji-api/src/ | head -10
```

結果 (実行済) —

- `packages/niji-api/src/NounsAuctionHouseV2.ts` — 影響なし (indexer 側、 触らない前提だが auction settle event 監視で reference する可能性あり、 Issue 7 で判定)

### niji-api 側の新規 file

- `packages/niji-api/src/services/gmo/client.ts` (200-300 行、 GMO PG API wrapper + mock server config)
- `packages/niji-api/src/services/gmo/types.ts` (100-150 行、 GMO API request/response 型定義)
- `packages/niji-api/src/services/spotRate/index.ts` (150-200 行、 GMO コイン + CoinGecko fetcher)
- `packages/niji-api/src/services/bidRelay/index.ts` (250-300 行、 viem tx sign + broadcast)
- `packages/niji-api/src/services/settlement/index.ts` (200-250 行、 auction settle 監視 + transferFrom trigger)
- `packages/niji-api/src/handlers/fiat-bid/authorize.ts` (150-200 行、 hono handler)
- `packages/niji-api/src/handlers/fiat-bid/3ds-callback.ts` (150-200 行、 hono handler)
- `packages/niji-api/src/handlers/fiat-bid/place-bid.ts` (100-150 行、 hono handler)
- `packages/niji-api/src/handlers/fiat-bid/capture.ts` (150-200 行、 hono handler)
- `packages/niji-api/src/handlers/fiat-bid/transfer-nft.ts` (100-150 行、 hono handler)
- `packages/niji-api/src/mocks/gmo-server.ts` (200-300 行、 MSW handler)

### niji-api 側の設定変更

- `packages/niji-api/ponder.schema.ts` — fiat_bid table 追加 (bidder_email / auth_id / jpy_amount / eth_amount / status / created_at / captured_at)
- `packages/niji-api/.env.example` — GMO_ENDPOINT / GMO_MERCHANT_ID / GMO_SITE_ID / GMO_SHOP_PASS / SPOT_RATE_API_KEY / OPERATOR_EOA_PRIVATE_KEY (Phase 1 は env 直、 Phase 3 で KMS) / SENDGRID_API_KEY (email)
- `packages/niji-api/package.json` — dependency 追加 (msw / @sendgrid/mail or aws-sdk/ses / node-fetch 等)

### docs / operations

- `docs/operations/gmo-fiat-bid.md` (100-200 行、 runbook)
  - 運営 EOA 鍵管理経路 (Phase 1 = env 直、 Phase 3 で KMS 移行想定)
  - GMO 契約情報 (merchant ID / site ID / shop pass の保管先)
  - mock server と実 GMO API の切替手順 (env 変数 `USE_GMO_MOCK=true` toggle)
  - 異常系対応 runbook (capture fail 時 JPY 補填手順、 transfer fail 時 retry 手順、 chargeback 時 全損吸収 policy)

## 触らないファイル (negative scope)

以下 file は Phase 1 で一切触らない、 「ついで refactor」 禁止。

- `packages/niji-contracts/**` — grilling 確定、 完全無改修
- `packages/niji-subgraph/**` — fiat / crypto 区別は backend DB のみ、 subgraph schema 変更不要
- `packages/niji-sdk/**` — contract ABI / address は既存活用、 変更不要
- `packages/niji-assets/**` — NFT trait data 関連、 payment flow と無関係
- `packages/niji-docs/**` — 公開 docs、 Phase 1 は operations doc のみ内部運用
- `packages/niji-webapp/src/pages/CrystalBall/**` — auction 別画面、 fiat bid 対象外
- `packages/niji-webapp/src/wrappers/**` — contract interaction wrapper、 既存 ETH bid 用は変更なし
- `packages/niji-webapp/src/i18n/**` — 翻訳 file、 Phase 1 では日本語 fiat bidder のみ想定なので追加翻訳なし (英語対応は Phase 3)

## test scope

### 単体 test (Vitest)

- `packages/niji-webapp/src/components/FiatBidModal/index.test.tsx` — modal 開閉 / stepper 遷移 / JPY 入力 validation / spot rate 表示
- `packages/niji-webapp/src/components/FiatSettlementModal/index.test.tsx` — 3DS 追加認証 flow / capture 呼出 / transfer 結果表示
- `packages/niji-api/src/services/spotRate/index.test.ts` — primary/fallback 切替 / cache 動作 / 2% 許容幅 check
- `packages/niji-api/src/services/bidRelay/index.test.ts` — tx sign / broadcast / receipt watch (viem mock)
- `packages/niji-api/src/handlers/fiat-bid/*.test.ts` — 各 endpoint の happy path + 失敗系

### e2e test (Playwright)

- `packages/niji-webapp/tests/e2e/fiat-bid.spec.ts` — golden path 1 spec (bid → 落札 → capture → transferFrom)
- Base Sepolia + GMO mock server 前提、 test 実行時に anvil fork or 実 Sepolia RPC 使用

### 反例 test (Phase 1 で明示的に検証)

反例 spec `Phase1-04-counterexamples.md` の 6 反例のうち Phase 1 で code 上明示的に検証すべきもの —

- 反例 1 (bid 増額不可) — modal に「既存 bid あり」 表示 unit test
- 反例 2 (wallet 未接続) — 「クレカで bid」 button disable state unit test
- 反例 5 (Mainnet 非対応) — env `VITE_CHAIN_ID` が Base Sepolia (84532) 以外の時 fiat button 非表示 unit test

## 依存 package 追加

### niji-webapp

- なし (既存 wagmi / viem / TanStack Query / shadcn/ui で完結想定)

### niji-api

- `msw` (mock server)
- `@sendgrid/mail` or `@aws-sdk/client-ses` (email)
- GMO PG SDK (公式 npm package 存在確認要、 なければ REST 直呼出で `node-fetch` or `undici`)

## rollback 経路

Phase 1 実装中に「やっぱり方針変える」 場合の rollback 経路。

- Issue 1-2 (env + spot rate) は独立性高い、 単独 revert 容易
- Issue 3-5 (backend endpoint + bid tx) は連鎖依存、 全部 revert or 全部 keep の 2 択
- Issue 6-8 (frontend + e2e) は backend endpoint 前提、 backend revert 時は同時 revert 必須

git branch strategy —

- `feature/gmo-fiat-bid-phase1` を Phase 1 全体の integration branch
- 各 Issue = 個別 branch `feature/gmo-fiat-bid-{issue-num}-{slug}`、 integration branch に PR
- Phase 1 完了時に integration branch → master に squash merge

## 完了判定

Phase 1 完了 = 以下 3 marker 全 active。

- `test-passed-{repo-slug}-phase1-gmo-fiat-bid` — 全 Issue の unit test + e2e golden path pass、 rules/quality.md § test-passed marker 発行前提 準拠
- `verify-passed-{repo-slug}-phase1-gmo-fiat-bid` — Layer 3 compile pass (typecheck + build)
- `review-passed-{repo-slug}-phase1-gmo-fiat-bid` — `/code-review-router` 完了

3 marker 全 active で AI 自律 merge 可 (rules/git-workflow.md § PR・merge)、 いずれか unmet 時のみ user 確認。
