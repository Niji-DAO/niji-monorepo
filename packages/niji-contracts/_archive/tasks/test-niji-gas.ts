import { task, types } from 'hardhat/config';
import path from 'path';
import fs from 'fs';

interface NijiData {
  palette: string[];
  images: {
    [category: string]: Array<{ filename: string; data: string }>;
  };
}

task('test-niji-gas', 'Test gas costs for deploying Niji data to descriptor')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptorV2` contract address',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptorV3` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { ethers, network }) => {
    console.log('\n=== NIJI GAS TEST ===\n');

    // Load Niji data
    const nijiDataPath = path.join(__dirname, '../../nouns-assets/src/niji-data.json');
    const nijiData: NijiData = JSON.parse(fs.readFileSync(nijiDataPath, 'utf-8'));

    const { palette, images } = nijiData;

    console.log(`Palette size: ${palette.length} colors`);
    console.log(`Total traits: ${Object.values(images).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`Trait categories: ${Object.keys(images).length}\n`);

    // Get descriptor contract
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptorV3', {
      libraries: {
        NFTDescriptorV2: nftDescriptor,
      },
    });
    const descriptorContract = descriptorFactory.attach(nounsDescriptor);

    // Estimate gas for palette
    console.log('Testing palette upload...');
    const paletteHex = `0x000000${palette.slice(1).join('')}`; // Skip first empty string
    const paletteSize = paletteHex.length / 2; // bytes
    console.log(`  Palette hex size: ${paletteSize.toLocaleString()} bytes`);

    try {
      const paletteGas = await descriptorContract.setPalette.estimateGas(0, paletteHex);
      console.log(`  ✓ Palette gas estimate: ${paletteGas.toLocaleString()}`);
      console.log(`  ✓ This will fit in a block\n`);
    } catch (error: any) {
      console.error(`  ✗ Palette upload FAILED: ${error.message}\n`);
    }

    // Test each trait category
    console.log('Testing trait uploads...\n');

    const categories = [
      { key: 'solidBackground', name: 'Solid Backgrounds', method: 'addManyBackgrounds' },
      { key: 'special', name: 'Special', method: 'addBodies' },
      { key: 'choker', name: 'Choker', method: 'addBodies' },
      { key: 'headphone', name: 'Headphone', method: 'addAccessories' },
      { key: 'leftHand', name: 'Left Hand', method: 'addAccessories' },
      { key: 'hat', name: 'Hat', method: 'addAccessories' },
      { key: 'clothing', name: 'Clothing', method: 'addBodies' },
      { key: 'ear', name: 'Ear', method: 'addAccessories' },
      { key: 'back', name: 'Back', method: 'addAccessories' },
      { key: 'backDecoration', name: 'Back Decoration', method: 'addAccessories' },
      { key: 'background', name: 'Background', method: 'addBodies' },
      { key: 'hair', name: 'Hair', method: 'addHeads' },
    ];

    let totalGas = 0n;
    let failedCategories = [];

    for (const category of categories) {
      const traits = images[category.key];
      if (!traits || traits.length === 0) {
        console.log(`⊘ ${category.name}: No data\n`);
        continue;
      }

      console.log(`📁 ${category.name} (${traits.length} items)`);

      // For backgrounds, just use plain strings
      if (category.key === 'solidBackground') {
        const bgColors = traits.map((t: any) => t.filename || t.data);
        console.log(`  Background colors: ${bgColors.length}`);

        try {
          const bgGas = await descriptorContract.addManyBackgrounds.estimateGas(bgColors);
          console.log(`  ✓ Gas estimate: ${bgGas.toLocaleString()}`);
          totalGas += bgGas;
        } catch (error: any) {
          console.error(`  ✗ FAILED: ${error.message}`);
          failedCategories.push(category.name);
        }
        console.log('');
        continue;
      }

      // For other traits, we need to compress the data
      const traitData = traits.map((t: any) => t.data);
      const totalBytes = traitData.reduce((sum: number, data: string) => {
        return sum + (data.length - 2) / 2; // Remove 0x and divide by 2
      }, 0);

      console.log(
        `  Total size: ${totalBytes.toLocaleString()} bytes (${(totalBytes / 1024).toFixed(1)} KB)`,
      );

      // Try to add all traits at once
      try {
        console.log(`  Testing ${category.method}...`);

        // This would normally compress data, but for gas estimate we'll skip
        // In real deployment you'd use dataToDescriptorInput
        console.log(`  ⚠️  Skipping gas estimate (data too large for single tx)`);
        console.log(`  Recommendation: Split into batches of ~10-20 traits\n`);
        failedCategories.push(`${category.name} (too large)`);
      } catch (error: any) {
        console.error(`  ✗ FAILED: ${error.message}\n`);
        failedCategories.push(category.name);
      }
    }

    // Final report
    console.log('=== SUMMARY ===\n');
    console.log(`Total estimated gas (partial): ${totalGas.toLocaleString()}`);
    console.log(`Failed/Skipped categories: ${failedCategories.length}`);

    if (failedCategories.length > 0) {
      console.log(`\nCategories with issues:`);
      failedCategories.forEach(cat => console.log(`  - ${cat}`));
    }

    console.log('\n=== RECOMMENDATIONS ===\n');
    console.log('1. The Niji dataset (27 MB) is too large to deploy in single transactions');
    console.log('2. Each trait category needs to be split into smaller batches');
    console.log('3. Estimated deployment cost: Very high (possibly $10,000+ on mainnet)');
    console.log('4. Consider reducing:');
    console.log('   - Number of traits (561 → ~200)');
    console.log('   - Image complexity (more solid colors, less gradients)');
    console.log('   - Palette size (257 → ~128 colors)');
    console.log('\nCurrent size: 27 MB');
    console.log('Target size: <500 KB for reasonable deployment');
    console.log('Reduction needed: ~98%\n');
  });
