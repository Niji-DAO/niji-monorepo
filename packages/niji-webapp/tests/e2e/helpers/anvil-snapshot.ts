/**
 * e2e 高速化 = anvil snapshot/revert 経路 (Issue #3073、 決定 2026-07-14)
 *
 * global-setup で post-deploy 直後に取得した snapshot ID を
 * `.context/dev/e2e-anvil-snapshot.txt` に書き出し、 各 spec の beforeEach で
 * `resetAnvilToPostDeploy()` を呼んで post-deploy 状態に戻す。
 *
 * anvil の仕様上 evm_revert 実行で snapshot は消えるため、 revert 直後に再度
 * evm_snapshot を取り直し、 その ID を file に上書き保存する (次 test 用)。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ANVIL_RPC = 'http://127.0.0.1:8547';
const SNAPSHOT_PATH = path.resolve(__dirname, '../../../../../.context/dev/e2e-anvil-snapshot.txt');

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch(ANVIL_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  return (await res.json()) as { result?: unknown; error?: unknown };
}

/**
 * post-deploy snapshot に anvil state を revert し、 直後に新 snapshot を取り直して
 * ID を file に上書き保存する。 beforeEach から呼ばれる。
 *
 * snapshot file が無ければ「globalSetup を通っていない = SKIP 経路も未通過」 なので
 * 何もせず false を返す (呼び出し側で fresh deploy 経路にフォールバック)。
 */
export async function resetAnvilToPostDeploy(): Promise<boolean> {
  if (!existsSync(SNAPSHOT_PATH)) {
    return false;
  }
  const id = readFileSync(SNAPSHOT_PATH, 'utf-8').trim() as `0x${string}`;
  if (!id.startsWith('0x')) return false;

  const revertRes = await rpc('evm_revert', [id]);
  if (revertRes.result !== true) {
    // 既に消費済 snapshot の場合、 次 test 用の再取得だけ行う
    // (前 test の finally で新 snapshot 取得漏れ発生時の resilience)
    const newRes = await rpc('evm_snapshot');
    if (typeof newRes.result === 'string') {
      writeFileSync(SNAPSHOT_PATH, newRes.result);
      return true;
    }
    return false;
  }

  // revert 成功 → 次 test 用に新 snapshot 取得
  const newRes = await rpc('evm_snapshot');
  if (typeof newRes.result === 'string') {
    writeFileSync(SNAPSHOT_PATH, newRes.result);
    return true;
  }
  return false;
}
