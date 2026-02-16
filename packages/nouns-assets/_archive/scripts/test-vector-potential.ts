import sharp from 'sharp';
import fs from 'fs';

// Test: Analyze image for vectorization potential
async function analyzeImage(imagePath: string) {
  const stats = fs.statSync(imagePath);

  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Count unique colors
  const colors = new Set<string>();
  let transparent = 0;
  let opaque = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) {
      transparent++;
    } else {
      opaque++;
      const color = `${data[i]},${data[i+1]},${data[i+2]}`;
      colors.add(color);
    }
  }

  return {
    filename: imagePath.split('/').pop(),
    fileSize: stats.size,
    width: info.width,
    height: info.height,
    totalPixels: info.width * info.height,
    uniqueColors: colors.size,
    transparent,
    opaque,
    transparencyRatio: transparent / (info.width * info.height),
  };
}

async function main() {
  console.log('\n=== VECTORIZATION POTENTIAL ANALYSIS ===\n');

  const categories = [
    './images_niji_optimized/12_髪の毛/IMG_1698.PNG',
    './images_niji_optimized/06_服/IMG_1989.PNG',
    './images_niji_optimized/05_帽子/IMG_2163.PNG',
    './images_niji_optimized/11_背景単色/IMG_2254.PNG',
  ];

  for (const img of categories) {
    if (!fs.existsSync(img)) continue;

    const analysis = await analyzeImage(img);

    console.log(`📊 ${analysis.filename}`);
    console.log(`   Size: ${(analysis.fileSize / 1024).toFixed(2)} KB`);
    console.log(`   Dimensions: ${analysis.width}x${analysis.height}`);
    console.log(`   Unique colors: ${analysis.uniqueColors}`);
    console.log(`   Transparency: ${(analysis.transparencyRatio * 100).toFixed(1)}%`);
    console.log(`   Opaque pixels: ${analysis.opaque.toLocaleString()}`);

    // Estimate vector compression
    if (analysis.transparencyRatio > 0.7) {
      console.log(`   ✅ EXCELLENT for vectorization (>70% transparent)`);
    } else if (analysis.transparencyRatio > 0.5) {
      console.log(`   ✓ GOOD for vectorization (>50% transparent)`);
    } else {
      console.log(`   ⚠️  Less suitable for vectorization (<50% transparent)`);
    }
    console.log('');
  }

  console.log('\n=== ALTERNATIVE APPROACH: Delta Encoding ===\n');
  console.log('Instead of vectorization, use delta encoding:');
  console.log('1. Store base layer (background/body)');
  console.log('2. Store only DIFFERENCES for each additional layer');
  console.log('3. Much smaller than full RLE for sparse layers\n');

  console.log('Example:');
  console.log('  Full RLE: 30 KB per layer × 12 = 360 KB');
  console.log('  Delta encoding: 30 KB (base) + 5 KB × 11 (deltas) = 85 KB');
  console.log('  Savings: ~76%\n');
}

main().catch(console.error);
