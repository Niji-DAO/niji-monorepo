/**
 * PNG embed visual test - generate composite images at various resolutions
 * to visually compare quality
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

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
const COMPOSITE_ORDER = [
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

interface TestConfig {
  label: string;
  resolution: number;
  paletteSize: number;
  useQuantize: boolean; // true = custom palette quantize, false = sharp's built-in
}

async function generateVisual(config: TestConfig) {
  const { label, resolution, paletteSize, useQuantize } = config;
  console.log(`\n=== ${label}: ${resolution}px, ${paletteSize}色 ===`);

  const outputDir = path.join(OUTPUT_BASE, `png_${label}`);
  await fs.promises.mkdir(outputDir, { recursive: true });
  const sourceFiles = await getAllSourceFiles();

  let palette: ColorInfo[] | null = null;

  if (useQuantize) {
    // Build global palette
    console.log('  パレット構築...');
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
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        const ex = colorMap.get(key);
        if (ex) ex.count++;
        else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
      }
    }
    palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
    console.log(`  パレット: ${colorMap.size}色 → ${palette.length}色`);
  }

  // Process each trait & measure PNG sizes
  console.log('  処理中...');
  const traitPngs: Map<string, { buf: Buffer; fileName: string }[]> = new Map();
  let totalBytes = 0;

  for (let i = 0; i < sourceFiles.length; i++) {
    const sf = sourceFiles[i];
    const { data } = await sharp(sf.inputPath)
      .resize(resolution, resolution, {
        kernel: 'lanczos3',
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (useQuantize && palette) {
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
    } else {
      // Just threshold alpha
      for (let j = 0; j < data.length; j += 4) {
        if (data[j + 3] < 128) {
          data[j] = 0;
          data[j + 1] = 0;
          data[j + 2] = 0;
          data[j + 3] = 0;
        } else data[j + 3] = 255;
      }
    }

    let hasContent = false;
    for (let j = 3; j < data.length; j += 4) {
      if (data[j] > 0) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) continue;

    const pngBuf = await sharp(data, {
      raw: { width: resolution, height: resolution, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: true, colors: paletteSize })
      .toBuffer();

    const list = traitPngs.get(sf.traitName) || [];
    list.push({ buf: pngBuf, fileName: sf.fileName });
    traitPngs.set(sf.traitName, list);
    totalBytes += pngBuf.length;

    if ((i + 1) % 100 === 0) process.stdout.write(`  ${i + 1}/${sourceFiles.length}\r`);
  }

  // Build composite - pick the most content-rich image per trait
  console.log('  コンポジット生成...');
  const layers: { input: Buffer; top: number; left: number }[] = [];
  let svgParts: string[] = [];
  let svgMaxSize = 0;

  const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${resolution}" height="${resolution}" viewBox="0 0 ${resolution} ${resolution}">`;

  for (const trait of COMPOSITE_ORDER) {
    const pngs = traitPngs.get(trait);
    if (!pngs || pngs.length === 0) continue;

    // Find most opaque (most content)
    let bestPng = pngs[0];
    let bestOp = 0;
    for (const p of pngs.slice(0, 15)) {
      const { data } = await sharp(p.buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let op = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) op++;
      if (op > bestOp) {
        bestOp = op;
        bestPng = p;
      }
    }

    layers.push({ input: bestPng.buf, top: 0, left: 0 });

    // Also build SVG string
    const b64 = bestPng.buf.toString('base64');
    svgParts.push(
      `<image width="${resolution}" height="${resolution}" href="data:image/png;base64,${b64}"/>`,
    );

    // Track max sizes per trait
    const maxBuf = pngs.reduce((a, b) => (a.buf.length > b.buf.length ? a : b));
    svgMaxSize += 80 + Math.ceil((maxBuf.buf.length * 4) / 3);
  }

  svgMaxSize += svgHeader.length + 6; // </svg>

  // Save composite PNG
  const compPath = path.join(outputDir, 'composite_best.png');
  await sharp({
    create: {
      width: resolution,
      height: resolution,
      channels: 4,
      background: { r: 213, g: 215, b: 225, alpha: 1 },
    },
  })
    .composite(layers)
    .png()
    .toFile(compPath);

  // Upscale to 640px for viewing
  const upscaledPath = path.join(outputDir, 'composite_best_upscaled.png');
  await sharp(compPath).resize(640, 640, { kernel: 'lanczos3' }).toFile(upscaledPath);

  // Also save actual SVG
  const svgContent = svgHeader + svgParts.join('') + '</svg>';
  fs.writeFileSync(path.join(outputDir, 'sample.svg'), svgContent);

  // Also save SVG rendered to PNG for comparison
  const svgPngPath = path.join(outputDir, 'svg_rendered.png');
  await sharp(Buffer.from(svgContent)).resize(640, 640).toFile(svgPngPath);

  const gasMax = svgMaxSize * 150;
  const v = gasMax < 30e6 ? '✅' : '⚠️';
  console.log(
    `  SVG最大: ${(svgMaxSize / 1024).toFixed(1)}KB → ${(gasMax / 1e6).toFixed(1)}M gas ${v}`,
  );
  console.log(`  出力: ${upscaledPath}`);

  return { label, resolution, paletteSize, svgMaxSize, gasMax, upscaledPath };
}

async function main() {
  console.log('=== PNG埋め込み方式 ビジュアルテスト ===\n');

  const tests: TestConfig[] = [
    // Custom quantize (like the gas test)
    { label: '128_128c_q', resolution: 128, paletteSize: 128, useQuantize: true },
    { label: '160_128c_q', resolution: 160, paletteSize: 128, useQuantize: true },
    { label: '192_128c_q', resolution: 192, paletteSize: 128, useQuantize: true },
    { label: '256_256c_q', resolution: 256, paletteSize: 256, useQuantize: true },
    { label: '320_256c_q', resolution: 320, paletteSize: 256, useQuantize: true },
    // No custom quantize - let sharp handle it (potentially better quality)
    { label: '256_256c_auto', resolution: 256, paletteSize: 256, useQuantize: false },
    { label: '320_256c_auto', resolution: 320, paletteSize: 256, useQuantize: false },
  ];

  const results: any[] = [];
  for (const t of tests) {
    const r = await generateVisual(t);
    if (r) results.push(r);
  }

  console.log('\n\n========================================');
  console.log('=== PNG埋め込み方式 ビジュアル結果 ===');
  console.log('========================================\n');
  console.log('テスト              | 解像度 | SVG最大  | ガス最大 | 判定');
  console.log('--------------------|--------|---------|---------|-----');
  for (const r of results) {
    const v = r.gasMax < 30e6 ? '✅' : '⚠️';
    console.log(
      `${r.label.padEnd(19)} | ${r.resolution.toString().padStart(6)} | ${(r.svgMaxSize / 1024).toFixed(0).padStart(6)}KB | ${(r.gasMax / 1e6).toFixed(1).padStart(6)}M | ${v}`,
    );
  }

  console.log('\n画像パス:');
  for (const r of results) {
    console.log(`  ${r.label}: ${r.upscaledPath}`);
  }
}

main().catch(console.error);
