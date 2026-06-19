# Niji webapp e2e tests

Playwright で webapp + anvil chain 31337 を統合検証する。

## 前提

- `anvil --port 8545 --chain-id 31337 --host 127.0.0.1` を別ターミナルで起動済み
- `pnpm dev` (webapp port 2424) を別ターミナルで起動済み
- 初回のみ `pnpm exec playwright install chromium` で chromium driver を取得

## 実行

```bash
cd packages/niji-webapp
pnpm e2e
```

globalSetup が走り、 anvil_reset で chain をクリーン → `pnpm exec hardhat deploy-niji-full --network localhost` で全 contract を再 deploy → playwright が test を順次実行する。

deploy は決定論的なので同じ address が常に再現される。

## 構成

| ファイル | 役割 |
|---|---|
| `playwright.config.ts` | testDir / globalSetup / chromium 設定 |
| `global-setup.ts` | anvil_reset + deploy-niji-full 自動化 |
| `helpers/chain.ts` | viem client / 固定 address / ABI 抜粋 / increaseTime |
| `01-auction.spec.ts` | contract layer 検証 (auctionStorage / reservePrice / bid) |
| `02-settle.spec.ts` | 期限切れ → settle → new auction 開始の full flow |
| `03-bid-errors.spec.ts` | reservePrice 未満 / 増分違反 / 不正 nounId / 早期 settle の revert |
| `04-routes.spec.ts` | /playground / /traits / /nijis / /vote / /lp/ の遷移と表示 |
| `05-ui-auction.spec.ts` | webapp top の auction UI 描画確認 |

## test 間の順序依存

playwright config は `workers: 1` + `fullyParallel: false` で **直列実行**。 spec 内 test は前提状態を共有する (例 `settle.spec.ts` は `auction.spec.ts` で bidder2 が落札した状態を前提に settle を呼ぶ)。

逆順や並列化したい場合は globalSetup を spec 単位で beforeAll に分割する設計に切り替える。
