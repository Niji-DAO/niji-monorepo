#!/usr/bin/env node
/**
 * special trait の compositeOrder 位置 0-11 (12 パターン) × special variant (2 個) を
 * @resvg/resvg-js で PNG raster 化して 1 HTML file に inline data URL 埋込。
 * tab UI で special variant 切替、 各 tab で 12 position の grid 表示 (Issue #3110)。
 *
 * 使用: node packages/niji-webapp/scripts/generate-special-position-preview.mjs
 * 出力: .context/scratch/special-position-preview.html
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSVG, PNGCollectionEncoder } from '@niji/sdk';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nijiDataPath = resolve(__dirname, '../../niji-assets/src/niji-data-rle.json');
const NijiImageData = JSON.parse(readFileSync(nijiDataPath, 'utf-8'));

const BASE_ORDER = [
  'solidBackground',
  'background',
  'backDecoration',
  'back',
  'leftHand',
  'clothing',
  'ear',
  'special',
  'choker',
  'hat',
  'hair',
  'headphone',
];

const encoder = new PNGCollectionEncoder(NijiImageData.palette);

const orderWithSpecialAt = position => {
  const withoutSpecial = BASE_ORDER.filter(k => k !== 'special');
  return [...withoutSpecial.slice(0, position), 'special', ...withoutSpecial.slice(position)];
};

const rasterizeSvg = svg => {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 320 } });
  const png = resvg.render().asPng();
  return `data:image/png;base64,${png.toString('base64')}`;
};

const buildForSpecialVariant = specialIndex => {
  const seed = {
    solidBackground: 0,
    background: 0,
    backDecoration: 0,
    back: 0,
    leftHand: 0,
    clothing: 0,
    ear: 0,
    special: specialIndex,
    choker: 0,
    hat: 0,
    hair: 0,
    headphone: 0,
  };
  return Array.from({ length: 12 }, (_, position) => {
    const order = orderWithSpecialAt(position);
    const parts = order
      .map(key => NijiImageData.images[key][seed[key]])
      .filter(part => part != null && typeof part.data === 'string');
    const svg = buildSVG(parts, encoder.data.palette, undefined);
    const pngDataUrl = rasterizeSvg(svg);
    return { position, order, pngDataUrl };
  });
};

const specialVariants = NijiImageData.images.special.map((img, i) => {
  console.log(`Rendering special #${i} (${img.filename})...`);
  return {
    index: i,
    filename: img.filename,
    variations: buildForSpecialVariant(i),
  };
});

const positionNote = position => {
  if (position === 0) return '最背面';
  if (position === 11) return '最前面';
  return `後ろから ${position + 1} 番目 / 手前から ${12 - position} 番目`;
};

const escapeHtml = s =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const renderCard = variation => {
  const isCurrent = variation.position === 7;
  return `<div class="card">
<p class="card-title">position ${variation.position}${isCurrent ? '<span class="badge">現行</span>' : ''}</p>
<p class="card-note">${positionNote(variation.position)}</p>
<div class="img-wrap"><img alt="position ${variation.position}" src="${variation.pngDataUrl}"></div>
<p class="order-line">${variation.order.map(k => (k === 'special' ? `<span class="mark">${k}</span>` : k)).join(' › ')}</p>
</div>`;
};

const renderPanel = variant => `<div class="panel${variant.index === 0 ? ' active' : ''}" data-variant="${variant.index}">
<div class="grid">
${variant.variations.map(renderCard).join('')}
</div>
</div>`;

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Niji special position preview</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f5f4f0;
    --card-bg: #ffffff;
    --border: #e2e1dd;
    --text: #1a1a1a;
    --muted: #6b6a63;
    --accent: #d81a3f;
    --tab-bg: #ececea;
    --tab-active-bg: #1a1a1a;
    --tab-active-text: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PT Root UI', sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #16161a;
      --card-bg: #1e1e22;
      --border: #2b2b30;
      --text: #ececec;
      --muted: #8a8a90;
      --tab-bg: #24242a;
      --tab-active-bg: #ececec;
      --tab-active-text: #16161a;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 24px 64px;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
  }
  header, .tabs, .panel { max-width: 1400px; margin: 0 auto; }
  header { margin-bottom: 24px; }
  h1 { font-size: 24px; letter-spacing: -0.01em; margin: 0 0 6px; text-wrap: balance; }
  p.intro { margin: 0; color: var(--muted); font-size: 13px; }
  .mark, .accent { color: var(--accent); font-weight: 600; }
  .tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border); margin-top: 24px; margin-bottom: 20px; }
  .tab {
    padding: 10px 20px; border: none; background: var(--tab-bg); color: var(--muted); cursor: pointer;
    border-radius: 6px 6px 0 0; font-family: inherit; font-size: 13px; font-weight: 500;
    letter-spacing: 0.01em; transition: background 0.15s, color 0.15s;
  }
  .tab:hover { color: var(--text); }
  .tab.active { background: var(--tab-active-bg); color: var(--tab-active-text); }
  .panel { display: none; }
  .panel.active { display: block; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .card {
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px;
    padding: 12px; display: flex; flex-direction: column; gap: 6px;
  }
  .card-title { font-size: 14px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 6px; }
  .badge { display: inline-block; padding: 1px 6px; background: var(--accent); color: #fff; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.02em; }
  .card-note { font-size: 11px; color: var(--muted); margin: 0; letter-spacing: 0.02em; }
  .img-wrap {
    width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 6px;
    background: repeating-conic-gradient(rgba(0,0,0,0.03) 0 25%, transparent 0 50%) 0 / 16px 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .img-wrap img { width: 100%; height: 100%; display: block; image-rendering: pixelated; cursor: zoom-in; }
  #lightbox {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none;
    align-items: center; justify-content: center; z-index: 1000; padding: 24px;
    cursor: zoom-out;
  }
  #lightbox.open { display: flex; }
  #lightbox img {
    max-width: 90vw; max-height: 90vh; image-rendering: pixelated;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5); border-radius: 8px;
  }
  #lightbox .caption {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    color: #fff; font-size: 14px; padding: 8px 16px; background: rgba(0,0,0,0.6);
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .order-line {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px;
    color: var(--muted); line-height: 1.5; word-break: break-all; margin: 0;
  }
</style>
</head>
<body>
<header>
<h1>Niji <span class="accent">special</span> position preview</h1>
<p class="intro">同一 seed で <strong>special</strong> の compositeOrder 位置を 0 (最背面) → 11 (最前面) の 12 パターン描画。 現行 = position 7 (Issue #3066)。 special variant は tab で切替。</p>
</header>
<div class="tabs" role="tablist">
${specialVariants.map(v => `<button class="tab${v.index === 0 ? ' active' : ''}" role="tab" data-target="${v.index}">special #${v.index} (${escapeHtml(v.filename)})</button>`).join('')}
</div>
${specialVariants.map(renderPanel).join('')}
<div id="lightbox" role="dialog" aria-modal="true" aria-label="拡大表示">
  <img id="lightbox-img" alt="">
  <div class="caption" id="lightbox-caption"></div>
</div>
<script>
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.target === target));
      panels.forEach(p => p.classList.toggle('active', p.dataset.variant === target));
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  document.querySelectorAll('.img-wrap img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      const card = img.closest('.card');
      const title = card ? card.querySelector('.card-title')?.textContent ?? '' : '';
      const note = card ? card.querySelector('.card-note')?.textContent ?? '' : '';
      lightboxCaption.textContent = title.replace('現行', ' (現行)') + ' — ' + note;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });
</script>
</body>
</html>
`;

const outPath = resolve(__dirname, '../../../.context/scratch/special-position-preview.html');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
const stats = readFileSync(outPath).length;
console.log('Wrote', outPath, '=', (stats / 1024 / 1024).toFixed(2), 'MB');
