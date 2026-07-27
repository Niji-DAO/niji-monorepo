/**
 * SKIP_GLOBAL_SETUP=1 経路で anvil 8547 に手動 deploy 済状態から Niji 0 (Nijider 枠) を settle して
 * Niji 1 (通常 auction) を開始する 1-shot seed script (Issue #3077 の logic を CLI 単独実行可能に切出)。
 *
 * 使い方 —
 * `tsx tests/e2e/helpers/seed-niji1.ts` を deploy 完了後 に 1 回だけ叩く。 その後 `SKIP_GLOBAL_SETUP=1`
 * で playwright test を実行すると global-setup 内 evm_snapshot が Niji 1 開始状態を保存し、
 * spec beforeEach の revert で fresh Niji 1 に戻る。
 *
 * global-setup 経由の spawnSync + hardhat deploy が deadlock する環境 (現象 = 4 分経過 CPU time 24s の
 * hang state、 maxBuffer 100MB 設定済でも再現) の切分け用。 root cause は spawnSync stdio pipe の
 * buffer 満杯 block と推定、 手動 deploy + SKIP + 本 seed の 3 段組で回避する。
 */
import { seedPastAuctions } from './chain.js';

async function main() {
  await seedPastAuctions(1);
  console.log('Niji 0 settled → Niji 1 (standard auction) started');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
