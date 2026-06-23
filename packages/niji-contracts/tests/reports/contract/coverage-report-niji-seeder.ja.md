# Contract Coverage Report — niji-seeder

Generated: 2026-06-23T14:30:00+09:00
Skill: /kiwa-forge | Run: round 1 (final)
Loop terminated: production_100_achieved (NijiSeeder.sol 4 metric 全 100%)

## 1. 判定サマリ

| 結果 | production target (NijiSeeder.sol のみ) |
|---|---|
| Lines | ✅ 100.00% (37/37) |
| Statements | ✅ 100.00% (35/35) |
| Branches | ✅ 100.00% (5/5) |
| Functions | ✅ 100.00% (10/10) |

**判定 — ✅ PASS** (全 4 metric 100% 到達、 Phase 1 目標 80% を完全超過)

## 2. file 別 coverage 内訳

| File | カテゴリ | Lines | Stmts | Branches | Funcs | threshold 対象? |
|---|---|---|---|---|---|---|
| contracts/NijiSeeder.sol | production | 100.00% (37/37) | 100.00% (35/35) | 100.00% (5/5) | 100.00% (10/10) | ✅ |
| contracts/NijiArt.sol | production (副次依存) | 25.40% (16/63) | n/a | n/a | n/a | ❌ (Sub-PR 2 で 96.83% 達成済) |
| contracts/libs/SSTORE2.sol | production (Art 依存) | 25.00% (5/20) | n/a | n/a | n/a | ❌ (Sub-PR 6 候補) |

## 3. 未到達 line の分類と判断

contracts/NijiSeeder.sol - 0 line uncovered。 全 4 metric 100% 到達、 残課題なし。

## 4. Layer 1 spec への書き戻し提案

| 項目 | 反映先 section | 形式 |
|---|---|---|
| VRF wrapper contract 統合 spec は別 Issue | 「不足している仕様」 | bullet 追加候補 (Phase 2 で対応) |
| block.prevrandao の hardfork 依存 fuzz は別 Issue | 「不足している仕様」 | bullet 追加候補 |

## 達成内訳

- 全 35 TC 実装、 全 35 件 forge test pass
- NijiSeeder.sol 全 4 metric 100% coverage 達成
- Issue #34 (chainid + 回転 salt) 回帰防御 cover 完了
- cross-chain replay 防御 (chainid 変化で seed 変動) verify 済
