import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt } from '../../typechain';
import { TRAIT_COUNT, SAMPLE_PNG, deployNijiArt } from './helpers';

describe('NijiArt (edge cases)', () => {
  let art: NijiArt;
  let owner: SignerWithAddress;
  let descriptor: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, descriptor, other] = await ethers.getSigners();
    art = await deployNijiArt(descriptor.address);
  });

  // =========================================================================
  //  addTraitImages — edge cases
  // =========================================================================

  describe('addTraitImages edge cases', () => {
    it('should succeed with empty array (no-op)', async () => {
      await art.connect(descriptor).addTraitImages(0, []);
      expect(await art.getTraitImageCount(0)).to.equal(0);
    });

    it('should revert when called by non-descriptor', async () => {
      await expect(
        art.connect(other).addTraitImages(0, [SAMPLE_PNG]),
      ).to.be.revertedWithCustomError(art, 'SenderIsNotDescriptor');
    });

    it('should revert if any element has empty PNG data', async () => {
      await expect(
        art.connect(descriptor).addTraitImages(0, [SAMPLE_PNG, '0x']),
      ).to.be.revertedWithCustomError(art, 'EmptyPngData');
    });
  });

  // =========================================================================
  //  addTraitImage — boundary traitId
  // =========================================================================

  describe('addTraitImage boundary traitId', () => {
    it('should succeed at last valid traitId (traitCount - 1)', async () => {
      const lastTrait = TRAIT_COUNT - 1;
      await art.connect(descriptor).addTraitImage(lastTrait, SAMPLE_PNG);
      expect(await art.getTraitImageCount(lastTrait)).to.equal(1);
    });

    it('should revert at traitId = traitCount (just out of bounds)', async () => {
      await expect(
        art.connect(descriptor).addTraitImage(TRAIT_COUNT, SAMPLE_PNG),
      ).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });
  });

  // =========================================================================
  //  getTraitImage — edge cases
  // =========================================================================

  describe('getTraitImage edge cases', () => {
    it('should revert at index 0 when trait has no images', async () => {
      await expect(art.getTraitImage(0, 0)).to.be.revertedWithCustomError(art, 'InvalidImageIndex');
    });

    it('should succeed at last valid imageIndex', async () => {
      // Add 3 images
      await art.connect(descriptor).addTraitImages(0, [SAMPLE_PNG, SAMPLE_PNG, SAMPLE_PNG]);
      const data = await art.getTraitImage(0, 2);
      expect(data).to.equal('0x' + SAMPLE_PNG.toString('hex'));
    });

    it('should revert at imageIndex = imageCount (just out of bounds)', async () => {
      await art.connect(descriptor).addTraitImage(0, SAMPLE_PNG);
      await expect(art.getTraitImage(0, 1)).to.be.revertedWithCustomError(art, 'InvalidImageIndex');
    });
  });

  // =========================================================================
  //  getTraitPointer / getTraitPointers — edge cases
  // =========================================================================

  describe('getTraitPointer edge cases', () => {
    it('should revert for invalid traitId', async () => {
      await expect(art.getTraitPointer(99, 0)).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });

    it('should revert for out-of-bounds imageIndex', async () => {
      await expect(art.getTraitPointer(0, 0)).to.be.revertedWithCustomError(
        art,
        'InvalidImageIndex',
      );
    });

    it('should return valid pointer for existing image', async () => {
      await art.connect(descriptor).addTraitImage(0, SAMPLE_PNG);
      const pointer = await art.getTraitPointer(0, 0);
      expect(pointer).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe('getTraitPointers edge cases', () => {
    it('should revert for invalid traitId', async () => {
      await expect(art.getTraitPointers(99)).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });

    it('should return empty array when no images stored', async () => {
      const pointers = await art.getTraitPointers(0);
      expect(pointers.length).to.equal(0);
    });
  });

  // =========================================================================
  //  setDescriptor — edge cases
  // =========================================================================

  describe('setDescriptor edge cases', () => {
    it('should revert when setting zero address', async () => {
      await expect(
        art.connect(descriptor).setDescriptor(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(art, 'EmptyDescriptorAddress');
    });

    it('should allow self-update (same address)', async () => {
      await art.connect(descriptor).setDescriptor(descriptor.address);
      expect(await art.descriptor()).to.equal(descriptor.address);
    });

    it('should prevent old descriptor from adding images after change', async () => {
      await art.connect(descriptor).setDescriptor(other.address);

      await expect(
        art.connect(descriptor).addTraitImage(0, SAMPLE_PNG),
      ).to.be.revertedWithCustomError(art, 'SenderIsNotDescriptor');

      // New descriptor can add
      await art.connect(other).addTraitImage(0, SAMPLE_PNG);
      expect(await art.getTraitImageCount(0)).to.equal(1);
    });
  });

  // =========================================================================
  //  transferDescriptor — edge cases
  // =========================================================================

  describe('transferDescriptor edge cases', () => {
    it('should revert when setting zero address', async () => {
      await expect(
        art.connect(owner).transferDescriptor(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(art, 'EmptyDescriptorAddress');
    });
  });

  // =========================================================================
  //  Constructor — edge cases
  // =========================================================================

  describe('constructor edge cases', () => {
    it('should deploy with single trait name', async () => {
      const singleArt = await deployNijiArt(descriptor.address, ['only']);
      expect(await singleArt.traitCount()).to.equal(1);
      expect(await singleArt.getTraitName(0)).to.equal('only');
    });

    it('should deploy with empty trait names array', async () => {
      const emptyArt = await deployNijiArt(descriptor.address, []);
      expect(await emptyArt.traitCount()).to.equal(0);
    });
  });
});
