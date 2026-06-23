# test-spec — NijiDescriptor Phase 1 完全版 (Foundry contract test)

> Phase 1 kiwa chain (Issue #295) で生成、 NijiDescriptor の全 ABI 経路を 11 観点で網羅。
> Layer 2 (`/kiwa-forge`) で `test/foundry/Phase1/NijiDescriptor.t.sol` に変換される。

## 対象機能

NijiDescriptor の全 ABI 経路 (tokenURI / tokenURIWithMetadata / generateSVG / generateSVGBase64 / generateDataURI / _generateAttributes / setArt / setResolution / setCompositeOrder / freezeMetadata / getCompositeOrder / getCompositeOrderLength / isConfigured / renounceOwnership) を 11 観点で網羅。

## 仕様の要約

| 領域 | 主要関数 / event | 仕様 |
|---|---|---|
| URI 生成 | `tokenURI(tokenId, traitIndices)` / `tokenURIWithMetadata(tokenId, indices, name, desc)` | data:application/json;base64,{base64(...)} 形式、 EmptyTraitIndices revert |
| SVG 生成 | `generateSVG(traitIndices)` / `generateSVGBase64(traitIndices)` / `generateDataURI(traitIndices)` | composite order に従い PNG layer を base64 image tag で stack、 SKIP_LAYER で layer skip |
| attributes | `_generateAttributes(traitIndices)` internal | JSON attributes 配列を art.getTraitName(i) 経由で生成、 SKIP_LAYER skip |
| 管理 | `setArt` / `setResolution` / `setCompositeOrder` / `freezeMetadata` | onlyOwner + isMetadataFrozen check、 freezeMetadata は isConfigured 必須 (NotConfigured revert) |
| view | `getCompositeOrder()` / `getCompositeOrderLength()` / `isConfigured()` | art != 0 + resolution > 0 + compositeOrder 非空 で configured |
| 制約 | `renounceOwnership()` | 常に revert |

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 高 | SVG 生成失敗で marketplace 全 NFT 表示不全、 直接売上影響 |
| セキュリティ影響 | 中 | freezeMetadata の不可逆性 + setCompositeOrder の admin 経路、 設定誤りで permanent broken metadata |
| データ破壊リスク | 中 | freezeMetadata 1-way 遷移 (誤発火で再構成不可)、 isConfigured の事前 check は保護的 |
| 利用頻度 | 高 | 全 mint で tokenURI 1 回、 marketplace 表示で多発 |
| 過去障害履歴 | 中 | palette overflow (PR #168 history) 等の SVG 生成 path に既知問題あり |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/Phase1/NijiDescriptor.t.sol`)、 11 観点 35 TC。

## テスト観点一覧

11 観点全選択。

## テストケース一覧

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | 単体 | 正常系 | art / resolution / compositeOrder 設定済 | `tokenId=0, indices=[0,...,0]` | `descriptor.tokenURI(0, indices)` | data URI 接頭辞 + base64 含む string | 高 | 必須 |
| TC-002 | 単体 | 正常系 | 同上 | `tokenId=0, indices=[0,...,0], name='Custom', desc='Test'` | `tokenURIWithMetadata(0, indices, 'Custom', 'Test')` | custom name / description を含む data URI | 高 | 必須 |
| TC-003 | 単体 | 正常系 | 同上 | `indices=[0,...,0]` | `descriptor.generateSVG(indices)` | SVG xmlns + viewBox + image tag 含む string | 高 | 必須 |
| TC-004 | 単体 | 正常系 | 同上 | `indices=[0,...,0]` | `descriptor.generateSVGBase64(indices)` | base64 encoded SVG | 高 | 必須 |
| TC-005 | 単体 | 正常系 | 同上 | `indices=[0,...,0]` | `descriptor.generateDataURI(indices)` | data:image/svg+xml;base64,... 接頭辞 | 高 | 必須 |
| TC-006 | 単体 | 正常系 | (引数なし) | (引数なし) | `descriptor.getCompositeOrder()` | constructor で渡した array | 中 | 必須 |
| TC-007 | 単体 | 正常系 | (引数なし) | (引数なし) | `descriptor.getCompositeOrderLength()` | array.length | 中 | 必須 |
| TC-008 | 単体 | 正常系 | (引数なし) | (引数なし) | `descriptor.isConfigured()` | true (art / resolution / order 全 set) | 高 | 必須 |
| TC-009 | 単体 | 正常系 | owner caller | `_art=newArt` | `setArt(newArt)` | art 更新 | 高 | 必須 |
| TC-010 | 単体 | 正常系 | owner caller | `_resolution=640` | `setResolution(640)` | resolution=640 | 中 | 必須 |
| TC-011 | 単体 | 正常系 | owner caller | `newOrder=[1,0,2,...]` | `setCompositeOrder(newOrder)` | compositeOrder 更新 | 中 | 必須 |
| TC-012 | 単体 | 正常系 | isConfigured=true | (引数なし) | `freezeMetadata()` | isMetadataFrozen=true | 高 | 必須 |
| TC-013 | 単体 | 異常系 | (引数なし) | `traitIndices=[]` | `tokenURI(0, [])` | `EmptyTraitIndices()` revert | 高 | 必須 |
| TC-014 | 単体 | 異常系 | 同上 | `traitIndices=[], name, desc` | `tokenURIWithMetadata(0, [], 'X', 'Y')` | `EmptyTraitIndices()` revert | 高 | 必須 |
| TC-015 | 単体 | 異常系 | (deploy) | `_art=address(0)` | `new NijiDescriptor(address(0), 320, [...])` | `EmptyArtAddress()` revert | 中 | 必須 |
| TC-016 | 単体 | 異常系 | (deploy) | `_resolution=0` | `new NijiDescriptor(art, 0, [...])` | `InvalidResolution()` revert | 中 | 必須 |
| TC-017 | 単体 | 異常系 | non-owner caller | `_art=bob` | `vm.prank(bob); setArt(bob)` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-018 | 単体 | 異常系 | non-owner caller | `_resolution=640` | `vm.prank(bob); setResolution(640)` | `OwnableUnauthorizedAccount(bob)` revert | 中 | 必須 |
| TC-019 | 単体 | 異常系 | non-owner caller | `_order=[...]` | `vm.prank(bob); setCompositeOrder(...)` | `OwnableUnauthorizedAccount(bob)` revert | 中 | 必須 |
| TC-020 | 単体 | 異常系 | non-owner caller | (引数なし) | `vm.prank(bob); freezeMetadata()` | `OwnableUnauthorizedAccount(bob)` revert | 中 | 必須 |
| TC-021 | 単体 | 異常系 | owner caller | `_art=address(0)` | `setArt(address(0))` | `EmptyArtAddress()` revert | 中 | 必須 |
| TC-022 | 単体 | 異常系 | owner caller | `_resolution=0` | `setResolution(0)` | `InvalidResolution()` revert | 中 | 必須 |
| TC-023 | 単体 | 異常系 | frozen 状態 | `_art=newArt` | `setArt(newArt)` | `MetadataIsFrozen()` revert | 高 | 必須 |
| TC-024 | 単体 | 異常系 | frozen 状態 | `_resolution=640` | `setResolution(640)` | `MetadataIsFrozen()` revert | 中 | 必須 |
| TC-025 | 単体 | 異常系 | frozen 状態 | `_order=[...]` | `setCompositeOrder(...)` | `MetadataIsFrozen()` revert | 中 | 必須 |
| TC-026 | 単体 | 異常系 | 空 compositeOrder で deploy | (引数なし) | `freezeMetadata()` | `NotConfigured()` revert | 高 | 必須 |
| TC-027 | 単体 | 境界値 | compositeOrder 範囲外 traitId | `indices=[0], compositeOrder=[5]` | `generateSVG(indices)` | layer skip (out of bounds 経路)、 空 SVG body | 中 | 必須 |
| TC-028 | 単体 | 境界値 | SKIP_LAYER 含む indices | `indices=[type(uint256).max, 0, ...]` | `generateSVG(indices)` | 該当 layer skip | 中 | 必須 |
| TC-029 | 単体 | 境界値 | art に該当 trait image なし | `traitId=0, imageIndex=999` | `generateSVG([...,999,...])` | NijiArt 側で InvalidImageIndex revert (descriptor 経由) | 中 | 必須 |
| TC-030 | 単体 | 状態遷移 | unconfigured | (引数なし) | `freezeMetadata()` | `NotConfigured()` revert | 高 | 必須 |
| TC-031 | 単体 | 状態遷移 | freeze 済 | (引数なし) | `freezeMetadata()` 2 回目 | `MetadataIsFrozen()` revert | 中 | 必須 |
| TC-032 | 単体 | 入力バリデーション | compositeOrder = [] 経由 deploy | (引数なし) | `isConfigured()` | false | 中 | 必須 |
| TC-033 | 単体 | 冪等性 | freeze 済 | (引数なし) | `freezeMetadata()` 2 回目 | `MetadataIsFrozen()` revert | 中 | 必須 |
| TC-034 | 単体 | 性能 | 12 trait composite | `indices=[0,...,0]` | gasleft 計測 + `generateSVG(indices)` | gas < 10M (view、 base64 encode 12 layer) | 中 | 推奨 |
| TC-035 | 単体 | セキュリティ | (owner caller) | (引数なし) | `descriptor.renounceOwnership()` | `RenounceOwnershipDisabled()` revert | 高 | 必須 |

## 自動化すべきテスト

全 35 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- SVG output の structural validity (XML 妥当性) は別 layer (browser render test) で扱う
- base64 encoding 正確性は base64-sol 単体 spec で扱う (本 spec は descriptor 経路のみ)
- JsonEscape escape の対応文字網羅は JsonEscape 単体 spec で扱う

## Layer 2 連携

- `/kiwa-forge --module niji-descriptor --layer contract` で本 spec を `test/foundry/Phase1/NijiDescriptor.t.sol` に変換
