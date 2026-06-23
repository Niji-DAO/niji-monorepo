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
});
