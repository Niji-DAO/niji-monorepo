import { PngImage } from './types';

/**
 * Delta encoding for sparse images
 * Stores only non-transparent pixels as (x, y, colorIndex) tuples
 */
export class DeltaEncoder {
  /**
   * Encode image as delta (only non-transparent pixels)
   * Format: [paletteIndex][bounds][x1][y1][color1][x2][y2][color2]...
   */
  public static encodeDelta(png: PngImage, colorMap: Map<string, number>): string {
    const width = png.width;
    const height = png.height;

    // Find bounds
    let minX = width,
      maxX = 0,
      minY = height,
      maxY = 0;
    const pixels: Array<{ x: number; y: number; colorIndex: number }> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgba = png.rgbaAt(x, y);
        if (rgba.a === 0) continue; // Skip transparent

        const hex = `${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`;
        let colorIndex = colorMap.get(hex);

        if (colorIndex === undefined) {
          // Add to palette
          colorIndex = colorMap.size;
          colorMap.set(hex, colorIndex);
        }

        pixels.push({ x, y, colorIndex });

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (pixels.length === 0) {
      // Fully transparent image
      return '0x00000000000000';
    }

    // Encode as hex
    let encoded = '0x';
    encoded += '00'; // Palette index (always 0 for single palette)
    encoded += minY.toString(16).padStart(2, '0');
    encoded += maxX.toString(16).padStart(2, '0');
    encoded += maxY.toString(16).padStart(2, '0');
    encoded += minX.toString(16).padStart(2, '0');

    // Encode pixels as (x, y, colorIndex)
    for (const pixel of pixels) {
      encoded += pixel.x.toString(16).padStart(2, '0');
      encoded += pixel.y.toString(16).padStart(2, '0');
      encoded += pixel.colorIndex.toString(16).padStart(2, '0');
    }

    return encoded;
  }

  /**
   * Calculate compression ratio
   */
  public static analyzeCompression(
    originalRLE: string,
    deltaEncoded: string,
  ): {
    originalBytes: number;
    deltaBytes: number;
    ratio: number;
    savings: number;
  } {
    const originalBytes = (originalRLE.length - 2) / 2; // Remove 0x
    const deltaBytes = (deltaEncoded.length - 2) / 2;
    const ratio = deltaBytes / originalBytes;
    const savings = originalBytes - deltaBytes;

    return { originalBytes, deltaBytes, ratio, savings };
  }
}
