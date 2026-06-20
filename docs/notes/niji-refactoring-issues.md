# Niji リファクタリング - Issue一覧 (詳細版)

## 概要
Nijiコードベースの整理・改善・本番対応計画。

**予想変更ファイル数:** 18〜25 ファイル
**最終更新:** 2026-02-16

---

## Phase 1: 基盤整備

### Issue #1: 📦 ファイル整理・アーカイブ
**ブランチ:** `feature/niji-file-cleanup`
**ステータス:** ✅ 完了

テスト・実験用ファイルを `_archive/` へ移動済み。

---

### Issue #2: ⬆️ ライブラリ更新
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 変更内容
| パッケージ | 更新前 | 更新後 | 結果 |
|-----------|--------|--------|------|
| `pngjs` | 6.0.0 | 7.0.0 | ✅ 更新済み |
| `@openzeppelin/contracts` | 4.9.6 | 4.9.6 | 維持（既存互換） |
| `@openzeppelin/contracts-upgradeable` | 4.4.0 | 4.4.0 | 維持（既存互換） |

#### 決定事項
- **OpenZeppelin 4.x維持**: 既存Nounsコントラクトとの互換性のため4.xを維持
- **pngjs 7.x更新**: 画像処理ライブラリのみ最新化

---

## Phase 2: コントラクト

### Issue #3: ✨ NijiArt.sol 改善
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 実装内容
| 項目 | 詳細 | 状態 |
|------|------|------|
| Ownable追加 | OpenZeppelin Ownable継承 | ✅ |
| イベント追加 | `TraitImageAdded`, `TraitImagesAdded`, `DescriptorUpdated` | ✅ |
| エラー強化 | `InvalidTraitId`, `InvalidImageIndex`, `EmptyPngData` | ✅ |
| getTraitNames() | 全トレイト名取得 | ✅ |
| getTraitName() | 単一トレイト名取得 | ✅ |
| getTraitPointer/s() | SSTORE2ポインタ取得 | ✅ |
| transferDescriptor() | オーナーによるdescriptor変更 | ✅ |
| バッチ最適化 | uncheckedブロック活用 | ✅ |
| NatSpec強化 | 全関数にドキュメント追加 | ✅ |

---

### Issue #4: ✨ NijiDescriptor.sol 改善
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 実装内容
| 項目 | 詳細 | 状態 |
|------|------|------|
| Ownable追加 | OpenZeppelin Ownable継承 | ✅ |
| イベント追加 | `ArtUpdated`, `ResolutionUpdated`, `CompositeOrderUpdated` | ✅ |
| setCompositeOrder() | レイヤー順序の動的変更 | ✅ |
| getCompositeOrder() | 現在の順序取得 | ✅ |
| getCompositeOrderLength() | 順序長さ取得 | ✅ |
| tokenURIWithMetadata() | カスタムメタデータ対応 | ✅ |
| generateDataURI() | SVGデータURI生成 | ✅ |
| isConfigured() | 設定状態チェック | ✅ |
| SKIP_LAYER定数 | レイヤースキップマーカー | ✅ |

---

### Issue #5: 🆕 NijiToken.sol 新規作成
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 実装内容
```solidity
contract NijiToken is ERC721Enumerable, Ownable, ReentrancyGuard {
    // 機能
    - mint(address to) → tokenId
    - mintBatch(address to, uint256 quantity) → tokenId[]
    - tokenURI(uint256 tokenId) → string
    - getSeed(uint256 tokenId) → Seed
    - getTraitIndices(uint256 tokenId) → uint256[]

    // 管理
    - setDescriptor/setSeeder/setMinter
    - toggleMinting/setMintingActive
    - maxSupply対応

    // イベント
    - NijiMinted, DescriptorUpdated, SeederUpdated, MinterUpdated, MintingToggled
}
```

---

### Issue #6: 🆕 NijiSeeder.sol 新規作成
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 実装内容
```solidity
contract NijiSeeder is INijiSeeder, Ownable {
    struct Seed {
        uint48 special, choker, headphone, leftHand, hat, clothing,
               ear, back, backDecoration, background, solidBackground, hair
    }

    // 機能
    - generateSeed(tokenId, descriptor) → Seed（ブロックハッシュ＋prevrandao）
    - generateSeedFromSource(randomSource) → Seed（決定論的、プレビュー用）
    - getTraitCount(traitId) → uint256
    - getAllTraitCounts() → uint256[]

    // イベント
    - ArtUpdated
}
```

---

## Phase 3: スクリプト・ツール

### Issue #7: 🔧 デプロイスクリプト整備
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 実装内容
| ファイル | 状態 |
|---------|------|
| `deploy-niji-base-sepolia.ts` | 既存維持 |
| `deploy-niji-full.ts` **(NEW)** | ✅ 作成済み |

#### deploy-niji-full.ts 機能
- NijiArt, NijiDescriptor, NijiSeeder, NijiToken フルスタックデプロイ
- PNG画像処理（パレット最適化、SSTORE2アップロード）
- tokenURI動作確認
- オプションパラメータ: `--resolution`, `--maxsupply`, `--skipImages`, `--skipToken`

---

### Issue #8: 🔧 エンコードスクリプト統合
**ブランチ:** -
**ステータス:** ⏳ 保留（現状で動作確認済み）

---

### Issue #9: 🔧 tasks/index.ts 更新
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 変更内容
- アーカイブ済みファイル参照を削除（test-niji-gas, test-svg-generation等）
- `deploy-niji-full` 追加

---

## Phase 4: SDK・型定義

### Issue #10: 📦 SDK Niji対応
**ブランチ:** -
**ステータス:** ⏳ 保留（フロントエンド開発時に対応）

---

### Issue #11: 🔧 TypeChain型生成
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### 生成されたファイル
```
typechain/
├── NijiArt.ts / NijiArt.d.ts
├── NijiDescriptor.ts / NijiDescriptor.d.ts
├── NijiToken.ts / NijiToken.d.ts
├── NijiSeeder.ts / NijiSeeder.d.ts
├── INijiSeeder.ts / INijiSeeder.d.ts
└── factories/
    ├── NijiArt__factory.ts
    ├── NijiDescriptor__factory.ts
    ├── NijiToken__factory.ts
    └── NijiSeeder__factory.ts
```

---

## Phase 5: 設定・データ

### Issue #12: ⚙️ Hardhat設定更新
**ブランチ:** -
**ステータス:** ⏳ 保留（Base Mainnetデプロイ時に対応）

---

### Issue #13: 📄 データファイル整備
**ブランチ:** -
**ステータス:** ⏳ 保留（フロントエンド開発時に対応）

---

## Phase 6: テスト

### Issue #14: ✅ コントラクトテスト追加
**ブランチ:** `feature/niji-libs`
**ステータス:** ✅ 完了

#### テストファイル
| ファイル | テスト数 | 状態 |
|---------|---------|------|
| `test/niji/NijiArt.test.ts` | 19 | ✅ |
| `test/niji/NijiDescriptor.test.ts` | 17 | ✅ |
| `test/niji/NijiSeeder.test.ts` | 12 | ✅ |
| `test/niji/NijiToken.test.ts` | 38 | ✅ |
| **合計** | **86** | ✅ 全パス |

#### テストカバレッジ
- コンストラクタ
- アクセス制御（onlyOwner, onlyDescriptor, onlyMinter）
- エラー条件（InvalidTraitId, EmptyPngData, TokenDoesNotExist等）
- 状態変更（mint, setDescriptor, toggleMinting等）
- イベント発行
- ガス計測

---

## Phase 7: 最終化

### Issue #15: 🚀 コンパイル・検証
**ブランチ:** `feature/niji-core`
**ステータス:** ✅ 完了

#### チェックリスト
- [x] `pnpm build:sol` 成功
- [x] `pnpm test test/niji/*.test.ts` 全パス (86件)
- [x] TypeChain型生成確認
- [x] ABI出力確認

---

### Issue #16: 🚀 Base Sepolia 再デプロイ
**ブランチ:** `feature/niji-core`
**ステータス:** 🔲 未着手

#### 実行予定
1. 新コントラクトデプロイ（Art, Descriptor, Seeder, Token）
2. トレイト画像アップロード
3. tokenURI動作確認
4. Basescan検証

---

### Issue #17: 🚀 master PR作成
**ブランチ:** `feature/niji-core` → `master`
**ステータス:** 🔲 未着手
**依存:** Issue #16

---

## 進捗サマリー

| カテゴリ | 完了 | 保留 | 未着手 | 合計 |
|---------|------|------|--------|------|
| 基盤整備 | 2 | 0 | 0 | 2 |
| コントラクト | 4 | 0 | 0 | 4 |
| スクリプト | 2 | 1 | 0 | 3 |
| SDK・型定義 | 1 | 1 | 0 | 2 |
| 設定・データ | 0 | 2 | 0 | 2 |
| テスト | 1 | 0 | 0 | 1 |
| 最終化 | 1 | 0 | 2 | 3 |
| **合計** | **11** | **4** | **2** | **17** |

---

## ブランチ状態

| ブランチ | Issue | 状態 |
|---------|-------|------|
| `feature/niji-core` | ベース | ✅ 最新 |
| `feature/niji-file-cleanup` | #1 | ✅ マージ済み |
| `feature/niji-libs` | #2-6, #9, #11, #14, #15 | ✅ マージ済み |
| `feature/niji-token` | - | 不要（#5,#6をfeature/niji-libsで実装） |
| `feature/niji-scripts` | - | 不要（#7をfeature/niji-libsで実装） |

---

## 成果物一覧

### 新規作成ファイル
```
packages/niji-contracts/
├── contracts/
│   ├── NijiSeeder.sol          (163行)
│   ├── NijiToken.sol           (312行)
│   └── interfaces/
│       └── INijiSeeder.sol     (31行)
├── tasks/
│   └── deploy-niji-full.ts     (301行)
└── test/niji/
    ├── NijiArt.test.ts         (169行)
    ├── NijiDescriptor.test.ts  (199行)
    ├── NijiSeeder.test.ts      (189行)
    └── NijiToken.test.ts       (347行)
```

### 改善ファイル
```
packages/niji-contracts/
├── contracts/
│   ├── NijiArt.sol             (76行 → 226行)
│   └── NijiDescriptor.sol      (116行 → 308行)
├── tasks/
│   └── index.ts                (アーカイブ参照削除)
└── package.json                (pngjs 7.x追加)
```
