# test-spec — NijiArt Phase 1 完全版 (Foundry contract test)

> Phase 1 kiwa chain (Issue #295) で生成、 既存 test-spec-niji-art.ja.md (8 観点 11 TC) を 11 観点全 cover + 全 ABI 経路に拡張した版。
> Layer 2 (`/kiwa-forge`) で `test/foundry/Phase1/NijiArt.t.sol` に変換される。

## 対象機能

NijiArt の全 ABI 経路 (addTraitImage / addTraitImages / getTraitImage / getTraitImageCount / getTraitNames / getTraitName / getTraitPointer / getTraitPointers / setDescriptor / transferDescriptor / lockArt / renounceOwnership) を 11 観点で網羅。
SSTORE2 immutable storage 経路 + Ownable2Step 継承層 + descriptor / owner 二重権限 model を回帰検証する。

## 仕様の要約

| 領域 | 主要関数 / event | 仕様 |
|---|---|---|
| write | `addTraitImage(traitId, pngData)` / `addTraitImages(traitId, pngDataArray)` | onlyDescriptor + isArtLocked check + traitId 範囲 check + 空 pngData reject + SSTORE2.write → pointer 配列に push + TraitImageAdded / TraitImagesAdded event |
| descriptor 管理 | `setDescriptor(_descriptor)` / `transferDescriptor(_descriptor)` | setDescriptor は onlyDescriptor (旧 descriptor のみ可)、 transferDescriptor は onlyOwner、 各 DescriptorUpdated event |
| lock | `lockArt()` | onlyOwner + 1-way 遷移、 lock 後は addTraitImage / addTraitImages が revert |
| read | `getTraitImage` / `getTraitImageCount` / `getTraitNames` / `getTraitName` / `getTraitPointer` / `getTraitPointers` | traitId / imageIndex 範囲 check、 範囲外で InvalidTraitId / InvalidImageIndex revert |
| 制約 | `renounceOwnership()` | 常に revert (RenounceOwnershipDisabled) |

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 中 | image データ破損で NFT 表示不全、 副次的に売上影響 |
| セキュリティ影響 | 高 | descriptor cast で任意 contract 受入 + onlyDescriptor 経路が単独 entry、 設定ミスで write 経路ロスト |
| データ破壊リスク | 中 | SSTORE2 は immutable storage で書込済 image は read-only、 lockArt 1-way switch (誤発火で新 trait 追加不可) |
| 利用頻度 | 中 | deploy 時 1 回 + 将来 trait 追加時に多発 (PR #168 で 550 image upload 経験あり) |
| 過去障害履歴 | 中 | PR #168 palette overflow、 1 image 制限解除等の改善履歴あり |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/Phase1/NijiArt.t.sol`)、 11 観点 35 TC + auto loop で coverage 80%+。

## テスト観点一覧

11 観点全選択。

1 正常系 / 2 異常系 / 3 境界値 (traitId boundary / imageIndex boundary / batch length) / 4 状態遷移 (isArtLocked) / 5 権限 (onlyDescriptor / onlyOwner / non-owner reject) / 6 入力バリデーション (address(0) / empty pngData / 範囲外 traitId) / 7 冪等性 (lockArt 2 回目 revert) / 8 並行処理 (Solidity sync のため ordering test) / 9 性能 (addTraitImage gas) / 10 セキュリティ (renounceOwnership disabled / lockArt 後の admin) / 11 回帰 (既存 8 観点 11 TC + PR #168)

## テストケース一覧

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | 単体 | 正常系 | descriptor 設定済、 traitId=0 有効 | `traitId=0, pngData=0xdeadbeef` | `vm.prank(descriptor); art.addTraitImage(0, pngData)` | TraitImageAdded event + getTraitImageCount(0) == 1 | 高 | 必須 |
| TC-002 | 単体 | 正常系 | 同上 | `traitId=0, pngDataArray=[a, b, c]` | `vm.prank(descriptor); art.addTraitImages(0, [a, b, c])` | TraitImagesAdded(0, 0, 3) event + count 3 | 高 | 必須 |
| TC-003 | 単体 | 正常系 | image 1 件追加済 | `traitId=0, imageIndex=0` | `art.getTraitImage(0, 0)` | 追加した pngData bytes をそのまま返す | 高 | 必須 |
| TC-004 | 単体 | 正常系 | (initial state) | `traitId=0` | `art.getTraitImageCount(0)` | 0 を返す (空 trait) | 中 | 必須 |
| TC-005 | 単体 | 正常系 | constructor 設定済 | (引数なし) | `art.getTraitNames()` | constructor で渡した array をそのまま返す | 高 | 必須 |
| TC-006 | 単体 | 正常系 | 同上 | `traitId=0` | `art.getTraitName(0)` | traitNames[0] を返す | 中 | 必須 |
| TC-007 | 単体 | 正常系 | image 1 件追加済 | `traitId=0, imageIndex=0` | `art.getTraitPointer(0, 0)` | SSTORE2 pointer address (non-zero) を返す | 中 | 必須 |
| TC-008 | 単体 | 正常系 | image 3 件追加済 | `traitId=0` | `art.getTraitPointers(0)` | 3 件 pointer array を返す | 中 | 必須 |
| TC-009 | 単体 | 正常系 | descriptor 設定済 | `_descriptor=newDescriptor` | `vm.prank(descriptor); art.setDescriptor(newDescriptor)` | DescriptorUpdated event + descriptor 更新 | 高 | 必須 |
| TC-010 | 単体 | 正常系 | owner setup | `_descriptor=newDescriptor` | `vm.prank(owner); art.transferDescriptor(newDescriptor)` | DescriptorUpdated event + descriptor 更新 | 高 | 必須 |
| TC-011 | 単体 | 異常系 | non-descriptor caller | `traitId=0, pngData=0xdead` | `vm.prank(bob); art.addTraitImage(0, pngData)` | SenderIsNotDescriptor revert | 高 | 必須 |
| TC-012 | 単体 | 異常系 | descriptor caller、 traitCount=12 | `traitId=12, pngData=0xdead` | `vm.prank(descriptor); art.addTraitImage(12, pngData)` | `InvalidTraitId(12, 11)` revert | 高 | 必須 |
| TC-013 | 単体 | 異常系 | descriptor caller | `traitId=0, pngData=''` | `vm.prank(descriptor); art.addTraitImage(0, '')` | `EmptyPngData()` revert | 高 | 必須 |
| TC-014 | 単体 | 異常系 | image 0 件、 traitId 範囲内 | `traitId=0, imageIndex=0` | `art.getTraitImage(0, 0)` | `InvalidImageIndex(0, 0, 0)` revert | 高 | 必須 |
| TC-015 | 単体 | 異常系 | traitId=12 範囲外 | `traitId=12, imageIndex=0` | `art.getTraitImage(12, 0)` | `InvalidTraitId(12, 11)` revert | 高 | 必須 |
| TC-016 | 単体 | 異常系 | traitId=12 範囲外 | `traitId=12` | `art.getTraitName(12)` | `InvalidTraitId(12, 11)` revert | 中 | 必須 |
| TC-017 | 単体 | 異常系 | traitId=12 範囲外 | `traitId=12, imageIndex=0` | `art.getTraitPointer(12, 0)` | `InvalidTraitId(12, 11)` revert | 中 | 必須 |
| TC-018 | 単体 | 異常系 | traitId=12 範囲外 | `traitId=12` | `art.getTraitPointers(12)` | `InvalidTraitId(12, 11)` revert | 中 | 必須 |
| TC-019 | 単体 | 異常系 | descriptor caller | `_descriptor=address(0)` | `vm.prank(descriptor); art.setDescriptor(address(0))` | `EmptyDescriptorAddress()` revert | 中 | 必須 |
| TC-020 | 単体 | 異常系 | owner caller | `_descriptor=address(0)` | `vm.prank(owner); art.transferDescriptor(address(0))` | `EmptyDescriptorAddress()` revert | 中 | 必須 |
| TC-021 | 単体 | 異常系 | (deploy) | `_descriptor=address(0)` | `new NijiArt(address(0), traitNames)` | `EmptyDescriptorAddress()` revert | 中 | 必須 |
| TC-022 | 単体 | 異常系 | descriptor caller + 1 件 empty を含む batch | `traitId=0, pngDataArray=[a, '', c]` | `vm.prank(descriptor); art.addTraitImages(0, [a, '', c])` | 2 件目で `EmptyPngData()` revert | 中 | 必須 |
| TC-023 | 単体 | 境界値 | descriptor caller、 traitCount=12 | `traitId=11, pngData=0xdead` | `vm.prank(descriptor); art.addTraitImage(11, pngData)` | 成功 (boundary, traitCount-1) | 中 | 必須 |
| TC-024 | 単体 | 境界値 | image 1 件追加済 | `traitId=0, imageIndex=1` | `art.getTraitImage(0, 1)` | `InvalidImageIndex(0, 1, 0)` revert (length=1 を超えた index) | 中 | 必須 |
| TC-025 | 単体 | 境界値 | descriptor caller、 traitCount=12 | `traitId=12` | `art.getTraitImageCount(12)` | 0 を返す (範囲外でも view は revert しない仕様) | 低 | 推奨 |
| TC-026 | 単体 | 状態遷移 | owner caller、 art unlocked | (引数なし) | `vm.prank(owner); art.lockArt()` | isArtLocked=true + ArtLocked event | 高 | 必須 |
| TC-027 | 単体 | 状態遷移 | art locked 後 | `traitId=0, pngData=0xdead` | `vm.prank(descriptor); art.addTraitImage(0, pngData)` | `ArtIsLocked()` revert | 高 | 必須 |
| TC-028 | 単体 | 状態遷移 | art locked 後でも descriptor 更新可 | `_descriptor=newDescriptor` | `vm.prank(owner); art.transferDescriptor(newDescriptor)` | 成功 (lock は write のみ) | 中 | 必須 |
| TC-029 | 単体 | 権限 | non-owner caller | `_descriptor=bob` | `vm.prank(bob); art.transferDescriptor(bob)` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-030 | 単体 | 権限 | non-owner caller | (引数なし) | `vm.prank(bob); art.lockArt()` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-031 | 単体 | 入力バリデーション | (deploy) | `_traitNames=[]` | `new NijiArt(descriptor, [])` | 成功 (空 trait names 許容、 traitCount=0) | 低 | 推奨 |
| TC-032 | 単体 | 冪等性 | lockArt 済 | (引数なし) | `vm.prank(owner); art.lockArt()` (2 回目) | `ArtIsLocked()` revert | 中 | 必須 |
| TC-033 | 単体 | 並行処理 | (順序依存) | addTraitImage 2 連続後 swap | 2 連 add → getTraitPointer(0, 0) と getTraitPointer(0, 1) の address 比較 | pointer は順序保持される (SSTORE2.write 順) | 中 | 必須 |
| TC-034 | 単体 | 性能 | descriptor caller + 24 KB 以下 png | `traitId=0, pngData=24KB` | `vm.prank(descriptor); uint256 g0=gasleft(); art.addTraitImage(0, pngData); uint256 used=g0-gasleft()` | gas < 5M (SSTORE2 deploy + push) | 中 | 推奨 |
| TC-035 | 単体 | セキュリティ | (owner caller) | (引数なし) | `vm.prank(owner); art.renounceOwnership()` | `RenounceOwnershipDisabled()` revert | 高 | 必須 |

## 自動化すべきテスト

全 35 件 自動化推奨 (forge test)。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- SSTORE2.read / SSTORE2.write の bytecode size 制約 (24KB) は SSTORE2 単体 spec で扱う (本 spec は NijiArt の振る舞いのみ verify)
- palette overflow は NijiDescriptor の encoder 経路、 Descriptor spec (Sub-PR 4) で扱う
- multi-tab race condition は wallet UX 領域、 contract spec 対象外

## Layer 2 連携

- `/kiwa-forge --module niji-art --layer contract` で本 spec を `test/foundry/Phase1/NijiArt.t.sol` に変換
