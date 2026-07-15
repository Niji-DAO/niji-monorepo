/**
 * GMO mock server の Ponder dev server 統合 (Phase 1 MVP)
 *
 * 起動経路 —
 * (1) `pnpm dev` (= `ponder dev`) 起動時に本 file を import
 * (2) env `USE_GMO_MOCK=true` の場合のみ `gmoMockServer.listen()` を呼ぶ
 * (3) mock server が閉じる責務は Ponder dev server の shutdown hook に委ねる (`onExit`)
 *
 * 呼出方法 —
 *   import { startGmoMockIfEnabled } from './mocks/index.ts';
 *   await startGmoMockIfEnabled();
 *
 * Issue 3 以降 (GMO integration endpoint 実装) で Ponder api entrypoint から呼出す。
 * Phase 1 base infra の本 Issue 段階では export のみで actual 起動は Issue 3 で配線する。
 */

import { fincodeMockServer } from './fincode-server.js';
import { gmoMockServer } from './gmo-server.js';

/**
 * USE_GMO_MOCK=true 時のみ mock server を起動する
 * `truthy` 判定 = `'true'` / `'1'` / `'yes'` (大文字小文字問わず)、 それ以外は起動しない
 */
export const isGmoMockEnabled = (): boolean => {
  const value = (process.env['USE_GMO_MOCK'] ?? 'false').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * USE_FINCODE_MOCK=true 時のみ fincode mock server を起動する
 * Phase 2 backend 統合、 Issue #3115。
 */
export const isFincodeMockEnabled = (): boolean => {
  const value = (process.env['USE_FINCODE_MOCK'] ?? 'false').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * mock server の conditional 起動
 * 既に listen 済でも二重 listen で例外にならないよう msw が内部で ignore する
 * (msw v2.x setupServer.listen は idempotent、 v2.14 で確認済)
 */
export const startGmoMockIfEnabled = (): void => {
  if (!isGmoMockEnabled()) {
    return;
  }
  gmoMockServer.listen({ onUnhandledRequest: 'warn' });
};

/**
 * fincode mock server の conditional 起動 (GMO と並列、 Phase 2 統合中は両方同時起動可)
 */
export const startFincodeMockIfEnabled = (): void => {
  if (!isFincodeMockEnabled()) {
    return;
  }
  fincodeMockServer.listen({ onUnhandledRequest: 'warn' });
};

/**
 * mock server の停止 (Ponder dev server の shutdown hook / test tearDown で使用)
 */
export const stopGmoMock = (): void => {
  gmoMockServer.close();
};

export const stopFincodeMock = (): void => {
  fincodeMockServer.close();
};
