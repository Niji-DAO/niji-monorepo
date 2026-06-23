import type { Address } from '@/utils/types';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  formatShortAddress,
  shortENS,
  veryShortAddress,
  veryShortENS,
} from './addressAndENSDisplayUtils';

describe('veryShortENS', () => {
  it('returns first char + "..." + last 3 chars', () => {
    expect(veryShortENS('nouns.eth')).toBe('n...eth');
    expect(veryShortENS('vitalik.eth')).toBe('v...eth');
  });

  it('handles single-character ENS', () => {
    // 'a'.substring(0, 1) = 'a', 'a'.substring(-2) = 'a' (negative start clamped to 0)
    expect(veryShortENS('a')).toBe('a...a');
  });
});

describe('veryShortAddress', () => {
  const addr = '0xabcdef1234567890abcdef1234567890abcdef12' as Address;

  it('returns first 3 chars + "..." + last 1 char', () => {
    expect(veryShortAddress(addr)).toBe('0xa...2');
  });

  it('returns empty string when address is undefined', () => {
    expect(veryShortAddress(undefined)).toBe('');
  });
});

describe('shortENS', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('returns full ENS when length < 15', () => {
    setWidth(400);
    expect(shortENS('short.eth')).toBe('short.eth');
  });

  it('returns full ENS when window width > 480', () => {
    setWidth(800);
    expect(shortENS('verylongname.eth')).toBe('verylongname.eth');
  });

  it('truncates when length >= 15 and width <= 480', () => {
    setWidth(400);
    expect(shortENS('verylongname.eth')).toBe('very...name.eth');
  });
});

describe('formatShortAddress', () => {
  const addr = '0xabcdef1234567890abcdef1234567890abcdef12' as Address;

  it('returns first 4 chars + "..." + last 4 chars (from index 38)', () => {
    expect(formatShortAddress(addr)).toBe('0xab...ef12');
  });

  it('returns empty string when address is undefined', () => {
    expect(formatShortAddress(undefined)).toBe('');
  });
});
