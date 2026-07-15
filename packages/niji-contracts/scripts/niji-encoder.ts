/**
 * Niji P6 encoder library.
 *
 * Encoding pipeline (P6 = 512×512 / global 256 palette + pngquant + oxipng):
 *   1. sharp resize 512×512 (lanczos3, alpha binary 0/255)
 *   2. global 256-color palette built across all 561+ source images
 *   3. nearest-color quantize per pixel
 *   4. sharp PNG (compressionLevel=9, palette=true, colors=256)
 *   5. pngquant (quality 85-100, strip)
 *   6. oxipng (-o 6, --strip safe, --alpha)
 *   7. SSTORE2 23KB cap enforcement (progressive quality / colors reduction)
 *
 * Exports core encoding functions for reuse by:
 *   - scripts/encode-niji-png.ts (CLI bake for quality comparison)
 *   - tasks/deploy-niji-*.ts (hardhat deploy tasks)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import sharp from 'sharp';

/**
 * SSTORE2 (EIP-170) micro contract hard limit: 24,576 bytes.
 *
 * We target 16KB to leave headroom AND fit within Blockscout / Etherscan
 * display caps for data URI tokenURI (~200KB total). With 12 layers all
 * at 16KB, the worst-case tokenURI lands around 194KB which renders on
 * all major block explorers.
 *
 * Visual quality is preserved: P6 (global 256 palette + pngquant + oxipng)
 * compresses cleanly to 16KB on every trait without perceptible loss
 * (see docs/hair-cap-experiment for the 23/20/18/16KB comparison).
 */
export const SSTORE2_CAP_BYTES = 16 * 1024;

/** P6 production target resolution */
export const NIJI_RESOLUTION = 512;

/** P6 production target palette size */
export const NIJI_PALETTE_SIZE = 256;

/** Trait definition matching INijiSeeder / NijiArt contract */
export interface NijiTraitDef {
  id: number;
  name: string;
  dir: string;
}

/** Canonical 12 trait categories (id 0-11) */
export const NIJI_TRAITS: NijiTraitDef[] = [
  { id: 0,  name: 'special',         dir: '01_スペシャル' },
  { id: 1,  name: 'choker',          dir: '02_チョーカー' },
  { id: 2,  name: 'headphone',       dir: '03_ヘッドホン' },
  { id: 3,  name: 'leftHand',        dir: '04_左手' },
  { id: 4,  name: 'hat',             dir: '05_帽子' },
  { id: 5,  name: 'clothing',        dir: '06_服' },
  { id: 6,  name: 'ear',             dir: '07_耳' },
  { id: 7,  name: 'back',            dir: '08_背中' },
  { id: 8,  name: 'backDecoration',  dir: '09_背中の装飾' },
  { id: 9,  name: 'background',      dir: '10_背景' },
  { id: 10, name: 'solidBackground', dir: '11_背景単色' },
  { id: 11, name: 'hair',            dir: '12_髪の毛' },
];

/**
 * COMPOSITE_ORDER (下 → 上) matches NijiDescriptor.sol's SVG <image> emission order.
 *
 * 完璧仕様 = 12 trait 全てを user が視認できる + variation 豊富な trait を前面配置。
 *
 * user 指定 (Issue #3113) = special(0) を **最前面 (12 位)** に配置、
 * special が他全 trait を覆う overlay として最も強く見える layer。 意思決定は
 * dev only preview HTML (Issue #3110) で 12 position の視覚比較で確定。
 * それ以前の user 指定 (Issue #3066) では special を 8 位 / choker を 9 位、
 * 今回の変更で special を choker / hat / hair / headphone より前面に移動。
 *
 * 描画順序 (下 layer → 上 layer)。
 *   1. solidBackground(10) ... 42 通り、 背景単色 (最背面)
 *   2. background(9)       ... 25 通り、 背景 pattern
 *   3. backDecoration(8)   ... 12 通り、 背中装飾
 *   4. back(7)             ... 2 通り (少)、 胴体後面
 *   5. leftHand(3)         ... 13 通り、 左手 / 武器 (clothing 背面)
 *   6. clothing(5)         ... 166 通り、 服 (胴体前面 + 手を隠す)
 *   7. ear(6)              ... 3 通り (少)、 顔サイド
 *   8. choker(1)           ... 4 通り (少)、 首元 overlay
 *   9. hat(4)              ... 32 通り、 帽子 (頭上部)
 *   10. hair(11)           ... 235 通り、 髪 (hat 上、 最も variation 豊富)
 *   11. headphone(2)       ... 14 通り、 ヘッドホン
 *   12. special(0)         ... 2 通り (少)、 エフェクト overlay (最前面、 他 trait を覆う)
 */
export const NIJI_COMPOSITE_ORDER = [10, 9, 8, 7, 3, 5, 6, 1, 4, 11, 2, 0];

export interface ColorInfo {
  r: number;
  g: number;
  b: number;
  count: number;
}

// ---------- palette utilities ----------

function colorDistSq(a: ColorInfo, b: ColorInfo) {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

/** Median-cut quantization to reduce a color set to targetSize representative colors */
export function medianCut(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  const sample =
    colors.length > 50000 ? [...colors].sort((a, b) => b.count - a.count).slice(0, 50000) : colors;
  let buckets: ColorInfo[][] = [sample];
  while (buckets.length < targetSize) {
    let bi = 0, bs = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length > bs) { bs = buckets[i].length; bi = i; }
    }
    if (bs < 2) break;
    const b = buckets[bi];
    let rmin = 255, rmax = 0, gmin = 255, gmax = 0, bmin = 255, bmax = 0;
    for (const c of b) {
      if (c.r < rmin) rmin = c.r;
      if (c.r > rmax) rmax = c.r;
      if (c.g < gmin) gmin = c.g;
      if (c.g > gmax) gmax = c.g;
      if (c.b < bmin) bmin = c.b;
      if (c.b > bmax) bmax = c.b;
    }
    const ch = rmax - rmin >= gmax - gmin && rmax - rmin >= bmax - bmin
      ? 'r'
      : gmax - gmin >= bmax - bmin
        ? 'g'
        : 'b';
    b.sort((a, c) => a[ch] - c[ch]);
    const mid = Math.floor(b.length / 2);
    buckets.splice(bi, 1, b.slice(0, mid), b.slice(mid));
  }
  return buckets.map(b => {
    let tr = 0, tg = 0, tb = 0, tc = 0;
    for (const c of b) {
      tr += c.r * c.count;
      tg += c.g * c.count;
      tb += c.b * c.count;
      tc += c.count;
    }
    return { r: Math.round(tr / tc), g: Math.round(tg / tc), b: Math.round(tb / tc), count: tc };
  });
}

export function findNearestColor(r: number, g: number, b: number, palette: ColorInfo[]): number {
  let md = Infinity, mi = 0;
  for (let i = 0; i < palette.length; i++) {
    const d = colorDistSq({ r, g, b, count: 0 }, palette[i]);
    if (d < md) { md = d; mi = i; }
  }
  return mi;
}

// ---------- resize / quantize ----------

export async function resizeToRGBA(
  inputPath: string,
  resolution: number = NIJI_RESOLUTION,
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  return await sharp(inputPath)
    .resize(resolution, resolution, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

export function applyPaletteInPlace(data: Buffer, palette: ColorInfo[]): void {
  for (let j = 0; j < data.length; j += 4) {
    if (data[j + 3] < 128) {
      data[j] = 0; data[j + 1] = 0; data[j + 2] = 0; data[j + 3] = 0;
      continue;
    }
    data[j + 3] = 255;
    const idx = findNearestColor(data[j], data[j + 1], data[j + 2], palette);
    data[j] = palette[idx].r;
    data[j + 1] = palette[idx].g;
    data[j + 2] = palette[idx].b;
  }
}

/**
 * Build a global 256-color palette across all input images.
 * All images are sampled at the target resolution, alpha-binarized, and
 * fed into median-cut quantization.
 */
export async function buildGlobalPalette(
  inputPaths: string[],
  resolution: number = NIJI_RESOLUTION,
  paletteSize: number = NIJI_PALETTE_SIZE,
): Promise<ColorInfo[]> {
  const colorMap = new Map<string, ColorInfo>();
  for (const p of inputPaths) {
    const { data } = await resizeToRGBA(p, resolution);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      const ex = colorMap.get(key);
      if (ex) ex.count++;
      else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
  }
  return medianCut(Array.from(colorMap.values()), paletteSize);
}

// ---------- post-process (pngquant + oxipng) ----------

function runPngquant(file: string, quality: string, colors?: number) {
  const args = [
    `--quality=${quality}`, '--speed=1', '--strip', '--force',
    ...(colors ? [`${colors}`] : []),
    '--output', file, file,
  ];
  try {
    execFileSync('pngquant', args, { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (e) { /* exit 99 = no improvement, ignore */ }
}

function runOxipng(file: string, strip: 'safe' | 'all' = 'safe') {
  try {
    execFileSync('oxipng', ['-o', '6', '--strip', strip, '--alpha', file],
      { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (e) { /* ignore */ }
}

/**
 * Enforce the SSTORE2 23KB cap on an encoded PNG buffer.
 * Returns the original buffer if already within cap, otherwise progressively
 * lowers pngquant quality and palette size until it fits.
 */
export function enforceSstore2Cap(
  pngBuf: Buffer,
  options: { tmpDir?: string; label?: string; verbose?: boolean } = {},
): Buffer {
  if (pngBuf.length <= SSTORE2_CAP_BYTES) return pngBuf;

  const tmpDir = options.tmpDir ?? os.tmpdir();
  const label = options.label ?? 'layer';
  const verbose = options.verbose !== false;

  const tmpFile = path.join(tmpDir, `cap_${process.pid}_${Math.random().toString(36).slice(2)}.png`);
  fs.writeFileSync(tmpFile, pngBuf);

  const qualityRamp: [number, number][] = [
    [75, 90], [60, 80], [50, 70], [40, 60], [30, 50], [20, 40],
  ];
  for (const [lo, hi] of qualityRamp) {
    runPngquant(tmpFile, `${lo}-${hi}`);
    runOxipng(tmpFile, 'all');
    const cur = fs.readFileSync(tmpFile);
    if (cur.length <= SSTORE2_CAP_BYTES) {
      fs.unlinkSync(tmpFile);
      if (verbose) {
        console.warn(`    ⚠ cap-fit ${label}: ${(pngBuf.length / 1024).toFixed(1)}KB → ${(cur.length / 1024).toFixed(1)}KB (pngquant ${lo}-${hi})`);
      }
      return cur;
    }
  }
  for (const colors of [128, 96, 64, 48, 32]) {
    runPngquant(tmpFile, '10-40', colors);
    runOxipng(tmpFile, 'all');
    const cur = fs.readFileSync(tmpFile);
    if (cur.length <= SSTORE2_CAP_BYTES) {
      fs.unlinkSync(tmpFile);
      if (verbose) {
        console.warn(`    ⚠ cap-fit ${label}: ${(pngBuf.length / 1024).toFixed(1)}KB → ${(cur.length / 1024).toFixed(1)}KB (colors=${colors})`);
      }
      return cur;
    }
  }

  const final = fs.readFileSync(tmpFile);
  fs.unlinkSync(tmpFile);
  if (verbose) {
    console.error(`    ✗ cap-FAIL ${label}: ${(pngBuf.length / 1024).toFixed(1)}KB → ${(final.length / 1024).toFixed(1)}KB still > ${SSTORE2_CAP_BYTES / 1024}KB`);
  }
  return final;
}

// ---------- main encode (P6 production pipeline) ----------

export interface EncodeOptions {
  resolution?: number;
  paletteSize?: number;
  /** When provided, use this global palette instead of building a per-image one */
  globalPalette?: ColorInfo[];
  /** Apply pngquant + oxipng post-processing */
  postProcess?: boolean;
  /** Enforce SSTORE2 23KB cap */
  enforceCap?: boolean;
  tmpDir?: string;
  label?: string;
  verbose?: boolean;
}

/**
 * Encode a single layer image into the P6 production format.
 * Returns a PNG buffer ready for `NijiArt.addTraitImage()`.
 */
export async function encodeNijiLayer(
  inputPath: string,
  opts: EncodeOptions = {},
): Promise<Buffer> {
  const resolution = opts.resolution ?? NIJI_RESOLUTION;
  const paletteSize = opts.paletteSize ?? NIJI_PALETTE_SIZE;
  const postProcess = opts.postProcess !== false;
  const enforceCap = opts.enforceCap !== false;

  const { data } = await resizeToRGBA(inputPath, resolution);

  // Quantize with global or per-image palette
  let palette = opts.globalPalette;
  if (!palette) {
    const colorMap = new Map<string, ColorInfo>();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      const ex = colorMap.get(key);
      if (ex) ex.count++;
      else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
    }
    palette = medianCut(Array.from(colorMap.values()), paletteSize);
    if (palette.length === 0) palette = [{ r: 0, g: 0, b: 0, count: 1 }];
  }
  applyPaletteInPlace(data, palette);

  let pngBuf = await sharp(data, { raw: { width: resolution, height: resolution, channels: 4 } })
    .png({ compressionLevel: 9, palette: true, colors: paletteSize })
    .toBuffer();

  if (postProcess) {
    const tmpDir = opts.tmpDir ?? os.tmpdir();
    const tmpFile = path.join(tmpDir, `enc_${process.pid}_${Math.random().toString(36).slice(2)}.png`);
    fs.writeFileSync(tmpFile, pngBuf);
    runPngquant(tmpFile, '85-100');
    runOxipng(tmpFile, 'safe');
    pngBuf = fs.readFileSync(tmpFile);
    fs.unlinkSync(tmpFile);
  }

  if (enforceCap) {
    pngBuf = enforceSstore2Cap(pngBuf, {
      tmpDir: opts.tmpDir,
      label: opts.label ?? path.basename(inputPath),
      verbose: opts.verbose,
    });
  }

  return pngBuf;
}

// ---------- file selection helpers ----------

export interface FileMeta {
  filename: string;
  sizeB: number;
}

/** List all PNG files in a trait directory (excluding empty.png), sorted by name */
export function listTraitFiles(traitDirAbs: string): FileMeta[] {
  if (!fs.existsSync(traitDirAbs)) return [];
  return fs
    .readdirSync(traitDirAbs)
    .filter(f => /\.png$/i.test(f) && f !== 'empty.png')
    .map(f => ({ filename: f, sizeB: fs.statSync(path.join(traitDirAbs, f)).size }))
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

/** Pick N representative files: worst / median / best by file size */
export function pickRepresentative(files: FileMeta[], count: number): FileMeta[] {
  if (files.length <= count) return files;
  const sorted = [...files].sort((a, b) => b.sizeB - a.sizeB);
  if (count === 1) return [sorted[0]];
  if (count === 2) return [sorted[0], sorted[sorted.length - 1]];
  if (count === 3) {
    return [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
  }
  const picks: FileMeta[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (sorted.length - 1)) / (count - 1));
    picks.push(sorted[idx]);
  }
  return picks;
}
