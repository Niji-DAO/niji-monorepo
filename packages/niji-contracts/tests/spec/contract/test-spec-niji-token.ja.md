# test-spec — NijiToken (Foundry contract test)

## 対象機能

NijiToken の core 経路 (mint / burn / minter 管理 / seeder/descriptor 管理 / event) を 8 観点で網羅。
tokenURI / contractURI 系は別 spec (Issue #185 NijiArt 寄り) で扱う。

## 仕様の要約

- `mint(address to)` ... onlyMinter + nonReentrant + isMintingActive 必須、 maxSupply check
- `mint()` ... AuctionHouse から address 引数なし呼出 (`to` = msg.sender = AuctionHouse)
- `burn(tokenId)` ... onlyMinter、 settle 時に入札なし auction で AuctionHouse から呼ばれる
- `mintBatch(to, quantity)` ... onlyMinter で複数 mint
- `_mintTo(to)` ... internal、 seeder.generateSeed → seeds[tokenId] 保存 → _mint → NijiMinted event
- `setMinter / setDescriptor / setSeeder / setMintingActive / toggleMinting / setContractURIHash` ... onlyOwner、 各 event emit
- `setProvenanceHash / lockProvenanceHash` ... onlyOwner + lock 後 revert
- `currentTokenId / exists / remainingSupply / getSeed / getTraitIndices` ... view

## 主な品質リスク

| 基準 | スコア | 根拠 |
|---|---|---|
| 売上影響 | 高 | mint 関数の権限 bypass で free mint 可能性 |
| セキュリティ影響 | 高 | onlyMinter / onlyOwner / nonReentrant の組合せ崩れ |
| データ破壊 | 中 | seeds mapping は burn でクリアされない (mapping 仕様) |
| 利用頻度 | 高 | 全 auction で 1 回 mint |
| 過去障害 | 低 | NijiToken 由来の bug 報告なし |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/NijiTokenKiwaTest.t.sol`)、 8 観点 11 TC。

## テスト観点一覧

1 正常系 / 2 異常系 / 4 状態遷移 / 5 権限 / 7 冪等性 / 8 並行処理 (reentrancy) / 10 セキュリティ / 11 回帰

## テストケース一覧

| ID | 観点 | 内容 |
|---|---|---|
| TC-001 | 正常系 | mintingActive=true で mint(to) 成功、 tokenId 0 から +1、 NijiMinted event |
| TC-002 | 異常系 | isMintingActive=false で mint(to) が MintingNotActive revert |
| TC-003 | 異常系 | maxSupply 上限到達で次 mint が MaxSupplyReached revert |
| TC-004 | 状態遷移 | toggleMinting で active/inactive 反転 + MintingToggled event |
| TC-005 | 状態遷移 | setMintingActive(true/false) 直接設定 + MintingToggled event |
| TC-006 | 権限 | non-minter が mint() を呼ぶと OnlyMinter revert |
| TC-007 | 権限 | non-owner が setMinter/setDescriptor/setSeeder を呼ぶと OwnableUnauthorizedAccount revert |
| TC-008 | 正常系 | setMinter 成功で MinterUpdated event (oldMinter + newMinter indexed) |
| TC-009 | 正常系 | setSeeder / setDescriptor で event emit (each Updated event) |
| TC-010 | 回帰 | burn(tokenId) で _ownerOf(tokenId) == address(0) + remainingSupply 増 |
| TC-011 | セキュリティ | setProvenanceHash + lockProvenanceHash 後の再 set が ProvenanceHashLocked revert |

## 自動化すべきテスト

全 11 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- tokenURI 経路は NijiDescriptor + NijiArt の SSTORE2 が必要、 別 spec (Issue #185 NijiArt) で扱う
- mintBatch は本 spec scope 外 (auction では使わない、 別 issue で扱う)
