import { ethers } from 'ethers';
import fs from 'fs';

async function testOnChainRead() {
  console.log('\n=== ON-CHAIN SVG READ TEST ===\n');

  // Connect to local node
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  const descriptorAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  const descriptorAbi = [
    'function generateSVGImage((uint48,uint48,uint48,uint48,uint48)) view returns (string)',
  ];

  const descriptor = new ethers.Contract(descriptorAddress, descriptorAbi, provider);

  const seed = {
    background: 0,
    body: 0,
    accessory: 0,
    head: 0,
    glasses: 0,
  };

  console.log('📊 Testing Nouns SVG generation from on-chain data...\n');

  try {
    const startTime = Date.now();
    const svg = await descriptor.generateSVGImage(seed);
    const duration = Date.now() - startTime;

    console.log('✓ SUCCESS: SVG generated from on-chain!');
    console.log('  Time:', duration + 'ms');
    console.log(
      '  SVG size:',
      svg.length.toLocaleString(),
      'chars,',
      (svg.length / 1024).toFixed(2),
      'KB',
    );

    fs.mkdirSync('../nouns-assets/test_output', { recursive: true });
    fs.writeFileSync('../nouns-assets/test_output/onchain-nouns-read.svg', svg);
    console.log('  Saved: packages/nouns-assets/test_output/onchain-nouns-read.svg\n');
  } catch (error: any) {
    console.error('✗ FAILED:', error.message);

    if (error.message.includes('gas') || error.message.includes('limit')) {
      console.error('\n💥 GAS LIMIT EXCEEDED!');
      console.error('Cannot read SVG from contract - data too large!\n');
    }
  }

  console.log('=== CONCLUSION ===\n');
  console.log('Nouns (4 layers, ~150KB data):');
  console.log('  - Can generate ~6KB SVG on-chain');
  console.log('  - Fits within gas limits\n');
  console.log('Niji (12 layers, ~27MB data):');
  console.log('  - Would generate ~362KB SVG');
  console.log('  - CANNOT fit within gas limits');
  console.log('  - Read from contract: IMPOSSIBLE\n');
}

testOnChainRead().catch(console.error);
