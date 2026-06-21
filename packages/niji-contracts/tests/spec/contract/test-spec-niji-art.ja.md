# test-spec — NijiArt (Foundry contract test)

## 対象機能

NijiArt の SSTORE2 経路 (addTraitImage / addTraitImages / getTraitImage / getTraitImageCount) と descriptor 管理 / trait name 取得を 8 観点で網羅。

## 仕様の要約

- `addTraitImage(traitId, pngData)` ... onlyDescriptor、 traitId < traitCount、 pngData non-empty、 SSTORE2 経由で contract bytecode に保存 → pointer を追加 → TraitImageAdded event
- `addTraitImages(traitId, pngDataArray)` ... batch 版、 TraitImagesAdded event (startIndex + count)
- `getTraitImage(traitId, imageIndex)` ... SSTORE2 pointer から読出
- `getTraitImageCount(traitId)` ... traitPointers[traitId].length
- `setDescriptor(_descriptor)` ... onlyDescriptor (旧 descriptor が新 descriptor 設定可能)
- `transferDescriptor(_descriptor)` ... onlyOwner

## 主な品質リスク

| 基準 | スコア | 根拠 |
|---|---|---|
| 売上影響 | 低 | image 保存自体に売上効果なし |
| セキュリティ影響 | 中 | descriptor cast で任意 contract address 受入、 onlyDescriptor 経路が単独 entry |
| データ破壊 | 低 | SSTORE2 は immutable storage、 一度書いたら read-only |
| 利用頻度 | 中 | deploy 時 1 回 + 将来 trait 追加時に使う |
| 過去障害 | 中 | PR #168 で 1 image 制限 → 550 image upload に変更した契機あり、 palette overflow 等の問題既知 |

→ **総合リスク = 中**

## 推奨テスト構成

Foundry forge test (`test/foundry/NijiArtKiwaTest.t.sol`)、 8 観点 11 TC。

## テスト観点一覧

1 正常系 / 2 異常系 / 3 境界値 / 5 権限 / 7 冪等性 / 9 性能 / 10 セキュリティ / 11 回帰

## テストケース一覧

| ID | 観点 | 内容 |
|---|---|---|
| TC-001 | 正常系 | addTraitImage 成功で TraitImageAdded event + getTraitImageCount 増加 |
| TC-002 | 正常系 | addTraitImages (batch) で TraitImagesAdded event + count が batch.length 分増 |
| TC-003 | 異常系 | non-descriptor が addTraitImage を呼ぶと SenderIsNotDescriptor revert |
| TC-004 | 異常系 | 範囲外 traitId で InvalidTraitId revert |
| TC-005 | 異常系 | empty pngData で EmptyPngData revert |
| TC-006 | 境界値 | 1 trait に 0 image (getTraitImageCount = 0) で getTraitImage は InvalidImageIndex revert |
| TC-007 | 正常系 | getTraitImage が SSTORE2 から書込 data を bytes で復元 |
| TC-008 | 権限 | transferDescriptor で onlyOwner 強制 (non-owner revert) |
| TC-009 | 正常系 | transferDescriptor 成功で DescriptorUpdated event + descriptor アドレス更新 |
| TC-010 | 性能 | addTraitImage の gas usage が 24KB 以下 png で実用範囲 (< 5M gas) |
| TC-011 | 回帰 | getTraitNames が constructor で渡した array をそのまま返す |

## 自動化すべきテスト

全 11 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- palette overflow (PR #168 fix) は NijiDescriptor encoder 経路で、 NijiArt 単体 test ではなく Descriptor spec で扱う
- 24KB SSTORE2 上限テストは pure size boundary なので forge fuzz は別 Issue
