import { optimizeImage } from './optimize-niji';
import path from 'path';

// Test on 3 sample images
const samples = [
  {
    input: '/Users/cardene/Downloads/niji/niji/06_服/IMG_1989.PNG',
    output: './test_output/clothing_test.png',
  },
  {
    input: '/Users/cardene/Downloads/niji/niji/12_髪の毛/IMG_1698.PNG',
    output: './test_output/hair_test.png',
  },
  {
    input: '/Users/cardene/Downloads/niji/niji/05_帽子/IMG_1956.PNG',
    output: './test_output/hat_test.png',
  },
];

async function main() {
  console.log('\n=== OPTIMIZATION TEST ===\n');

  // Create output directory
  const fs = await import('fs');
  await fs.promises.mkdir('./test_output', { recursive: true });

  for (const sample of samples) {
    console.log(`\nProcessing: ${path.basename(sample.input)}`);
    try {
      const result = await optimizeImage(sample.input, sample.output);

      console.log(`  Original:  ${(result.originalSize / 1024).toFixed(1)} KB`);
      console.log(`  Optimized: ${(result.optimizedSize / 1024).toFixed(1)} KB`);
      console.log(
        `  Reduction: ${((1 - result.compressionRatio) * 100).toFixed(1)}%`
      );
      console.log(`  Output: ${sample.output}`);
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }

  console.log('\n✓ Test complete! Check ./test_output/ for optimized images.');
}

main();
