import { task } from 'hardhat/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_DIR = path.join(__dirname, '../../nouns-assets/images_niji');
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

// Composite order: bottom to top
const COMPOSITE_ORDER = [10, 9, 7, 8, 5, 11, 4, 6, 1, 2, 3, 0];
// solidBackground, background, back, backDecoration, clothing, hair, hat, ear, choker, headphone, leftHand, special

interface ColorInfo { r: number; g: number; b: number; count: number; }

function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  let wc = colors.length > 50000 ? [...colors].sort((a, b) => b.count - a.count).slice(0, 50000) : colors;
  let buckets: ColorInfo[][] = [wc];
  while (buckets.length < targetSize) {
    let mr = -1, mi = 0, sc: 'r'|'g'|'b' = 'r';
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      for (const ch of ['r','g','b'] as const) {
        let mn=255,mx=0; for(const c of buckets[i]){if(c[ch]<mn)mn=c[ch];if(c[ch]>mx)mx=c[ch];}
        let tc=0; for(const c of buckets[i])tc+=c.count;
        const wr=(mx-mn)*Math.log(tc+1);
        if(wr>mr){mr=wr;mi=i;sc=ch;}
      }
    }
    if(mr<=0)break;
    const b=buckets[mi]; b.sort((a,c)=>a[sc]-c[sc]);
    const m=Math.floor(b.length/2);
    buckets.splice(mi,1,b.slice(0,m),b.slice(m));
  }
  return buckets.map(bk=>{
    let tc=0,rs=0,gs=0,bs=0;
    for(const c of bk){tc+=c.count;rs+=c.r*c.count;gs+=c.g*c.count;bs+=c.b*c.count;}
    return{r:Math.round(rs/tc),g:Math.round(gs/tc),b:Math.round(bs/tc),count:tc};
  });
}

function findNearest(r:number,g:number,b:number,p:ColorInfo[]):number{
  let md=Infinity,mi=0;
  for(let i=0;i<p.length;i++){
    const dr=r-p[i].r,dg=g-p[i].g,db=b-p[i].b;
    const d=2*dr*dr+4*dg*dg+3*db*db;
    if(d<md){md=d;mi=i;}
  }
  return mi;
}

task('test-niji-png', 'Deploy NijiArt + NijiDescriptor and measure real gas for tokenURI')
  .setAction(async (_, { ethers }) => {
    const RESOLUTION = 320;
    const PALETTE_SIZE = 256;

    console.log('\n=== NIJI PNG EMBED: REAL GAS TEST ===');
    console.log(`Resolution: ${RESOLUTION}x${RESOLUTION}, Palette: ${PALETTE_SIZE} colors\n`);

    // Step 1: Prepare PNG data for sample traits (one per category)
    console.log('1. Preparing PNG data...');

    const allFiles: {inputPath:string;traitName:string;traitId:number;fileName:string}[] = [];
    for (const trait of TRAIT_DIRS) {
      const tp = path.join(BASE_DIR, trait.dir);
      if (!fs.existsSync(tp)) continue;
      const files = fs.readdirSync(tp).filter(f => /\.png$/i.test(f));
      for (const file of files) {
        allFiles.push({
          inputPath: path.join(tp, file),
          traitName: trait.name,
          traitId: trait.id,
          fileName: file.replace(/\.png$/i, ''),
        });
      }
    }
    console.log(`   Found ${allFiles.length} source images`);

    // Build global palette
    console.log('   Building palette...');
    const colorMap = new Map<string, ColorInfo>();
    for (const sf of allFiles) {
      const { data } = await sharp(sf.inputPath)
        .resize(RESOLUTION, RESOLUTION, { kernel: 'lanczos3', fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        if (data[i+3] < 128) continue;
        const key = `${data[i]},${data[i+1]},${data[i+2]}`;
        const ex = colorMap.get(key);
        if (ex) ex.count++; else colorMap.set(key, { r: data[i], g: data[i+1], b: data[i+2], count: 1 });
      }
    }
    const palette = medianCutPalette(Array.from(colorMap.values()), PALETTE_SIZE);
    console.log(`   Palette: ${colorMap.size} → ${palette.length} colors`);

    // Pick one image per trait category (most opaque = most content)
    console.log('   Processing sample images...');
    const samplePngs: Map<number, Buffer> = new Map();

    for (const trait of TRAIT_DIRS) {
      const traitFiles = allFiles.filter(f => f.traitId === trait.id);
      if (traitFiles.length === 0) continue;

      // Find the one with most opaque pixels (first 5 candidates)
      let bestBuf: Buffer | null = null;
      let bestOpaque = 0;

      for (const sf of traitFiles.slice(0, 5)) {
        const { data } = await sharp(sf.inputPath)
          .resize(RESOLUTION, RESOLUTION, { kernel: 'lanczos3', fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
          .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Quantize
        for (let j = 0; j < data.length; j += 4) {
          if (data[j+3] < 128) { data[j]=0;data[j+1]=0;data[j+2]=0;data[j+3]=0; continue; }
          data[j+3] = 255;
          const idx = findNearest(data[j], data[j+1], data[j+2], palette);
          data[j] = palette[idx].r; data[j+1] = palette[idx].g; data[j+2] = palette[idx].b;
        }

        let opaque = 0;
        for (let j = 3; j < data.length; j += 4) if (data[j] > 0) opaque++;

        if (opaque > bestOpaque) {
          bestOpaque = opaque;
          bestBuf = await sharp(data, { raw: { width: RESOLUTION, height: RESOLUTION, channels: 4 } })
            .png({ compressionLevel: 9, palette: true, colors: PALETTE_SIZE }).toBuffer();
        }
      }

      if (bestBuf) {
        samplePngs.set(trait.id, bestBuf);
        console.log(`   ${trait.name}: ${(bestBuf.length / 1024).toFixed(1)}KB`);
      }
    }

    // Step 2: Deploy contracts
    console.log('\n2. Deploying contracts...');

    const traitNames = TRAIT_DIRS.map(t => t.name);
    const [deployer] = await ethers.getSigners();

    // Deploy NijiArt with deployer as descriptor (so we can add images)
    const NijiArt = await ethers.getContractFactory('NijiArt');
    const art = await NijiArt.deploy(deployer.address, traitNames);
    await art.deployed();
    console.log(`   NijiArt deployed: ${art.address}`);

    // Deploy NijiDescriptor
    const NijiDescriptor = await ethers.getContractFactory('NijiDescriptor');
    const descriptor = await NijiDescriptor.deploy(art.address, RESOLUTION, COMPOSITE_ORDER);
    await descriptor.deployed();
    console.log(`   NijiDescriptor deployed: ${descriptor.address}`);

    // Step 3: Upload PNG data via SSTORE2
    console.log('\n3. Uploading PNG data via SSTORE2...');
    let totalDeployGas = 0n;

    for (const trait of TRAIT_DIRS) {
      const pngBuf = samplePngs.get(trait.id);
      if (!pngBuf) continue;

      const tx = await art.addTraitImage(trait.id, pngBuf, { gasLimit: 30000000 });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.toBigInt();
      totalDeployGas += gasUsed;
      console.log(`   ${trait.name}: ${pngBuf.length} bytes → ${gasUsed.toLocaleString()} gas`);
    }
    console.log(`   Total deploy gas: ${totalDeployGas.toLocaleString()}`);

    // Now set the descriptor contract as the authorized caller
    await art.setDescriptor(descriptor.address);

    // Step 4: Test tokenURI gas
    console.log('\n4. Testing tokenURI gas...');

    // Build trait indices (all 0 = first image of each category)
    const traitIndices = TRAIT_DIRS.map(t => samplePngs.has(t.id) ? 0 : ethers.constants.MaxUint256);

    // Estimate gas for tokenURI
    try {
      const gasEstimate = await descriptor.estimateGas.tokenURI(0, traitIndices);
      console.log(`   tokenURI gas estimate: ${gasEstimate.toLocaleString()}`);

      // Also estimate sub-functions
      const svgGas = await descriptor.estimateGas.generateSVG(traitIndices);
      console.log(`   generateSVG gas: ${svgGas.toLocaleString()}`);

      const svgB64Gas = await descriptor.estimateGas.generateSVGBase64(traitIndices);
      console.log(`   generateSVGBase64 gas: ${svgB64Gas.toLocaleString()}`);

      // Actually call tokenURI
      const tokenURIResult = await descriptor.tokenURI(0, traitIndices);
      console.log(`   tokenURI result length: ${tokenURIResult.length} chars`);

      // Decode and measure SVG
      const svgResult = await descriptor.generateSVG(traitIndices);
      console.log(`   SVG result length: ${svgResult.length} chars = ${(svgResult.length / 1024).toFixed(1)}KB`);

      // Save results
      const outputDir = path.join(__dirname, '../../nouns-assets/test_output');
      fs.mkdirSync(outputDir, { recursive: true });

      // Save SVG
      fs.writeFileSync(path.join(outputDir, 'onchain-niji-png.svg'), svgResult);
      console.log(`   SVG saved to test_output/onchain-niji-png.svg`);

      // Save tokenURI
      fs.writeFileSync(path.join(outputDir, 'onchain-niji-tokenuri.txt'), tokenURIResult);

      console.log('\n========================================');
      console.log('=== RESULT ===');
      console.log('========================================');
      console.log(`   Resolution:      ${RESOLUTION}x${RESOLUTION}`);
      console.log(`   Palette:         ${PALETTE_SIZE} colors`);
      console.log(`   Layers:          ${samplePngs.size}`);
      console.log(`   Deploy gas:      ${totalDeployGas.toLocaleString()}`);
      console.log(`   tokenURI gas:    ${gasEstimate.toLocaleString()}`);
      console.log(`   SVG size:        ${(svgResult.length / 1024).toFixed(1)}KB`);
      console.log(`   Under 30M limit: ${gasEstimate.toBigInt() < 30000000n ? '✅ YES' : '❌ NO'}`);
      console.log('========================================\n');

    } catch (error: any) {
      console.error(`   ERROR: ${error.message}`);
      if (error.message.includes('gas')) {
        console.error('   Gas limit exceeded!');
      }
    }
  });
