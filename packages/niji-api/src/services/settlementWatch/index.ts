/**
 * fiat 入札の落札進行を判定する pure logic
 *
 * chain から読んだ状態を渡すと「今どの段階か」 と「監視を続けるべきか」 を返す。
 * 実際の RPC 呼出は scripts/watch-settlement.ts が担い、 本 module は判定だけを持つ。
 * 判定を分離しているのは、 段階の境界 (特に「落札したが引渡し前」 と「落選」 の区別) を
 * test で固定するため。 script 内に埋めると network 無しでは検証できない。
 */

/** 監視対象の段階 */
export type SettlementStage =
  /** auction 継続中。 fiat 入札が最高額かどうかは leadingByFiat で区別する */
  | 'bidding'
  /** endTime 経過だが未 settle。 AuctionKeeper の settle tx 待ち */
  | 'awaiting-settle'
  /** settle 済で fiat が落札。 capture と transferFrom の完了待ち */
  | 'awaiting-transfer'
  /** settle 済で fiat が落札し、 NFT が入札者に渡った */
  | 'transferred'
  /** settle 済だが fiat は落選。 与信は cancel される */
  | 'lost';

export type SettlementJudgeInput = {
  /** 現在の auction の endTime (epoch 秒) */
  endTime: number;
  /** 現在の auction が settle 済か */
  settled: boolean;
  /** 現在の auction の最高額入札者 */
  bidder: string;
  /** 運営 EOA。 これが winner / bidder なら fiat 経由 */
  operator: string;
  /** 判定時刻 (epoch 秒) */
  now: number;
  /**
   * 監視対象 token の落札結果。
   * fiat 入札を出した auction が settle 済のときだけ渡す (未 settle なら undefined)。
   */
  settledOutcome?: {
    /** AuctionSettled の winner */
    winner: string;
    /** 落札した token の現 owner。 未取得なら undefined */
    owner?: string;
  };
};

export type SettlementJudgement = {
  stage: SettlementStage;
  /** fiat 入札が現在の最高額か (stage = 'bidding' のときのみ意味を持つ) */
  leadingByFiat: boolean;
  /** これ以上状態が動かない = 監視を終えてよいか */
  terminal: boolean;
  /** 人が読む 1 行説明 */
  description: string;
};

const sameAddress = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/**
 * 段階判定。
 *
 * 判定順は「auction が終わったか」 → 「settle されたか」 → 「誰が落札したか」 → 「NFT が動いたか」。
 * owner が operator のままなら capture / transferFrom が未完了とみなす。 SettlementDaemon は
 * capture 失敗時に transferFrom へ進まないため、 この状態は「与信が取れていない」 signal でもある。
 */
export const judgeSettlement = (input: SettlementJudgeInput): SettlementJudgement => {
  const leadingByFiat = sameAddress(input.bidder, input.operator);

  if (input.now < input.endTime) {
    return {
      stage: 'bidding',
      leadingByFiat,
      terminal: false,
      description: leadingByFiat
        ? '入札中 — fiat 入札が現在の最高額'
        : '入札中 — fiat 入札は現在の最高額ではない',
    };
  }

  if (!input.settled) {
    return {
      stage: 'awaiting-settle',
      leadingByFiat,
      terminal: false,
      description: '終了待ち — AuctionKeeper (cron 1 分毎) の settle tx 待ち',
    };
  }

  const outcome = input.settledOutcome;
  if (outcome === undefined) {
    return {
      stage: 'awaiting-settle',
      leadingByFiat,
      terminal: false,
      description: 'settle 済だが対象 auction の落札結果を取得できていない',
    };
  }

  if (!sameAddress(outcome.winner, input.operator)) {
    return {
      stage: 'lost',
      leadingByFiat,
      terminal: true,
      description: '落選 — 与信は cancel され、 カードに請求は発生しない',
    };
  }

  if (outcome.owner !== undefined && !sameAddress(outcome.owner, input.operator)) {
    return {
      stage: 'transferred',
      leadingByFiat,
      terminal: true,
      description: '引渡し済 — capture と transferFrom が完了',
    };
  }

  return {
    stage: 'awaiting-transfer',
    leadingByFiat,
    terminal: false,
    description:
      '落札済、 引渡し待ち — owner が operator のまま。 capture 失敗なら transferFrom に進まないため log を確認する',
  };
};
