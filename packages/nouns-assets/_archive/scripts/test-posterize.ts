/**
 * Test: aggressive posterization + smoothing at higher resolutions
 * Strategy: blur → posterize → fewer color transitions → smaller SVG
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder, buildSVG } from '@nouns/sdk';
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

function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  let wc =
    colors.length > 50000 ? [...colors].sort((a, b) => b.count - a.count).slice(0, 50000) : colors;
  let buckets: ColorInfo[][] = [wc];
  while (buckets.length < targetSize) {
    let mr = -1,
      mi = 0,
      sc: 'r' | 'g' | 'b' = 'r';
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      for (const ch of ['r', 'g', 'b'] as const) {
        let mn = 255,
          mx = 0;
        for (const c of buckets[i]) {
          if (c[ch] < mn) mn = c[ch];
          if (c[ch] > mx) mx = c[ch];
        }
        let tc = 0;
        for (const c of buckets[i]) tc += c.count;
        const wr = (mx - mn) * Math.log(tc + 1);
        if (wr > mr) {
          mr = wr;
          mi = i;
          sc = ch;
        }
      }
    }
    if (mr <= 0) break;
    const b = buckets[mi];
    b.sort((a, c) => a[sc] - c[sc]);
    const m = Math.floor(b.length / 2);
    buckets.splice(mi, 1, b.slice(0, m), b.slice(m));
  }
  return buckets.map(bk => {
    let tc = 0,
      rs = 0,
      gs = 0,
      bs = 0;
    for (const c of bk) {
      tc += c.count;
      rs += c.r * c.count;
      gs += c.g * c.count;
      bs += c.b * c.count;
    }
    return { r: Math.round(rs / tc), g: Math.round(gs / tc), b: Math.round(bs / tc), count: tc };
  });
}

function findNearest(r: number, g: number, b: number, p: ColorInfo[]): number {
  let md = Infinity,
    mi = 0;
  for (let i = 0; i < p.length; i++) {
    const dr = r - p[i].r,
      dg = g - p[i].g,
      db = b - p[i].b;
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < md) {
      md = d;
      mi = i;
    }
  }
  return mi;
}

interface TestConfig {
  label: string;
  resolution: number;
  paletteSize: number;
  blurRadius: number; // 0 = no blur
}

async function getAllSourceFiles() {
  const files: { inputPath: string; traitName: string; fileName: string }[] = [];
  for (const trait of TRAIT_DIRS) {
    const tp = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(tp)) continue;
    for (const file of fs.readdirSync(tp).filter(f => /\.png$/i.test(f))) {
      files.push({
        inputPath: path.join(tp, file),
        traitName: trait.name,
        fileName: file.replace(/\.png$/i, ''),
      });
    }
  }
  return files;
}

async function runTest(config: TestConfig) {
  const { label, resolution, paletteSize, blurRadius } = config;
  console.log(`\n🎨 ${label}: ${resolution}px, ${paletteSize}色, blur=${blurRadius}`);

  if (resolution > 255) {
    console.log('  スキップ (>255)');
    return null;
  }

  const outputDir = path.join(OUTPUT_BASE, label);
  await fs.promises.mkdir(outputDir, { recursive: true });
  const sourceFiles = await getAllSourceFiles();

  // Step 1: Collect colors (with blur applied)
  console.log('  色収集...');
  const colorMap = new Map<string, ColorInfo>();
  for (const sf of sourceFiles) {
    let pipeline = sharp(sf.inputPath).resize(resolution, resolution, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (blurRadius > 0) pipeline = pipeline.blur(blurRadius);
    const { data } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      const ex = colorMap.get(key);
      if (ex) ex.count++;
      else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
  }

  // Step 2: Generate palette
  console.log(`  パレット生成 (${colorMap.size}→${paletteSize})...`);
  const palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
  const paletteHex = palette.map(
    c =>
      `${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`,
  );

  // Step 3: Apply palette
  console.log('  適用中...');
  const processedFiles: { path: string; traitName: string; fileName: string }[] = [];
  for (let i = 0; i < sourceFiles.length; i++) {
    const sf = sourceFiles[i];
    const op = path.join(outputDir, `${sf.traitName}_${sf.fileName}.png`);

    let pipeline = sharp(sf.inputPath).resize(resolution, resolution, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (blurRadius > 0) pipeline = pipeline.blur(blurRadius);
    const { data } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    for (let j = 0; j < data.length; j += 4) {
      if (data[j + 3] < 128) {
        data[j] = 0;
        data[j + 1] = 0;
        data[j + 2] = 0;
        data[j + 3] = 0;
        continue;
      }
      data[j + 3] = 255;
      const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
      data[j] = palette[idx].r;
      data[j + 1] = palette[idx].g;
      data[j + 2] = palette[idx].b;
    }
    await sharp(data, { raw: { width: resolution, height: resolution, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(op);
    processedFiles.push({ path: op, traitName: sf.traitName, fileName: sf.fileName });
    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i + 1}/${sourceFiles.length}\r`);
  }

  // Step 4: RLE encode
  console.log('  RLEエンコード...');
  const encoder = new PNGCollectionEncoder(paletteHex);
  for (const pf of processedFiles) {
    const png = await readPngImage(pf.path);
    encoder.encodeImage(pf.fileName, png, pf.traitName);
  }
  const nijiData = encoder.data;

  // Step 5: Generate SVG
  const testParts: any[] = [];
  const bestParts: any[] = [];
  for (const trait of TRAIT_DIRS) {
    const images = (nijiData.images as any)[trait.name];
    if (!images || images.length === 0) continue;
    const valid = images.filter((img: any) => img?.data);
    if (valid.length === 0) continue;
    testParts.push(valid[0]);
    bestParts.push(valid.reduce((a: any, b: any) => (a.data.length > b.data.length ? a : b)));
  }

  const svg = buildSVG(testParts, nijiData.palette, 'd5d7e1');
  const svgBest = buildSVG(bestParts, nijiData.palette, 'd5d7e1');
  const svgSize = Buffer.byteLength(svg);
  const svgBestSize = Buffer.byteLength(svgBest);
  const rects = (svg.match(/<rect /g) || []).length;
  const rectsBest = (svgBest.match(/<rect /g) || []).length;

  console.log(
    `  通常: SVG=${(svgSize / 1024).toFixed(0)}KB, ${rects}rects, ${((svgSize * 150) / 1e6).toFixed(1)}Mgas`,
  );
  console.log(
    `  最大: SVG=${(svgBestSize / 1024).toFixed(0)}KB, ${rectsBest}rects, ${((svgBestSize * 150) / 1e6).toFixed(1)}Mgas`,
  );

  // Save composite sample
  const compositeBest: any[] = [];
  for (const t of TRAIT_DIRS) {
    const files = processedFiles.filter(f => f.traitName === t.name);
    if (files.length === 0) continue;
    // Find most opaque
    let bestFile = files[0];
    let bestOp = 0;
    for (const f of files.slice(0, 10)) {
      const { data } = await sharp(f.path)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let op = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) op++;
      if (op > bestOp) {
        bestOp = op;
        bestFile = f;
      }
    }
    compositeBest.push({ input: await sharp(bestFile.path).toBuffer(), top: 0, left: 0 });
  }
  const compPath = path.join(outputDir, 'composite_best.png');
  await sharp({
    create: {
      width: resolution,
      height: resolution,
      channels: 4,
      background: { r: 213, g: 215, b: 225, alpha: 1 },
    },
  })
    .composite(compositeBest)
    .png()
    .toFile(compPath);
  // Upscale for visibility
  const scale = Math.ceil(320 / resolution);
  await sharp(compPath)
    .resize(resolution * scale, resolution * scale, { kernel: 'nearest' })
    .toFile(path.join(outputDir, 'composite_best_upscaled.png'));

  fs.writeFileSync(path.join(outputDir, 'sample.svg'), svg);
  fs.writeFileSync(path.join(outputDir, 'sample_best.svg'), svgBest);

  return {
    label,
    resolution,
    paletteSize,
    blurRadius,
    svgSize,
    svgBestSize,
    rects,
    rectsBest,
    gasNormal: svgSize * 150,
    gasMax: svgBestSize * 150,
  };
}

async function main() {
  console.log('=== ポスタライズ + スムージング テスト ===');
  console.log('戦略: ぼかし → 色統一 → rect数削減 → SVG縮小\n');

  const tests: TestConfig[] = [
    // 高解像度 + 超積極的ポスタライズ
    { label: '128_16c_blur1', resolution: 128, paletteSize: 16, blurRadius: 1 },
    { label: '128_16c_blur2', resolution: 128, paletteSize: 16, blurRadius: 2 },
    { label: '128_8c_blur2', resolution: 128, paletteSize: 8, blurRadius: 2 },

    { label: '96_16c_blur1', resolution: 96, paletteSize: 16, blurRadius: 1 },
    { label: '96_16c_blur2', resolution: 96, paletteSize: 16, blurRadius: 2 },
    { label: '96_24c_blur1', resolution: 96, paletteSize: 24, blurRadius: 1 },
    { label: '96_8c_blur2', resolution: 96, paletteSize: 8, blurRadius: 2 },

    { label: '64_32c_blur1', resolution: 64, paletteSize: 32, blurRadius: 1 },
    { label: '64_16c_blur1', resolution: 64, paletteSize: 16, blurRadius: 1 },

    // baseline comparison
    { label: '64_128c_noblur', resolution: 64, paletteSize: 128, blurRadius: 0 },
    { label: '48_128c_noblur', resolution: 48, paletteSize: 128, blurRadius: 0 },
  ];

  const results: any[] = [];
  for (const t of tests) {
    const r = await runTest(t);
    if (r) results.push(r);
  }

  console.log('\n\n========================================');
  console.log('=== ポスタライズ結果 ===');
  console.log('========================================\n');
  console.log(
    'テスト              | 解像度 | 色 | blur | SVG通常 | SVG最大 | ガス通常 | ガス最大 | 判定',
  );
  console.log(
    '--------------------|--------|-----|------|--------|--------|---------|---------|-----',
  );

  for (const r of results) {
    const v = r.gasMax < 30e6 ? '✅' : r.gasNormal < 30e6 ? '⚠️' : '❌';
    console.log(
      `${r.label.padEnd(19)} | ${r.resolution.toString().padStart(6)} | ${r.paletteSize.toString().padStart(3)} | ${r.blurRadius.toString().padStart(4)} | ${(r.svgSize / 1024).toFixed(0).padStart(6)}KB | ${(r.svgBestSize / 1024).toFixed(0).padStart(6)}KB | ${(r.gasNormal / 1e6).toFixed(1).padStart(6)}M | ${(r.gasMax / 1e6).toFixed(1).padStart(6)}M | ${v}`,
    );
  }
}

main().catch(console.error);
