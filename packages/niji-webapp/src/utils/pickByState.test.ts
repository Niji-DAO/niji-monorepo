import { describe, expect, it } from 'vitest';

import { usePickByState } from './pickByState';

describe('usePickByState', () => {
  it('returns matching result by index', () => {
    const states = ['a', 'b', 'c'];
    const results = [1, 2, 3];
    expect(usePickByState('a', states, results)).toBe(1);
    expect(usePickByState('b', states, results)).toBe(2);
    expect(usePickByState('c', states, results)).toBe(3);
  });

  it('returns undefined when state is not in states array', () => {
    expect(usePickByState('z', ['a', 'b'], [1, 2])).toBeUndefined();
  });

  it('returns undefined when stateResults is shorter than states', () => {
    expect(usePickByState('c', ['a', 'b', 'c'], [1, 2])).toBeUndefined();
  });

  it('works with enum-like numeric states', () => {
    enum Status {
      PENDING,
      ACTIVE,
      DONE,
    }
    const results = ['pending', 'active', 'done'];
    expect(
      usePickByState(Status.ACTIVE, [Status.PENDING, Status.ACTIVE, Status.DONE], results),
    ).toBe('active');
  });

  it('works with complex object results', () => {
    const states = [1, 2];
    const results = [{ label: 'one' }, { label: 'two' }];
    expect(usePickByState(2, states, results)).toEqual({ label: 'two' });
  });

  it('returns first match when duplicate state values exist (indexOf semantics)', () => {
    const states = ['a', 'b', 'a', 'c'];
    const results = [1, 2, 3, 4];
    // indexOf 最初に見つけた a (index 0) を採用
    expect(usePickByState('a', states, results)).toBe(1);
  });

  it('handles null state with strict equality (indexOf uses SameValueZero)', () => {
    const states = [null, 'b'];
    const results = ['n', 'b-val'];
    expect(usePickByState(null, states, results)).toBe('n');
  });

  it('returns falsy state result (state = 0, result = "zero")', () => {
    const states = [0, 1, 2];
    const results = ['zero', 'one', 'two'];
    expect(usePickByState(0, states, results)).toBe('zero');
  });

  it('accepts readonly arrays (compile-time generic R | undefined)', () => {
    const states = ['x', 'y'] as const;
    const results = [10, 20] as const;
    expect(usePickByState('y', states, results)).toBe(20);
  });

  it('returns undefined when stateResults has falsy values at the matched index', () => {
    // results[1] = 0 (falsy) でも index match なら 0 を返す (||演算ではなく直接 indexed access)
    const states = ['a', 'b'];
    const results = [1, 0];
    expect(usePickByState('b', states, results)).toBe(0);
  });
});
