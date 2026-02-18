# Changelog

## [Unreleased]

### nouns-contracts

#### 変更
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
