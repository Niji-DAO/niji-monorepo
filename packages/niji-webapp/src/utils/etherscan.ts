import { ETHERSCAN_API_KEY } from '@/config';
import { defaultChain } from '@/wagmi';

const FALLBACK_EXPLORER_URL = 'https://etherscan.io';

const getExplorerUrl = (): string =>
  defaultChain.blockExplorers?.default.url ?? FALLBACK_EXPLORER_URL;

export const buildEtherscanTxLink = (txHash: string): string => {
  const path = `/tx/${txHash}`;

  return new URL(path, getExplorerUrl()).toString();
};

export const buildEtherscanAddressLink = (address: string): string => {
  const path = `/address/${address}`;

  return new URL(path, getExplorerUrl()).toString();
};

export const buildEtherscanTokenLink = (tokenContractAddress: string, tokenId: number): string => {
  const path = `/token/${tokenContractAddress}?a=${tokenId}`;

  return new URL(path, getExplorerUrl()).toString();
};

export const buildEtherscanHoldingsLink = (address: string): string => {
  const path = `/tokenholdings?a=${address}`;

  return new URL(path, getExplorerUrl()).toString();
};

export const buildEtherscanApiQuery = (
  address: string,
  module = 'contract',
  action = 'getsourcecode',
): string => {
  const params = new URLSearchParams({
    chainid: String(defaultChain.id),
    module,
    action,
    address,
    apikey: ETHERSCAN_API_KEY,
  });
  return `https://api.etherscan.io/v2/api?${params.toString()}`;
};
