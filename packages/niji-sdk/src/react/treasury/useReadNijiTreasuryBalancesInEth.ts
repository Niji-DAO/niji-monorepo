import type { UseQueryOptions } from '@tanstack/react-query';

import { getChainId } from '@wagmi/core';
import { type Config, useConfig } from 'wagmi';
import { useQuery } from 'wagmi/query';

import {
  readNijiTreasuryBalancesInEth,
  type TreasuryBalancesInEthData,
} from '../../actions/treasury/index.js';
import { nijiTreasuryAddress } from '../treasury.gen.js';

export type UseReadNijiTreasuryBalancesInEthParameters<selectData = TreasuryBalancesInEthData> = {
  blockNumber?: bigint;
  config?: Config;
  chainId?: keyof typeof nijiTreasuryAddress;
  query?: Partial<
    Omit<UseQueryOptions<TreasuryBalancesInEthData, Error, selectData>, 'queryFn' | 'queryKey'>
  >;
};

export function useReadNijiTreasuryBalancesInEth<selectData = TreasuryBalancesInEthData>({
  blockNumber,
  chainId: chainIdOverride,
  config: configOverride,
  query = {},
}: UseReadNijiTreasuryBalancesInEthParameters<selectData> = {}) {
  const config = useConfig();
  const chainId =
    chainIdOverride ?? (getChainId(configOverride ?? config) as keyof typeof nijiTreasuryAddress);

  return useQuery({
    queryKey: ['nijiTreasuryBalancesInEth', chainId, blockNumber] as const,
    queryFn: () =>
      readNijiTreasuryBalancesInEth(configOverride ?? config, { blockNumber, chainId }),
    enabled: !!chainId,
    ...query,
  });
}
