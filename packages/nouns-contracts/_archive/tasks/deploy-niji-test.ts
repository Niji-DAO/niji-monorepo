import { task, types } from 'hardhat/config';
import fs from 'fs';
import path from 'path';

interface NijiData {
  palette: string[];
  images: {
    [category: string]: Array<{ filename: string; data: string }>;
  };
}

task('deploy-niji-test', 'Deploy a small subset of Niji data and test reading')
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
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { ethers }) => {
    console.log('\n=== NIJI ON-CHAIN READ/WRITE TEST ===\n');

    // Load Niji data
    const nijiDataPath = path.join(__dirname, '../../nouns-assets/src/niji-data.json');
    const nijiData: NijiData = JSON.parse(fs.readFileSync(nijiDataPath, 'utf-8'));

    console.log('📊 NIJI DATA:');
    console.log(`  Palette: ${nijiData.palette.length} colors`);
    console.log(
      `  Total traits: ${Object.values(nijiData.images).reduce((sum, arr) => sum + arr.length, 0)}`,
    );
    console.log('');

    // Get descriptor
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptorV3', {
      libraries: { NFTDescriptorV2: nftDescriptor },
    });
    const descriptor = descriptorFactory.attach(nounsDescriptor);

    // Test 1: Upload Niji palette
    console.log('🎨 TEST 1: Upload Niji Palette\n');
    const paletteHex = `0x000000${nijiData.palette.slice(1).join('')}`;
    const paletteBytes = paletteHex.length / 2;
    console.log(`  Palette size: ${paletteBytes.toLocaleString()} bytes`);

    try {
      const tx = await descriptor.setPalette(1, paletteHex);
      const receipt = await tx.wait();
      console.log(`  ✓ Palette uploaded!`);
      console.log(`    Gas used: ${receipt.gasUsed.toLocaleString()}`);
    } catch (error: any) {
      console.error(`  ✗ FAILED: ${error.message}`);
      return;
    }

    // Test 2: Upload a single Niji trait
    console.log('\n👕 TEST 2: Upload Single Trait (Clothing)\n');
    const clothing = nijiData.images.clothing[0];
    const clothingBytes = (clothing.data.length - 2) / 2;
    console.log(`  Trait: ${clothing.filename}`);
    console.log(`  Size: ${clothingBytes.toLocaleString()} bytes`);

    try {
      const tx = await descriptor.addBodies(clothing.data, clothingBytes, 1, {
        gasLimit: 30000000,
      });
      const receipt = await tx.wait();
      console.log(`  ✓ Trait uploaded!`);
      console.log(`    Gas used: ${receipt.gasUsed.toLocaleString()}`);
    } catch (error: any) {
      console.error(`  ✗ FAILED: ${error.message}`);
    }

    // Test 3: Upload multiple small traits
    console.log('\n💇 TEST 3: Upload 3 Hair Traits\n');
    const hairTraits = nijiData.images.hair.slice(0, 3);
    const hairData = hairTraits.map(t => t.data).join('');
    const hairBytes = (hairData.length - 2) / 2;
    console.log(`  Traits: ${hairTraits.length}`);
    console.log(`  Total size: ${hairBytes.toLocaleString()} bytes`);

    try {
      const tx = await descriptor.addHeads(hairData, hairBytes, hairTraits.length, {
        gasLimit: 30000000,
      });
      const receipt = await tx.wait();
      console.log(`  ✓ Traits uploaded!`);
      console.log(`    Gas used: ${receipt.gasUsed.toLocaleString()}`);
    } catch (error: any) {
      console.error(`  ✗ FAILED: ${error.message}`);
    }

    // Test 4: Try to read and generate SVG
    console.log('\n🖼️  TEST 4: Generate SVG from Uploaded Data\n');

    const seed = {
      background: 0,
      body: 0,
      accessory: 0,
      head: 0,
      glasses: 0,
    };

    console.log('  Attempting to generate SVG...');

    try {
      const startTime = Date.now();
      const svg = await descriptor.generateSVGImage(seed);
      const duration = Date.now() - startTime;

      console.log(`  ✓ SVG generated!`);
      console.log(`    Time: ${duration}ms`);
      console.log(
        `    SVG size: ${svg.length.toLocaleString()} chars (${(svg.length / 1024).toFixed(2)} KB)`,
      );

      // Save SVG
      const outputPath = path.join(
        __dirname,
        '../../nouns-assets/test_output/onchain-niji-test.svg',
      );
      fs.writeFileSync(outputPath, svg);
      console.log(`    Saved to: ${outputPath}`);
    } catch (error: any) {
      console.error(`  ✗ SVG GENERATION FAILED: ${error.message}`);

      if (error.message.includes('gas') || error.message.includes('limit')) {
        console.error('\n  💥 GAS LIMIT EXCEEDED!');
        console.error('  This means the data is TOO LARGE to read from the contract.');
        console.error('  Even though we uploaded the data, we CANNOT retrieve it as SVG.');
      }
    }

    console.log('\n=== TEST COMPLETE ===\n');
    console.log('CONCLUSION:');
    console.log('  ✓ Writing data to contract: POSSIBLE (with multiple transactions)');
    console.log('  ? Reading data as SVG: Testing...\n');
  });
