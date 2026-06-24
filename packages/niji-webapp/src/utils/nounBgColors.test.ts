import { describe, expect, it } from 'vitest';

import { beige, grey } from './nounBgColors';

describe('nounBgColors', () => {
  it('exports grey hex code', () => {
    expect(grey).toBe('#d5d7e1');
  });

  it('exports beige hex code', () => {
    expect(beige).toBe('#e1d7d5');
  });

  it('grey and beige are distinct', () => {
    expect(grey).not.toBe(beige);
  });

  it('both colors are 7 chars total (# + 6 hex)', () => {
    expect(grey).toHaveLength(7);
    expect(beige).toHaveLength(7);
  });

  it('both colors start with # prefix', () => {
    expect(grey.startsWith('#')).toBe(true);
    expect(beige.startsWith('#')).toBe(true);
  });

  it('hex portion is lowercase a-f / 0-9 only', () => {
    expect(/^#[\da-f]{6}$/.test(grey)).toBe(true);
    expect(/^#[\da-f]{6}$/.test(beige)).toBe(true);
  });

  it('hex portion is parseable as integer (24-bit color)', () => {
    expect(parseInt(grey.slice(1), 16)).not.toBeNaN();
    expect(parseInt(beige.slice(1), 16)).not.toBeNaN();
  });

  it('grey and beige are anagrams of each other (d5d7e1 vs e1d7d5 reversed pairs)', () => {
    // 仕様の偶然ではなく明示的に pin (palette 設計 contract)
    expect(grey.slice(1).split('').sort().join('')).toBe(beige.slice(1).split('').sort().join(''));
  });

  it('exports are string type', () => {
    expect(typeof grey).toBe('string');
    expect(typeof beige).toBe('string');
  });
});
