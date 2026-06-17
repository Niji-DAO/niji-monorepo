import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

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
const OUTPUT_BASE = './images_niji_color_test';

async function recomposite(dirLabel: string, resolution: number) {
  const dir = path.join(OUTPUT_BASE, dirLabel);
  if (!fs.existsSync(dir)) {
    console.log(`${dir} not found`);
    return;
  }
  const allFiles = fs
    .readdirSync(dir)
    .filter(
      f =>
        f.endsWith('.png') &&
        !f.includes('composite') &&
        !f.includes('sample') &&
        !f.includes('upscaled'),
    );
  const layers: { input: Buffer; top: number; left: number }[] = [];
  for (const trait of COMPOSITE_ORDER) {
    const traitFiles = allFiles.filter(f => f.startsWith(`${trait}_`) && !f.includes('empty'));
    if (traitFiles.length === 0) continue;
    let bestFile = traitFiles[0],
      bestOp = 0;
    for (const f of traitFiles.slice(0, 10)) {
      const { data } = await sharp(path.join(dir, f))
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
    layers.push({ input: await sharp(path.join(dir, bestFile)).toBuffer(), top: 0, left: 0 });
  }
  const compPath = path.join(dir, 'composite_best.png');
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
  const scale = Math.ceil(320 / resolution);
  await sharp(compPath)
    .resize(resolution * scale, resolution * scale, { kernel: 'nearest' })
    .toFile(path.join(dir, 'composite_best_upscaled.png'));
  console.log(`  ${dirLabel} done`);
}

async function main() {
  for (const t of [
    { label: '80_64c_nn_mr3', res: 80 },
    { label: '80_48c_nn_mr2', res: 80 },
    { label: '80_48c_nn_mr3', res: 80 },
    { label: '72_64c_nn_mr2', res: 72 },
    { label: '72_64c_nn_mr3', res: 72 },
    { label: '64_64c_nn_mr2', res: 64 },
    { label: '64_48c_nn', res: 64 },
  ]) {
    await recomposite(t.label, t.res);
  }
}
main().catch(console.error);
