# Phase 1 Issue Breakdown — 8 Issue 分割案

## 分割方針

rules/dev-flow.md § Issue 粒度 (1 Issue = 1 PR = 1 branch、 1 PR 300 行目安) に整合させるため、 Phase 1 全体 (推定 1500-2500 行) を 8 Issue に分割する。 各 Issue は独立実装可能 + 依存関係を明示して並列開発可能にする。

## Issue 一覧

### Issue 1 — GMO API SDK 導入 + mock server 設定 + env 変数整備

- スコープ — packages/niji-webapp + packages/niji-api の 2 packages に GMO PG SDK dependency 追加、 MSW or Prism で mock server 設定、 `.env.example` に GMO endpoint / merchant ID / 3DS return URL / spot rate API key 等を追加
- AC — `pnpm dev` 起動時に mock server 経由で GMO PG endpoint (`/entryTran` / `/execTran` / `/alterTran`) の 200 応答が返る
- 依存 — なし (最上流)
- 推定 — 100-150 行、 4-6 時間

### Issue 2 — spot rate fetcher (GMO コイン API primary + CoinGecko fallback)

- スコープ — packages/niji-api `src/services/spotRate/index.ts` 新規、 5 秒 cache + primary/fallback 切替 + 2% 許容幅 check logic
- AC — API endpoint `/api/v1/spot-rate/eth-jpy` が現在 rate を返し、 primary 障害時に fallback 応答が返る
- 依存 — Issue 1 (env 変数)
- 推定 — 150-200 行、 6-8 時間

### Issue 3 — 与信枠 authorize endpoint (`POST /api/v1/fiat-bid/authorize`)

- スコープ — packages/niji-api hono handler 追加、 GMO `entryTran` + `execTran` 呼出、 bid 上限 100 万円 check、 auth ID を Ponder DB (schema 追加) に「pending」 保存
- AC — JPY 額 + card Token を POST → GMO mock で auth 成功時に auth ID + 3DS redirect URL 返却、 fail 時 4xx 応答
- 依存 — Issue 1 (SDK) + Issue 2 (spot rate、 JPY→ETH 換算に使う)
- 推定 — 200-300 行、 8-12 時間

### Issue 4 — 3DS 2.0 full redirect 経路 + callback endpoint

- スコープ — webapp 側 3DS redirect handler (full redirect、 popup 回避、 mobile safari 対応)、 backend `POST /api/v1/fiat-bid/3ds-callback` で認証結果 verify + auth 確定 or cancel
- AC — 3DS mock で success/fail 両経路が動作、 success 時に auth ID が「3ds-verified」 に status 更新
- 依存 — Issue 3 (authorize endpoint)
- 推定 — 200-250 行、 8-10 時間

### Issue 5 — 運営 EOA 代理 bid tx 発火 (`POST /api/v1/fiat-bid/place-bid`)

- スコープ — packages/niji-api `src/services/bidRelay/index.ts` 新規、 viem で NijiAuctionHouseV3.createBid tx sign + broadcast、 運営 EOA 秘密鍵は env で読取 (Phase 1 は env 直、 Phase 3 で KMS 移行)、 tx receipt watch + Ponder DB status 更新
- AC — Base Sepolia 上で bid tx が emit され、 tx hash が返り、 auction contract に新 bidder が記録される
- 依存 — Issue 4 (3DS 完了後 status)
- 推定 — 250-300 行、 10-12 時間

### Issue 6 — bid modal UI + 4 段 stepper (webapp)

- スコープ — packages/niji-webapp `src/components/FiatBidModal/index.tsx` 新規、 `src/components/Bid/index.tsx` に「クレカで bid (JPY)」 button 追加、 JPY 入力 + spot rate 表示 + Terms checkbox + stepper (「与信枠取得中」 → 「3DS 認証中」 → 「bid 送信中」 → 「bid 成功」)
- AC — modal 開閉 + 4 段 stepper が backend endpoint 呼出結果に応じて遷移、 e2e test で golden path 描画確認可能
- 依存 — Issue 5 (bid tx 発火 endpoint)
- 推定 — 300-400 行、 12-16 時間

### Issue 7 — 落札後 modal + capture endpoint + transferFrom trigger

- スコープ — packages/niji-webapp `src/components/FiatSettlementModal/index.tsx` 新規、 backend `POST /api/v1/fiat-bid/capture` + auction settle 監視 (Ponder event) + 運営 EOA から user wallet に NijiToken.transferFrom trigger
- AC — auction settle 後に modal 表示 + 3DS 追加認証 + capture 成功 + transferFrom 実行 + user wallet で NijiToken 保有確認可能
- 依存 — Issue 5 (bid tx)、 Issue 6 (modal UI 統合)
- 推定 — 350-450 行、 14-18 時間

### Issue 8 — Terms + 特商法 static page + email 通知 + e2e test

- スコープ — packages/niji-webapp `src/pages/Legal/Tokushoho.tsx` 新規、 footer link 追加、 落札通知 email (SendGrid or SES)、 `packages/niji-webapp/tests/e2e/fiat-bid.spec.ts` Playwright golden path spec、 `docs/operations/gmo-fiat-bid.md` runbook
- AC — `/legal/tokushoho` にアクセス可能 + 8 項目全記載 + 落札 email が届く + e2e golden path pass
- 依存 — Issue 7 (落札 flow 完成)
- 推定 — 200-300 行、 8-12 時間

## 依存関係 graph

```
Issue 1 (SDK + env)
├─ Issue 2 (spot rate)
│   └─ Issue 3 (authorize)
│       └─ Issue 4 (3DS)
│           └─ Issue 5 (bid tx)
│               ├─ Issue 6 (modal UI)
│               │   └─ Issue 7 (settlement)
│               │       └─ Issue 8 (Terms + e2e)
```

Issue 1 → Issue 8 は直列 chain、 並列開発は困難。 早期 merge には Issue 1 + Issue 2 (env + rate) を先行 merge、 Issue 3-5 (backend) と Issue 6 (frontend) を並行開発する経路が現実的。

## Linear + GitHub dual 起票

rules/linear-integration.md § GitHub Issue Sync 復旧待ち期間 準拠、 `~/.claude/scripts/linear-github-dual-issue.sh` helper 経由で 8 Issue × 2 起票 = 16 起票。 全 Issue に「Phase 1 GMO fiat bid」 milestone / label を付与、 依存関係を Linear の blockedBy で紐付ける。

## 推定合計

- 実装行数 = 1750-2400 行
- 開発時間 = 70-94 時間 (2-3 週間、 1 人 fulltime 換算)
- Issue 数 = 8 (grilling 想定の 8-10 の下限に着地、 Phase 1 scope 限定効果)
