/**
 * AuthCleanupQueue behavior test (Issue #3022 Phase 2 base infra)
 *
 * 検証対象 —
 * (1) enqueue → 5 秒 delay 経過後に GMO alterTran(JobCd=VOID) 実行
 * (2) rate limit 1 req/sec = 2 auth 連続 enqueue で 2 件目の実行が 1 秒後にずれる
 * (3) fail 時 3 回まで retry (exponential backoff 1s / 2s / 4s、 合計 4 回試行)
 * (4) 3 回全 fail で運営 alert log 発火 + queue から drain
 *
 * fake timers (vi.useFakeTimers) で時間経過を simulate、
 * cancelAuthorization spy で GMO 呼出回数と authId を verify する。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § P2, AC 4、
 *        Phase2-02-issue-breakdown.md § Issue P2-1、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthCleanupQueue, type AuthCleanupExecutor } from './index.js';

/**
 * cancelAuthorization spy を behavior で振る舞い分岐する factory
 * `behavior` は authId ごとに resolve / reject を返す (sequence controlled)
 */
const makeExecutor = (
  behavior: (authId: string, attempt: number) => Promise<void>,
): { executor: AuthCleanupExecutor; spy: ReturnType<typeof vi.fn> } => {
  const attempts = new Map<string, number>();
  const spy = vi.fn(async (authId: string) => {
    const next = (attempts.get(authId) ?? 0) + 1;
    attempts.set(authId, next);
    return behavior(authId, next);
  });
  const executor: AuthCleanupExecutor = {
    cancelAuthorization: async (authId: string) => spy(authId),
  };
  return { executor, spy };
};

describe('AuthCleanupQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('enqueue → 5 秒 delay 経過後に cancelAuthorization が呼ばれる', async () => {
    const { executor, spy } = makeExecutor(async () => undefined);
    const queue = new AuthCleanupQueue({ executor });

    queue.enqueue('auth-1');

    // 5 秒経過前は呼ばれない
    await vi.advanceTimersByTimeAsync(4999);
    expect(spy).not.toHaveBeenCalled();

    // 5 秒経過で 1 回目 tick、 executor が呼ばれる
    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('auth-1');
  });

  it('rate limit 1 req/sec = 2 auth 連続 enqueue で 2 件目の実行が 1 秒後にずれる', async () => {
    const { executor, spy } = makeExecutor(async () => undefined);
    const queue = new AuthCleanupQueue({ executor });

    queue.enqueue('auth-1');
    queue.enqueue('auth-2');

    // delay 5 秒経過で 1 件目のみ実行 (rate limit 未経過)
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenNthCalledWith(1, 'auth-1');

    // 1 秒後に 2 件目実行 (rate limit 1 req/sec)
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(2, 'auth-2');
  });

  it('fail 時 3 回 retry (exponential backoff 1s / 2s / 4s) で成功時は alert 出さず', async () => {
    // 1-3 回目 fail、 4 回目 (= retry 3 回目) 成功
    const { executor, spy } = makeExecutor(async (_authId, attempt) => {
      if (attempt < 4) throw new Error(`attempt ${attempt} failed`);
      return undefined;
    });
    const alertSpy = vi.fn();
    const queue = new AuthCleanupQueue({ executor, onAlert: alertSpy });

    queue.enqueue('auth-1');

    // 5 秒 delay で 1 回目実行 (fail)
    await vi.advanceTimersByTimeAsync(5000);
    expect(spy).toHaveBeenCalledTimes(1);

    // exponential backoff 1s で 2 回目実行 (fail)
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenCalledTimes(2);

    // exponential backoff 2s で 3 回目実行 (fail)
    await vi.advanceTimersByTimeAsync(2000);
    expect(spy).toHaveBeenCalledTimes(3);

    // exponential backoff 4s で 4 回目実行 (成功)
    await vi.advanceTimersByTimeAsync(4000);
    expect(spy).toHaveBeenCalledTimes(4);

    // 成功したので alert 呼ばれない
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('3 回全 retry fail で運営 alert log 発火 + queue から drain', async () => {
    // 常に fail
    const { executor, spy } = makeExecutor(async () => {
      throw new Error('permanent failure');
    });
    const alertSpy = vi.fn();
    const queue = new AuthCleanupQueue({ executor, onAlert: alertSpy });

    queue.enqueue('auth-1');

    // 5s delay → 1 回目 fail
    await vi.advanceTimersByTimeAsync(5000);
    // 1s backoff → 2 回目 fail
    await vi.advanceTimersByTimeAsync(1000);
    // 2s backoff → 3 回目 fail
    await vi.advanceTimersByTimeAsync(2000);
    // 4s backoff → 4 回目 fail (最終 retry)
    await vi.advanceTimersByTimeAsync(4000);

    expect(spy).toHaveBeenCalledTimes(4);
    // 4 回 fail 後 alert 発火
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        authId: 'auth-1',
        attempts: 4,
      }),
    );

    // queue が drain したので、 次の 1 秒経過でも新規呼出なし
    await vi.advanceTimersByTimeAsync(10000);
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
