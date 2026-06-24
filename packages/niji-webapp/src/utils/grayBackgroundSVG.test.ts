import { describe, expect, it } from 'vitest';

import { getGrayBackgroundSVG } from './grayBackgroundSVG';

describe('getGrayBackgroundSVG', () => {
  it('returns a data URI string starting with the SVG prefix', () => {
    const result = getGrayBackgroundSVG();
    expect(result.startsWith('data:image/svg+xml;base64,')).toBe(true);
  });

  it('is non-empty', () => {
    expect(getGrayBackgroundSVG().length).toBeGreaterThan(30);
  });

  it('returns the same value on multiple calls (pure constant)', () => {
    expect(getGrayBackgroundSVG()).toBe(getGrayBackgroundSVG());
  });

  it('return type is string', () => {
    expect(typeof getGrayBackgroundSVG()).toBe('string');
  });

  it('MIME portion is exactly image/svg+xml', () => {
    expect(getGrayBackgroundSVG()).toContain('image/svg+xml');
  });

  it('declares base64 encoding in the data URI', () => {
    expect(getGrayBackgroundSVG()).toContain(';base64,');
  });

  it('has non-empty base64 portion after the comma', () => {
    const portion = getGrayBackgroundSVG().split(',')[1];
    expect(portion.length).toBeGreaterThan(0);
  });

  it('strict identity across calls (=== operator)', () => {
    const a = getGrayBackgroundSVG();
    const b = getGrayBackgroundSVG();
    expect(a === b).toBe(true);
  });

  it('contains valid base64 characters only after comma', () => {
    const portion = getGrayBackgroundSVG().split(',')[1];
    // base64 文字セット (A-Z, a-z, 0-9, +, /, =、 加えて意図せず含まれた空白/inline 改行を許容)
    expect(/^[\d\s+/=A-Za-z]+$/.test(portion)).toBe(true);
  });
});
