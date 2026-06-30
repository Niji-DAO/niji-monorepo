import FetchAdapter from '@pollyjs/adapter-fetch';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';

// Register Polly adapters
Polly.register(FetchAdapter);
Polly.register(FSPersister);

function normalizeRpcUrl(url: string): string {
  return url
    .replace(process.env.MAINNET_RPC_URL ?? 'https://eth.merkle.io', 'https://mainnet.rpc.local')
    .replace(
      process.env.SEPOLIA_RPC_URL ?? 'https://sepolia.drpc.org',
      'https://sepolia.rpc.local',
    );
}

// JSON-RPC body から非決定的な `id` field を除外して match させる。
// viem の idCache は test process 内 module-level global で連続採番、
// record 時と replay 時で同じ順序を期待できない。
// method + params (block / contract address / call data) のみで match させる方針。
function normalizeRpcBody(body: string): string {
  if (!body) return body;
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      return JSON.stringify(
        parsed.map((entry: Record<string, unknown>) => {
          const { id: _omitId, ...rest } = entry;
          void _omitId;
          return rest;
        }),
      );
    }
    if (parsed && typeof parsed === 'object') {
      const { id: _omitId, ...rest } = parsed as Record<string, unknown>;
      void _omitId;
      return JSON.stringify(rest);
    }
    return body;
  } catch {
    return body;
  }
}

export function setupPolly(testName: string) {
  const polly = new Polly(testName, {
    adapters: ['fetch'],
    persister: 'fs',
    mode: 'replay',
    recordIfMissing: !process.env.CI,
    recordFailedRequests: false,
    logLevel: 'WARN',
    persisterOptions: {
      fs: {
        recordingsDir: './test/__recordings__',
      },
    },
    matchRequestsBy: {
      method: true,
      url: (url: string) => normalizeRpcUrl(url),
      headers: false,
      body: (body: string) => normalizeRpcBody(body),
      order: false,
    },
  });

  polly.server.any().on('beforePersist', (_req, recording) => {
    recording.request.url = normalizeRpcUrl(recording.request.url);
    console.log('Recording HTTP request:', recording.request.url);
  });

  return polly;
}
