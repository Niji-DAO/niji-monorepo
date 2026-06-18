/**
 * SSTORE2 cap experiment (worst case body).
 *
 * Re-encodes ALL 12 layers under different SSTORE2 caps
 * (23KB / 20KB / 18KB / 16KB) and composes each into a final image.
 *
 * Goal: find the smallest cap where the worst-case body's 12-layer
 * composite is still visually identical to P6 baseline, so the
 * tokenURI fits inside Blockscout's display cap (~200KB).
 *
 * Run: pnpm exec tsx scripts/encode-niji-hair-cap.ts
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import sharp from 'sharp';
import {
  type ColorInfo,
  NIJI_TRAITS,
  NIJI_COMPOSITE_ORDER,
  NIJI_RESOLUTION,
  buildGlobalPalette,
  encodeNijiLayer,
  enforceSstore2Cap,
  listTraitFiles,
} from './niji-encoder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOURCE_DIR = path.resolve(__dirname, '../_archive/work/quality-test/source');
const OUT_DIR = path.resolve(__dirname, '../../../docs/hair-cap-experiment');

const HAIR_TRAIT_ID = 11;

/** Pick the worst-case file per trait (heaviest in size) */
function selectWorstCase() {
  return NIJI_TRAITS.map(t => {
    const files = listTraitFiles(path.join(SOURCE_DIR, t.dir));
    const sorted = [...files].sort((a, b) => b.sizeB - a.sizeB);
    const pick = sorted[0];
    return {
      traitId: t.id,
      name: t.name,
      dir: t.dir,
      filename: pick.filename,
      inputPath: path.join(SOURCE_DIR, t.dir, pick.filename),
      origSizeKb: Number((pick.sizeB / 1024).toFixed(2)),
    };
  });
}

/** Force-shrink a PNG to a given size cap (in bytes) using pngquant + oxipng */
function shrinkTo(pngBuf: Buffer, capBytes: number, tmpDir: string, label: string): Buffer {
  if (pngBuf.length <= capBytes) return pngBuf;
  const tmpFile = path.join(tmpDir, `shrink_${process.pid}_${Math.random().toString(36).slice(2)}.png`);
  fs.writeFileSync(tmpFile, pngBuf);

  const qualityRamp: [number, number][] = [
    [75, 90], [60, 80], [50, 70], [40, 60], [30, 50], [20, 40], [10, 30],
  ];
  for (const [lo, hi] of qualityRamp) {
    try {
      execFileSync('pngquant', [`--quality=${lo}-${hi}`, '--speed=1', '--strip', '--force',
        '--output', tmpFile, tmpFile], { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {}
    try {
      execFileSync('oxipng', ['-o', '6', '--strip', 'all', '--alpha', tmpFile],
        { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {}
    const cur = fs.readFileSync(tmpFile);
    if (cur.length <= capBytes) {
      fs.unlinkSync(tmpFile);
      console.warn(`    ⚠ ${label}: → ${(cur.length / 1024).toFixed(1)}KB (q ${lo}-${hi})`);
      return cur;
    }
  }
  for (const colors of [128, 96, 64, 48, 32, 16]) {
    try {
      execFileSync('pngquant', ['--quality=5-30', '--speed=1', '--strip', '--force',
        `${colors}`, '--output', tmpFile, tmpFile],
        { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {}
    try {
      execFileSync('oxipng', ['-o', '6', '--strip', 'all', '--alpha', tmpFile],
        { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {}
    const cur = fs.readFileSync(tmpFile);
    if (cur.length <= capBytes) {
      fs.unlinkSync(tmpFile);
      console.warn(`    ⚠ ${label}: → ${(cur.length / 1024).toFixed(1)}KB (colors=${colors})`);
      return cur;
    }
  }
  const final = fs.readFileSync(tmpFile);
  fs.unlinkSync(tmpFile);
  console.error(`    ✗ ${label}: ${(final.length / 1024).toFixed(1)}KB still > ${capBytes / 1024}KB`);
  return final;
}

async function compositeLayers(layerBufs: Map<number, Buffer>, resolution: number): Promise<Buffer> {
  const base = sharp({
    create: { width: resolution, height: resolution, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });
  const composites = NIJI_COMPOSITE_ORDER.map(traitId => layerBufs.get(traitId))
    .filter((b): b is Buffer => Boolean(b))
    .map(input => ({ input, top: 0, left: 0 }));
  return await base.composite(composites).png({ compressionLevel: 9 }).toBuffer();
}

async function main() {
  console.log('=== hair cap experiment (worst case body) ===');
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = path.join(OUT_DIR, '.tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  const selected = selectWorstCase();
  console.log('selected (worst case):');
  for (const s of selected) console.log(`  ${s.name.padEnd(16)} ${s.filename} (${s.origSizeKb}KB)`);

  // Build global palette
  console.log('\nbuilding global palette...');
  const palette = await buildGlobalPalette(selected.map(s => s.inputPath), NIJI_RESOLUTION);

  // Encode all 12 layers with default P6 (23KB cap) once to get baseline buffers
  console.log('\nencoding 12 layers (P6 baseline, 23KB cap)...');
  const baseLayers = new Map<number, Buffer>();
  for (const s of selected) {
    const buf = await encodeNijiLayer(s.inputPath, { globalPalette: palette, label: s.name });
    baseLayers.set(s.traitId, buf);
  }
  for (const s of selected) {
    console.log(`  ${s.name.padEnd(16)} : ${(baseLayers.get(s.traitId)!.length / 1024).toFixed(2)}KB`);
  }

  // For each cap, shrink EVERY layer (not just hair) and recompose
  const caps = [23 * 1024, 20 * 1024, 18 * 1024, 16 * 1024];
  const results = [];
  for (const capBytes of caps) {
    console.log(`\n[cap ${capBytes / 1024}KB] — applied to all 12 layers`);
    const layers = new Map<number, Buffer>();
    for (const s of selected) {
      const baseBuf = baseLayers.get(s.traitId)!;
      const shrunk = baseBuf.length > capBytes
        ? shrinkTo(baseBuf, capBytes, tmpDir, `${s.name}@${capBytes / 1024}KB`)
        : baseBuf;
      layers.set(s.traitId, shrunk);
    }
    const composite = await compositeLayers(layers, NIJI_RESOLUTION);

    const dirName = `cap_${(capBytes / 1024).toString().padStart(2, '0')}KB`;
    const capDir = path.join(OUT_DIR, dirName);
    fs.mkdirSync(path.join(capDir, 'layers'), { recursive: true });
    for (const s of selected) {
      fs.writeFileSync(
        path.join(capDir, 'layers', `${s.traitId.toString().padStart(2, '0')}_${s.name}.png`),
        layers.get(s.traitId)!,
      );
    }
    fs.writeFileSync(path.join(capDir, 'composite.png'), composite);

    const totalKb = Array.from(layers.values()).reduce((a, b) => a + b.length, 0) / 1024;
    const svgEstimateKb = (totalKb * 4 / 3 + 1);
    const uriEstimateKb = svgEstimateKb * 4 / 3 + 1;
    const hairKb = layers.get(HAIR_TRAIT_ID)!.length / 1024;

    results.push({
      capKb: capBytes / 1024,
      dirName,
      hairKb: Number(hairKb.toFixed(2)),
      total12LayerKb: Number(totalKb.toFixed(2)),
      svgEstimateKb: Number(svgEstimateKb.toFixed(1)),
      uriEstimateKb: Number(uriEstimateKb.toFixed(1)),
    });
    console.log(`  total12layer ${totalKb.toFixed(2)}KB, est tokenURI ${uriEstimateKb.toFixed(1)}KB`);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // HTML output
  const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<title>Hair Cap Experiment (worst case)</title>
<style>
body { font-family:-apple-system,sans-serif; background:#0d0d0d; color:#eee; margin:0; padding:16px; }
h1 { font-size:18px; margin:0 0 8px; }
.meta { color:#888; font-size:12px; margin-bottom:16px; }
table { border-collapse:collapse; width:100%; margin-top:16px; }
th, td { border:1px solid #2a2a2a; padding:8px; text-align:center; vertical-align:top; background:#161616; font-size:12px; }
th { background:#1f1f1f; }
.lbl { font-size:12px; color:#ffcc66; font-weight:600; margin-bottom:4px; }
.kb { font-size:11px; color:#66ccff; margin:4px 0; }
.hair { width:140px; height:140px; object-fit:contain; background:repeating-conic-gradient(#333 0% 25%, #2a2a2a 0% 50%) 50% / 12px 12px; display:block; margin:4px auto; }
.composite { width:300px; height:300px; object-fit:contain; background:repeating-conic-gradient(#333 0% 25%, #2a2a2a 0% 50%) 50% / 14px 14px; display:block; margin:4px auto; }
b { color:#ffaa66; }
.warn { color:#ff6666; font-weight:600; }
.ok { color:#66ff66; font-weight:600; }
</style></head><body>
<h1>Hair cap experiment (worst case body)</h1>
<div class="meta">caps 23KB / 18KB / 14KB / 10KB を hair に当てた時の 12 layer 合成画と tokenURI 推定値を比較</div>
<table>
<thead><tr>
  <th>cap (全12layer適用)</th>
  <th>composite (worst case)</th>
  <th>hair KB</th>
  <th>12layer total</th>
  <th>tokenURI 推定</th>
  <th>Blockscout (~200KB)</th>
</tr></thead>
<tbody>
${results.map(r => `<tr>
  <td><b>${r.capKb}KB</b></td>
  <td><img class="composite" src="${r.dirName}/composite.png"></td>
  <td>${r.hairKb}KB</td>
  <td>${r.total12LayerKb}KB</td>
  <td>${r.uriEstimateKb}KB</td>
  <td class="${r.uriEstimateKb <= 200 ? 'ok' : 'warn'}">${r.uriEstimateKb <= 200 ? '✓ 通る' : '✗ cap 超え'}</td>
</tr>`).join('\n')}
</tbody>
</table>

<h2 style="color:#ffcc66;margin-top:32px;">各 layer 個別 (画質劣化箇所の特定用)</h2>
${results.map(r => `<h3 style="color:#66ddff;">cap ${r.capKb}KB layers</h3>
<table><thead><tr>${NIJI_TRAITS.map(t => `<th>${t.name}</th>`).join('')}</tr></thead>
<tbody><tr>${NIJI_TRAITS.map(t => `<td><img class="hair" src="${r.dirName}/layers/${t.id.toString().padStart(2, '0')}_${t.name}.png"></td>`).join('')}</tr></tbody>
</table>`).join('\n')}
</body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);
  console.log(`\nDone. Open ${path.join(OUT_DIR, 'index.html')} in browser.`);
  console.log(`\nResults:`);
  console.table(results);
}

main().catch(e => { console.error(e); process.exit(1); });
