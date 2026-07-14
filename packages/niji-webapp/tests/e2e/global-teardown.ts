import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ANVIL_PORT = 8547;
const SPOT_RATE_PID_PATH = path.resolve(__dirname, '../../../../.context/dev/e2e-spot-rate.pid');

/**
 * Playwright globalTeardown (Issue #3069) —
 * global-setup で detach 起動した spot-rate independent server 子プロセス + anvil を kill する。
 *
 * spot-rate は `pnpm dev:spot-rate` (= `tsx watch src/spot-rate-server.ts`) の子プロセス、
 * detached: true で起動 → process group leader の pid に対し -pid で SIGTERM → 500ms 後 SIGKILL の
 * 2 段で kill する。 anvil は独立 process なので pkill で port 指定で kill。
 *
 * SKIP_GLOBAL_SETUP=1 のときは global-setup も skip されているので teardown も skip。
 */
export default async function globalTeardown() {
  if (process.env.SKIP_GLOBAL_SETUP === '1') {
    console.log('[e2e globalTeardown] SKIP_GLOBAL_SETUP=1 — skipping cleanup');
    return;
  }

  // 1) spot-rate process group を kill
  if (existsSync(SPOT_RATE_PID_PATH)) {
    try {
      const pid = Number.parseInt(readFileSync(SPOT_RATE_PID_PATH, 'utf-8').trim(), 10);
      if (Number.isFinite(pid) && pid > 0) {
        try {
          // detached: true で起動した process group を -pid 経由で kill
          process.kill(-pid, 'SIGTERM');
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            process.kill(-pid, 'SIGKILL');
          } catch {
            // 既に死んでいれば ESRCH で throw、 無視
          }
        } catch {
          // pid が group leader でなければ single process kill にフォールバック
          try {
            process.kill(pid, 'SIGTERM');
          } catch {}
        }
      }
      unlinkSync(SPOT_RATE_PID_PATH);
    } catch {
      // pid file 読み書き失敗は非致命的
    }
  }
  // pkill fallback (子プロセスが detach で切り離されているケースを保険で捕捉)
  spawnSync('pkill', ['-f', 'tsx watch src/spot-rate-server.ts']);
  spawnSync('pkill', ['-f', 'tsx src/spot-rate-server.ts']);

  // 2) anvil を kill (port 指定で pkill、 chain-past-auctions などの後続 dev session 邪魔しない)
  spawnSync('pkill', ['-f', `anvil --port ${ANVIL_PORT}`]);

  console.log('[e2e globalTeardown] spot-rate + anvil kill complete');
}
