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
});
