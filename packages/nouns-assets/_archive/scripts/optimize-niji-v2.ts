import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TARGET_SIZE = 512;
const GLOBAL_PALETTE_SIZE = 256;

/**
 * Step 1: Create a global palette by combining all images into a single composite
 * This approach leverages sharp's built-in quantization which is much faster than manual k-means
 */
async function createGlobalPalette(traitDirs: string[], baseInputDir: string): Promise<Buffer> {
  console.log('\n🎨 Creating global color palette...');

  // Collect a sample of images from each category
  const sampleImages: string[] = [];

  for (const dir of traitDirs) {
    const dirPath = path.join(baseInputDir, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs
      .readdirSync(dirPath)
      .filter(f => f.endsWith('.PNG') || f.endsWith('.png'))
      .slice(0, 10); // Sample first 10 images per category

    for (const file of files) {
      sampleImages.push(path.join(dirPath, file));
    }
  }

  console.log(`  Sampling ${sampleImages.length} images for palette extraction...`);

  // Create a composite image containing samples
  const GRID_SIZE = Math.ceil(Math.sqrt(sampleImages.length));
  const SAMPLE_SIZE = 128; // Small size for speed

  const compositeOps = [];
  for (let i = 0; i < sampleImages.length; i++) {
    const x = (i % GRID_SIZE) * SAMPLE_SIZE;
    const y = Math.floor(i / GRID_SIZE) * SAMPLE_SIZE;

    const resized = await sharp(sampleImages[i])
      .resize(SAMPLE_SIZE, SAMPLE_SIZE, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    compositeOps.push({ input: resized, top: y, left: x });
  }

  // Create composite and extract palette
  const composite = await sharp({
    create: {
      width: GRID_SIZE * SAMPLE_SIZE,
      height: GRID_SIZE * SAMPLE_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(compositeOps)
    .png({ palette: true, colors: GLOBAL_PALETTE_SIZE, dither: 1.0 })
    .toBuffer();

  console.log(`  ✓ Global palette created from ${sampleImages.length} sample images`);

  return composite;
}

/**
 * Step 2: Apply the global palette to each image
 */
async function optimizeImageWithPalette(
  inputPath: string,
  outputPath: string,
  paletteSample: Buffer,
): Promise<{ originalSize: number; optimizedSize: number }> {
  const originalStats = fs.statSync(inputPath);
  const originalSize = originalStats.size;

  // Resize to target size
  const resized = await sharp(inputPath)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      kernel: 'lanczos3',
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Extract palette from sample
  const { info: sampleInfo } = await sharp(paletteSample)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Apply binary alpha and quantization
  const { data, info } = await sharp(resized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Binarize alpha: < 128 = 0, >= 128 = 255
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    data[i + 3] = alpha >= 128 ? 255 : 0;
  }

  // Apply quantization with palette
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
      colors: GLOBAL_PALETTE_SIZE,
      dither: 1.0,
      compressionLevel: 9,
    })
    .toFile(outputPath);

  const optimizedStats = fs.statSync(outputPath);
  const optimizedSize = optimizedStats.size;

  return { originalSize, optimizedSize };
}

/**
 * Main function: optimize all Niji images with a shared global palette
 */
async function main() {
  const baseInputDir = '/Users/cardene/Downloads/niji/niji';
  const baseOutputDir = path.join(process.cwd(), 'images_niji_v2');

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

  console.log('\n=== NIJI IMAGE OPTIMIZATION V2 ===');
  console.log(`Target size: ${TARGET_SIZE}x${TARGET_SIZE}`);
  console.log(`Global palette size: ${GLOBAL_PALETTE_SIZE} colors`);
  console.log(`Output directory: ${baseOutputDir}\n`);

  // Step 1: Create global palette
  const paletteSample = await createGlobalPalette(traitDirs, baseInputDir);

  // Step 2: Process all images
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

    await fs.promises.mkdir(outputDir, { recursive: true });

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.PNG') || f.endsWith('.png'));

    console.log(`  Processing ${files.length} images...`);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      try {
        const result = await optimizeImageWithPalette(inputPath, outputPath, paletteSample);

        totalOriginal += result.originalSize;
        totalOptimized += result.optimizedSize;
        totalImages++;

        if (totalImages % 50 === 0) {
          console.log(`  Progress: ${totalImages} images optimized`);
        }
      } catch (error) {
        console.error(`  ✗ ${file}: ${error}`);
      }
    }

    console.log(`  ✓ ${files.length} images complete`);
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compression ratio: ${((totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`Space saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createGlobalPalette, optimizeImageWithPalette };
