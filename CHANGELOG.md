# Changelog

## [Unreleased]

### nouns-contracts

#### 追加
- **NijiGas: 本番サイズ PNG ガスベンチマーク** (#73)
  - `test/niji/NijiGas.test.ts` を新規作成。5KB/10KB/15KB/20KB の合成 PNG データを使用したガス計測テスト 12 件
  - tokenURI ガス計測: 5KB×12layers (26.1M, 30M以内) / 10KB (59.9M) / 15KB (102.0M) / 20KB (152.4M)
  - ストレージ ガス計測: addTraitImage (1.2M〜4.6M) / addTraitImages バッチ (7.0M)
  - サブオペレーション: generateSVG 10KB×12 (19.2M, 30M以内) / generateSVGBase64 (33.6M)
  - 主要発見: 5KB×12layers のみが Ethereum 30M ブロックガスリミット以内。Base64 エンコードとメモリ拡張がボトルネック
  - hardhat.config.ts: hardfork を `cancun` に固定、blockGasLimit を 300M に引き上げ（Fusaka EIP-7825 ガスキャップ回避）

- **NijiDescriptor: JSON エスケープ処理追加** (#33)
  - `JsonEscape` ライブラリを新規作成（`contracts/libs/JsonEscape.sol`）。JSON 文字列内の特殊文字を安全にエスケープ
  - 対象文字: `"` → `\"`, `\` → `\\`, `\n` → `\n`, `\r` → `\r`, `\t` → `\t`, 制御文字 (0x00-0x1F) → `\uXXXX`
  - 2-pass アルゴリズム（長さ計算 + 書き込み）でメモリ効率を最大化。エスケープ不要な文字列は即リターンでガス最小化
  - `tokenURIWithMetadata()` の `name`, `description` パラメータにエスケープを適用（ユーザー制御可能な入力）
  - `_generateAttributes()` の `traitName` にエスケープを適用（防御的対応）
  - `tokenURI()` は固定文字列のみのためエスケープ不適用（ガスコスト追加なし）
  - テスト 7 件追加（合計 122 Niji テストすべてパス）

- **NijiToken: Provenance Hash 機能追加** (#38)
  - `string public provenanceHash` ストレージを追加。全画像データの結合ハッシュを保持し、NFTコレクションの公平性証明に使用
  - `bool public isProvenanceHashLocked` ストレージを追加。ハッシュのロック状態を管理
  - `setProvenanceHash(string)` 関数を追加（onlyOwner）。ロック後に呼び出すと `ProvenanceHashLocked` エラーをrevert
  - `lockProvenanceHash()` 関数を追加（onlyOwner）。一度ロックすると以降の変更を永久に禁止
  - `ProvenanceHashLocked()` カスタムエラーを追加
  - `ProvenanceHashSet(string provenanceHash)` イベントを追加
  - テスト6件追加（デフォルト空文字・設定・イベント発行・ロック前更新可・ロック後revert・非ownerrevert）

- **NijiDescriptor: OpenSea メタデータ標準対応（attributes 追加）** (#37)
  - `_generateAttributes(uint256[] traitIndices)` internal 関数を追加。トレイトインデックスから OpenSea 標準の `attributes` 配列 JSON を生成
  - `tokenURI()` および `tokenURIWithMetadata()` の JSON 出力に `"attributes":[…]` フィールドを追加
  - `SKIP_LAYER`（`type(uint256).max`）のトレイトは attributes に含まれない
  - トレイト名は `NijiArt.getTraitName(i)` から取得し、値はインデックスの数値文字列で表現
  - テスト4件追加（`NijiDescriptor.test.ts`）、統合テスト1件追加（`NijiToken.test.ts`）

- **NijiToken: contractURI サポート** (#36)
  - `contractURI()` メソッドを追加。OpenSea 等のマーケットプレイスがコレクションレベルのメタデータを取得できるように対応
  - `setContractURIHash(string)` メソッドを追加。オーナーが IPFS ハッシュを設定することで `ipfs://{hash}` 形式の URI を返却
  - `ContractURIHashUpdated(string newContractURIHash)` イベントを追加
  - デフォルト値は空文字列（`ipfs://` を返却）
  - テスト5件追加（合計 189 テストすべてパス）

#### 変更
- **Ownable → Ownable2Step 移行** (#66)
  - `NijiToken`, `NijiArt`, `NijiDescriptor`, `NijiSeeder` の4コントラクトで `Ownable` → `Ownable2Step`（OZ v5）へ継承変更
  - オーナーシップ移転が2段階（`transferOwnership` → `acceptOwnership`）になり、誤送信による喪失リスクを排除
  - 既存の `Ownable(msg.sender)` コンストラクタ引数および `onlyOwner` 修飾子はそのまま維持
  - 各コントラクトに Ownable2Step テスト 5 件ずつ追加（計 20 件追加、合計 184 テストすべてパス）

- **ethers v5 → v6 移行** (#64)
  - `ethers` を `^5.x` から `^6.14.0` へアップグレード
  - `@nomiclabs/hardhat-ethers` → `@nomicfoundation/hardhat-ethers@^3.1.3`
  - `@nomiclabs/hardhat-waffle` → `@nomicfoundation/hardhat-chai-matchers@^2.1.2`
  - TypeChain ターゲットを `ethers-v5` → `ethers-v6` へ変更（`@typechain/ethers-v6@^0.5.1`）
  - テストコード全体で `BigNumber` → `bigint` へ移行
  - カスタムエラーのアサーションを `revertedWith` → `revertedWithCustomError` へ変更
  - テスト対象: 164 テストすべてパス

#### 依存関係の更新（packages/nouns-contracts）

| パッケージ | 変更前 | 変更後 |
|---|---|---|
| `ethers` | `^5.x` | `^6.14.0` |
| `@nomicfoundation/hardhat-ethers` | `^2.x`（`@nomiclabs/hardhat-ethers`）| `^3.1.3` |
| `@nomicfoundation/hardhat-chai-matchers` | `^1.x`（waffle）| `^2.1.2` |
| `@typechain/ethers-v6` | - | `^0.5.1`（新規追加）|
| `hardhat` | 2.28.6 | 2.28.6（変更なし）|
