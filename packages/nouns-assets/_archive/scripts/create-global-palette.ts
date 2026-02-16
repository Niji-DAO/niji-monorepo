import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TARGET_PALETTE_SIZE = 256; // Maximum colors for global palette
const SOURCE_DIR = '/Users/cardene/Downloads/niji/niji';
const OUTPUT_PALETTE_FILE = './niji-palette.json';

interface ColorCount {
  hex: string;
  count: number;
  r: number;
  g: number;
  b: number;
}

/**
 * Extract all unique colors from all Niji images
 */
async function extractAllColors(
  inputDir: string
): Promise<Map<string, ColorCount>> {
  const colorMap = new Map<string, ColorCount>();

  const files = (await fs.promises.readdir(inputDir)).filter(
    f => f.endsWith('.PNG') || f.endsWith('.png')
  );

  for (const file of files) {
    const filePath = path.join(inputDir, file);

    try {
      const { data, info } = await sharp(filePath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Extract colors (skip fully transparent pixels)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip fully transparent pixels
        if (a === 0) continue;

        const hex = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        const existing = colorMap.get(hex);
        if (existing) {
          existing.count++;
        } else {
          colorMap.set(hex, { hex, count: 1, r, g, b });
        }
      }
    } catch (error) {
      console.error(`Failed to process ${file}: ${error}`);
    }
  }

  return colorMap;
}

/**
 * Fast palette reduction using median cut algorithm (like pngquant)
 * Much faster than k-means for large color sets
 */
function medianCutPalette(
  colors: ColorCount[],
  targetSize: number
): ColorCount[] {
  if (colors.length <= targetSize) {
    return colors;
  }

  // Start with all colors in one bucket
  let buckets: ColorCount[][] = [colors];

  // Recursively split buckets until we have targetSize buckets
  while (buckets.length < targetSize) {
    // Find bucket with largest color range
    let maxRange = 0;
    let maxBucketIdx = 0;
    let maxChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length <= 1) continue;

      // Calculate range for each channel
      const rRange = Math.max(...bucket.map(c => c.r)) - Math.min(...bucket.map(c => c.r));
      const gRange = Math.max(...bucket.map(c => c.g)) - Math.min(...bucket.map(c => c.g));
      const bRange = Math.max(...bucket.map(c => c.b)) - Math.min(...bucket.map(c => c.b));

      const range = Math.max(rRange, gRange, bRange);
      if (range > maxRange) {
        maxRange = range;
        maxBucketIdx = i;
        if (rRange === range) maxChannel = 'r';
        else if (gRange === range) maxChannel = 'g';
        else maxChannel = 'b';
      }
    }

    // Split the bucket with largest range
    const bucketToSplit = buckets[maxBucketIdx];
    bucketToSplit.sort((a, b) => a[maxChannel] - b[maxChannel]);

    const median = Math.floor(bucketToSplit.length / 2);
    const bucket1 = bucketToSplit.slice(0, median);
    const bucket2 = bucketToSplit.slice(median);

    buckets.splice(maxBucketIdx, 1, bucket1, bucket2);
  }

  // Calculate average color for each bucket (weighted by pixel count)
  return buckets.map(bucket => {
    const totalWeight = bucket.reduce((sum, c) => sum + c.count, 0);
    const r = Math.round(bucket.reduce((sum, c) => sum + c.r * c.count, 0) / totalWeight);
    const g = Math.round(bucket.reduce((sum, c) => sum + c.g * c.count, 0) / totalWeight);
    const b = Math.round(bucket.reduce((sum, c) => sum + c.b * c.count, 0) / totalWeight);
    const hex = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, count: totalWeight, r, g, b };
  });
}

/**
 * Euclidean distance between two colors in RGB space
 */
function colorDistance(a: ColorCount, b: ColorCount): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

/**
 * Main function: create global color palette for all Niji images
 */
async function main() {
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

  console.log('\n=== NIJI GLOBAL PALETTE CREATION ===');
  console.log(`Target palette size: ${TARGET_PALETTE_SIZE} colors`);
  console.log(`Source directory: ${SOURCE_DIR}\n`);

  const globalColorMap = new Map<string, ColorCount>();

  // Extract colors from all directories
  for (const dir of traitDirs) {
    console.log(`📁 Processing ${dir}...`);
    const dirPath = path.join(SOURCE_DIR, dir);

    if (!fs.existsSync(dirPath)) {
      console.log(`  ⚠️  Directory not found, skipping...`);
      continue;
    }

    const dirColors = await extractAllColors(dirPath);

    // Merge into global map
    for (const [hex, colorData] of dirColors) {
      const existing = globalColorMap.get(hex);
      if (existing) {
        existing.count += colorData.count;
      } else {
        globalColorMap.set(hex, { ...colorData });
      }
    }

    console.log(`  Found ${dirColors.size} unique colors`);
  }

  const totalColors = globalColorMap.size;
  console.log(`\n✓ Total unique colors across all images: ${totalColors}`);

  // Sample colors if too many (keep most common colors)
  const allColors = Array.from(globalColorMap.values()).sort(
    (a, b) => b.count - a.count
  );

  const MAX_COLORS_FOR_PROCESSING = 50000;
  let colorsToProcess = allColors;

  if (allColors.length > MAX_COLORS_FOR_PROCESSING) {
    console.log(
      `\n⚡ Sampling ${MAX_COLORS_FOR_PROCESSING} most common colors from ${totalColors} for faster processing...`
    );
    colorsToProcess = allColors.slice(0, MAX_COLORS_FOR_PROCESSING);
  }

  // Reduce to target palette size using median cut
  console.log(
    `\n🎨 Reducing palette from ${colorsToProcess.length} to ${TARGET_PALETTE_SIZE} colors using median cut algorithm...`
  );
  const palette = medianCutPalette(colorsToProcess, TARGET_PALETTE_SIZE);

  console.log(`✓ Palette optimization complete!`);

  // Save palette
  const paletteHexArray = ['', ...palette.map(c => c.hex)]; // Empty string for transparent
  await fs.promises.writeFile(
    OUTPUT_PALETTE_FILE,
    JSON.stringify(paletteHexArray, null, 2)
  );

  console.log(`\n💾 Palette saved to ${OUTPUT_PALETTE_FILE}`);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Original unique colors: ${totalColors}`);
  console.log(`Final palette size: ${palette.length} colors`);
  console.log(`Compression ratio: ${((palette.length / totalColors) * 100).toFixed(1)}%`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { extractAllColors, medianCutPalette };
