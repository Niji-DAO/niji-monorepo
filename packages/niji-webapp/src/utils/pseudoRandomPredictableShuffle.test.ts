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

  it('round-2 30 sequential pseudoRandomPredictableShuffle calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i)).not.toThrow();
    }
  });

  it('round-2 50 sequential calls with varied seeds', () => {
    for (let i = 0; i < 50; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 100);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-2 30 sequential calls preserve array length', () => {
    for (let i = 0; i < 30; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i);
      expect(result.length).toBe(5);
    }
  });

  it('round-2 100 sequential calls with varied input sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const result = pseudoRandomPredictableShuffle(input, i);
      expect(result.length).toBe(i);
    }
  });

  it('round-2 deterministic 30 cycles with same seed produces same result', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 42);
      const r2 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 42);
      expect(r1).toEqual(r2);
    }
  });

  it('round-3 30 sequential pseudoRandomPredictableShuffle calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i)).not.toThrow();
    }
  });

  it('round-3 50 sequential calls with varied seeds', () => {
    for (let i = 0; i < 50; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 100);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-3 30 sequential calls preserve array length', () => {
    for (let i = 0; i < 30; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i);
      expect(result.length).toBe(5);
    }
  });

  it('round-3 100 sequential calls with varied input sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const result = pseudoRandomPredictableShuffle(input, i);
      expect(result.length).toBe(i);
    }
  });

  it('round-3 deterministic 30 cycles with same seed produces same result', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 42);
      const r2 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 42);
      expect(r1).toEqual(r2);
    }
  });

  it('round-4 30 sequential pseudoRandomPredictableShuffle calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 100)).not.toThrow();
    }
  });

  it('round-4 50 sequential calls with varied seeds', () => {
    for (let i = 0; i < 50; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 200);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-4 30 sequential calls preserve array length', () => {
    for (let i = 0; i < 30; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 300);
      expect(result.length).toBe(5);
    }
  });

  it('round-4 100 sequential calls with varied input sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const result = pseudoRandomPredictableShuffle(input, i + 400);
      expect(result.length).toBe(i);
    }
  });

  it('round-4 deterministic 30 cycles with same seed', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 99);
      const r2 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 99);
      expect(r1).toEqual(r2);
    }
  });

  it('round-5 30 sequential pseudoRandomPredictableShuffle calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 500)).not.toThrow();
    }
  });

  it('round-5 50 sequential calls with varied seeds', () => {
    for (let i = 0; i < 50; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 700);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-5 30 sequential calls preserve array length', () => {
    for (let i = 0; i < 30; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 900);
      expect(result.length).toBe(5);
    }
  });

  it('round-5 100 sequential calls with varied input sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const result = pseudoRandomPredictableShuffle(input, i + 1100);
      expect(result.length).toBe(i);
    }
  });

  it('round-5 deterministic 30 cycles with same seed', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 333);
      const r2 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 333);
      expect(r1).toEqual(r2);
    }
  });

  it('round-6 30 sequential pseudoRandomPredictableShuffle calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 8000)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls with varied seeds', () => {
    for (let i = 0; i < 50; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 9000);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-6 30 sequential calls preserve array length', () => {
    for (let i = 0; i < 30; i++) {
      const result = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], i + 11000);
      expect(result.length).toBe(5);
    }
  });

  it('round-6 100 sequential calls with varied input sizes', () => {
    for (let i = 1; i <= 100; i++) {
      const input = Array.from({ length: i }, (_, j) => j);
      const result = pseudoRandomPredictableShuffle(input, i + 12000);
      expect(result.length).toBe(i);
    }
  });

  it('round-6 deterministic 30 cycles with same seed', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 777);
      const r2 = pseudoRandomPredictableShuffle([1, 2, 3, 4, 5], 777);
      expect(r1).toEqual(r2);
    }
  });
});
