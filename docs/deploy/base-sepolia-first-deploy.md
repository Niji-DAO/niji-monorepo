# Base Sepolia 初回 deploy 手順 (2026-07-17)

`/auto` session で完成した base-sepolia deploy 準備 code を、 user が実際に deploy する手順書。 3 段 (contracts → Workers → Pages) + subgraph (明日 Goldsky) の合計 4 段。

## 前提

- Base Sepolia real ETH 保有済の deployer EOA (~0.05 ETH 推奨)、 secret key を安全な場所に保管
- Cloudflare account (Pages + Workers 無料 tier 使用)
- fincode dashboard で dev 用 secret key (`m_test_...`) 発行済
- `wrangler login` 済 (`pnpm wrangler login` で Cloudflare 認証)

## Step 1 : `.env.dev` 作成 (webapp + niji-contracts)

`.env.dev` は `/auto` 側で permission hook (dotfile 直接編集禁止) により作成不能、 user 手動作成。

### 1-1. niji-contracts

```bash
cp packages/niji-contracts/.env.dev.example packages/niji-contracts/.env.dev
```

編集内容:

```
DEPLOYER_PK=0x<deployer 秘密鍵、 Base Sepolia real ETH 保有>
RPC_URL=https://sepolia.base.org
EXPLORER_API_KEY=<basescan API key、 verify 用>
NIJI_AUCTION_DURATION=86400          # 24h、 default で入るが明示可能
```

### 1-2. niji-webapp

```bash
cp packages/niji-webapp/.env.dev.example packages/niji-webapp/.env.dev
```

編集内容 (`.env.local` から 2 key を copy):

```
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
VITE_SUBGRAPH_URL=                    # 明日 Goldsky 設定後に反映
VITE_NIJI_API_BASE_URL=https://niji-api.<workers-subdomain>.workers.dev
VITE_SPOT_RATE_URL=                   # spot-rate server (別 Workers or Node) 経路確定後
VITE_WALLET_CONNECT_V2_PROJECT_ID=<.env.local と同値>
VITE_FINCODE_PUBLIC_KEY=<.env.local と同値、 dev test key >
```

## Step 2 : Contract deploy (Base Sepolia)

```bash
cd packages/niji-contracts
pnpm dev:dev
```

内部で `cp .env.dev .env && hardhat --network base-sepolia deploy-niji-full` が走り:

- `NijiArt` / `NijiDescriptor` / `NijiSeeder` / `NijiToken` deploy
- **`NijiAuctionHouseV3 + Proxy` deploy (reserve price 0.001 ETH、 auction duration 86400s = 24h、 timeBuffer 300s、 minBidIncrement 2%)**
- `NijiToken.setMinter(proxy)` + `setPlaceholderURI(...)` + `setMintingActive(true)` + `proxy.unpause()` で auction #0 開始

deploy log は `packages/niji-contracts/deployments/base-sepolia.json` に snapshot、 address 群を抽出:

- `NijiAuctionHouseProxy` (`AUCTION_HOUSE_ADDRESS`)
- `NijiToken` (`NIJI_TOKEN_ADDRESS`)
- `NijiDescriptor` / `NijiSeeder` / `NijiArt`

## Step 3 : `.env.dev` + `wrangler.toml` に real address 反映

### 3-1. niji-webapp `.env.dev`

```
VITE_NIJI_TOKEN_ADDRESS=0x<NijiToken address>
VITE_NIJI_AUCTION_HOUSE_ADDRESS=0x<NijiAuctionHouseProxy address>
VITE_NIJI_DESCRIPTOR_ADDRESS=0x<NijiDescriptor address>
VITE_NIJI_SEEDER_ADDRESS=0x<NijiSeeder address>
```

### 3-2. niji-api `wrangler.toml` `[vars]`

```toml
[vars]
AUCTION_HOUSE_ADDRESS = "0x<NijiAuctionHouseProxy address>"
NIJI_TOKEN_ADDRESS = "0x<NijiToken address>"
```

### 3-3. niji-subgraph `config/base-sepolia.json` (明日の Goldsky 用)

deploy log から address + startBlock (deploy 時 block 番号) を反映。

## Step 4 : Cloudflare Workers (niji-api) deploy

### 4-1. secret 登録 (初回のみ)

```bash
cd packages/niji-api
wrangler secret put FINCODE_API_KEY_SECRET
# fincode dashboard の secret key (m_test_... or m_live_...) を貼る
wrangler secret put OPERATOR_PK
# deployer EOA 秘密鍵と同じ or 別の運営 EOA 秘密鍵 (real ETH 保有必須、 chain 上代理入札発火 + transferFrom 実行)
```

### 4-2. KV namespace 作成 (初回のみ)

wrangler.toml で `binding = "FINCODE_STATE"` + `id = "29ed658a44994fce8e8f83085666ac5a"` = 前 session で作成済 KV、 そのまま流用。

新規作成の場合:

```bash
wrangler kv namespace create FINCODE_STATE
# 出力の id を wrangler.toml の [[kv_namespaces]] id field に反映
```

### 4-3. deploy

```bash
wrangler deploy
```

deploy 完了で URL 発行 (例 `https://niji-api.<subdomain>.workers.dev`)、 `.env.dev` の `VITE_NIJI_API_BASE_URL` に反映。 `[triggers] crons = ["* * * * *"]` により 1 分毎 SettlementDaemon が起動。

## Step 5 : Cloudflare Pages (niji-webapp) deploy

```bash
cd packages/niji-webapp
pnpm deploy:pages:dev
```

内部で `pnpm build:dev` (Vite `.env.dev` 使用 production build) → `wrangler pages deploy dist --project-name=niji-webapp --branch=dev`。

初回のみ Cloudflare Pages で project name `niji-webapp` を作成 (wrangler が prompt)、 branch = `dev`。

deploy 完了で URL 発行 (例 `https://dev.niji-webapp.pages.dev`)、 fincode webhook (return URL 等) が必要な場合 fincode dashboard に登録。

## Step 6 (明日) : Goldsky subgraph 設定

- Goldsky dashboard で subgraph `nijis-base-sepolia` 作成 → project_id + deploy key 発行
- `packages/niji-subgraph/config/base-sepolia.json` に address + startBlock 反映
- Goldsky CLI で subgraph deploy: `goldsky subgraph deploy nijis-base-sepolia/v0.0.1`
- 発行された URL を `packages/niji-webapp/.env.dev` の `VITE_SUBGRAPH_URL` に反映
- webapp 再 build + Pages redeploy (`pnpm deploy:pages:dev`)

## Step 7 : verify

- Basescan で contract 群を verify (自動で走る、 `EXPLORER_API_KEY` 必須)
- webapp UI で bid 実行 → fincode capture + chain transferFrom まで完走確認 (dev 決済 flow の real deploy 版 verify)
- Cloudflare Workers dashboard で cron 実行 log 監視

## 構成図

```
[Cloudflare Pages]                         [Cloudflare Workers]
  dev.niji-webapp.pages.dev  <───fetch────>  niji-api.workers.dev
     │                                          │
     │ Static build (Vite prod)                 │ authorize / capture / place-bid / cron
     │                                          │
     ▼                                          ▼
  [ user browser ]                        [ fincode.jp API ] + [ Base Sepolia RPC ]
                                                │
                                                └──> [Cloudflare KV] fiat_bid record + cron cursor

[Cloudflare Cron Triggers] (1 min 毎)
  → SettlementDaemon (Workers scheduled handler)
    → AuctionSettled event poll
    → fiat_bid record 突合 → capture + transferFrom or cancel
```

## 現状の gap (今 session で未完)

- `.env.dev` 作成 (webapp / contracts 両方) = permission hook で AI 直接不可、 user 手動
- 実 Contract deploy = user 手元 (DEPLOYER_PK + real ETH)
- 実 Cloudflare deploy = user 手元 (wrangler login 認証)
- Goldsky subgraph = 明日 user 手動 setup
- 現状の Workers 版 place-bid handler = spot rate は mock 経路のみ (real API 経路は Node 版 spot-rate-server と別。 本番想定は spot-rate 独立 Workers or Cron で 15 秒毎 rate cache する経路が別途必要)

## 参考

- decision-log: `~/projects/claude-memory/decisions/personal/decision-log/2026-07-17-niji-auto-base-sepolia-env-dev-scope.md`
- 前 session hybrid deploy: `2026-07-16-niji-cloudflare-hybrid-deploy.md`
- 本番想定 fiat bid pattern: `2026-07-17-niji-anvil-impersonate-fiat-bid-bidder.md` (anvil impersonate 経路を prod で運営 EOA 代理入札 + settle 後 transferFrom pattern に切替)
