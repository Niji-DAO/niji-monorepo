# ローカル開発フロー

webapp から contract を直接触りたい場合の最短セットアップ。 sepolia や mainnet を直接使うよりもガス代もデバッグも楽になります。

## 全体像

```mermaid
graph LR
    A[anvil 起動 chainId 31337] --> B[deploy-niji-smoke で contract 群 deploy]
    B --> C[deploy log を sdk address mapping に反映]
    C --> D[webapp dev サーバ起動 port 2424]
    D --> E[MetaMask で hardhat 31337 ネットワーク追加]
    E --> F[mint や auction を手元で操作]
```

## 1. anvil を立ち上げる

```sh
anvil
```

default 設定で OK。 RPC は `http://127.0.0.1:8545`、 chainId は 31337。 deterministic accounts (anvil 標準の 10 個) が用意されます。 deployer は account[0]、 private key は anvil の起動 log に出る最初のキー (`0xac0974be...`) を使うのが基本です。

webapp の env では `VITE_HARDHAT_JSONRPC=http://127.0.0.1:8547` のようにポート番号を変えている例もあるので、 自分の `.env` に合わせて anvil の `--port` を上げ下げしてください。

## 2. contract をデプロイ

```sh
cd packages/niji-contracts
pnpm hardhat deploy-niji-smoke --network localhost
```

`deploy-niji-smoke` は最低限 (NijiArt → NijiDescriptor → NijiSeeder → NijiToken) を入れて mint 1 体 + tokenURI 検証まで通します。 完走すると `packages/niji-contracts/deploy/localhost-{timestamp}-smoke.json` に contract address と gas 情報が書き出されます。

auction や governance まで含めて立ち上げたい場合は `deploy-niji-full` を使ってください。

## 3. SDK に address を反映

deploy log を見ながら `packages/niji-sdk` の address mapping を更新します。 多くの場合は chainId 31337 の entry を以下の 4 つに差し替える形になります。

```ts
{
  NijiArt:        '0x...',
  NijiDescriptor: '0x...',
  NijiSeeder:     '0x...',
  NijiToken:      '0x...',
}
```

webapp は sdk 経由で contract address を参照するため、 ここを更新しない限り画面は古い address を見続けます。

## 4. webapp 起動 + MetaMask 接続

```sh
cd packages/niji-webapp
cp .env.example.local .env
pnpm dev
```

webapp は `http://localhost:2424` で立ち上がります (strictPort: true で 3000 へのフォールバックはありません)。 MetaMask に「Hardhat」 ネットワーク (RPC `http://127.0.0.1:8545` / chainId 31337) を追加し、 anvil deployer の private key (`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`) を import すれば最初の mint まで触れます。

## 5. 開発中によくやる操作

| やりたいこと | コマンド |
|---|---|
| contract の test | `cd packages/niji-contracts && pnpm hardhat test` |
| 特定 test だけ | `pnpm hardhat test test/niji/NijiToken.test.ts` |
| Foundry test | `cd packages/niji-contracts && forge test` |
| anvil リセット | `pkill anvil && anvil` |
| deploy log の最新 | `ls -t packages/niji-contracts/deploy/localhost-*.json | head -1` |
| webapp の lint | `cd packages/niji-webapp && pnpm -w lint src/` |
| webapp の型 check | `cd packages/niji-webapp && pnpm tsc --noEmit` |
| graphql 型再生成 | `cd packages/niji-webapp && pnpm graphql-codegen` |
| i18n 再抽出 | `cd packages/niji-webapp && pnpm i18n:extract && pnpm i18n:compile` |

## つまずきやすいポイント

### deploy-niji-smoke の [10] tokenURI で revert

anvil の eth_call default gas limit が 30M で、 12 layer の SVG 生成が走り切らずに revert することがあります。 PR #249 以降は deploy script 側で gasLimit 300M override をかけているので最新 master であれば問題ありません。

### MetaMask が「Internal JSON-RPC error」 を返す

anvil を再起動した場合は MetaMask 側で nonce がズレています。 設定 → 詳細 → アカウントをリセット で解消します。 deployer 以外の account を使うのも有効です。

### 「Token does not exist」 が画面に出る

webapp が古い token id を覚えている可能性があります。 MetaMask の active account が deployer なら 1 度 mint して tokenId 0 を生成、 1 体目はその後の auction で settle 済になります。

### `pnpm test:watch` が CI のように 1 度で終わってしまう

vitest の `CI=true` が設定されているかもしれません。 `unset CI && pnpm test:watch` で watch mode に戻ります。

## 次のステップ

- contract に新しい admin 関数を追加したい場合は [packages/niji-contracts/contracts/NijiToken.sol](../packages/niji-contracts/contracts/NijiToken.sol) を真似て error / event / 関数 + テストを追加してください。 既存の Pausable / Withdraw / Reveal / baseURI fallback のパターンが参考になります。
- webapp に新しいページを追加したい場合は [src/pages/](../packages/niji-webapp/src/pages/) に置き、 [src/index.tsx](../packages/niji-webapp/src/index.tsx) の routing に追加します。 styling は Tailwind + shadcn/ui を default にしてください。
