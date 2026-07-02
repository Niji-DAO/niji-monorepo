/**
 * Spot rate deviation check helper (Issue #3005 Phase C)
 *
 * fiat bidder の JPY 入力額と、 bid tx 発火直前 fetch した最新 spot rate との乖離を判定する。
 *
 * 用途 —
 * (1) user が JPY 額を入力した時点の rate と、 bid tx 発火直前の最新 rate に 2% 超の乖離があるか判定
 * (2) 乖離が閾値超なら user 再確認 modal 表示 (AC 4 対応)
 * (3) 乖離が閾値以内なら bid tx を発火して問題ない
 *
 * 判定式 —
 *   deviationPercent = |currentRate - previousRate| / previousRate * 100
 *   withinTolerance = deviationPercent <= tolerancePercent
 *
 * tolerancePercent は env `SPOT_RATE_TOLERANCE_PERCENT` (default 2) から読取。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4 (rate 乖離 SSOT)、
 *        AC 4 (2% 超乖離時 user 再確認 modal)
 */

export type RateDeviationInput = {
  /** user が JPY 額入力した時点の rate (JPY per 1 ETH)、 単位 = 円 */
  previousRate: number;
  /** bid tx 発火直前の最新 rate (JPY per 1 ETH)、 単位 = 円 */
  currentRate: number;
  /**
   * user 入力 JPY 額 (円単位、 参考情報のみ、 判定 logic には影響しない)
   * 応答 struct に含めて呼出側で「新 rate {X} JPY/ETH で bid 額 {Y} JPY 相当」 表示に使う
   */
  userJpyAmount: number;
};

export type RateDeviationResult = {
  /** 乖離が閾値以内なら true、 超なら false */
  withinTolerance: boolean;
  /** 乖離率 (絶対値、 %) */
  deviationPercent: number;
  /** 判定に使った閾値 (%) */
  tolerancePercent: number;
};

/**
 * env `SPOT_RATE_TOLERANCE_PERCENT` から閾値を読取
 * 未設定 / 不正値なら default 2 を返す
 */
export const readTolerancePercent = (): number => {
  const raw = process.env['SPOT_RATE_TOLERANCE_PERCENT'];
  if (raw === undefined || raw.trim() === '') {
    return 2;
  }
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 2;
  }
  return parsed;
};

/**
 * previousRate と currentRate の乖離を判定する pure function
 *
 * previousRate=0 の場合は判定不能なので withinTolerance=false を返す
 * (0 除算 gutter、 bid 発火を止めて user 再確認へ回す safe default)
 */
export const compareRateDeviation = (input: RateDeviationInput): RateDeviationResult => {
  const tolerancePercent = readTolerancePercent();
  const { previousRate, currentRate } = input;

  if (previousRate <= 0) {
    return {
      withinTolerance: false,
      deviationPercent: Number.POSITIVE_INFINITY,
      tolerancePercent,
    };
  }

  const deviationPercent = (Math.abs(currentRate - previousRate) / previousRate) * 100;
  return {
    withinTolerance: deviationPercent <= tolerancePercent,
    deviationPercent,
    tolerancePercent,
  };
};
