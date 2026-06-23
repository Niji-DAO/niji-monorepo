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
});
