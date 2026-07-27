# @niji/subgraph

A subgraph that indexes niji events. deploy 先は **Goldsky** (production) と
The Graph Studio (legacy sepolia / mainnet) の 2 経路を support。

## Quickstart

```sh
pnpm install
```

## local dev (docker-compose、 graph-node + ipfs + postgres 16)

docker-compose.yml で local graph-node + ipfs + postgres 16 (alpine) を起動する。

```sh
docker compose up -d
```

### postgres 16 移行 (2026-07-27、 F-06 対応)

docker-compose.yml の postgres image を postgres 16-alpine に固定 + data volume を version 別
dir (`./data/postgres-16`) に分離した。 旧 postgres 12/15 で初期化した `./data/postgres/` dir は
そのまま残置される (自動移行しない、 postgres 16 は空 dir から初期化して起動)。

**旧 data を継続利用したい場合** (稀ケース、 通常は再 index 推奨):

- `pg_upgradecluster` or `pg_dumpall` + `psql` で 手動 migration 後、 volume path を戻す
- 面倒なら 旧 data を破棄して 再 index (下記)

**旧 data を破棄して clean start する場合** (推奨、 subgraph re-sync は数分〜数十分):

```sh
docker compose down -v         # volume 破棄
rm -rf ./data/postgres         # 旧 dir 削除 (option、 volume 破棄と併用)
docker compose up -d           # postgres 16 で初期化 + graph-node 起動
pnpm deploy-local              # subgraph 再 deploy → re-index 開始
```

port は `5433:5432` に固定 (旧 5432 は kiwa 系 postgres 等と衝突するため回避)。

## Goldsky deploy (推奨、 production)

### 1. Goldsky CLI インストール

```sh
curl https://goldsky.com | sh
# or
pnpm install -g @goldskycom/cli
```

### 2. Login (初回のみ)

```sh
goldsky login
# API key は https://app.goldsky.com/dashboard/settings で取得
```

### 3. Base Sepolia / Mainnet に deploy

まず `packages/niji-contracts` を各 network に deploy して address を取得し、
`config/base-sepolia.json` の `address` / `startBlock` を書き換える。

```sh
# Base Sepolia
pnpm deploy:goldsky:base-sepolia

# Mainnet
pnpm deploy:goldsky:mainnet
```

deploy 完了で Goldsky Dashboard に GraphQL endpoint URL が表示、 その URL を
`packages/niji-webapp` の env `VITE_BASE_SEPOLIA_SUBGRAPH` / `VITE_MAINNET_SUBGRAPH` に設定。

## The Graph Studio deploy (legacy、 sepolia / mainnet のみ)

Base Sepolia は The Graph Decentralized Network 未対応のため Goldsky 経路推奨。

## Nouns Subgraph

This repo contains the templates for compiling and deploying a graphql schema to thegraph.

### Authenticate

To authenticate for thegraph deployment use the `Access Token` from thegraph dashboard:

```sh
pnpm run graph auth https://api.thegraph.com/deploy/ $ACCESS_TOKEN
```

### Create subgraph.yaml from config template

```sh
# Official Subgraph
pnpm prepare:[network] # Supports rinkeby and mainnet

# Fork
pnpm --silent mustache config/[network]-fork.json subgraph.yaml.mustache > subgraph.yaml
```

### Generate types to use with Typescript

```sh
pnpm codegen
```

### Compile and deploy to thegraph (must be authenticated)

```sh
# Official Subgraph
pnpm deploy:[network] # Supports rinkeby and mainnet

# Fork
pnpm deploy [organization]/[subgraph-name]
```

### Compile and deploy to The Graph studio for The Graph's decentralized network

```sh
# Auth (only the first time)
pnpm graph auth [deploy-key] --product=subgraph-studio

# Deploy
pnpm deploy-studio:[network] # mainnet|sepolia
```

## Running a local deployment

Make sure you have Docker installed.
Run your local graph node by running:

```sh
pnpm graph-node
```

Make sure your local chain is running: in a new terminal go to the `niji-contracts` package and run:

```sh
pnpm task:run-local
```

Then in a new terminal run:

```sh
pnpm deploy:hardhat
```

## Running tests

### Matchstick setup

We're using [Matchstick](https://github.com/LimeChain/matchstick). Matchstick supports Macs and other Ubuntu-based machines natively. For other operating systems they have a Docker-based solution (see their repo for more info).

Copy `matchstick.yaml.example` and name the copy `matchstick.yaml`. Make sure the path there is a \*_full_ working path to your monorepo's top `node_modules` folder. Matchstick compilation fails when using relative paths.

### Running tests

From a clean pull run these commands in sequence:

```sh
pnpm prepare:rinkeby && pnpm codegen

pnpm test
```
