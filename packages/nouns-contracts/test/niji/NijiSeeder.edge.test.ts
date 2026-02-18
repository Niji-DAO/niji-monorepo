import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiSeeder } from '../../typechain';
import {
  TRAIT_COUNT,
  SAMPLE_PNG,
  deployNijiArt,
  deployNijiSeeder,
  populateAllTraits,
} from './helpers';

describe('NijiSeeder (edge cases)', () => {
  let art: NijiArt;
  let seeder: NijiSeeder;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    art = await deployNijiArt(owner.address);
    seeder = await deployNijiSeeder(await art.getAddress());
  });

  // =========================================================================
  //  generateSeed with 0 images — SKIP_LAYER
  // =========================================================================

  describe('generateSeed with no images', () => {
    it('should return SKIP_LAYER (MaxUint256) for traits with 0 images', async () => {
      // No images added — all traits have 0 count
      const seed = await seeder.generateSeedFromSource(12345n);

      // When traitCount == 0, _pickTrait returns type(uint256).max
      // But seed fields are uint48, so MaxUint256 truncates to 2^48 - 1 = 281474976710655
      const UINT48_MAX = (1n << 48n) - 1n;
      expect(seed.special).to.equal(UINT48_MAX);
      expect(seed.choker).to.equal(UINT48_MAX);
      expect(seed.hair).to.equal(UINT48_MAX);
    });
  });

  // =========================================================================
  //  generateSeedFromSource — boundary values
  // =========================================================================

  describe('generateSeedFromSource boundary values', () => {
    beforeEach(async () => {
      await populateAllTraits(art);
    });

    it('should handle source = 0', async () => {
      const seed = await seeder.generateSeedFromSource(0n);
      // With 3 images per trait: 0 % 3 = 0 for all traits
      expect(seed.special).to.equal(0);
      expect(seed.choker).to.equal(0);
      expect(seed.hair).to.equal(0);
    });

    it('should handle source = MaxUint256', async () => {
      const seed = await seeder.generateSeedFromSource(ethers.MaxUint256);
      // Should not revert; all values should be valid (0-2)
      for (const field of [
        seed.special, seed.choker, seed.headphone, seed.leftHand,
        seed.hat, seed.clothing, seed.ear, seed.back,
        seed.backDecoration, seed.background, seed.solidBackground, seed.hair,
      ]) {
        expect(field).to.be.at.least(0);
        expect(field).to.be.at.most(2);
      }
    });
  });

  // =========================================================================
  //  getTraitCount with out-of-range traitId
  // =========================================================================

  describe('getTraitCount out-of-range', () => {
    it('should return 0 for traitId beyond art.traitCount', async () => {
      // art.getTraitImageCount for non-existing traitId returns 0 (empty mapping)
      const count = await seeder.getTraitCount(99);
      expect(count).to.equal(0);
    });
  });

  // =========================================================================
  //  setArt — seed generation after art change
  // =========================================================================

  describe('generateSeed after art change', () => {
    it('should use new art for trait counts', async () => {
      await populateAllTraits(art);

      // Verify current state works
      const seed1 = await seeder.generateSeedFromSource(42n);
      expect(seed1.special).to.be.at.most(2);

      // Deploy new art with only 1 image per trait
      const newArt = await deployNijiArt(owner.address);
      await populateAllTraits(newArt, SAMPLE_PNG, 1);

      await seeder.setArt(await newArt.getAddress());

      // Now all traits have exactly 1 image → all values should be 0
      const seed2 = await seeder.generateSeedFromSource(42n);
      expect(seed2.special).to.equal(0);
      expect(seed2.hair).to.equal(0);
    });
  });
});
