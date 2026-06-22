# niji-monorepo

Niji DAO は generative on-chain avatar art collective です。 本リポジトリは smart contracts / webapp / SDK / api / docs を 1 つの monorepo にまとめた構成で、 Nouns DAO を fork し Niji の独自仕様 (12 trait / on-chain SVG / reveal + baseURI fallback / 緊急停止) を組み込んでいます。

## 構成 package

| package | 内容 |
|---|---|
| `packages/niji-assets` | PNG とランレングス圧縮 (RLE) image data |
| `packages/niji-contracts` | Hardhat + Foundry の Solidity contract suite (ERC721 / governance / auction / on-chain SVG) |
| `packages/niji-sdk` | contract address / ABI / image utility (Node + browser) |
| `packages/niji-api` | [ponder.sh](https://ponder.sh) ベースの historical data API |
| `packages/niji-subgraph` | (**deprecated**) The Graph subgraph manifest、 `niji-api` に置き換え予定 |
| `packages/niji-webapp` | React + Vite frontend (wagmi + TanStack Query + Tailwind + shadcn/ui) |
| `packages/niji-docs` | Next.js 16 + Nextra 4 の公開 docs サイト |

package 間の build 依存は webapp → assets / contracts / sdk の順で turbo が解決します。

## 必要環境

| ツール | バージョン |
|---|---|
| Node.js | 16.x 以上 |
| pnpm | 10.10.0 以上 |
| foundry (forge) | 任意、 contract 開発で利用 |
| anvil (Foundry 付属) | localnet 起動で利用 |

## Quickstart

```sh
# 1. 依存をインストール
pnpm install

# 2. webapp の環境変数を用意
cd packages/niji-webapp
cp .env.example.local .env

# 3. 全 package をビルド
pnpm -w build

# 4. 開発サーバを起動 (webapp は port 2424)
pnpm -w dev
```

初回セットアップで詰まったら [docs/setup-guide.md](docs/setup-guide.md) を参照してください。
ローカル contract と合わせた開発フロー (anvil 起動 + deploy-niji-smoke + webapp 接続) は [docs/local-dev.md](docs/local-dev.md) にあります。

## 開発でよく使うコマンド

```sh
pnpm -w lint        # ESLint (cache 付き、 file path を引数に渡す)
pnpm -w format      # Prettier 整形
pnpm -w test        # 全 package のテスト実行
pnpm -w build       # 全 package のビルド
```

package 単体で作業する場合は対象 dir に `cd` して同じコマンドを実行します。
contract だけテストしたい場合は `cd packages/niji-contracts && pnpm hardhat test`、 webapp だけ起動したい場合は `cd packages/niji-webapp && pnpm dev` のように使い分けます。

## 環境変数の例

各 package 配下に `.env.example` (または `.env.example.local`) を置いてあります。

| package | サンプル file | 用途 |
|---|---|---|
| `packages/niji-contracts` | `.env.example` | Hardhat / Foundry 用 (Etherscan / Infura / wallet) |
| `packages/niji-sdk` | `.env.example` | SDK 内部スクリプト用 |
| `packages/niji-webapp` | `.env.example.local` | local 開発用 (Vite + wagmi) |
| `packages/niji-webapp` | `.env.example` | mainnet / sepolia 用 |
| `packages/niji-webapp` | `.env.base-sepolia.example` | Base Sepolia testnet 用 |

各 file の中身を読んで必要な変数だけ埋めてください。 1 file で全 package をカバーする root レベルの env example は意図的に置いていません (package ごとに必要なキーが大きく違うため)。

## 主要機能

### Smart contracts (`niji-contracts`)

- **NijiToken** ... ERC721 + Enumerable + Votes + Pausable で実装した generative NFT。 mint / transfer / burn は `_update` 経由で pause 可能 (緊急停止)、 reveal メカニズム (`isRevealed` + `_placeholderURI`) で公開タイミングを揃えられる、 baseURI fallback (`_baseTokenURI` + `isBaseURILocked`) で onchain SVG 不能時に IPFS / Arweave 等にフェイルオーバ可能。
- **NijiAuctionHouse / V3** ... 24 時間オークション。 NijiToken に minter 権限を付与して mint → auction → settle のサイクルを回す。
- **NijiDescriptor / NijiArt / NijiSeeder** ... on-chain で PNG → SVG を組み立てる 3 contract セット。 12 trait × 3 image を SSTORE2 で保存し、 seed (uint48 × 12) から traitIndices を導出して descriptor が SVG を生成する。
- **Ownable2Step** ... 全 4 contract (Token / Art / Descriptor / Seeder) で `renounceOwnership` を override して revert させ、 ownership が address(0) になる事故を構造的に防止。

### Webapp (`niji-webapp`)

React 18 + Vite + wagmi + TanStack Query + Jotai で構築。 state は Jotai atom (UI / 永続化) と TanStack Query (server state) の組み合わせ、 styling は CSS Modules + react-bootstrap から Tailwind + shadcn/ui への移行中。 Apollo Client と Redux Toolkit は完全撤去済で、 全 subgraph query は TanStack Query + GraphQL Codegen 経由になっています。 詳細は [packages/niji-webapp/README.md](packages/niji-webapp/README.md) を参照。

### Docs (`niji-docs`)

Next.js 16 + Nextra 4 + Pagefind の公開 docs サイト。 `pnpm build` で `.next` build + Pagefind 検索 index を同時生成。

## アクティブな移行

webapp 内で進行中の刷新は以下の通り。 新規実装ではモダン側を使ってください。

| 旧 | 新 | 状態 |
|---|---|---|
| Redux Toolkit (server state) | TanStack Query + Jotai | 完了 (package.json から削除済) |
| CSS Modules + react-bootstrap | Tailwind CSS + shadcn/ui | 進行中 |
| Apollo Client | TanStack Query + GraphQL Codegen | 完了 |

## License

GPL-3.0
