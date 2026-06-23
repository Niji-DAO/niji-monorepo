import { describe, expect, it } from 'vitest';

import { pseudoRandomPredictableShuffle } from './pseudoRandomPredictableShuffle';

describe('pseudoRandomPredictableShuffle', () => {
  it('returns same length array as input', () => {
    const input = [1, 2, 3, 4, 5];
    expect(pseudoRandomPredictableShuffle(input).length).toBe(input.length);
  });

  it('contains the same elements as input (permutation)', () => {
    const input = [1, 2, 3, 4, 5];
    const output = pseudoRandomPredictableShuffle(input);
    expect([...output].sort()).toEqual([...input].sort());
  });

  it('produces deterministic output for same seed', () => {
    const input = [1, 2, 3, 4, 5];
    expect(pseudoRandomPredictableShuffle(input, 42)).toEqual(
      pseudoRandomPredictableShuffle(input, 42),
    );
  });

  it('produces different order for different seeds (usually)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = pseudoRandomPredictableShuffle(input, 1);
    const b = pseudoRandomPredictableShuffle(input, 100);
    expect(a).not.toEqual(b);
  });

  it('handles empty input', () => {
    expect(pseudoRandomPredictableShuffle([])).toEqual([]);
  });

  it('handles single-element input', () => {
    expect(pseudoRandomPredictableShuffle([42])).toEqual([42]);
  });

  it('uses default seed = 1 when not provided', () => {
    const input = [1, 2, 3];
    expect(pseudoRandomPredictableShuffle(input)).toEqual(pseudoRandomPredictableShuffle(input, 1));
  });
});
