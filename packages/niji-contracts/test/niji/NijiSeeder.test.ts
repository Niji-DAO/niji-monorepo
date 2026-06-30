import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiSeeder } from '../../typechain';
import {
  TRAIT_NAMES,
  deployNijiArt,
  deployNijiSeeder,
  populateAllTraits,
  shouldBehaveLikeOwnable2Step,
} from './helpers';

describe('NijiSeeder', () => {
  let art: NijiArt;
  let seeder: NijiSeeder;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();

    art = await deployNijiArt(owner.address);
    seeder = await deployNijiSeeder(await art.getAddress());

    // Add some images for testing
    await populateAllTraits(art);
  });

  describe('constructor', () => {
    it('should set art correctly', async () => {
      expect(await seeder.art()).to.equal(await art.getAddress());
    });

    it('should set owner to deployer', async () => {
      expect(await seeder.owner()).to.equal(owner.address);
    });

    it('should revert if art is zero address', async () => {
      const NijiSeederFactory = await ethers.getContractFactory('NijiSeeder');
      await expect(NijiSeederFactory.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        NijiSeederFactory,
        'InvalidArtAddress',
      );
    });
  });

  describe('generateSeed', () => {
    it('should generate a seed with all 12 traits', async () => {
      const seed = await seeder.generateSeed(0, ethers.ZeroAddress);

      // Check that all traits are set (they should be 0, 1, or 2 since we have 3 images per trait)
      expect(seed.special).to.be.at.least(0);
      expect(seed.special).to.be.at.most(2);
      expect(seed.choker).to.be.at.least(0);
      expect(seed.choker).to.be.at.most(2);
      expect(seed.headphone).to.be.at.least(0);
      expect(seed.headphone).to.be.at.most(2);
      expect(seed.leftHand).to.be.at.least(0);
      expect(seed.leftHand).to.be.at.most(2);
      expect(seed.hat).to.be.at.least(0);
      expect(seed.hat).to.be.at.most(2);
      expect(seed.clothing).to.be.at.least(0);
      expect(seed.clothing).to.be.at.most(2);
      expect(seed.ear).to.be.at.least(0);
      expect(seed.ear).to.be.at.most(2);
      expect(seed.back).to.be.at.least(0);
      expect(seed.back).to.be.at.most(2);
      expect(seed.backDecoration).to.be.at.least(0);
      expect(seed.backDecoration).to.be.at.most(2);
      expect(seed.background).to.be.at.least(0);
      expect(seed.background).to.be.at.most(2);
      expect(seed.solidBackground).to.be.at.least(0);
      expect(seed.solidBackground).to.be.at.most(2);
      expect(seed.hair).to.be.at.least(0);
      expect(seed.hair).to.be.at.most(2);
    });

    it('should generate different seeds for different token IDs (in different blocks)', async () => {
      const seed1 = await seeder.generateSeed(0, ethers.ZeroAddress);

      // Mine a new block
      await ethers.provider.send('evm_mine', []);

      const seed2 = await seeder.generateSeed(1, ethers.ZeroAddress);

      // Seeds should be different (very unlikely to be the same)
      const seed1Hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          [
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
          ],
          [
            seed1.special,
            seed1.choker,
            seed1.headphone,
            seed1.leftHand,
            seed1.hat,
            seed1.clothing,
            seed1.ear,
            seed1.back,
            seed1.backDecoration,
            seed1.background,
            seed1.solidBackground,
            seed1.hair,
          ],
        ),
      );
      const seed2Hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          [
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
            'uint48',
          ],
          [
            seed2.special,
            seed2.choker,
            seed2.headphone,
            seed2.leftHand,
            seed2.hat,
            seed2.clothing,
            seed2.ear,
            seed2.back,
            seed2.backDecoration,
            seed2.background,
            seed2.solidBackground,
            seed2.hair,
          ],
        ),
      );

      expect(seed1Hash).to.not.equal(seed2Hash);
    });
  });

  describe('generateSeedFromSource', () => {
    it('should generate deterministic seed from source', async () => {
      const source = BigInt('0x123456789abcdef');

      const seed1 = await seeder.generateSeedFromSource(source);
      const seed2 = await seeder.generateSeedFromSource(source);

      // Same source should produce same seed
      expect(seed1.special).to.equal(seed2.special);
      expect(seed1.choker).to.equal(seed2.choker);
      expect(seed1.hair).to.equal(seed2.hair);
    });

    it('should generate different seeds for different sources', async () => {
      const seed1 = await seeder.generateSeedFromSource(1n);
      const seed2 = await seeder.generateSeedFromSource(2n);

      // Different sources should (very likely) produce different seeds
      expect(
        seed1.special !== seed2.special ||
          seed1.choker !== seed2.choker ||
          seed1.hair !== seed2.hair,
      ).to.be.true;
    });
  });

  describe('getTraitCount', () => {
    it('should return correct trait count', async () => {
      expect(await seeder.getTraitCount(0)).to.equal(3);
      expect(await seeder.getTraitCount(11)).to.equal(3);
    });
  });

  describe('getAllTraitCounts', () => {
    it('should return all trait counts', async () => {
      const counts = await seeder.getAllTraitCounts();

      expect(counts.length).to.equal(12);
      for (const count of counts) {
        expect(count).to.equal(3);
      }
    });
  });

  describe('setArt', () => {
    it('should allow owner to update art', async () => {
      const newArt = await deployNijiArt(owner.address);
      const artAddr = await art.getAddress();
      const newArtAddr = await newArt.getAddress();

      await expect(seeder.connect(owner).setArt(newArtAddr))
        .to.emit(seeder, 'ArtUpdated')
        .withArgs(artAddr, newArtAddr);

      expect(await seeder.art()).to.equal(newArtAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(seeder.connect(other).setArt(other.address)).to.be.revertedWithCustomError(
        seeder,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should revert if art is zero address', async () => {
      await expect(seeder.setArt(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        seeder,
        'InvalidArtAddress',
      );
    });
  });

  shouldBehaveLikeOwnable2Step(
    () => seeder,
    () => owner,
    () => other,
    () => owner,
  );

  describe('renounceOwnership disabled (non-owner)', () => {
    it('should revert with OwnableUnauthorizedAccount when called by non-owner', async () => {
      await expect(seeder.connect(other).renounceOwnership()).to.be.revertedWithCustomError(
        seeder,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('entropy salt', () => {
    const SAMPLE_SALT = '0x' + 'ab'.repeat(32);
    const ALT_SALT = '0x' + 'cd'.repeat(32);

    it('should default to zero salt and unlocked', async () => {
      expect(await seeder.entropySalt()).to.equal('0x' + '00'.repeat(32));
      expect(await seeder.isEntropySaltLocked()).to.be.false;
    });

    it('should allow owner to rotate entropy salt', async () => {
      await expect(seeder.setEntropySalt(SAMPLE_SALT))
        .to.emit(seeder, 'EntropySaltUpdated')
        .withArgs(SAMPLE_SALT);
      expect(await seeder.entropySalt()).to.equal(SAMPLE_SALT);
    });

    it('should mix entropySalt into generateSeed (isolated from block-context drift)', async () => {
      // Freeze block context by stopping auto-mining: every view call is evaluated in the
      // same block (= same blockhash / timestamp / prevrandao), so the only differing input
      // is `entropySalt`. This isolates the salt's contribution from time-varying entropy.
      await ethers.provider.send('evm_setAutomine', [false]);
      try {
        await seeder.setEntropySalt(SAMPLE_SALT);
        await seeder.setEntropySalt(ALT_SALT);
        // Both transactions are still in the mempool; mine them in one block.
        await ethers.provider.send('evm_mine', []);

        // Snapshot the seed at the current salt (= ALT_SALT after the second setEntropySalt).
        const seedAtAlt = await seeder.generateSeed(0, await art.getAddress());

        // Revert the salt and re-read at the new salt — still inside automine: false, but
        // the next evm_mine packs the transaction into a new block. Snapshot before / after
        // and compare deterministically.
        await seeder.setEntropySalt(SAMPLE_SALT);
        await ethers.provider.send('evm_mine', []);
        const seedAtSample = await seeder.generateSeed(0, await art.getAddress());

        const anyTraitChanged =
          seedAtAlt.special !== seedAtSample.special ||
          seedAtAlt.choker !== seedAtSample.choker ||
          seedAtAlt.headphone !== seedAtSample.headphone ||
          seedAtAlt.leftHand !== seedAtSample.leftHand ||
          seedAtAlt.hat !== seedAtSample.hat ||
          seedAtAlt.clothing !== seedAtSample.clothing ||
          seedAtAlt.ear !== seedAtSample.ear ||
          seedAtAlt.back !== seedAtSample.back ||
          seedAtAlt.backDecoration !== seedAtSample.backDecoration ||
          seedAtAlt.background !== seedAtSample.background ||
          seedAtAlt.solidBackground !== seedAtSample.solidBackground ||
          seedAtAlt.hair !== seedAtSample.hair;
        expect(anyTraitChanged).to.be.true;
      } finally {
        await ethers.provider.send('evm_setAutomine', [true]);
      }
    });

    it('should revert setEntropySalt from non-owner', async () => {
      await expect(seeder.connect(other).setEntropySalt(SAMPLE_SALT)).to.be.revertedWithCustomError(
        seeder,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should allow owner to lock entropy salt', async () => {
      await expect(seeder.lockEntropySalt()).to.emit(seeder, 'EntropySaltLockedEvent');
      expect(await seeder.isEntropySaltLocked()).to.be.true;
    });

    it('should revert setEntropySalt after lock', async () => {
      await seeder.lockEntropySalt();
      await expect(seeder.setEntropySalt(ALT_SALT)).to.be.revertedWithCustomError(
        seeder,
        'EntropySaltLocked',
      );
    });

    it('should revert lockEntropySalt when called twice', async () => {
      await seeder.lockEntropySalt();
      await expect(seeder.lockEntropySalt()).to.be.revertedWithCustomError(
        seeder,
        'EntropySaltLocked',
      );
    });

    it('should revert lockEntropySalt when non-owner', async () => {
      await expect(seeder.connect(other).lockEntropySalt()).to.be.revertedWithCustomError(
        seeder,
        'OwnableUnauthorizedAccount',
      );
    });
  });
});
