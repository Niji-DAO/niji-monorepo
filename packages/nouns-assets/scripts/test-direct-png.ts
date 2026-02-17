/**
 * Test: Direct PNG compositing approach
 * Instead of SVG with 12 embedded PNGs, compose into a single PNG
 * and return directly as data:image/png;base64,...
 *
 * This tests the size of a single pre-composited PNG at various resolutions/colors
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BASE_DIR = './images_niji';
const OUTPUT_BASE = './images_niji_color_test';
const TRAIT_DIRS = [
  { dir: '01_スペシャル', name: 'special' },
  { dir: '02_チョーカー', name: 'choker' },
  { dir: '03_ヘッドホン', name: 'headphone' },
  { dir: '04_左手', name: 'leftHand' },
  { dir: '05_帽子', name: 'hat' },
  { dir: '06_服', name: 'clothing' },
  { dir: '07_耳', name: 'ear' },
  { dir: '08_背中', name: 'back' },
  { dir: '09_背中の装飾', name: 'backDecoration' },
  { dir: '10_背景', name: 'background' },
  { dir: '11_背景単色', name: 'solidBackground' },
  { dir: '12_髪の毛', name: 'hair' },
];
const COMPOSITE_ORDER = [
  'solidBackground', 'background', 'back', 'backDecoration',
  'clothing', 'hair', 'hat', 'ear', 'choker', 'headphone', 'leftHand', 'special',
];

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

async function getAllSourceFiles() {
  const files: {inputPath:string;traitName:string;fileName:string}[] = [];
  for(const trait of TRAIT_DIRS){
    const tp=path.join(BASE_DIR,trait.dir);
    if(!fs.existsSync(tp))continue;
    for(const file of fs.readdirSync(tp).filter(f=>/\.png$/i.test(f))){
      files.push({inputPath:path.join(tp,file),traitName:trait.name,fileName:file.replace(/\.png$/i,'')});
    }
  }
  return files;
}

async function testDirectPng(resolution: number, paletteSize: number, useQuantize: boolean) {
  const label = `direct_${resolution}_${paletteSize}c${useQuantize ? '_q' : ''}`;
  console.log(`\n=== ${label} ===`);

  const outputDir = path.join(OUTPUT_BASE, label);
  await fs.promises.mkdir(outputDir, { recursive: true });
  const sourceFiles = await getAllSourceFiles();

  // Build palette if quantizing
  let palette: ColorInfo[] | null = null;
  if (useQuantize) {
    const colorMap = new Map<string, ColorInfo>();
    for (const sf of sourceFiles) {
      const {data} = await sharp(sf.inputPath)
        .resize(resolution,resolution,{kernel:'lanczos3',fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
        .ensureAlpha().raw().toBuffer({resolveWithObject:true});
      for(let i=0;i<data.length;i+=4){
        if(data[i+3]<128)continue;
        const key=`${data[i]},${data[i+1]},${data[i+2]}`;
        const ex=colorMap.get(key);
        if(ex)ex.count++;else colorMap.set(key,{r:data[i],g:data[i+1],b:data[i+2],count:1});
      }
    }
    palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
  }

  // Group source files by trait
  const traitFiles: Map<string, {inputPath:string;fileName:string}[]> = new Map();
  for (const sf of sourceFiles) {
    const list = traitFiles.get(sf.traitName) || [];
    list.push(sf);
    traitFiles.set(sf.traitName, list);
  }

  // For each trait, process all images and find the one with most content
  const bestPerTrait: Map<string, Buffer> = new Map();
  const allSizes: number[] = [];

  // We'll simulate many random composites to estimate worst/normal case
  const compositeSizes: number[] = [];

  // First process all individual trait PNGs (quantized)
  const processedPerTrait: Map<string, {buf: Buffer; opaque: number}[]> = new Map();

  for (const trait of COMPOSITE_ORDER) {
    const files = traitFiles.get(trait);
    if (!files) continue;

    const processed: {buf: Buffer; opaque: number}[] = [];
    for (const f of files) {
      const {data} = await sharp(f.inputPath)
        .resize(resolution,resolution,{kernel:'lanczos3',fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
        .ensureAlpha().raw().toBuffer({resolveWithObject:true});

      if (useQuantize && palette) {
        for(let j=0;j<data.length;j+=4){
          if(data[j+3]<128){data[j]=0;data[j+1]=0;data[j+2]=0;data[j+3]=0;continue;}
          data[j+3]=255;
          const idx=findNearest(data[j],data[j+1],data[j+2],palette);
          data[j]=palette[idx].r;data[j+1]=palette[idx].g;data[j+2]=palette[idx].b;
        }
      } else {
        for(let j=0;j<data.length;j+=4){
          if(data[j+3]<128){data[j]=0;data[j+1]=0;data[j+2]=0;data[j+3]=0;}
          else data[j+3]=255;
        }
      }

      let op = 0;
      for(let j=3;j<data.length;j+=4) if(data[j]>0) op++;
      if (op === 0) continue;

      const buf = await sharp(data,{raw:{width:resolution,height:resolution,channels:4}}).png().toBuffer();
      processed.push({ buf, opaque: op });
    }
    processedPerTrait.set(trait, processed);
  }

  // Generate random composites to measure size distribution
  console.log('  ランダムコンポジット生成...');
  const NUM_SAMPLES = 50;

  for (let s = 0; s < NUM_SAMPLES; s++) {
    const layers: { input: Buffer; top: number; left: number }[] = [];
    for (const trait of COMPOSITE_ORDER) {
      const processed = processedPerTrait.get(trait);
      if (!processed || processed.length === 0) continue;
      const chosen = processed[Math.floor(Math.random() * processed.length)];
      layers.push({ input: chosen.buf, top: 0, left: 0 });
    }

    const composite = await sharp({
      create: { width: resolution, height: resolution, channels: 4, background: { r: 213, g: 215, b: 225, alpha: 1 } }
    }).composite(layers).png({ compressionLevel: 9, palette: true, colors: paletteSize }).toBuffer();

    compositeSizes.push(composite.length);
  }

  compositeSizes.sort((a, b) => a - b);
  const median = compositeSizes[Math.floor(compositeSizes.length / 2)];
  const max = compositeSizes[compositeSizes.length - 1];
  const p95 = compositeSizes[Math.floor(compositeSizes.length * 0.95)];

  // metadata JSON overhead: {"name":"Niji #0","description":"...","image":"data:image/png;base64,..."}
  const metadataOverhead = 150;
  const normalB64 = Math.ceil(median * 4 / 3) + metadataOverhead;
  const maxB64 = Math.ceil(max * 4 / 3) + metadataOverhead;
  const p95B64 = Math.ceil(p95 * 4 / 3) + metadataOverhead;

  const gasNormal = normalB64 * 150;
  const gasMax = maxB64 * 150;
  const gasP95 = p95B64 * 150;

  console.log(`  中央値PNG: ${(median/1024).toFixed(1)}KB → base64: ${(normalB64/1024).toFixed(1)}KB → ${(gasNormal/1e6).toFixed(1)}M gas`);
  console.log(`  95%ile PNG: ${(p95/1024).toFixed(1)}KB → base64: ${(p95B64/1024).toFixed(1)}KB → ${(gasP95/1e6).toFixed(1)}M gas`);
  console.log(`  最大PNG: ${(max/1024).toFixed(1)}KB → base64: ${(maxB64/1024).toFixed(1)}KB → ${(gasMax/1e6).toFixed(1)}M gas`);

  // Save best and worst composite for visual check
  const bestIdx = compositeSizes.indexOf(median);
  const worstIdx = compositeSizes.indexOf(max);

  // Generate the "best" (most visual) composite for viewing
  const viewLayers: { input: Buffer; top: number; left: number }[] = [];
  for (const trait of COMPOSITE_ORDER) {
    const processed = processedPerTrait.get(trait);
    if (!processed || processed.length === 0) continue;
    const best = processed.reduce((a, b) => a.opaque > b.opaque ? a : b);
    viewLayers.push({ input: best.buf, top: 0, left: 0 });
  }

  const viewComposite = await sharp({
    create: { width: resolution, height: resolution, channels: 4, background: { r: 213, g: 215, b: 225, alpha: 1 } }
  }).composite(viewLayers).png({ compressionLevel: 9, palette: true, colors: paletteSize }).toBuffer();

  await sharp(viewComposite).toFile(path.join(outputDir, 'composite.png'));
  await sharp(viewComposite).resize(640, 640, { kernel: 'lanczos3' }).toFile(path.join(outputDir, 'composite_upscaled.png'));

  console.log(`  合成PNG: ${(viewComposite.length/1024).toFixed(1)}KB`);
  console.log(`  出力: ${path.join(outputDir, 'composite_upscaled.png')}`);

  return { label, resolution, paletteSize, median, max, p95, gasNormal, gasMax, gasP95 };
}

async function main() {
  console.log('=== 直接PNG合成方式テスト ===');
  console.log('SVG不要 - 合成済みPNGをdata:image/pngで直接返す\n');

  const results: any[] = [];
  for (const t of [
    { res: 320, pal: 256, q: true },
    { res: 320, pal: 256, q: false },
    { res: 400, pal: 256, q: true },
    { res: 400, pal: 256, q: false },
    { res: 480, pal: 256, q: true },
    { res: 512, pal: 256, q: false },
  ]) {
    results.push(await testDirectPng(t.res, t.pal, t.q));
  }

  console.log('\n\n========================================');
  console.log('=== 直接PNG合成方式 結果 ===');
  console.log('========================================\n');
  console.log('テスト                  | 中央値   | 95%ile   | 最大     | ガス中央 | ガス最大 | 判定');
  console.log('------------------------|---------|---------|---------|---------|---------|-----');
  for (const r of results) {
    const v = r.gasMax < 30e6 ? '✅' : r.gasP95 < 30e6 ? '⚠️' : '❌';
    console.log(
      `${r.label.padEnd(23)} | ${(r.median/1024).toFixed(0).padStart(6)}KB | ${(r.p95/1024).toFixed(0).padStart(6)}KB | ${(r.max/1024).toFixed(0).padStart(6)}KB | ${(r.gasNormal/1e6).toFixed(1).padStart(6)}M | ${(r.gasMax/1e6).toFixed(1).padStart(6)}M | ${v}`
    );
  }
}

main().catch(console.error);
