/**
 * niji-data-rle.json を新 schema (2-byte bounds, 256-color quantized palette) で再生成する。
 *
 * 入力 ... packages/niji-assets/images_niji/{NN_カテゴリ名}/*.png
 * 出力 ... packages/niji-assets/src/niji-data-rle.json
 *
 * 処理 ...
 *   1. 全 PNG を 512x512 RGBA に resize (sharp)
 *   2. global 256 palette を medianCut で構築
 *   3. 各画像を 256 色に量子化 (applyPaletteInPlace)
 *   4. PNGCollectionEncoder で RLE encode (palette は global で共有)
 *
 * 使い方 ...
 *   cd packages/niji-assets && pnpm tsx scripts/regenerate-niji-rle.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNGCollectionEncoder } from '@niji/sdk';

// niji-contracts は CJS のため、 named import が ESM context で undefined になる。
// require() 経由で取り出すのが確実。
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {
  NIJI_RESOLUTION,
  NIJI_PALETTE_SIZE,
  buildGlobalPalette,
  resizeToRGBA,
  applyPaletteInPlace,
} = require('../../niji-contracts/scripts/niji-encoder');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const IMAGE_ROOT = path.join(ROOT, 'images_niji');
const OUTPUT = path.join(ROOT, 'src/niji-data-rle.json');

const TRAIT_MAP = [
  { dir: '01_スペシャル', key: 'special' },
  { dir: '02_チョーカー', key: 'choker' },
  { dir: '03_ヘッドホン', key: 'headphone' },
  { dir: '04_左手', key: 'leftHand' },
  { dir: '05_帽子', key: 'hat' },
  { dir: '06_服', key: 'clothing' },
  { dir: '07_耳', key: 'ear' },
  { dir: '08_背中', key: 'back' },
  { dir: '09_背中の装飾', key: 'backDecoration' },
  { dir: '10_背景', key: 'background' },
  { dir: '11_背景単色', key: 'solidBackground' },
  { dir: '12_髪の毛', key: 'hair' },
];

function listTraitFiles() {
  const result: { key: string; dir: string; file: string; filepath: string }[] = [];
  for (const { dir, key } of TRAIT_MAP) {
    const traitDir = path.join(IMAGE_ROOT, dir);
    if (!fs.existsSync(traitDir)) {
      console.warn(`  [skip] ${key}: dir not found (${dir})`);
      continue;
    }
    const files = fs
      .readdirSync(traitDir)
      .filter((f) => /\.png$/i.test(f) && f.toLowerCase() !== 'empty.png')
      .sort();
    for (const file of files) {
      result.push({ key, dir, file, filepath: path.join(traitDir, file) });
    }
  }
  return result;
}

function rgbaAtFromBuffer(buf: Buffer, width: number, x: number, y: number) {
  const idx = (width * y + x) << 2;
  return {
    r: buf[idx],
    g: buf[idx + 1],
    b: buf[idx + 2],
    a: buf[idx + 3],
  };
}

function toHex(v: number) {
  return v.toString(16).padStart(2, '0');
}

async function main() {
  if (!fs.existsSync(IMAGE_ROOT)) {
    console.error(`image root not found: ${IMAGE_ROOT}`);
    process.exit(1);
  }

  console.log('=== regenerate niji-data-rle.json (2-byte bounds + 256 palette slots) ===');
  console.log(`image root: ${IMAGE_ROOT}`);
  console.log(`resolution: ${NIJI_RESOLUTION}, palette slots: ${NIJI_PALETTE_SIZE} (1 transparent + ${NIJI_PALETTE_SIZE - 1} colors)`);

  console.log('\n[1] listing trait files...');
  const allFiles = listTraitFiles();
  console.log(`  total: ${allFiles.length} images`);

  // palette index は RLE で 1 byte (0-255 = 256 entries) に詰めるため、
  // transparent placeholder (index 0) + 実 color 255 = 計 256 entries で構成する。
  // 256 色フル + placeholder = 257 にすると index 256 = `toPaddedHex(256, 2) = '100'`
  // (3 hex chars) になり tuple alignment が壊れる (#143-follow-up)。
  const COLOR_COUNT = NIJI_PALETTE_SIZE - 1;
  console.log(`\n[2] building global ${COLOR_COUNT}-color palette (+1 transparent slot)...`);
  const inputPaths = allFiles.map((f) => f.filepath);
  const globalPalette = await buildGlobalPalette(inputPaths, NIJI_RESOLUTION, COLOR_COUNT);
  console.log(`  palette: ${globalPalette.length} colors`);

  console.log('\n[3] encoding each image (quantize → RLE)...');
  // PNGCollectionEncoder の color map に global palette を事前 inject (index 0 = transparent)
  const hexPalette = ['', ...globalPalette.map((c) => toHex(c.r) + toHex(c.g) + toHex(c.b))];
  const encoder = new PNGCollectionEncoder(hexPalette);

  const perTraitCount: Record<string, number> = {};
  for (const { key, file, filepath } of allFiles) {
    const { data } = await resizeToRGBA(filepath, NIJI_RESOLUTION);
    applyPaletteInPlace(data, globalPalette);
    const name = file.replace(/\.png$/i, '');
    encoder.encodeImage(
      name,
      {
        width: NIJI_RESOLUTION,
        height: NIJI_RESOLUTION,
        rgbaAt: (x, y) => rgbaAtFromBuffer(data, NIJI_RESOLUTION, x, y),
      },
      key,
    );
    perTraitCount[key] = (perTraitCount[key] || 0) + 1;
  }

  for (const { key } of TRAIT_MAP) {
    console.log(`  ${key.padEnd(20)} ${perTraitCount[key] || 0} images`);
  }

  const result = encoder.data;
  console.log('---');
  console.log(`palette size: ${result.palette.length}`);
  console.log(`trait categories: ${Object.keys(result.images).length}`);

  // sanity check
  const firstKey = Object.keys(result.images)[0];
  if (firstKey && result.images[firstKey][0]) {
    const sample = result.images[firstKey][0].data.replace(/^0x/, '');
    const palette_idx = parseInt(sample.substring(0, 2), 16);
    const top = parseInt(sample.substring(2, 6), 16);
    const right = parseInt(sample.substring(6, 10), 16);
    const bottom = parseInt(sample.substring(10, 14), 16);
    const left = parseInt(sample.substring(14, 18), 16);
    console.log(
      `sample header (${firstKey}[0]): palette=${palette_idx} top=${top} right=${right} bottom=${bottom} left=${left}`,
    );
    if (right > left && bottom > top) {
      console.log('  ✓ bounds valid');
    } else {
      console.warn(`  ⚠ bounds invalid`);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  console.log(`\nwritten to: ${OUTPUT}`);
  console.log(`file size: ${(fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
