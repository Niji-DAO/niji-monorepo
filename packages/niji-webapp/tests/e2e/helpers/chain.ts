import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  type PrivateKeyAccount,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8547'] } },
});

type DeployedAddresses = {
  AuctionHouseProxy: `0x${string}`;
  NijiToken: `0x${string}`;
  NijiArt: `0x${string}`;
  NijiDescriptor: `0x${string}`;
  NijiSeeder: `0x${string}`;
  WETH: `0x${string}`;
};

/**
 * 最新の deploy-niji-full ログ (packages/niji-contracts/deploy/localhost-*-full.json) を
 * 読んで address を返す。 SDK の address gen は別 PR で再生成される設計のため、 test 側は
 * 実 deploy 出力を真実の source として扱う。
 */
function loadLatestDeployAddresses(): DeployedAddresses {
  const repoRoot = path.resolve(__dirname, '../../../../..');
  const deployDir = path.join(repoRoot, 'packages/niji-contracts/deploy');
  const files = readdirSync(deployDir)
    .filter(f => /^localhost-.*-full\.json$/.test(f))
    .sort()
    .reverse();
  if (files.length === 0) {
    throw new Error(
      `No deploy log found at ${deployDir}. Run \`pnpm exec hardhat deploy-niji-full --network localhost\` first.`,
    );
  }
  const latest = path.join(deployDir, files[0]);
  const json = JSON.parse(readFileSync(latest, 'utf-8')) as {
    contracts: {
      NijiArt: string;
      NijiDescriptor: string;
      NijiSeeder: string;
      NijiToken: string;
      NijiAuctionHouseProxy: string;
      WETH: string;
    };
  };
  return {
    AuctionHouseProxy: json.contracts.NijiAuctionHouseProxy as `0x${string}`,
    NijiToken: json.contracts.NijiToken as `0x${string}`,
    NijiArt: json.contracts.NijiArt as `0x${string}`,
    NijiDescriptor: json.contracts.NijiDescriptor as `0x${string}`,
    NijiSeeder: json.contracts.NijiSeeder as `0x${string}`,
    WETH: json.contracts.WETH as `0x${string}`,
  };
}

export const ADDRESSES: DeployedAddresses = loadLatestDeployAddresses();

// anvil default accounts (HD path m/44'/60'/0'/0/N)
export const ANVIL_KEYS = {
  deployer: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  bidder1: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  bidder2: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
} as const;

export const publicClient = createPublicClient({ chain: anvil, transport: http() });

export function makeWallet(privateKey: `0x${string}`): {
  account: PrivateKeyAccount;
  client: ReturnType<typeof createWalletClient>;
} {
  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({ chain: anvil, account, transport: http() });
  return { account, client };
}

export const auctionAbi = [
  {
    type: 'function',
    name: 'auctionStorage',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'nounId', type: 'uint96' },
      { name: 'clientId', type: 'uint32' },
      { name: 'amount', type: 'uint128' },
      { name: 'startTime', type: 'uint40' },
      { name: 'endTime', type: 'uint40' },
      { name: 'bidder', type: 'address' },
      { name: 'settled', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'reservePrice',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint192' }],
  },
  {
    type: 'function',
    name: 'minBidIncrementPercentage',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'createBid',
    stateMutability: 'payable',
    inputs: [{ name: 'nounId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'settleCurrentAndCreateNewAuction',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

export const tokenAbi = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
] as const;

/** anvil_snapshot で chain state を保存し snapshot id を返す (Hex)。 */
export async function snapshotChain(): Promise<`0x${string}`> {
  const rpc = (method: string, params: unknown[]) =>
    fetch('http://127.0.0.1:8547', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
  const res = await rpc('evm_snapshot', []);
  const body = (await res.json()) as { result: `0x${string}` };
  return body.result;
}

/** anvil_revert で保存した snapshot に chain state を戻す。 */
export async function revertChain(snapshotId: `0x${string}`): Promise<boolean> {
  const rpc = (method: string, params: unknown[]) =>
    fetch('http://127.0.0.1:8547', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
  const res = await rpc('evm_revert', [snapshotId]);
  const body = (await res.json()) as { result: boolean };
  return body.result;
}

/** anvil_setNextBlockTimestamp + mine で chain 時刻を進める。 */
export async function increaseTime(seconds: number) {
  const block = await publicClient.getBlock();
  const next = Number(block.timestamp) + seconds;
  const rpc = (method: string, params: unknown[]) =>
    fetch('http://127.0.0.1:8547', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
  await rpc('evm_setNextBlockTimestamp', [next]);
  await rpc('anvil_mine', ['0x1']);
}

export async function readAuction() {
  return (await publicClient.readContract({
    address: ADDRESSES.AuctionHouseProxy,
    abi: auctionAbi,
    functionName: 'auctionStorage',
  })) as readonly [bigint, number, bigint, number, number, `0x${string}`, boolean];
}
