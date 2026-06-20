import config from '@/config';
import { TypedDocumentString } from '@/subgraphs/graphql';

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  // subgraph endpoint が空 (local 31337 開発で subgraph 未起動の状態) のとき、
  // 元実装は fetch('') → 相対 URL 解釈で webapp 自身の `/` に POST して 404 を
  // 大量に出していた。 ここで早期 return して空相当を返す。
  if (!config.app.subgraphApiUri) {
    return undefined as unknown as TResult;
  }

  const response = await fetch(config.app.subgraphApiUri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return (await response.json()).data as TResult;
}
