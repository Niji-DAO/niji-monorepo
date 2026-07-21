/**
 * sync-addresses.ts — deploy 済 address を SSOT (deployments/<network>.json) から 3 消費先へ同期する。
 *
 * 背景 = contract address は再 deploy のたびに変わり、 webapp (SDK gen.ts) / subgraph config /
 * Cloudflare Workers (wrangler.toml) の 3 箇所に手動転記していた。 5 箇所手動反映は再 deploy 時に
 * 必ず 1 箇所漏れ、 「webapp は新 contract / subgraph は旧 contract」 の silent drift を生む。
 * 本 script は deployments/<network>.json (deploy task が自動生成する canonical source) を single source に、
 * 3 消費先を機械的に上書きする。
 *
 * 使い方:
 *   npx hardhat --network base-sepolia run scripts/sync-addresses.ts
 *   (--network で読む deployments/<network>.json を決定、 startBlock は RPC から binary search で取得)
 *
 * 同期先 (chainId 別):
 *   1. packages/niji-sdk/src/actions/{token,auction-house,descriptor}.gen.ts  = `<chainId>: '0x...'`
 *   2. packages/niji-subgraph/config/<network>.json                          = address + startBlock
 *   3. packages/niji-api/wrangler.toml                                       = AUCTION_HOUSE_ADDRESS / NIJI_TOKEN_ADDRESS
 *
 * 反映後は SDK rebuild (pnpm --filter @niji/sdk build) が別途必要 (webapp が dist を読むため)。
 */
import fs from 'fs';
import path from 'path';

import hre from 'hardhat';

const CONTRACTS_ROOT = path.join(__dirname, '..');
const MONOREPO_ROOT = path.join(CONTRACTS_ROOT, '../..');

/** deployments/<network>.json (canonical source) の shape */
type DeploymentSnapshot = {
  network: string;
  chainId: number;
  contracts: {
    NijiArt: string;
    NijiDescriptor: string;
    NijiSeeder: string;
    NijiToken: string;
    NijiAuctionHouseProxy: string;
    WETH: string;
  };
};

/** RPC から contract の deploy block を binary search (code が存在する最古 block) */
async function findDeployBlock(addr: string, latest: number): Promise<number> {
  const provider = hre.ethers.provider;
  let lo = latest - 200000 > 0 ? latest - 200000 : 0;
  let hi = latest;
  // 事前に lo で code なし + hi で code ありを確認 (範囲外なら full scan にひろげる)
  if ((await provider.getCode(addr, hi)) === '0x') {
    throw new Error(`${addr} は latest block ${hi} に code なし (deploy 未完 or 別 network)`);
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const code = await provider.getCode(addr, mid);
    if (code && code !== '0x') hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/**
 * gen.ts の `<chainId>: '0x...'` 行を新 address に置換。
 *
 * 重要 = SDK は actions/ と react/ の 2 系統に同じ address map を重複して持つ。
 * webapp は `@niji/sdk/react` を import するため react/ 側の更新が必須 (2026-07-21 の
 * 「webapp が zero address を読んで auction が表示されない」 事故の root cause)。
 * subdir 引数で両系統を明示的に同期する。
 */
function syncGenTs(file: string, chainId: number, newAddr: string, subdir = 'actions'): boolean {
  const full = path.join(MONOREPO_ROOT, 'packages/niji-sdk/src', subdir, file);
  if (!fs.existsSync(full)) {
    console.warn(`  ⚠️  ${file} not found, skip`);
    return false;
  }
  const src = fs.readFileSync(full, 'utf-8');
  // `  84532: '0x....',` を捕捉 (address 部分のみ置換、 前後の indent / comma を保持)
  const re = new RegExp(`(${chainId}:\\s*')0x[0-9a-fA-F]{40}(')`);
  if (!re.test(src)) {
    console.warn(`  ⚠️  ${subdir}/${file} に ${chainId} entry なし、 skip`);
    return false;
  }
  const next = src.replace(re, `$1${newAddr}$2`);
  if (next === src) {
    console.log(`  =  ${subdir}/${file} (${chainId}) 既に最新`);
    return false;
  }
  fs.writeFileSync(full, next);
  console.log(`  ✓  ${subdir}/${file} (${chainId}) → ${newAddr}`);
  return true;
}

/** subgraph config/<network>.json の address + startBlock を更新 */
function syncSubgraphConfig(
  network: string,
  tokenAddr: string,
  tokenBlock: number,
  auctionAddr: string,
  auctionBlock: number,
): void {
  const full = path.join(MONOREPO_ROOT, 'packages/niji-subgraph/config', `${network}.json`);
  if (!fs.existsSync(full)) {
    console.warn(`  ⚠️  subgraph config ${network}.json not found, skip`);
    return;
  }
  const cfg = JSON.parse(fs.readFileSync(full, 'utf-8'));
  cfg.nijiToken = { address: tokenAddr, startBlock: tokenBlock };
  cfg.nijiAuctionHouse = { address: auctionAddr, startBlock: auctionBlock };
  fs.writeFileSync(full, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`  ✓  subgraph config/${network}.json → token@${tokenBlock} auction@${auctionBlock}`);
}

/** wrangler.toml の AUCTION_HOUSE_ADDRESS / NIJI_TOKEN_ADDRESS を更新 */
function syncWranglerToml(tokenAddr: string, auctionAddr: string): void {
  const full = path.join(MONOREPO_ROOT, 'packages/niji-api/wrangler.toml');
  if (!fs.existsSync(full)) {
    console.warn(`  ⚠️  wrangler.toml not found, skip`);
    return;
  }
  let src = fs.readFileSync(full, 'utf-8');
  src = src.replace(
    /(AUCTION_HOUSE_ADDRESS\s*=\s*")0x[0-9a-fA-F]{40}(")/,
    `$1${auctionAddr}$2`,
  );
  src = src.replace(/(NIJI_TOKEN_ADDRESS\s*=\s*")0x[0-9a-fA-F]{40}(")/, `$1${tokenAddr}$2`);
  fs.writeFileSync(full, src);
  console.log(`  ✓  wrangler.toml → auction=${auctionAddr} token=${tokenAddr}`);
}

async function main() {
  const network = hre.network.name;
  const snapshotPath = path.join(CONTRACTS_ROOT, 'deployments', `${network}.json`);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`deployments/${network}.json が無い、 先に deploy-niji-full を実行`);
  }
  const snap: DeploymentSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
  const chainId = snap.chainId;
  const { NijiToken, NijiAuctionHouseProxy, NijiDescriptor } = snap.contracts;

  console.log(`\n=== sync-addresses: ${network} (chainId ${chainId}) ===`);
  console.log(`source: deployments/${network}.json\n`);

  console.log('1. startBlock 取得 (RPC binary search)...');
  const latest = await hre.ethers.provider.getBlockNumber();
  const tokenBlock = await findDeployBlock(NijiToken, latest);
  const auctionBlock = await findDeployBlock(NijiAuctionHouseProxy, latest);
  console.log(`   token@${tokenBlock} auction@${auctionBlock}\n`);

  console.log('2. SDK gen.ts 同期 (actions/ と react/ の 2 系統、 webapp は react/ を import)...');
  for (const subdir of ['actions', 'react']) {
    syncGenTs('token.gen.ts', chainId, NijiToken, subdir);
    syncGenTs('auction-house.gen.ts', chainId, NijiAuctionHouseProxy, subdir);
    syncGenTs('descriptor.gen.ts', chainId, NijiDescriptor, subdir);
  }

  console.log('\n3. subgraph config 同期...');
  syncSubgraphConfig(network, NijiToken, tokenBlock, NijiAuctionHouseProxy, auctionBlock);

  console.log('\n4. wrangler.toml 同期...');
  syncWranglerToml(NijiToken, NijiAuctionHouseProxy);

  console.log('\n✅ sync 完了。 次:');
  console.log('   pnpm --filter @niji/sdk build   # webapp が dist を読むため rebuild 必須');
  console.log('   (webapp .env.dev は dotfile guard で手動、 但し address は SDK gen.ts 経由で自動反映)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
