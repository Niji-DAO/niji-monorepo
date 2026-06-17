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

// 重ね順（下から上）: solidBackground → background → backDecoration → special → leftHand → back → clothing → choker → ear → hair → hat → headphone
const COMPOSITE_ORDER = [10, 9, 8, 0, 3, 7, 5, 1, 6, 11, 4, 2];

interface ColorInfo {
  r: number;
  g: number;
  b: number;
  count: number;
}

function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  let wc =
    colors.length > 50000 ? [...colors].sort((a, b) => b.count - a.count).slice(0, 50000) : colors;
  let buckets: ColorInfo[][] = [wc];
  while (buckets.length < targetSize) {
    let mr = -1,
      mi = 0,
      sc: 'r' | 'g' | 'b' = 'r';
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      for (const ch of ['r', 'g', 'b'] as const) {
        let mn = 255,
          mx = 0;
        for (const c of buckets[i]) {
          if (c[ch] < mn) mn = c[ch];
          if (c[ch] > mx) mx = c[ch];
        }
        let tc = 0;
        for (const c of buckets[i]) tc += c.count;
        const wr = (mx - mn) * Math.log(tc + 1);
        if (wr > mr) {
          mr = wr;
          mi = i;
          sc = ch;
        }
      }
    }
    if (mr <= 0) break;
    const b = buckets[mi];
    b.sort((a, c) => a[sc] - c[sc]);
    const m = Math.floor(b.length / 2);
    buckets.splice(mi, 1, b.slice(0, m), b.slice(m));
  }
  return buckets.map(bk => {
    let tc = 0,
      rs = 0,
      gs = 0,
      bs = 0;
    for (const c of bk) {
      tc += c.count;
      rs += c.r * c.count;
      gs += c.g * c.count;
      bs += c.b * c.count;
    }
    return { r: Math.round(rs / tc), g: Math.round(gs / tc), b: Math.round(bs / tc), count: tc };
  });
}

function findNearest(r: number, g: number, b: number, p: ColorInfo[]): number {
  let md = Infinity,
    mi = 0;
  for (let i = 0; i < p.length; i++) {
    const dr = r - p[i].r,
      dg = g - p[i].g,
      db = b - p[i].b;
    const d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (d < md) {
      md = d;
      mi = i;
    }
  }
  return mi;
}

task('deploy-niji-full', 'Deploy full Niji stack (Art, Descriptor, Seeder, Token)')
  .addOptionalParam('resolution', 'Image resolution', '320')
  .addOptionalParam('maxsupply', 'Max token supply (0 = unlimited)', '0')
  .addFlag('skipImages', 'Skip uploading images')
  .addFlag('skipToken', 'Skip deploying token contract')
  .setAction(async (args, { ethers }) => {
    const RESOLUTION = parseInt(args.resolution);
    const MAX_SUPPLY = parseInt(args.maxsupply);
    const PALETTE_SIZE = 256;

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║             NIJI FULL STACK DEPLOYMENT                    ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║ Resolution: ${RESOLUTION}x${RESOLUTION}`);
    console.log(`║ Max Supply: ${MAX_SUPPLY === 0 ? 'Unlimited' : MAX_SUPPLY}`);
    console.log(`║ Palette:    ${PALETTE_SIZE} colors`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

    // =========================================
    // STEP 1: Prepare PNG data
    // =========================================
    let samplePngs: Map<number, Buffer> = new Map();
    let palette: ColorInfo[] = [];

    if (!args.skipImages) {
      console.log('┌─ STEP 1: Preparing PNG Images ─────────────────────────────┐');
      const allFiles: { inputPath: string; traitName: string; traitId: number }[] = [];
      for (const trait of TRAIT_DIRS) {
        const tp = path.join(BASE_DIR, trait.dir);
        if (!fs.existsSync(tp)) continue;
        for (const file of fs.readdirSync(tp).filter(f => /\.png$/i.test(f))) {
          allFiles.push({
            inputPath: path.join(tp, file),
            traitName: trait.name,
            traitId: trait.id,
          });
        }
      }

      console.log('│ Building color palette...');
      const colorMap = new Map<string, ColorInfo>();
      for (const sf of allFiles) {
        const { data } = await sharp(sf.inputPath)
          .resize(RESOLUTION, RESOLUTION, {
            kernel: 'lanczos3',
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
          const ex = colorMap.get(key);
          if (ex) ex.count++;
          else colorMap.set(key, { r: data[i], g: data[i + 1], b: data[i + 2], count: 1 });
        }
      }
      palette = medianCutPalette(Array.from(colorMap.values()), PALETTE_SIZE);
      console.log(`│ ${colorMap.size} unique colors → ${palette.length} palette colors`);

      console.log('│ Processing sample images...');
      for (const trait of TRAIT_DIRS) {
        const traitFiles = allFiles.filter(f => f.traitId === trait.id);
        if (traitFiles.length === 0) continue;

        let bestBuf: Buffer | null = null;
        let bestOpaque = 0;
        for (const sf of traitFiles.slice(0, 5)) {
          const { data } = await sharp(sf.inputPath)
            .resize(RESOLUTION, RESOLUTION, {
              kernel: 'lanczos3',
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          for (let j = 0; j < data.length; j += 4) {
            if (data[j + 3] < 128) {
              data[j] = 0;
              data[j + 1] = 0;
              data[j + 2] = 0;
              data[j + 3] = 0;
              continue;
            }
            data[j + 3] = 255;
            const idx = findNearest(data[j], data[j + 1], data[j + 2], palette);
            data[j] = palette[idx].r;
            data[j + 1] = palette[idx].g;
            data[j + 2] = palette[idx].b;
          }
          let opaque = 0;
          for (let j = 3; j < data.length; j += 4) if (data[j] > 0) opaque++;
          if (opaque > bestOpaque) {
            bestOpaque = opaque;
            bestBuf = await sharp(data, {
              raw: { width: RESOLUTION, height: RESOLUTION, channels: 4 },
            })
              .png({ compressionLevel: 9, palette: true, colors: PALETTE_SIZE })
              .toBuffer();
          }
        }
        if (bestBuf) {
          samplePngs.set(trait.id, bestBuf);
          console.log(
            `│   ${trait.name.padEnd(16)} ${(bestBuf.length / 1024).toFixed(1).padStart(6)}KB`,
          );
        }
      }
      console.log('└──────────────────────────────────────────────────────────────┘\n');
    }

    // =========================================
    // STEP 2: Deploy NijiArt
    // =========================================
    console.log('┌─ STEP 2: Deploy NijiArt ──────────────────────────────────────┐');
    const traitNames = TRAIT_DIRS.map(t => t.name);
    const NijiArt = await ethers.getContractFactory('NijiArt');
    const art = await NijiArt.deploy(deployer.address, traitNames);
    await art.waitForDeployment();
    console.log(`│ NijiArt deployed: ${await art.getAddress()}`);
    console.log('└──────────────────────────────────────────────────────────────┘\n');

    // =========================================
    // STEP 3: Deploy NijiDescriptor
    // =========================================
    console.log('┌─ STEP 3: Deploy NijiDescriptor ───────────────────────────────┐');
    const NijiDescriptor = await ethers.getContractFactory('NijiDescriptor');
    const artAddress = await art.getAddress();
    const descriptor = await NijiDescriptor.deploy(artAddress, RESOLUTION, COMPOSITE_ORDER);
    await descriptor.waitForDeployment();
    console.log(`│ NijiDescriptor deployed: ${await descriptor.getAddress()}`);
    console.log('└──────────────────────────────────────────────────────────────┘\n');

    // =========================================
    // STEP 4: Deploy NijiSeeder
    // =========================================
    console.log('┌─ STEP 4: Deploy NijiSeeder ───────────────────────────────────┐');
    const NijiSeeder = await ethers.getContractFactory('NijiSeeder');
    const seeder = await NijiSeeder.deploy(artAddress);
    await seeder.waitForDeployment();
    console.log(`│ NijiSeeder deployed: ${await seeder.getAddress()}`);
    console.log('└──────────────────────────────────────────────────────────────┘\n');

    // =========================================
    // STEP 5: Deploy NijiToken (optional)
    // =========================================
    let token: any = null;
    if (!args.skipToken) {
      console.log('┌─ STEP 5: Deploy NijiToken ────────────────────────────────────┐');
      const NijiToken = await ethers.getContractFactory('NijiToken');
      const descriptorAddress = await descriptor.getAddress();
      const seederAddress = await seeder.getAddress();
      token = await NijiToken.deploy('Niji', 'NIJI', descriptorAddress, seederAddress, MAX_SUPPLY);
      await token.waitForDeployment();
      console.log(`│ NijiToken deployed: ${await token.getAddress()}`);
      console.log('└──────────────────────────────────────────────────────────────┘\n');
    }

    // =========================================
    // STEP 6: Upload PNG data
    // =========================================
    if (!args.skipImages && samplePngs.size > 0) {
      console.log('┌─ STEP 6: Upload PNG Data (SSTORE2) ───────────────────────────┐');
      let totalDeployGas = 0n;

      for (const trait of TRAIT_DIRS) {
        const pngBuf = samplePngs.get(trait.id);
        if (!pngBuf) continue;

        try {
          const tx = await art.addTraitImage(trait.id, pngBuf, { gasLimit: 5000000 });
          const receipt = await tx.wait();
          totalDeployGas = totalDeployGas + receipt!.gasUsed;
          console.log(
            `│ ${trait.name.padEnd(16)} ${pngBuf.length.toString().padStart(6)}B → ${receipt!.gasUsed.toLocaleString().padStart(10)} gas`,
          );
        } catch (e: any) {
          console.error(`│ ${trait.name.padEnd(16)} FAILED: ${e.message.slice(0, 50)}`);
        }
      }
      console.log(`│ Total upload gas: ${totalDeployGas.toLocaleString()}`);
      console.log('└──────────────────────────────────────────────────────────────┘\n');
    }

    // =========================================
    // STEP 7: Configure contracts
    // =========================================
    console.log('┌─ STEP 7: Configure Contracts ─────────────────────────────────┐');

    // Set descriptor as art's descriptor
    const descAddr = await descriptor.getAddress();
    const setTx = await art.setDescriptor(descAddr);
    await setTx.wait();
    console.log('│ Set NijiArt.descriptor → NijiDescriptor');

    console.log('└──────────────────────────────────────────────────────────────┘\n');

    // =========================================
    // STEP 8: Test tokenURI
    // =========================================
    if (samplePngs.size > 0) {
      console.log('┌─ STEP 8: Test tokenURI ─────────────────────────────────────┐');
      const traitIndices = TRAIT_DIRS.map(t => (samplePngs.has(t.id) ? 0 : ethers.MaxUint256));

      try {
        const gasEstimate = await descriptor.tokenURI.estimateGas(0, traitIndices);
        console.log(`│ Gas estimate: ${gasEstimate.toLocaleString()}`);

        const result = await descriptor.tokenURI(0, traitIndices);
        console.log(`│ TokenURI length: ${result.length} chars`);

        const jsonB64 = result.replace('data:application/json;base64,', '');
        const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());
        console.log(`│ Name: ${json.name}`);

        const svgB64 = json.image.replace('data:image/svg+xml;base64,', '');
        const svg = Buffer.from(svgB64, 'base64').toString();
        console.log(`│ SVG size: ${(svg.length / 1024).toFixed(1)}KB`);
        console.log(`│ <image> tags: ${(svg.match(/<image /g) || []).length}`);

        // Save output
        const outputDir = path.join(__dirname, '../../niji-assets/test_output');
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, 'niji-tokenuri.svg'), svg);
      } catch (e: any) {
        console.error(`│ ERROR: ${e.message}`);
      }
      console.log('└──────────────────────────────────────────────────────────────┘\n');
    }

    // =========================================
    // SUMMARY
    // =========================================
    const balanceAfter = await ethers.provider.getBalance(deployer.address);

    const artAddr = await art.getAddress();
    const descAddrFinal = await descriptor.getAddress();
    const seederAddr = await seeder.getAddress();

    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    DEPLOYMENT SUMMARY                         ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ NijiArt:        ${artAddr}  ║`);
    console.log(`║ NijiDescriptor: ${descAddrFinal}  ║`);
    console.log(`║ NijiSeeder:     ${seederAddr}  ║`);
    if (token) {
      console.log(`║ NijiToken:      ${await token.getAddress()}  ║`);
    }
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ Resolution:     ${RESOLUTION}x${RESOLUTION}`);
    console.log(`║ Trait Categories: ${TRAIT_DIRS.length}`);
    console.log(`║ Images Uploaded: ${samplePngs.size}`);
    console.log(`║ ETH Spent:      ${ethers.formatEther(balance - balanceAfter)} ETH`);
    console.log('╚═══════════════════════════════════════════════════════════════╝');

    // Return addresses for scripting
    return {
      art: artAddr,
      descriptor: descAddrFinal,
      seeder: seederAddr,
      token: token ? await token.getAddress() : null,
    };
  });
