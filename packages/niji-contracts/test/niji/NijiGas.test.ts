/**
 * NijiGas – Production-size PNG gas benchmarks
 *
 * Measures gas consumption for core Niji operations using production-scale
 * PNG data (5-20KB per layer) instead of the minimal 67-byte test PNG.
 *
 * Gas bottlenecks:
 *   1. art.getTraitImage()  — SSTORE2 read (EXTCODECOPY)
 *   2. Base64.encode(png)   — per-layer Base64 encoding
 *   3. Base64.encode(svg)   — full SVG Base64 encoding
 *   4. abi.encodePacked()   — JSON/SVG string concatenation + memory expansion
 *
 * Measurement approach:
 *   View functions are called as transactions (sendTransaction with explicit
 *   gasLimit) to bypass Hardhat's eth_estimateGas cap. The actual gas
 *   consumption is read from the transaction receipt.
 *
 * Requirements:
 *   - hardhat.config.ts: hardfork = "cancun" (Fusaka default caps tx gas at 16M via EIP-7825)
 *   - hardhat.config.ts: blockGasLimit = 300_000_000 (elevated for large view calls)
 *
 * This is a benchmark suite — all tests pass and report gas values.
 * Results exceeding the Ethereum mainnet block gas limit (30M) are
 * flagged with [OVER 30M LIMIT].
 */
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor } from '../../typechain';
import crypto from 'crypto';
import { TRAIT_NAMES, TRAIT_COUNT, RESOLUTION, COMPOSITE_ORDER } from './helpers';

/**
 * CI 環境判定 (GitHub Actions runner の 7GB memory 上限で 20KB PNG x 12 layers
 * が OOM kill される問題への対策)。
 *
 * - `process.env.CI = 'true'` (GH Actions / 一般的な CI で自動設定) 検出時のみ
 *   20KB size を skip し、 local (未設定) では従来通り 20KB まで実行して
 *   production sizing 用の gas benchmark を保持する。
 * - 判定を module 定数として export し、 behavior test から検証可能にする。
 */
export const IS_CI = process.env.CI === 'true';

/**
 * CI 環境で skip する PNG size bytes (20KB のみ)。 5/10/15KB + P6 profiles +
 * sub-operations は継続実行する (memory 上限を超えない)。
 */
export const CI_SKIP_SIZE_BYTES = 20_480;

describe('NijiGas – production-size PNG gas benchmarks', function () {
  this.timeout(180_000); // 3 minutes — large images need longer setup

  let owner: SignerWithAddress;

  const BLOCK_GAS_LIMIT = 30_000_000n;

  /**
   * Gas limit for view-function transactions.
   * Must be below blockGasLimit (300M in hardhat.config.ts).
   */
  const VIEW_TX_GAS_LIMIT = 200_000_000n;

  /** PNG file signature (8 bytes) */
  const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  /**
   * Generate synthetic PNG data of the specified size.
   * Starts with a valid PNG signature followed by random bytes.
   * The contract does not validate PNG format — only size matters for gas.
   */
  function generateSyntheticPng(sizeInBytes: number): Buffer {
    const body = crypto.randomBytes(sizeInBytes - PNG_HEADER.length);
    return Buffer.concat([PNG_HEADER, body]);
  }

  /**
   * Measure gas for a view function by sending it as a transaction
   * with an explicit gas limit, bypassing Hardhat's estimateGas cap.
   *
   * Returns gasUsed from the transaction receipt.
   */
  async function measureViewGas(contractAddress: string, callData: string): Promise<bigint> {
    const tx = await owner.sendTransaction({
      to: contractAddress,
      data: callData,
      gasLimit: VIEW_TX_GAS_LIMIT,
    });
    const receipt = await tx.wait();
    return receipt!.gasUsed;
  }

  /**
   * Deploy NijiArt + NijiDescriptor and populate traits with synthetic PNG data.
   *
   * @param png         - synthetic PNG buffer to use for every trait
   * @param activeLayers - number of active layers (rest are SKIP_LAYER)
   */
  async function deployWithImages(
    png: Buffer,
    activeLayers: number = TRAIT_COUNT,
  ): Promise<{ art: NijiArt; descriptor: NijiDescriptor; traitIndices: bigint[] }> {
    const NijiArtFactory = await ethers.getContractFactory('NijiArt');
    const art = (await NijiArtFactory.deploy(owner.address, TRAIT_NAMES)) as unknown as NijiArt;

    const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
    const descriptor = (await NijiDescriptorFactory.deploy(
      await art.getAddress(),
      RESOLUTION,
      COMPOSITE_ORDER,
    )) as unknown as NijiDescriptor;

    // owner is already the descriptor (set in NijiArt constructor)
    for (let i = 0; i < TRAIT_COUNT; i++) {
      await art.addTraitImage(i, png);
    }

    // Build trait indices: first `activeLayers` use index 0, rest are SKIP_LAYER
    const traitIndices: bigint[] = Array.from({ length: TRAIT_COUNT }, (_, i) =>
      i < activeLayers ? 0n : ethers.MaxUint256,
    );

    return { art, descriptor, traitIndices };
  }

  /** Format gas value with comma separators and over-limit marker */
  function fmtGas(gas: bigint): string {
    const formatted = gas.toLocaleString();
    return gas > BLOCK_GAS_LIMIT ? `${formatted} [OVER 30M LIMIT]` : `${formatted}`;
  }

  before(async () => {
    [owner] = await ethers.getSigners();
  });

  // =========================================================================
  //  Gas measurement – tokenURI
  // =========================================================================

  describe('Gas measurement – tokenURI', () => {
    const sizes = [
      { label: ' 5KB', bytes: 5_120 },
      { label: '10KB', bytes: 10_240 },
      { label: '15KB', bytes: 15_360 },
      { label: '20KB', bytes: 20_480 },
    ];

    for (const { label, bytes } of sizes) {
      // CI 環境では 20KB を skip (GH Actions 7GB memory 上限で OOM kill 対策、 GH #3012)
      const testFn = IS_CI && bytes === CI_SKIP_SIZE_BYTES ? it.skip : it;
      testFn(`${label.trim()} PNG x 12 layers`, async () => {
        const png = generateSyntheticPng(bytes);
        const { descriptor, traitIndices } = await deployWithImages(png, TRAIT_COUNT);

        const descriptorAddr = await descriptor.getAddress();
        const callData = descriptor.interface.encodeFunctionData('tokenURI', [0, traitIndices]);
        const gas = await measureViewGas(descriptorAddr, callData);

        console.log(`        tokenURI          | ${label} x 12 layers | ${fmtGas(gas)} gas`);
      });
    }

    it('10KB PNG x 8 layers (4 SKIP)', async () => {
      const png = generateSyntheticPng(10_240);
      const { descriptor, traitIndices } = await deployWithImages(png, 8);

      const descriptorAddr = await descriptor.getAddress();
      const callData = descriptor.interface.encodeFunctionData('tokenURI', [0, traitIndices]);
      const gas = await measureViewGas(descriptorAddr, callData);

      console.log(`        tokenURI          | 10KB x  8 layers | ${fmtGas(gas)} gas`);
    });
  });

  // =========================================================================
  //  Gas measurement – storage (addTraitImage / addTraitImages)
  // =========================================================================

  describe('Gas measurement – storage', () => {
    let art: NijiArt;

    beforeEach(async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      art = (await NijiArtFactory.deploy(owner.address, TRAIT_NAMES)) as unknown as NijiArt;
    });

    const sizes = [
      { label: ' 5KB', bytes: 5_120 },
      { label: '10KB', bytes: 10_240 },
      { label: '15KB', bytes: 15_360 },
      { label: '20KB', bytes: 20_480 },
    ];

    for (const { label, bytes } of sizes) {
      // CI 環境では 20KB を skip (GH Actions 7GB memory 上限で OOM kill 対策、 GH #3012)
      const testFn = IS_CI && bytes === CI_SKIP_SIZE_BYTES ? it.skip : it;
      testFn(`addTraitImage – ${label.trim()}`, async () => {
        const png = generateSyntheticPng(bytes);
        const tx = await art.addTraitImage(0, png);
        const receipt = await tx.wait();

        console.log(
          `        addTraitImage     | ${label}            | ${receipt!.gasUsed.toLocaleString()} gas`,
        );
      });
    }

    it('addTraitImages – batch 3 x 10KB', async () => {
      const png = generateSyntheticPng(10_240);
      const tx = await art.addTraitImages(0, [png, png, png]);
      const receipt = await tx.wait();

      console.log(
        `        addTraitImages    | 3 x 10KB          | ${receipt!.gasUsed.toLocaleString()} gas`,
      );
    });
  });

  // =========================================================================
  //  Gas measurement – sub-operations
  // =========================================================================

  describe('Gas measurement – sub-operations', () => {
    it('generateSVG – 10KB x 12 layers', async () => {
      const png = generateSyntheticPng(10_240);
      const { descriptor, traitIndices } = await deployWithImages(png, TRAIT_COUNT);

      const descriptorAddr = await descriptor.getAddress();
      const callData = descriptor.interface.encodeFunctionData('generateSVG', [traitIndices]);
      const gas = await measureViewGas(descriptorAddr, callData);

      console.log(`        generateSVG       | 10KB x 12 layers | ${fmtGas(gas)} gas`);
    });

    it('generateSVGBase64 – 10KB x 12 layers', async () => {
      const png = generateSyntheticPng(10_240);
      const { descriptor, traitIndices } = await deployWithImages(png, TRAIT_COUNT);

      const descriptorAddr = await descriptor.getAddress();
      const callData = descriptor.interface.encodeFunctionData('generateSVGBase64', [traitIndices]);
      const gas = await measureViewGas(descriptorAddr, callData);

      console.log(`        generateSVGBase64  | 10KB x 12 layers | ${fmtGas(gas)} gas`);
    });
  });

  // =========================================================================
  //  P6 actual-profile gas measurement
  //  (512×512 / global 256 palette + pngquant + oxipng)
  //
  //  Trait order matches INijiSeeder definition (id 0-11):
  //  special / choker / headphone / leftHand / hat / clothing
  //  ear / back / backDecoration / background / solidBackground / hair
  //
  //  KB values are taken from docs/quality-comparison/summary.json
  //  generated by packages/niji-assets/scripts/encode-niji-png.ts.
  // =========================================================================

  describe('Gas measurement – P6 actual profile (512px global+pngquant+oxipng)', () => {
    type Profile = { label: string; kbPerTrait: number[]; totalKb: number };

    const profiles: Profile[] = [
      {
        label: 'worst',
        // 108KB total (all layers cap-fit to 16KB to satisfy tokenURI ~200KB display cap)
        kbPerTrait: [11.11, 5.01, 6.30, 10.79, 5.44, 13.40, 2.06, 10.40, 11.10, 13.73, 0.12, 18.56],
        totalKb: 108.05,
      },
      {
        label: 'median',
        // 90KB total
        kbPerTrait: [11.44, 1.98, 6.20, 6.87, 3.58, 13.29, 1.67, 10.89, 11.70, 2.87, 0.12, 19.58],
        totalKb: 90.19,
      },
      {
        label: 'best',
        // 48KB total
        kbPerTrait: [3.22, 1.34, 3.53, 3.71, 1.91, 6.35, 1.93, 11.09, 1.23, 1.53, 0.12, 12.19],
        totalKb: 48.15,
      },
    ];

    /** Deploy with per-trait sized PNGs (one image per trait, traitIndex 0) */
    async function deployWithProfile(
      kbPerTrait: number[],
    ): Promise<{ art: NijiArt; descriptor: NijiDescriptor; traitIndices: bigint[] }> {
      if (kbPerTrait.length !== TRAIT_COUNT) {
        throw new Error(`kbPerTrait must have ${TRAIT_COUNT} entries`);
      }

      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const art = (await NijiArtFactory.deploy(owner.address, TRAIT_NAMES)) as unknown as NijiArt;

      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const descriptor = (await NijiDescriptorFactory.deploy(
        await art.getAddress(),
        RESOLUTION,
        COMPOSITE_ORDER,
      )) as unknown as NijiDescriptor;

      for (let i = 0; i < TRAIT_COUNT; i++) {
        const bytes = Math.max(PNG_HEADER.length + 1, Math.round(kbPerTrait[i] * 1024));
        await art.addTraitImage(i, generateSyntheticPng(bytes));
      }

      const traitIndices: bigint[] = Array.from({ length: TRAIT_COUNT }, () => 0n);
      return { art, descriptor, traitIndices };
    }

    for (const profile of profiles) {
      it(`tokenURI – P6 ${profile.label} (${profile.totalKb}KB total)`, async () => {
        const { descriptor, traitIndices } = await deployWithProfile(profile.kbPerTrait);
        const descriptorAddr = await descriptor.getAddress();
        const callData = descriptor.interface.encodeFunctionData('tokenURI', [0, traitIndices]);
        const gas = await measureViewGas(descriptorAddr, callData);

        console.log(
          `        tokenURI          | P6 ${profile.label.padEnd(6)} (${profile.totalKb.toString().padStart(6)}KB) | ${fmtGas(gas)} gas`,
        );
      });

      it(`generateSVG – P6 ${profile.label}`, async () => {
        const { descriptor, traitIndices } = await deployWithProfile(profile.kbPerTrait);
        const descriptorAddr = await descriptor.getAddress();
        const callData = descriptor.interface.encodeFunctionData('generateSVG', [traitIndices]);
        const gas = await measureViewGas(descriptorAddr, callData);

        console.log(
          `        generateSVG       | P6 ${profile.label.padEnd(6)} (${profile.totalKb.toString().padStart(6)}KB) | ${fmtGas(gas)} gas`,
        );
      });

      it(`generateSVGBase64 – P6 ${profile.label}`, async () => {
        const { descriptor, traitIndices } = await deployWithProfile(profile.kbPerTrait);
        const descriptorAddr = await descriptor.getAddress();
        const callData = descriptor.interface.encodeFunctionData('generateSVGBase64', [traitIndices]);
        const gas = await measureViewGas(descriptorAddr, callData);

        console.log(
          `        generateSVGBase64  | P6 ${profile.label.padEnd(6)} (${profile.totalKb.toString().padStart(6)}KB) | ${fmtGas(gas)} gas`,
        );
      });
    }

    it('addTraitImage – P6 worst trait (hair 21KB cap-fit)', async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const art = (await NijiArtFactory.deploy(owner.address, TRAIT_NAMES)) as unknown as NijiArt;
      const png = generateSyntheticPng(Math.round(21.42 * 1024));
      const tx = await art.addTraitImage(11, png);
      const receipt = await tx.wait();
      console.log(
        `        addTraitImage     | P6 worst trait (21.4KB hair)       | ${receipt!.gasUsed.toLocaleString()} gas`,
      );
    });
  });
});
