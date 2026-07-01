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

      // 1 line (currentY) 内で同色連続 run を merge して 1 rect emit。
      // 旧実装は RLE 1 byte 上限 (255) で切れた run を record 単位で emit するため、
      // 512 pixel 幅の単色 line が 3 rect (255+255+2) に分割され横縞状に見える bug があった。
      let pendingColorIndex = -1;
      let pendingStartX = 0;
      let pendingLength = 0;

      const flushPending = () => {
        if (pendingLength > 0 && pendingColorIndex > 0) {
          const hex = paletteColors[pendingColorIndex];
          svgRects.push(
            `<rect width="${pendingLength * 10}" height="10" x="${pendingStartX * 10}" y="${
              currentY * 10
            }" fill="#${hex}" />`,
          );
        }
        pendingColorIndex = -1;
        pendingLength = 0;
      };

      rects.forEach(draw => {
        let drawLength = draw[0];
        const colorIndex = draw[1];

        let length = getRectLength(currentX, drawLength, bounds.right);
        while (length > 0) {
          if (colorIndex === pendingColorIndex) {
            pendingLength += length;
          } else {
            flushPending();
            pendingColorIndex = colorIndex;
            pendingStartX = currentX;
            pendingLength = length;
          }

          currentX += length;
          if (currentX === bounds.right) {
            flushPending();
            currentX = bounds.left;
            currentY++;
          }

          drawLength -= length;
          length = getRectLength(currentX, drawLength, bounds.right);
        }
      });
      flushPending();
      result += svgRects.join('');
      return result;
    },
    `<svg width="${viewSize}" height="${viewSize}" viewBox="0 0 ${viewSize} ${viewSize}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bgColor ? `#${bgColor}` : 'none'}" />`,
  );

  return `${svgWithoutEndTag}</svg>`;
};
