/**
 * ReauthorizationWorker service (Issue #3024 Phase 2 = 45 日超 fallback cron worker)
 *
 * 責務 —
 * fiat bid の GMO 与信枠は 60 日で expire する。
 * anti-sniping soft close の連続発火などで auction 期間が 45 日を超えた場合、
 * 期限切れによる bid record 全損を予防するため、 1h 周期で fiat_bid table を scan、
 * createdAt から 45 日を超えた status ∈ {pending, 3ds-verified, bid-placed} record に対して
 * GMO 再 authorization API (旧 alterTran(VOID) → 新 entryTran + execTran) を発火する insurance 経路。
 *
 * 設計判断 (grilling P3-a A 案 SSOT) —
 * (a) 24h auction + 45 日超で backend 監視 → GMO 再 authorization API 発火 fallback、
 *     実運用では 45 日超は極めてレア (Nouns 生態系では観測実績なし) だが 60 日 hold 期限切れによる bid record 全損を予防
 * (b) 1 回 fail = cancel 確定 (AuthCleanupQueue の 3 回 retry と別経路、
 *     Reauth は「予期しない状態」 起点で fail 側の user 通知が優先されるため retry せず即 cancel)
 * (c) 成功時 reauthorizationCount++ + lastReauthorizedAt = now UPDATE、
 *     UPDATE は primary key (authId) の置換を伴う (新 authId で record を再 anchor)
 * (d) 失敗時 fiat_bid.status = cancelled + 運営 alert log + user 通知 email (bidder 側で新規 bid し直しを促す)
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § 45 日超 fallback (AC 5, 6)、
 *        Phase2-02-issue-breakdown.md § Issue P2-3、
 *        rules/quality.md § test-passed marker 発行前提
 */

/** 45 日 threshold (ms、 SSOT = master spec § 45 日超 fallback) */
export const REAUTHORIZATION_THRESHOLD_MS = 45 * 24 * 60 * 60 * 1000;

/** 再 authorization 対象の fiat_bid record shape (store.findEligibleRecords 戻り値) */
export type FiatBidRecordForReauth = {
  /** 旧 authId (GMO accessId、 alterTran(VOID) + 新 entryTran/execTran に必要) */
  authId: string;
  /** 旧 accessPass (alterTran に必要) */
  accessPass: string;
  /** bidder wallet (再 authorize 後 record に維持) */
  bidderWallet: `0x${string}`;
  /** bidder email (fail 時 user 通知に使う、 null 時は通知 skip) */
  bidderEmail: string | null;
  /** 対象 auction (Noun ID、 fail 時 email 本文で表示) */
  auctionId: bigint;
  /** JPY amount (再 authorize 時に新 entryTran へ渡す) */
  jpyAmount: number;
  /** ETH wei (record 維持用、 再 authorize では変更しない) */
  ethAmount: bigint;
  /** authorize 成功時刻 (45 日 threshold 判定の基準) */
  createdAt: Date;
  /** 現在の進行状態 (pending / 3ds-verified / bid-placed のみ対象) */
  status: string;
  /** 現在の再 authorization 回数 (成功時 +1) */
  reauthorizationCount: number;
};

/** 再 authorization 実行結果 (成功時 executor 戻り値) */
export type ReauthorizationResult = {
  /** 新 authId (GMO 新 entryTran で発行された accessId) */
  authId: string;
  /** 新 accessPass */
  accessPass: string;
};

/** DI 用 executor 抽象 (test で mock 差替可能、 default = GmoClient wrapper) */
export type ReauthorizationExecutor = {
  /**
   * 与信枠 再 authorize を発火 (旧 auth VOID + 新 auth entry + exec の 3 step)
   * fail 時は throw (Worker 側で cancel + alert 処理)
   */
  reauthorize: (input: {
    oldAuthId: string;
    oldAccessPass: string;
    jpyAmount: number;
    /** 新 orderId (通常は old authId から派生、 GMO 側で unique 制約あるため suffix 追加) */
    newOrderId: string;
  }) => Promise<ReauthorizationResult>;
};

/** DB store 抽象 (Ponder DB を直接触らず worker test 可能に) */
export type ReauthorizationStore = {
  /**
   * 45 日超 record を scan で検出、 status ∈ {pending, 3ds-verified, bid-placed} に絞る
   * SQL 側で cutoffDate 以前の createdAt を WHERE で filter、 worker 側でも二重 guard する
   */
  findEligibleRecords: (input: { cutoffDate: Date }) => Promise<FiatBidRecordForReauth[]>;

  /**
   * 再 authorize 成功時 UPDATE、 primary key (authId) を旧→新 で置換 +
   * reauthorizationCount++ + lastReauthorizedAt = now
   */
  updateAfterReauthSuccess: (input: {
    oldAuthId: string;
    newAuthId: string;
    newReauthorizationCount: number;
    lastReauthorizedAt: Date;
  }) => Promise<void>;

  /**
   * 再 authorize 失敗時、 fiat_bid.status = cancelled で確定 (retry しない)
   */
  updateStatusCancelled: (input: { authId: string }) => Promise<void>;
};

/** 3 回全 fail = 1 回で確定した fail の alert payload (運営通知) */
export type ReauthorizationAlertPayload = {
  authId: string;
  auctionId: bigint;
  bidderWallet: `0x${string}`;
  lastError: string;
};

/** fail 時 user 通知 email payload (SendGrid / SES で送信) */
export type ReauthorizationEmailPayload = {
  bidderEmail: string;
  authId: string;
  auctionId: bigint;
  jpyAmount: number;
};

export type ReauthorizationWorkerOptions = {
  store: ReauthorizationStore;
  executor: ReauthorizationExecutor;
  /** 運営 alert callback (default = console.error) */
  onAlert?: (payload: ReauthorizationAlertPayload) => void;
  /** user 通知 email callback (default = console.warn placeholder、 bidderEmail=null 時は skip) */
  onNotifyUser?: (payload: ReauthorizationEmailPayload) => void;
  /**
   * scan 周期 (ms、 default 60 min = 1h)
   * env REAUTHORIZATION_INTERVAL_HOURS で override 可能
   */
  intervalMs?: number;
  /**
   * 現在時刻を返す clock (test 用、 default = () => new Date())
   */
  clock?: () => Date;
};

/** 対象 status 集合 (45 日超 fallback で救う遷移途中の状態) */
const ELIGIBLE_STATUSES = new Set(['pending', '3ds-verified', 'bid-placed']);

/**
 * env REAUTHORIZATION_INTERVAL_HOURS から intervalMs を解決
 * default 1h、 test 短縮時は options.intervalMs で直接指定
 */
export const resolveIntervalMs = (): number => {
  const raw = process.env['REAUTHORIZATION_INTERVAL_HOURS'];
  if (raw !== undefined && raw.trim() !== '') {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed * 60 * 60 * 1000;
    }
  }
  return 60 * 60 * 1000;
};

/**
 * ReauthorizationWorker —
 *
 * start() で setInterval 起動、 起動直後 + intervalMs 周期で runOnce() を呼ぶ。
 * stop() で clearInterval + 停止。 runOnce() は単体で test / manual 起動可能。
 *
 * 実装 note —
 * - fail 時 (reauthorize throw) は 1 record 内で cancel + alert + email、 他 record の処理は継続
 * - findEligibleRecords contract を信頼するが、 worker 側でも cutoffDate + status double check
 * - fire-and-forget ではなく await で 1 record ずつ順次処理 (GMO API rate limit 保護)
 */
export class ReauthorizationWorker {
  private readonly store: ReauthorizationStore;
  private readonly executor: ReauthorizationExecutor;
  private readonly onAlert: (payload: ReauthorizationAlertPayload) => void;
  private readonly onNotifyUser: (payload: ReauthorizationEmailPayload) => void;
  private readonly intervalMs: number;
  private readonly clock: () => Date;
  private intervalHandle: ReturnType<typeof setInterval> | null;

  constructor(options: ReauthorizationWorkerOptions) {
    this.store = options.store;
    this.executor = options.executor;
    this.onAlert =
      options.onAlert ??
      ((payload): void => {
        console.error('[ReauthorizationWorker] alert', payload);
      });
    this.onNotifyUser =
      options.onNotifyUser ??
      ((payload): void => {
        // Phase 2 では email 送信 lib 未配線、 log 出力に留める (Phase 3+ で SendGrid / SES 統合予定)
        console.warn('[ReauthorizationWorker] notify user', payload);
      });
    this.intervalMs = options.intervalMs ?? resolveIntervalMs();
    this.clock = options.clock ?? ((): Date => new Date());
    this.intervalHandle = null;
  }

  /** 1 周期分の scan + 処理を実行 (test / manual 起動でも使う) */
  async runOnce(): Promise<void> {
    const now = this.clock();
    const cutoffDate = new Date(now.getTime() - REAUTHORIZATION_THRESHOLD_MS);
    let records: FiatBidRecordForReauth[];
    try {
      records = await this.store.findEligibleRecords({ cutoffDate });
    } catch (err) {
      console.error('[ReauthorizationWorker] findEligibleRecords failed', err);
      return;
    }

    for (const record of records) {
      // double guard: findEligibleRecords contract 側 filter + worker 側 cutoff / status 再検証
      if (record.createdAt.getTime() > cutoffDate.getTime()) continue;
      if (!ELIGIBLE_STATUSES.has(record.status)) continue;

      await this.processRecord(record, now);
    }
  }

  private async processRecord(record: FiatBidRecordForReauth, now: Date): Promise<void> {
    try {
      const result = await this.executor.reauthorize({
        oldAuthId: record.authId,
        oldAccessPass: record.accessPass,
        jpyAmount: record.jpyAmount,
        newOrderId: `${record.authId}-reauth-${now.getTime()}`,
      });

      await this.store.updateAfterReauthSuccess({
        oldAuthId: record.authId,
        newAuthId: result.authId,
        newReauthorizationCount: record.reauthorizationCount + 1,
        lastReauthorizedAt: now,
      });
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);

      try {
        await this.store.updateStatusCancelled({ authId: record.authId });
      } catch (updateErr) {
        console.error('[ReauthorizationWorker] updateStatusCancelled failed', {
          authId: record.authId,
          updateErr,
        });
      }

      this.onAlert({
        authId: record.authId,
        auctionId: record.auctionId,
        bidderWallet: record.bidderWallet,
        lastError: errMessage,
      });

      // bidderEmail=null 時は email skip (record 保持のみ)
      if (record.bidderEmail !== null && record.bidderEmail.trim() !== '') {
        this.onNotifyUser({
          bidderEmail: record.bidderEmail,
          authId: record.authId,
          auctionId: record.auctionId,
          jpyAmount: record.jpyAmount,
        });
      }
    }
  }

  /**
   * 定期起動を開始、 起動直後に 1 回 + intervalMs 周期で runOnce() を呼ぶ
   * 内部 async は catch で外に throw させない (interval が停止しないため)
   */
  start(): void {
    if (this.intervalHandle !== null) return;

    const invoke = (): void => {
      void this.runOnce().catch(err => {
        console.error('[ReauthorizationWorker] runOnce unhandled', err);
      });
    };
    // 起動直後 1 回 (immediate tick、 setTimeout(0) で cron loop に yield して test の advanceTimersByTimeAsync(0) 経路と揃える)
    setTimeout(invoke, 0);
    this.intervalHandle = setInterval(invoke, this.intervalMs);
  }

  /** 定期起動を停止 */
  stop(): void {
    if (this.intervalHandle === null) return;
    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }
}
