/**
 * Niji full image upload task (Issue #42).
 *
 * Uploads all Niji trait images (up to 561 in production) to an already-deployed
 * NijiArt contract, batching by category to amortize gas. Uses NijiArt's
 * `addTraitImages(uint256, bytes[])` batch API instead of the single
 * `addTraitImage` per call.
 *
 * Batches respect a hard cap of 50 images per tx (matching the NijiArt mintBatch
 * limit established in Issue #32) so each upload tx stays within block gas limits.
 * Larger trait directories are split into multiple consecutive batches.
 *
 * Usage:
 *   pnpm exec hardhat upload-niji-images \
 *     --network sepolia \
 *     --art 0x... \
 *     --resolution 320
 *
 * Optional:
 *   --batchsize 50          Override max images per tx (default 50, max 50)
 *   --resume 5              Skip the first N images per trait (for retry / partial run)
 *   --dryrun                Print plan + estimated gas only, no on-chain tx
 *   --traits 0,1,4          Limit to specific trait ids (comma separated)
 */
import { task } from 'hardhat/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_DIR = path.join(__dirname, '../../niji-assets/images_niji');
const TRAIT_DIRS = [
  { dir: '01_スペシャル', name: 'special', id: 0 },
  { dir: '02_チョーカー', name: 'choker', id: 1 },
  { dir: '03_ヘッドホン', name: 'headphone', id: 2 },
  { dir: '04_左手', name: 'leftHand', id: 3 },
  { dir: '05_帽子', name: 'hat', id: 4 },
  { dir: '06_服', name: 'clothing', id: 5 },
  { dir: '07_耳', name: 'ear', id: 6 },
  { dir: '08_背中', name: 'back', id: 7 },
  { dir: '09_背中の装飾', name: 'backDecoration', id: 8 },
  { dir: '10_背景', name: 'background', id: 9 },
  { dir: '11_背景単色', name: 'solidBackground', id: 10 },
  { dir: '12_髪の毛', name: 'hair', id: 11 },
];

const DEFAULT_BATCH_SIZE = 50;
const MAX_BATCH_SIZE = 50;
const DEFAULT_RESOLUTION = 320;

interface UploadPlanEntry {
  traitId: number;
  traitName: string;
  files: string[];
  batches: string[][];
}

function planUploads(
  parsedTraits: number[] | null,
  resumeOffset: number,
  batchSize: number,
): UploadPlanEntry[] {
  const plan: UploadPlanEntry[] = [];

  for (const trait of TRAIT_DIRS) {
    if (parsedTraits && !parsedTraits.includes(trait.id)) continue;

    const traitPath = path.join(BASE_DIR, trait.dir);
    if (!fs.existsSync(traitPath)) continue;

    const allFiles = fs
      .readdirSync(traitPath)
      .filter(f => /\.png$/i.test(f))
      .sort((a, b) => a.localeCompare(b))
      .map(f => path.join(traitPath, f));

    if (allFiles.length === 0) continue;

    const sliced = allFiles.slice(resumeOffset);
    if (sliced.length === 0) continue;

    const batches: string[][] = [];
    for (let i = 0; i < sliced.length; i += batchSize) {
      batches.push(sliced.slice(i, i + batchSize));
    }

    plan.push({
      traitId: trait.id,
      traitName: trait.name,
      files: sliced,
      batches,
    });
  }

  return plan;
}

async function encodeFiles(files: string[], resolution: number): Promise<Buffer[]> {
  const buffers: Buffer[] = [];
  for (const file of files) {
    const buf = await sharp(file)
      .resize(resolution, resolution, {
        kernel: 'lanczos3',
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, palette: true, colors: 256 })
      .toBuffer();
    buffers.push(buf);
  }
  return buffers;
}

task('upload-niji-images', 'Upload all Niji trait images to a deployed NijiArt contract')
  .addParam('art', 'NijiArt contract address')
  .addOptionalParam('resolution', 'Image resolution (default 320)', String(DEFAULT_RESOLUTION))
  .addOptionalParam('batchsize', 'Max images per tx (default 50, max 50)', String(DEFAULT_BATCH_SIZE))
  .addOptionalParam('resume', 'Skip the first N images per trait (default 0)', '0')
  .addOptionalParam('traits', 'Comma-separated trait ids to limit upload to')
  .addFlag('dryrun', 'Print plan + estimated gas only, no on-chain tx')
  .setAction(async (args, { ethers }) => {
    const resolution = parseInt(args.resolution, 10);
    const batchSize = Math.min(parseInt(args.batchsize, 10), MAX_BATCH_SIZE);
    const resume = parseInt(args.resume, 10);
    const parsedTraits = args.traits
      ? args.traits.split(',').map((s: string) => parseInt(s.trim(), 10))
      : null;

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              NIJI FULL IMAGE UPLOAD (Issue #42)               ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ NijiArt:    ${args.art}`);
    console.log(`║ Resolution: ${resolution}x${resolution}`);
    console.log(`║ Batch size: ${batchSize} (cap ${MAX_BATCH_SIZE})`);
    if (resume > 0) console.log(`║ Resume:     skip first ${resume} per trait`);
    if (parsedTraits) console.log(`║ Traits:     ${parsedTraits.join(',')}`);
    if (args.dryrun) console.log('║ Mode:       DRY RUN (no on-chain tx)');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const plan = planUploads(parsedTraits, resume, batchSize);
    if (plan.length === 0) {
      console.log('No images to upload (matched plan is empty). Verify BASE_DIR and trait filter.');
      return;
    }

    let totalImages = 0;
    let totalBatches = 0;
    console.log('Upload plan:');
    for (const entry of plan) {
      totalImages += entry.files.length;
      totalBatches += entry.batches.length;
      console.log(
        `  trait ${String(entry.traitId).padStart(2)} ${entry.traitName.padEnd(16)} ` +
          `${entry.files.length.toString().padStart(4)} files in ${entry.batches.length} batches`,
      );
    }
    console.log(`\nTotal: ${totalImages} images / ${totalBatches} batches\n`);

    if (args.dryrun) {
      console.log('Dry run complete. No on-chain tx submitted.');
      return;
    }

    const [signer] = await ethers.getSigners();
    const balanceBefore = await ethers.provider.getBalance(signer.address);
    console.log(`Signer:  ${signer.address}`);
    console.log(`Balance: ${ethers.formatEther(balanceBefore)} ETH\n`);

    const art = await ethers.getContractAt('NijiArt', args.art, signer);

    let cumulativeGas = 0n;
    let failedBatches = 0;

    for (const entry of plan) {
      console.log(`\n── trait ${entry.traitId} ${entry.traitName} ──`);
      for (let i = 0; i < entry.batches.length; i++) {
        const batch = entry.batches[i];
        const buffers = await encodeFiles(batch, resolution);
        const totalBytes = buffers.reduce((a, b) => a + b.length, 0);

        try {
          const tx = await art.addTraitImages(entry.traitId, buffers, { gasLimit: 30_000_000 });
          const receipt = await tx.wait();
          if (!receipt) throw new Error('no receipt');
          cumulativeGas += receipt.gasUsed;
          console.log(
            `  batch ${(i + 1).toString().padStart(3)}/${entry.batches.length} ` +
              `${batch.length.toString().padStart(2)} imgs ` +
              `${(totalBytes / 1024).toFixed(1).padStart(7)}KB ` +
              `→ ${receipt.gasUsed.toLocaleString().padStart(12)} gas`,
          );
        } catch (e: any) {
          failedBatches++;
          console.error(
            `  batch ${i + 1}/${entry.batches.length} FAILED: ${(e.message ?? String(e)).slice(0, 80)}`,
          );
        }
      }
    }

    const balanceAfter = await ethers.provider.getBalance(signer.address);
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     UPLOAD SUMMARY                            ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ Images uploaded: ${totalImages - failedBatches * batchSize} / ${totalImages}`);
    console.log(`║ Batches OK:      ${totalBatches - failedBatches} / ${totalBatches}`);
    console.log(`║ Total gas:       ${cumulativeGas.toLocaleString()}`);
    console.log(`║ ETH spent:       ${ethers.formatEther(balanceBefore - balanceAfter)} ETH`);
    console.log('╚═══════════════════════════════════════════════════════════════╝');

    if (failedBatches > 0) {
      throw new Error(`${failedBatches} batch(es) failed during upload`);
    }
  });
