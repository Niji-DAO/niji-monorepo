import { task } from 'hardhat/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { NIJI_COMPOSITE_ORDER } from '../scripts/niji-encoder';

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

// 重ね順 SSOT = scripts/niji-encoder.ts の NIJI_COMPOSITE_ORDER (hair を hat 上に配置し hair 隠蔽解消)。
const COMPOSITE_ORDER = NIJI_COMPOSITE_ORDER;

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
  .setAction(async (args, { ethers, network }) => {
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
    // local 31337 では各 trait dir 内の全 PNG を upload して絵柄 variation を作る
    // (1 trait 1 image だと _pickTrait(N) % 1 = 0 で常に同じ trait しか選ばれない)。
    // mainnet deploy では別途 trait pruning が必要。
    let samplePngs: Map<number, Buffer[]> = new Map();
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

      console.log('│ Processing all images per trait...');
      for (const trait of TRAIT_DIRS) {
        const traitFiles = allFiles.filter(f => f.traitId === trait.id);
        if (traitFiles.length === 0) continue;

        const bufs: Buffer[] = [];
        for (const sf of traitFiles) {
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
          // 全 transparent はスキップ (mint で空 SVG にならないように)
          let opaque = 0;
          for (let j = 3; j < data.length; j += 4) if (data[j] > 0) opaque++;
          if (opaque === 0) continue;
          const buf = await sharp(data, {
            raw: { width: RESOLUTION, height: RESOLUTION, channels: 4 },
          })
            .png({ compressionLevel: 9, palette: true, colors: PALETTE_SIZE })
            .toBuffer();
          bufs.push(buf);
        }
        if (bufs.length > 0) {
          samplePngs.set(trait.id, bufs);
          const totalKB = bufs.reduce((sum, b) => sum + b.length, 0) / 1024;
          console.log(
            `│   ${trait.name.padEnd(16)} ${bufs.length.toString().padStart(3)} images, ${totalKB.toFixed(1).padStart(7)}KB`,
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
      let totalImages = 0;

      for (const trait of TRAIT_DIRS) {
        const pngBufs = samplePngs.get(trait.id);
        if (!pngBufs || pngBufs.length === 0) continue;

        let traitGas = 0n;
        let traitOk = 0;
        for (const pngBuf of pngBufs) {
          try {
            const tx = await art.addTraitImage(trait.id, pngBuf, { gasLimit: 5000000 });
            const receipt = await tx.wait();
            traitGas = traitGas + receipt!.gasUsed;
            traitOk++;
            totalImages++;
          } catch (e: any) {
            console.error(
              `│ ${trait.name.padEnd(16)} 1 image FAILED: ${e.message.slice(0, 50)}`,
            );
          }
        }
        totalDeployGas = totalDeployGas + traitGas;
        console.log(
          `│ ${trait.name.padEnd(16)} ${traitOk.toString().padStart(3)}/${pngBufs.length.toString().padStart(3)} images → ${traitGas.toLocaleString().padStart(12)} gas`,
        );
      }
      console.log(`│ Total uploaded images: ${totalImages}`);
      console.log(`│ Total upload gas:      ${totalDeployGas.toLocaleString()}`);
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
    // STEP 7.5: Deploy AuctionHouse stack (localhost / baseSepolia / base-sepolia)
    // =========================================
    // 2026-07-17 base-sepolia 対応 = auction 起動対象を localhost 単一から testnet 系に拡張。
    // mainnet では既に Nouns AuctionHouse が deployed 済 = 対象外 (contract 系列上 重複 deploy 禁止)。
    const AUCTION_DEPLOY_NETWORKS = new Set(['localhost', 'hardhat', 'baseSepolia', 'base-sepolia']);
    let auctionProxyAddr: string | null = null;
    let wethAddr: string | null = null;
    if (token && AUCTION_DEPLOY_NETWORKS.has(network.name)) {
      console.log('┌─ STEP 7.5: Deploy AuctionHouse (V3 + Proxy + WETH) ────────────┐');

      // network 別 auction duration default:
      // - localhost/hardhat = 60s (anvil 上で auction を回しまくる)、 env NIJI_AUCTION_DURATION で override 可能
      // - baseSepolia = 86400s (24h、 real testnet で本番相当運用感を確保)
      // - env で override すれば全 network で自由に指定可能
      const isLocal = network.name === 'localhost' || network.name === 'hardhat';
      const AUCTION_DURATION_ENV = process.env.NIJI_AUCTION_DURATION;
      const AUCTION_DURATION =
        AUCTION_DURATION_ENV && Number.isFinite(Number(AUCTION_DURATION_ENV))
          ? Number(AUCTION_DURATION_ENV)
          : isLocal
            ? 60
            : 86400;
      const AUCTION_RESERVE_PRICE = ethers.parseEther('0.001'); // 0.001 ETH (testnet 低額 verify、 mainnet は別 script)
      const AUCTION_TIME_BUFFER = isLocal ? 10 : 300; // localhost 10s / testnet 5min (snipe 延長 window)
      const AUCTION_MIN_BID_INCREMENT_PRCT = 2; // 2%

      // WETH (test 用 mock)
      const WETH = await ethers.getContractFactory('WETH');
      const weth = await WETH.deploy();
      await weth.waitForDeployment();
      wethAddr = await weth.getAddress();
      console.log(`│ WETH:                       ${wethAddr}`);

      // ChainalysisSanctionsList mock
      const SanctionsMock = await ethers.getContractFactory('ChainalysisSanctionsListMock');
      const sanctions = await SanctionsMock.deploy();
      await sanctions.waitForDeployment();
      const sanctionsAddr = await sanctions.getAddress();
      console.log(`│ ChainalysisSanctionsMock:   ${sanctionsAddr}`);

      // AuctionHouse impl (logic)
      const AuctionHouseV3 = await ethers.getContractFactory('NijiAuctionHouseV3');
      const tokenAddrLocal = await token.getAddress();
      const auctionLogic = await AuctionHouseV3.deploy(tokenAddrLocal, wethAddr, AUCTION_DURATION);
      await auctionLogic.waitForDeployment();
      const auctionLogicAddr = await auctionLogic.getAddress();
      console.log(`│ NijiAuctionHouseV3 (logic): ${auctionLogicAddr}`);

      // ProxyAdmin
      const ProxyAdmin = await ethers.getContractFactory('NijiAuctionHouseProxyAdmin');
      const proxyAdmin = await ProxyAdmin.deploy();
      await proxyAdmin.waitForDeployment();
      const proxyAdminAddr = await proxyAdmin.getAddress();
      console.log(`│ NijiAuctionHouseProxyAdmin: ${proxyAdminAddr}`);

      // initialize calldata + Proxy deploy
      const initData = AuctionHouseV3.interface.encodeFunctionData('initialize', [
        AUCTION_RESERVE_PRICE,
        AUCTION_TIME_BUFFER,
        AUCTION_MIN_BID_INCREMENT_PRCT,
        sanctionsAddr,
      ]);
      const Proxy = await ethers.getContractFactory('NijiAuctionHouseProxy');
      const proxy = await Proxy.deploy(auctionLogicAddr, proxyAdminAddr, initData);
      await proxy.waitForDeployment();
      auctionProxyAddr = await proxy.getAddress();
      console.log(`│ NijiAuctionHouseProxy:      ${auctionProxyAddr}`);

      // NijiToken.setMinter(proxy) — proxy 経由でしか mint できないように
      const setMinterTx = await token.setMinter(auctionProxyAddr);
      await setMinterTx.wait();
      console.log(`│ NijiToken.setMinter → proxy`);

      // NijiToken.setPlaceholderURI — PR #247 で _mintTo に追加された PlaceholderURINotSet guard 対応。
      // auction の初回 _createAuction が NijiToken.mint() を呼ぶ前に必ず非空 placeholder を入れておく。
      const setPlaceholderTx = await (token as any).setPlaceholderURI(
        'ipfs://niji-placeholder/metadata.json',
      );
      await setPlaceholderTx.wait();
      console.log(`│ NijiToken.setPlaceholderURI`);

      // NijiToken.setMintingActive(true) — auction の初回 _createAuction が mint() を
      // 呼ぶときに `MintingNotActive` で revert しないように先に有効化する。
      const setMintingTx = await (token as any).setMintingActive(true);
      await setMintingTx.wait();
      console.log(`│ NijiToken.setMintingActive(true)`);

      // proxy.unpause() で auction を開始 (V3 IF を proxy address で wrap)
      // TransparentUpgradeableProxy 経由なので deployer (= EOA、 proxyAdmin owner)
      // から呼ぶ際は impl にフォールバック、 impl の owner = deployer (initialize で
      // __Ownable_init() 時に msg.sender 記録) のため unpause が通る。
      const auctionAtProxy = AuctionHouseV3.attach(auctionProxyAddr).connect(deployer);
      const ownerAddr = await (auctionAtProxy as any).owner();
      console.log(`│ AuctionHouse owner: ${ownerAddr}`);
      const unpauseTx = await (auctionAtProxy as any).unpause();
      await unpauseTx.wait();
      console.log(`│ AuctionHouse.unpause() → auction #0 started`);

      console.log('└──────────────────────────────────────────────────────────────┘\n');
    }

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
    const tokenAddrFinal = token ? await token.getAddress() : null;
    if (tokenAddrFinal) {
      console.log(`║ NijiToken:      ${tokenAddrFinal}  ║`);
    }
    if (auctionProxyAddr) {
      console.log(`║ AuctionHouse:   ${auctionProxyAddr}  ║`);
      console.log(`║ WETH:           ${wethAddr}  ║`);
    }
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║ Resolution:     ${RESOLUTION}x${RESOLUTION}`);
    console.log(`║ Trait Categories: ${TRAIT_DIRS.length}`);
    console.log(`║ Images Uploaded: ${samplePngs.size}`);
    console.log(`║ ETH Spent:      ${ethers.formatEther(balance - balanceAfter)} ETH`);
    console.log('╚═══════════════════════════════════════════════════════════════╝');

    // Constructor args captured per contract so the verify-niji task can reconstruct the
    // arguments needed by hardhat-verify / Etherscan API. Includes only contracts whose
    // verification we automate (NijiArt / Descriptor / Seeder / Token + AuctionHouse pair).
    // null for contracts that were not deployed in this run (e.g. token skipped via --skipToken,
    // auction skipped for non-localhost networks).
    const constructorArgs: Record<string, unknown[] | null> = {
      NijiArt: [deployer.address, TRAIT_DIRS.map(t => t.name)],
      NijiDescriptor: [artAddr, RESOLUTION, COMPOSITE_ORDER],
      NijiSeeder: [artAddr],
      NijiToken: tokenAddrFinal ? ['Niji', 'NIJI', descAddrFinal, seederAddr, MAX_SUPPLY] : null,
      NijiAuctionHouseProxy: null, // proxy uses initialize data, not constructor; verify separately
      WETH: wethAddr ? [] : null,
    };

    // Persist deploy log JSON for downstream sdk address sync
    const deployLog = {
      timestamp: new Date().toISOString(),
      network: network.name,
      chainId: Number((await ethers.provider.getNetwork()).chainId),
      deployer: deployer.address,
      contracts: {
        NijiArt: artAddr,
        NijiDescriptor: descAddrFinal,
        NijiSeeder: seederAddr,
        NijiToken: tokenAddrFinal,
        NijiAuctionHouseProxy: auctionProxyAddr,
        WETH: wethAddr,
      },
      constructorArgs,
    };
    const deployLogDir = path.join(__dirname, '../deploy');
    fs.mkdirSync(deployLogDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(deployLogDir, `${network.name}-${ts}-full.json`);
    fs.writeFileSync(logPath, JSON.stringify(deployLog, null, 2));
    console.log(`\n📝 Deploy log: ${logPath}`);

    // Persist the latest addresses under deployments/<network>.json so downstream tools
    // (SDK / webapp / scripts) can read a stable path without scanning timestamped log files.
    // The timestamped log above is kept as the auditable history; this file is the latest snapshot.
    //
    // Skip snapshot emission for partial deploys (--skipToken etc.) — otherwise the stable
    // path could be overwritten with null/incomplete addresses on tracked networks
    // (sepolia / base-sepolia / mainnet).
    if (args.skipToken) {
      console.log('\n⚠️  Skipping deployments/<network>.json snapshot (--skipToken partial run)');
    } else {
      const deploymentsDir = path.join(__dirname, '../deployments');
      fs.mkdirSync(deploymentsDir, { recursive: true });
      const latestPath = path.join(deploymentsDir, `${network.name}.json`);
      const latestPayload = {
        profile: 'full' as const,
        network: deployLog.network,
        chainId: deployLog.chainId,
        timestamp: deployLog.timestamp,
        deployer: deployLog.deployer,
        contracts: deployLog.contracts,
        constructorArgs: deployLog.constructorArgs,
      };
      fs.writeFileSync(latestPath, JSON.stringify(latestPayload, null, 2) + '\n');
      console.log(`📝 Deployments snapshot: ${latestPath}`);
    }

    // chainId 31337 (anvil / hardhat) のときだけ SDK gen.ts の 31337 entry を実 deploy
    // address に書き換える。 wagmi.config.ts は mainnet/sepolia のみを宣言しており
    // 31337 は test 用 patch entry のため、 deploy 結果と drift しないよう毎回同期する。
    if (deployLog.chainId === 31337) {
      const sdkActionsDir = path.join(__dirname, '../../niji-sdk/src/actions');
      const sdkReactDir = path.join(__dirname, '../../niji-sdk/src/react');
      const targets: { file: string; addr: string }[] = [
        { file: 'auction-house.gen.ts', addr: auctionProxyAddr ?? '' },
        { file: 'token.gen.ts', addr: tokenAddrFinal ?? '' },
        { file: 'descriptor.gen.ts', addr: descAddrFinal },
      ];
      let patched = 0;
      for (const { file, addr } of targets) {
        if (!addr) continue;
        for (const baseDir of [sdkActionsDir, sdkReactDir]) {
          const fp = path.join(baseDir, file);
          if (!fs.existsSync(fp)) continue;
          const orig = fs.readFileSync(fp, 'utf-8');
          const patchedSrc = orig.replace(
            /(\n\s*31337:\s*)'0x[0-9a-fA-F]{40}'/,
            `$1'${addr}'`,
          );
          if (patchedSrc !== orig) {
            fs.writeFileSync(fp, patchedSrc);
            patched++;
          }
        }
      }
      console.log(`📝 SDK 31337 address sync: ${patched} file(s) updated`);
    }

    // Return addresses for scripting
    return {
      art: artAddr,
      descriptor: descAddrFinal,
      seeder: seederAddr,
      token: tokenAddrFinal,
      auctionHouse: auctionProxyAddr,
      weth: wethAddr,
    };
  });
