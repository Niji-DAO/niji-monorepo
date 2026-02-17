/**
 * Encode all Niji images at 320×320 with global 128-color palette
 * Output: src/niji-data-320.json (RLE encoded data for on-chain storage)
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';

const INPUT_DIR = './images_niji_color_test/320_gp128';
const OUTPUT_FILE = './src/niji-data-320.json';

const TRAIT_ORDER = [
  'solidBackground',
  'background',
  'back',
  'backDecoration',
  'clothing',
  'hair',
  'hat',
  'ear',
  'choker',
  'headphone',
  'leftHand',
  'special',
];

async function main() {
  console.log('=== 320×320 + Global 128色 RLEエンコード ===\n');

  // Collect palette from all images
  console.log('Step 1: パレット収集...');
  const colorMap = new Map<string, number>();
  const allFiles: { path: string; traitName: string; fileName: string }[] = [];

  for (const trait of TRAIT_ORDER) {
    const files = fs.readdirSync(INPUT_DIR)
      .filter(f => f.startsWith(`${trait}_`) && f.endsWith('.png') && !f.includes('sample'))
      .sort();

    for (const file of files) {
      const filePath = path.join(INPUT_DIR, file);
      const png = await readPngImage(filePath);

      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const { r, g, b, a } = png.rgbaAt(x, y);
          if (a === 0) continue;
          const hex = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
      }

      const fileName = file
        .replace(`${trait}_`, '')
        .replace(/\.png$/i, '');
      allFiles.push({ path: filePath, traitName: trait, fileName });
    }
  }

  const palette = Array.from(colorMap.keys());
  console.log(`  パレット: ${palette.length}色`);
  console.log(`  画像数: ${allFiles.length}`);

  // Encode all images
  console.log('\nStep 2: RLEエンコード...');
  const encoder = new PNGCollectionEncoder(palette);

  for (let i = 0; i < allFiles.length; i++) {
    const { path: filePath, traitName, fileName } = allFiles[i];
    const png = await readPngImage(filePath);
    encoder.encodeImage(fileName, png, traitName);
    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i + 1}/${allFiles.length}\r`);
  }

  console.log(`  ${allFiles.length}/${allFiles.length} 完了`);

  // Save
  console.log('\nStep 3: 保存...');
  const data = encoder.data;
  const jsonStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonStr);

  const fileSize = fs.statSync(OUTPUT_FILE).size;
  console.log(`  出力: ${OUTPUT_FILE}`);
  console.log(`  サイズ: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  // Summary per trait
  console.log('\n=== トレイト別サマリー ===');
  const images = data.images as any;
  for (const trait of TRAIT_ORDER) {
    const count = images[trait]?.length || 0;
    console.log(`  ${trait}: ${count}枚`);
  }
  console.log(`  パレット: ${data.palette.length}色`);
}

main().catch(console.error);
