import { join } from 'path';

import { beforeEach, describe, expect, it } from 'vitest';

import { Image } from '../src/image/image';
import { buildSVG, decodeImage } from '../src/image/svg-builder';
import { RGBAColor } from '../src/image/types';

import { readPngImage } from './lib';

async function encodeMultiLineRLE(filepath: string) {
  const transparent: [string, number] = ['', 0];
  const colors: Map<string, number> = new Map([transparent]);
  const pngImage = await readPngImage(filepath);
  const image = new Image(pngImage.width, pngImage.height, pngImage.rgbaAt);
  const rle = image.toRLE(colors);
  return { rle, colors };
}

describe('Image', () => {
  describe('Multiline RLE empty image', async () => {
    // Niji は resolution=512 default のため viewBox = 5120 × 5120。
    // 旧 Nouns 形式 (resolution=32 → viewBox 320) との互換性は持たない。
    it('builds empty image with default 5120 viewBox', async () => {
      const { rle, colors } = await encodeMultiLineRLE(join(__dirname, './lib/images/empty.png'));
      const svg = buildSVG([{ data: rle }], Array.from(colors.keys()), 'ffffff');
      expect(svg).to.eq(
        '<svg width="5120" height="5120" viewBox="0 0 5120 5120" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff" /></svg>',
      );
    });
  });

  describe('Multiline RLE encoding', async () => {
    const R: RGBAColor = { r: 255, g: 0, b: 0, a: 255 };
    const B: RGBAColor = { r: 0, g: 0, b: 255, a: 255 };
    const T: RGBAColor = { r: 0, g: 0, b: 0, a: 0 };
    const transparent: [string, number] = ['', 0];
    let colors: Map<string, number>;

    beforeEach(async () => {
      colors = new Map([transparent]);
    });

    const encodePixels = (pixels: RGBAColor[][], colors: Map<string, number>) => {
      const rle = new Image(pixels[0].length, pixels.length, (x, y) => pixels[y][x]).toRLE(colors);
      const decoded = decodeImage(rle);
      const colorsArray = Array.from(colors.keys());
      return { decoded, colorsArray };
    };

    it('encodes single pixel', async () => {
      const pixels: RGBAColor[][] = [[R]];

      const { decoded, colorsArray } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 0, bottom: 0, left: 0, right: 1 });
      expect(decoded.rects).to.eql([[1, 1]]);
      expect(colorsArray[1]).to.eq('ff0000');
    });

    it('encodes repeating pixel', async () => {
      const pixels: RGBAColor[][] = [[R, R, R, R]];

      const { decoded, colorsArray } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 0, bottom: 0, left: 0, right: 4 });
      expect(decoded.rects).to.eql([[4, 1]]);
      expect(colorsArray[1]).to.eq('ff0000');
    });

    it('encodes 2 colors', async () => {
      const pixels: RGBAColor[][] = [[B, B, B, R, R]];

      const { decoded, colorsArray } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 0, bottom: 0, left: 0, right: 5 });
      expect(decoded.rects).to.eql([
        [3, 1],
        [2, 2],
      ]);
      expect(colorsArray[1]).to.eq('0000ff');
      expect(colorsArray[2]).to.eq('ff0000');
    });

    it('skips transparent rows & columns when calculating bounds', async () => {
      const pixels: RGBAColor[][] = [
        [T, T, T, T, T],
        [T, T, T, T, T],
        [T, T, R, T, T],
        [T, T, R, R, T],
        [T, T, T, T, T],
      ];

      const { decoded } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 2, bottom: 3, left: 2, right: 4 });
      expect(decoded.rects).to.eql([
        [1, 1],
        [1, 0],
        [2, 1],
      ]);
    });

    it('encodes RLE over multiple lines', async () => {
      const pixels: RGBAColor[][] = [
        [R, R, R, R],
        [R, R, B, B],
      ];

      const { decoded } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 0, bottom: 1, left: 0, right: 4 });
      expect(decoded.rects).to.eql([
        [6, 1],
        [2, 2],
      ]);
    });

    it('limits RLE to length of 255', async () => {
      const pixels: RGBAColor[][] = [
        Array(200).fill(R),
        Array(100).fill(R).concat(Array(100).fill(B)),
      ];

      const { decoded } = encodePixels(pixels, colors);

      expect(decoded.bounds).to.eql({ top: 0, bottom: 1, left: 0, right: 200 });
      expect(decoded.rects).to.eql([
        [255, 1],
        [45, 1],
        [100, 2],
      ]);
    });
  });
});
