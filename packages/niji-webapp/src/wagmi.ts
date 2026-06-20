import { find, pipe } from 'remeda';
import { createConfig, createStorage, http, fallback, webSocket } from 'wagmi';
import { baseSepolia, hardhat } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

import { CHAIN_ID, WALLET_CONNECT_V2_PROJECT_ID } from './config';
import { ANVIL_RPC_URL } from './constants/anvil';

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
    injected(),
    walletConnect({
      projectId: WALLET_CONNECT_V2_PROJECT_ID,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: 'Niji.WTF',
      appLogoUrl: 'https://nijis.wtf/static/media/logo.cdea1650.svg',
    }),
  ],
});

export const defaultChain = activeChain;

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
