/**
 * Anvil dev 用 auto-settler — 5 秒ポーリングで auctionStorage を読み、
 * endTime を越えていれば deployer wallet から settleCurrentAndCreateNewAuction
 * を呼んで次の auction を自動開始する。 Nouns contract には auto-progress
 * 機構が無いため、 dev 体験 (auction が勝手に回る) を補うための off-chain ループ。
 *
 * 起動例 (anvil account #0 を使う場合):
 *   DEPLOYER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 *     pnpm -w exec tsx packages/niji-contracts/scripts/anvil-auto-settler.ts
 *
 * 環境変数 — ANVIL_RPC (default http://127.0.0.1:8547)
 *           AUCTION_HOUSE (省略時は deploy log `deploy/localhost-*-full.json` の最新から
 *                          `NijiAuctionHouseProxy` を動的読込。 PR #193 の SDK 31337 sync と同じ pattern)
 *           DEPLOYER_PK (必須、 default なし — repo に anvil mnemonic 鍵を残さないため
 *                        OSS secret scanner / 010-env-guard の誤検知を予防)
 *           POLL_MS (default 5000)
 */

import fs from 'node:fs';
import path from 'node:path';

import { ethers } from 'ethers';

// CommonJS module 配下のため `__dirname` は global 利用可能。 tsx + CommonJS 解釈で安定。

/**
 * `packages/niji-contracts/deploy/localhost-*-full.json` の最新を読んで
 * NijiAuctionHouseProxy address を返す。 見つからない場合は undefined。
 */
function loadLatestAuctionHouseFromDeployLog(): string | undefined {
  const deployDir = path.join(__dirname, '../deploy');
  if (!fs.existsSync(deployDir)) return undefined;
  const files = fs
    .readdirSync(deployDir)
    .filter(f => /^localhost-.*-full\.json$/.test(f))
    .sort()
    .reverse();
  if (files.length === 0) return undefined;
  const latest = path.join(deployDir, files[0]);
  try {
    const json = JSON.parse(fs.readFileSync(latest, 'utf-8')) as {
      contracts?: { NijiAuctionHouseProxy?: string };
    };
    return json.contracts?.NijiAuctionHouseProxy;
  } catch {
    return undefined;
  }
}

const RPC = process.env.ANVIL_RPC ?? 'http://127.0.0.1:8547';

let AUCTION_HOUSE: string;
let AUCTION_HOUSE_SOURCE: 'env' | 'deploy-log' | 'none';
if (process.env.AUCTION_HOUSE) {
  AUCTION_HOUSE = process.env.AUCTION_HOUSE;
  AUCTION_HOUSE_SOURCE = 'env';
} else {
  const fromLog = loadLatestAuctionHouseFromDeployLog();
  if (fromLog) {
    AUCTION_HOUSE = fromLog;
    AUCTION_HOUSE_SOURCE = 'deploy-log';
  } else {
    console.error(
      '[auto-settler] AUCTION_HOUSE が解決できません。 以下のいずれかで指定してください:\n' +
        '  1) pnpm exec hardhat deploy-niji-full --network localhost を先に実行 (deploy log から自動取得)\n' +
        '  2) AUCTION_HOUSE=0x... を env で明示指定',
    );
    process.exit(2);
  }
}

const DEPLOYER_PK = process.env.DEPLOYER_PK ?? '';
if (!DEPLOYER_PK) {
  console.error(
    '[auto-settler] DEPLOYER_PK が未設定です。 anvil account #0 を使うなら以下のように起動してください:\n' +
      '  DEPLOYER_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \\\n' +
      '    pnpm -w exec tsx packages/niji-contracts/scripts/anvil-auto-settler.ts',
  );
  process.exit(2);
}
const POLL_MS = Number(process.env.POLL_MS ?? '5000');

const ABI = [
  'function auctionStorage() view returns (uint96 nounId, uint32 clientId, uint128 amount, uint40 startTime, uint40 endTime, address bidder, bool settled)',
  'function paused() view returns (bool)',
  'function settleCurrentAndCreateNewAuction()',
];

const provider = new ethers.JsonRpcProvider(RPC);
const signer = new ethers.Wallet(DEPLOYER_PK, provider);
const ah = new ethers.Contract(AUCTION_HOUSE, ABI, signer);

let stopping = false;
process.on('SIGINT', () => {
  console.log('[auto-settler] SIGINT — stopping after in-flight tx');
  stopping = true;
});
process.on('SIGTERM', () => {
  console.log('[auto-settler] SIGTERM — stopping after in-flight tx');
  stopping = true;
});

async function tick(): Promise<void> {
  try {
    const paused = (await ah.paused()) as boolean;
    if (paused) {
      // 未 unpause / 一時停止中はスキップ
      return;
    }

    const a = (await ah.auctionStorage()) as readonly [
      bigint,
      number,
      bigint,
      number,
      number,
      string,
      boolean,
    ];
    const nounId = a[0];
    const endTime = Number(a[4]);
    const settled = a[6];

    // 現在 chain 時刻を block timestamp から取る (auto-settler とブラウザの local 時刻
    // がズレているケースがあるため、 ブロックの実時刻を権威ソースにする)
    const block = await provider.getBlock('latest');
    const now = block ? Number(block.timestamp) : Math.floor(Date.now() / 1000);

    if (settled) {
      // 既に settle 済 + 次 auction 未作成のとき (deploy 直後等) は何もしない、
      // settleCurrentAndCreateNewAuction は whenNotPaused なので unpause 後の
      // 初回 auction は contract 側で _createAuction が動く想定
      return;
    }

    if (now < endTime) {
      // まだ進行中
      return;
    }

    console.log(
      `[auto-settler] Niji ${nounId} endTime=${endTime} now=${now} → settle 送信`,
    );
    const tx = await ah.settleCurrentAndCreateNewAuction();
    const receipt = await tx.wait();
    console.log(`[auto-settler] settled tx=${receipt?.hash} → 次 auction 開始`);
  } catch (error) {
    console.warn(`[auto-settler] tick error: ${(error as Error).message}`);
  }
}

async function main(): Promise<void> {
  const net = await provider.getNetwork();
  console.log(
    `[auto-settler] start — RPC=${RPC} chainId=${net.chainId} AuctionHouse=${AUCTION_HOUSE} (source=${AUCTION_HOUSE_SOURCE}) poll=${POLL_MS}ms`,
  );

  while (!stopping) {
    await tick();
    await new Promise(resolve => setTimeout(resolve, POLL_MS));
  }

  console.log('[auto-settler] stopped');
}

main().catch(error => {
  console.error('[auto-settler] fatal:', error);
  process.exit(1);
});
