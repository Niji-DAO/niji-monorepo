import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  type PrivateKeyAccount,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
});

/**
 * deploy-niji-full --network localhost は anvil の deterministic deploy で常に
 * 同じ address を返す (deployer = account #0、 nonce 起点 0)。 この前提を test に
 * ハードコードする。
 */
export const ADDRESSES = {
  AuctionHouseProxy: '0x59b670e9fA9D0A427751Af201D676719a970857b',
  NijiToken: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  NijiArt: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  NijiDescriptor: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  NijiSeeder: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  WETH: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
} as const;

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

/** anvil_setNextBlockTimestamp + mine で chain 時刻を進める。 */
export async function increaseTime(seconds: number) {
  const block = await publicClient.getBlock();
  const next = Number(block.timestamp) + seconds;
  const rpc = (method: string, params: unknown[]) =>
    fetch('http://127.0.0.1:8545', {
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
