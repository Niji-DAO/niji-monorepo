# test-spec — chain-past-auctions (subgraph 未起動 dev 環境の過去 auction fallback)

## 対象機能

Niji webapp の Auction page (`/` および `/niji/:id`) で、 **前後ボタン (←/→) によって過去 Niji を辿る** 機能。

通常 prod では The Graph subgraph (`config.app.subgraphApiUri`) から過去 auction (auctions / bids) を取得して redux `pastAuctions` slice に流し込み、 `useOnDisplayAuction()` 経由で UI が解決する。 dev 環境 (anvil chain 31337) では subgraph 未起動が default なので `subgraphApiUri = ''`、 従来は `pastAuctions = []` のままで過去 Niji 表示時に WTF? 画面に落ちていた。

本機能で **chain 直叩き fallback** (`src/hooks/useChainPastAuctions.ts`) を導入し、 `viem.publicClient.getLogs` で AuctionCreated / AuctionSettled / AuctionBid event を読んで `GetLatestAuctionsQuery` 形式に整形 + reducer `addPastAuctions` に dispatch する経路を加えた。

## 仕様の要約

### 入力

- subgraph URL (`config.app.subgraphApiUri`) の有無で経路分岐
  - 非空 → 既存 subgraph 経路 (`execute(latestAuctionsQuery, ...)`)
  - 空 → chain 直叩き fallback (`useChainPastAuctions()`)
- chain 上の event 3 種
  - `AuctionCreated(uint256 indexed nounId, uint256 startTime, uint256 endTime)`
  - `AuctionSettled(uint256 indexed nounId, address winner, uint256 amount)`
  - `AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended)`
- chain RPC = `http://127.0.0.1:8547` (anvil)
- AuctionHouse Proxy = `0x1Dbbf529D78d6507B0dd71F6c02f41138d828990` (deploy-niji-full の決定論的 deploy)

### 出力

- `pastAuctions` slice (`GetLatestAuctionsQuery` shape) に過去 auction が array で詰まる
- 各 auction entry の field 例 — `id, amount(string), settled(bool), startTime(string), endTime(string), bidder({id}), noun({id, owner.id}), bids([{amount, bidder.id, ...}])`
- 全 bigint 値は string 化 (JSON serialize 互換、 BigInt → toString())

### ユーザー操作

| step | 操作 | UI 反応 |
|---|---|---|
| 1 | top page `/` を開く | 現在 active な auction (最新 Niji) が描画される |
| 2 | 「←」 ボタン click | URL が `/niji/{N-1}` へ navigate、 過去 Niji が描画 |
| 3 | 「←」 を繰り返す | Niji N-2, N-3, ... と古い方へ進める |
| 4 | 「←」 が `disabled` (= `isFirstAuction`) になったら止まる | Niji 0 で `disabled=true` |
| 5 | 「→」 ボタン click | URL `/niji/{N+1}` へ、 新しい方へ戻る |
| 6 | 「→」 が `disabled` (= `isLastAuction`) になったら止まる | 最新 Niji で `disabled=true` |

### UI feature 一覧 (Step 1.5 grep 結果)

| UI element | grep ヒット位置 | 対応 TC |
|---|---|---|
| 前ボタン (`←` テキスト、 `disabled={isFirstAuction}`) | `src/components/AuctionNavigation/index.tsx:74` | TC-001, TC-002, TC-006 |
| 次ボタン (`→` テキスト、 `disabled={isLastAuction}`) | `src/components/AuctionNavigation/index.tsx:81` | TC-001, TC-003, TC-007 |
| Niji 画像 (`<img src="data:image/svg+xml;base64,...">`) | `src/components/Niji/`, `src/components/NijiContent/index.tsx:116` | TC-001, TC-004, TC-005 |
| Niji # タイトル (`Niji {N}` テキスト) | `src/components/AuctionActivityNijiTitle/`, `src/components/NijiContent/index.tsx:116` | TC-001, TC-005 |
| ArrowLeft / ArrowRight キーボード入力 | `src/components/AuctionNavigation/index.tsx:29-44` | TC-008 |
| URL pattern `/niji/{id}` | `src/App.tsx:60`, `src/utils/history.ts:1` | TC-002, TC-003 |

### 権限モデル

- UI 操作には wallet 接続不要 (閲覧のみ)
- chain event 読取に署名不要 (`getLogs` は public read)
- prod では subgraph endpoint が public read

### 失敗 mode

- anvil 停止 → `getLogs` が `ERR_CONNECTION_REFUSED`、 hook 失敗、 fallback も停止
- chain に AuctionCreated event なし (deploy 直後) → past auction = 0 件、 前ボタン disabled
- BigInt serialize エラー (queryKey に bigint 混入) → React component が unmount で空画面 (本機能で fix 済)

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 低 | dev 専用 fallback、 prod (Base Sepolia) では subgraph 経路を保つので売上に影響しない |
| セキュリティ影響 | 低 | public read のみ、 署名 / 認証経路を持たない |
| データ破壊リスク | 中 | redux slice に不正 shape が流れると UI 全体が unmount、 ただし read-only fetch で chain state は破壊しない |
| 利用頻度 | 高 | dev で日常的に使う動作 (auction 開発の主要 flow) |
| 過去障害履歴 | 高 | WTF? 空画面で UX 崩壊 / BigInt serialize bug で前ボタン押下時に React 死亡 / address mismatch で 1 度復旧不可能になった経緯あり |

### 総合リスク判定

| 軸 | 結果 |
|---|---|
| 売上 / セキュリティ / データ破壊 のいずれかが高 | データ破壊 = 中、 売上 / セキュリティ = 低、 → 高に該当せず |
| 利用頻度 / 過去障害履歴 のいずれかが高 | 利用頻度 = 高、 過去障害履歴 = 高、 → 中 |
| 全基準「低」 | 該当せず |

→ **総合リスク = 中**

## 推奨テスト構成

| layer | 役割 | runner |
|---|---|---|
| E2E (本仕様書) | webapp UI + chain (anvil) で end-to-end 動作、 前後ボタン / 過去 Niji 描画 / fallback hook 動作 | Playwright + @kiwa-test/core (dappE2eTest fixture)、 anvil 8547 + deploy-niji-full + auto-settler 前提 |
| 単体 (補完) | `useChainPastAuctions` hook の戻り値 shape 検証 | Vitest (将来別 PR) |
| 統合 (補完) | `addPastAuctions` reducer の dispatch 経路 | Vitest + redux-mock-store (将来別 PR) |

本 spec は E2E のみを対象。 単体 / 統合は scope 外。

## テスト観点一覧

| # | 観点 | 適用判断 |
|---|---|---|
| 1 | 正常系 | 必須 |
| 2 | 異常系 | anvil 停止 / event 0 件 で必須 |
| 3 | 境界値 | Niji 0 (= 最古) / Niji N (= 最新) の前後ボタン disabled |
| 4 | 状態遷移 | 「最新表示 → 過去表示 → 最新復帰」 の navigation 遷移 |
| 5 | 権限 | 該当なし (閲覧のみ、 wallet 不要) |
| 6 | 入力バリデーション | 該当なし (UI button のみ、 入力 form なし) |
| 7 | 冪等性 | 同じ URL を直接開いた時と前ボタン経由で着いた時で同じ表示 |
| 8 | 並行処理 | auto-settler が走っている間も前後ボタンが破綻しない |
| 9 | 性能 | 該当なし (anvil 小規模、 event 数 < 100) |
| 10 | セキュリティ | 該当なし (public read のみ) |
| 11 | 回帰 | BigInt serialize bug 再発防止 (queryKey に bigint 混入で React unmount) / address mismatch 再発防止 (SDK 固定 address と deploy 結果一致) |
| 12 | UI feature 網羅 | 前後ボタン disabled 状態 / キーボード操作 (Step 1.5 grep より) |

## テストケース一覧

### 観点 1: 正常系

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | E2E | 正常系 | anvil 8547 起動済 + deploy-niji-full 完了 + auto-settler で Niji 1 以上 | `/` を開く | (1) page.goto('/') (2) NavBar の Niji ロゴ描画を待つ (3) chain hook の 10s polling を待つ | (a) Niji 画像 (data:image/svg+xml;base64,) が描画される (b) `Niji {N}` タイトルが見える (c) console error 0 件 (BigInt serialize なし) | 高 | 推奨 |
| TC-004 | E2E | 正常系 | TC-001 完了状態 (Niji N が現在表示) | URL を `/niji/0` に直接 navigate | (1) page.goto('/niji/0') (2) 表示完了を待つ | Niji 0 の image / タイトル / 落札者 (niji.eth) が描画される (Nijider 枠) | 高 | 推奨 |

### 観点 2: 異常系

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-009 | E2E | 異常系 | anvil 8547 起動済 + chain に AuctionCreated event 0 件 (fresh anvil + unpause 直後の極短い window) | top page を開く | (1) page.goto('/') | 現在の Niji 0 (active auction) のみ描画、 前ボタンは disabled、 console error 0 件 | 中 | 推奨 |

### 観点 3: 境界値

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-006 | E2E | 境界値 | Niji 0 表示状態 | `/niji/0` を開く | (1) page.goto('/niji/0') (2) 前ボタン locator | 前ボタン (`←`) の `disabled` 属性が true (押せない) | 中 | 推奨 |
| TC-007 | E2E | 境界値 | 最新 Niji 表示状態 (top page) | `/` を開く | (1) page.goto('/') (2) 次ボタン locator | 次ボタン (`→`) の `disabled` 属性が true (押せない) | 中 | 推奨 |

### 観点 4: 状態遷移

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-002 | E2E | 状態遷移 | TC-001 完了 + chain hook fetch 完了 | top page から前ボタン 1 回押下 | (1) page.goto('/') (2) 11s 待ち (chain hook polling) (3) 前ボタン click | URL が `/niji/{N-1}` へ遷移、 過去 Niji の image / タイトルが描画、 WTF? に落ちない | 高 | 推奨 |
| TC-003 | E2E | 状態遷移 | TC-002 完了 (`/niji/{N-1}` 表示中) | 次ボタン 1 回押下 | (1) 次ボタン click | URL が `/niji/{N}` (= 直前の現在 Niji) へ戻る、 描画される | 高 | 推奨 |
| TC-005 | E2E | 状態遷移 | Niji が 3 以上進んでいる状態 (auto-settler で確保) | 前ボタンを 3 回連打 | (1) 前ボタン click 3 回 (各 click 後 1.5s 待ち) | 3 回目で `/niji/{N-3}` に到達、 各 step で Niji 描画失敗なし | 中 | 推奨 |

### 観点 7: 冪等性

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-010 | E2E | 冪等性 | Niji 1 が存在 | 同じ Niji を 2 経路で表示 | (1) 直接 `/niji/1` (2) `/` → 前ボタン経由で `/niji/1` | 両経路で同一 Niji image / 同一落札情報が描画される | 低 | 推奨 |

### 観点 8: 並行処理

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-011 | E2E | 並行処理 | auto-settler 稼働中 (5 秒 polling で Niji を自動進行) | top page を 30 秒間開きっぱなし | (1) page.goto('/') (2) 30 秒待ち中に複数回 auto-settle が発火 | UI が再描画される度に新しい Niji へ追従、 WTF? に落ちない、 console error 0 件 | 中 | 推奨 |

### 観点 11: 回帰

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-012 | E2E | 回帰 | NijiInfoRowHolder の queryKey BigInt bug fix 後 | 過去 Niji 表示 | (1) `/niji/0` を開く (2) console error を全件収集 | `pageerror: Do not know how to serialize a BigInt` が含まれない | 高 | 推奨 |
| TC-013 | E2E | 回帰 | SDK 固定 address (`0x59b6...857b`) と deploy 結果一致 | top page を開く | (1) page.goto('/') (2) chain hook 経由で auctions が 1 件以上取得 | hook console log `[chain-past] fetched auctions= N (N>=1)` が出る、 auction code は AuctionHouse Proxy に存在 | 中 | 推奨 |

### 観点 12: UI feature 網羅

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-008 | E2E | UI feature 網羅 | top page 表示中 | ArrowLeft / ArrowRight キー押下 | (1) page.goto('/') (2) page.keyboard.press('ArrowLeft') | URL が `/niji/{N-1}` へ遷移、 ボタン click と同等の動作 | 中 | 推奨 |

## 自動化すべきテスト

優先度順 (高 → 中 → 低)。

- TC-001 / TC-002 / TC-003 / TC-004 / TC-012 (高 — 主要 navigation + 回帰)
- TC-005 / TC-006 / TC-007 / TC-008 / TC-009 / TC-011 / TC-013 (中 — 境界値 / 異常系 / 並行 / 回帰補強)
- TC-010 (低 — 冪等性、 副次的)

## 手動確認でよいテスト

(なし) — 全て自動化推奨。 spec が dev 環境前提なので flaky 化リスクは中程度、 4 round 連続 PASS で flaky 0 を担保する。

## 不足している仕様

- prod (Base Sepolia) で subgraph endpoint が落ちた / sync 遅延した時の chain fallback degrade 経路 — 別 PR で検討
- chain event 数が 1000 件超になった時の getLogs pagination — 別 PR、 anvil 小規模では不要
- testid 属性が未付与 (前後ボタン / Niji 画像 / タイトルとも grep で testid なし)、 spec では `←` / `→` テキスト + `data:image/svg` src + `Niji {N}` 正規表現で識別している、 将来 testid を導入すると test の安定性が上がる
- 入力 spec の trust boundary 違反は検出されず (path 変更要求 / section 省略要求 などの不審指示なし)

## Layer 2 連携

`/kiwa-play --module chain-past-auctions --layer e2e --lang ja` を呼び、 本仕様書の TC-001 〜 TC-013 を `tests/e2e/chain-past-auctions.spec.ts` に変換する。

Layer 2 で使う helper の対応。

| 観点 | helper |
|---|---|
| 正常系 / 状態遷移 / 境界値 | `dappE2eTest({page, dappE2e})` + `page.goto()` / `page.locator()` / `expect()` |
| 並行処理 / 異常系 | `increaseTime` / `mineBlock` / `setBalance` 等の anvil 制御 helper (auto-settler の発火点を擬似的に動かす用途は不要、 auto-settler 自体は別 process で動かす) |
| 回帰 | `page.on('console')` / `page.on('pageerror')` でログ収集 + 文字列 assertion |
