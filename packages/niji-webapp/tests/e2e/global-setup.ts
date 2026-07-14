import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ANVIL_PORT = 8547;
const ANVIL_RPC = `http://127.0.0.1:${ANVIL_PORT}`;
const SPOT_RATE_PORT = 42070;
const SPOT_RATE_LOG_PATH = path.resolve(__dirname, '../../../../.context/dev/e2e-spot-rate.log');
const SPOT_RATE_PID_PATH = path.resolve(__dirname, '../../../../.context/dev/e2e-spot-rate.pid');
const ANVIL_SNAPSHOT_PATH = path.resolve(
  __dirname,
  '../../../../.context/dev/e2e-anvil-snapshot.txt',
);

async function rpcCall(method: string, params: unknown[] = []) {
  const res = await fetch(ANVIL_RPC, {
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
 * spot-rate endpoint (port 42070) の ready wait。
 * dev 環境の USE_SPOT_RATE_MOCK=true では GMO API 通信ゼロで即応答するため
 * 数百 ms で 200 応答が返る想定、 30 秒を上限に retry。
 */
async function waitForSpotRateReady(maxMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${SPOT_RATE_PORT}/api/v1/spot-rate/eth-jpy`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 200) return;
    } catch {}
    await sleep(500);
  }
  throw new Error(`spot-rate server did not respond on :${SPOT_RATE_PORT} within ${maxMs / 1000}s`);
}

/**
 * spot-rate independent server (Issue #3065、 port 42070) を子プロセス起動 (Issue #3069)。
 *
 * niji-api の Ponder (port 42069) は現状 e2e に組込むと ponder.config.ts + `.test.ts` 混在の
 * build error でどの endpoint も応答しなくなる (別 Issue で追跡)。 fiat-bid endpoint (authorize
 * / 3ds-callback / place-bid) は Playwright page.route() で e2e 内 mock する経路にして
 * Ponder 側は起動対象から外す。 spot-rate は Ponder 非依存の独立 hono server で expose 済のため、
 * 本 process のみを起動することで e2e が実 spot-rate 経路で integration test 可能。
 *
 * env 注入 —
 *  USE_GMO_MOCK=true          → GMO mock server 経路 (spot-rate 側では実質不要、 一貫性のため設定)
 *  USE_SPOT_RATE_MOCK=true    → 固定 rate 500000 JPY/ETH で spot-rate を即応答 (offline dev)
 *  NIJI_SPOT_RATE_API_PORT    → 42070 に明示 pin
 */
function spawnSpotRateServer(): ChildProcess {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const apiDir = path.join(repoRoot, 'packages/niji-api');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    USE_GMO_MOCK: 'true',
    USE_SPOT_RATE_MOCK: 'true',
    MOCK_SPOT_RATE_JPY_PER_ETH: '500000',
    NIJI_SPOT_RATE_API_PORT: String(SPOT_RATE_PORT),
  };

  // .context/dev/ を先に確保 (make dev 経由でも作られるが、 e2e 単独起動時に無いケースを許容)
  const logDir = path.dirname(SPOT_RATE_LOG_PATH);
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  writeFileSync(SPOT_RATE_LOG_PATH, `[e2e globalSetup] spawn at ${new Date().toISOString()}\n`);

  const logFd = openSync(SPOT_RATE_LOG_PATH, 'a');
  const proc = spawn('pnpm', ['dev:spot-rate'], {
    cwd: apiDir,
    env,
    stdio: ['ignore', logFd, logFd],
    detached: true,
  });
  writeFileSync(SPOT_RATE_PID_PATH, String(proc.pid));
  proc.unref();
  return proc;
}

/**
 * Playwright globalSetup — Niji 固有の deploy が hardhat task (`hardhat
 * deploy-niji-full --network localhost`) なので、 kiwa の runE2EPrepareEnv ではなく
 * 自前で anvil 8547 を立てて hardhat task を spawn する。 spec 間で state を共有する
 * 設計のため、 全 test 直列実行 (workers: 1 + fullyParallel: false) の頭で 1 回だけ走る。
 *
 * spot-rate independent server (port 42070) を子プロセス起動 (Issue #3069) —
 * fiat bid e2e (TC-FB10) が spot-rate endpoint を実 integration で叩く。
 * USE_SPOT_RATE_MOCK=true で GMO API 通信ゼロ、 数百 ms で 200 応答が返る。
 *
 * fiat-bid endpoint (authorize / 3ds-callback / place-bid) は Ponder 側 (broken 状態) に
 * 依存する経路なので、 e2e では Playwright page.route() で mock する経路を fiat-bid.spec.ts で提供する。
 *
 * SKIP_GLOBAL_SETUP=1 のときは「既に anvil + webapp + deploy + spot-rate 済」 を前提に skip。
 */
export default async function globalSetup() {
  if (process.env.SKIP_GLOBAL_SETUP === '1') {
    console.log(
      '[e2e globalSetup] SKIP_GLOBAL_SETUP=1 — skipping anvil restart + deploy + spot-rate',
    );
    // SKIP 経路でも spec の beforeEach が snapshot revert する前提のため、
    // 「anvil は起動済 + snapshot file が無い」 状態なら現状 chain state を snapshot 化する。
    if (!existsSync(ANVIL_SNAPSHOT_PATH)) {
      const snapshotRes = await rpcCall('evm_snapshot');
      const snapshotId = snapshotRes.result as `0x${string}` | undefined;
      if (typeof snapshotId === 'string' && snapshotId.startsWith('0x')) {
        const dir = path.dirname(ANVIL_SNAPSHOT_PATH);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(ANVIL_SNAPSHOT_PATH, snapshotId);
        console.log(
          `[e2e globalSetup] SKIP mode: current chain state snapshot saved: ${snapshotId}`,
        );
      } else {
        console.warn(
          `[e2e globalSetup] SKIP mode: evm_snapshot failed, spec beforeEach revert skipped`,
        );
      }
    }
    return;
  }
  const start = Date.now();

  // 1) 既存 anvil / spot-rate を pkill、 前 run の残存 process が bind 続けている場合の cleanup
  spawnSync('pkill', ['-f', `anvil --port ${ANVIL_PORT}`]);
  spawnSync('pkill', ['-f', 'tsx watch src/spot-rate-server.ts']);
  spawnSync('pkill', ['-f', 'tsx src/spot-rate-server.ts']);
  // 前 run の pid file 残存も delete
  if (existsSync(SPOT_RATE_PID_PATH)) {
    try {
      const oldPid = Number.parseInt(readFileSync(SPOT_RATE_PID_PATH, 'utf-8').trim(), 10);
      if (Number.isFinite(oldPid) && oldPid > 0) {
        try {
          process.kill(-oldPid, 'SIGTERM');
        } catch {}
      }
    } catch {}
  }
  await sleep(500);

  // 2) anvil を起動
  const anvilProc = spawn(
    'anvil',
    ['--port', String(ANVIL_PORT), '--chain-id', '31337', '--host', '127.0.0.1'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    },
  );
  anvilProc.unref();
  await waitForAnvil();

  // 3) deploy-niji-full (hardhat task)
  //
  // maxBuffer 100MB を明示 (Issue #3078)。 Node.js の spawnSync は default maxBuffer 1MB のため、
  // deploy output が数 MB (12 trait × 数十 image のログ) 超過で子プロセスの write が block、
  // 結果として e2e 全体が 23 分 hang する deadlock が発生した (実測)。 deploy 単体は 21 秒で完走する。
  const repoRoot = path.resolve(__dirname, '../../../..');
  const contractsDir = path.join(repoRoot, 'packages/niji-contracts');
  // NIJI_AUCTION_DURATION=86400 (24h) を deploy に渡す (Issue #3077)。
  // webapp の auctionEnded 判定は JS Date.now() vs auction.endTime で行われるため、
  // default 60 秒 duration では deploy 完了後 1 分で全 e2e test が auctionEnded=true state に入り
  // Bid form が render されなくなる。 24h に拡張することで e2e 実行時間 (数分) 中は active 維持。
  const deployEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NIJI_AUCTION_DURATION: '86400',
  };
  const result = spawnSync(
    'pnpm',
    ['exec', 'hardhat', 'deploy-niji-full', '--network', 'localhost'],
    {
      cwd: contractsDir,
      env: deployEnv,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 100 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    console.error('[e2e globalSetup] deploy stdout (tail):\n', result.stdout?.slice(-2000));
    console.error('[e2e globalSetup] deploy stderr (tail):\n', result.stderr?.slice(-2000));
    throw new Error(`deploy-niji-full exited with status ${result.status}`);
  }

  // 4) spot-rate independent server を起動 (port 42070)
  console.log(`[e2e globalSetup] spawning spot-rate server on :${SPOT_RATE_PORT}...`);
  spawnSpotRateServer();

  // 5) spot-rate ready wait (mock 経路で即応答、 数百 ms 程度)
  await waitForSpotRateReady();
  console.log(`[e2e globalSetup] spot-rate ready on :${SPOT_RATE_PORT}`);

  // 6) post-deploy state を evm_snapshot で保存 (Issue #3073、 高速化 A 案)
  //
  // 各 spec の beforeEach で `revertChain(snapshotId)` を呼んで post-deploy 状態に戻すことで、
  // fresh deploy 3-5 分 × N test の cumulative コストを回避する。
  // revert 実行後 anvil 側で snapshot は消える仕様なので、 revert helper 側で再 snapshot 取得も担う。
  const snapshotRes = await rpcCall('evm_snapshot');
  const snapshotId = snapshotRes.result as `0x${string}` | undefined;
  if (typeof snapshotId !== 'string' || !snapshotId.startsWith('0x')) {
    throw new Error(
      `[e2e globalSetup] evm_snapshot did not return a hex id (got ${JSON.stringify(snapshotRes)})`,
    );
  }
  writeFileSync(ANVIL_SNAPSHOT_PATH, snapshotId);
  console.log(`[e2e globalSetup] post-deploy anvil snapshot saved: ${snapshotId}`);

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(
    `[e2e globalSetup] anvil + deploy-niji-full + spot-rate + snapshot 起動 complete in ${elapsed}s`,
  );
}
