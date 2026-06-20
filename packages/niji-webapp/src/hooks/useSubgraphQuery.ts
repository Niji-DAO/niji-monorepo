import type { TypedDocumentString } from '@/subgraphs/graphql';

import { useQuery } from '@tanstack/react-query';

import config from '@/config';
import { execute } from '@/subgraphs/execute';

interface UseSubgraphQueryOptions<TResult, TVariables> {
  document: TypedDocumentString<TResult, TVariables>;
  variables?: TVariables;
  queryKey: unknown[];
  enabled?: boolean;
  refetchInterval?: number;
}

export function useSubgraphQuery<TResult, TVariables>({
  document,
  variables,
  queryKey,
  enabled = true,
  refetchInterval,
}: UseSubgraphQueryOptions<TResult, TVariables>) {
  // subgraph endpoint が空なら query を発火させない (local 31337 で subgraph 未起動時)
  const subgraphEnabled = !!config.app.subgraphApiUri;

  const result = useQuery({
    queryKey,
    queryFn: () => {
      const exec = execute as (
        query: TypedDocumentString<TResult, TVariables>,
        variables?: TVariables,
      ) => Promise<TResult>;
      return exec(document, variables);
    },
    enabled: enabled && subgraphEnabled,
    refetchInterval: refetchInterval ?? false,
  });

  return {
    loading: result.isLoading,
    data: result.data,
    error: result.error || undefined,
    refetch: result.refetch,
  };
}
