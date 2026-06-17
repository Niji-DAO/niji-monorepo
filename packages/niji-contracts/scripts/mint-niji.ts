/**
 * Mint N additional Niji tokens on the current network, fetch each token's
 * tokenURI, decode + render to PNG, and write artifacts to
 * deploy/{network}-{tokenId}-render/.
 *
 * Usage:
 *   pnpm exec hardhat run --network baseSepolia scripts/mint-niji.ts
 *
 * Env:
 *   NIJI_TOKEN_ADDR — NijiToken address (required)
 *   NIJI_MINT_COUNT — number of new mints (default 5)
 *   NIJI_MINT_TO    — recipient (default = deployer)
 */
import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const NIJI_TOKEN_ADDR = process.env.NIJI_TOKEN_ADDR
  || '0x34C564d0E667FaB03a918530147906a9073ad1aA';
const COUNT = Number(process.env.NIJI_MINT_COUNT ?? '5');

async function renderToken(token: any, tokenId: bigint, network_name: string) {
  const uri = await token.tokenURI(tokenId);
  const jsonB64 = uri.slice('data:application/json;base64,'.length);
  const metadata = JSON.parse(Buffer.from(jsonB64, 'base64').toString('utf8'));
  const svgB64 = metadata.image.slice('data:image/svg+xml;base64,'.length);
  const svgStr = Buffer.from(svgB64, 'base64').toString('utf8');
  const imageTags = (svgStr.match(/<image[^>]*>/g) ?? []).length;

  let pngBuf: Buffer | null = null;
  try {
    pngBuf = await sharp(Buffer.from(svgStr), { density: 144 }).png().toBuffer();
  } catch {}

  const outDir = path.join(__dirname, '..', 'deploy', `${network_name}-${tokenId}-render`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'tokenURI.txt'), uri);
  fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(outDir, 'image.svg'), svgStr);
  if (pngBuf) fs.writeFileSync(path.join(outDir, 'image.png'), pngBuf);

  return {
    uriLen: uri.length,
    svgLen: svgStr.length,
    imageTags,
    pngKb: pngBuf ? Number((pngBuf.length / 1024).toFixed(1)) : null,
    attrs: metadata.attributes ?? [],
    outDir,
  };
}

async function main() {
  console.log(`\n=== Niji additional mint ${COUNT} tokens ===`);
  console.log(`network:  ${network.name}`);
  console.log(`token:    ${NIJI_TOKEN_ADDR}\n`);

  const [signer] = await ethers.getSigners();
  const to = process.env.NIJI_MINT_TO || signer.address;
  console.log(`recipient: ${to}`);

  const token = await ethers.getContractAt('NijiToken', NIJI_TOKEN_ADDR);

  const totalSupplyBefore: bigint = await token.totalSupply();
  console.log(`totalSupply before: ${totalSupplyBefore}\n`);

  // Use explicit gasLimit to avoid Base public RPC race on estimateGas
  // (sequential mints fail when RPC hasn't yet picked up the previous tx state)
  const MINT_GAS_LIMIT = 500_000n;

  const minted: bigint[] = [];
  for (let i = 0; i < COUNT; i++) {
    process.stdout.write(`  [${i + 1}/${COUNT}] mint... `);
    const tx = await token.mint(to, { gasLimit: MINT_GAS_LIMIT });
    const receipt = await tx.wait(2); // wait for 2 confirmations on public RPC
    const tokenId = totalSupplyBefore + BigInt(i);
    minted.push(tokenId);
    console.log(`tokenId=${tokenId}  gas=${receipt!.gasUsed.toLocaleString()}`);
  }

  console.log(`\n--- rendering ${minted.length} tokens ---`);
  const summary: any[] = [];
  for (const id of minted) {
    process.stdout.write(`  tokenId=${id}: `);
    const r = await renderToken(token, id, network.name);
    console.log(`uri=${(r.uriLen / 1024).toFixed(1)}KB / svg=${(r.svgLen / 1024).toFixed(1)}KB / layers=${r.imageTags} / png=${r.pngKb}KB`);
    summary.push({ tokenId: id.toString(), ...r });
  }

  const idxPath = path.join(__dirname, '..', 'deploy', `${network.name}-mint-batch.json`);
  fs.writeFileSync(idxPath, JSON.stringify({
    network: network.name,
    contractAddress: NIJI_TOKEN_ADDR,
    mintedAt: new Date().toISOString(),
    recipient: to,
    minted: summary.map(s => ({
      tokenId: s.tokenId,
      uriLen: s.uriLen,
      svgLen: s.svgLen,
      imageTags: s.imageTags,
      pngKb: s.pngKb,
      attrs: s.attrs,
    })),
  }, null, 2));
  console.log(`\nbatch summary: ${idxPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
