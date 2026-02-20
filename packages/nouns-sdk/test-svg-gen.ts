import { buildSVG } from './src/image/svg-builder';
import ImageData from '../nouns-assets/src/image-data.json';
import NijiData from '../nouns-assets/src/niji-data.json';
import fs from 'fs';

console.log('\n=== SVG GENERATION TEST ===\n');

// Test with Nouns data
console.log('📊 NOUNS DATA TEST');
try {
  const parts = [
    ImageData.images.bodies[0],
    ImageData.images.accessories[5],
    ImageData.images.heads[10],
    ImageData.images.glasses[3],
  ];

  const svg = buildSVG(parts, ImageData.palette, ImageData.bgcolors[0]);

  console.log('✓ Nouns SVG generated!');
  console.log('  Size:', (svg.length / 1024).toFixed(2), 'KB');

  fs.mkdirSync('../nouns-assets/test_output', { recursive: true });
  fs.writeFileSync('../nouns-assets/test_output/nouns-test.svg', svg);
  console.log('  Saved to: packages/nouns-assets/test_output/nouns-test.svg\n');
} catch (error: any) {
  console.error('✗ Nouns test failed:', error.message, '\n');
}

// Test with Niji data - carefully select existing traits
console.log('📊 NIJI DATA TEST (12 LAYERS)');

// Check what traits exist
const nijiImages = NijiData.images as any;
console.log('Available categories:');
for (const [key, value] of Object.entries(nijiImages)) {
  console.log(`  ${key}: ${(value as any[]).length} items`);
}

try {
  // Build parts array with existing data only
  const parts = [];

  // Add each layer if it exists
  if (nijiImages.solidBackground?.length) parts.push(nijiImages.solidBackground[0]);
  if (nijiImages.background?.length) parts.push(nijiImages.background[0]);
  if (nijiImages.back?.length) parts.push(nijiImages.back[0]);
  if (nijiImages.backDecoration?.length) parts.push(nijiImages.backDecoration[0]);
  if (nijiImages.clothing?.length) parts.push(nijiImages.clothing[5]);
  if (nijiImages.leftHand?.length) parts.push(nijiImages.leftHand[0]);
  if (nijiImages.ear?.length) parts.push(nijiImages.ear[0]);
  if (nijiImages.hair?.length) parts.push(nijiImages.hair[10]);
  if (nijiImages.choker?.length) parts.push(nijiImages.choker[0]);
  if (nijiImages.hat?.length) parts.push(nijiImages.hat[5]);
  if (nijiImages.headphone?.length) parts.push(nijiImages.headphone[2]);
  if (nijiImages.special?.length) parts.push(nijiImages.special[0]);

  console.log(`\nComposing ${parts.length} layers...`);

  const startTime = Date.now();
  const svg = buildSVG(parts, NijiData.palette, 'd5d7e1');
  const duration = Date.now() - startTime;

  console.log('\n✓ Niji SVG generated!');
  console.log('  Layers:', parts.length);
  console.log('  Generation time:', duration, 'ms');
  console.log('  SVG size:', (svg.length / 1024).toFixed(2), 'KB');
  console.log('  SVG char count:', svg.length.toLocaleString());

  fs.writeFileSync('../nouns-assets/test_output/niji-test-12layers.svg', svg);
  console.log('  Saved to: packages/nouns-assets/test_output/niji-test-12layers.svg\n');
} catch (error: any) {
  console.error('✗ Niji test failed:', error.message);
  console.error(error.stack, '\n');
}

console.log('=== DONE ===\n');
console.log('Check output files:');
console.log('  packages/nouns-assets/test_output/nouns-test.svg');
console.log('  packages/nouns-assets/test_output/niji-test-12layers.svg\n');
