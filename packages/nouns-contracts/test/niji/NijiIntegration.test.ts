import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor, NijiSeeder, NijiToken } from '../../typechain';
import {
  TRAIT_COUNT,
  SAMPLE_PNG,
  deployNijiArt,
  deployNijiDescriptor,
  deployNijiSeeder,
  deployNijiToken,
  populateAllTraits,
  decodeTokenURI,
} from './helpers';

/** Hash a seed struct into a single keccak256 digest for comparison. */
function hashSeed(seed: {
  special: bigint;
  choker: bigint;
  headphone: bigint;
  leftHand: bigint;
  hat: bigint;
  clothing: bigint;
  ear: bigint;
  back: bigint;
  backDecoration: bigint;
  background: bigint;
  solidBackground: bigint;
  hair: bigint;
}): string {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(Array(TRAIT_COUNT).fill('uint48'), [
      seed.special,
      seed.choker,
      seed.headphone,
      seed.leftHand,
      seed.hat,
      seed.clothing,
      seed.ear,
      seed.back,
      seed.backDecoration,
      seed.background,
      seed.solidBackground,
      seed.hair,
    ]),
  );
}

describe('NijiIntegration', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let seeder: NijiSeeder;
  let token: NijiToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let newOwner: SignerWithAddress;

  beforeEach(async () => {
    [owner, minter, newOwner] = await ethers.getSigners();

    // Full deployment flow
    art = await deployNijiArt(owner.address);
    descriptor = await deployNijiDescriptor(await art.getAddress());
    seeder = await deployNijiSeeder(await art.getAddress());
    token = await deployNijiToken(
      'Niji',
      'NIJI',
      await descriptor.getAddress(),
      await seeder.getAddress(),
      100,
    );

    // Wire up: set descriptor on art, then transfer descriptor to owner
    await art.setDescriptor(await descriptor.getAddress());
    await art.transferDescriptor(owner.address);

    // Populate traits
    await populateAllTraits(art, SAMPLE_PNG);

    // Activate minting
    await token.toggleMinting();
  });

  // =========================================================================
  //  Full flow: deploy → trait registration → mint → tokenURI → attributes
  // =========================================================================

  describe('full flow: mint → tokenURI → attributes', () => {
    it('should produce valid tokenURI with attributes after mint', async () => {
      await token.mint(minter.address);

      const uri = await token.tokenURI(0);
      const json = decodeTokenURI(uri);

      expect(json.name).to.equal('Niji #0');
      expect(json.image).to.include('data:image/svg+xml;base64,');
      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.be.greaterThan(0);

      // Verify each attribute has valid structure
      for (const attr of json.attributes) {
        expect(attr.trait_type).to.be.a('string');
        expect(attr.value).to.be.a('string');
      }
    });
  });

  // =========================================================================
  //  Descriptor swap: mint → change descriptor → tokenURI uses new descriptor
  // =========================================================================

  describe('descriptor swap after mint', () => {
    it('should use new descriptor for tokenURI', async () => {
      await token.mint(minter.address);

      // Deploy new descriptor with different resolution
      const newArt = await deployNijiArt(owner.address);
      await populateAllTraits(newArt, SAMPLE_PNG);

      const newDescriptor = await deployNijiDescriptor(
        await newArt.getAddress(),
        999, // different resolution
      );

      await token.setDescriptor(await newDescriptor.getAddress());

      const uri = await token.tokenURI(0);
      const json = decodeTokenURI(uri);

      // SVG should use the new resolution
      const svgBase64 = json.image.replace('data:image/svg+xml;base64,', '');
      const svg = Buffer.from(svgBase64, 'base64').toString();
      expect(svg).to.include('width="999"');
    });
  });

  // =========================================================================
  //  Seeder swap: seed is immutable after mint
  // =========================================================================

  describe('seeder swap: existing seeds unchanged', () => {
    it('should preserve seed of already-minted tokens after seeder change', async () => {
      await token.mint(minter.address);
      const seedBefore = await token.getSeed(0);

      // Swap seeder
      const newSeeder = await deployNijiSeeder(await art.getAddress());
      await token.setSeeder(await newSeeder.getAddress());

      // Existing seed should be unchanged (stored in mapping)
      const seedAfter = await token.getSeed(0);
      expect(seedAfter.special).to.equal(seedBefore.special);
      expect(seedAfter.hair).to.equal(seedBefore.hair);
    });
  });

  // =========================================================================
  //  Minter delegation flow
  // =========================================================================

  describe('minter delegation flow', () => {
    it('should allow new minter and reject old minter', async () => {
      await token.setMinter(minter.address);

      // Old minter (owner) should fail
      await expect(token.mint(newOwner.address)).to.be.revertedWithCustomError(token, 'OnlyMinter');

      // New minter should succeed
      await token.connect(minter).mint(newOwner.address);
      expect(await token.ownerOf(0)).to.equal(newOwner.address);
    });
  });

  // =========================================================================
  //  Batch mint: 10 tokens with all different seeds
  // =========================================================================

  describe('batch mint: unique seeds', () => {
    it('should generate 10 tokens with all-different seeds', async () => {
      await token.mintBatch(minter.address, 10);

      const seedHashes = new Set<string>();
      for (let i = 0; i < 10; i++) {
        seedHashes.add(hashSeed(await token.getSeed(i)));
      }

      // With 3 images per trait and pseudo-random seeds, all 10 should be different
      // (collision probability is negligibly low)
      expect(seedHashes.size).to.equal(10);
    });
  });

  // =========================================================================
  //  Supply limit flow
  // =========================================================================

  describe('supply limit flow', () => {
    it('should allow minting up to maxSupply then revert', async () => {
      const limitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        5,
      );
      await limitedToken.toggleMinting();

      // Mint 5
      await limitedToken.mintBatch(minter.address, 5);
      expect(await limitedToken.remainingSupply()).to.equal(0);

      // 6th should revert
      await expect(limitedToken.mint(minter.address)).to.be.revertedWithCustomError(
        limitedToken,
        'MaxSupplyReached',
      );
    });
  });

  // =========================================================================
  //  Ownership transfer flow
  // =========================================================================

  describe('ownership transfer flow', () => {
    it('should allow new owner to perform admin actions after transfer', async () => {
      // Transfer ownership
      await token.transferOwnership(newOwner.address);
      await token.connect(newOwner).acceptOwnership();

      expect(await token.owner()).to.equal(newOwner.address);

      // New owner can set minter
      await token.connect(newOwner).setMinter(minter.address);
      expect(await token.minter()).to.equal(minter.address);

      // Old owner cannot
      await expect(token.setMinter(owner.address)).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  // =========================================================================
  //  Art descriptor change: controls image access
  // =========================================================================

  describe('art descriptor change controls image access', () => {
    it('should allow new descriptor to add images after descriptor change on art', async () => {
      // Currently owner is descriptor on art
      // Set art's descriptor to a new address
      await art.transferDescriptor(minter.address);

      // Owner can no longer add images
      await expect(art.addTraitImage(0, SAMPLE_PNG)).to.be.revertedWithCustomError(
        art,
        'SenderIsNotDescriptor',
      );

      // New descriptor (minter) can add images
      const countBefore = await art.getTraitImageCount(0);
      await art.connect(minter).addTraitImage(0, SAMPLE_PNG);
      expect(await art.getTraitImageCount(0)).to.equal(countBefore + 1n);
    });
  });
});
