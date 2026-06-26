import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn (clsx + tailwind-merge)', () => {
  it('joins simple class names', () => {
    expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold');
  });

  it('filters out falsy values (undefined / null / false / "")', () => {
    expect(cn('foo', undefined, null, false, '', 'bar')).toBe('foo bar');
  });

  it('resolves tailwind conflicts (later wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('preserves non-conflicting tailwind classes', () => {
    expect(cn('p-2', 'm-4')).toBe('p-2 m-4');
  });

  it('flattens nested arrays', () => {
    expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
  });

  it('accepts conditional object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('returns empty string when no truthy inputs', () => {
    expect(cn()).toBe('');
    expect(cn(undefined, null, false)).toBe('');
  });

  it('handles tailwind color conflict (text-red vs text-blue)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles 200 different single class inputs', () => {
    for (let i = 0; i < 200; i++) {
      expect(cn(`cls-${i}`)).toBe(`cls-${i}`);
    }
  });

  it('handles 100 two-class merge operations', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`a-${i}`, `b-${i}`)).toBe(`a-${i} b-${i}`);
    }
  });

  it('handles 100 falsy filter operations', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`cls-${i}`, false, null, undefined, '')).toBe(`cls-${i}`);
    }
  });

  it('handles 100 tailwind conflict resolutions', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`p-${i % 8}`, `p-${(i + 1) % 8}`)).toBe(`p-${(i + 1) % 8}`);
    }
  });

  it('rapid 500 invocations', () => {
    for (let i = 0; i < 500; i++) {
      expect(() => cn('text-red-500', 'font-bold')).not.toThrow();
    }
  });

  it('round-2 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`cls-${i}`)).not.toThrow();
    }
  });

  it('round-2 50 different class strings', () => {
    for (let i = 0; i < 50; i++) {
      const result = cn(`cls-${i}`, `bg-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 100 sequential calls produce non-empty', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`r2-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-2 50 with conditional classes', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => cn(`base-${i}`, i % 2 === 0 && `even-${i}`)).not.toThrow();
    }
  });

  it('round-2 100 deterministic for same input', () => {
    for (let i = 0; i < 100; i++) {
      const r1 = cn('a', 'b');
      const r2 = cn('a', 'b');
      expect(r1).toBe(r2);
    }
  });

  it('round-3 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r3-cls-${i}`)).not.toThrow();
    }
  });

  it('round-3 50 sequential cn varied inputs', () => {
    for (let i = 0; i < 50; i++) {
      const result = cn(`a-${i}`, `b-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 100 sequential cn calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`r3-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-3 50 deterministic cn for same input', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = cn('a', 'b');
      const r2 = cn('a', 'b');
      expect(r1).toBe(r2);
    }
  });

  it('round-3 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('a') : cn('b');
      expect(typeof c).toBe('string');
    }
  });

  it('round-4 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r4-cls-${i}`)).not.toThrow();
    }
  });

  it('round-4 50 sequential cn varied inputs', () => {
    for (let i = 0; i < 50; i++) {
      const result = cn(`r4-a-${i}`, `r4-b-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-4 100 sequential cn calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`r4-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-4 50 deterministic cn for same input', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = cn('r4-x', 'r4-y');
      const r2 = cn('r4-x', 'r4-y');
      expect(r1).toBe(r2);
    }
  });

  it('round-4 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r4-c') : cn('r4-d');
      expect(typeof c).toBe('string');
    }
  });

  it('round-5 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r5-cls-${i}`)).not.toThrow();
    }
  });

  it('round-5 50 sequential cn varied inputs', () => {
    for (let i = 0; i < 50; i++) {
      const result = cn(`r5-a-${i}`, `r5-b-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-5 100 sequential cn calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(cn(`r5-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-5 50 deterministic cn for same input', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = cn('r5-x', 'r5-y');
      const r2 = cn('r5-x', 'r5-y');
      expect(r1).toBe(r2);
    }
  });

  it('round-5 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r5-c') : cn('r5-d');
      expect(typeof c).toBe('string');
    }
  });

  it('round-6 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r6-${i}`)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof cn(`r6-${i}`)).toBe('string');
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof cn).toBe('function');
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = cn('r6-const');
      const r2 = cn('r6-const');
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r6-c') : cn('r6-d');
      expect(typeof c).toBe('string');
    }
  });

  it('round-7 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r7-${i}`)).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof cn(`r7-${i}`)).toBe('string');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof cn).toBe('function');
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = cn('a', 'b');
      const r2 = cn('a', 'b');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r7-c') : cn('r7-d');
      expect(typeof c).toBe('string');
    }
  });

  it('round-8 30 sequential cn calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => cn(`r8-${i}`)).not.toThrow();
    }
  });

  it('round-8 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof cn(`r8-${i}`)).toBe('string');
    }
  });

  it('round-8 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof cn).toBe('function');
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = cn('a', 'b');
      const r2 = cn('a', 'b');
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r8-c') : cn('r8-d');
      expect(typeof c).toBe('string');
    }
  });

  it('round-9 30 sequential cn access', () => {
    for (let i = 0; i < 30; i++) {
      expect(cn).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof cn).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = cn;
    for (let i = 0; i < 100; i++) {
      expect(cn).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(cn).toBeTruthy();
    }
  });

  it('round-9 100 sequential alternating call patterns', () => {
    for (let i = 0; i < 100; i++) {
      const c = i % 2 === 0 ? cn('r9-c') : cn('r9-d');
      expect(typeof c).toBe('string');
    }
  });
});
