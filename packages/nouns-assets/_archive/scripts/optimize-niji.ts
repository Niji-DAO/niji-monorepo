import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TARGET_SIZE = 512;
const MAX_COLORS = 256;

interface OptimizationResult {
  inputPath: string;
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimize a single Niji image:
 * 1. Resize to 512x512
 * 2. Quantize to 256 colors
 * 3. Binarize alpha channel (0 or 255 only)
 */
async function optimizeImage(
  inputPath: string,
  outputPath: string
): Promise<OptimizationResult> {
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;

  // Step 1: Resize to 512x512 with high-quality interpolation
  const resized = await sharp(inputPath)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Step 2: Quantize to 256 colors + alpha binarization
  const { data, info } = await sharp(resized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Binarize alpha channel: < 128 = 0, >= 128 = 255
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    data[i + 3] = alpha >= 128 ? 255 : 0;
  }

  // Step 3: Quantize to 256 colors using Floyd-Steinberg dithering
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({
      palette: true,
      quality: 100,
      colors: MAX_COLORS,
      dither: 1.0,
      compressionLevel: 9,
    })
    .toFile(outputPath);

  const optimizedStats = fs.statSync(outputPath);
  const optimizedSize = optimizedStats.size;

  return {
    inputPath,
    outputPath,
    originalSize,
    optimizedSize,
    compressionRatio: optimizedSize / originalSize,
  };
}

/**
 * Optimize all images in a directory
 */
async function optimizeDirectory(
  inputDir: string,
  outputDir: string
): Promise<OptimizationResult[]> {
  // Create output directory
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Get all PNG files
  const files = (await fs.promises.readdir(inputDir)).filter(
    f => f.endsWith('.PNG') || f.endsWith('.png')
  );

  console.log(`  Processing ${files.length} images...`);

  const results: OptimizationResult[] = [];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      const result = await optimizeImage(inputPath, outputPath);
      results.push(result);
      console.log(
        `    ✓ ${file}: ${(result.originalSize / 1024).toFixed(1)}KB → ${(result.optimizedSize / 1024).toFixed(1)}KB (${(result.compressionRatio * 100).toFixed(1)}%)`
      );
    } catch (error) {
      console.error(`    ✗ ${file}: ${error}`);
    }
  }

  return results;
}

/**
 * Main function: optimize all Niji trait directories
 */
async function main() {
  const baseInputDir = '/Users/cardene/Downloads/niji/niji';
  const baseOutputDir = path.join(process.cwd(), 'images_niji');

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

  console.log(`\n=== NIJI IMAGE OPTIMIZATION ===`);
  console.log(`Target size: ${TARGET_SIZE}x${TARGET_SIZE}`);
  console.log(`Max colors: ${MAX_COLORS}`);
  console.log(`Output directory: ${baseOutputDir}\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let totalImages = 0;

  for (const dir of traitDirs) {
    console.log(`\n📁 ${dir}`);
    const inputDir = path.join(baseInputDir, dir);
    const outputDir = path.join(baseOutputDir, dir);

    if (!fs.existsSync(inputDir)) {
      console.log(`  ⚠️  Directory not found, skipping...`);
      continue;
    }

    const results = await optimizeDirectory(inputDir, outputDir);

    for (const result of results) {
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      totalImages++;
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `Compression ratio: ${((totalOptimized / totalOriginal) * 100).toFixed(1)}%`
  );
  console.log(
    `Space saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`
  );
}

// Check if running as a script (not imported as module)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { optimizeImage, optimizeDirectory };
