import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function rpcCall(method: string, params: unknown[] = []) {
  const res = await fetch('http://127.0.0.1:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  return res.json() as Promise<{ result?: unknown; error?: unknown }>;
}

async function waitForAnvil(maxMs = 10_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const r = await rpcCall('eth_blockNumber');
      if (r.result) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('anvil did not come up within 10s');
}

/**
 * Playwright globalSetup — anvil を kill して再起動 (= chain クリーン状態) +
 * deploy-niji-full を 1 回実行する。 spec 間で state を共有する設計のため、 全
 * test 直列実行 (workers: 1 + fullyParallel: false) の頭で 1 回だけ走る。
 */
export default async function globalSetup() {
  const start = Date.now();

  // 1) 既存 anvil を pkill (port 8545)
  spawnSync('pkill', ['-f', 'anvil --port 8545']);
  await sleep(500);

  // 2) anvil を起動
  const anvilProc = spawn('anvil', ['--port', '8545', '--chain-id', '31337', '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  anvilProc.unref();
  await waitForAnvil();

  // 3) deploy-niji-full
  const repoRoot = path.resolve(__dirname, '../../../..');
  const contractsDir = path.join(repoRoot, 'packages/niji-contracts');
  const result = spawnSync(
    'pnpm',
    ['exec', 'hardhat', 'deploy-niji-full', '--network', 'localhost'],
    {
      cwd: contractsDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  if (result.status !== 0) {
    console.error('[e2e globalSetup] deploy stdout (tail):\n', result.stdout?.slice(-2000));
    console.error('[e2e globalSetup] deploy stderr (tail):\n', result.stderr?.slice(-2000));
    throw new Error(`deploy-niji-full exited with status ${result.status}`);
  }

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`[e2e globalSetup] anvil restart + deploy-niji-full complete in ${elapsed}s`);
}
