import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiSeeder } from '../../typechain';

describe('NijiSeeder', () => {
  let art: NijiArt;
  let seeder: NijiSeeder;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  const traitNames = ['special', 'choker', 'headphone', 'leftHand', 'hat', 'clothing', 'ear', 'back', 'backDecoration', 'background', 'solidBackground', 'hair'];

  // Sample PNG data
  const samplePng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();

    // Deploy NijiArt
    const NijiArtFactory = await ethers.getContractFactory('NijiArt');
    art = (await NijiArtFactory.deploy(owner.address, traitNames)) as unknown as NijiArt;

    // Deploy NijiSeeder
    const NijiSeederFactory = await ethers.getContractFactory('NijiSeeder');
    seeder = (await NijiSeederFactory.deploy(await art.getAddress())) as unknown as NijiSeeder;

    // Add some images for testing
    for (let i = 0; i < 12; i++) {
      await art.addTraitImages(i, [samplePng, samplePng, samplePng]);
    }
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
      await expect(
        NijiSeederFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(NijiSeederFactory, 'InvalidArtAddress');
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
          ['uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48'],
          [seed1.special, seed1.choker, seed1.headphone, seed1.leftHand, seed1.hat, seed1.clothing, seed1.ear, seed1.back, seed1.backDecoration, seed1.background, seed1.solidBackground, seed1.hair]
        )
      );
      const seed2Hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48', 'uint48'],
          [seed2.special, seed2.choker, seed2.headphone, seed2.leftHand, seed2.hat, seed2.clothing, seed2.ear, seed2.back, seed2.backDecoration, seed2.background, seed2.solidBackground, seed2.hair]
        )
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
        seed1.hair !== seed2.hair
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
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const newArt = await NijiArtFactory.deploy(owner.address, traitNames);
      const artAddr = await art.getAddress();
      const newArtAddr = await newArt.getAddress();

      await expect(seeder.connect(owner).setArt(newArtAddr))
        .to.emit(seeder, 'ArtUpdated')
        .withArgs(artAddr, newArtAddr);

      expect(await seeder.art()).to.equal(newArtAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(
        seeder.connect(other).setArt(other.address)
      ).to.be.revertedWithCustomError(seeder, 'OwnableUnauthorizedAccount');
    });

    it('should revert if art is zero address', async () => {
      await expect(
        seeder.setArt(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(seeder, 'InvalidArtAddress');
    });
  });
});
