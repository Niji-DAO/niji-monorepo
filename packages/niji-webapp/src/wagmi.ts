import { find, pipe } from 'remeda';
import { defineChain } from 'viem';
import { createConfig, createStorage, http, fallback, webSocket } from 'wagmi';
import { baseSepolia, hardhat as viemHardhat } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

import { CHAIN_ID, WALLET_CONNECT_V2_PROJECT_ID } from './config';
import { ANVIL_RPC_URL } from './constants/anvil';

// viem 標準 hardhat chain は rpcUrls.default.http = ['http://127.0.0.1:8545'] 固定だが、
// Niji webapp は anvil を 8547 で起動するため、 wagmi が hardhat chain を chain registry
// から resolve するときに 8545 を見て ECONNREFUSED を起こす。 chain registry 側の
// rpcUrls を ANVIL_RPC_URL に override した local 版 hardhat に差し替えて root cause 解消。
const hardhat = defineChain({
  ...viemHardhat,
  rpcUrls: {
    default: { http: [ANVIL_RPC_URL] },
  },
});

// Niji webapp は dev (anvil 31337) と prod (Base Sepolia 84532) の 2 chain のみを
// サポートする。 旧 Nouns 由来の mainnet / sepolia 設定は撤廃。
const SUPPORTED_CHAINS = [hardhat, baseSepolia] as const;

const activeChainId = Number(CHAIN_ID);

const activeChain =
  pipe(
    [...SUPPORTED_CHAINS],
    find(chain => chain.id === activeChainId),
  ) ?? hardhat;

const transports = {
  [hardhat.id]: http(import.meta.env.VITE_HARDHAT_JSONRPC ?? ANVIL_RPC_URL),
  [baseSepolia.id]: fallback([
    ...(import.meta.env.VITE_BASE_SEPOLIA_WSRPC !== undefined
      ? [webSocket(import.meta.env.VITE_BASE_SEPOLIA_WSRPC)]
      : []),
    ...(import.meta.env.VITE_BASE_SEPOLIA_JSONRPC !== undefined
      ? [http(import.meta.env.VITE_BASE_SEPOLIA_JSONRPC)]
      : [http('https://sepolia.base.org')]),
  ]),
};

// wagmi の localStorage に旧 chain (mainnet/sepolia) 接続 cache が残ると、
// autoReconnect でその cache を読みに行って isConnected=false + sepolia 表示
// 状態に永遠に陥る。 storage key を版指定して revoke することで旧 cache を捨てる。
const wagmiStorage =
  typeof window !== 'undefined'
    ? createStorage({
        storage: window.localStorage,
        key: 'niji-wagmi.v2',
      })
    : undefined;

export const config = createConfig({
  chains: SUPPORTED_CHAINS,
  transports,
  storage: wagmiStorage,
  multiInjectedProviderDiscovery: true,
  connectors: [
    // Coinbase Wallet connector は Analytics SDK が cca-lite.coinbase.com/metrics に
    // 常時 telemetry POST (BLOCKED_BY_CLIENT で ad blocker との衝突多発)、 かつ SDK bundle
    // が 100-200KB 追加される割に本 webapp の主 wallet ユースケースが MetaMask / WalletConnect
    // 経由で完結するため除去 (Issue #3101、 サイト重い audit の Phase A)。
    // 将来 Coinbase Wallet native 対応要件が出た場合は個別 Issue で再検討。
    injected(),
    walletConnect({
      projectId: WALLET_CONNECT_V2_PROJECT_ID,
      showQrModal: false,
    }),
  ],
});

export const defaultChain = activeChain;

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
