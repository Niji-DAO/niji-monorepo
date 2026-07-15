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
  /** stale 判定までの時間 (ms)、 default 60_000 = 1 分。 caller が特定 query で短くしたい場合のみ override */
  staleTime?: number;
  /** unused query を GC する時間 (ms)、 default 300_000 = 5 分 */
  gcTime?: number;
}

export function useSubgraphQuery<TResult, TVariables>({
  document,
  variables,
  queryKey,
  enabled = true,
  refetchInterval,
  staleTime = 60_000,
  gcTime = 300_000,
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
    // TanStack Query default staleTime=0 で mount 毎に refetch 発火し「サイトが重い」 一因になる。
    // subgraph data は多くの case で分単位で stale してよい (auction / proposal 系は refetchInterval で
    // 明示 polling)、 default staleTime 60_000 + gcTime 300_000 で unused query の refetch 抑制 (Issue #3105)。
    staleTime,
    gcTime,
  });

  return {
    loading: result.isLoading,
    data: result.data,
    error: result.error || undefined,
    refetch: result.refetch,
  };
}
