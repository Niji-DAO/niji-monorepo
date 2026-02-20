import { PNGCollectionEncoder } from '@nouns/sdk';
import { readPngImage } from './utils';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = './images_niji_optimized';
const PALETTE_FILE = './niji-palette.json';
const OUTPUT_FILE = './src/niji-data.json';

// Niji trait directories (12 traits)
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

async function encodeNiji() {
  console.log('\n=== NIJI IMAGE ENCODING (WITH GLOBAL PALETTE) ===');
  console.log(`Input directory: ${IMAGES_DIR}`);
  console.log(`Palette file: ${PALETTE_FILE}`);
  console.log(`Output file: ${OUTPUT_FILE}\n`);

  // Load global palette
  const paletteHex: string[] = JSON.parse(fs.readFileSync(PALETTE_FILE, 'utf-8'));
  console.log(`✓ Loaded global palette with ${paletteHex.length} colors\n`);

  // Create encoder instance with pre-defined palette
  const encoder = new PNGCollectionEncoder(paletteHex);
  let totalImages = 0;

  for (const trait of TRAIT_DIRS) {
    const traitPath = path.join(IMAGES_DIR, trait.dir);

    // Check if directory exists
    if (!fs.existsSync(traitPath)) {
      console.log(`⚠️  ${trait.dir}: Directory not found, skipping...`);
      continue;
    }

    // Get all PNG files
    const files = fs
      .readdirSync(traitPath)
      .filter(f => f.endsWith('.PNG') || f.endsWith('.png'))
      .sort();

    console.log(`📁 ${trait.dir} (${files.length} images)`);

    for (const file of files) {
      const filePath = path.join(traitPath, file);
      const imageName = file.replace(/\.png$/i, '');

      try {
        // Read PNG
        const png = await readPngImage(filePath);

        // Encode to RLE
        encoder.encodeImage(imageName, png, trait.name);

        totalImages++;
        process.stdout.write(`\r  Progress: ${totalImages} images encoded`);
      } catch (error) {
        console.error(`\n  ✗ Failed to encode ${file}: ${error}`);
      }
    }

    console.log(''); // New line after progress
  }

  // Write encoded data to file
  console.log(`\n💾 Writing encoded data to ${OUTPUT_FILE}...`);
  await encoder.writeToFile(OUTPUT_FILE);

  // Get stats
  const imageData = encoder.data;
  const paletteSize = imageData.palette.length;
  const outputStats = fs.statSync(OUTPUT_FILE);
  const outputSize = outputStats.size;

  console.log('\n=== ENCODING SUMMARY ===');
  console.log(`Total images encoded: ${totalImages}`);
  console.log(`Palette size: ${paletteSize} colors`);
  console.log(`Output file size: ${(outputSize / 1024).toFixed(2)} KB`);
  console.log(`Output file size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n✓ Encoding complete!`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  encodeNiji().catch(console.error);
}

export { encodeNiji };
