import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';

const BASE_DIR = './images_niji_optimized';
const OUTPUT_BASE = './images_niji_nodither_test';

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

/**
 * Test with NO dithering - true palette reduction
 */
async function testNoDither(colorCount: number) {
  console.log(`\n🎨 Testing ${colorCount} colors (NO dithering)...\n`);

  const outputDir = path.join(OUTPUT_BASE, `${colorCount}_colors`);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const colorMap = new Map<string, number>();
  let totalFileSize = 0;
  const processedImages: string[] = [];

  for (const trait of TRAIT_DIRS) {
    const traitPath = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(traitPath)) continue;

    const files = fs.readdirSync(traitPath).filter(f => f.endsWith('.PNG') || f.endsWith('.png'));

    for (const file of files) {
      const inputPath = path.join(traitPath, file);
      const outputPath = path.join(outputDir, `${trait.name}_${file}`);

      const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Binarize alpha
      for (let i = 0; i < data.length; i += 4) {
        data[i + 3] = data[i + 3] >= 128 ? 255 : 0;
      }

      // Apply quantization with NO dithering
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
          colors: colorCount,
          dither: 0.0, // NO DITHERING
          compressionLevel: 9,
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      totalFileSize += stats.size;

      // Collect actual colors
      const png = await readPngImage(outputPath);
      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const rgba = png.rgbaAt(x, y);
          if (rgba.a === 0) continue;
          const hex = `${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`;
          if (!colorMap.has(hex)) {
            colorMap.set(hex, colorMap.size);
          }
        }
      }

      processedImages.push(outputPath);
    }
  }

  console.log(`  Processed ${processedImages.length} images`);
  console.log(`  Total file size: ${(totalFileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Actual unique colors: ${colorMap.size}`);

  // Encode with RLE
  const palette = Array.from(colorMap.keys());
  const encoder = new PNGCollectionEncoder(palette);

  for (const trait of TRAIT_DIRS) {
    const traitImages = processedImages.filter(p => p.includes(`${trait.name}_`));

    for (const imgPath of traitImages) {
      const png = await readPngImage(imgPath);
      const filename = path.basename(imgPath).replace(`${trait.name}_`, '').replace(/\.png$/i, '');
      encoder.encodeImage(filename, png, trait.name);
    }
  }

  const encodedData = JSON.stringify(encoder.data);
  const encodedSize = Buffer.byteLength(encodedData);

  console.log(`  Encoded size: ${(encodedSize / 1024 / 1024).toFixed(2)} MB`);

  // Create sample composite
  const samplePath = path.join(outputDir, 'sample_composite.png');
  await createSampleComposite(processedImages, samplePath);
  console.log(`  Sample: ${samplePath}`);

  return {
    colorCount,
    actualColors: colorMap.size,
    totalSize: totalFileSize,
    encodedSize,
    sampleImage: samplePath,
  };
}

async function createSampleComposite(images: string[], outputPath: string) {
  const composite: any[] = [];

  for (const trait of TRAIT_DIRS) {
    const traitImage = images.find(p => p.includes(`${trait.name}_`));
    if (traitImage) {
      const buffer = await sharp(traitImage).toBuffer();
      composite.push({ input: buffer, top: 0, left: 0 });
    }
  }

  if (composite.length === 0) return;

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 213, g: 215, b: 225, alpha: 1 },
    },
  })
    .composite(composite)
    .png()
    .toFile(outputPath);
}

async function main() {
  console.log('\n=== NO DITHERING COLOR QUANTIZATION TEST ===');
  console.log('Testing true palette reduction at 512×512 resolution\n');

  const tests = [256, 192, 128, 96, 64, 48, 32];
  const results = [];

  for (const colorCount of tests) {
    try {
      const result = await testNoDither(colorCount);
      results.push(result);
    } catch (error) {
      console.error(`Failed ${colorCount} colors: ${error}`);
    }
  }

  console.log('\n\n=== RESULTS SUMMARY ===\n');
  console.log('Palette | Actual | Total Size | Encoded Size | Est. SVG | Est. Gas');
  console.log('--------|--------|------------|--------------|----------|----------');

  for (const result of results) {
    const estimatedSVG = (result.encodedSize / 1024 / 1024) * 13.5;
    const estimatedGas = (estimatedSVG / 362) * 55;

    const viable = estimatedGas < 25 ? '✅' : estimatedGas < 30 ? '⚠️' : '❌';

    console.log(
      `${result.colorCount.toString().padStart(7)} | ` +
        `${result.actualColors.toString().padStart(6)} | ` +
        `${(result.totalSize / 1024 / 1024).toFixed(2).padStart(10)} MB | ` +
        `${(result.encodedSize / 1024 / 1024).toFixed(2).padStart(12)} MB | ` +
        `${estimatedSVG.toFixed(0).padStart(8)} KB | ` +
        `${estimatedGas.toFixed(1).padStart(8)}M ${viable}`
    );
  }

  console.log('\n📊 Visual samples:');
  results.forEach(r => {
    console.log(`  ${r.colorCount} colors: ${r.sampleImage}`);
  });

  // Find best viable option
  const viable = results.filter(r => {
    const estimatedGas = ((r.encodedSize / 1024 / 1024) * 13.5 / 362) * 55;
    return estimatedGas < 25;
  });

  if (viable.length > 0) {
    const best = viable.reduce((a, b) => (a.colorCount > b.colorCount ? a : b));
    const estGas = ((best.encodedSize / 1024 / 1024) * 13.5 / 362) * 55;

    console.log(`\n✅ VIABLE AT 512×512 WITH ${best.colorCount} COLORS!`);
    console.log(`   Actual colors: ${best.actualColors}`);
    console.log(`   Encoded: ${(best.encodedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Est. SVG: ${((best.encodedSize / 1024 / 1024) * 13.5).toFixed(0)} KB`);
    console.log(`   Est. gas: ${estGas.toFixed(1)}M (within 30M limit)`);
    console.log(`   Sample: ${best.sampleImage}`);
  } else {
    console.log(`\n❌ No viable 512×512 solution even with aggressive color reduction`);
    console.log(`   Need to combine with resolution reduction`);
  }

  console.log('\n');
}

main().catch(console.error);
