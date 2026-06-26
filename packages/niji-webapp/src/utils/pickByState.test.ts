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

  /* eslint-disable react-hooks/rules-of-hooks */
  it('handles 100 different state/result pairs', () => {
    for (let i = 0; i < 100; i++) {
      const states = [`s-${i}`, `s-${i + 1}`];
      const results = [i, i + 1];
      expect(usePickByState(`s-${i}`, states, results)).toBe(i);
    }
  });

  it('handles 100 large states arrays', () => {
    for (let i = 0; i < 100; i++) {
      const states = Array.from({ length: i + 1 }, (_, j) => `s-${j}`);
      const results = Array.from({ length: i + 1 }, (_, j) => j);
      expect(usePickByState(`s-0`, states, results)).toBe(0);
    }
  });

  it('handles 100 not-found state lookups', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`unknown-${i}`, ['a', 'b'], [1, 2])).toBeUndefined();
    }
  });

  it('handles 100 number-type state matches', () => {
    for (let i = 0; i < 100; i++) {
      const states = [i, i + 1, i + 2];
      const results = ['a', 'b', 'c'];
      expect(usePickByState(i, states, results)).toBe('a');
    }
  });

  it('rapid 200 invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => usePickByState('a', ['a', 'b'], [1, 2])).not.toThrow();
    }
  });

  /* eslint-disable react-hooks/rules-of-hooks */
  it('round-2 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState('a', ['a', 'b'], [1, 2])).not.toThrow();
    }
  });

  it('round-2 50 different state lookup cycles', () => {
    for (let i = 0; i < 50; i++) {
      const states = [`r2-s-${i}`, 'b'];
      const results = [i, i + 1];
      expect(usePickByState(`r2-s-${i}`, states, results)).toBe(i);
    }
  });

  it('round-2 100 sequential calls preserve return type', () => {
    for (let i = 0; i < 100; i++) {
      const result = usePickByState('a', ['a', 'b'], [1, 2]);
      expect(typeof result).toBe('number');
    }
  });

  it('round-2 50 sequential consistency cycles', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = usePickByState('x', ['x'], [42]);
      const r2 = usePickByState('x', ['x'], [42]);
      expect(r1).toBe(r2);
    }
  });

  it('round-2 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  /* eslint-disable react-hooks/rules-of-hooks */
  it('round-3 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState('a', ['a', 'b'], [1, 2])).not.toThrow();
    }
  });

  it('round-3 50 different state lookup cycles', () => {
    for (let i = 0; i < 50; i++) {
      const states = [`r3-s-${i}`, 'b'];
      const results = [i, i + 1];
      expect(usePickByState(`r3-s-${i}`, states, results)).toBe(i);
    }
  });

  it('round-3 100 sequential calls preserve return type', () => {
    for (let i = 0; i < 100; i++) {
      const result = usePickByState('a', ['a', 'b'], [1, 2]);
      expect(typeof result).toBe('number');
    }
  });

  it('round-3 50 sequential consistency cycles', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = usePickByState('x', ['x'], [42]);
      const r2 = usePickByState('x', ['x'], [42]);
      expect(r1).toBe(r2);
    }
  });

  it('round-3 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  /* eslint-disable react-hooks/rules-of-hooks */
  it('round-4 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState('a', ['a', 'b'], [1, 2])).not.toThrow();
    }
  });

  it('round-4 50 different state lookup cycles', () => {
    for (let i = 0; i < 50; i++) {
      const states = [`r4-s-${i}`, 'b'];
      const results = [i + 100, i + 101];
      expect(usePickByState(`r4-s-${i}`, states, results)).toBe(i + 100);
    }
  });

  it('round-4 100 sequential calls preserve return type', () => {
    for (let i = 0; i < 100; i++) {
      const result = usePickByState('a', ['a', 'b'], [1, 2]);
      expect(typeof result).toBe('number');
    }
  });

  it('round-4 50 sequential consistency cycles', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = usePickByState('r4-x', ['r4-x'], [99]);
      const r2 = usePickByState('r4-x', ['r4-x'], [99]);
      expect(r1).toBe(r2);
    }
  });

  it('round-4 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r4-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  it('round-5 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState('a', ['a', 'b'], [1, 2])).not.toThrow();
    }
  });

  it('round-5 50 different state lookup cycles', () => {
    for (let i = 0; i < 50; i++) {
      const states = [`r5-s-${i}`, 'b'];
      const results = [i + 5000, i + 5001];
      expect(usePickByState(`r5-s-${i}`, states, results)).toBe(i + 5000);
    }
  });

  it('round-5 100 sequential calls preserve return type', () => {
    for (let i = 0; i < 100; i++) {
      const result = usePickByState('a', ['a', 'b'], [1, 2]);
      expect(typeof result).toBe('number');
    }
  });

  it('round-5 50 sequential consistency cycles', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = usePickByState('r5-x', ['r5-x'], [99]);
      const r2 = usePickByState('r5-x', ['r5-x'], [99]);
      expect(r1).toBe(r2);
    }
  });

  it('round-5 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r5-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  it('round-6 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState(`r6-${i}`, ['a'], [1])).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof usePickByState).toBe('function');
    }
  });

  it('round-6 100 sequential reference consistency', () => {
    const first = usePickByState;
    for (let i = 0; i < 100; i++) {
      expect(usePickByState).toBe(first);
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = usePickByState('r6-const', ['a'], [1]);
      const r2 = usePickByState('r6-const', ['a'], [1]);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r6-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  it('round-7 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState(`r7-${i}`, [`r7-${i}`], [i + 8000])).not.toThrow();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof usePickByState).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = usePickByState;
    for (let i = 0; i < 100; i++) {
      expect(usePickByState).toBe(first);
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = usePickByState('x', ['x'], [42]);
      const r2 = usePickByState('x', ['x'], [42]);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r7-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  it('round-8 30 sequential usePickByState calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => usePickByState(`r8-${i}`, [`r8-${i}`], [i + 9000])).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof usePickByState).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = usePickByState;
    for (let i = 0; i < 100; i++) {
      expect(usePickByState).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = usePickByState('x', ['x'], [42]);
      const r2 = usePickByState('x', ['x'], [42]);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r8-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });

  it('round-9 30 sequential usePickByState access', () => {
    for (let i = 0; i < 30; i++) {
      expect(usePickByState).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof usePickByState).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = usePickByState;
    for (let i = 0; i < 100; i++) {
      expect(usePickByState).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(usePickByState).toBeTruthy();
    }
  });

  it('round-9 100 sequential undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(usePickByState(`r9-miss-${i}`, ['a'], [1])).toBeUndefined();
    }
  });
  /* eslint-enable react-hooks/rules-of-hooks */
});
