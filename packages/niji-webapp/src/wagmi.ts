import { find, pipe } from 'remeda';
import { createConfig, http, fallback, webSocket } from 'wagmi';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

import { CHAIN_ID, WALLET_CONNECT_V2_PROJECT_ID } from './config';

const activeChainId = Number(CHAIN_ID);

const activeChain =
  pipe(
    [mainnet, sepolia, hardhat],
    find(chain => chain.id === activeChainId),
  ) ?? sepolia;

const transports = {
  [mainnet.id]: fallback([
    ...(import.meta.env.VITE_MAINNET_WSRPC !== undefined
      ? [webSocket(import.meta.env.VITE_MAINNET_WSRPC)]
      : []),
    ...(import.meta.env.VITE_MAINNET_JSONRPC !== undefined
      ? [http(import.meta.env.VITE_MAINNET_JSONRPC)]
      : []),
  ]),
  [sepolia.id]: fallback([
    ...(import.meta.env.VITE_SEPOLIA_WSRPC !== undefined
      ? [webSocket(import.meta.env.VITE_SEPOLIA_WSRPC)]
      : []),
    ...(import.meta.env.VITE_SEPOLIA_JSONRPC !== undefined
      ? [http(import.meta.env.VITE_SEPOLIA_JSONRPC)]
      : []),
  ]),
  [hardhat.id]: http(import.meta.env.VITE_HARDHAT_JSONRPC ?? 'http://127.0.0.1:8545'),
};

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  transports,
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
