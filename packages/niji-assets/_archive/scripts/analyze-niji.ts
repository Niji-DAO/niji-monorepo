import fs from 'fs';
import path from 'path';

interface NijiData {
  palette: string[];
  images: {
    [category: string]: Array<{ filename: string; data: string }>;
  };
}

/**
 * Comprehensive analysis of Niji data for gas estimation
 */
function analyzeNijiData() {
  console.log('\n=== NIJI DATA ANALYSIS & GAS ESTIMATION ===\n');

  // Load data
  const nijiDataPath = path.join(__dirname, '../src/niji-data.json');
  const nijiData: NijiData = JSON.parse(fs.readFileSync(nijiDataPath, 'utf-8'));

  const { palette, images } = nijiData;

  // File stats
  const fileStats = fs.statSync(nijiDataPath);
  const fileSizeMB = fileStats.size / 1024 / 1024;

  console.log('📊 DATA OVERVIEW');
  console.log(\`  File size: \${fileSizeMB.toFixed(2)} MB (\${fileStats.size.toLocaleString()} bytes)\`);
  console.log(\`  Palette: \${palette.length} colors\`);
  console.log(\`  Total traits: \${Object.values(images).reduce((sum, arr) => sum + arr.length, 0)}\`);
  console.log(\`  Categories: \${Object.keys(images).length}\n\`);

  // Palette analysis
  const paletteHex = palette.slice(1).join(''); // Skip empty string
  const paletteBytes = paletteHex.length / 2;
  console.log('🎨 PALETTE ANALYSIS');
  console.log(\`  Hex data size: \${paletteBytes} bytes\`);
  console.log(\`  Estimated gas: ~\${(paletteBytes * 640).toLocaleString()} (calldata cost)\`);
  console.log(\`  Deployment cost: ~$\${((paletteBytes * 640 * 20 * 3000) / 1e9).toFixed(2)} at 20 gwei, $3000 ETH\n\`);

  // Category analysis
  console.log('📁 CATEGORY BREAKDOWN\n');

  const categories = [
    { key: 'solidBackground', name: 'Solid Backgrounds' },
    { key: 'special', name: 'Special' },
    { key: 'choker', name: 'Choker' },
    { key: 'headphone', name: 'Headphone' },
    { key: 'leftHand', name: 'Left Hand' },
    { key: 'hat', name: 'Hat' },
    { key: 'clothing', name: 'Clothing' },
    { key: 'ear', name: 'Ear' },
    { key: 'back', name: 'Back' },
    { key: 'backDecoration', name: 'Back Decoration' },
    { key: 'background', name: 'Background' },
    { key: 'hair', name: 'Hair' },
  ];

  let totalBytes = 0;
  let totalGas = 0;

  for (const category of categories) {
    const traits = images[category.key];
    if (!traits || traits.length === 0) continue;

    const categoryBytes = traits.reduce((sum: number, trait: any) => {
      const dataBytes = (trait.data.length - 2) / 2; // Remove 0x prefix
      return sum + dataBytes;
    }, 0);

    // Rough gas estimate: calldata = 16 gas/byte (non-zero), storage = much higher
    const estimatedGas = categoryBytes * 640; // Conservative estimate
    const deploymentCost = (estimatedGas * 20 * 3000) / 1e9; // 20 gwei, $3000 ETH

    totalBytes += categoryBytes;
    totalGas += estimatedGas;

    console.log(\`  \${category.name}\`);
    console.log(\`    Items: \${traits.length}\`);
    console.log(\`    Size: \${(categoryBytes / 1024).toFixed(1)} KB (\${categoryBytes.toLocaleString()} bytes)\`);
    console.log(\`    Est. gas: ~\${estimatedGas.toLocaleString()}\`);
    console.log(\`    Est. cost: ~$\${deploymentCost.toFixed(2)}\n\`);
  }

  // Total estimates
  console.log('💰 TOTAL DEPLOYMENT ESTIMATES\n');
  console.log(\`  Total data size: \${(totalBytes / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`  Estimated total gas: ~\${totalGas.toLocaleString()}\`);
  console.log(\`  Estimated cost (20 gwei, $3000 ETH): ~$\${((totalGas * 20 * 3000) / 1e9).toFixed(2)}\`);
  console.log(\`  Estimated cost (50 gwei, $3000 ETH): ~$\${((totalGas * 50 * 3000) / 1e9).toFixed(2)}\`);
  console.log(\`  Estimated cost (100 gwei, $3000 ETH): ~$\${((totalGas * 100 * 3000) / 1e9).toFixed(2)}\n\`);

  // Block limit analysis
  const BLOCK_GAS_LIMIT = 30_000_000;
  const txCount = Math.ceil(totalGas / BLOCK_GAS_LIMIT);

  console.log('⛽ GAS LIMIT ANALYSIS\n');
  console.log(\`  Ethereum block gas limit: \${BLOCK_GAS_LIMIT.toLocaleString()}\`);
  console.log(\`  Minimum transactions needed: \${txCount}\`);
  console.log(\`  Can fit in single block: \${totalGas < BLOCK_GAS_LIMIT ? 'YES ✓' : 'NO ✗'}\n\`);

  // Comparison with Nouns
  console.log('📊 COMPARISON WITH NOUNS\n');

  const nounsDataPath = path.join(__dirname, '../src/image-data.json');
  const nounsStats = fs.statSync(nounsDataPath);
  const nounsSize = nounsStats.size;

  console.log(\`  Nouns data size: \${(nounsSize / 1024).toFixed(1)} KB\`);
  console.log(\`  Niji data size: \${(fileStats.size / 1024).toFixed(1)} KB\`);
  console.log(\`  Size ratio: \${(fileStats.size / nounsSize).toFixed(1)}x larger\n\`);

  // Recommendations
  console.log('💡 RECOMMENDATIONS\n');

  if (fileSizeMB > 1) {
    console.log('  ⚠️  CRITICAL: Data size is too large for practical deployment\n');
    console.log('  Suggested optimizations:');
    console.log('    1. Reduce number of traits:');
    console.log(\`       Current: 561 traits\`);
    console.log(\`       Target: ~150-200 traits (70% reduction)\`);
    console.log(\`       Impact: Would reduce to ~\${(fileSizeMB * 0.3).toFixed(1)} MB\n\`);

    console.log('    2. Simplify image complexity:');
    console.log('       - Use more solid colors instead of gradients');
    console.log('       - Reduce palette from 257 to 128 colors');
    console.log('       - Simplify hair/clothing details');
    console.log(\`       Impact: Additional 40-60% reduction\n\`);

    console.log('    3. Alternative approach:');
    console.log('       - Store images off-chain (IPFS/Arweave)');
    console.log('       - Keep only metadata on-chain');
    console.log('       - Cost: ~$50-100 instead of $10,000+\n');

    console.log('  Target for on-chain deployment:');
    console.log(\`    Current: \${fileSizeMB.toFixed(2)} MB\`);
    console.log('    Target: <0.5 MB');
    console.log(\`    Reduction needed: ~\${((1 - 0.5 / fileSizeMB) * 100).toFixed(0)}%\n\`);
  } else {
    console.log('  ✓ Data size is acceptable for deployment\n');
  }
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  analyzeNijiData();
}

export { analyzeNijiData };
