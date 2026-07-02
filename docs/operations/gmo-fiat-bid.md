# GMO fiat bid 運用ドキュメント (Phase 1 MVP)

Phase 1 MVP (`tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md` SSOT) の base infra 運用ドキュメント。
Issue 1 段階では env 変数一覧 + mock server 切替手順のみ記載、 endpoint 実装 (Issue 3 以降) 完了時に本 doc は runbook 章 (異常系対応 / 運営 EOA 鍵管理 / GMO 契約情報) を追記する。

## Phase 1 スコープと現状

- Phase 1 は GMO デモ環境期限切れのため MSW mock server で e2e 動作検証する経路
- Issue 1 (本 doc の生成源) は SDK 依存追加 + mock server 設定 + env 変数整備の base infra を担う
- 実装済 = MSW handler 3 本 (`/entryTran` / `/execTran` / `/alterTran`) + conditional 起動 helper + behavior test
- 未実装 = Ponder dev server からの mock start 配線 (Issue 3 で hono handler 追加時に配線)

## env 変数 SSOT

### packages/niji-api

| 変数名 | 用途 | 例 (Phase 1 mock) | 本番切替時の取得元 |
|---|---|---|---|
| `PONDER_RPC_URL_1` | Ponder Mainnet RPC | `https://<...>` | Infura / Alchemy 契約 |
| `PONDER_WS_URL_1` | Ponder Mainnet WebSocket RPC (任意) | `wss://<...>` | 同上 |
| `PONDER_CHAIN` | 対象 chain 切替 (`sepolia` で sepolia 有効) | 未設定 = mainnet | 環境別 deploy |
| `GMO_ENDPOINT` | GMO PG API base URL | `http://127.0.0.1:2426` | GMO 公式 (`https://p01.mul-pay.jp`) |
| `GMO_MERCHANT_ID` | 加盟店 ID (13 桁) | `tshop00000001` | GMO 契約書 |
| `GMO_SITE_ID` | サイト ID (13 桁) | `tsite00000001` | GMO 契約書 |
| `GMO_SHOP_PASS` | ショップパスワード (可変長 8-20 文字) | `changeme_shop_password` | GMO 管理画面 (要 KMS 保管) |
| `USE_GMO_MOCK` | mock server 切替 (`true` / `false`) | `true` | 本番 = `false` |

### packages/niji-webapp

| 変数名 | 用途 | 例 (Phase 1 mock) | 本番切替時 |
|---|---|---|---|
| `VITE_GMO_API_ENDPOINT` | niji-api base URL | `http://127.0.0.1:42069` | `https://api.niji-dao.example` |
| `VITE_ENABLE_FIAT_BID` | fiat bid UI 表示 flag (`true` / `false`) | `false` (開発中) | `true` (release 後) |

## mock server 切替手順

Phase 1 開発期間中は mock server 経由で e2e 動作させる。 手順 —

1. `packages/niji-api/.env` を `.env.example` からコピー、 `USE_GMO_MOCK=true` を設定
2. `pnpm dev` を `packages/niji-api` で実行、 Ponder dev server が起動する
3. Issue 3 以降で追加される hono handler 経由で GMO endpoint (mock) 呼出、 form-encoded 応答が返る
4. Phase 3 本番切替時は `USE_GMO_MOCK=false` + `GMO_ENDPOINT=https://p01.mul-pay.jp` に変更

Issue 1 時点の behavior test 経路 —

```bash
cd packages/niji-api
pnpm test
# vitest が gmo-server.test.ts + index.test.ts を実行、 mock server 起動 + fetch 経由 200 応答検証
```

## 使用ライブラリ選定理由

### MSW (Mock Service Worker) v2.14

- Node.js `setupServer` + Browser `setupWorker` の統一 API、 webapp / api 両側で使い回し可能
- fetch API 互換の handler 記述、 GMO の form-encoded POST を素直に扱える
- 対案 Prism (OpenAPI spec ベース) は GMO 公式 OpenAPI spec 未公開のため採用見送り

### undici v7.28 (Node.js HTTP client)

- Node v20+ 標準搭載の undici と同系統、 明示的 dependency 追加で client 型を局所化
- GMO PG は form-encoded POST のみ (JSON API ではない)、 undici の低レベル API で最適化可能
- 対案 axios は依存過剰、 対案 got は Node v22+ 制約あり Phase 3 移行前に淘汰される可能性

### undici と Node built-in fetch の関係

Node v24 の built-in `fetch` は内部的に undici (bundled) を使う。 undici を明示的に dep 追加する意義は —

- 型定義 (`undici.Dispatcher` / `undici.MockAgent`) を明示的に import 可能
- Node built-in の undici バージョンに縛られず、 GMO client 側で version pinning 可能
- Phase 3 本番切替時に mTLS 対応が必要な場合、 undici の Agent 経由で証明書設定を明示化できる

Phase 1 では標準 `fetch` で十分だが、 Issue 3 以降の GMO client 実装で undici の `request` API を採用する余地を残す。

## 今後の追記項目 (Issue 3 以降)

Issue 3 (authorize endpoint) 完了時に本 doc に追記する項目 —

- 運営 EOA 鍵管理経路 (env 直書き / KMS / 1Password / hardware wallet の選定)
- GMO 契約情報 (加盟店 ID / サイト ID / 3DS 契約プラン)
- 異常系対応 runbook (capture 失敗時の JPY 補填手順、 transferFrom 失敗時の retry 3 回、 chargeback 発生時の運営全損吸収 policy)
- e2e test 起動手順 (Playwright + mock server 経由 golden path)
- 監視 / alert 経路 (Phase 4 で自動化、 Phase 1 は log 手動確認)

## 関連 SSOT

- `tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md` — Phase 1 master spec
- `tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md` — 8 Issue 分割案
- `tests/spec/gmo-fiat-bid/Phase1-05-impact-analysis.md` — 影響範囲分析
- `packages/niji-api/src/mocks/gmo-server.ts` — MSW handler 実装 SSOT
- `packages/niji-api/src/mocks/index.ts` — conditional 起動 helper SSOT
