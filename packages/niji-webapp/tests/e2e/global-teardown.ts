import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ANVIL_PORT = 8547;
const SPOT_RATE_PID_PATH = path.resolve(__dirname, '../../../../.context/dev/e2e-spot-rate.pid');
// F-03 review 対応 (2026-07-27) = spawn ownership marker。 global-setup が本 marker を write する
// = 「本 run で spot-rate を e2e 側が spawn した」 の明示 signal。 stale pid file (前 run の残存) と
// 別軸で判定することで、 pid 再利用時に user 側 process を巻き添え kill する事故を防ぐ。
const SPOT_RATE_SPAWN_MARKER = path.resolve(
  __dirname,
  '../../../../.context/dev/e2e-spot-rate-spawned',
);

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

  // 1) spot-rate process group を kill。 SPAWN_MARKER が「本 run で e2e 側が spawn した」 の
  // 明示 signal、 marker なし = user 側 dev:spot-rate 併存 or 前 run の stale pid file なので
  // 一切 kill しない (user 側 process を巻き添えにする pid 再利用事故を防ぐ)。
  // pkill fallback も marker 存在時のみ発火。
  if (existsSync(SPOT_RATE_SPAWN_MARKER)) {
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
      // pkill fallback (子プロセスが detach で切り離されているケースを保険で捕捉)、
      // SPAWN_MARKER 存在ケース = e2e 側 spawn した場合のみ発火
      spawnSync('pkill', ['-f', 'tsx watch src/spot-rate-server.ts']);
      spawnSync('pkill', ['-f', 'tsx src/spot-rate-server.ts']);
    }
    try {
      unlinkSync(SPOT_RATE_SPAWN_MARKER);
    } catch {
      // marker 削除失敗は非致命的
    }
  } else {
    console.log(
      '[e2e globalTeardown] SPOT_RATE_SPAWN_MARKER 不在 = e2e が spawn していない (併存 or stale pid file)、 kill skip',
    );
  }

  // 2) anvil を kill (port 指定で pkill、 chain-past-auctions などの後続 dev session 邪魔しない)
  spawnSync('pkill', ['-f', `anvil --port ${ANVIL_PORT}`]);

  console.log('[e2e globalTeardown] spot-rate + anvil kill complete');
}
