/**
 * Niji PNG quality comparison bake.
 *
 * Generates 5 bodies × 7 encode patterns of composite NFT images for visual
 * comparison. Output is written to docs/quality-comparison/ as an HTML viewer
 * plus per-pattern PNG layers and composites.
 *
 * Run: pnpm exec tsx scripts/encode-niji-png.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import sharp from 'sharp';
import {
  type ColorInfo,
  type NijiTraitDef,
  NIJI_TRAITS,
  NIJI_COMPOSITE_ORDER,
  SSTORE2_CAP_BYTES,
  buildGlobalPalette,
  medianCut,
  applyPaletteInPlace,
  resizeToRGBA,
  enforceSstore2Cap,
  listTraitFiles,
} from './niji-encoder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../_archive/work/quality-test/source');
const OUT_DIR = path.resolve(__dirname, '../../../docs/quality-comparison');

interface PatternConfig {
  id: string;
  label: string;
  resolution: number;
  paletteMode: 'per-image-256' | 'fullcolor' | 'global-256';
  postProcess: 'none' | 'oxipng' | 'pngquant' | 'pngquant+oxipng';
}

interface BodyDef {
  id: string;
  label: string;
  description: string;
  selector: 'worst' | 'best' | 'median' | 'random';
  randomSeed?: number;
}

const PATTERNS: PatternConfig[] = [
  { id: 'P1_320_perimage',         label: '320 / per-image 256 (現production)',  resolution: 320, paletteMode: 'per-image-256', postProcess: 'none' },
  { id: 'P2_512_perimage',         label: '512 / per-image 256',                 resolution: 512, paletteMode: 'per-image-256', postProcess: 'none' },
  { id: 'P3_512_fullcolor',        label: '512 / フルカラー',                    resolution: 512, paletteMode: 'fullcolor',     postProcess: 'none' },
  { id: 'P4_512_global',           label: '512 / global 256 (全layer共通)',      resolution: 512, paletteMode: 'global-256',   postProcess: 'none' },
  { id: 'P5_512_perimage_oxipng',  label: '512 / per-image 256 + oxipng',        resolution: 512, paletteMode: 'per-image-256', postProcess: 'oxipng' },
  { id: 'P6_512_global_pngquant',  label: '512 / global 256 + pngquant+oxipng',  resolution: 512, paletteMode: 'global-256',   postProcess: 'pngquant+oxipng' },
  { id: 'P7_768_global_oxipng',    label: '768 / global 256 + oxipng',           resolution: 768, paletteMode: 'global-256',   postProcess: 'oxipng' },
];

const BODIES: BodyDef[] = [
  { id: 'B1_worst',  label: '#1 worst case',  description: '各カテゴリ最重 file',                    selector: 'worst'  },
  { id: 'B2_best',   label: '#2 best case',   description: '各カテゴリ最軽 file (empty除く)',         selector: 'best'   },
  { id: 'B3_median', label: '#3 median',      description: '各カテゴリ file 中央値',                  selector: 'median' },
  { id: 'B4_randA',  label: '#4 random A',    description: 'seed 42',                                selector: 'random', randomSeed: 42 },
  { id: 'B5_randB',  label: '#5 random B',    description: 'seed 1729',                              selector: 'random', randomSeed: 1729 },
];

interface SelectedFile {
  traitId: number;
  name: string;
  dir: string;
  filename: string;
  inputPath: string;
  origSizeKb: number;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function selectBody(body: BodyDef): SelectedFile[] {
  const rng = body.selector === 'random' ? mulberry32(body.randomSeed ?? 42) : null;
  const selected: SelectedFile[] = [];
  for (const t of NIJI_TRAITS) {
    const files = listTraitFiles(path.join(SOURCE_DIR, t.dir));
    if (files.length === 0) continue;
    let pick;
    if (body.selector === 'worst') {
      pick = [...files].sort((a, b) => b.sizeB - a.sizeB)[0];
    } else if (body.selector === 'best') {
      pick = [...files].sort((a, b) => a.sizeB - b.sizeB)[0];
    } else if (body.selector === 'median') {
      const sorted = [...files].sort((a, b) => a.sizeB - b.sizeB);
      pick = sorted[Math.floor(sorted.length / 2)];
    } else {
      pick = files[Math.floor((rng?.() ?? 0) * files.length)];
    }
    selected.push({
      traitId: t.id,
      name: t.name,
      dir: t.dir,
      filename: pick.filename,
      inputPath: path.join(SOURCE_DIR, t.dir, pick.filename),
      origSizeKb: Number((pick.sizeB / 1024).toFixed(2)),
    });
  }
  return selected;
}

async function encodePatternLayer(
  inputPath: string,
  pattern: PatternConfig,
  globalPalette: ColorInfo[] | null,
  tmpDir: string,
): Promise<Buffer> {
  const { data } = await resizeToRGBA(inputPath, pattern.resolution);

  let pngBuf: Buffer;
  if (pattern.paletteMode === 'fullcolor') {
    pngBuf = await sharp(data, { raw: { width: pattern.resolution, height: pattern.resolution, channels: 4 } })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
  } else {
    let palette: ColorInfo[];
    if (pattern.paletteMode === 'global-256') {
      if (!globalPalette) throw new Error('globalPalette required');
      palette = globalPalette;
    } else {
      const colorMap = new Map<string, ColorInfo>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        const ex = colorMap.get(key);
        if (ex) ex.count++;
        else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
      }
      palette = medianCut(Array.from(colorMap.values()), 256);
      if (palette.length === 0) palette = [{ r: 0, g: 0, b: 0, count: 1 }];
    }
    applyPaletteInPlace(data, palette);
    pngBuf = await sharp(data, { raw: { width: pattern.resolution, height: pattern.resolution, channels: 4 } })
      .png({ compressionLevel: 9, palette: true, colors: 256 })
      .toBuffer();
  }

  if (pattern.postProcess !== 'none') {
    const tmpFile = path.join(tmpDir, `tmp_${Math.random().toString(36).slice(2)}.png`);
    fs.writeFileSync(tmpFile, pngBuf);
    if (pattern.postProcess.includes('pngquant')) {
      try {
        execFileSync('pngquant', ['--quality=85-100', '--speed=1', '--strip', '--force',
          '--output', tmpFile, tmpFile], { stdio: ['ignore', 'ignore', 'pipe'] });
      } catch (e) { /* ignore */ }
    }
    if (pattern.postProcess.includes('oxipng')) {
      try {
        execFileSync('oxipng', ['-o', '6', '--strip', 'safe', '--alpha', tmpFile],
          { stdio: ['ignore', 'ignore', 'pipe'] });
      } catch (e) { /* ignore */ }
    }
    pngBuf = fs.readFileSync(tmpFile);
    fs.unlinkSync(tmpFile);
  }

  return enforceSstore2Cap(pngBuf, { tmpDir, label: path.basename(inputPath) });
}

async function compositeLayers(layerBufs: Map<number, Buffer>, resolution: number): Promise<Buffer> {
  const base = sharp({
    create: {
      width: resolution, height: resolution, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
  const composites = NIJI_COMPOSITE_ORDER.map(traitId => layerBufs.get(traitId))
    .filter((b): b is Buffer => Boolean(b))
    .map(input => ({ input, top: 0, left: 0 }));
  return await base.composite(composites).png({ compressionLevel: 9 }).toBuffer();
}

interface PatternResult {
  totalKb: number;
  compositeKb: number;
  layers: { traitId: number; name: string; kb: number }[];
}

async function bakePatternForBody(
  pattern: PatternConfig,
  selected: SelectedFile[],
  bodyOutDir: string,
  tmpDir: string,
): Promise<PatternResult> {
  const patternDir = path.join(bodyOutDir, pattern.id);
  fs.mkdirSync(path.join(patternDir, 'layers'), { recursive: true });

  let globalPalette: ColorInfo[] | null = null;
  if (pattern.paletteMode === 'global-256') {
    globalPalette = await buildGlobalPalette(
      selected.map(s => s.inputPath),
      pattern.resolution,
    );
  }

  const layerBufs = new Map<number, Buffer>();
  const layers: { traitId: number; name: string; kb: number }[] = [];
  for (const s of selected) {
    const buf = await encodePatternLayer(s.inputPath, pattern, globalPalette, tmpDir);
    const dst = path.join(patternDir, 'layers', `${s.traitId.toString().padStart(2, '0')}_${s.name}.png`);
    fs.writeFileSync(dst, buf);
    layerBufs.set(s.traitId, buf);
    layers.push({ traitId: s.traitId, name: s.name, kb: Number((buf.length / 1024).toFixed(2)) });
  }

  const composite = await compositeLayers(layerBufs, pattern.resolution);
  fs.writeFileSync(path.join(patternDir, 'composite.png'), composite);
  const totalKb = layers.reduce((acc, l) => acc + l.kb, 0);
  return { totalKb: Number(totalKb.toFixed(2)), compositeKb: Number((composite.length / 1024).toFixed(2)), layers };
}

async function bakeOriginalForBody(selected: SelectedFile[], bodyOutDir: string) {
  const origDir = path.join(bodyOutDir, 'P0_original');
  fs.mkdirSync(path.join(origDir, 'layers'), { recursive: true });

  const firstMeta = await sharp(selected[0].inputPath).metadata();
  const canonicalRes = firstMeta.width ?? 512;

  const layerBufs = new Map<number, Buffer>();
  let totalKb = 0;
  for (const s of selected) {
    const padded = await sharp(s.inputPath)
      .resize(canonicalRes, canonicalRes, {
        kernel: 'lanczos3', fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer();
    const dst = path.join(origDir, 'layers', `${s.traitId.toString().padStart(2, '0')}_${s.name}.png`);
    fs.writeFileSync(dst, padded);
    layerBufs.set(s.traitId, padded);
    totalKb += s.origSizeKb;
  }
  const composite = await compositeLayers(layerBufs, canonicalRes);
  fs.writeFileSync(path.join(origDir, 'composite.png'), composite);
  return { totalKb: Number(totalKb.toFixed(2)), compositeKb: Number((composite.length / 1024).toFixed(2)), canonicalRes };
}

interface BodyResult {
  body: BodyDef;
  selected: SelectedFile[];
  original: { totalKb: number; compositeKb: number; canonicalRes: number };
  patterns: Record<string, PatternResult>;
}

async function main() {
  console.log('=== Niji 5-Body × 7-Pattern Composite Comparison ===');
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = path.join(OUT_DIR, '.tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  const bodyResults: BodyResult[] = [];
  for (const body of BODIES) {
    console.log(`\n========== ${body.label} (${body.description}) ==========`);
    const bodyOutDir = path.join(OUT_DIR, body.id);
    fs.mkdirSync(bodyOutDir, { recursive: true });

    const selected = selectBody(body);
    for (const s of selected) {
      console.log(`  pick ${s.name.padEnd(16)} : ${s.filename}  (${s.origSizeKb}KB)`);
    }
    const original = await bakeOriginalForBody(selected, bodyOutDir);
    console.log(`  P0 original : raw sum ${original.totalKb}KB / composite ${original.compositeKb}KB / ${original.canonicalRes}px`);

    const patterns: Record<string, PatternResult> = {};
    for (const p of PATTERNS) {
      process.stdout.write(`  [${p.id}] ${p.label.padEnd(50)} ... `);
      const r = await bakePatternForBody(p, selected, bodyOutDir, tmpDir);
      console.log(`total ${r.totalKb}KB (composite ${r.compositeKb}KB)`);
      patterns[p.id] = r;
    }
    bodyResults.push({ body, selected, original, patterns });
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    compositeOrder: NIJI_COMPOSITE_ORDER,
    traits: NIJI_TRAITS,
    patterns: PATTERNS,
    bodies: bodyResults.map(b => ({
      body: b.body,
      selected: b.selected,
      original: b.original,
      patterns: Object.fromEntries(Object.entries(b.patterns).map(([k, v]) => [k, v])),
    })),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), renderHtml(summary));
  console.log(`\nDone. Open ${path.join(OUT_DIR, 'index.html')} in browser.`);
}

interface Summary {
  generatedAt: string;
  compositeOrder: number[];
  traits: NijiTraitDef[];
  patterns: PatternConfig[];
  bodies: {
    body: BodyDef;
    selected: SelectedFile[];
    original: { totalKb: number; compositeKb: number; canonicalRes: number };
    patterns: Record<string, PatternResult>;
  }[];
}

function renderHtml(s: Summary): string {
  const orderHuman = NIJI_COMPOSITE_ORDER.map(id => {
    const t = NIJI_TRAITS.find(t => t.id === id);
    return t ? `${t.name}(${id})` : `?(${id})`;
  }).join(' → ');

  const sumHead =
    `<tr><th>body</th><th>P0 元</th>` +
    s.patterns.map(p => `<th>${p.id}<br><small>${p.label}</small></th>`).join('') +
    `</tr>`;
  const sumRows = s.bodies.map(b => {
    const cells = s.patterns.map(p => {
      const v = b.patterns[p.id]?.totalKb ?? '-';
      return `<td><b>${v}</b>KB</td>`;
    }).join('');
    return `<tr><th>${b.body.label}<br><small>${b.body.description}</small></th><td>raw ${b.original.totalKb}KB</td>${cells}</tr>`;
  }).join('\n');

  const bodySections = s.bodies.map(b => {
    const compositeCells =
      `<td><div class="lbl">P0 元</div><div class="sub">${b.original.canonicalRes}px raw</div><div class="kb">raw ${b.original.totalKb}KB</div><img src="${b.body.id}/P0_original/composite.png"></td>` +
      s.patterns.map(p => {
        const r = b.patterns[p.id];
        return `<td><div class="lbl">${p.id}</div><div class="sub">${p.label}</div><div class="kb">12layer <b>${r.totalKb}KB</b></div><img src="${b.body.id}/${p.id}/composite.png"></td>`;
      }).join('');
    return `
<h3>${b.body.label} — ${b.body.description}</h3>
<table class="composite">
<tbody><tr>${compositeCells}</tr></tbody>
</table>`;
  }).join('\n');

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Niji 5-Body × 7-Pattern Quality Comparison</title>
<style>
body { font-family: -apple-system, sans-serif; background: #0d0d0d; color: #eee; margin: 0; padding: 16px; line-height: 1.5; }
h1 { margin: 0 0 8px; font-size: 18px; }
h2 { margin: 28px 0 8px; font-size: 16px; color: #ffcc66; border-bottom: 1px solid #333; padding-bottom: 4px; }
h3 { margin: 20px 0 8px; font-size: 14px; color: #66ddff; }
.meta { color: #888; font-size: 12px; margin-bottom: 16px; }
.order { background: #1a1a1a; padding: 8px 12px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 11px; color: #aaf; word-break: break-all; }
table { border-collapse: collapse; width: 100%; margin-top: 8px; }
th, td { border: 1px solid #2a2a2a; padding: 6px; text-align: center; vertical-align: top; background: #161616; font-size: 12px; }
th { background: #1f1f1f; font-weight: 600; }
.summary td, .summary th { font-size: 11px; }
.composite img { width: 300px; height: 300px; object-fit: contain; background: repeating-conic-gradient(#333 0% 25%, #2a2a2a 0% 50%) 50% / 14px 14px; image-rendering: pixelated; display: block; margin: 4px auto; }
.lbl { font-size: 11px; color: #ffcc66; font-weight: 600; }
.sub { font-size: 10px; color: #999; }
.kb { font-size: 11px; color: #66ccff; margin: 4px 0; }
small { color: #888; font-weight: 400; }
b { color: #ffaa66; }
</style>
</head>
<body>
<h1>Niji 5-Body × 7-Pattern Quality Comparison</h1>
<div class="meta">generated ${s.generatedAt}</div>
<h2>重ね順 (下 → 上)</h2>
<div class="order">${orderHuman}</div>
<h2>サマリ表 (12 layer 合計 KB)</h2>
<table class="summary">
<thead>${sumHead}</thead>
<tbody>${sumRows}</tbody>
</table>
<h2>各体の合成最終画</h2>
${bodySections}
</body>
</html>`;
}

main().catch(e => { console.error(e); process.exit(1); });
