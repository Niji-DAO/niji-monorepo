/**
 * Color flattening v2: 2D flattening to reduce horizontal banding artifacts
 *
 * Strategy:
 * 1. Resize to target resolution
 * 2. Vertical flattening (column-wise) to reduce horizontal banding
 * 3. Horizontal flattening (row-wise) for RLE run length optimization
 * 4. Map to global palette
 * 5. Eliminate short runs
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

interface ColorInfo { r: number; g: number; b: number; count: number; }

function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  let wc = colors.length > 50000 ? [...colors].sort((a, b) => b.count - a.count).slice(0, 50000) : colors;
  let buckets: ColorInfo[][] = [wc];
  while (buckets.length < targetSize) {
    let mr = -1, mi = 0, sc: 'r' | 'g' | 'b' = 'r';
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      for (const ch of ['r', 'g', 'b'] as const) {
        let mn = 255, mx = 0;
        for (const c of buckets[i]) { if (c[ch] < mn) mn = c[ch]; if (c[ch] > mx) mx = c[ch]; }
        let tc = 0; for (const c of buckets[i]) tc += c.count;
        const wr = (mx - mn) * Math.log(tc + 1);
        if (wr > mr) { mr = wr; mi = i; sc = ch; }
      }
    }
    if (mr <= 0) break;
    const b = buckets[mi]; b.sort((a, c) => a[sc] - c[sc]);
    const m = Math.floor(b.length / 2);
    buckets.splice(mi, 1, b.slice(0, m), b.slice(m));
  }
  return buckets.map(bk => {
    let tc = 0, rs = 0, gs = 0, bs = 0;
    for (const c of bk) { tc += c.count; rs += c.r * c.count; gs += c.g * c.count; bs += c.b * c.count; }
    return { r: Math.round(rs / tc), g: Math.round(gs / tc), b: Math.round(bs / tc), count: tc };
  });
}

function findNearest(r: number, g: number, b: number, p: ColorInfo[]): number {
  let md = Infinity, mi = 0;
  for (let i = 0; i < p.length; i++) {
    const dr = r - p[i].r, dg = g - p[i].g, db = b - p[i].b;
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < md) { md = d; mi = i; }
  }
  return mi;
}

/**
 * Row-based color flattening (horizontal):
 * For each row, scan pixels left→right. If a pixel's RGB distance to its left neighbor
 * is small, snap it to that neighbor's color. This increases RLE run lengths.
 */
function flattenHorizontal(
  data: Buffer,
  width: number,
  height: number,
  threshold: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const i = (y * width + x) * 4;
      const iPrev = (y * width + x - 1) * 4;
      if (data[i + 3] === 0 || data[iPrev + 3] === 0) continue;
      const dr = data[i] - data[iPrev];
      const dg = data[i + 1] - data[iPrev + 1];
      const db = data[i + 2] - data[iPrev + 2];
      const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (dist < threshold) {
        data[i] = data[iPrev];
        data[i + 1] = data[iPrev + 1];
        data[i + 2] = data[iPrev + 2];
      }
    }
  }
}

/**
 * Column-based color flattening (vertical):
 * For each column, scan pixels top→bottom. If a pixel's RGB distance to the pixel
 * above is small, snap it to the upper pixel's color.
 * This prevents horizontal banding caused by row-only flattening.
 */
function flattenVertical(
  data: Buffer,
  width: number,
  height: number,
  threshold: number
): void {
  for (let x = 0; x < width; x++) {
    for (let y = 1; y < height; y++) {
      const i = (y * width + x) * 4;
      const iAbove = ((y - 1) * width + x) * 4;
      if (data[i + 3] === 0 || data[iAbove + 3] === 0) continue;
      const dr = data[i] - data[iAbove];
      const dg = data[i + 1] - data[iAbove + 1];
      const db = data[i + 2] - data[iAbove + 2];
      const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
      if (dist < threshold) {
        data[i] = data[iAbove];
        data[i + 1] = data[iAbove + 1];
        data[i + 2] = data[iAbove + 2];
      }
    }
  }
}

/**
 * 2D flattening: apply vertical first, then horizontal.
 * Vertical pass smooths column-wise transitions (reduces horizontal banding).
 * Horizontal pass then merges row-wise for RLE optimization.
 * Can use different thresholds for each direction.
 */
function flatten2D(
  data: Buffer,
  width: number,
  height: number,
  hThreshold: number,
  vThreshold: number
): void {
  // Vertical first to unify colors across rows (reduces banding)
  if (vThreshold > 0) flattenVertical(data, width, height, vThreshold);
  // Horizontal second for RLE run length optimization
  if (hThreshold > 0) flattenHorizontal(data, width, height, hThreshold);
}

/**
 * Mode filter (majority vote): For each pixel, count palette colors in
 * a small neighborhood (radius R) and assign the most common one.
 * This creates natural-looking uniform regions without directional banding.
 */
function modeFilter(
  data: Buffer,
  width: number,
  height: number,
  palette: ColorInfo[],
  radius: number,
  iterations: number
): void {
  // First, create palette index map
  const idxMap = new Uint8Array(width * height);
  const alphaMap = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      alphaMap[y * width + x] = data[i + 3];
      if (data[i + 3] === 0) continue;
      idxMap[y * width + x] = findNearest(data[i], data[i + 1], data[i + 2], palette);
    }
  }

  const newIdxMap = new Uint8Array(width * height);
  const counts = new Uint16Array(palette.length);

  for (let iter = 0; iter < iterations; iter++) {
    newIdxMap.set(idxMap);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        if (alphaMap[pos] === 0) continue;

        // Count colors in neighborhood
        counts.fill(0);
        let total = 0;
        const yMin = Math.max(0, y - radius);
        const yMax = Math.min(height - 1, y + radius);
        const xMin = Math.max(0, x - radius);
        const xMax = Math.min(width - 1, x + radius);

        for (let ny = yMin; ny <= yMax; ny++) {
          for (let nx = xMin; nx <= xMax; nx++) {
            const npos = ny * width + nx;
            if (alphaMap[npos] === 0) continue;
            counts[idxMap[npos]]++;
            total++;
          }
        }

        if (total === 0) continue;

        // Find most common color
        let maxCount = 0, maxIdx = idxMap[pos];
        for (let c = 0; c < palette.length; c++) {
          if (counts[c] > maxCount) {
            maxCount = counts[c];
            maxIdx = c;
          }
        }
        newIdxMap[pos] = maxIdx;
      }
    }

    idxMap.set(newIdxMap);
  }

  // Write back to data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const idx = idxMap[y * width + x];
      data[i] = palette[idx].r;
      data[i + 1] = palette[idx].g;
      data[i + 2] = palette[idx].b;
    }
  }
}

/**
 * Weighted mode filter: instead of simple majority, weight neighbors by
 * color similarity to the center pixel. This preserves edges better.
 */
function weightedModeFilter(
  data: Buffer,
  width: number,
  height: number,
  palette: ColorInfo[],
  radius: number,
  similarityThreshold: number,
  iterations: number
): void {
  const idxMap = new Uint8Array(width * height);
  const alphaMap = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      alphaMap[y * width + x] = data[i + 3];
      if (data[i + 3] === 0) continue;
      idxMap[y * width + x] = findNearest(data[i], data[i + 1], data[i + 2], palette);
    }
  }

  const newIdxMap = new Uint8Array(width * height);
  const weights = new Float32Array(palette.length);

  for (let iter = 0; iter < iterations; iter++) {
    newIdxMap.set(idxMap);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        if (alphaMap[pos] === 0) continue;

        const centerIdx = idxMap[pos];
        const cR = palette[centerIdx].r, cG = palette[centerIdx].g, cB = palette[centerIdx].b;

        weights.fill(0);
        const yMin = Math.max(0, y - radius);
        const yMax = Math.min(height - 1, y + radius);
        const xMin = Math.max(0, x - radius);
        const xMax = Math.min(width - 1, x + radius);

        for (let ny = yMin; ny <= yMax; ny++) {
          for (let nx = xMin; nx <= xMax; nx++) {
            const npos = ny * width + nx;
            if (alphaMap[npos] === 0) continue;
            const nIdx = idxMap[npos];
            const nR = palette[nIdx].r, nG = palette[nIdx].g, nB = palette[nIdx].b;
            const dr = cR - nR, dg = cG - nG, db = cB - nB;
            const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
            // Only count if similar enough to center
            if (dist < similarityThreshold) {
              weights[nIdx] += 1.0;
            }
          }
        }

        // Find highest weight
        let maxW = 0, maxIdx = centerIdx;
        for (let c = 0; c < palette.length; c++) {
          if (weights[c] > maxW) {
            maxW = weights[c];
            maxIdx = c;
          }
        }
        newIdxMap[pos] = maxIdx;
      }
    }

    idxMap.set(newIdxMap);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const idx = idxMap[y * width + x];
      data[i] = palette[idx].r;
      data[i + 1] = palette[idx].g;
      data[i + 2] = palette[idx].b;
    }
  }
}

/**
 * Short run elimination:
 * After palette mapping, find runs shorter than minRun and merge them
 * into the longer adjacent run.
 */
function eliminateShortRuns(
  data: Buffer,
  width: number,
  height: number,
  minRun: number
): void {
  for (let y = 0; y < height; y++) {
    // Find runs in this row
    const runs: { start: number; length: number; r: number; g: number; b: number; a: number }[] = [];
    let runStart = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

      if (x === 0) {
        runs.push({ start: 0, length: 1, r, g, b, a });
        continue;
      }

      const last = runs[runs.length - 1];
      if (r === last.r && g === last.g && b === last.b && a === last.a) {
        last.length++;
      } else {
        runs.push({ start: x, length: 1, r, g, b, a });
      }
    }

    // Eliminate short runs (merge into longest neighbor)
    let changed = true;
    while (changed) {
      changed = false;
      for (let ri = 0; ri < runs.length; ri++) {
        const run = runs[ri];
        if (run.a === 0) continue; // Don't merge transparent
        if (run.length >= minRun) continue;

        // Find longer neighbor
        const prev = ri > 0 ? runs[ri - 1] : null;
        const next = ri < runs.length - 1 ? runs[ri + 1] : null;

        let mergeInto: typeof run | null = null;
        if (prev && prev.a !== 0 && next && next.a !== 0) {
          mergeInto = prev.length >= next.length ? prev : next;
        } else if (prev && prev.a !== 0) {
          mergeInto = prev;
        } else if (next && next.a !== 0) {
          mergeInto = next;
        }

        if (mergeInto) {
          // Replace this run's pixels with mergeInto's color
          for (let x = run.start; x < run.start + run.length; x++) {
            const i = (y * width + x) * 4;
            data[i] = mergeInto.r;
            data[i + 1] = mergeInto.g;
            data[i + 2] = mergeInto.b;
          }
          run.r = mergeInto.r;
          run.g = mergeInto.g;
          run.b = mergeInto.b;

          // Merge adjacent same-color runs
          if (ri > 0 && runs[ri - 1].r === run.r && runs[ri - 1].g === run.g && runs[ri - 1].b === run.b && runs[ri - 1].a === run.a) {
            runs[ri - 1].length += run.length;
            runs.splice(ri, 1);
            ri--;
          }
          if (ri < runs.length - 1 && runs[ri + 1].r === runs[ri].r && runs[ri + 1].g === runs[ri].g && runs[ri + 1].b === runs[ri].b && runs[ri + 1].a === runs[ri].a) {
            runs[ri].length += runs[ri + 1].length;
            runs.splice(ri + 1, 1);
          }
          changed = true;
        }
      }
    }
  }
}

interface TestConfig {
  label: string;
  resolution: number;
  paletteSize: number;
  // Mode filter settings (applied before palette mapping)
  mode: 'none' | 'flatten2d' | 'modeFilter' | 'weightedMode' | 'nearest';
  flattenH: number;            // For flatten2d
  flattenV: number;            // For flatten2d
  modeRadius: number;          // For modeFilter/weightedMode
  modeIterations: number;      // For modeFilter/weightedMode
  modeSimilarity: number;      // For weightedMode threshold
  minRunLength: number;        // Short run elimination after all processing
}

async function getAllSourceFiles() {
  const files: { inputPath: string; traitName: string; fileName: string }[] = [];
  for (const trait of TRAIT_DIRS) {
    const tp = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(tp)) continue;
    for (const file of fs.readdirSync(tp).filter(f => /\.png$/i.test(f))) {
      files.push({ inputPath: path.join(tp, file), traitName: trait.name, fileName: file.replace(/\.png$/i, '') });
    }
  }
  return files;
}

async function runTest(config: TestConfig) {
  const { label, resolution, paletteSize, mode, flattenH, flattenV, modeRadius, modeIterations, modeSimilarity, minRunLength } = config;
  const modeDesc = mode === 'flatten2d' ? `flatH=${flattenH},flatV=${flattenV}`
    : mode === 'modeFilter' ? `r=${modeRadius},iter=${modeIterations}`
    : mode === 'weightedMode' ? `r=${modeRadius},iter=${modeIterations},sim=${modeSimilarity}`
    : 'none';
  console.log(`\n🎨 ${label}: ${resolution}px, ${paletteSize}色, ${mode}(${modeDesc}), minRun=${minRunLength}`);

  if (resolution > 255) { console.log('  スキップ'); return null; }

  const outputDir = path.join(OUTPUT_BASE, label);
  await fs.promises.mkdir(outputDir, { recursive: true });
  const sourceFiles = await getAllSourceFiles();

  const kernel = mode === 'nearest' ? 'nearest' : 'lanczos3';

  // Step 1: Collect colors
  console.log(`  色収集 (${kernel})...`);
  const colorMap = new Map<string, ColorInfo>();
  for (const sf of sourceFiles) {
    const { data } = await sharp(sf.inputPath)
      .resize(resolution, resolution, { kernel, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      const ex = colorMap.get(key);
      if (ex) ex.count++; else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
  }

  // Step 2: Generate palette
  console.log(`  パレット (${colorMap.size}→${paletteSize})...`);
  const palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
  const paletteHex = palette.map(c =>
    `${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
  );

  // Step 3: Apply palette + flatten + eliminate short runs
  console.log('  パレット適用 + 平準化...');
  const processedFiles: { path: string; traitName: string; fileName: string }[] = [];
  for (let i = 0; i < sourceFiles.length; i++) {
    const sf = sourceFiles[i];
    const op = path.join(outputDir, `${sf.traitName}_${sf.fileName}.png`);

    const { data } = await sharp(sf.inputPath)
      .resize(resolution, resolution, { kernel, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    // Binarize alpha
    for (let j = 0; j < data.length; j += 4) {
      if (data[j + 3] < 128) { data[j] = 0; data[j + 1] = 0; data[j + 2] = 0; data[j + 3] = 0; continue; }
      data[j + 3] = 255;
    }

    // Pre-processing: flatten or filter
    if (mode === 'flatten2d') {
      // 2D flatten similar adjacent pixels BEFORE palette mapping
      flatten2D(data, resolution, resolution, flattenH, flattenV);
      // Map to palette
      for (let j = 0; j < data.length; j += 4) {
        if (data[j + 3] === 0) continue;
        const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
        data[j] = palette[idx].r; data[j + 1] = palette[idx].g; data[j + 2] = palette[idx].b;
      }
    } else if (mode === 'modeFilter') {
      // Map to palette first, then apply mode filter
      for (let j = 0; j < data.length; j += 4) {
        if (data[j + 3] === 0) continue;
        const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
        data[j] = palette[idx].r; data[j + 1] = palette[idx].g; data[j + 2] = palette[idx].b;
      }
      modeFilter(data, resolution, resolution, palette, modeRadius, modeIterations);
    } else if (mode === 'weightedMode') {
      // Map to palette first, then apply weighted mode filter
      for (let j = 0; j < data.length; j += 4) {
        if (data[j + 3] === 0) continue;
        const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
        data[j] = palette[idx].r; data[j + 1] = palette[idx].g; data[j + 2] = palette[idx].b;
      }
      weightedModeFilter(data, resolution, resolution, palette, modeRadius, modeSimilarity, modeIterations);
    } else {
      // No filter (or nearest mode), just map to palette
      for (let j = 0; j < data.length; j += 4) {
        if (data[j + 3] === 0) continue;
        const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
        data[j] = palette[idx].r; data[j + 1] = palette[idx].g; data[j + 2] = palette[idx].b;
      }
    }

    // Eliminate short runs AFTER palette mapping
    if (minRunLength > 1) {
      eliminateShortRuns(data, resolution, resolution, minRunLength);
    }

    await sharp(data, { raw: { width: resolution, height: resolution, channels: 4 } })
      .png({ compressionLevel: 9 }).toFile(op);
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

  // Step 5: SVG generation
  const testParts: any[] = [];
  const bestParts: any[] = [];
  for (const trait of TRAIT_DIRS) {
    const images = (nijiData.images as any)[trait.name];
    if (!images || images.length === 0) continue;
    const valid = images.filter((img: any) => img?.data);
    if (valid.length === 0) continue;
    testParts.push(valid[0]);
    bestParts.push(valid.reduce((a: any, b: any) => a.data.length > b.data.length ? a : b));
  }

  const svg = buildSVG(testParts, nijiData.palette, 'd5d7e1');
  const svgBest = buildSVG(bestParts, nijiData.palette, 'd5d7e1');
  const svgSize = Buffer.byteLength(svg);
  const svgBestSize = Buffer.byteLength(svgBest);
  const rects = (svg.match(/<rect /g) || []).length;
  const rectsBest = (svgBest.match(/<rect /g) || []).length;

  console.log(`  通常: SVG=${(svgSize / 1024).toFixed(0)}KB, ${rects}rects, ${(svgSize * 150 / 1e6).toFixed(1)}Mgas`);
  console.log(`  最大: SVG=${(svgBestSize / 1024).toFixed(0)}KB, ${rectsBest}rects, ${(svgBestSize * 150 / 1e6).toFixed(1)}Mgas`);

  // Save composite
  const compositeBest: any[] = [];
  for (const t of TRAIT_DIRS) {
    const files = processedFiles.filter(f => f.traitName === t.name);
    if (files.length === 0) continue;
    let bestFile = files[0], bestOp = 0;
    for (const f of files.slice(0, 10)) {
      const { data } = await sharp(f.path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let op = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 0) op++;
      if (op > bestOp) { bestOp = op; bestFile = f; }
    }
    compositeBest.push({ input: await sharp(bestFile.path).toBuffer(), top: 0, left: 0 });
  }
  const compPath = path.join(outputDir, 'composite_best.png');
  await sharp({ create: { width: resolution, height: resolution, channels: 4, background: { r: 213, g: 215, b: 225, alpha: 1 } } })
    .composite(compositeBest).png().toFile(compPath);
  const scale = Math.ceil(320 / resolution);
  await sharp(compPath).resize(resolution * scale, resolution * scale, { kernel: 'nearest' })
    .toFile(path.join(outputDir, 'composite_best_upscaled.png'));

  fs.writeFileSync(path.join(outputDir, 'sample_best.svg'), svgBest);

  return {
    label, resolution, paletteSize, mode, minRunLength,
    svgSize, svgBestSize, rects, rectsBest,
    gasNormal: svgSize * 150, gasMax: svgBestSize * 150,
  };
}

async function main() {
  console.log('=== 64px付近 最大品質テスト (v7) ===');
  console.log('nearest + フィルタなし + ラン除去なし で30M以内の最大品質\n');

  const d = { flattenH: 0, flattenV: 0, modeRadius: 0, modeIterations: 0, modeSimilarity: 0, minRunLength: 1 };

  const tests: TestConfig[] = [
    // ベースライン: 64×64 48色 = 29.8M ✅ (ユーザー評価済み)
    { label: '64_48c_nn',   resolution: 64, paletteSize: 48, mode: 'nearest', ...d },

    // 色数を増やす (64px固定)
    { label: '64_52c_nn',   resolution: 64, paletteSize: 52, mode: 'nearest', ...d },
    { label: '64_56c_nn',   resolution: 64, paletteSize: 56, mode: 'nearest', ...d },
    { label: '64_60c_nn',   resolution: 64, paletteSize: 60, mode: 'nearest', ...d },
    { label: '64_64c_nn',   resolution: 64, paletteSize: 64, mode: 'nearest', ...d },

    // 解像度を少し上げる (色数抑え)
    { label: '66_48c_nn',   resolution: 66, paletteSize: 48, mode: 'nearest', ...d },
    { label: '68_48c_nn',   resolution: 68, paletteSize: 48, mode: 'nearest', ...d },
    { label: '68_40c_nn',   resolution: 68, paletteSize: 40, mode: 'nearest', ...d },
    { label: '70_40c_nn',   resolution: 70, paletteSize: 40, mode: 'nearest', ...d },
    { label: '70_48c_nn',   resolution: 70, paletteSize: 48, mode: 'nearest', ...d },
  ];

  const results: any[] = [];
  for (const t of tests) {
    const r = await runTest(t);
    if (r) results.push(r);
  }

  console.log('\n\n========================================');
  console.log('=== 最大品質結果 ===');
  console.log('========================================\n');
  console.log('テスト           | px  | 色数 | rects通常 | rects最大 | ガス通常 | ガス最大 | 判定');
  console.log('-----------------|-----|------|---------|---------|---------|---------|-----');

  for (const r of results) {
    const v = r.gasMax < 30e6 ? '✅' : r.gasNormal < 30e6 ? '⚠️' : '❌';
    console.log(
      `${r.label.padEnd(16)} | ${r.resolution.toString().padStart(3)} | ${r.paletteSize.toString().padStart(4)} | ${r.rects.toString().padStart(7)} | ${r.rectsBest.toString().padStart(7)} | ${(r.gasNormal / 1e6).toFixed(1).padStart(6)}M | ${(r.gasMax / 1e6).toFixed(1).padStart(6)}M | ${v}`
    );
  }
}

main().catch(console.error);
