/**
 * Fetch tokenURI from a deployed NijiToken on the current network,
 * decode the embedded SVG, render to PNG, and write all artifacts to
 * deploy/{network}-{tokenId}-render/ for visual verification.
 *
 * Usage:
 *   pnpm exec hardhat run --network baseSepolia scripts/check-tokenuri.ts
 *
 * Env:
 *   NIJI_TOKEN_ADDR  — NijiToken address (required)
 *   NIJI_TOKEN_ID    — token id to fetch (default 0)
 */
import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const NIJI_TOKEN_ADDR = process.env.NIJI_TOKEN_ADDR
  || '0x34C564d0E667FaB03a918530147906a9073ad1aA';
const NIJI_TOKEN_ID = BigInt(process.env.NIJI_TOKEN_ID ?? '0');

async function main() {
  console.log(`\n=== Niji tokenURI render check ===`);
  console.log(`network:  ${network.name}`);
  console.log(`token:    ${NIJI_TOKEN_ADDR}`);
  console.log(`tokenId:  ${NIJI_TOKEN_ID}\n`);

  const token = await ethers.getContractAt('NijiToken', NIJI_TOKEN_ADDR);

  // ---------------- tokenURI ----------------
  const uri = await token.tokenURI(NIJI_TOKEN_ID);
  console.log(`[1] tokenURI length: ${uri.length} chars`);
  if (!uri.startsWith('data:application/json;base64,')) {
    console.error(`✗ unexpected prefix: ${uri.slice(0, 80)}`);
    process.exit(1);
  }

  // ---------------- decode JSON ----------------
  const jsonB64 = uri.slice('data:application/json;base64,'.length);
  const jsonStr = Buffer.from(jsonB64, 'base64').toString('utf8');
  let metadata: any;
  try {
    metadata = JSON.parse(jsonStr);
  } catch (e) {
    console.error(`✗ JSON parse failed`);
    console.error(jsonStr.slice(0, 500));
    process.exit(1);
  }
  console.log(`[2] JSON parse OK: name="${metadata.name}", attributes=${metadata.attributes?.length}`);

  // ---------------- decode SVG ----------------
  if (!metadata.image?.startsWith('data:image/svg+xml;base64,')) {
    console.error(`✗ metadata.image is not base64 SVG: ${metadata.image?.slice(0, 80)}`);
    process.exit(1);
  }
  const svgB64 = metadata.image.slice('data:image/svg+xml;base64,'.length);
  const svgStr = Buffer.from(svgB64, 'base64').toString('utf8');
  const imageTags = svgStr.match(/<image[^>]*>/g) ?? [];
  console.log(`[3] SVG length: ${svgStr.length} chars / <image> tags: ${imageTags.length}`);

  // ---------------- render SVG -> PNG ----------------
  let pngBuf: Buffer | null = null;
  try {
    pngBuf = await sharp(Buffer.from(svgStr), { density: 144 }).png().toBuffer();
    console.log(`[4] SVG → PNG render OK: ${(pngBuf.length / 1024).toFixed(1)}KB`);
  } catch (e: any) {
    console.error(`[4] SVG → PNG render FAILED: ${e.message}`);
  }

  // ---------------- write artifacts ----------------
  const outDir = path.join(__dirname, '..', 'deploy', `${network.name}-${NIJI_TOKEN_ID}-render`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'tokenURI.txt'), uri);
  fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(outDir, 'image.svg'), svgStr);
  if (pngBuf) fs.writeFileSync(path.join(outDir, 'image.png'), pngBuf);

  console.log(`\nArtifacts written to:\n  ${outDir}`);
  console.log(`\nOpen in browser to inspect:`);
  console.log(`  open ${path.join(outDir, 'image.svg')}`);
  if (pngBuf) console.log(`  open ${path.join(outDir, 'image.png')}`);
  console.log(`\nMetadata attributes:`);
  for (const a of (metadata.attributes ?? [])) {
    console.log(`  ${a.trait_type?.padEnd(18)} : ${a.value}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
