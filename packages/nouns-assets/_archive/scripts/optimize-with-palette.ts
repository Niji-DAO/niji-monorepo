import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TARGET_SIZE = 512;
const PALETTE_FILE = './niji-palette.json';
const SOURCE_DIR = '/Users/cardene/Downloads/niji/niji';
const OUTPUT_DIR = './images_niji_optimized';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Load global palette
 */
function loadPalette(): ColorRGB[] {
  const paletteHex: string[] = JSON.parse(
    fs.readFileSync(PALETTE_FILE, 'utf-8')
  );

  return paletteHex.map(hex => {
    if (hex === '') return { r: 0, g: 0, b: 0 }; // Transparent
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  });
}

/**
 * Find nearest color in palette
 */
function nearestColor(r: number, g: number, b: number, palette: ColorRGB[]): number {
  let minDist = Infinity;
  let nearestIdx = 0;

  for (let i = 1; i < palette.length; i++) {
    // Skip index 0 (transparent)
    const pr = palette[i].r;
    const pg = palette[i].g;
    const pb = palette[i].b;

    const dist =
      Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2);

    if (dist < minDist) {
      minDist = dist;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}

/**
 * Optimize image using global palette
 */
async function optimizeWithPalette(
  inputPath: string,
  outputPath: string,
  palette: ColorRGB[]
): Promise<void> {
  // Resize to 512x512
  const resized = await sharp(inputPath)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;

  // Map each pixel to nearest palette color
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];

    if (alpha < 128) {
      // Fully transparent
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      // Find nearest palette color
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const paletteIdx = nearestColor(r, g, b, palette);
      data[i] = palette[paletteIdx].r;
      data[i + 1] = palette[paletteIdx].g;
      data[i + 2] = palette[paletteIdx].b;
      data[i + 3] = 255; // Fully opaque
    }
  }

  // Save as PNG with max compression
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({
      compressionLevel: 9,
      palette: true,
    })
    .toFile(outputPath);
}

/**
 * Process all images in directory
 */
async function processDirectory(
  inputDir: string,
  outputDir: string,
  palette: ColorRGB[]
): Promise<number> {
  await fs.promises.mkdir(outputDir, { recursive: true });

  const files = (await fs.promises.readdir(inputDir)).filter(
    f => f.endsWith('.PNG') || f.endsWith('.png')
  );

  let count = 0;
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      await optimizeWithPalette(inputPath, outputPath, palette);
      count++;
      process.stdout.write(`\r  Processed: ${count}/${files.length} images`);
    } catch (error) {
      console.error(`\n  ✗ Failed to process ${file}: ${error}`);
    }
  }

  console.log(''); // New line
  return count;
}

/**
 * Main function
 */
async function main() {
  console.log('\n=== NIJI IMAGE OPTIMIZATION WITH GLOBAL PALETTE ===');
  console.log(`Palette file: ${PALETTE_FILE}`);
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Load palette
  const palette = loadPalette();
  console.log(`✓ Loaded palette with ${palette.length} colors\n`);

  const traitDirs = [
    '01_スペシャル',
    '02_チョーカー',
    '03_ヘッドホン',
    '04_左手',
    '05_帽子',
    '06_服',
    '07_耳',
    '08_背中',
    '09_背中の装飾',
    '10_背景',
    '11_背景単色',
    '12_髪の毛',
  ];

  let totalProcessed = 0;

  for (const dir of traitDirs) {
    console.log(`📁 ${dir}`);
    const inputDir = path.join(SOURCE_DIR, dir);
    const outputDir = path.join(OUTPUT_DIR, dir);

    if (!fs.existsSync(inputDir)) {
      console.log(`  ⚠️  Directory not found, skipping...\n`);
      continue;
    }

    const count = await processDirectory(inputDir, outputDir, palette);
    totalProcessed += count;
  }

  console.log(`\n✓ Optimization complete!`);
  console.log(`Total images processed: ${totalProcessed}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { optimizeWithPalette, loadPalette };
