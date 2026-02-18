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

describe('NijiGas – production-size PNG gas benchmarks', function () {
  this.timeout(180_000); // 3 minutes — large images need longer setup

  let owner: SignerWithAddress;

  const traitNames = [
    'special',
    'choker',
    'headphone',
    'leftHand',
    'hat',
    'clothing',
    'ear',
    'back',
    'backDecoration',
    'background',
    'solidBackground',
    'hair',
  ];
  const RESOLUTION = 320;
  const COMPOSITE_ORDER = [10, 9, 8, 0, 3, 7, 5, 1, 6, 11, 4, 2];
  const BLOCK_GAS_LIMIT = 30_000_000n;
  const TRAIT_COUNT = 12;

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
  async function measureViewGas(
    contractAddress: string,
    callData: string,
  ): Promise<bigint> {
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
    const art = (await NijiArtFactory.deploy(owner.address, traitNames)) as unknown as NijiArt;

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
      it(`${label.trim()} PNG x 12 layers`, async () => {
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
      art = (await NijiArtFactory.deploy(owner.address, traitNames)) as unknown as NijiArt;
    });

    const sizes = [
      { label: ' 5KB', bytes: 5_120 },
      { label: '10KB', bytes: 10_240 },
      { label: '15KB', bytes: 15_360 },
      { label: '20KB', bytes: 20_480 },
    ];

    for (const { label, bytes } of sizes) {
      it(`addTraitImage – ${label.trim()}`, async () => {
        const png = generateSyntheticPng(bytes);
        const tx = await art.addTraitImage(0, png);
        const receipt = await tx.wait();

        console.log(`        addTraitImage     | ${label}            | ${receipt!.gasUsed.toLocaleString()} gas`);
      });
    }

    it('addTraitImages – batch 3 x 10KB', async () => {
      const png = generateSyntheticPng(10_240);
      const tx = await art.addTraitImages(0, [png, png, png]);
      const receipt = await tx.wait();

      console.log(`        addTraitImages    | 3 x 10KB          | ${receipt!.gasUsed.toLocaleString()} gas`);
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
});
