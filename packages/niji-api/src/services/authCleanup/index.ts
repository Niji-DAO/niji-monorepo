/**
 * AuthCleanupQueue service (Issue #3022 Phase 2 base infra)
 *
 * 責務 —
 * Phase 2 の bid 増額 5 phase sequential で、 増額 bid 成功後に旧 authorization を GMO alterTran(JobCd=VOID)
 * で cancel する非同期 queue。 chain tx confirm 後に enqueue、 5 秒後に処理開始、 rate limit 1 req/sec で順次実行、
 * fail 時 exponential backoff (1s / 2s / 4s) で 3 回まで retry、 4 回全 fail で運営 alert log 発火する。
 *
 * 設計判断 (grilling P3-b A 案) —
 * (a) chain tx 発火の critical path から旧 auth cleanup を切り離し、 増額 bid の user 待機時間を短縮する
 * (b) 5 秒 delay で chain tx confirm 前の tx revert catch (BidTooLow 等) 時に cleanup をキャンセルできる余地を残す
 * (c) 1 req/sec rate limit で GMO API の rate limit 抵触を回避 (実 GMO は 10 req/sec だが余裕を持たせる)
 * (d) 3 回 retry でも fail した case は運営手動対応 (orphan 検出は Issue #3024 側 Phase 4 に外出し)
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § P2, AC 4、
 *        Phase2-02-issue-breakdown.md § Issue P2-1、
 *        rules/quality.md § test-passed marker 発行前提
 */

/** cancelAuthorization = GmoClient.cancelAuthorization の抽象 (test 差替可能) */
export type AuthCleanupExecutor = {
  /** 与信枠 cancel を発火、 fail 時は throw (retry 判断は queue 側) */
  cancelAuthorization: (authId: string) => Promise<void>;
};

/** 3 回全 fail 時の alert payload、 運営 log + 監視 (Phase 4) 経路で使う */
export type AuthCleanupAlert = {
  authId: string;
  attempts: number;
  lastError: string;
};

export type AuthCleanupQueueOptions = {
  executor: AuthCleanupExecutor;
  /** 3 回 fail 時の alert callback (default = console.error) */
  onAlert?: (alert: AuthCleanupAlert) => void;
  /**
   * enqueue → 1 回目実行までの delay (ms、 default 5000)
   * test で短縮可能、 5 秒は grilling P3-b で確定した値
   */
  initialDelayMs?: number;
  /**
   * rate limit interval (ms、 default 1000 = 1 req/sec)
   * 2 件目以降の enqueue で 1 件目の実行時刻 + interval 以降にずらす
   */
  rateLimitIntervalMs?: number;
  /**
   * exponential backoff の base (ms、 default 1000)
   * retry k 回目の delay = base * 2^(k-1)、 k=1 で 1s、 k=2 で 2s、 k=3 で 4s
   */
  backoffBaseMs?: number;
  /**
   * 最大 retry 回数 (default 3、 initial 1 回 + retry 3 回 = 4 attempts)
   */
  maxRetries?: number;
};

/** 内部 job state (queue の 1 件分) */
type Job = {
  authId: string;
  /** 現在 attempt (初回 = 1、 retry n 回目 = n+1) */
  attempt: number;
};

/**
 * AuthCleanupQueue —
 *
 * enqueue(authId) で 1 件受付、 delay + rate limit + retry を setTimeout で管理する in-memory queue。
 * Phase 2 = 1 instance (Ponder サーバ内)、 Phase 4 で cross-instance (SQS / Redis) に移行時は本 class の
 * public shape (enqueue / drain) を維持したまま内部 setTimeout を差替える。
 *
 * 実装 note —
 * - setTimeout の callback は async、 await で完了を待たず fire-and-forget (queue 側で attempt++ 管理)
 * - rate limit は「次の実行可能時刻 = 前回実行時刻 + interval」 を保持、 enqueue 時に max(now+delay, nextSlot) を選ぶ
 * - test は fake timers (vi.useFakeTimers + advanceTimersByTimeAsync) で時間経過を simulate
 */
export class AuthCleanupQueue {
  private readonly executor: AuthCleanupExecutor;
  private readonly onAlert: (alert: AuthCleanupAlert) => void;
  private readonly initialDelayMs: number;
  private readonly rateLimitIntervalMs: number;
  private readonly backoffBaseMs: number;
  private readonly maxRetries: number;
  /** 次に rate limit slot が空く時刻 (ms、 Date.now() 基準) */
  private nextAvailableSlotAt: number;
  /** in-flight job 数 (test での drain 確認用、 現状は使わないが将来 metric 用に予約) */
  private inflight: number;

  constructor(options: AuthCleanupQueueOptions) {
    this.executor = options.executor;
    this.onAlert =
      options.onAlert ??
      ((alert): void => {
        console.error('[AuthCleanupQueue] alert', alert);
      });
    this.initialDelayMs = options.initialDelayMs ?? 5000;
    this.rateLimitIntervalMs = options.rateLimitIntervalMs ?? 1000;
    this.backoffBaseMs = options.backoffBaseMs ?? 1000;
    this.maxRetries = options.maxRetries ?? 3;
    this.nextAvailableSlotAt = 0;
    this.inflight = 0;
  }

  /**
   * enqueue —
   *
   * 受付時に「delay 経過後」 と「rate limit slot が空く時刻」 の遅い方に scheduling。
   * 同期返却 (setTimeout 登録のみ)、 実行完了を await しない fire-and-forget。
   */
  enqueue(authId: string): void {
    const now = Date.now();
    const earliestExecuteAt = now + this.initialDelayMs;
    const scheduledAt = Math.max(earliestExecuteAt, this.nextAvailableSlotAt);
    // rate limit slot を更新 (次の enqueue はこれ以降に scheduling)
    this.nextAvailableSlotAt = scheduledAt + this.rateLimitIntervalMs;

    const job: Job = { authId, attempt: 1 };
    this.scheduleJob(job, scheduledAt - now);
  }

  /**
   * scheduleJob —
   *
   * setTimeout で delayMs 後に executeJob を呼ぶ。
   * 呼出後の retry は本 method を再帰的に呼び直す (attempt++ + backoff)。
   */
  private scheduleJob(job: Job, delayMs: number): void {
    setTimeout(
      () => {
        void this.executeJob(job);
      },
      Math.max(0, delayMs),
    );
  }

  /**
   * executeJob —
   *
   * cancelAuthorization を呼び、 fail 時は attempt < maxRetries なら exponential backoff で再 schedule、
   * attempt == maxRetries (= 初回 + retry 3 回 = 4 回目) fail で onAlert 発火 + queue から drop。
   *
   * 成功時は完了 (何も返さない、 fire-and-forget)。
   */
  private async executeJob(job: Job): Promise<void> {
    this.inflight += 1;
    try {
      await this.executor.cancelAuthorization(job.authId);
      // 成功、 queue から drain (何もしない)
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      // attempt=1 (初回) fail → retry 1、 attempt=2 fail → retry 2、 attempt=3 fail → retry 3、
      // attempt=4 fail → 最終 fail (retry 3 回すべて fail 済)
      if (job.attempt <= this.maxRetries) {
        // exponential backoff = base * 2^(attempt-1)、 attempt=1 → 1s、 attempt=2 → 2s、 attempt=3 → 4s
        const backoffMs = this.backoffBaseMs * Math.pow(2, job.attempt - 1);
        const nextJob: Job = {
          authId: job.authId,
          attempt: job.attempt + 1,
        };
        this.scheduleJob(nextJob, backoffMs);
      } else {
        // 初回 + retry 3 回 = 4 回 fail、 alert 発火して drain
        this.onAlert({
          authId: job.authId,
          attempts: job.attempt,
          lastError: errMessage,
        });
      }
    } finally {
      this.inflight -= 1;
    }
  }

  /** in-flight job 数 (test の drain 確認用、 現状は observability のみ) */
  get inflightCount(): number {
    return this.inflight;
  }
}
