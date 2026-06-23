# test-spec — NijiSeeder Phase 1 完全版 (Foundry contract test)

> Phase 1 kiwa chain (Issue #295) で生成、 既存 test-spec-niji-seeder.ja.md (8 観点 11 TC) を 11 観点全 cover + 全 ABI 経路に拡張した版。
> Layer 2 (`/kiwa-forge`) で `test/foundry/Phase1/NijiSeeder.t.sol` に変換される。

## 対象機能

NijiSeeder の全 ABI 経路 (generateSeed / generateSeedFromSource / _pickTrait の SKIP_LAYER 経路 / setArt / setEntropySalt / lockEntropySalt / getTraitCount / getAllTraitCounts / renounceOwnership) を 11 観点で網羅。
chainid + entropySalt cross-chain replay 防御 + Ownable2Step 継承層を回帰検証する。

## 仕様の要約

| 領域 | 主要関数 / event | 仕様 |
|---|---|---|
| seed 生成 | `generateSeed(tokenId, descriptor)` | view、 blockhash + tokenId + timestamp + prevrandao + chainid + entropySalt を keccak256 → pseudorandom 256bit → 16bit ずつ 12 trait 用に shift して `_pickTrait` |
| 入力固定 seed | `generateSeedFromSource(randomSource)` | view、 chain 依存なしで pure 16bit shift + `_pickTrait`、 preview / testing 用 |
| trait 選択 | `_pickTrait(traitId, randomValue)` internal | traitCount=0 で SKIP_LAYER (type(uint256).max)、 それ以外は randomValue % traitCount |
| art 更新 | `setArt(_art)` | onlyOwner、 ArtUpdated event |
| entropy 操作 | `setEntropySalt(newSalt)` / `lockEntropySalt()` | onlyOwner、 lock 後は更新不可、 EntropySaltUpdated / EntropySaltLockedEvent |
| view | `getTraitCount(traitId)` / `getAllTraitCounts()` | art に delegate |
| 制約 | `renounceOwnership()` | 常に revert (RenounceOwnershipDisabled) |

## 主な品質リスク

| 基準 | スコア | 根拠 1 文 |
|---|---|---|
| 売上影響 | 中 | seed の不一致で同 tokenId が複数 trait combination を返す表示不全 |
| セキュリティ影響 | 高 | cross-chain replay 防御 (chainid + entropySalt) の崩れで fork chain から同 trait 予測可能 |
| データ破壊リスク | 低 | view 関数中心、 state は entropySalt と art address のみ |
| 利用頻度 | 高 | 全 mint で 1 回 + descriptor.tokenURI でも間接的に使用 |
| 過去障害履歴 | 中 | Issue #34 で chainid + 回転 salt を追加、 回帰必須 |

→ **総合リスク = 高**

## 推奨テスト構成

Foundry forge test (`test/foundry/Phase1/NijiSeeder.t.sol`)、 11 観点 35 TC + auto loop で coverage 80%+。

## テスト観点一覧

11 観点全選択。

1 正常系 / 2 異常系 / 3 境界値 / 4 状態遷移 (isEntropySaltLocked) / 5 権限 (onlyOwner) / 6 入力バリデーション (address(0) 拒否) / 7 冪等性 (lockEntropySalt 2 回目) / 8 並行処理 (Solidity 同期、 同 block 内 2 回生成で同 seed) / 9 性能 (generateSeed gas) / 10 セキュリティ (chainid replay 防御 / renounceOwnership disabled) / 11 回帰 (Issue #34 chainid + 回転 salt)

## テストケース一覧

| テスト ID | テストレベル | テスト観点 | 前提条件 | 入力値 | 操作手順 | 期待結果 | 優先度 | 自動化 |
|---|---|---|---|---|---|---|---|---|
| TC-001 | 単体 | 正常系 | art trait image 各 4 件設定済 | `tokenId=0, descriptor=0x0` | `seeder.generateSeed(0, address(0))` | Seed struct 取得、 各 trait は 0-3 範囲 | 高 | 必須 |
| TC-002 | 単体 | 正常系 | 同上 | `randomSource=12345` | `seeder.generateSeedFromSource(12345)` | Seed struct 取得、 deterministic | 高 | 必須 |
| TC-003 | 単体 | 正常系 | 同上 | `randomSource=12345` | 2 回連続呼出 | 同 seed が返る (deterministic) | 高 | 必須 |
| TC-004 | 単体 | 正常系 | 同上 | `traitId=0` | `seeder.getTraitCount(0)` | art.getTraitImageCount(0) と一致 | 中 | 必須 |
| TC-005 | 単体 | 正常系 | 同上 | (引数なし) | `seeder.getAllTraitCounts()` | 12 要素 array (各 4) | 高 | 必須 |
| TC-006 | 単体 | 正常系 | owner caller | `_art=newArt` | `seeder.setArt(newArt)` | art 更新 + ArtUpdated event | 高 | 必須 |
| TC-007 | 単体 | 正常系 | owner caller | `newSalt=0xdeadbeef...` | `seeder.setEntropySalt(0xdead...)` | entropySalt 更新 + EntropySaltUpdated event | 高 | 必須 |
| TC-008 | 単体 | 正常系 | owner caller、 unlocked | (引数なし) | `seeder.lockEntropySalt()` | isEntropySaltLocked=true + EntropySaltLockedEvent | 高 | 必須 |
| TC-009 | 単体 | 異常系 | non-owner caller | `_art=bob` | `vm.prank(bob); seeder.setArt(bob)` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-010 | 単体 | 異常系 | non-owner caller | `newSalt=0xdead` | `vm.prank(bob); seeder.setEntropySalt(0xdead)` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-011 | 単体 | 異常系 | non-owner caller | (引数なし) | `vm.prank(bob); seeder.lockEntropySalt()` | `OwnableUnauthorizedAccount(bob)` revert | 高 | 必須 |
| TC-012 | 単体 | 異常系 | owner caller | `_art=address(0)` | `seeder.setArt(address(0))` | `InvalidArtAddress()` revert | 高 | 必須 |
| TC-013 | 単体 | 異常系 | (deploy) | `_art=address(0)` | `new NijiSeeder(address(0))` | `InvalidArtAddress()` revert | 高 | 必須 |
| TC-014 | 単体 | 異常系 | lockEntropySalt 済 | `newSalt=0xdead` | `seeder.setEntropySalt(0xdead)` | `EntropySaltLocked()` revert | 中 | 必須 |
| TC-015 | 単体 | 境界値 | art trait image 0 件 (traitId=0) | `traitId=0, randomValue=any` | `_pickTrait` 経由で `generateSeedFromSource(0)` | special = type(uint48).max (SKIP_LAYER cast) | 高 | 必須 |
| TC-016 | 単体 | 境界値 | art trait image 1 件 (traitId=1) | `traitId=1, randomValue=999` | `generateSeedFromSource(999)` | choker = 0 (1 % 1 = 0) | 中 | 必須 |
| TC-017 | 単体 | 状態遷移 | unlocked | (引数なし) | `seeder.lockEntropySalt()` | isEntropySaltLocked=true (1-way) | 高 | 必須 |
| TC-018 | 単体 | 状態遷移 | locked 後 set entropy 試行 | `newSalt=0xdead` | `seeder.setEntropySalt(0xdead)` | EntropySaltLocked revert (block 状態) | 高 | 必須 |
| TC-019 | 単体 | 入力バリデーション | (deploy) | `_art=address(0)` | `new NijiSeeder(address(0))` | `InvalidArtAddress()` revert | 中 | 必須 |
| TC-020 | 単体 | 入力バリデーション | owner caller | `_art=address(0)` | `seeder.setArt(address(0))` | `InvalidArtAddress()` revert | 中 | 必須 |
| TC-021 | 単体 | 冪等性 | lockEntropySalt 済 | (引数なし) | `seeder.lockEntropySalt()` (2 回目) | `EntropySaltLocked()` revert | 中 | 必須 |
| TC-022 | 単体 | 並行処理 | 同 block 内 | `tokenId=0` 2 回 | block 同一で `generateSeed(0, 0)` 2 連 | 同 seed 返却 (blockhash + tokenId + timestamp + chainid + salt 同一) | 中 | 必須 |
| TC-023 | 単体 | 並行処理 | block 進行 + tokenId 同一 | `tokenId=0` 2 回 (between vm.roll) | block 1 → vm.roll(block 2) → block 2 で再生成 | 異なる seed (blockhash 変動) | 中 | 必須 |
| TC-024 | 単体 | 性能 | (引数なし) | `tokenId=0` | gasleft 計測 + `generateSeed(0, 0)` | gas < 100_000 (view、 SLOAD のみ) | 中 | 推奨 |
| TC-025 | 単体 | セキュリティ | chainid 変更 (vm.chainId(2)) | `tokenId=0` | chainid=1 で seed1、 vm.chainId(2) で seed2 | seed1 != seed2 (cross-chain replay 防御) | 高 | 必須 |
| TC-026 | 単体 | セキュリティ | entropySalt 変更 | `tokenId=0` | salt=0x00 で seed1、 salt=0xff で seed2 | seed1 != seed2 (rotation 効果) | 高 | 必須 |
| TC-027 | 単体 | セキュリティ | (owner caller) | (引数なし) | `seeder.renounceOwnership()` | `RenounceOwnershipDisabled()` revert | 高 | 必須 |
| TC-028 | 単体 | 回帰 | (Issue #34) | `chainid=1, salt=0`、 `chainid=137, salt=0` | 各 chainid で `generateSeed(0, 0)` | 異なる seed | 高 | 必須 |
| TC-029 | 単体 | 回帰 | (Issue #34) | salt 値 16 種を順次 set | 各 salt で `generateSeed(0, 0)` | 16 種全て異なる seed | 中 | 必須 |
| TC-030 | 単体 | 正常系 | trait counts 全 12 = 4 | `randomSource=type(uint256).max` | `generateSeedFromSource` | 全 trait は 0-3 範囲 | 中 | 必須 |
| TC-031 | 単体 | 正常系 | (引数なし) | (引数なし) | `seeder.entropySalt()` | initial 0x00 | 低 | 推奨 |
| TC-032 | 単体 | 正常系 | (引数なし) | (引数なし) | `seeder.isEntropySaltLocked()` | initial false | 低 | 推奨 |
| TC-033 | 単体 | 正常系 | (引数なし) | (引数なし) | `seeder.art()` | constructor で渡した art address | 低 | 推奨 |
| TC-034 | 単体 | 境界値 | trait count 50 (大き目) | `randomSource=49` | `generateSeedFromSource(49)` | 0 〜 49 範囲 | 低 | 推奨 |
| TC-035 | 単体 | 回帰 | descriptor 引数は無視される | `tokenId=0, descriptor=address(0xDEAD)` | `generateSeed(0, 0xDEAD)` | 通常通り seed 返却 (descriptor は unused) | 低 | 推奨 |

## 自動化すべきテスト

全 35 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- VRF 統合 wrapper contract 経由の salt update は実装外 (本 spec は NijiSeeder 単体)
- block.prevrandao の hardfork 依存は Foundry vm.prevrandao で fuzz 可、 別 Issue
- multi-tab race condition は wallet UX 領域、 対象外

## Layer 2 連携

- `/kiwa-forge --module niji-seeder --layer contract` で本 spec を `test/foundry/Phase1/NijiSeeder.t.sol` に変換
