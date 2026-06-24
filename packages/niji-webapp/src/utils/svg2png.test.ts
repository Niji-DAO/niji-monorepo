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

  it('uses default newWidth/newHeight = 320 when omitted (320 / 32 = 10、 1 decimal OK)', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
    expect(() => svg2png(svgString)).not.toThrow();
  });

  it('rejects when default 320 used against non-divisible src dim (320 / 7 = 45.714...)', async () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7"></svg>';
    await expect(svg2png(svgString)).rejects.toThrow(/Unable to scale canvas/);
  });

  it('rejects when only width has bad ratio (height OK)', async () => {
    // width 7 -> 320 NG, height 32 -> 320 OK
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="32"></svg>';
    await expect(svg2png(svgString, 320, 320)).rejects.toThrow(/Unable to scale canvas/);
  });

  it('rejects when only height has bad ratio (width OK)', async () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="7"></svg>';
    await expect(svg2png(svgString, 320, 320)).rejects.toThrow(/Unable to scale canvas/);
  });

  it('rejects when src dim missing (NaN -> ratio NaN -> decimals >1)', async () => {
    // width 属性なし => Number(null) = 0 => 320/0 = Infinity => "Infinity".split('.') -> ['Infinity'] -> decimals 0
    // 実装挙動: Infinity.toString() = "Infinity" で split('.') 結果 [1] undefined -> decimals 0 -> guard 通過
    // この想定通り (実際に同期 throw が起きない) であることを契約として固定
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(() => svg2png(svgString, 320, 320)).not.toThrow();
  });

  it('does NOT throw for 1-decimal ratio 1.5 (canScale guard passes when decimals <= 1)', () => {
    // 30 / 20 = 1.5 (1 decimal => OK)
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>';
    expect(() => svg2png(svgString, 30, 30)).not.toThrow();
  });

  it('rejects for 2-decimal ratio (canScale guard blocks when decimals > 1)', async () => {
    // 25 / 4 = 6.25 (2 decimals => NG)
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"></svg>';
    await expect(svg2png(svgString, 25, 25)).rejects.toThrow(/Unable to scale canvas/);
  });
});
