import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';

const BASE_DIR = './images_niji';
const OUTPUT_BASE = './images_niji_final_test';

const TRAIT_DIRS = [
  { dir: '01_スペシャル', name: 'special' },
  { dir: '02_チョーカー', name: 'choker' },
  { dir: '03_ヘッドホン', name: 'headphone' },
  { dir: '04_左手', name: 'leftHand' },
  { dir: '05_帽子', name: 'hat' },
  { dir: '06_服', name: 'clothing' },
  { dir: '07_耳', name: 'ear' },
  { dir: '08_背中', name: 'back' },
  { dir: '09_背中の装飾', name: 'backDecoration' },
  { dir: '10_背景', name: 'background' },
  { dir: '11_背景単色', name: 'solidBackground' },
  { dir: '12_髪の毛', name: 'hair' },
];

async function testResolution(resolution: number, colors: number = 256) {
  console.log(`\n🎨 Testing ${resolution}×${resolution} (${colors} colors)...`);

  const outputDir = path.join(OUTPUT_BASE, `${resolution}x${resolution}`);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const colorMap = new Map<string, number>();
  let totalPngSize = 0;
  const processedFiles: { path: string; traitName: string; fileName: string }[] = [];

  for (const trait of TRAIT_DIRS) {
    const traitPath = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(traitPath)) continue;

    const files = fs.readdirSync(traitPath).filter(f => f.endsWith('.PNG') || f.endsWith('.png'));

    for (const file of files) {
      const inputPath = path.join(traitPath, file);
      const outputPath = path.join(outputDir, `${trait.name}_${file}`);

      // Resize and quantize
      await sharp(inputPath)
        .resize(resolution, resolution, {
          kernel: 'lanczos3',
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          palette: true,
          quality: 100,
          colors: colors,
          dither: 1.0,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      totalPngSize += stats.size;

      processedFiles.push({
        path: outputPath,
        traitName: trait.name,
        fileName: file.replace(/\.png$/i, ''),
      });
    }
  }

  // Collect colors
  for (const pf of processedFiles) {
    const png = await readPngImage(pf.path);
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const rgba = png.rgbaAt(x, y);
        if (rgba.a === 0) continue;
        const hex = `${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`;
        colorMap.set(hex, 1);
      }
    }
  }

  console.log(`  PNG total: ${(totalPngSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Unique colors: ${colorMap.size}`);

  // RLE encode
  const palette = Array.from(colorMap.keys());
  const encoder = new PNGCollectionEncoder(palette);

  for (const pf of processedFiles) {
    const png = await readPngImage(pf.path);
    encoder.encodeImage(pf.fileName, png, pf.traitName);
  }

  const encodedData = JSON.stringify(encoder.data);
  const encodedSize = Buffer.byteLength(encodedData);

  console.log(`  RLE encoded: ${(encodedSize / 1024 / 1024).toFixed(2)} MB`);

  // Estimate SVG size (based on known ratio: 26.65MB → 362KB)
  const estimatedSvgKB = (encodedSize / (26.65 * 1024 * 1024)) * 362;
  const estimatedGasM = (estimatedSvgKB / 362) * 55;

  console.log(`  Est. SVG: ${estimatedSvgKB.toFixed(0)} KB`);
  console.log(`  Est. gas: ${estimatedGasM.toFixed(1)}M`);

  // Create composite sample
  const samplePath = path.join(outputDir, 'composite.png');
  const compositeInputs: any[] = [];

  for (const trait of TRAIT_DIRS) {
    const match = processedFiles.find(f => f.traitName === trait.name);
    if (match) {
      const buf = await sharp(match.path).toBuffer();
      compositeInputs.push({ input: buf, top: 0, left: 0 });
    }
  }

  await sharp({
    create: {
      width: resolution,
      height: resolution,
      channels: 4,
      background: { r: 213, g: 215, b: 225, alpha: 1 },
    },
  })
    .composite(compositeInputs)
    .png()
    .toFile(samplePath);

  // Save individual samples
  const hairSample = processedFiles.find(f => f.traitName === 'hair');
  if (hairSample) {
    await fs.promises.copyFile(hairSample.path, path.join(outputDir, 'hair.png'));
  }

  return {
    resolution,
    colors,
    totalPngSize,
    uniqueColors: colorMap.size,
    encodedSize,
    estimatedSvgKB,
    estimatedGasM,
    samplePath,
  };
}

async function main() {
  console.log('\n=== 最終解像度テスト ===');
  console.log('目標: 25M gas以内 (30M制限に余裕を持たせる)\n');

  const resolutions = [256, 224, 192, 160, 128];
  const results = [];

  for (const res of resolutions) {
    try {
      const result = await testResolution(res);
      results.push(result);
    } catch (error) {
      console.error(`Failed ${res}: ${error}`);
    }
  }

  console.log('\n\n=== 結果サマリー ===\n');
  console.log('解像度  | PNG合計    | RLE合計    | 推定SVG  | 推定ガス  | 判定');
  console.log('--------|------------|------------|----------|----------|--------');

  for (const r of results) {
    const verdict =
      r.estimatedGasM < 20
        ? '✅ 余裕'
        : r.estimatedGasM < 25
          ? '✅ OK'
          : r.estimatedGasM < 30
            ? '⚠️ ギリ'
            : '❌ NG';
    console.log(
      `${r.resolution}×${r.resolution} | ${(r.totalPngSize / 1024 / 1024).toFixed(2).padStart(8)} MB | ${(r.encodedSize / 1024 / 1024).toFixed(2).padStart(8)} MB | ${r.estimatedSvgKB.toFixed(0).padStart(6)} KB | ${r.estimatedGasM.toFixed(1).padStart(7)}M | ${verdict}`,
    );
  }

  console.log('\n📁 サンプル画像:');
  for (const r of results) {
    console.log(`  ${r.resolution}×${r.resolution}: ${r.samplePath}`);
  }

  // Find best viable
  const viable = results.filter(r => r.estimatedGasM < 25);
  if (viable.length > 0) {
    const best = viable.reduce((a, b) => (a.resolution > b.resolution ? a : b));
    console.log(`\n✅ 最適解: ${best.resolution}×${best.resolution}`);
    console.log(`   推定SVG: ${best.estimatedSvgKB.toFixed(0)} KB`);
    console.log(
      `   推定ガス: ${best.estimatedGasM.toFixed(1)}M (30M制限の${((best.estimatedGasM / 30) * 100).toFixed(0)}%)`,
    );
    console.log(`   サンプル: ${best.samplePath}`);
  }

  console.log('\n');
}

main().catch(console.error);
