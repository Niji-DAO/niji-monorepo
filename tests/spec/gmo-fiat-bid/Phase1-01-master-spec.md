# Phase 1 Master Spec — GMO クレカ auction 統合 MVP

## タスクサマリ

Niji auction に GMO PGマルチペイメント経由のクレカ決済 (fiat bid) 導線を追加する Phase 1 MVP を実装する。
Base Sepolia + GMO mock server 環境で fiat bid 1 発 → winner capture → 運営 EOA から user wallet に NijiToken transferFrom の e2e 動作を検証可能にする。

## 前提設計 (grilling P1-P8 確定 SSOT)

- 販売形態 — 既存 NijiAuctionHouseV3 の auction 経路を維持、 fiat bidder 参加 option を追加、 contract 完全無改修
- 決済モデル — bid 時に GMO authorization hold + winner のみ capture の与信枠モデル
- fund flow — 運営 EOA が JPY→ETH spot rate 換算して代理 ETH bid tx 発火、 auction settle で ETH treasury 送金、 gas + ETH 送金は運営 JPY 対価受領を根拠に負担
- spot rate — GMO コイン API primary + CoinGecko fallback + bid tx 発火直前 fetch (5 秒 cache) + 2% 許容幅 + JPY 固定 SSOT (auction contract は ETH 記録の 2 層構造)
- 加盟店 — GMO PGマルチペイメント デジタルコンテンツ category 契約、 3D セキュア 2.0、 settle 即時 mint で資金決済法 63 条の 22 の 4 前受金分離管理義務閾値回避
- 異常系 SSOT — auction contract on-chain settle が絶対、 事前 defense (与信枠 pre-flight + 3DS 強制 + bid 上限 100 万円) + 事後 recovery (capture fail は運営 JPY 補填 / transfer fail は retry 3 回 / chargeback は運営全損吸収)
- UI stance — wallet 接続必須、 auction ページ 2 boxes 並置 (「ETH で bid」 既存 / 「クレカで bid (JPY)」 新規 fiat modal)、 3DS full redirect、 4 段 stepper
- mint タイミング — auction settle で NijiToken は運営 EOA に mint、 GMO capture 完了確認後に運営 EOA から user wallet に transferFrom

## 受入条件 (AC、 YES/NO 検証可能)

- AC 1 — Base Sepolia 上で fiat bidder が webapp `/` で「クレカで bid (JPY)」 ボタン → JPY 額入力 → 現在 spot rate 表示 → ETH 換算表示 → Terms checkbox → bid 実行、 GMO mock で与信枠 authorization 成功 → 運営 EOA が代理 ETH bid tx 発火 → NijiAuctionHouseV3 に BidPlaced event が emit される
- AC 2 — auction 終了時に fiat winner が確定した場合、 webapp modal「クレカ決済を確定します」 + 3DS 追加認証 (mock) → GMO capture 成功 → 運営 EOA から user connected wallet address に NijiToken.transferFrom が実行される
- AC 3 — GMO 与信枠取得失敗 (mock で fail 応答) 時、 bid tx は発火せず user に「決済確保失敗、 再試行」 通知が表示される
- AC 4 — fiat bidder の JPY 入力額が現在 spot rate で ETH 換算した値と 2% 超乖離した場合、 user 再確認 modal (「新 rate {X} JPY/ETH で bid 額 {Y} JPY 相当になります、 続行 or cancel」) が表示される
- AC 5 — bid 上限 100 万円 / bid を webapp + backend の 2 層で強制、 100 万円超入力時に modal 表示 + bid 不可
- AC 6 — webapp footer に「特定商取引法に基づく表記」 link + `/legal/tokushoho` 静的 page が表示され、 販売者名 / 住所 / 電話 / 代表者 / 販売価格 / 支払方法 / 商品引渡時期 / 返品ポリシー NFT 特性上不可 の全項目を記載
- AC 7 — GMO capture 失敗時、 backend log + 運営通知経路で失敗検知 + `docs/operations/gmo-fiat-bid.md` の runbook に基づく手動 JPY 補填手順が実行可能な状態にある
- AC 8 — Playwright e2e test で「fiat bidder が bid → 落札 → capture → transferFrom」 の golden path が Base Sepolia + GMO mock 環境で 1 spec で pass

## スコープ境界

### in (本 Phase で対応)

- GMO PGマルチペイメント SDK 導入 + mock server (MSW or Prism) + env 変数整備
- 与信枠 authorize endpoint / 3DS callback endpoint / bid 発火 endpoint / capture endpoint / transferFrom trigger の 5 endpoint
- webapp Bid component 拡張 (fiat modal + 4 段 stepper + JPY 入力 + spot rate 表示 + Terms checkbox)
- 落札後 webapp modal + email 通知 + `/legal/tokushoho` 静的 page
- 運営 EOA 鍵管理 + 異常系 runbook の operations doc
- Playwright e2e test (golden path 1 spec)

### out (本 Phase で対応しない、 Phase 2 以降)

- bid 増額対応 (P3-b の 5 phase sequential 再 authorization) → Phase 2
- 45 日超 auction 対応 (再 auth fallback API 実装) → Phase 2
- Base Mainnet 切替 (env + contract address + subgraph endpoint) → Phase 3
- GMO 本番環境切替 (3DS 本番認証 / PCI DSS 監査) → Phase 3
- retry queue + 監視 dashboard + 運営 alert 自動化 → Phase 4
- Stripe fallback provider → Phase 4 (or GMO revoke 時のみ)
- GMO デモ環境再取得 (現在期限切れ、 Phase 1 は mock server で完結、 実 GMO API は Phase 2 前に再連絡)

## 反例ケース

- 反例 1 — bid 増額 (同 fiat bidder が同 auction に上乗せ bid) → Phase 1 では実装しない、 fiat modal で「既存 bid あり」 の場合は「Phase 2 で対応予定」 表示 + bid 不可
- 反例 2 — wallet 未接続 fiat bidder → wallet connect 必須 UI で bid 不可、 「MetaMask をインストールしてください」 tutorial link 表示のみ (custody 経路実装しない)
- 反例 3 — chargeback 発生 → Phase 1 では GMO mock なので chargeback シナリオ発生不可、 実装は Phase 3 本番切替時、 Phase 1 は運営全損吸収 policy の doc 化のみ
- 反例 4 — auction 45 日超 (soft close 連続発火) → Phase 1 では 24h auction default のみ検証、 45 日超 fallback は Phase 2

## 影響範囲 (touched file 候補)

### packages/niji-webapp (React + Vite + wagmi)

- `src/components/Bid/index.tsx` — 既存 240 行、 「クレカで bid (JPY)」 button + fiat modal 呼出 追加
- `src/components/FiatBidModal/index.tsx` — 新規、 JPY 入力 / spot rate 表示 / Terms checkbox / stepper
- `src/components/FiatSettlementModal/index.tsx` — 新規、 落札後の 3DS 追加認証 + capture 実行 modal
- `src/pages/Legal/Tokushoho.tsx` — 新規、 特商法 static page
- `src/index.tsx` — footer link 追加、 `/legal/tokushoho` route 追加
- `src/state/atoms/auctionAtom.ts` — fiat bid 状態管理 atom 追加

### packages/niji-api (Ponder + hono)

- `src/index.ts` (新規想定) or 既存 hono handler — GMO integration endpoint 5 本 (authorize / 3ds-callback / place-bid / capture / transferFrom-trigger)
- `src/services/gmo/client.ts` — 新規、 GMO PG API client + mock server config
- `src/services/spotRate/index.ts` — 新規、 GMO コイン API primary + CoinGecko fallback fetcher
- `src/services/bidRelay/index.ts` — 新規、 運営 EOA 代理 bid tx sign + broadcast (viem)
- `src/services/settlement/index.ts` — 新規、 auction settle 監視 + transferFrom trigger
- `ponder.schema.ts` — fiat bid tracking DB schema 追加 (bidder email / auth ID / JPY 額 / status)
- `.env.example` — GMO / spot rate / 運営 EOA 鍵 env 変数追加

### packages/niji-contracts

- 完全無改修 (grilling 確定)

### packages/niji-subgraph

- 完全無改修 (Phase 1 では fiat 落札は ETH bid として記録される、 fiat / crypto の区別は backend DB 側管理のみ)

### docs

- `docs/operations/gmo-fiat-bid.md` — 新規、 運営 EOA 鍵管理 / GMO 契約情報 / mock 環境切替手順 / 異常系対応 runbook

### tests

- `packages/niji-webapp/tests/e2e/fiat-bid.spec.ts` — 新規、 Playwright golden path spec

## 既知のリスク・前提

- GMO デモ環境が期限切れで現在利用不可、 Phase 1 は mock server (MSW or Prism) で e2e 検証、 実 GMO API 検証は Phase 2 前に GMO 側再連絡 + デモ環境再取得が prerequisite
- 運営 EOA 秘密鍵の管理経路 (env 変数直書き禁止、 KMS / 1Password / hardware wallet の選定は運用 doc で確定)
- Ponder framework が payment orchestration に適するか要検証、 過負荷時は Vercel Functions 等の別 service 分離を Phase 2 で検討
- Base Sepolia RPC の rate limit + Sepolia ETH faucet 供給が e2e test 頻度に影響
- 特商法表記の販売者名 / 住所は運営会社確定情報が必要 (grilling 段階で未確定、 Phase 1 実装前に user 確認)
