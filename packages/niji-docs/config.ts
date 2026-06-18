import { createConfig, fallback, http } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';

export default {
  baseUri: process.env.NEXT_PUBLIC_BASE_URI,
  mainnetBlockDurationSeconds: 12,
} as const;

const mainnetRpcUrls = [
  process.env.JSON_RPC,
  'https://ethereum-rpc.publicnode.com',
  'https://rpc.flashbots.net',
  'https://eth.llamarpc.com',
].filter((url): url is string => Boolean(url));

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: fallback(
      mainnetRpcUrls.map(url =>
        http(url, {
          retryCount: 2,
          timeout: 20_000,
        }),
      ),
      {
        retryCount: 1,
      },
    ),
  },
});
