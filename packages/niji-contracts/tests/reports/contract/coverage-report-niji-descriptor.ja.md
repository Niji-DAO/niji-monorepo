# Contract Coverage Report — niji-descriptor

Generated: 2026-06-23T15:00:00+09:00
Skill: /kiwa-forge | Run: round 1 (final)
Loop terminated: production_80_achieved (NijiDescriptor.sol 97.59% で目標 80% 大幅超過)

## 1. 判定サマリ

| 結果 | production target (NijiDescriptor.sol のみ) |
|---|---|
| Lines | ✅ 97.59% (81/83) |
| Statements | ✅ 97.92% (94/96) |
| Branches | ✅ 93.75% (15/16) |
| Functions | ✅ 100.00% (15/15) |

**判定 — ✅ PASS** (4 metric 全 90%+ 達成、 function 100% 完全 cover)

## 2. file 別 coverage 内訳

| File | カテゴリ | Lines | Stmts | Branches | Funcs | threshold 対象? |
|---|---|---|---|---|---|---|
| contracts/NijiDescriptor.sol | production | 97.59% (81/83) | 97.92% (94/96) | 93.75% (15/16) | 100.00% (15/15) | ✅ |
| contracts/SVGRenderer.sol | production (未使用、 deprecated) | 0.00% (0/77) | 0.00% (0/86) | 0.00% (0/6) | 0.00% (0/9) | ❌ (NijiDescriptor は base64 image tag 経路で SVGRenderer を直接呼ばない、 deprecated) |
| contracts/libs/JsonEscape.sol | production (副次) | 27.45% (14/51) | n/a | n/a | n/a | ❌ (JsonEscape 単体 spec は別 Sub-PR 候補) |

## 3. 未到達 line の分類と判断

### contracts/NijiDescriptor.sol - 2 line uncovered (98% 直近)

- L267 / L268 `getTraitImage が pngData.length == 0 を返す経路の continue` — 分類: **真の未踏 (低優先度)** ... NijiArt.getTraitImage は空 bytes を返す経路を持たず (InvalidImageIndex revert で吸収)、 logically unreachable で test 不能。 production safety as defensive code として残置

合計 2 line uncovered、 全て defensive code。

## 4. Layer 1 spec への書き戻し提案

| 項目 | 反映先 section | 形式 |
|---|---|---|
| SVGRenderer は本 PR scope 外 (deprecated 経路) | 「不足している仕様」 | bullet 追加候補 (deprecated marker 追加 candidate) |
| JsonEscape 単体 spec の独立化 | 「不足している仕様」 | bullet 追加候補 (Sub-PR 6 候補) |

## 達成内訳

- 全 35 TC 実装、 全 35 件 forge test pass
- NijiDescriptor.sol Lines 97.59% / Statements 97.92% / Branches 93.75% / Functions 100%
- generateSVG / tokenURI / freezeMetadata 全 admin 経路 + 異常系 + 境界値 (SKIP_LAYER / 範囲外 composite) cover
- JsonEscape は副次効果で 14% → 27% 上昇 (Sub-PR 6 で単体 spec 候補)
