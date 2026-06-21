# test-spec — NijiSeeder (Foundry contract test)

## 対象機能

`NijiSeeder` contract の `generateSeed` / `generateSeedFromSource` / `_pickTrait` (internal、 view 経由テスト) / `setArt` の 4 経路を Foundry forge test で 11 観点別に網羅。

## 仕様の要約

- `generateSeed(tokenId, descriptor)` ... `keccak256(blockhash(block.number - 1), tokenId, block.timestamp, block.prevrandao)` を pseudorandom source として、 12 trait カテゴリの index を `_pickTrait` で選択
- `generateSeedFromSource(randomSource)` ... 引数の randomSource をそのまま 12 trait に分解 (testing / preview 用)
- `_pickTrait(traitId, randomValue)` ... art.getTraitImageCount(traitId) で trait 数を取得し `randomValue % traitCount`。 traitCount == 0 のとき `type(uint256).max` (SKIP_LAYER) を返す
- `setArt(_art)` ... onlyOwner、 0 address は revert (`InvalidArtAddress`)、 ArtUpdated event emit

## 主な品質リスク

| 基準 | スコア | 根拠 |
|---|---|---|
| 売上影響 | 低 | seed 計算自体に売上効果なし |
| セキュリティ影響 | 中 | blockhash 依存で MEV bot による settle timing 操作の可能性 |
| データ破壊 | 中 | trait 0 件時の `type(uint256).max` 戻り値が呼出元で uint48 cast で潰れる (NijiToken 側でフォロー済) |
| 利用頻度 | 高 | 全 mint で 1 回呼ばれる |
| 過去障害 | 低 | seeder 自体の bug 報告なし |

→ **総合リスク = 中**

## 推奨テスト構成

Foundry forge test (`test/foundry/NijiSeederKiwaTest.t.sol`)、 11 観点で網羅。

## テスト観点一覧

1 正常系 / 2 異常系 / 3 境界値 / 5 権限 / 7 冪等性 / 9 性能 / 10 セキュリティ / 11 回帰

## テストケース一覧

| ID | 観点 | 内容 |
|---|---|---|
| TC-001 | 正常系 | generateSeed が valid Seed struct を返す (各 trait < traitCount) |
| TC-002 | 正常系 | generateSeedFromSource(0) で deterministic に同 seed を返す |
| TC-003 | 境界値 | traitCount = 1 のとき `_pickTrait` が常に 0 を返す |
| TC-004 | 境界値 | traitCount = 0 (= mock art で setTraitImageCount(0)) で SKIP_LAYER (type(uint256).max) を uint48 cast 後 type(uint48).max を返す |
| TC-005 | 境界値 | traitCount = 大量 (= 1000) で randomValue % traitCount が valid range |
| TC-006 | 冪等性 | 同 tokenId + 同 chain state で generateSeed を 2 回呼ぶと同一 seed |
| TC-007 | 冪等性 | generateSeedFromSource(N) を 2 回呼ぶと同一 seed |
| TC-008 | 異常系 | setArt(address(0)) で `InvalidArtAddress` revert |
| TC-009 | 権限 | non-owner が setArt を呼ぶと revert |
| TC-010 | 正常系 | setArt 成功時に ArtUpdated event emit (oldArt + newArt indexed) |
| TC-011 | セキュリティ | 異なる tokenId で異なる seed が出る (collision なし、 fuzz) |
| TC-012 | 性能 | generateSeed の gas usage が想定範囲 (< 50k gas) |
| TC-013 | 回帰 | getAllTraitCounts が全 12 trait の count を array で返す |

## 自動化すべきテスト

全 13 件 自動化推奨。

## 手動確認でよいテスト

(なし)

## 不足している仕様

- prevrandao の chain 依存挙動 (anvil で 0 になるケース) は forge 内では cheatcode で擬似制御
- mainnet での blockhash 抽選分布の統計検証は contract test scope 外 (off-chain analysis)
