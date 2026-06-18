import type { UseQueryOptions } from '@tanstack/react-query';

import { getChainId } from '@wagmi/core';
import { type Config, useConfig } from 'wagmi';
import { useQuery } from 'wagmi/query';

import {
  readNijiTreasuryBalancesInUsd,
  type TreasuryBalancesInUsdData,
} from '../../actions/treasury/index.js';
import { nijiTreasuryAddress } from '../treasury.gen.js';

export type UseReadNijiTreasuryBalancesInUsdParameters<selectData = TreasuryBalancesInUsdData> = {
  blockNumber?: bigint;
  config?: Config;
  chainId?: keyof typeof nijiTreasuryAddress;
  query?: Partial<
    Omit<UseQueryOptions<TreasuryBalancesInUsdData, Error, selectData>, 'queryFn' | 'queryKey'>
  >;
};

export function useReadNijiTreasuryBalancesInUsd<selectData = TreasuryBalancesInUsdData>({
  blockNumber,
  config: configOverride,
  chainId: chainIdOverride,
  query = {},
}: UseReadNijiTreasuryBalancesInUsdParameters<selectData> = {}) {
  const config = useConfig();
  const chainId =
    chainIdOverride ?? (getChainId(configOverride ?? config) as keyof typeof nijiTreasuryAddress);

  return useQuery({
    queryKey: ['nijiTreasuryBalancesInUsd', chainId, blockNumber] as const,
    queryFn: () =>
      readNijiTreasuryBalancesInUsd(configOverride ?? config, { blockNumber, chainId }),
    enabled: !!chainId,
    ...query,
  });
}
