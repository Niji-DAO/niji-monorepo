/**
 * ReauthorizationWorker behavior test (Issue #3024 Phase 2 = 45 日超 fallback cron worker)
 *
 * 検証対象 (grilling P3-a A 案 SSOT) —
 * (1) 45 日超 record を scan で検出 → GmoClient.reauthorize 呼出 → 成功時 reauthorizationCount++ + lastReauthorizedAt UPDATE
 * (2) 45 日超 record 検出 + reauthorize 失敗 (1 回で確定) → fiat_bid.status = cancelled UPDATE + 運営 alert log + user 通知 email 発火
 * (3) 45 日以内 record は対象外 (scan で filter される)
 *
 * fake timers (vi.useFakeTimers) で 45 日経過 + 1h 周期起動を simulate、
 * store spy で UPDATE 呼出回数 / 引数を verify する。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § 45 日超 fallback (AC 5, 6)、
 *        Phase2-02-issue-breakdown.md § Issue P2-3、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ReauthorizationWorker,
  type ReauthorizationExecutor,
  type ReauthorizationStore,
  type ReauthorizationAlertPayload,
  type ReauthorizationEmailPayload,
  type FiatBidRecordForReauth,
} from './index.js';

/**
 * store spy を生成、 findEligibleRecords が返す record 配列を差替可能にする
 */
const makeStore = (
  records: FiatBidRecordForReauth[] = [],
): {
  store: ReauthorizationStore;
  findSpy: ReturnType<typeof vi.fn>;
  successSpy: ReturnType<typeof vi.fn>;
  cancelSpy: ReturnType<typeof vi.fn>;
} => {
  const findSpy = vi.fn(async () => records);
  const successSpy = vi.fn(async () => undefined);
  const cancelSpy = vi.fn(async () => undefined);
  const store: ReauthorizationStore = {
    findEligibleRecords: findSpy,
    updateAfterReauthSuccess: successSpy,
    updateStatusCancelled: cancelSpy,
  };
  return { store, findSpy, successSpy, cancelSpy };
};

/**
 * executor spy を生成、 reauthorize の resolve / reject を制御
 */
const makeExecutor = (
  behavior: (authId: string) => Promise<{ authId: string; accessPass: string }>,
): { executor: ReauthorizationExecutor; spy: ReturnType<typeof vi.fn> } => {
  const spy = vi.fn(async (authId: string) => behavior(authId));
  const executor: ReauthorizationExecutor = {
    reauthorize: async input => spy(input.oldAuthId),
  };
  return { executor, spy };
};

/** 現在時刻 t0 (2026-07-02T00:00:00Z 相当の fixed 値、 test 内で相対計算する) */
const T0 = new Date('2026-07-02T00:00:00.000Z');
/** 45 日前 = 2026-05-18 相当、 threshold 直後 */
const CREATED_AT_46_DAYS_AGO = new Date(T0.getTime() - 46 * 24 * 60 * 60 * 1000);
/** 44 日前 = threshold 未到達 */
const CREATED_AT_44_DAYS_AGO = new Date(T0.getTime() - 44 * 24 * 60 * 60 * 1000);

const baseRecord: Omit<FiatBidRecordForReauth, 'authId' | 'createdAt' | 'status'> = {
  bidderEmail: 'bidder@example.com',
  bidderWallet: '0x1111111111111111111111111111111111111111' as `0x${string}`,
  auctionId: 42n,
  jpyAmount: 100000,
  ethAmount: 500000000000000n,
  accessPass: 'mock-pass-00000002',
  reauthorizationCount: 0,
};

describe('ReauthorizationWorker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('45 日超 record を検出 → reauthorize 成功時 reauthorizationCount++ + lastReauthorizedAt UPDATE', async () => {
    const eligible: FiatBidRecordForReauth = {
      ...baseRecord,
      authId: 'mock-access-00000001',
      status: 'bid-placed',
      createdAt: CREATED_AT_46_DAYS_AGO,
    };
    const { store, findSpy, successSpy, cancelSpy } = makeStore([eligible]);
    const { executor, spy: reauthSpy } = makeExecutor(async () => ({
      authId: 'mock-access-00000099',
      accessPass: 'mock-pass-00000100',
    }));
    const alertSpy = vi.fn();
    const emailSpy = vi.fn();

    const worker = new ReauthorizationWorker({
      store,
      executor,
      onAlert: alertSpy,
      onNotifyUser: emailSpy,
      intervalMs: 60 * 60 * 1000,
    });

    await worker.runOnce();

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(reauthSpy).toHaveBeenCalledTimes(1);
    expect(reauthSpy).toHaveBeenCalledWith('mock-access-00000001');

    // reauthorize 成功 → updateAfterReauthSuccess で新 authId + reauthorizationCount++ + lastReauthorizedAt=now
    expect(successSpy).toHaveBeenCalledTimes(1);
    expect(successSpy).toHaveBeenCalledWith({
      oldAuthId: 'mock-access-00000001',
      newAuthId: 'mock-access-00000099',
      newReauthorizationCount: 1,
      lastReauthorizedAt: T0,
    });

    // cancel / alert / email は発火しない
    expect(cancelSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(emailSpy).not.toHaveBeenCalled();
  });

  it('45 日超 record + reauthorize 失敗 (1 回で確定) → status=cancelled + alert log + user 通知 email', async () => {
    const eligible: FiatBidRecordForReauth = {
      ...baseRecord,
      authId: 'mock-access-00000001',
      status: 'bid-placed',
      createdAt: CREATED_AT_46_DAYS_AGO,
    };
    const { store, findSpy, successSpy, cancelSpy } = makeStore([eligible]);
    const failError = new Error('GMO reauthorize failed (E01)');
    const { executor, spy: reauthSpy } = makeExecutor(async () => {
      throw failError;
    });
    const alertSpy = vi.fn();
    const emailSpy = vi.fn();

    const worker = new ReauthorizationWorker({
      store,
      executor,
      onAlert: alertSpy,
      onNotifyUser: emailSpy,
      intervalMs: 60 * 60 * 1000,
    });

    await worker.runOnce();

    expect(findSpy).toHaveBeenCalledTimes(1);
    // 1 回で確定 (AuthCleanupQueue の 3 回 retry と別経路)
    expect(reauthSpy).toHaveBeenCalledTimes(1);

    // 成功経路の update は呼ばれない
    expect(successSpy).not.toHaveBeenCalled();

    // cancel + alert + email
    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledWith({ authId: 'mock-access-00000001' });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const alertArg = alertSpy.mock.calls[0]?.[0] as ReauthorizationAlertPayload;
    expect(alertArg.authId).toBe('mock-access-00000001');
    expect(alertArg.lastError).toBe('GMO reauthorize failed (E01)');

    expect(emailSpy).toHaveBeenCalledTimes(1);
    const emailArg = emailSpy.mock.calls[0]?.[0] as ReauthorizationEmailPayload;
    expect(emailArg.bidderEmail).toBe('bidder@example.com');
    expect(emailArg.authId).toBe('mock-access-00000001');
    expect(emailArg.auctionId).toBe(42n);
  });

  it('45 日以内 record は対象外 (store 側で filter される)', async () => {
    // store は 45 日以内 record を返さない (SQL WHERE 側で excluded、 findEligibleRecords contract)
    const { store, findSpy, successSpy, cancelSpy } = makeStore([]);
    const { executor, spy: reauthSpy } = makeExecutor(async () => ({
      authId: 'never-called',
      accessPass: 'never-called',
    }));
    const alertSpy = vi.fn();
    const emailSpy = vi.fn();

    const worker = new ReauthorizationWorker({
      store,
      executor,
      onAlert: alertSpy,
      onNotifyUser: emailSpy,
      intervalMs: 60 * 60 * 1000,
    });

    await worker.runOnce();

    expect(findSpy).toHaveBeenCalledTimes(1);
    // store が record を返さないため reauthorize は 1 度も呼ばれない
    expect(reauthSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
    expect(cancelSpy).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(emailSpy).not.toHaveBeenCalled();

    // 内部 filter guard を明示 verify (findEligibleRecords が 44 日 record を混入させても skip される)
    // findEligibleRecords contract を超えて worker 側でも念のため cutoff filter を保持している設計
    const injectedRecord: FiatBidRecordForReauth = {
      ...baseRecord,
      authId: 'mock-access-younger',
      status: 'bid-placed',
      createdAt: CREATED_AT_44_DAYS_AGO,
    };
    findSpy.mockResolvedValueOnce([injectedRecord]);

    await worker.runOnce();

    // 内部 double check で 44 日 record も skip される
    expect(reauthSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('start() で intervalMs 周期で runOnce が呼ばれる、 stop() で停止', async () => {
    const { store, findSpy } = makeStore([]);
    const { executor } = makeExecutor(async () => ({
      authId: 'never',
      accessPass: 'never',
    }));

    const worker = new ReauthorizationWorker({
      store,
      executor,
      intervalMs: 60 * 60 * 1000,
    });

    worker.start();

    // 起動直後に 1 回実行 (immediate)
    await vi.advanceTimersByTimeAsync(0);
    expect(findSpy).toHaveBeenCalledTimes(1);

    // 1h 経過で 2 回目
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    expect(findSpy).toHaveBeenCalledTimes(2);

    // 2h 経過で 3 回目
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    expect(findSpy).toHaveBeenCalledTimes(3);

    worker.stop();

    // stop 後は tick しない
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    expect(findSpy).toHaveBeenCalledTimes(3);
  });
});
