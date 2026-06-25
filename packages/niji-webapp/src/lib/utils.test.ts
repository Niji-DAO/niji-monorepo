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
});
