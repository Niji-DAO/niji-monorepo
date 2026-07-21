/**
 * judgeSettlement の behavior test
 *
 * 落札監視の段階判定を固定する。 特に区別が難しい 2 組を明示的に押さえる。
 * - 「落札したが引渡し前」 と「落選」 = winner が operator かどうかで分かれる
 * - 「引渡し済」 と「引渡し待ち」 = owner が operator から動いたかどうかで分かれる
 */

import { describe, expect, it } from 'vitest';

import { judgeSettlement } from './index.js';

const OPERATOR = '0xaEa7cd3F6DC66543D1bE9394b394a669D868c62B';
const USER = '0x357E1d0ea9c8Bc04a6Aca1A586dE36251898E1FA';
const NOW = 1_784_700_000;

const base = {
  operator: OPERATOR,
  now: NOW,
};

describe('judgeSettlement — auction 継続中', () => {
  it('endTime 未到達 + 最高額が operator なら fiat がリードしている', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW + 3600,
      settled: false,
      bidder: OPERATOR,
    });

    expect(r.stage).toBe('bidding');
    expect(r.leadingByFiat).toBe(true);
    expect(r.terminal).toBe(false);
  });

  it('endTime 未到達 + 最高額が他者なら fiat はリードしていない', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW + 3600,
      settled: false,
      bidder: USER,
    });

    expect(r.stage).toBe('bidding');
    expect(r.leadingByFiat).toBe(false);
  });

  it('address の大文字小文字は判定に影響しない', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW + 3600,
      settled: false,
      bidder: OPERATOR.toLowerCase(),
    });

    expect(r.leadingByFiat).toBe(true);
  });

  it('endTime ちょうどは終了扱い (now >= endTime で settle 可能になる contract 条件に合わせる)', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW,
      settled: false,
      bidder: OPERATOR,
    });

    expect(r.stage).toBe('awaiting-settle');
  });
});

describe('judgeSettlement — settle 待ち', () => {
  it('endTime 経過 + 未 settle は settle tx 待ち', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: false,
      bidder: OPERATOR,
    });

    expect(r.stage).toBe('awaiting-settle');
    expect(r.terminal).toBe(false);
  });

  it('settle 済でも落札結果が取れていなければ確定させない', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: OPERATOR,
    });

    expect(r.stage).toBe('awaiting-settle');
    expect(r.terminal).toBe(false);
  });
});

describe('judgeSettlement — settle 後', () => {
  it('winner が operator 以外なら落選で確定する', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: USER,
      settledOutcome: { winner: USER },
    });

    expect(r.stage).toBe('lost');
    expect(r.terminal).toBe(true);
  });

  it('winner が operator で owner も operator のままなら引渡し待ち', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: OPERATOR,
      settledOutcome: { winner: OPERATOR, owner: OPERATOR },
    });

    expect(r.stage).toBe('awaiting-transfer');
    expect(r.terminal).toBe(false);
    expect(r.description).toContain('capture 失敗');
  });

  it('winner が operator で owner が入札者に移っていれば引渡し済で確定する', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: OPERATOR,
      settledOutcome: { winner: OPERATOR, owner: USER },
    });

    expect(r.stage).toBe('transferred');
    expect(r.terminal).toBe(true);
  });

  it('owner 未取得なら引渡し済と判定しない (取得失敗を成功に倒さない)', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: OPERATOR,
      settledOutcome: { winner: OPERATOR },
    });

    expect(r.stage).toBe('awaiting-transfer');
    expect(r.terminal).toBe(false);
  });

  it('落選判定は owner を見ない (winner が他者なら NFT の所在に関わらず lost)', () => {
    const r = judgeSettlement({
      ...base,
      endTime: NOW - 60,
      settled: true,
      bidder: USER,
      settledOutcome: { winner: USER, owner: OPERATOR },
    });

    expect(r.stage).toBe('lost');
  });
});
