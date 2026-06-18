import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';

const BASE_DIR = './images_niji';
const OUTPUT_BASE = './images_niji_color_test';

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

interface ColorInfo {
  r: number;
  g: number;
  b: number;
  count: number;
}

/**
 * Iterative median cut - avoids stack overflow for large color sets
 */
function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;

  // Sample if too many colors (performance optimization)
  let workingColors = colors;
  if (colors.length > 50000) {
    // Sort by count and take top 50000 most frequent
    workingColors = [...colors].sort((a, b) => b.count - a.count).slice(0, 50000);
    console.log(`    Sampled ${workingColors.length} most frequent colors from ${colors.length}`);
  }

  // Use iterative approach with explicit stack
  let buckets: ColorInfo[][] = [workingColors];

  while (buckets.length < targetSize) {
    let maxRange = -1;
    let maxBucketIdx = 0;
    let splitChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      for (const ch of ['r', 'g', 'b'] as const) {
        let min = 255,
          max = 0;
        for (const c of bucket) {
          if (c[ch] < min) min = c[ch];
          if (c[ch] > max) max = c[ch];
        }
        const range = max - min;
        let totalCount = 0;
        for (const c of bucket) totalCount += c.count;
        const weightedRange = range * Math.log(totalCount + 1);
        if (weightedRange > maxRange) {
          maxRange = weightedRange;
          maxBucketIdx = i;
          splitChannel = ch;
        }
      }
    }

    if (maxRange <= 0) break;

    const bucketToSplit = buckets[maxBucketIdx];
    bucketToSplit.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const median = Math.floor(bucketToSplit.length / 2);
    const b1 = bucketToSplit.slice(0, median);
    const b2 = bucketToSplit.slice(median);
    buckets.splice(maxBucketIdx, 1, b1, b2);
  }

  // Return weighted average of each bucket
  return buckets.map(bucket => {
    let totalCount = 0,
      rSum = 0,
      gSum = 0,
      bSum = 0;
    for (const c of bucket) {
      totalCount += c.count;
      rSum += c.r * c.count;
      gSum += c.g * c.count;
      bSum += c.b * c.count;
    }
    return {
      r: Math.round(rSum / totalCount),
      g: Math.round(gSum / totalCount),
      b: Math.round(bSum / totalCount),
      count: totalCount,
    };
  });
}

function colorDistanceSq(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

function findNearestPaletteIndex(r: number, g: number, b: number, palette: ColorInfo[]): number {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < palette.length; i++) {
    const dist = colorDistanceSq(r, g, b, palette[i].r, palette[i].g, palette[i].b);
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return minIdx;
}

interface TestConfig {
  label: string;
  resolution: number;
  paletteSize: number;
}

interface TestResult {
  label: string;
  resolution: number;
  paletteSize: number;
  actualColors: number;
  totalPngSize: number;
  encodedSize: number;
  svgSize: number;
  estimatedGas: number;
  samplePath: string;
}

async function getAllSourceFiles(): Promise<
  { inputPath: string; traitName: string; fileName: string }[]
> {
  const files: { inputPath: string; traitName: string; fileName: string }[] = [];
  for (const trait of TRAIT_DIRS) {
    const traitPath = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(traitPath)) continue;
    const dirFiles = fs
      .readdirSync(traitPath)
      .filter(f => f.endsWith('.PNG') || f.endsWith('.png'));
    for (const file of dirFiles) {
      files.push({
        inputPath: path.join(traitPath, file),
        traitName: trait.name,
        fileName: file.replace(/\.png$/i, ''),
      });
    }
  }
  return files;
}

async function collectAllColors(
  sourceFiles: { inputPath: string }[],
  resolution: number,
): Promise<Map<string, ColorInfo>> {
  const colorMap = new Map<string, ColorInfo>();

  for (const sf of sourceFiles) {
    const { data } = await sharp(sf.inputPath)
      .resize(resolution, resolution, {
        kernel: 'lanczos3',
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const key = `${r},${g},${b}`;
      const existing = colorMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        colorMap.set(key, { r, g, b, count: 1 });
      }
    }
  }

  return colorMap;
}

async function applyGlobalPalette(
  inputPath: string,
  outputPath: string,
  resolution: number,
  palette: ColorInfo[],
): Promise<void> {
  const { data } = await sharp(inputPath)
    .resize(resolution, resolution, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    data[i + 3] = 255;
    const idx = findNearestPaletteIndex(data[i], data[i + 1], data[i + 2], palette);
    data[i] = palette[idx].r;
    data[i + 1] = palette[idx].g;
    data[i + 2] = palette[idx].b;
  }

  await sharp(data, {
    raw: { width: resolution, height: resolution, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function runTest(config: TestConfig): Promise<TestResult> {
  const { label, resolution, paletteSize } = config;
  console.log(`\n🎨 テスト: ${label} (${resolution}×${resolution}, グローバル${paletteSize}色)`);

  const outputDir = path.join(OUTPUT_BASE, label);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const sourceFiles = await getAllSourceFiles();

  // Step 1: Collect colors
  console.log('  色収集中...');
  const colorMap = await collectAllColors(sourceFiles, resolution);
  console.log(`  ユニーク色数: ${colorMap.size}`);

  // Step 2: Generate palette
  console.log(`  グローバル${paletteSize}色パレット生成中...`);
  const palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
  console.log(`  パレット: ${palette.length}色`);

  // Step 3: Apply palette
  console.log('  全画像にパレット適用中...');
  let totalPngSize = 0;
  const processedFiles: { path: string; traitName: string; fileName: string }[] = [];

  for (let i = 0; i < sourceFiles.length; i++) {
    const sf = sourceFiles[i];
    const outputPath = path.join(outputDir, `${sf.traitName}_${sf.fileName}.png`);
    await applyGlobalPalette(sf.inputPath, outputPath, resolution, palette);
    totalPngSize += fs.statSync(outputPath).size;
    processedFiles.push({ path: outputPath, traitName: sf.traitName, fileName: sf.fileName });
    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i + 1}/${sourceFiles.length}\r`);
  }
  console.log(`  PNG合計: ${(totalPngSize / 1024 / 1024).toFixed(2)} MB`);

  // Step 4: RLE encode
  console.log('  RLEエンコード中...');
  const paletteHex = palette.map(
    c =>
      `${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`,
  );

  const encoder = new PNGCollectionEncoder(paletteHex);
  for (const pf of processedFiles) {
    const png = await readPngImage(pf.path);
    encoder.encodeImage(pf.fileName, png, pf.traitName);
  }

  const encodedSize = Buffer.byteLength(JSON.stringify(encoder.data));
  console.log(`  RLE: ${(encodedSize / 1024 / 1024).toFixed(2)} MB`);

  // Step 5: Generate actual SVG
  console.log('  SVG生成中...');
  const { buildSVG } = await import('@nouns/sdk');
  const nijiData = encoder.data;

  const testParts: any[] = [];
  for (const trait of TRAIT_DIRS) {
    const traitImages = (nijiData.images as any)[trait.name];
    if (traitImages?.length > 0) testParts.push(traitImages[0]);
  }

  let svgSize = 0;
  let estimatedGas = 0;
  if (testParts.length > 0) {
    const svg = buildSVG(testParts, nijiData.palette, 'd5d7e1');
    svgSize = Buffer.byteLength(svg);
    estimatedGas = svgSize * 150;
    console.log(
      `  SVG: ${(svgSize / 1024).toFixed(1)} KB → 推定 ${(estimatedGas / 1_000_000).toFixed(1)}Mガス`,
    );
    fs.writeFileSync(path.join(outputDir, 'sample.svg'), svg);
  }

  // Create visual sample
  const samplePath = path.join(outputDir, 'sample_composite.png');
  const compositeInputs: any[] = [];
  for (const trait of TRAIT_DIRS) {
    const match = processedFiles.find(f => f.traitName === trait.name);
    if (match) {
      compositeInputs.push({ input: await sharp(match.path).toBuffer(), top: 0, left: 0 });
    }
  }
  if (compositeInputs.length > 0) {
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
  }

  // Save samples for visual comparison
  const hair = processedFiles.find(f => f.traitName === 'hair');
  if (hair) await fs.promises.copyFile(hair.path, path.join(outputDir, 'sample_hair.png'));
  const clothing = processedFiles.find(f => f.traitName === 'clothing');
  if (clothing)
    await fs.promises.copyFile(clothing.path, path.join(outputDir, 'sample_clothing.png'));

  return {
    label,
    resolution,
    paletteSize,
    actualColors: palette.length,
    totalPngSize,
    encodedSize,
    svgSize,
    estimatedGas,
    samplePath,
  };
}

async function main() {
  console.log('=== グローバルパレット × 解像度 最適化テスト ===');
  console.log('全画像が同一パレットを共有 → RLE圧縮最大化');
  console.log('目標: 12レイヤーSVG ≤ 30Mガス (SVG ≤ ~200KB)\n');

  const tests: TestConfig[] = [
    // 320×320 combinations
    { label: '320_gp256', resolution: 320, paletteSize: 256 },
    { label: '320_gp128', resolution: 320, paletteSize: 128 },
    { label: '320_gp64', resolution: 320, paletteSize: 64 },

    // 256×256 combinations
    { label: '256_gp256', resolution: 256, paletteSize: 256 },
    { label: '256_gp128', resolution: 256, paletteSize: 128 },
    { label: '256_gp64', resolution: 256, paletteSize: 64 },

    // 192×192 combinations
    { label: '192_gp256', resolution: 192, paletteSize: 256 },
    { label: '192_gp128', resolution: 192, paletteSize: 128 },

    // 160×160
    { label: '160_gp256', resolution: 160, paletteSize: 256 },
    { label: '160_gp128', resolution: 160, paletteSize: 128 },

    // 128×128
    { label: '128_gp256', resolution: 128, paletteSize: 256 },
    { label: '128_gp128', resolution: 128, paletteSize: 128 },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);
    } catch (error) {
      console.error(`  ❌ Error in ${test.label}: ${error}`);
    }
  }

  console.log('\n\n========================================');
  console.log('=== 最終結果 ===');
  console.log('========================================\n');
  console.log('テスト         | 解像度 | 色数 | PNG合計  | RLE合計  | SVGサイズ | ガス推定 | 判定');
  console.log('--------------|--------|------|---------|---------|----------|---------|-----');

  for (const r of results) {
    const gasM = r.estimatedGas / 1_000_000;
    const verdict = gasM < 20 ? '✅ 安全' : gasM < 30 ? '⚠️ ギリ' : '❌ NG';
    console.log(
      `${r.label.padEnd(14)}| ${r.resolution.toString().padStart(6)} | ${r.actualColors.toString().padStart(4)} | ${(r.totalPngSize / 1024 / 1024).toFixed(1).padStart(6)} MB | ${(r.encodedSize / 1024 / 1024).toFixed(1).padStart(6)} MB | ${(r.svgSize / 1024).toFixed(0).padStart(6)} KB | ${gasM.toFixed(1).padStart(6)}M | ${verdict}`,
    );
  }

  // Find viable options
  const viable = results.filter(r => r.estimatedGas / 1_000_000 < 30);
  if (viable.length > 0) {
    console.log('\n✅ ガスリミット内のオプション:');
    viable.forEach(r => {
      console.log(
        `  ${r.label}: ${r.resolution}×${r.resolution}, ${r.actualColors}色, SVG=${(r.svgSize / 1024).toFixed(0)}KB, ガス=${(r.estimatedGas / 1_000_000).toFixed(1)}M`,
      );
    });
    const best = viable.reduce((a, b) => (a.resolution > b.resolution ? a : b));
    console.log(`\n🏆 最高画質の実現可能オプション: ${best.label}`);
  }
}

main().catch(console.error);
