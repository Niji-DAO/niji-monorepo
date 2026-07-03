/**
 * Shared constants for Niji test suite.
 */

/** Canonical 12 trait names matching the NijiArt contract definition */
export const TRAIT_NAMES: string[] = [
  'special',
  'choker',
  'headphone',
  'leftHand',
  'hat',
  'clothing',
  'ear',
  'back',
  'backDecoration',
  'background',
  'solidBackground',
  'hair',
];

/** Number of traits */
export const TRAIT_COUNT = TRAIT_NAMES.length;

/** Default SVG resolution (px) */
export const RESOLUTION = 320;

/**
 * Default composite order — determines layer stacking in SVG.
 * SSOT alignment = packages/niji-contracts/scripts/niji-encoder.ts の NIJI_COMPOSITE_ORDER と同順。
 * user 指定 (Issue #3066) = special / choker を 8 / 9 位に配置、
 * leftHand / clothing / ear を前詰め (5-7 位) にして 前面 3 trait (hat / hair / headphone) を邪魔しない。
 */
export const COMPOSITE_ORDER = [10, 9, 8, 7, 3, 5, 6, 0, 1, 4, 11, 2];

/** Minimal valid PNG: 1x1 transparent pixel (67 bytes) */
export const SAMPLE_PNG = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a, // PNG signature
  0x00,
  0x00,
  0x00,
  0x0d,
  0x49,
  0x48,
  0x44,
  0x52, // IHDR chunk
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1f,
  0x15,
  0xc4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0a,
  0x49,
  0x44,
  0x41, // IDAT chunk
  0x54,
  0x78,
  0x9c,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0d,
  0x0a,
  0x2d,
  0xb4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4e,
  0x44,
  0xae, // IEND chunk
  0x42,
  0x60,
  0x82,
]);
