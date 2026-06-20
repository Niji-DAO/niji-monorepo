# test-spec — Phase A webapp 主要 UX 拡充

Niji webapp の主要 UX 4 module (Faucet / Settle Nijider / NavBar+Footer / Auction Render) の E2E test 仕様を 1 file 集約。

## 対象機能

| module | scope |
|---|---|
| Faucet | `/faucet` page (anvil 31337 限定)。 wallet 未接続でも accounts 一覧 / address 入力で ETH 送付 ボタン使用可、 anvil_setBalance + anvil_mine 経路 |
| Settle Nijider | `NijiContent` の SettleManuallyBtn (Nijider 枠 + auctionEnded + wallet 接続済) |
| NavBar+Footer | Crystal Ball link 存在、 Footer LP/Crystal Ball 追加、 Footer X = niji_dao、 Map 削除 |
| Auction Render | Nijider 枠 (Niji 0) の niji.eth / 「-」 表示、 通常 auction の Time left / Bid input 描画 |

## 仕様の要約

`tests/e2e/{faucet,settle-niji0,navbar-footer,auction-render}.spec.ts` の 4 spec を順次走らせて全 module 動作確認。 anvil 8547 + deploy 済 + auto-settler 並走前提 (global-setup.ts が立てる)。

## 主な品質リスク

| 軸 | 評価 |
|---|---|
| 売上影響 | 低 (全 dev 影響範囲) |
| セキュリティ | 低 (read-heavy + 公開 anvil 経路) |
| データ破壊 | 中 (Faucet の anvil_setBalance は state 直書き、 wallet 反映漏れ regression あり) |
| 利用頻度 | 高 (Faucet / Settle / Crystal Ball は dev 主要 path) |
| 過去障害 | 高 (Faucet で MetaMask 残高未反映 / Niji 0 表示崩れ / nounsdao 誤 link 等の bug あり) |

→ **総合リスク = 中**

## 推奨テスト構成

E2E (本仕様書) のみ、 Playwright + @kiwa-test/core。 単体 / 統合は scope 外。

## テスト観点一覧

1 正常系 / 2 異常系 / 3 境界値 / 4 状態遷移 / 7 冪等性 / 11 回帰 / 12 UI feature 網羅

## テストケース一覧

### Faucet (`tests/e2e/faucet.spec.ts`)

| ID | レベル | 観点 | 前提 | 入力 | 手順 | 期待 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| FC-001 | E2E | 正常系 | anvil 8547 起動済 | `/faucet` を開く | (1) goto (2) NavBar wait | Faucet h1 + 「1. ETH を送付」 / 「2. Anvil 標準アカウント」 section 表示 | 高 | 推奨 |
| FC-002 | E2E | UI feature | 同上 | accounts 一覧 | (1) goto (2) 11s 待ち balance polling | 10 件の anvil account 行 + 各 balance ≠ '—' | 高 | 推奨 |
| FC-003 | E2E | 正常系 | 同上 | 0x90F7...b906 (anvil #3) に 50 ETH 送付 | (1) goto (2) address 入力 (3) 50 入力 (4) ETH を送る click (5) anvil RPC で balance 確認 | balance が事前+50 ETH に増加 (anvil_mine 後 chain state 確実反映) | 高 | 推奨 |
| FC-004 | E2E | 異常系 | 同上 | 不正 address 入力 (`0xNOT_VALID`) | (1) ETH を送る click | toast error 「送付先 address が不正です」 | 中 | 推奨 |

### Settle Nijider 枠 (`tests/e2e/settle-niji0.spec.ts`)

| ID | レベル | 観点 | 前提 | 入力 | 手順 | 期待 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| SN-001 | E2E | 状態遷移 | Niji 0 (Nijider 枠) | `/niji/0` 開く | (1) goto (2) wait | Nijider 枠 UI (niji.eth / 「-」) 描画、 SettleManuallyBtn は wallet 未接続なら出ない | 中 | 推奨 |
| SN-002 | E2E | UI feature | 同上 | NijiContent 描画 | (1) goto (2) wait | 「詳細はこちら →」 link 表示 + niji.eth テキスト | 中 | 推奨 |

(Playwright 既定で wallet 未接続なので SettleManuallyBtn の click test は kiwa fixture の wallet inject 経路で別途、 ここでは「button が wallet 未接続時に出ない」 を確認)

### NavBar + Footer (`tests/e2e/navbar-footer.spec.ts`)

| ID | レベル | 観点 | 前提 | 入力 | 手順 | 期待 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| NF-001 | E2E | UI feature | top page | `/` 開く | (1) goto (2) wait | Footer に「LP」 link / 「Crystal Ball」 link 存在 | 高 | 推奨 |
| NF-002 | E2E | 回帰 | top page | `/` 開く | (1) goto | Footer に「Map」 link 不在 (nounspot.com 削除済) | 中 | 推奨 |
| NF-003 | E2E | 回帰 | top page | `/` 開く | (1) goto | Footer の X icon link が `x.com/niji_dao` (nounsdao でない) | 中 | 推奨 |
| NF-004 | E2E | UI feature | top page | NavBar Explore Dropdown | (1) goto (2) Crystal Ball link locator | desktop の Explore Dropdown に「Crystal Ball 🔮」 が含まれる | 高 | 推奨 |
| NF-005 | E2E | UI feature | anvil chain | `/` 開く | (1) goto | NavBar に「Faucet」 link 表示 (chain 31337 のみ) | 中 | 推奨 |

### Auction Render (`tests/e2e/auction-render.spec.ts`)

| ID | レベル | 観点 | 前提 | 入力 | 手順 | 期待 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| AR-001 | E2E | 正常系 | Niji 0 Nijider 枠 | `/niji/0` | (1) goto (2) wait | niji.eth 表示 + 「-」 表示 (= Nijider 枠の落札なし) | 高 | 推奨 |
| AR-002 | E2E | 正常系 | 通常 auction (auto-settler で Niji 1+ active) | `/` | (1) goto (2) wait | SVG image 描画 + Niji # タイトル | 高 | 推奨 |
| AR-003 | E2E | 回帰 | 全画面共通 | `/` | (1) goto (2) console error 収集 | BigInt serialize / pageerror 0 件 | 高 | 推奨 |

## 自動化すべきテスト

全 14 件 自動化推奨 (Phase A の主要 UX 動作確認、 4 round 連続 PASS で flaky 0 担保)。

## 手動確認でよいテスト

(なし) — wallet 接続経由の Bid / Settle 実行系は kiwa fixture の wallet inject で将来 cover、 別 PR で Issue 起票。

## 不足している仕様

- wallet 接続込みの Bid / Settle 実行 e2e (kiwa fixture `dappE2eTest` の wallet inject 経路で別 PR で追加)
- Vote / DAO / Proposal 系 (subgraph 依存、 dev 環境で test 不可、 別 PR)
- LP page 内の link click 動作 (LP は静的 HTML、 別 PR)

## Layer 2 連携

本仕様書から `tests/e2e/{faucet,settle-niji0,navbar-footer,auction-render}.spec.ts` を生成、 既存 chain-past-auctions / crystal-ball spec と合わせて 13+14 = 27 TC で kiwa 化覆い。
