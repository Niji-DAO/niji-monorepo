import { DecodedImage } from './types';

/**
 * Decode the RLE image data into a format that's easier to consume in `buildSVG`.
 * @param image The RLE image data
 */
export const decodeImage = (image: string): DecodedImage => {
  const data = image.replace(/^0x/, '');
  // Niji format: palette_index (1 byte = 2 hex chars) + bounds (各 2 bytes = 4 hex chars × 4) = 18 hex chars header
  // 1 byte (0-255) では 256+ の bounds (e.g. 512x512 PNG) を表現できないため 2 bytes に拡張済。
  // 1-byte header の Nouns 形式とは互換性がない。
  const paletteIndex = parseInt(data.substring(0, 2), 16);
  const bounds = {
    top: parseInt(data.substring(2, 6), 16),
    right: parseInt(data.substring(6, 10), 16),
    bottom: parseInt(data.substring(10, 14), 16),
    left: parseInt(data.substring(14, 18), 16),
  };
  const rects = data.substring(18);

  return {
    paletteIndex,
    bounds,
    rects:
      rects
        ?.match(/.{1,4}/g)
        ?.map(rect => [parseInt(rect.substring(0, 2), 16), parseInt(rect.substring(2, 4), 16)]) ??
      [],
  };
};

/**
 * @notice Given an x-coordinate, draw length, and right bound, return the draw
 * length for a single SVG rectangle.
 */
const getRectLength = (currentX: number, drawLength: number, rightBound: number): number => {
  const remainingPixelsInLine = rightBound - currentX;
  return drawLength <= remainingPixelsInLine ? drawLength : remainingPixelsInLine;
};

/**
 * Given RLE parts, palette colors, and a background color, build an SVG image.
 * @param parts The RLE part datas
 * @param paletteColors The hex palette colors
 * @param bgColor The hex background color
 * @param resolution The source image resolution (default 512 for Niji, 32 for Nouns).
 *   viewBox は `resolution * 10` × `resolution * 10` の pixel grid として生成される。
 */
export const buildSVG = (
  parts: { data: string }[],
  paletteColors: string[],
  bgColor?: string,
  resolution: number = 512,
): string => {
  const viewSize = resolution * 10;
  const svgWithoutEndTag = parts.reduce(
    (result, part) => {
      const svgRects: string[] = [];
      const { bounds, rects } = decodeImage(part.data);

      let currentX = bounds.left;
      let currentY = bounds.top;

      rects.forEach(draw => {
        let drawLength = draw[0];
        const colorIndex = draw[1];
        const hexColor = paletteColors[colorIndex];

        let length = getRectLength(currentX, drawLength, bounds.right);
        while (length > 0) {
          // Do not push rect if transparent
          if (colorIndex !== 0) {
            svgRects.push(
              `<rect width="${length * 10}" height="10" x="${currentX * 10}" y="${
                currentY * 10
              }" fill="#${hexColor}" />`,
            );
          }

          currentX += length;
          if (currentX === bounds.right) {
            currentX = bounds.left;
            currentY++;
          }

          drawLength -= length;
          length = getRectLength(currentX, drawLength, bounds.right);
        }
      });
      result += svgRects.join('');
      return result;
    },
    `<svg width="${viewSize}" height="${viewSize}" viewBox="0 0 ${viewSize} ${viewSize}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bgColor ? `#${bgColor}` : 'none'}" />`,
  );

  return `${svgWithoutEndTag}</svg>`;
};
