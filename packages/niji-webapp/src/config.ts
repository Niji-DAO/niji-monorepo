import { baseSepolia, hardhat } from 'viem/chains';

import { ANVIL_PORT, ANVIL_RPC_URL } from './constants/anvil';

interface ContractParameters {
  executor: {
    GRACE_PERIOD_SECONDS: number;
  };
}
interface AppConfig {
  jsonRpcUri: string;
  wsRpcUri: string;
  subgraphApiUri: string;
  enableHistory: boolean;
  // chain log paginate の起点。 prod (Base Sepolia / mainnet) は数十万 block の
  // 全 scan を防ぐため必須、 dev (anvil) は未設定で 0 から scan する。
  deployBlock: bigint | undefined;
}

type SupportedChains = typeof hardhat.id | typeof baseSepolia.id;

interface CacheBucket {
  name: string;
  version: string;
}

export const cache: Record<string, CacheBucket> = {
  seed: {
    name: 'seed',
    version: 'v2',
  },
  ens: {
    name: 'ens',
    version: 'v1',
  },
};

export const cacheKey = (bucket: CacheBucket, ...parts: (string | number)[]) => {
  return [bucket.name, bucket.version, ...parts].join('-').toLowerCase();
};

// dev は anvil (chain 31337) を default、 prod は Base Sepolia (84532) を env で指定。
export const CHAIN_ID: SupportedChains =
  (Number(import.meta.env.VITE_CHAIN_ID) as SupportedChains) || hardhat.id;

export const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY ?? '';

export const WALLET_CONNECT_V2_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_V2_PROJECT_ID ?? '';

function parseDeployBlock(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

const app: Record<SupportedChains, AppConfig> = {
  [hardhat.id]: {
    jsonRpcUri: import.meta.env.VITE_HARDHAT_JSONRPC ?? ANVIL_RPC_URL,
    wsRpcUri: `ws://127.0.0.1:${ANVIL_PORT}`,
    // local 31337 は subgraph をローカル起動した時のみ参照。 未起動なら空でも UI は
    // chain 直叩きで動作する (PastAuctions が空配列で初期化されるだけ)。
    subgraphApiUri: import.meta.env.VITE_HARDHAT_SUBGRAPH ?? '',
    enableHistory: import.meta.env.VITE_ENABLE_HISTORY === 'true',
    // anvil は block 数が少ないので env 未設定で 0 から scan、 dev 体験を優先。
    deployBlock: parseDeployBlock(import.meta.env.VITE_HARDHAT_DEPLOY_BLOCK),
  },
  [baseSepolia.id]: {
    // env 名は VITE_BASE_SEPOLIA_* が正、 旧 example の VITE_RPC_URL / VITE_SUBGRAPH_URL も
    // fallback で受ける (2026-07-21 env 名 drift の後方互換、 どちらの .env.dev でも動く)。
    jsonRpcUri:
      import.meta.env.VITE_BASE_SEPOLIA_JSONRPC ??
      import.meta.env.VITE_RPC_URL ??
      'https://sepolia.base.org',
    wsRpcUri: import.meta.env.VITE_BASE_SEPOLIA_WSRPC ?? '',
    subgraphApiUri:
      import.meta.env.VITE_BASE_SEPOLIA_SUBGRAPH ?? import.meta.env.VITE_SUBGRAPH_URL ?? '',
    enableHistory: import.meta.env.VITE_ENABLE_HISTORY === 'true',
    // prod は subgraph 障害時のみ chain fallback。 deploy block 未設定だと全 chain scan
    // で RPC が即枯渇するため、 fallback 起動時に WARN を出して 0 から scan する。
    deployBlock: parseDeployBlock(
      import.meta.env.VITE_BASE_SEPOLIA_DEPLOY_BLOCK ?? import.meta.env.VITE_NIJI_DEPLOY_BLOCK,
    ),
  },
};

const contractParameters: Record<SupportedChains, ContractParameters> = {
  [hardhat.id]: {
    executor: {
      GRACE_PERIOD_SECONDS: 1814400,
    },
  },
  [baseSepolia.id]: {
    executor: {
      GRACE_PERIOD_SECONDS: 1814400,
    },
  },
};

const config = {
  app: app[CHAIN_ID],
  contractParameters: contractParameters[CHAIN_ID],
  featureToggles: {
    daoGteV3: false,
    proposeOnV1: true,
    candidates: true,
    fork: true,
  },
};

export default config;
