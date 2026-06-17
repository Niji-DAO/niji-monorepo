import { task, types } from 'hardhat/config';
import fs from 'fs';
import path from 'path';

task('test-svg-generation', 'Test SVG generation from deployed Nouns descriptor and save output')
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptorV3` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptorV2` contract address',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    types.string,
  )
  .setAction(async ({ nounsDescriptor, nftDescriptor }, { ethers }) => {
    console.log('\n=== SVG GENERATION TEST ===\n');

    // Get descriptor contract
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptorV3', {
      libraries: {
        NFTDescriptorV2: nftDescriptor,
      },
    });
    const descriptor = descriptorFactory.attach(nounsDescriptor);

    // Test with different seeds
    const seeds = [
      { background: 0, body: 0, accessory: 0, head: 0, glasses: 0, name: 'noun-0-0-0-0-0' },
      { background: 1, body: 5, accessory: 10, head: 15, glasses: 3, name: 'noun-1-5-10-15-3' },
      { background: 2, body: 10, accessory: 20, head: 30, glasses: 8, name: 'noun-2-10-20-30-8' },
    ];

    const outputDir = path.join(__dirname, '../../nouns-assets/test_output');
    await fs.promises.mkdir(outputDir, { recursive: true });

    for (const seed of seeds) {
      console.log(`\n📝 Testing seed: ${seed.name}`);
      console.log(
        `   Background: ${seed.background}, Body: ${seed.body}, Accessory: ${seed.accessory}, Head: ${seed.head}, Glasses: ${seed.glasses}`,
      );

      try {
        // Generate SVG directly (view call)
        console.log('   Generating SVG...');
        const startTime = Date.now();
        const svg = await descriptor.generateSVGImage(seed);
        const duration = Date.now() - startTime;

        console.log(`   ✓ SVG generated in ${duration}ms`);
        console.log(
          `   ✓ SVG size: ${svg.length.toLocaleString()} characters (${(svg.length / 1024).toFixed(2)} KB)`,
        );

        // Save to file
        const outputPath = path.join(outputDir, `${seed.name}.svg`);
        await fs.promises.writeFile(outputPath, svg);
        console.log(`   ✓ Saved to: ${outputPath}`);
      } catch (error: any) {
        console.error(`   ✗ FAILED: ${error.message}`);
        if (error.message.includes('gas') || error.message.includes('limit')) {
          console.error('   💥 GAS LIMIT EXCEEDED - Cannot read/generate SVG');
          console.error('   This means the data is too large to read from the contract!');
        }
      }
    }

    console.log('\n=== TEST COMPLETE ===\n');
    console.log(`Output directory: ${outputDir}`);
    console.log('Check the generated SVG files to verify image quality.\n');
  });
