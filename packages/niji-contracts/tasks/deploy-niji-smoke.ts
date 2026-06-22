/**
 * Niji smoke deploy task.
 *
 * Deploys NijiArt + NijiDescriptor + NijiSeeder + NijiToken to the target
 * network and seeds each trait category with 3 representative PNG images
 * (worst / median / best by source file size) — 36 images total.
 *
 * After deployment, mints one Niji and verifies tokenURI returns valid JSON
 * with an embedded SVG. The full deploy receipt (contract addresses + gas
 * used + per-trait image hashes) is written to
 * deploy/{network}-{timestamp}-smoke.json for reproducibility.
 *
 * Usage:
 *   pnpm exec hardhat deploy-niji-smoke --network hardhat
 *   pnpm exec hardhat deploy-niji-smoke --network baseSepolia
 *
 * Encoder pipeline: P6 (512×512 / global 256 palette + pngquant + oxipng
 * + 23KB SSTORE2 cap), implemented in niji-assets/scripts/niji-encoder.ts.
 */
import { task } from 'hardhat/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  NIJI_TRAITS,
  NIJI_COMPOSITE_ORDER,
  NIJI_RESOLUTION,
  buildGlobalPalette,
  encodeNijiLayer,
  listTraitFiles,
  pickRepresentative,
} from '../scripts/niji-encoder';

const SOURCE_DIR = path.join(__dirname, '../../niji-assets/images_niji');
const DEPLOY_LOG_DIR = path.join(__dirname, '../deploy');

interface SelectedFile {
  traitId: number;
  name: string;
  dir: string;
  filename: string;
  inputPath: string;
  origSizeKb: number;
  bucket: 'worst' | 'median' | 'best';
}

function selectThreePerTrait(): SelectedFile[] {
  const selected: SelectedFile[] = [];
  for (const t of NIJI_TRAITS) {
    const traitDirAbs = path.join(SOURCE_DIR, t.dir);
    const files = listTraitFiles(traitDirAbs);
    if (files.length === 0) {
      console.warn(`  [skip] ${t.name}: no source images`);
      continue;
    }
    const picks = pickRepresentative(files, 3);
    const buckets: SelectedFile['bucket'][] = ['worst', 'median', 'best'];
    picks.forEach((p, i) => {
      selected.push({
        traitId: t.id,
        name: t.name,
        dir: t.dir,
        filename: p.filename,
        inputPath: path.join(traitDirAbs, p.filename),
        origSizeKb: Number((p.sizeB / 1024).toFixed(2)),
        bucket: buckets[i] ?? 'median',
      });
    });
  }
  return selected;
}

function sha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

task('deploy-niji-smoke', 'Deploy Niji stack + 36 sample PNGs + mint 1 token (P6 pipeline)')
  .setAction(async (_, hre) => {
    const { ethers, network } = hre;

    console.log('\n=== NIJI SMOKE DEPLOY ===');
    console.log(`Network: ${network.name}`);

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

    // ---------------- Step 1: select 3 images per trait ----------------
    console.log('[1] サンプル画像選定 (3 枚/trait = 36 枚)');
    const selected = selectThreePerTrait();
    console.log(`    合計 ${selected.length} 枚`);

    // ---------------- Step 2: build global palette ----------------
    console.log('\n[2] global 256-color palette 構築中...');
    const globalPalette = await buildGlobalPalette(
      selected.map(s => s.inputPath),
      NIJI_RESOLUTION,
    );
    console.log(`    palette size: ${globalPalette.length} colors`);

    // ---------------- Step 3: encode all 36 images ----------------
    console.log('\n[3] PNG encode (P6: 512 / global 256 / pngquant + oxipng + 23KB cap)');
    const encoded = new Map<number, { buf: Buffer; meta: SelectedFile }[]>();
    let totalEncodedKb = 0;
    for (const s of selected) {
      const buf = await encodeNijiLayer(s.inputPath, {
        globalPalette,
        label: `${s.name}/${s.filename}`,
      });
      if (!encoded.has(s.traitId)) encoded.set(s.traitId, []);
      encoded.get(s.traitId)!.push({ buf, meta: s });
      totalEncodedKb += buf.length / 1024;
      console.log(`    ${s.name.padEnd(16)} [${s.bucket.padEnd(6)}] ${s.filename}: ${s.origSizeKb}KB → ${(buf.length / 1024).toFixed(2)}KB`);
    }
    console.log(`    --- 合計 ${totalEncodedKb.toFixed(1)}KB ---`);

    // ---------------- Step 4: deploy NijiArt ----------------
    console.log('\n[4] NijiArt deploy');
    const traitNames = NIJI_TRAITS.map(t => t.name);
    const NijiArt = await ethers.getContractFactory('NijiArt');
    const art = await NijiArt.deploy(deployer.address, traitNames);
    await art.waitForDeployment();
    const artAddr = await art.getAddress();
    console.log(`    NijiArt:        ${artAddr}`);

    // ---------------- Step 5: addTraitImages (batch per trait) ----------------
    console.log('\n[5] addTraitImages (3 images per trait, 12 batches)');
    let totalAddGas = 0n;
    for (const [traitId, items] of encoded) {
      const pngs = items.map(i => i.buf);
      const tx = await art.addTraitImages(traitId, pngs);
      const receipt = await tx.wait();
      totalAddGas += receipt!.gasUsed;
      console.log(`    trait ${traitId} (${NIJI_TRAITS[traitId].name.padEnd(16)}): ${items.length} pngs, gas=${receipt!.gasUsed.toLocaleString()}`);
    }
    console.log(`    --- totalAddGas: ${totalAddGas.toLocaleString()} ---`);

    // ---------------- Step 6: deploy NijiDescriptor ----------------
    console.log('\n[6] NijiDescriptor deploy');
    const NijiDescriptor = await ethers.getContractFactory('NijiDescriptor');
    const descriptor = await NijiDescriptor.deploy(artAddr, NIJI_RESOLUTION, NIJI_COMPOSITE_ORDER);
    await descriptor.waitForDeployment();
    const descriptorAddr = await descriptor.getAddress();
    console.log(`    NijiDescriptor: ${descriptorAddr}`);

    // Transfer art ownership to descriptor
    console.log('    → art.setDescriptor(descriptor)');
    await (await art.setDescriptor(descriptorAddr)).wait();

    // ---------------- Step 7: deploy NijiSeeder ----------------
    console.log('\n[7] NijiSeeder deploy');
    const NijiSeeder = await ethers.getContractFactory('NijiSeeder');
    const seeder = await NijiSeeder.deploy(artAddr);
    await seeder.waitForDeployment();
    const seederAddr = await seeder.getAddress();
    console.log(`    NijiSeeder:     ${seederAddr}`);

    // ---------------- Step 8: deploy NijiToken ----------------
    console.log('\n[8] NijiToken deploy');
    const NijiToken = await ethers.getContractFactory('NijiToken');
    const token = await NijiToken.deploy(
      'Niji',
      'NIJI',
      descriptorAddr,
      seederAddr,
      0n, // unlimited supply
    );
    await token.waitForDeployment();
    const tokenAddr = await token.getAddress();
    console.log(`    NijiToken:      ${tokenAddr}`);

    // ---------------- Step 9: placeholder + minting enable + mint 1 ----------------
    // Niji's `_mintTo` requires a non-empty placeholder URI while not revealed
    // (PR #247), so set one before flipping minting on.
    // Explicit gasLimit avoids Base public RPC race on estimateGas when
    // the previous tx state hasn't yet propagated.
    console.log('\n[9] placeholder + minting enable + mint 1');
    await (await token.setPlaceholderURI('ipfs://niji-placeholder/metadata.json')).wait();
    await (await token.setMintingActive(true)).wait();
    const mintTx = await token.mint(deployer.address, { gasLimit: 500_000n });
    const mintReceipt = await mintTx.wait();
    console.log(`    mint gas: ${mintReceipt!.gasUsed.toLocaleString()}`);

    const tokenId = 0n;
    const seed = await token.seeds(tokenId);
    console.log(`    seed traits:`);
    for (let i = 0; i < NIJI_TRAITS.length; i++) {
      const idx = seed[i];
      console.log(`      ${NIJI_TRAITS[i].name.padEnd(16)}: index=${idx}`);
    }

    // Sanity check: verify art contract actually has trait images loaded.
    // If getTraitImageCount returns 0, the on-chain seed picker collapses to SKIP_LAYER
    // (type(uint256).max), which then truncates to uint48 max in the Seed struct.
    console.log(`    art trait image counts:`);
    for (let i = 0; i < NIJI_TRAITS.length; i++) {
      const cnt = await art.getTraitImageCount(i);
      console.log(`      ${NIJI_TRAITS[i].name.padEnd(16)}: ${cnt}`);
    }

    // Reveal so tokenURI returns the on-chain SVG metadata (instead of the placeholder).
    console.log('    → reveal()');
    await (await token.reveal()).wait();

    // ---------------- Step 10: tokenURI verification ----------------
    console.log('\n[10] tokenURI 検証');
    const expandedIndices = await token.getTraitIndices(tokenId);
    console.log(`    expanded indices: [${expandedIndices.map((x: bigint) => x.toString()).join(', ')}]`);
    // tokenURI builds a full on-chain SVG by concatenating every trait layer (≈150-200 KB total).
    // Anvil's eth_call gas limit defaults to 30M, which can revert the call for layer-heavy mints.
    // Bump the call-time gas allowance so localhost smoke matches the contract's static-call needs.
    const uri = await token.tokenURI(tokenId, { gasLimit: 300_000_000n } as any);
    console.log(`    tokenURI length: ${uri.length} chars`);
    if (!uri.startsWith('data:application/json;base64,')) {
      throw new Error('tokenURI does not start with expected data URI prefix');
    }
    const jsonB64 = uri.slice('data:application/json;base64,'.length);
    const jsonStr = Buffer.from(jsonB64, 'base64').toString('utf8');
    let metadata: { name: string; image: string; attributes: { trait_type: string; value: string }[] };
    try {
      metadata = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse tokenURI JSON:', jsonStr.slice(0, 200));
      throw e;
    }
    if (!metadata.image?.startsWith('data:image/svg+xml;base64,')) {
      throw new Error('metadata.image is not a base64 SVG');
    }
    const svgB64 = metadata.image.slice('data:image/svg+xml;base64,'.length);
    const svgStr = Buffer.from(svgB64, 'base64').toString('utf8');
    const imageTagCount = (svgStr.match(/<image\s/g) ?? []).length;
    console.log(`    ✓ JSON parsed: name="${metadata.name}", attributes=${metadata.attributes.length}`);
    console.log(`    ✓ SVG layers:  ${imageTagCount} <image> tags (expected 12, SKIP_LAYER reduces)`);

    // ---------------- Step 11: write deploy log ----------------
    if (!fs.existsSync(DEPLOY_LOG_DIR)) fs.mkdirSync(DEPLOY_LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(DEPLOY_LOG_DIR, `${network.name}-${timestamp}-smoke.json`);
    const deployLog = {
      network: network.name,
      timestamp,
      deployer: deployer.address,
      contracts: {
        NijiArt: artAddr,
        NijiDescriptor: descriptorAddr,
        NijiSeeder: seederAddr,
        NijiToken: tokenAddr,
      },
      encodePipeline: {
        resolution: NIJI_RESOLUTION,
        paletteMode: 'global-256',
        postProcess: 'pngquant+oxipng',
        sstore2CapBytes: 23 * 1024,
      },
      images: selected.map(s => {
        const entries = encoded.get(s.traitId)!;
        const entry = entries.find(e => e.meta.filename === s.filename)!;
        return {
          traitId: s.traitId,
          traitName: s.name,
          bucket: s.bucket,
          filename: s.filename,
          origKb: s.origSizeKb,
          encodedKb: Number((entry.buf.length / 1024).toFixed(2)),
          sha256: sha256(entry.buf),
        };
      }),
      gas: {
        addTraitImagesTotal: totalAddGas.toString(),
        mint: mintReceipt!.gasUsed.toString(),
      },
      mintedToken: {
        tokenId: tokenId.toString(),
        traitIndices: seed.map((s: bigint) => s.toString()),
        tokenUriLength: uri.length,
        svgImageTagCount: imageTagCount,
        attributesCount: metadata.attributes.length,
      },
    };
    fs.writeFileSync(logPath, JSON.stringify(deployLog, null, 2));
    console.log(`\n[11] deploy log: ${logPath}`);

    // Persist the latest contract addresses under deployments/<network>.json so downstream tools
    // (SDK / webapp / scripts) can read a stable path without scanning timestamped log files.
    // smoke does not deploy auction / WETH, so the `profile` discriminator lets consumers tell
    // which task produced the snapshot.
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });
    const latestPath = path.join(deploymentsDir, `${network.name}.json`);
    const latestPayload = {
      profile: 'smoke' as const,
      network: deployLog.network,
      chainId: Number((await ethers.provider.getNetwork()).chainId),
      // Use canonical raw ISO timestamp (deploy-niji-full uses the same format) instead of the
      // filename-safe variant from `deployLog.timestamp`, so consumers can parse a single format.
      timestamp: new Date().toISOString(),
      deployer: deployLog.deployer,
      contracts: deployLog.contracts,
    };
    fs.writeFileSync(latestPath, JSON.stringify(latestPayload, null, 2) + '\n');
    console.log(`[11] deployments snapshot: ${latestPath}`);

    console.log('\n=== SMOKE DEPLOY OK ===');
  });
