# GMO fiat bid 運用ドキュメント (Phase 1 MVP + Phase 2 拡張)

Phase 1 MVP (`tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md` SSOT) の base infra 運用ドキュメント。
Phase 2 (`tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md` SSOT) で bid 増額 5 phase sequential 経路 + 45 日超 fallback cron worker 経路を追記した。
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
| `USE_SPOT_RATE_MOCK` | spot rate mock 切替 (Issue #3061、 `true` / `false`) | `true` | 本番 = `false` |
| `MOCK_SPOT_RATE_JPY_PER_ETH` | spot rate mock 固定値 (JPY / 1 ETH、 mock 時のみ有効) | `500000` | (mock=false で無視) |

### packages/niji-webapp

| 変数名 | 用途 | 例 (Phase 1 mock) | 本番切替時 |
|---|---|---|---|
| `VITE_GMO_API_ENDPOINT` | niji-api base URL (fiat bid endpoint、 authorize / capture / topup 等) | `http://127.0.0.1:42069` | `https://api.niji-dao.example` |
| `VITE_GMO_API_ENDPOINT_SPOT_RATE` | spot-rate 独立 server base URL (Issue #3065、 Ponder 非依存) | `http://127.0.0.1:42070` | `https://api.niji-dao.example` |
| `VITE_ENABLE_FIAT_BID` | fiat bid UI 表示 flag (`true` / `false`) | `false` (開発中) | `true` (release 後) |

`VITE_GMO_API_ENDPOINT` は Issue #3059 で SSOT に統一済。 `.env.example.local` は本 env 名で一致する (旧 `VITE_NIJI_API_BASE_URL` は同 Issue で撤廃)。 本 env 未設定時は同一 origin (webapp 2424 port) に fallback するが、 dev では niji-api を叩かないと `/api/v1/fiat-bid/*` が 404 になる (webapp origin に api endpoint 未実装のため)。

`VITE_GMO_API_ENDPOINT_SPOT_RATE` は Issue #3065 で追加した spot-rate 専用 endpoint。 `useSpotRate.ts` は本 env を優先して読み、 未設定時は `VITE_GMO_API_ENDPOINT` に fallback する (旧経路互換)。 dev では 42070 の spot-rate independent server を叩くことで Ponder sync 完了待ちを回避、 spot rate が即応答する。

### port 分離 architecture (Issue #3065、 Plan A SSOT)

niji-api は 2 process 並列起動 (`pnpm dev` = concurrently 経由)。 責務分離 —

- **port 42069** (Ponder + Hono) = event indexer 専任、 fiat-bid endpoint (authorize / 3ds-callback / place-bid / capture / transfer-nft / topup) を expose。 Ponder DB (fiat_bid table) に write する endpoint は Ponder indexer が持つ drizzle client 経由でのみ書けるため、 本 process に維持
- **port 42070** (spot-rate independent hono) = Ponder 非依存、 GMO コイン API + CoinGecko fallback + 5 秒 in-memory cache で完結。 sync 状態問わず即応答

Ponder indexer の historical sync 完了待ち (Base Sepolia block 数万件、 10-30 秒〜数分) 中でも spot rate は即応答するため、 user 実機の FiatBidForm で「レート取得クルクル継続」 症状が発生しない (Issue #3065 root cause 解消)。 fiat-bid endpoint 群は auction settle event 後にのみ実 flow が発火する前提のため、 Ponder sync 完了 (dev では 10-30 秒程度) を起点にできれば実用範囲。

Plan B (全 fiat-bid endpoint も分離) は PGlite 制約 (Ponder が sync 完了まで database schema を確定させない、 独立 server から drizzle 経由で fiat_bid table を書けない) のため回避、 Postgres 移行 + Docker 依存増加を発生させずに root cause 解消する。

## mock server 切替手順

Phase 1 開発期間中は mock server 経由で e2e 動作させる。 手順 —

1. `packages/niji-api/.env` を `.env.example` からコピー、 `USE_GMO_MOCK=true` を設定
2. repo root で `make dev` を実行、 niji-api (Ponder + Hono、 port 42069) は anvil / auto-settler / webapp と並列 bg 起動する (Issue #3059 で `api-bg` target 追加)
3. Issue 3 以降で追加される hono handler 経由で GMO endpoint (mock) 呼出、 form-encoded 応答が返る
4. Phase 3 本番切替時は `USE_GMO_MOCK=false` + `GMO_ENDPOINT=https://p01.mul-pay.jp` に変更

### make dev で niji-api 起動 (Issue #3059、 #3065)

`make dev` は 5 process 相当を bg 起動する (anvil / niji-api Ponder / niji-api spot-rate / auto-settler / webapp)。 niji-api の `pnpm dev` は concurrently 経由で Ponder (42069) と spot-rate independent server (42070) の 2 process を並列起動する構成 (Issue #3065)。 spot-rate は Ponder 非依存で即応答するため、 起動直後でも FiatBidForm でレート表示が spinner に張り付かない。

- `make dev-status` で niji-api の PID / port 42069 (Ponder) + port 42070 (spot-rate) の HTTP 応答を確認できる (2 行表示、 Issue #3065)
- `make dev-logs` で `.context/dev/api.log` を含む全 log を tail -f 表示 (concurrently prefix `[ponder]` / `[spot]` で識別)
- `make dev-stop` で niji-api の PID を graceful kill + port 42069 / 42070 の残骸 listener を lsof 経由で掃除

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

## 異常系対応 runbook (Phase 1 手動、 Phase 4 で自動化)

capture / transfer / chargeback の 3 経路で発生する異常状態に対する運営 policy と手動対応手順 SSOT。

### capture 失敗 (Phase D 経路)

- 検出 — `[capture-failed]` prefix log が `packages/niji-api` に出力される (Phase 1)、 authId + jpyAmount + errCode + errInfo を含む
- 状態 — `fiat_bid.status = "cancelled"` に自動遷移、 GMO 与信枠は revoke されて 60 日以内に card 会社側で解放
- 運営対応 —
  1. log から authId を取り出し、 GMO 管理画面で決済 status を確認 (card 期限切れ / 与信不足 / fraud 判定 等)
  2. bidder に email で「別 card 登録 or 銀行振込での支払をお願いします」 と個別連絡
  3. 銀行振込を受領した場合、 運営が JPY 補填 (fiat_bid.status は cancelled のまま、 別 offchain 記録で管理)
  4. NFT は予定通り transferFrom 実行 (bidder との個別合意で auction 落札額分の JPY 補填が確約されたことが根拠)
- policy — capture 失敗による運営赤字は許容、 事後 recovery の SSOT (grilling P6 A 案)

### transfer 失敗 (Phase E 経路)

- 検出 — `[transfer-failed]` prefix log、 authId + bidderWallet + reason を含む
- 状態 — `fiat_bid.status = "captured"` のまま (transferred に遷移せず)
- 運営対応 —
  1. reason 別対応 — `RpcError` は RPC 再選定後 1h 待って手動 retry (`viem` から transferFrom 再発火)、 `NotOwner` は運営 EOA が NFT を保有していない状態 = 別途 auction settle 状態確認、 `InvalidRecipient` は bidder wallet address を再確認
  2. 手動 retry 3 回まで実行 (1h 間隔)、 各回 log 確認
  3. 3 回失敗で bidder に email で「別 wallet address 指定を依頼」、 別 address request modal (webapp) から更新受付
  4. 別 address が有効なら transferFrom 再発火、 それも fail なら operations 側で NFT を運営 EOA 保有のまま cold-hold + bidder 個別調整
- Phase 4 で自動化 — retry queue + 監視 dashboard + PagerDuty alert 連携

### chargeback 発生 (Phase 3 以降で発生想定)

- 発生条件 — Phase 1 は GMO mock なので発生不可、 Phase 3 実 GMO 本番切替後に card 会社経由の chargeback 通知で判明
- 運営対応 —
  1. GMO 管理画面で chargeback status 確認、 fiat_bid.status に手動で `chargeback` (schema 追加要) 反映
  2. 運営 JPY を card 会社に返金 (GMO 経由の逆送金 flow)
  3. NFT は on-chain 実装上剥奪不可 = 運営全損吸収 (grilling P6 A 案 SSOT)
  4. chargeback 発生率が閾値超なら事前 defense (与信枠 pre-flight / 3DS 強制 / bid 上限) 再設計

### 運営 alert log 出力先 (Phase 1)

- backend `packages/niji-api` の console.error stream
- Railway (or 本番相当環境) の log console で `[capture-failed]` / `[transfer-failed]` を毎日目視確認する運営 routine
- Phase 4 で PagerDuty / Slack Webhook / 監視 dashboard に自動配線

## 運営 EOA 鍵管理 (Issue #3011 Phase D、 Phase 移行 SSOT)

fiat bid 経路で運営 EOA が bid tx / transferFrom を broadcast する秘密鍵の管理経路。 Phase 別に階段的に強化する SSOT。

### Phase 1 (現状 = Base Sepolia MVP)

- 保管形式 — `packages/niji-api/.env` 内 `OPERATOR_PRIVATE_KEY=0x...` env 変数直書き (32 byte hex)
- 対象 chain — Base Sepolia (chainId 84532)、 gas は Base Sepolia faucet で調達
- 責務者 — 開発担当者 (`.env` は `.gitignore` 対象、 commit 禁止)
- 事故対応 — 秘密鍵漏洩検知時は即時 `env` 更新 + Base Sepolia 側 EOA 廃棄、 testnet 資産のみで実 JPY 影響なし
- faucet 復旧手順 — Base Sepolia faucet (Alchemy / Coinbase 公式) で 0.05 ETH 未満は自動、 それ以上は運営が手動 request

### Phase 3 (本番 = Base Mainnet 切替)

- 保管形式 — AWS KMS (asymmetric CMK) 経由の envelope encryption、 `packages/niji-api` は KMS API 経由で per-tx 署名
- 対象 chain — Base Mainnet (chainId 8453)、 gas は運営 treasury から補充
- 責務者 — 運営 + 開発リーダー 2 名の IAM 権限、 `kms:Sign` は audit log で追跡
- 事故対応 — KMS key rotate 手順を GMO 決済停止 → EOA 移行 → GMO 決済再開の 3 stage で実施
- 移行手順 — Phase 3 移行 PR で `env` 直読 signer から KMS signer に切替、 fallback として env signer を残す (feature flag `USE_KMS_SIGNER`)

### KMS 選定理由 (Phase 3)

- 対案 1Password + agent — セキュリティ低い、 CI からの直接 signing 経路が不透明
- 対案 hardware wallet (Ledger) — 24/7 broadcast 経路と非互換 (人手介入必須)
- KMS 採用 — AWS 実運用の tx signing 実績あり、 IAM で細粒度権限、 CloudTrail で audit log

## GMO 契約情報 (Issue #3011 Phase D)

GMO ペイメントゲートウェイ (PG) 契約情報の保管先と切替手順。 Phase 別 SSOT。

### 契約情報項目

| 項目 | 内容 | 保管先 (Phase 1) | 保管先 (Phase 3) |
|---|---|---|---|
| 加盟店 ID (merchant ID、 13 桁) | GMO 契約書に記載 | `env GMO_MERCHANT_ID` | 1Password 加盟店 vault |
| サイト ID (site ID、 13 桁) | GMO 契約書に記載 | `env GMO_SITE_ID` | 1Password 加盟店 vault |
| ショップパスワード (可変 8-20 文字) | GMO 管理画面で生成 | `env GMO_SHOP_PASS` | AWS Secrets Manager |
| 3DS 契約プラン | GMO 契約書 (Phase 1 は demo、 Phase 3 で 3DS 2.0 本契約) | 契約書 PDF (1Password) | 契約書 PDF (1Password) |
| GMO 側連絡先 | 技術問合せ email + 電話番号 | 契約書 PDF | 契約書 PDF |

### 事故対応連絡先

- GMO PG 技術サポート — GMO 契約書記載 (Phase 3 契約時に確定)
- Niji DAO 運営問合せ email — `support@niji-dao.example` (Phase 3 で確定 email に置換)
- 緊急時 chargeback 対応 — GMO 管理画面の dispute section から手動対応

## mock 環境切替手順 (Issue #3011 Phase D、 詳細版)

Phase 1 開発 / test 期間中は GMO デモ環境期限切れのため MSW mock server で e2e 検証する。 切替 procedure と rollback を SSOT 化。

### mock → 本番 切替 procedure (Phase 3 移行時)

1. GMO 本番契約書を取得 (加盟店 ID / サイト ID / ショップパスワード)
2. 1Password 「加盟店 vault」 に契約情報を保管
3. AWS Secrets Manager に `GMO_SHOP_PASS` を registration
4. `packages/niji-api/.env.production` を作成、 `USE_GMO_MOCK=false` + `GMO_ENDPOINT=https://p01.mul-pay.jp` に設定
5. `packages/niji-api` を deploy、 smoke test で GMO PG API `/entryTran` 疎通確認
6. webapp env `VITE_ENABLE_FIAT_BID=true` に切替、 release 後 24 時間監視 (log 経路 = Railway / Datadog 予定)

### rollback (本番 → mock、 事故時)

1. `packages/niji-api/.env.production` の `USE_GMO_MOCK=true` に即時切替 + redeploy
2. webapp env `VITE_ENABLE_FIAT_BID=false` に切替、 fiat bid UI 非表示化 (ETH bid 経路のみ稼働)
3. GMO 側の与信枠は最大 60 日で自動 revoke、 rollback 前後の bid record を audit
4. 事故原因の post-mortem を `decisions/personal/{date}-gmo-mock-rollback-{reason}.md` に記録

## Phase 移行手順 (Issue #3011 Phase D、 Phase 1 → 2 → 3 → 4 SSOT)

Phase 1 MVP から Phase 4 自動化までの段階的移行手順。 各 Phase の gate 条件と実装項目を明確化する。

### Phase 1 → 2 (fiat bid 増額 UX 実装)

- gate 条件 — Phase 1 の 3 marker (test-passed + verify-passed + review-passed) 全 active、 Base Sepolia golden path 1 spec pass
- 実装項目 —
  - fiat bid 増額 (現在の fiat bid 額 + n 円 で再 bid) UI 実装
  - 既存 fiat_bid record の `status = re-bid` 遷移 + GMO 与信枠 revoke + 新 authId 生成の atomic 処理
  - 増額履歴 audit log
- 期間見積 — 2-3 週間 (grilling P9 で確定した Phase 2 スコープ)

### Phase 2 → 3 (Base Mainnet + GMO 本番切替)

- gate 条件 — Phase 2 完了 + AWS KMS 配線完了 + GMO 本番契約締結
- 実装項目 —
  - Base Sepolia → Base Mainnet 切替 (chainId + RPC + contract 再 deploy)
  - GMO デモ → 本番 endpoint 切替 (`USE_GMO_MOCK=false` + `GMO_ENDPOINT=https://p01.mul-pay.jp`)
  - env 直読 signer → KMS signer 切替 (`USE_KMS_SIGNER=true` feature flag)
  - 3DS 2.0 本契約 activation + fraud alert 経路配線
- 期間見積 — 3-4 週間 (契約締結 + KMS 配線 + smoke test の総和)

### Phase 3 → 4 (retry queue + monitoring 自動化)

- gate 条件 — Phase 3 で本番稼働 3 ヶ月経過 + 事故 recovery 手動対応の実績蓄積
- 実装項目 —
  - transfer 失敗の retry queue (SQS + Lambda worker、 3 回 exponential backoff)
  - capture 失敗の GMO 管理画面 API 経由 auto retry
  - PagerDuty / Slack Webhook / 監視 dashboard 統合
  - chargeback 検出の GMO webhook 受信経路 (現在は手動確認)
- 期間見積 — 4-6 週間 (queue 実装 + monitoring 統合 + on-call 体制構築)

## Phase 1 完了確認 (Issue #3011 Phase E、 3 marker 発行前提)

Phase 1 全 8 Issue merge 後、 以下を確認して 3 marker (test-passed + verify-passed + review-passed) を発行する。

### Phase 1 完了 Issue 一覧 (8 件)

| Issue | title | 主担当 file | 完了 status |
|---|---|---|---|
| #3004 | GMO SDK 依存追加 + MSW mock server 設定 | `packages/niji-api/src/mocks/gmo-server.ts` | merged |
| #3005 | fiat_bid schema + Ponder table 定義 | `packages/niji-api/ponder.schema.ts` | merged |
| #3006 | 与信枠 authorize endpoint (entryTran + execTran) | `packages/niji-api/src/handlers/fiat-bid/authorize.ts` | merged |
| #3007 | 3DS 2.0 full redirect + callback endpoint | `packages/niji-webapp/src/pages/FiatBid/ThreeDSRedirect.tsx` | merged |
| #3008 | 運営 EOA 代理 bid tx 発火 endpoint | `packages/niji-api/src/services/bidRelay/index.ts` | merged |
| #3009 | FiatBidModal + 4 段 stepper UI | `packages/niji-webapp/src/components/FiatBidModal/` | merged |
| #3010 | 落札後 FiatSettlementModal + capture + transferFrom | `packages/niji-api/src/services/settlement/index.ts` | merged |
| #3011 | Terms + 特商法 page + Playwright e2e + operations runbook | `packages/niji-webapp/src/pages/Legal/Tokushoho.tsx` | 本 Issue |

### 3 marker 発行手順 (Phase 1 全 Issue merged 後)

`rules/quality.md` § test-passed marker 発行前提 の 3 条件を確認してから marker を発行する。

1. **test-passed** — 各 PR で behavior test 追加が完了しており、 `pnpm test` が全 pass。 marker file = `<repo>/.context/markers/test-passed-{repo-slug}-phase-1-gmo-fiat-bid.md`、 内容に「Phase 1 全 8 Issue の behavior test 状況表 + 実行 log 抜粋」 を記載
2. **verify-passed** — `/verify` skill で lint + typecheck + test + build が全 pass。 marker file = `verify-passed-{repo-slug}-phase-1-gmo-fiat-bid.md`
3. **review-passed** — `/code-review-router` で 4 pass review 完了、 blocking issue ゼロ。 marker file = `review-passed-{repo-slug}-phase-1-gmo-fiat-bid.md`

### Phase 1 完了判定後の次 action

- Phase 1 完了 marker 3 件 active で Phase 1 → 2 移行判定に進む
- Phase 2 の spec (現在は `tests/spec/gmo-fiat-bid/Phase1-*.md` のみ) を新規策定、 `tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md` として grilling 経路で確定
- Phase 2 の Issue 分割案を `Phase2-02-issue-breakdown.md` に落し込み、 dev-flow chain で順次実装

## Phase 2 bid 増額 flow (5 phase sequential、 Issue #3026)

Phase 2 で追加した fiat bid 増額 (topup) 経路の運用手順 SSOT。 grilling P3-b A 案 (5 phase sequential + 非同期 cleanup) を実装した Phase 2 Issue P2-2 / P2-4 の運用面 SSOT を本 section に集約する。

### 5 phase sequential 経路の概要

fiat bidder が同 auction 内で 2 回目以降の bid (増額) を実行する時、 backend topup handler (`packages/niji-api/src/handlers/fiat-bid/topup.ts`) が 5 phase を sequential に完走する。

| phase | 動作 | 失敗時 rollback |
|---|---|---|
| Phase A validation | request 検証 (status=bid-placed + 増額のみ + 100 万円上限) | 400 応答返却、 fiat_bid 変更なし |
| Phase B GMO 新 auth | SpotRateFetcher で ETH/JPY 換算 + entryTran + execTran で新 authId 発行 | Phase B fail は GMO 側で auth 未発生、 400 応答返却 |
| Phase C chain bid tx | BidRelay.placeBid で運営 EOA から chain bid tx broadcast | tx revert 時は Phase B 新 auth のみ alterTran VOID、 旧 auth 保持で bid-placed 維持 |
| Phase D 旧 auth cleanup enqueue | AuthCleanupQueue.enqueue(oldAuthId、 delayMs=5000) で 5 秒後 VOID | queue enqueue fail 時は Phase E に進まず 500 応答、 手動 cleanup |
| Phase E fiat_bid record 更新 | PK を新 authId に置換、 jpyAmount / ethAmount / spotRate 更新 | Phase E fail (DB 通信 fail 等) は Phase C 完了済で on-chain state と DB 不整合、 手動修復必要 |

### bid 増額 flow 運用手順

日常運用として観測すべき log と対応手順。

1. bid 増額を fiat bidder が実行した時、 backend log に以下 5 log が sequential 出力される (grep `[topup]`)
   - `[topup] Phase A: validation pass` (100 万円上限 / 増額のみ)
   - `[topup] Phase B: new auth issued` (新 authId + jpyAmount + ethAmount + spotRate)
   - `[topup] Phase C: bid tx broadcast` (txHash + fiat bidder wallet + auction contract)
   - `[topup] Phase D: cleanup enqueued` (旧 authId + delayMs=5000)
   - `[topup] Phase E: fiat_bid updated` (新 PK + 旧 PK)
2. Phase C revert 時は log `[topup] Phase C rollback: bid tx reverted, new auth voided` を確認、 fiat_bid.status=bid-placed 維持 + 200 応答 `{ status: "cancelled" }` を返却する経路
3. Phase E fail (grep `[topup] Phase E failed`) は on-chain state と DB 不整合状態、 運営 EOA で Base Sepolia の Bid event を index して手動 fiat_bid 復旧が必要
4. 増額 bid 頻度が急増 (1 auction あたり 3 回超) の場合は monitoring 対象、 GMO 与信枠消費が増えるため

### 旧 auth cleanup queue の運用観測

AuthCleanupQueue (`packages/niji-api/src/services/authCleanup/index.ts`) は 5 秒 delay + 1 req/sec rate limit + 3 回 retry で GMO alterTran VOID を実行する。

- 正常時 log は `[auth-cleanup] enqueue authId=xxx delayMs=5000` → `[auth-cleanup] dequeue authId=xxx` → `[auth-cleanup] VOID success authId=xxx` の 3 段
- retry 発火時 log は `[auth-cleanup] retry authId=xxx attempt=N` (最大 attempt=3)
- 3 回 fail 後の log は `[auth-cleanup] max retries exceeded authId=xxx`、 GMO 管理画面で該当 authId の与信枠を手動 VOID 実施 (60 日で自動失効するため緊急度低)
- queue が backend crash で消えた場合の orphan auth 検出は Phase 4 で追加、 Phase 2 では手動 audit で対応 (GMO 管理画面 vs fiat_bid table の差分検出)

## Phase 2 45 日超 fallback 運用 (Issue #3026)

45 日超 fallback は auction 期間が anti-sniping soft close で異常に延びた場合の safety net。 GMO 与信枠が 60 日で自動 revoke されるため、 45 日で先手を打って再 authorization を発火する。

### cron worker 動作確認手順

`packages/niji-api/src/services/reauthorization/index.ts` の `ReauthorizationWorker` が 1h 周期 (env `REAUTHORIZATION_INTERVAL_HOURS` で調整可能、 default 1) で fiat_bid table を scan する。

1. env `REAUTHORIZATION_WORKER_ENABLED=true` で cron worker が起動する opt-in 制御、 dev / test / codegen 時は false で起動抑制
2. env `REAUTHORIZATION_INTERVAL_HOURS` で scan 周期を上書き可能、 test 環境で頻度上げる時は 0.01 (36 秒) 等に短縮
3. worker 起動 log は `[reauth] worker started intervalHours=N`、 停止 log は `[reauth] worker stopped`
4. 各 scan 実行 log は `[reauth] scan cutoff=<45 日前 ISO 日時> eligible=N`、 N は 45 日超 record 件数
5. 各 record 処理 log は `[reauth] processing authId=xxx createdAt=<ISO>` → 成功時 `[reauth] success authId=xxx newAuthId=yyy` / 失敗時 `[reauth] failed authId=xxx reason=<GMO error>`
6. cron 動作確認は Railway (or 本番相当環境) の log console で 1h ごとに `[reauth] scan` log が出ることを確認、 出ない場合は worker 停止 (env or crash) 判定

### 再 authorization 失敗時対応

GMO 再 authorization (alterTran VOID + entryTran + execTran の 3 step) が fail した場合、 fiat_bid record 単位で以下 4 経路が発火する。

1. `fiat_bid.status = cancelled` に自動遷移 (Phase 1 の capture 失敗と同じ terminal state)
2. `onAlert(authId, reason)` callback で運営 alert log 出力 (`packages/niji-api` console.error stream に `[reauth] ALERT` 出力)
3. `onNotifyUser(fiatBid.userEmail, cancelReason)` callback で user 通知 email 送信 (Phase 1 の email template 再利用)
4. AuthCleanupQueue と経路分離 = reauth は 1 回 fail で cancel 確定、 AuthCleanup は 3 回 retry (棲み分けは Issue #3024 PR body SSOT)

失敗理由別の手動対応 policy。

- reason=`card 期限切れ` → user email で「card 期限が切れました、 別 card で再入札お願いします」 案内、 fiat_bid record は cancelled のまま
- reason=`与信不足` → user email で「card 与信枠が不足しています」 案内、 fiat_bid record は cancelled のまま
- reason=`GMO API 通信 fail` → 1h 待って手動 retry (Railway 管理画面で worker restart、 or 直接 `ReauthorizationWorker.runOnce()` を invoke)
- reason=`fraud 判定` → user email で「不正利用の疑いで decline されました、 GMO と card 会社にお問合わせください」 案内

### 45 日超 fallback の scope 境界

- Phase 2 では 45 日超 fallback を 1 回のみ実行する経路、 再 authorization 後さらに 45 日経過した場合の N 回目 fallback は Phase 4 で対応 (現状では実運用で 90 日超えは想定不可)
- 再 authorization で新 authId が発行された場合、 元 authId の cleanup は cron worker 内で完結 (AuthCleanupQueue とは経路分離、 alterTran VOID を 1 回のみ試行)
- auction settle 済 (fiat_bid.status = 3ds-verified / bid-placed 以外) の record は scan 対象外、 settle 経路が優先

## Phase 2 完了確認 (Issue #3026 Phase C、 3 marker 発行前提)

Phase 2 全 5 Issue merge 後、 以下を確認して 3 marker (test-passed + verify-passed + review-passed) を発行する。 Phase 1 完了確認 section と同じ経路。

### Phase 2 完了 Issue 一覧 (5 件)

| Issue | title | 主担当 file | 完了 status |
|---|---|---|---|
| #3022 | Ponder schema 拡張 + AuthCleanupQueue base infra | `packages/niji-api/src/services/authCleanup/index.ts` | merged |
| #3023 | bid 増額 topup endpoint | `packages/niji-api/src/handlers/fiat-bid/topup.ts` | merged |
| #3024 | 45 日超 auction fallback cron worker | `packages/niji-api/src/services/reauthorization/index.ts` | merged |
| #3025 | FiatBidModal 増額 bid branch + 5 phase stepper | `packages/niji-webapp/src/components/FiatBidModal/index.tsx` | merged |
| #3026 | Playwright e2e golden path + operations runbook | `packages/niji-webapp/tests/e2e/fiat-bid-topup.spec.ts` | 本 Issue |

### 3 marker 発行手順 (Phase 2 全 Issue merged 後)

`rules/quality.md` § test-passed marker 発行前提 の 3 条件を確認してから marker を発行する。

1. **test-passed** — 各 PR で behavior test 追加が完了しており、 `pnpm test` が全 pass。 marker file = `<repo>/.context/markers/test-passed-{repo-slug}-phase-2-gmo-fiat-bid.md`、 内容に「Phase 2 全 5 Issue の behavior test 状況表 + 実行 log 抜粋」 を記載
2. **verify-passed** — `/verify` skill で lint + typecheck + test + build が全 pass。 marker file = `verify-passed-{repo-slug}-phase-2-gmo-fiat-bid.md`
3. **review-passed** — `/code-review-router` で 4 pass review 完了、 blocking issue ゼロ。 marker file = `review-passed-{repo-slug}-phase-2-gmo-fiat-bid.md`

### Phase 2 → 3 移行 prerequisite

Phase 2 完了 marker 3 件 active で Phase 3 移行判定に進む。 Phase 3 は本番切替のため、 Phase 2 完了時点で以下 prerequisite を満たしていること。

- **GMO デモ環境再取得** — Phase 1 開始時に期限切れした GMO デモ環境の再契約 (Phase 3 実装前に GMO 側と契約更新)
- **GMO 本番契約締結** — 加盟店 ID / サイト ID / ショップパスワードの本番 credentials 取得、 1Password 加盟店 vault 保管
- **PCI DSS 監査** — card 決済経路の PCI DSS 準拠監査 (Phase 3 本番 release 前の gate 条件、 3DS 2.0 契約とセット)
- **AWS KMS 配線** — 運営 EOA 秘密鍵の env 直読 → KMS signer 切替 (`USE_KMS_SIGNER=true` feature flag)
- **Base Mainnet 移行** — chainId + RPC + contract 再 deploy、 subgraph endpoint 切替
- **3DS 2.0 本契約 activation** — GMO 3DS 2.0 の本番認証 activation (Phase 1 は demo 経路のみ)
- **spot rate mock 切替** (Issue #3061) — `USE_SPOT_RATE_MOCK=false` に切替、 実 GMO コイン API + CoinGecko fallback 経路を有効化する。 dev default は `true` で外部通信 0 の offline 動作、 本番 deploy 時は必ず `false` を確認する (誤 mock で実際の rate と乖離した bid が成立するリスク回避、 webapp 側の「dev mock」 badge 非表示化も同時確認)。 `MOCK_SPOT_RATE_JPY_PER_ETH` env は本番では無視されるが、 unset にしておく方が安全

### Phase 2 完了判定後の次 action

- Phase 2 完了 marker 3 件 active で Phase 3 移行判定に進む
- Phase 3 の spec 策定 (`tests/spec/gmo-fiat-bid/Phase3-*.md`) は本 Issue の scope 外、 別 session で grilling 経由確定する
- Phase 3 Issue 分割案 (`Phase3-02-issue-breakdown.md`) は Phase 2 → 3 移行 prerequisite 完了後に着手

## Base Sepolia 実機検証と落札監視 (2026-07-22)

Cloudflare Workers (`niji-api`) と Base Sepolia に deploy した構成で、 fincode テストカードによる与信から
代理入札までを実機で通した際の手順と、 その後の落札を追跡する経路。

### 与信から代理入札までの実機確認

webapp の dev server を deploy 済 backend に向けて起動し、 e2e 専用 page から実際に発火させる。

```bash
# 1. dev server 起動 (mode dev = Base Sepolia + deploy 済 Workers を向く)
pnpm --filter @niji/webapp exec vite --mode dev --port 2424 --strictPort

# 2. Workers の log を別 terminal で監視
pnpm --filter @niji/api exec wrangler tail --format pretty

# 3. browser で e2e 専用 page を開く (import.meta.env.DEV 限定 route)
open "http://localhost:2424/test/fiat-bid-form?auctionId=1&bidderWallet=<受取 wallet>&minBidEth=0.0102"
```

page 上で入札額を入力し、 規約に同意して submit すると以下が順に起きる。

1. `POST /api/v1/fiat-bid/authorize-fincode` — fincode 与信、 応答に `authId` と `ethAmount` が入る
2. `POST /api/v1/fiat-bid/place-bid` — operator EOA が `createBid` を発行、 応答に `txHash` が入る

Workers の log には以下の 3 行が順に出る。 3 行目の `ethAmount` が 2 行目と一致していれば、
与信時に確定した ETH 量がそのまま chain に渡っている。

```
[worker] KV put capture:<authId>
[worker] insertPending authId=<authId> status=pending ethAmount=<wei> rate=<JPY/ETH>
[worker] place-bid REAL: authId=<authId> auctionId=<N> jpy=<円> rate=<JPY/ETH> ethAmount=<wei> bidder=<wallet> txHash=<hash>
```

`capture record に ethAmount 無し、 rate ... で再換算 (移行期 fallback)` が出た場合は、
`insertPending` が KV に届いていない。 その入札は place-bid 時点の rate で換算されており、
与信額と入札額がずれるため log を確認する。

入札額は最低入札条件を満たす必要がある。 `reservePrice` (0.001 ETH) と
`minBidIncrementPercentage` (2%) の両方を上回る額を入れる。 現在の最高額が 0.01 ETH なら
0.0102 ETH 以上、 spot rate 315,000 円なら 3,220 円以上が必要になる。

### 落札 (settle) の監視

auction は 24 時間続くため、 入札直後に落札結果は分からない。
`watch-settlement` script が現在どの段階にいるかを表示する。

```bash
pnpm --filter @niji/api watch:settlement              # 1 回だけ表示
pnpm --filter @niji/api watch:settlement -- --watch   # 60 秒毎に再表示
pnpm --filter @niji/api watch:settlement -- --token 1 # 指定 tokenId の所有者も確認
```

段階は 4 つで、 script が判定して出力する。

| 段階 | 状態 | 次に起きること |
|---|---|---|
| (1) 入札中 | `endTime` 未到達 | 最高額入札者が operator EOA なら fiat 入札が勝っている |
| (2) 終了待ち | `endTime` 経過 かつ `settled=false` | AuctionKeeper (cron 1 分毎) が `settleCurrentAndCreateNewAuction` を送る |
| (3) settle 済 | 次 auction 開始済 | SettlementDaemon が `AuctionSettled` を拾い capture と transferFrom を実行 |
| (4) 引渡し済 | 落札 tokenId の owner が入札者 wallet | 完了 |

(3) から (4) に進まない場合は fincode の capture が失敗している可能性が高い。
`wrangler tail` に `[cron] fincode capture FAIL` が出ていないか確認する。
capture が失敗した場合、 SettlementDaemon は transferFrom に進まず NFT は operator に留まる
(与信できていない NFT を渡さないための設計)。

env で対象を差し替えられる。 `RPC_URL` / `AUCTION_HOUSE_ADDRESS` / `NIJI_TOKEN_ADDRESS` /
`OPERATOR_ADDRESS` / `CHAIN_ID` を指定すると別 chain や別 deploy を監視できる。

### 3DS 2.0 経路 (2026-07-22 実装)

3DS が必要なカードでも入札が成立する経路。 `wrangler.toml` の `TDS2_RET_URL` の有無で挙動が変わる。

**未設定時** は authorize が fincode に `tds2_ret_url` を渡さないため、 fincode は 3DS を要求せず
常に `status: AUTHORIZED` を返す。 webapp は `tds2Url === undefined` の分岐に入り、
認証を挟まず place-bid を自動発火する (2026-07-21 の実機検証はこの経路)。

**設定時** は 3DS 必須カードで `status: AUTHENTICATED` と `acs_url` が返り、 以下の順に進む。

1. webapp が `acs_url` に遷移し、 カード会社の認証画面を表示する
2. 認証後 fincode が `TDS2_RET_URL` (`/fiat-bid/3ds-return`) に `MD` = access_id 付きで戻す
3. `ThreeDSReturn` が `POST /api/v1/fiat-bid/3ds-callback-fincode` を呼ぶ
4. backend が `PUT /v1/secure2/{access_id}` で認証実行、 結果コードで分岐する
5. `Y` / `A` なら `PUT /v1/payments/{id}/secure` で認証後決済実行まで進め、 与信が確定する
6. webapp が続けて `POST /api/v1/fiat-bid/place-bid` を呼び、 代理入札を発火する

認証が通っただけでは与信は確定しない。 手順 5 を飛ばすとカードに枠が取られないまま入札が成立する。

**結果コードの分岐**

| `tds2_trans_result` | 意味 | backend の応答 | webapp の挙動 |
|---|---|---|---|
| `Y` / `A` | 認証成功 / 認証試行 | `3ds-verified` | place-bid に進む |
| `C` | チャレンジ認証が必要 | `challenge-required` + `challengeUrl` | `challengeUrl` に遷移、 戻ったら `retry=1` で再呼出 |
| `N` / `U` / `R` / 未返却 | 拒否 / 認証不能 | `cancelled` | 理由を出して終了、 カード請求は発生しない |

**チャレンジ認証からの復帰**

`challengeUrl` から戻る際は `?MD={access_id}&retry=1` で `/fiat-bid/3ds-return` に入る。
`retry=1` のとき backend は `PUT /v1/secure2` ではなく `GET /v1/secure2` で結果だけを取り直す。
チャレンジ完了後に認証実行を再送すると結果が変わり得るため、 取得のみに切替えている。

**pending state の扱い**

`bidderWallet` は 3DS の redirect を跨ぐと失われるため、 `ThreeDSRedirect` が localStorage に保存した
`FiatBidPendingState` から復元して place-bid に渡す。 backend の place-bid は `bidderWallet` 欠落時に
400 を返すので、 復元できない場合は place-bid を呼ばずに失敗表示に落とす。
チャレンジ遷移時は復帰後に再利用するため pending state を消さない。

### 現状の制約 (2026-07-22 時点)

**place-bid の移行期 fallback**

`place-bid` には「`capture:{authId}` に `ethAmount` が無ければ spot rate で再換算する」 分岐がある。
これは KV に `ethAmount` を保存する変更を deploy した時点で認証済だった record を救うためのもので、
KV の TTL 1 時間が経過すると到達不能になる。 次にこの file を触る際に対応 test ごと削除する。

## 関連 SSOT

- `packages/niji-api/scripts/watch-settlement.ts` — 落札監視 script SSOT
- `packages/niji-api/src/workers/authorize-fincode-worker.ts` — Cloudflare Workers entry (authorize / place-bid / spot-rate / cron) SSOT
- `tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md` — Phase 1 master spec
- `tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md` — 8 Issue 分割案
- `tests/spec/gmo-fiat-bid/Phase1-05-impact-analysis.md` — 影響範囲分析
- `tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md` — Phase 2 master spec (bid 増額 + 45 日超 fallback)
- `tests/spec/gmo-fiat-bid/Phase2-02-issue-breakdown.md` — Phase 2 5 Issue 分割案
- `packages/niji-api/src/mocks/gmo-server.ts` — MSW handler 実装 SSOT
- `packages/niji-api/src/mocks/index.ts` — conditional 起動 helper SSOT
- `packages/niji-api/src/handlers/fiat-bid/topup.ts` — Phase 2 topup 5 phase sequential handler SSOT
- `packages/niji-api/src/services/authCleanup/index.ts` — Phase 2 async cleanup queue SSOT
- `packages/niji-api/src/services/reauthorization/index.ts` — Phase 2 45 日超 fallback cron worker SSOT
- `packages/niji-webapp/tests/e2e/fiat-bid-topup.spec.ts` — Phase 2 topup golden path e2e (Phase 3 activate)
