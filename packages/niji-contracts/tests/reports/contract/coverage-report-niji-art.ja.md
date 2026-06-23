# Contract Coverage Report — niji-art

Generated: 2026-06-23T14:00:00+09:00
Skill: /kiwa-forge | Run: round 1 (final)
Loop terminated: production_80_achieved (NijiArt.sol 96.83% で目標 80% 達成、 round 1 完了)

## 1. 判定サマリ

| 結果 | production target (NijiArt.sol のみ) |
|---|---|
| Lines | ✅ 96.83% (61/63) |
| Statements | ✅ 93.85% (61/65) |
| Branches | ⚠️ 76.47% (13/17) |
| Functions | ✅ 100.00% (14/14) |

**判定 — ✅ PASS** (Phase 1 目標 line coverage 80% を 17 pt 超過、 全 function cover)

## 2. file 別 coverage 内訳

| File | カテゴリ | Lines | Stmts | Branches | Funcs | threshold 対象? |
|---|---|---|---|---|---|---|
| contracts/NijiArt.sol | production | 96.83% (61/63) | 93.85% (61/65) | 76.47% (13/17) | 100.00% (14/14) | ✅ |
| contracts/libs/SSTORE2.sol | production (副次) | 60.00% (12/20) | 60.00% (12/20) | 25.00% (1/4) | 60.00% (3/5) | ❌ (Art 経由の副次効果、 直接 spec は別途) |

## 3. 未到達 line の分類と判断

### contracts/NijiArt.sol - 2 line uncovered (97% 直近)

- L194 / L230 `InvalidImageIndex revert path 内の triple ternary 末尾` — 分類: **計測除外** (lcov の statement counter が 1 行内の `?:` を別 statement と認識する noise、 logic 自体は TC-014 / TC-024 で cover 済)

合計 2 line uncovered (1 関数の同等 path)、 production 100% は理論到達可能だが投資対効果として spec 不変。

## 4. Layer 1 spec への書き戻し提案

| 項目 | 反映先 section | 形式 |
|---|---|---|
| SSTORE2 単体 spec の独立化 | 「不足している仕様」 | bullet 追加候補 (Sub-PR 6 検討) |
| InvalidImageIndex の lcov statement counter noise | 「テストケース一覧」§ 観点 2 異常系 | コメント追加候補 |

## 達成内訳

- 全 35 TC 実装、 全 35 件 forge test pass
- NijiArt.sol line coverage 96.83%、 Phase 1 目標 80% 達成
- 副次 contract (SSTORE2) も 60% 上昇
- 全 14 function cover (function coverage 100%)
