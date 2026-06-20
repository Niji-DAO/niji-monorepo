import { baseSepolia, hardhat } from 'viem/chains';

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

const app: Record<SupportedChains, AppConfig> = {
  [hardhat.id]: {
    jsonRpcUri: import.meta.env.VITE_HARDHAT_JSONRPC ?? 'http://127.0.0.1:8547',
    wsRpcUri: 'ws://127.0.0.1:8547',
    // local 31337 は subgraph をローカル起動した時のみ参照。 未起動なら空でも UI は
    // chain 直叩きで動作する (PastAuctions が空配列で初期化されるだけ)。
    subgraphApiUri: import.meta.env.VITE_HARDHAT_SUBGRAPH ?? '',
    enableHistory: import.meta.env.VITE_ENABLE_HISTORY === 'true',
  },
  [baseSepolia.id]: {
    jsonRpcUri: import.meta.env.VITE_BASE_SEPOLIA_JSONRPC ?? 'https://sepolia.base.org',
    wsRpcUri: import.meta.env.VITE_BASE_SEPOLIA_WSRPC ?? '',
    subgraphApiUri: import.meta.env.VITE_BASE_SEPOLIA_SUBGRAPH ?? '',
    enableHistory: import.meta.env.VITE_ENABLE_HISTORY === 'true',
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
