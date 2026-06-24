import { describe, expect, it } from 'vitest';

import { getNijiVotes } from './getNijiVotes';

describe('getNijiVotes', () => {
  const votes = [
    { supportDetailed: 0 as const, nijiRepresented: ['1', '2'] },
    { supportDetailed: 1 as const, nijiRepresented: ['3', '4', '5'] },
    { supportDetailed: 2 as const, nijiRepresented: ['6'] },
    { supportDetailed: 1 as const, nijiRepresented: ['7'] },
  ];

  it('returns flat list of nijiIds voting against (0)', () => {
    expect(getNijiVotes(votes, 0)).toEqual(['1', '2']);
  });

  it('returns flat list of nijiIds voting for (1)', () => {
    expect(getNijiVotes(votes, 1)).toEqual(['3', '4', '5', '7']);
  });

  it('returns flat list of nijiIds voting abstain (2)', () => {
    expect(getNijiVotes(votes, 2)).toEqual(['6']);
  });

  it('returns empty array when no matching support value', () => {
    expect(getNijiVotes(votes, 99 as 0)).toEqual([]);
  });

  it('handles empty votes array', () => {
    expect(getNijiVotes([], 1)).toEqual([]);
  });

  it('preserves duplicate nijiIds across multiple Vote entries', () => {
    const dup = [
      { supportDetailed: 1 as const, nijiRepresented: ['10', '10'] },
      { supportDetailed: 1 as const, nijiRepresented: ['10'] },
    ];
    // dedup なし、 source の意図通り重複保持
    expect(getNijiVotes(dup, 1)).toEqual(['10', '10', '10']);
  });

  it('returns empty array when all Vote entries have empty nijiRepresented', () => {
    const all = [
      { supportDetailed: 1 as const, nijiRepresented: [] },
      { supportDetailed: 1 as const, nijiRepresented: [] },
    ];
    expect(getNijiVotes(all, 1)).toEqual([]);
  });

  it('strict === filter: numeric 1 does not match string "1"', () => {
    // 型違反だが runtime 経路を確認 (string vs number)
    const mixed = [{ supportDetailed: '1' as unknown as 1, nijiRepresented: ['x'] }];
    expect(getNijiVotes(mixed, 1)).toEqual([]);
  });

  it('preserves order of nijiIds within and across votes', () => {
    const ordered = [
      { supportDetailed: 1 as const, nijiRepresented: ['c', 'a'] },
      { supportDetailed: 1 as const, nijiRepresented: ['b'] },
    ];
    // filter + flatMap で source 順を保持 (sort 不可)
    expect(getNijiVotes(ordered, 1)).toEqual(['c', 'a', 'b']);
  });

  it('handles single-entry vote with single niji', () => {
    expect(getNijiVotes([{ supportDetailed: 0 as const, nijiRepresented: ['solo'] }], 0)).toEqual([
      'solo',
    ]);
  });
});
