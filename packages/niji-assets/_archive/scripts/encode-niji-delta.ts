import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';
import fs from 'fs';
import path from 'path';

// Delta encoder inline
class DeltaEncoder {
  public static encodeDelta(png: any, colorMap: Map<string, number>): string {
    const width = png.width;
    const height = png.height;

    let minX = width,
      maxX = 0,
      minY = height,
      maxY = 0;
    const pixels: Array<{ x: number; y: number; colorIndex: number }> = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rgba = png.rgbaAt(x, y);
        if (rgba.a === 0) continue;

        const hex = `${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`;
        let colorIndex = colorMap.get(hex);

        if (colorIndex === undefined) {
          colorIndex = colorMap.size;
          colorMap.set(hex, colorIndex);
        }

        pixels.push({ x, y, colorIndex });

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (pixels.length === 0) {
      return '0x00000000000000';
    }

    let encoded = '0x';
    encoded += '00';
    encoded += minY.toString(16).padStart(2, '0');
    encoded += maxX.toString(16).padStart(2, '0');
    encoded += maxY.toString(16).padStart(2, '0');
    encoded += minX.toString(16).padStart(2, '0');

    for (const pixel of pixels) {
      encoded += pixel.x.toString(16).padStart(2, '0');
      encoded += pixel.y.toString(16).padStart(2, '0');
      encoded += pixel.colorIndex.toString(16).padStart(2, '0');
    }

    return encoded;
  }
}

const IMAGES_DIR = './images_niji_optimized';
const PALETTE_FILE = './niji-palette.json';
const OUTPUT_FILE_RLE = './src/niji-data-rle.json';
const OUTPUT_FILE_DELTA = './src/niji-data-delta.json';

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

async function encodeWithComparison() {
  console.log('\n=== NIJI ENCODING COMPARISON (RLE vs DELTA) ===\n');

  // Load palette
  const paletteHex: string[] = JSON.parse(fs.readFileSync(PALETTE_FILE, 'utf-8'));
  console.log(`✓ Loaded palette: ${paletteHex.length} colors\n`);

  // Create encoders
  const rleEncoder = new PNGCollectionEncoder(paletteHex);
  const colorMap = new Map<string, number>();
  paletteHex.forEach((hex, i) => {
    if (hex) colorMap.set(hex, i);
  });

  const deltaData: any = {
    palette: paletteHex,
    images: {},
  };

  let totalRLESize = 0;
  let totalDeltaSize = 0;
  let imageCount = 0;

  console.log('📁 Processing traits...\n');

  for (const trait of TRAIT_DIRS) {
    const traitPath = path.join(IMAGES_DIR, trait.dir);
    if (!fs.existsSync(traitPath)) continue;

    const files = fs
      .readdirSync(traitPath)
      .filter(f => f.endsWith('.PNG') || f.endsWith('.png'))
      .slice(0, 5); // Test with first 5 from each category

    console.log(`  ${trait.dir} (testing ${files.length} images)`);

    deltaData.images[trait.name] = [];

    for (const file of files) {
      const filePath = path.join(traitPath, file);
      const imageName = file.replace(/\.png$/i, '');

      try {
        const png = await readPngImage(filePath);

        // RLE encoding
        const rleData = rleEncoder.encodeImage(imageName, png, trait.name);
        const rleBytes = (rleData.length - 2) / 2;

        // Delta encoding
        const deltaData2 = DeltaEncoder.encodeDelta(png, colorMap);
        const deltaBytes = (deltaData2.length - 2) / 2;

        deltaData.images[trait.name].push({
          filename: imageName,
          data: deltaData2,
        });

        totalRLESize += rleBytes;
        totalDeltaSize += deltaBytes;
        imageCount++;

        const savings = ((1 - deltaBytes / rleBytes) * 100).toFixed(1);
        console.log(
          `    ${imageName}: RLE ${rleBytes}B → Delta ${deltaBytes}B (${savings}% smaller)`,
        );
      } catch (error) {
        console.error(`    ✗ ${file}: ${error}`);
      }
    }
    console.log('');
  }

  // Save delta-encoded data
  console.log('💾 Saving delta-encoded data...');
  fs.writeFileSync(OUTPUT_FILE_DELTA, JSON.stringify(deltaData, null, 2));

  // Save RLE data for comparison
  fs.writeFileSync(OUTPUT_FILE_RLE, JSON.stringify(rleEncoder.data, null, 2));

  const rleFileSize = fs.statSync(OUTPUT_FILE_RLE).size;
  const deltaFileSize = fs.statSync(OUTPUT_FILE_DELTA).size;

  console.log('\n=== RESULTS ===\n');
  console.log(`Images processed: ${imageCount}`);
  console.log(`\nRLE Encoding:`);
  console.log(`  Total size: ${(totalRLESize / 1024).toFixed(2)} KB`);
  console.log(`  File size: ${(rleFileSize / 1024).toFixed(2)} KB`);
  console.log(`\nDelta Encoding:`);
  console.log(`  Total size: ${(totalDeltaSize / 1024).toFixed(2)} KB`);
  console.log(`  File size: ${(deltaFileSize / 1024).toFixed(2)} KB`);
  console.log(`\nSavings:`);
  console.log(`  Data: ${((1 - totalDeltaSize / totalRLESize) * 100).toFixed(1)}%`);
  console.log(`  File: ${((1 - deltaFileSize / rleFileSize) * 100).toFixed(1)}%`);

  console.log(`\n✓ Files saved:`);
  console.log(`  RLE: ${OUTPUT_FILE_RLE}`);
  console.log(`  Delta: ${OUTPUT_FILE_DELTA}\n`);

  // Estimate for full dataset
  const avgCompressionRatio = totalDeltaSize / totalRLESize;
  const fullDatasetEstimate = 27 * avgCompressionRatio;

  console.log(`\n📊 FULL DATASET ESTIMATE:`);
  console.log(`  Current (RLE): 27 MB`);
  console.log(
    `  Estimated (Delta): ${fullDatasetEstimate.toFixed(2)} MB (${(avgCompressionRatio * 100).toFixed(1)}%)`,
  );
  console.log(`  Estimated SVG size: ${(362 * avgCompressionRatio).toFixed(0)} KB`);

  if (fullDatasetEstimate < 5) {
    console.log(`\n✅ EXCELLENT! Delta encoding brings data under 5 MB`);
    console.log(`   This should be deployable and readable on-chain!\n`);
  } else if (fullDatasetEstimate < 10) {
    console.log(`\n✓ GOOD! Delta encoding significantly reduces size, may still need batching\n`);
  } else {
    console.log(`\n⚠️  Still large, but major improvement. Further optimization needed.\n`);
  }
}

encodeWithComparison().catch(console.error);
