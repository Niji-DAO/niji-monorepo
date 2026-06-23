# Contract Coverage Report — niji-auction-house-v3

Generated: 2026-06-23T15:30:00+09:00
Skill: /kiwa-forge | Run: round 2 (final)
Loop terminated: phase1_admin_scope_achieved (NijiAuctionHouseV3.sol 58.99%、 admin/event/view scope 完遂)

## 1. 判定サマリ

| 結果 | production target (NijiAuctionHouseV3.sol のみ) |
|---|---|
| Lines | ✅ 58.99% (105/178) - Phase 1 目標 50-70% 達成 |
| Statements | ✅ 58.03% (112/193) |
| Branches | ⚠️ 32.73% (18/55) - createBid / settle 経路の if/require が Phase 2 scope |
| Functions | ✅ 77.78% (21/27) - admin / view 系 21 関数 cover |

**判定 — ✅ PASS** (Phase 1 admin scope の target line coverage 50-70% に入る、 createBid / settle 経路 Issue #293 scope は意図的に未 cover)

## 2. file 別 coverage 内訳

| File | カテゴリ | Lines | Stmts | Branches | Funcs | threshold 対象? |
|---|---|---|---|---|---|---|
| contracts/NijiAuctionHouseV3.sol | production (admin scope のみ) | 58.99% (105/178) | 58.03% (112/193) | 32.73% (18/55) | 77.78% (21/27) | ✅ (50-70% target) |
| contracts/NijiAuctionHouse.sol (旧 V1) | production (deprecated) | 0.00% (0/75) | 0.00% (0/64) | 0.00% (0/24) | 0.00% (0/13) | ❌ (V1 旧 contract、 deprecated) |

## 3. 未到達 line の分類と判断

### contracts/NijiAuctionHouseV3.sol - 73 line uncovered

主要 uncovered (Issue #293 scope)。

- **createBid 系 (L127-176)** ... bid 経路全 logic (sanctions check / amount check / minBidIncrement / time buffer 延長 / refund) ... 分類: **真の未踏 (Phase 2 scope)** ... Issue #293 で扱う bid integration test 範囲
- **_createAuction (L266-285)** ... mint 経路 + try/catch pause ... 分類: **真の未踏 (Phase 2 scope)** ... unpause TC-001 で簡易 cover、 mint 失敗 catch 経路は未 cover
- **_settleAuction (L291-318)** ... settle 経路全 logic (transfer / settlement history) ... 分類: **真の未踏 (Phase 2 scope)**
- **_safeTransferETHWithFallback / _safeTransferETH (L323-343)** ... ETH refund 経路 (WETH fallback) ... 分類: **真の未踏 (Phase 2 scope)** ... refund 経路は createBid 経由でしか叩けない
- **_requireNotSanctioned (L345-352)** ... sanctions check ... 分類: **真の未踏 (Phase 2 scope)** ... createBid 経由
- **getSettlements / getSettlementsFromIdtoTimestamp / getPrices の history loop body** ... 分類: **計測除外 (history 0 で loop 未到達)** ... setPrices で 1 件追加した TC-044 で 1 経路 cover、 完全 cover は Phase 2 で複数 settlement 投入後

全て Issue #293 (post-rebrand test refresh) または Phase 2 で扱う bid / settle 経路。

## 4. Layer 1 spec への書き戻し提案

| 項目 | 反映先 section | 形式 |
|---|---|---|
| bid / settle 経路は Issue #293 解消後の Phase 2 で扱う | 「不足している仕様」 | bullet 記載済 |
| WETH fallback (refund 経路) は Phase 2 scope | 「不足している仕様」 | bullet 追加候補 |
| sanctions oracle 連携 test (ChainalysisMock の sanctioned address) は別 Issue | 「不足している仕様」 | bullet 記載済 |
| NijiAuctionHouse (V1 deprecated) は本 PR scope 外 | 「不足している仕様」 | bullet 追加候補 |

## 達成内訳

- 全 50 TC 実装、 全 50 件 forge test pass
- NijiAuctionHouseV3.sol Lines 58.99% (Phase 1 admin scope 目標 50-70% 達成)
- 21 / 27 function cover (77.78%)
- admin / event / view / pause path 完全 cover、 createBid / settle は Issue #293 scope として意図的に scope-out
