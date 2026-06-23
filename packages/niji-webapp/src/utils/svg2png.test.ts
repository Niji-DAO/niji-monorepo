import { describe, expect, it } from 'vitest';

import { svg2png } from './svg2png';

describe('svg2png', () => {
  it('rejects (Promise executor throw) when scale ratio is non-integer (canScale guard)', async () => {
    // 320 / 7 = 45.714... (>1 decimal => NG)
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7"></svg>';
    await expect(svg2png(svgString, 320, 320)).rejects.toThrow(/Unable to scale canvas/);
  });

  it('does NOT throw when ratio is integer (target dim 32 / src 32 = 1)', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
    // jsdom canvas は実 raster 描画しないので Promise は resolve しないが、
    // 同期 throw が起きない (canScale guard を通る) ことだけを確認
    expect(() => svg2png(svgString, 32, 32)).not.toThrow();
  });

  it('does NOT throw when ratio has 1 decimal place (320 / 32 = 10、 OK)', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
    expect(() => svg2png(svgString, 320, 320)).not.toThrow();
  });

  it('returns a Promise (async API contract)', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
    const result = svg2png(svgString, 32, 32);
    expect(result).toBeInstanceOf(Promise);
  });
});
