# test-spec — NijiAuctionHouseV3 (Foundry contract test)

## 対象機能

NijiAuctionHouseV3 の **既存 `NijiAuctionHouseV3.t.sol` で未 cover** な観点を補完する。 createBid / settle 系は既存 cover 済のため重複させず、 unpause / pause / event / setter / sanctionsOracle 経路を中心に。

## 仕様の要約

- `unpause()` ... onlyOwner、 `_unpause()` + `auctionStorage.startTime == 0 || .settled` で `_createAuction()` 自動呼出
- `pause()` ... onlyOwner、 _pause() のみ (auction 進行は止めない)
- `setTimeBuffer(uint56)` ... onlyOwner、 MAX_TIME_BUFFER 上限、 AuctionTimeBufferUpdated event
- `setReservePrice(uint192)` ... onlyOwner、 AuctionReservePriceUpdated event
- `setMinBidIncrementPercentage(uint8)` ... onlyOwner、 0 で revert (既存 cover)、 AuctionMinBidIncrementPercentageUpdated event
- `auction()` view ... auctionStorage を AuctionV2View 形式で返す

## 主な品質リスク

| 基準 | スコア | 根拠 |
|---|---|---|
| 売上影響 | 高 | auction 経路の収益 core |
| セキュリティ影響 | 高 | onlyOwner + nonReentrant + whenNotPaused の組合せ |
| データ破壊 | 中 | sanctionsOracle 設定 mismatch で sanctioned bidder block 失敗 |
| 利用頻度 | 高 | 全 auction で経由 |
| 過去障害 | 中 | PR #168 で 1 分 duration / Nijider 枠 settle 改修 |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/NijiAuctionHouseV3KiwaTest.t.sol`)、 既存と重複しない 7 TC。

## テスト観点一覧

1 正常系 / 2 異常系 / 4 状態遷移 / 5 権限 / 10 セキュリティ / 11 回帰

## テストケース一覧

| ID | 観点 | 内容 |
|---|---|---|
| TC-001 | 状態遷移 | deploy 直後 paused、 unpause() で _createAuction 自動発火 + auctionStorage.startTime != 0 |
| TC-002 | 異常系 | non-owner が unpause で revert |
| TC-003 | 異常系 | non-owner が pause で revert |
| TC-004 | 状態遷移 | pause() で paused、 settleCurrentAndCreateNewAuction が whenNotPaused で revert |
| TC-005 | 正常系 | setTimeBuffer 成功で AuctionTimeBufferUpdated event |
| TC-006 | 異常系 | setTimeBuffer が MAX_TIME_BUFFER 超で revert |
| TC-007 | 正常系 | setReservePrice 成功で AuctionReservePriceUpdated event + reservePrice 更新 |

## 自動化すべきテスト

全 7 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- createBid / settle 経路は既存 `NijiAuctionHouseV3.t.sol` で cover 済、 本 spec では重複させない
- sanctionsOracle の statictly 設定変更 test は別 Issue で扱う (mainnet Oracle 連携が必要)
