# test-spec — NijiAuctionHouseV3 Phase 1 完全版 (Foundry contract test)

> Phase 1 kiwa chain (Issue #295) で生成、 既存 test-spec-niji-auction-house-v3.ja.md (8 観点 7 TC) を 11 観点 + admin / event / view 系を中心に拡張。
> createBid / settle 系は Issue #293 (post-rebrand test refresh) scope のため本 spec scope 外、 admin / event / pause / setter / view path に絞り 35 TC + line coverage 50-70% を目標。

## 対象機能

NijiAuctionHouseV3 の admin / event / view 経路 (initialize / pause / unpause / setTimeBuffer / setReservePrice / setMinBidIncrementPercentage / setSanctionsOracle / setPrices / warmUpSettlementState / auction / getSettlements / getPrices / biddingClient) を 11 観点で網羅。
createBid / settleAuction / _safeTransferETHWithFallback の bid 経路は Issue #293 解消後の Phase 2 で扱う。

## 仕様の要約

| 領域 | 主要関数 / event | 仕様 |
|---|---|---|
| 初期化 | `initialize(reservePrice, timeBuffer, minBidIncrementPercentage, sanctionsOracle)` | proxy initializer、 _pause()、 SanctionsOracleSet event |
| pause/unpause | `pause()` / `unpause()` | onlyOwner、 unpause 時 startTime==0 or settled なら _createAuction 自動 |
| admin setter | `setTimeBuffer(_timeBuffer)` / `setReservePrice(_reservePrice)` / `setMinBidIncrementPercentage(_pct)` / `setSanctionsOracle(_oracle)` | onlyOwner、 各 event emit、 timeBuffer は MAX_TIME_BUFFER 上限、 minBid は > 0 制約 |
| settlement admin | `setPrices(settlements[])` / `warmUpSettlementState(startId, endId)` | setPrices は onlyOwner、 過去 settlement の amount を upsert、 warmUpSettlementState は zero-init で SLOAD 安定化 |
| view | `auction()` / `getSettlements(N)` / `getPrices(N)` / `getSettlementsFromIdtoTimestamp(...)` / `biddingClient(N)` / `auctionStorage()` | settled history を返却 |

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 高 | auction 経路の収益 core (admin 設定誤りで全 auction 停止) |
| セキュリティ影響 | 高 | onlyOwner + nonReentrant + whenNotPaused の組合せ崩れで非権限者の admin 操作可能 |
| データ破壊リスク | 中 | sanctionsOracle 設定 mismatch で sanctioned bidder block 失敗、 timeBuffer 過大で auction 停滞 |
| 利用頻度 | 高 | 全 auction で経由 |
| 過去障害履歴 | 中 | PR #168 で 1 分 duration / Nijider 枠改修、 PR #294 で setUp PlaceholderURI fix |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/Phase1/NijiAuctionHouseV3.t.sol`)、 35 TC、 admin / event / view path 中心。

## テスト観点一覧

11 観点全選択 (createBid / settle 経路は scope 外)。

## テストケース一覧

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | 単体 | 正常系 | deploy 直後 paused | (引数なし) | `vm.prank(owner); auction.unpause()` | _createAuction 自動発火 + startTime != 0 + endTime > 0 | 高 | 必須 |
| TC-002 | 単体 | 正常系 | unpaused | (引数なし) | `vm.prank(owner); auction.pause()` | paused() = true | 高 | 必須 |
| TC-003 | 単体 | 正常系 | (引数なし) | `_timeBuffer=600` | `vm.prank(owner); auction.setTimeBuffer(600)` | timeBuffer=600 + AuctionTimeBufferUpdated event | 高 | 必須 |
| TC-004 | 単体 | 正常系 | (引数なし) | `_reservePrice=2 ether` | `vm.prank(owner); auction.setReservePrice(2 ether)` | reservePrice=2 ether + AuctionReservePriceUpdated event | 高 | 必須 |
| TC-005 | 単体 | 正常系 | (引数なし) | `_pct=5` | `vm.prank(owner); auction.setMinBidIncrementPercentage(5)` | minBidIncrementPercentage=5 + AuctionMinBidIncrementPercentageUpdated event | 高 | 必須 |
| TC-006 | 単体 | 正常系 | (引数なし) | `_oracle=newOracle` | `vm.prank(owner); auction.setSanctionsOracle(newOracle)` | sanctionsOracle=newOracle + SanctionsOracleSet event | 高 | 必須 |
| TC-007 | 単体 | 正常系 | (引数なし) | (引数なし) | `auction.auction()` | AuctionV2View 構造取得 (startTime / endTime / bidder / amount 等) | 中 | 必須 |
| TC-008 | 単体 | 正常系 | (引数なし) | `_nounId=0` | `auction.biddingClient(0)` | initial 0 | 中 | 必須 |
| TC-009 | 単体 | 正常系 | (引数なし) | `_count=10` | `auction.getSettlements(10)` | 0 件 (history 空) | 中 | 必須 |
| TC-010 | 単体 | 正常系 | (引数なし) | `_count=10` | `auction.getPrices(10)` | 0 件 (history 空) | 中 | 必須 |
| TC-011 | 単体 | 正常系 | (引数なし) | `_startId=0, _endId=10` | `auction.warmUpSettlementState(0, 10)` | revert なし (zero-init で SLOAD 安定化) | 中 | 必須 |
| TC-012 | 単体 | 異常系 | non-owner caller | (引数なし) | `vm.prank(bob); auction.pause()` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-013 | 単体 | 異常系 | non-owner caller | (引数なし) | `vm.prank(bob); auction.unpause()` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-014 | 単体 | 異常系 | non-owner caller | `_timeBuffer=600` | `vm.prank(bob); auction.setTimeBuffer(600)` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-015 | 単体 | 異常系 | non-owner caller | `_reservePrice=2 ether` | `vm.prank(bob); auction.setReservePrice(2 ether)` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-016 | 単体 | 異常系 | non-owner caller | `_pct=5` | `vm.prank(bob); auction.setMinBidIncrementPercentage(5)` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-017 | 単体 | 異常系 | non-owner caller | `_oracle=bob` | `vm.prank(bob); auction.setSanctionsOracle(bob)` | OwnableUnauthorizedAccount revert | 高 | 必須 |
| TC-018 | 単体 | 異常系 | owner caller、 MAX_TIME_BUFFER=86400 | `_timeBuffer=86401` | `vm.prank(owner); auction.setTimeBuffer(86401)` | revert 'timeBuffer too large' | 高 | 必須 |
| TC-019 | 単体 | 異常系 | owner caller | `_pct=0` | `vm.prank(owner); auction.setMinBidIncrementPercentage(0)` | revert 'must be greater than zero' | 高 | 必須 |
| TC-020 | 単体 | 異常系 | initialize 2 回目 | (初期化引数) | `auction.initialize(1, 300, 2, oracle)` | InvalidInitialization revert (proxy 仕様) | 高 | 必須 |
| TC-021 | 単体 | 境界値 | owner caller、 MAX_TIME_BUFFER=86400 | `_timeBuffer=86400` | `vm.prank(owner); auction.setTimeBuffer(86400)` | 成功 (boundary) | 中 | 必須 |
| TC-022 | 単体 | 境界値 | owner caller | `_pct=1` | `vm.prank(owner); auction.setMinBidIncrementPercentage(1)` | 成功 (min boundary > 0) | 中 | 必須 |
| TC-023 | 単体 | 境界値 | owner caller | `_pct=255` | `vm.prank(owner); auction.setMinBidIncrementPercentage(255)` | 成功 (max uint8) | 低 | 推奨 |
| TC-024 | 単体 | 境界値 | owner caller | `_reservePrice=0` | `vm.prank(owner); auction.setReservePrice(0)` | 成功 (constraint なし、 production 設定運用) | 低 | 推奨 |
| TC-025 | 単体 | 状態遷移 | deploy 直後 paused | (引数なし) | unpause → pause → unpause | unpause 1 回目 _createAuction、 2 回目 startTime != 0 / settled 維持なら _createAuction 再発火 | 中 | 必須 |
| TC-026 | 単体 | 状態遷移 | paused 状態 | (引数なし) | `auction.settleCurrentAndCreateNewAuction()` | whenNotPaused で revert | 高 | 必須 |
| TC-027 | 単体 | 状態遷移 | unpaused 状態 | (引数なし) | `auction.settleAuction()` | whenPaused で revert | 高 | 必須 |
| TC-028 | 単体 | 権限 | non-owner caller | (settlements 配列) | `vm.prank(bob); auction.setPrices(...)` | OwnableUnauthorizedAccount revert | 中 | 必須 |
| TC-029 | 単体 | 入力バリデーション | (deploy) | 既存 deploy fixture | initialize | proxy 経由で正常 init | 中 | 必須 |
| TC-030 | 単体 | 入力バリデーション | (引数なし) | `_oracle=address(0)` | `vm.prank(owner); auction.setSanctionsOracle(address(0))` | 成功 (空 oracle 許容、 sanctions check 無効化) | 低 | 推奨 |
| TC-031 | 単体 | 冪等性 | initialize 2 回目 | (初期化引数) | `auction.initialize(...)` 2 回目 | InvalidInitialization revert | 中 | 必須 |
| TC-032 | 単体 | 並行処理 | owner setter 連続 | (引数なし) | setReservePrice → setTimeBuffer → setMinBidIncrementPercentage 連続 | 各 event 順序通り emit、 storage 反映 | 中 | 必須 |
| TC-033 | 単体 | 性能 | (引数なし) | (引数なし) | `gasleft 計測 + auction.auction()` | gas < 20_000 (view、 SLOAD 6 件) | 低 | 推奨 |
| TC-034 | 単体 | セキュリティ | owner != current | (引数なし) | initialize 後の owner 確認 | owner == msg.sender (deployer) | 中 | 必須 |
| TC-035 | 単体 | 回帰 | PR #294 fix の効果 | (引数なし) | `auction.unpause()` (deployToken 経由 placeholder 設定済) | revert なし、 unpause + _createAuction 成功 | 高 | 必須 |

## 自動化すべきテスト

全 35 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- createBid 経路 (auction expired / reservePrice 未満 / minBidIncrement 未満 / 再 bid refund / time buffer 延長) は Issue #293 解消後の Phase 2 で扱う
- settle 経路 (_safeTransferETHWithFallback / settlement history 蓄積 / clientId 紐付け) は同上 Phase 2
- sanctions oracle 連携 test (mainnet ChainalysisSanctionsList) は別 Issue (Mock 連携が必要)

## Layer 2 連携

- `/kiwa-forge --module niji-auction-house-v3 --layer contract` で本 spec を `test/foundry/Phase1/NijiAuctionHouseV3.t.sol` に変換
