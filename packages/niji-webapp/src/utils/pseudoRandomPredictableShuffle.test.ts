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

  it('seed 0 internal-increment path produces same result as seed 1 (0++ -> 1 before sin)', () => {
    // source 内 `if (seed === 0) seed++;` で seed=0 開始は seed=1 として進む
    const input = [1, 2, 3, 4, 5];
    expect(pseudoRandomPredictableShuffle(input, 0)).toEqual(
      pseudoRandomPredictableShuffle(input, 1),
    );
  });

  it('handles very large seed (1e9) without throw', () => {
    const input = [1, 2, 3, 4, 5];
    const result = pseudoRandomPredictableShuffle(input, 1e9);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('shuffles string elements correctly (permutation preserved)', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = pseudoRandomPredictableShuffle(input, 42);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('preserves reference identity of object elements (shallow)', () => {
    const o1 = { id: 1 };
    const o2 = { id: 2 };
    const o3 = { id: 3 };
    const result = pseudoRandomPredictableShuffle([o1, o2, o3], 7);
    expect(result).toContain(o1);
    expect(result).toContain(o2);
    expect(result).toContain(o3);
  });

  it('does not mutate the input array (immutable contract)', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    pseudoRandomPredictableShuffle(input, 99);
    expect(input).toEqual(snapshot);
  });

  it('handles default empty input ([]) with default seed', () => {
    // 引数なし呼出で default input [] + default seed 1
    expect(pseudoRandomPredictableShuffle()).toEqual([]);
  });

  it('handles 100 different array sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const output = pseudoRandomPredictableShuffle(input);
      expect(output.length).toBe(i);
    }
  });

  it('handles 100 different seeds', () => {
    const input = [1, 2, 3, 4, 5];
    for (let i = 0; i < 100; i++) {
      const output = pseudoRandomPredictableShuffle(input, i);
      expect(output.length).toBe(input.length);
    }
  });

  it('same seed produces consistent result 50 times', () => {
    const input = [1, 2, 3, 4, 5];
    const expected = pseudoRandomPredictableShuffle(input, 42);
    for (let i = 0; i < 50; i++) {
      expect(pseudoRandomPredictableShuffle(input, 42)).toEqual(expected);
    }
  });

  it('handles 100 large arrays', () => {
    for (let i = 0; i < 100; i++) {
      const input = Array.from({ length: 100 }, (_, j) => j);
      const output = pseudoRandomPredictableShuffle(input);
      expect(output.length).toBe(100);
    }
  });

  it('handles 100 string element arrays', () => {
    for (let i = 0; i < 100; i++) {
      const input = Array.from({ length: 10 }, (_, j) => `item-${j}`);
      const output = pseudoRandomPredictableShuffle(input);
      expect(output.length).toBe(10);
    }
  });
});
