/**
 * High-resolution PNG embed test (192-320px)
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BASE_DIR = './images_niji';
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

async function testResolution(resolution: number, paletteSize: number) {
  const label = `${resolution}_${paletteSize}c_lc`;
  console.log(`\n=== ${label}: ${resolution}px, ${paletteSize}色, lanczos3 ===`);

  const sourceFiles = await getAllSourceFiles();

  // Palette
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
  const palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);

  const traitSizes: Map<string, number[]> = new Map();

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

    const sizes = traitSizes.get(sf.traitName) || [];
    sizes.push(pngBuf.length);
    traitSizes.set(sf.traitName, sizes);
  }

  const imgTagOverhead = 80; // <image href="data:image/png;base64," width="320" height="320"/>
  const svgOverhead = 120;
  let normalTotal = svgOverhead;
  let maxTotal = svgOverhead;

  for (const trait of COMPOSITE_ORDER) {
    const sizes = traitSizes.get(trait);
    if (!sizes || sizes.length === 0) continue;
    const max = Math.max(...sizes);
    const median = sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)];
    normalTotal += imgTagOverhead + Math.ceil((median * 4) / 3);
    maxTotal += imgTagOverhead + Math.ceil((max * 4) / 3);
  }

  const gasNormal = normalTotal * 150;
  const gasMax = maxTotal * 150;
  const v = gasMax < 30e6 ? '✅' : '⚠️';
  console.log(
    `  SVG通常: ${(normalTotal / 1024).toFixed(1)}KB → ${(gasNormal / 1e6).toFixed(1)}M gas`,
  );
  console.log(
    `  SVG最大: ${(maxTotal / 1024).toFixed(1)}KB → ${(gasMax / 1e6).toFixed(1)}M gas ${v}`,
  );

  return { label, resolution, paletteSize, normalTotal, maxTotal, gasNormal, gasMax };
}

async function main() {
  console.log('=== 高解像度PNG埋め込みテスト ===\n');

  const results: any[] = [];
  for (const t of [
    { res: 192, pal: 128 },
    { res: 224, pal: 128 },
    { res: 240, pal: 128 },
    { res: 256, pal: 128 },
    { res: 256, pal: 256 },
    { res: 320, pal: 128 },
    { res: 320, pal: 256 },
  ]) {
    results.push(await testResolution(t.res, t.pal));
  }

  console.log('\n\n========================================');
  console.log('=== 高解像度PNG結果 ===');
  console.log('========================================\n');
  console.log('テスト              | SVG通常  | SVG最大  | ガス通常 | ガス最大 | 判定');
  console.log('--------------------|---------|---------|---------|---------|-----');
  for (const r of results) {
    const v = r.gasMax < 30e6 ? '✅' : r.gasNormal < 30e6 ? '⚠️' : '❌';
    console.log(
      `${r.label.padEnd(19)} | ${(r.normalTotal / 1024).toFixed(0).padStart(6)}KB | ${(r.maxTotal / 1024).toFixed(0).padStart(6)}KB | ${(r.gasNormal / 1e6).toFixed(1).padStart(6)}M | ${(r.gasMax / 1e6).toFixed(1).padStart(6)}M | ${v}`,
    );
  }
}

main().catch(console.error);
