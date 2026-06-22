# セットアップガイド

初めてこの repo を clone してから「dev server が立ち上がる」 までの最短手順をまとめています。 何か詰まったら本ガイド末尾の「トラブルシューティング」 を確認してください。

## 1. 前提環境のインストール

| ツール | インストール方法 |
|---|---|
| Node.js 16.x 以上 | `nvm install 20` / `mise install node@20` / 公式インストーラ |
| pnpm 10.10.0 以上 | `npm install -g pnpm@10` / `corepack enable && corepack prepare pnpm@10 --activate` |
| Foundry (forge / anvil) | `curl -L https://foundry.paradigm.xyz | bash && foundryup` |
| Git | `xcode-select --install` (macOS) / package manager |

Foundry は contract test と localnet (anvil) で使います。 webapp だけ触る場合は Foundry なしでも動きますが、 contract と組み合わせた開発をするなら入れておくと早いです。

## 2. リポジトリ clone と依存解決

```sh
git clone git@github.com:Niji-DAO/niji-monorepo.git
cd niji-monorepo
pnpm install
```

`pnpm install` はワークスペース全体の依存を一気に解決します。 turbo の cache を活かすため、 PR 単位で `pnpm install` をやり直す必要は通常ありません。

## 3. 環境変数の準備

各 package の `.env.example` を真似て `.env` を作ります。 全 package で必要なのではなく、 作業対象 package のものだけ用意すれば OK です。

| package | コマンド |
|---|---|
| `niji-contracts` | `cp packages/niji-contracts/.env.example packages/niji-contracts/.env` |
| `niji-sdk` | `cp packages/niji-sdk/.env.example packages/niji-sdk/.env` |
| `niji-webapp` (local) | `cp packages/niji-webapp/.env.example.local packages/niji-webapp/.env` |
| `niji-webapp` (mainnet) | `cp packages/niji-webapp/.env.example packages/niji-webapp/.env` |
| `niji-webapp` (Base Sepolia) | `cp packages/niji-webapp/.env.base-sepolia.example packages/niji-webapp/.env` |

webapp の env は VITE prefix の変数を中心に埋めます。 chainId / RPC / subgraph endpoint / WalletConnect の project ID あたりは必須項目です。 contract の env は Etherscan / Infura / wallet 系で、 deploy 作業をしないなら未設定でも build と test は通ります。

## 4. ビルドと dev サーバ起動

```sh
# 全 package をビルド (turbo が依存順を解決する)
pnpm -w build

# webapp を起動 (port 2424)
cd packages/niji-webapp
pnpm dev
```

`pnpm -w dev` で root から呼ぶこともできますが、 contract と webapp を別 process で動かしたい場合は対象 dir で個別に `pnpm dev` を呼ぶ方が安全です。

## 5. テスト実行で動作確認

| 対象 | コマンド |
|---|---|
| 全 package | `pnpm -w test` |
| contract のみ | `cd packages/niji-contracts && pnpm hardhat test` |
| webapp のみ | `cd packages/niji-webapp && pnpm test` |
| webapp watch | `cd packages/niji-webapp && pnpm test:watch` |

Hardhat の test (287 件以上) が緑ならローカル開発の前提は揃っています。

## トラブルシューティング

### pnpm install で `Could not resolve` エラー

pnpm のバージョンが 10.10.0 未満の可能性が高いです。 `pnpm --version` で確認して 10.10 以上に上げてください。 corepack を使っているなら `corepack prepare pnpm@10 --activate` で固定できます。

### webapp で `Cannot find module 'wagmi/...'` 等

`pnpm -w build` を 1 度走らせて contract / sdk の生成物を作る必要があります。 webapp は sdk の TypeScript build と ABI 生成に依存しています。

### Contract test が `compiler 0.8.23 not found` で落ちる

Hardhat が初回実行時に compiler を download します。 ネットワーク制限がある場合は `~/.cache/hardhat-nodejs/compilers-v2/` を一度クリアしてから再実行してください。

### anvil で deploy-niji-smoke が revert する

PR #249 以降は `setPlaceholderURI` + `reveal` + view call の gasLimit override を deploy script に含めているので、 master 最新であれば通ります。 通らない場合は anvil を再起動 (`pkill anvil && anvil`) してから再実行してください。

### `Token does not exist` が webapp で連発する

contract address が古いままの可能性があります。 `packages/niji-sdk/src/contract/addresses.json` (または相当の address mapping) の chainId 31337 のエントリを deploy log (`packages/niji-contracts/deploy/localhost-*-smoke.json`) と照らし合わせて更新してください。

### Foundry 系コマンドが PATH に通っていない

`source ~/.zshrc` (`source ~/.bashrc`) で foundryup 後の PATH 更新を読み込ませるか、 ターミナルを開き直してください。 macOS なら `~/.foundry/bin` を PATH に追加する形になります。

### `pnpm test` が webapp で長時間止まる

Vitest が watch mode に入っている可能性があります。 CI 風に 1 度だけ走らせたい場合は `cd packages/niji-webapp && pnpm test --run` を使ってください。
