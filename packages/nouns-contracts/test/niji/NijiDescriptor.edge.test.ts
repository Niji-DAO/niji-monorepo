import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor } from '../../typechain';
import {
  TRAIT_NAMES,
  TRAIT_COUNT,
  SAMPLE_PNG,
  RESOLUTION,
  COMPOSITE_ORDER,
  deployNijiArt,
  deployNijiDescriptor,
  populateAllTraits,
  buildTraitIndices,
  decodeTokenURI,
} from './helpers';

describe('NijiDescriptor (edge cases)', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    art = await deployNijiArt(owner.address);
    descriptor = await deployNijiDescriptor(await art.getAddress());
    await art.setDescriptor(await descriptor.getAddress());
    await art.transferDescriptor(owner.address);
  });

  // =========================================================================
  //  Constructor — edge cases
  // =========================================================================

  describe('constructor edge cases', () => {
    it('should deploy with resolution = 1 (minimum valid)', async () => {
      const d = await deployNijiDescriptor(await art.getAddress(), 1);
      expect(await d.resolution()).to.equal(1);
    });

    it('should deploy with empty compositeOrder', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const d = (await NijiDescriptorFactory.deploy(
        await art.getAddress(),
        RESOLUTION,
        [],
      )) as unknown as NijiDescriptor;

      expect(await d.getCompositeOrderLength()).to.equal(0);
    });

    it('should deploy with compositeOrder containing out-of-range values', async () => {
      // compositeOrder can contain values >= traitCount; they are silently skipped in generateSVG
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const d = (await NijiDescriptorFactory.deploy(
        await art.getAddress(),
        RESOLUTION,
        [99, 100],
      )) as unknown as NijiDescriptor;

      expect(await d.getCompositeOrderLength()).to.equal(2);
    });
  });

  // =========================================================================
  //  tokenURIWithMetadata — edge cases
  // =========================================================================

  describe('tokenURIWithMetadata edge cases', () => {
    beforeEach(async () => {
      await art.addTraitImage(10, SAMPLE_PNG);
    });

    it('should revert for empty traitIndices', async () => {
      await expect(
        descriptor.tokenURIWithMetadata(0, [], 'Name', 'Desc'),
      ).to.be.revertedWithCustomError(descriptor, 'EmptyTraitIndices');
    });
  });

  // =========================================================================
  //  generateSVG — all SKIP_LAYER
  // =========================================================================

  describe('generateSVG with all SKIP_LAYER', () => {
    it('should generate valid SVG with no image tags', async () => {
      const allSkip = Array(TRAIT_COUNT).fill(ethers.MaxUint256);
      const svg = await descriptor.generateSVG(allSkip);

      expect(svg).to.include('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).to.include('</svg>');
      // No <image> tags since all are SKIP_LAYER
      expect(svg).to.not.include('<image');
    });
  });

  // =========================================================================
  //  generateSVG — compositeOrder with out-of-range traitId
  // =========================================================================

  describe('generateSVG with out-of-range compositeOrder', () => {
    it('should skip layers whose traitId exceeds traitIndices length', async () => {
      // Deploy descriptor with compositeOrder containing out-of-range value
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const d = (await NijiDescriptorFactory.deploy(
        await art.getAddress(),
        RESOLUTION,
        [99], // traitId 99 > traitIndices.length
      )) as unknown as NijiDescriptor;

      const traitIndices = [0n]; // only 1 element
      const svg = await d.generateSVG(traitIndices);

      expect(svg).to.include('<svg');
      expect(svg).to.not.include('<image');
    });
  });

  // =========================================================================
  //  setArt — edge cases
  // =========================================================================

  describe('setArt edge cases', () => {
    it('should revert for zero address', async () => {
      await expect(
        descriptor.setArt(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(descriptor, 'EmptyArtAddress');
    });

    it('should use new art for SVG generation after setArt', async () => {
      // Create new art with images
      const newArt = await deployNijiArt(owner.address);
      await newArt.addTraitImage(0, SAMPLE_PNG);

      await descriptor.setArt(await newArt.getAddress());

      // Generate SVG using trait 0 image 0
      const traitIndices = buildTraitIndices({ 0: 0 });
      const svg = await descriptor.generateSVG(traitIndices);

      expect(svg).to.include('<image');
    });
  });

  // =========================================================================
  //  generateDataURI
  // =========================================================================

  describe('generateDataURI', () => {
    beforeEach(async () => {
      await art.addTraitImage(10, SAMPLE_PNG);
    });

    it('should return valid data URI', async () => {
      const traitIndices = buildTraitIndices({ 10: 0 });
      const dataURI = await descriptor.generateDataURI(traitIndices);

      expect(dataURI).to.include('data:image/svg+xml;base64,');
    });

    it('should return data URI with all SKIP_LAYER', async () => {
      const allSkip = Array(TRAIT_COUNT).fill(ethers.MaxUint256);
      const dataURI = await descriptor.generateDataURI(allSkip);

      expect(dataURI).to.include('data:image/svg+xml;base64,');
    });
  });

  // =========================================================================
  //  getCompositeOrderLength
  // =========================================================================

  describe('getCompositeOrderLength', () => {
    it('should return correct length', async () => {
      expect(await descriptor.getCompositeOrderLength()).to.equal(COMPOSITE_ORDER.length);
    });
  });

  // =========================================================================
  //  isConfigured — edge cases
  // =========================================================================

  describe('isConfigured edge cases', () => {
    it('should return false when compositeOrder is empty', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const d = (await NijiDescriptorFactory.deploy(
        await art.getAddress(),
        RESOLUTION,
        [],
      )) as unknown as NijiDescriptor;

      expect(await d.isConfigured()).to.be.false;
    });
  });

  // =========================================================================
  //  setCompositeOrder — edge cases
  // =========================================================================

  describe('setCompositeOrder edge cases', () => {
    it('should allow setting empty composite order', async () => {
      await descriptor.setCompositeOrder([]);
      expect(await descriptor.getCompositeOrderLength()).to.equal(0);
    });

    it('should revert if non-owner calls', async () => {
      await expect(
        descriptor.connect(other).setCompositeOrder([0, 1]),
      ).to.be.revertedWithCustomError(descriptor, 'OwnableUnauthorizedAccount');
    });
  });

  // =========================================================================
  //  setResolution — edge cases
  // =========================================================================

  describe('setResolution edge cases', () => {
    it('should allow setting resolution = 1', async () => {
      await descriptor.setResolution(1);
      expect(await descriptor.resolution()).to.equal(1);
    });

    it('should reflect new resolution in generated SVG', async () => {
      await art.addTraitImage(10, SAMPLE_PNG);
      await descriptor.setResolution(999);

      const traitIndices = buildTraitIndices({ 10: 0 });
      const svg = await descriptor.generateSVG(traitIndices);

      expect(svg).to.include('width="999"');
      expect(svg).to.include('height="999"');
    });
  });
});
