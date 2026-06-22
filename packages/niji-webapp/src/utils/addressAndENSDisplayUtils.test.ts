import { describe, expect, it } from 'vitest';

import { Address } from '@/utils/types';

import {
  formatShortAddress,
  shortENS,
  veryShortAddress,
  veryShortENS,
} from './addressAndENSDisplayUtils';

const ADDR = '0x1234567890abcdef1234567890abcdef12345678' as Address;

describe('veryShortENS', () => {
  it('joins the first character and last 3 with ...', () => {
    expect(veryShortENS('vitalik.eth')).toBe('v...eth');
  });

  it('handles a 4-character ENS by overlapping first + last', () => {
    expect(veryShortENS('abcd')).toBe('a...bcd');
  });
});

describe('veryShortAddress', () => {
  it('keeps the first 3 chars and last char', () => {
    expect(veryShortAddress(ADDR)).toBe('0x1...8');
  });

  it('returns empty string when no address is provided', () => {
    expect(veryShortAddress(undefined)).toBe('');
  });
});

describe('formatShortAddress', () => {
  it('keeps the first 4 chars (0x12) and the address tail starting at index 38', () => {
    // substring(38) on a 42-char address returns the last 4 chars (e.g. "5678")
    expect(formatShortAddress(ADDR)).toBe('0x12...5678');
  });

  it('returns empty string when address is missing', () => {
    expect(formatShortAddress(undefined)).toBe('');
  });
});

describe('shortENS', () => {
  it('returns the original ENS on wide viewports', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    expect(shortENS('a-very-long-name.eth')).toBe('a-very-long-name.eth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });

  it('returns the original ENS when shorter than 15 chars even on small viewport', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    expect(shortENS('short.eth')).toBe('short.eth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });

  it('truncates to first 4 + last 8 on small viewports for long ENS', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    expect(shortENS('a-very-long-name.eth')).toBe('a-ve...name.eth');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });
});
