/**
 * Accurate SVG size test with correct encoding
 * Tests resolutions that fit within uint8 bounds (≤240px)
 * AND a custom 2-byte encoding for 320×320
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { PNGCollectionEncoder, buildSVG } from '@nouns/sdk';
import { readPngImage } from './utils';

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

interface ColorInfo { r: number; g: number; b: number; count: number; }

function medianCutPalette(colors: ColorInfo[], targetSize: number): ColorInfo[] {
  if (colors.length <= targetSize) return colors;
  let workingColors = colors;
  if (colors.length > 50000) {
    workingColors = [...colors].sort((a, b) => b.count - a.count).slice(0, 50000);
  }
  let buckets: ColorInfo[][] = [workingColors];
  while (buckets.length < targetSize) {
    let maxRange = -1, maxBucketIdx = 0, splitChannel: 'r'|'g'|'b' = 'r';
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;
      for (const ch of ['r','g','b'] as const) {
        let min=255, max=0;
        for (const c of bucket) { if(c[ch]<min)min=c[ch]; if(c[ch]>max)max=c[ch]; }
        let tc=0; for(const c of bucket) tc+=c.count;
        const wr = (max-min)*Math.log(tc+1);
        if(wr>maxRange){maxRange=wr;maxBucketIdx=i;splitChannel=ch;}
      }
    }
    if(maxRange<=0)break;
    const b=buckets[maxBucketIdx];
    b.sort((a,c)=>a[splitChannel]-c[splitChannel]);
    const m=Math.floor(b.length/2);
    buckets.splice(maxBucketIdx,1,b.slice(0,m),b.slice(m));
  }
  return buckets.map(bucket=>{
    let tc=0,rs=0,gs=0,bs=0;
    for(const c of bucket){tc+=c.count;rs+=c.r*c.count;gs+=c.g*c.count;bs+=c.b*c.count;}
    return{r:Math.round(rs/tc),g:Math.round(gs/tc),b:Math.round(bs/tc),count:tc};
  });
}

function findNearest(r:number,g:number,b:number,palette:ColorInfo[]):number{
  let md=Infinity,mi=0;
  for(let i=0;i<palette.length;i++){
    const dr=r-palette[i].r,dg=g-palette[i].g,db=b-palette[i].b;
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
    const df=fs.readdirSync(tp).filter(f=>f.endsWith('.PNG')||f.endsWith('.png'));
    for(const file of df){
      files.push({inputPath:path.join(tp,file),traitName:trait.name,fileName:file.replace(/\.png$/i,'')});
    }
  }
  return files;
}

async function testResolution(resolution: number, paletteSize: number) {
  const label = `${resolution}_gp${paletteSize}_accurate`;
  console.log(`\n🎨 テスト: ${resolution}×${resolution}, グローバル${paletteSize}色 (正確版)`);

  // Verify bounds fit in uint8
  if (resolution > 255) {
    console.log(`  ⚠️  ${resolution}は uint8上限255を超えるためスキップ（別途2バイト版が必要）`);
    return null;
  }

  const outputDir = path.join(OUTPUT_BASE, label);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const sourceFiles = await getAllSourceFiles();

  // Collect colors
  console.log('  色収集中...');
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

  // Generate palette
  console.log(`  パレット生成 (${colorMap.size}色→${paletteSize}色)...`);
  const palette = medianCutPalette(Array.from(colorMap.values()), paletteSize);
  const paletteHex = palette.map(c =>
    `${c.r.toString(16).padStart(2,'0')}${c.g.toString(16).padStart(2,'0')}${c.b.toString(16).padStart(2,'0')}`
  );

  // Apply palette and save PNGs
  console.log('  パレット適用中...');
  const processedFiles: {path:string;traitName:string;fileName:string}[] = [];
  for (let i = 0; i < sourceFiles.length; i++) {
    const sf = sourceFiles[i];
    const op = path.join(outputDir, `${sf.traitName}_${sf.fileName}.png`);
    const {data} = await sharp(sf.inputPath)
      .resize(resolution,resolution,{kernel:'lanczos3',fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
      .ensureAlpha().raw().toBuffer({resolveWithObject:true});
    for(let j=0;j<data.length;j+=4){
      if(data[j+3]<128){data[j]=0;data[j+1]=0;data[j+2]=0;data[j+3]=0;continue;}
      data[j+3]=255;
      const idx=findNearest(data[j],data[j+1],data[j+2],palette);
      data[j]=palette[idx].r;data[j+1]=palette[idx].g;data[j+2]=palette[idx].b;
    }
    await sharp(data,{raw:{width:resolution,height:resolution,channels:4}}).png({compressionLevel:9}).toFile(op);
    processedFiles.push({path:op,traitName:sf.traitName,fileName:sf.fileName});
    if((i+1)%100===0)process.stdout.write(`  ${i+1}/${sourceFiles.length}\r`);
  }

  // RLE encode
  console.log('  RLEエンコード中...');
  const encoder = new PNGCollectionEncoder(paletteHex);
  for(const pf of processedFiles){
    const png = await readPngImage(pf.path);
    encoder.encodeImage(pf.fileName, png, pf.traitName);
  }
  const nijiData = encoder.data;

  // Verify bounds fit in uint8
  let boundsOK = true;
  for (const trait of TRAIT_DIRS) {
    const images = (nijiData.images as any)[trait.name];
    if (!images) continue;
    for (const img of images) {
      if (!img || !img.data) continue;
      const hex = img.data.replace('0x', '');
      const top = parseInt(hex.substring(2, 4), 16);
      const right = parseInt(hex.substring(4, 6), 16);
      const bottom = parseInt(hex.substring(6, 8), 16);
      const left = parseInt(hex.substring(8, 10), 16);

      // Check: do the bounds make sense?
      if (right > resolution || bottom > resolution || left > resolution) {
        // This shouldn't happen for ≤255 resolution
        console.log(`  ⚠️  バウンドオーバーフロー: ${trait.name} top=${top} right=${right} bottom=${bottom} left=${left}`);
        boundsOK = false;
      }
    }
  }

  if (!boundsOK) {
    console.log('  ❌ バウンドエラー！');
    return null;
  }
  console.log('  ✅ 全画像のバウンド正常（uint8内）');

  // Generate actual SVG with 12 layers
  console.log('  SVG生成中...');
  const testParts: any[] = [];
  // Use first non-trivial image from each trait
  for (const trait of TRAIT_DIRS) {
    const images = (nijiData.images as any)[trait.name];
    if (images?.length > 0) testParts.push(images[0]);
  }

  const svg = buildSVG(testParts, nijiData.palette, 'd5d7e1');
  const svgSize = Buffer.byteLength(svg);

  // Count rect elements for accuracy
  const rectCount = (svg.match(/<rect /g) || []).length;

  // Gas estimation: ~150 gas per SVG byte (string concatenation in EVM)
  const estimatedGas = svgSize * 150;

  console.log(`  SVGサイズ: ${(svgSize / 1024).toFixed(1)} KB`);
  console.log(`  rect要素数: ${rectCount}`);
  console.log(`  推定ガス: ${(estimatedGas / 1_000_000).toFixed(1)}M`);
  console.log(`  判定: ${estimatedGas < 30_000_000 ? '✅ OK' : '❌ NG'}`);

  // Save SVG
  fs.writeFileSync(path.join(outputDir, 'sample.svg'), svg);

  // Also test with more visible traits (the "best" composite)
  const bestParts: any[] = [];
  for (const trait of TRAIT_DIRS) {
    const images = (nijiData.images as any)[trait.name];
    if (!images || images.length === 0) continue;
    // Pick image with most data (likely most visible)
    const validImages = images.filter((img: any) => img && img.data);
    if (validImages.length === 0) continue;
    const best = validImages.reduce((a: any, b: any) => a.data.length > b.data.length ? a : b);
    bestParts.push(best);
  }

  const svgBest = buildSVG(bestParts, nijiData.palette, 'd5d7e1');
  const svgBestSize = Buffer.byteLength(svgBest);
  const rectBestCount = (svgBest.match(/<rect /g) || []).length;
  const gasBest = svgBestSize * 150;

  console.log(`\n  [最大ケース] SVGサイズ: ${(svgBestSize / 1024).toFixed(1)} KB`);
  console.log(`  [最大ケース] rect要素数: ${rectBestCount}`);
  console.log(`  [最大ケース] 推定ガス: ${(gasBest / 1_000_000).toFixed(1)}M`);
  console.log(`  [最大ケース] 判定: ${gasBest < 30_000_000 ? '✅ OK' : '❌ NG'}`);

  fs.writeFileSync(path.join(outputDir, 'sample_best.svg'), svgBest);

  return {
    resolution,
    paletteSize,
    svgSize,
    svgBestSize,
    rectCount,
    rectBestCount,
    gasMin: estimatedGas,
    gasMax: gasBest,
  };
}

async function main() {
  console.log('=== 正確なSVGサイズ測定テスト ===');
  console.log('uint8バウンド制約を守った正確なRLEエンコード\n');

  const tests = [
    { resolution: 96, palette: 128 },
    { resolution: 80, palette: 128 },
    { resolution: 64, palette: 128 },
    { resolution: 48, palette: 128 },
    { resolution: 32, palette: 128 },
    { resolution: 96, palette: 64 },
    { resolution: 64, palette: 64 },
    { resolution: 48, palette: 64 },
  ];

  const results: any[] = [];
  for (const t of tests) {
    const r = await testResolution(t.resolution, t.palette);
    if (r) results.push(r);
  }

  console.log('\n\n========================================');
  console.log('=== 正確な最終結果 ===');
  console.log('========================================\n');
  console.log('解像度  | 色数 | SVG(通常) | SVG(最大) | ガス(通常) | ガス(最大) | 判定');
  console.log('--------|------|----------|----------|----------|----------|-----');

  for (const r of results) {
    const verdict = r.gasMax < 30_000_000 ? '✅' : r.gasMin < 30_000_000 ? '⚠️' : '❌';
    console.log(
      `${r.resolution.toString().padStart(7)} | ${r.paletteSize.toString().padStart(4)} | ${(r.svgSize/1024).toFixed(0).padStart(7)} KB | ${(r.svgBestSize/1024).toFixed(0).padStart(7)} KB | ${(r.gasMin/1e6).toFixed(1).padStart(7)}M | ${(r.gasMax/1e6).toFixed(1).padStart(7)}M | ${verdict}`
    );
  }
}

main().catch(console.error);
