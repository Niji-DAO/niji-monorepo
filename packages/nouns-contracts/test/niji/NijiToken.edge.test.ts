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
} from './helpers';

describe('NijiToken (edge cases)', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let seeder: NijiSeeder;
  let token: NijiToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let other: SignerWithAddress;

  const MAX_SUPPLY = 100;

  beforeEach(async () => {
    [owner, minter, other] = await ethers.getSigners();

    art = await deployNijiArt(owner.address);
    descriptor = await deployNijiDescriptor(await art.getAddress());
    seeder = await deployNijiSeeder(await art.getAddress());
    token = await deployNijiToken(
      'Niji',
      'NIJI',
      await descriptor.getAddress(),
      await seeder.getAddress(),
      MAX_SUPPLY,
    );

    await art.setDescriptor(await descriptor.getAddress());
    await art.transferDescriptor(owner.address);
    await populateAllTraits(art, SAMPLE_PNG);
  });

  // =========================================================================
  //  Constructor — zero address errors
  // =========================================================================

  describe('constructor zero-address errors', () => {
    it('should revert with DescriptorNotSet if descriptor is zero', async () => {
      const NijiTokenFactory = await ethers.getContractFactory('NijiToken');
      await expect(
        NijiTokenFactory.deploy('Niji', 'NIJI', ethers.ZeroAddress, await seeder.getAddress(), 100),
      ).to.be.revertedWithCustomError(NijiTokenFactory, 'DescriptorNotSet');
    });

    it('should revert with SeederNotSet if seeder is zero', async () => {
      const NijiTokenFactory = await ethers.getContractFactory('NijiToken');
      await expect(
        NijiTokenFactory.deploy(
          'Niji',
          'NIJI',
          await descriptor.getAddress(),
          ethers.ZeroAddress,
          100,
        ),
      ).to.be.revertedWithCustomError(NijiTokenFactory, 'SeederNotSet');
    });
  });

  // =========================================================================
  //  mintBatch — edge cases
  // =========================================================================

  describe('mintBatch edge cases', () => {
    beforeEach(async () => {
      await token.toggleMinting();
    });

    it('should succeed with quantity = 0 (empty array returned)', async () => {
      const tokenIds = await token.mintBatch.staticCall(other.address, 0);
      expect(tokenIds.length).to.equal(0);
    });

    it('should revert when quantity exceeds remaining supply', async () => {
      // Deploy with maxSupply = 3
      const limitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        3,
      );
      await limitedToken.toggleMinting();

      // Mint 2 first
      await limitedToken.mintBatch(other.address, 2);

      // Trying to mint 2 more should revert (only 1 remaining)
      await expect(
        limitedToken.mintBatch(other.address, 2),
      ).to.be.revertedWithCustomError(limitedToken, 'MaxSupplyReached');
    });

    it('should succeed when minting exactly up to maxSupply', async () => {
      const limitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        5,
      );
      await limitedToken.toggleMinting();

      await limitedToken.mintBatch(other.address, 5);
      expect(await limitedToken.currentTokenId()).to.equal(5);
      expect(await limitedToken.remainingSupply()).to.equal(0);
    });
  });

  // =========================================================================
  //  maxSupply = 0 (unlimited)
  // =========================================================================

  describe('unlimited supply (maxSupply = 0)', () => {
    it('should allow minting without limit', async () => {
      const unlimitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        0,
      );
      await unlimitedToken.toggleMinting();

      // Mint 10 tokens
      await unlimitedToken.mintBatch(other.address, 10);
      expect(await unlimitedToken.currentTokenId()).to.equal(10);
      expect(await unlimitedToken.remainingSupply()).to.equal(ethers.MaxUint256);
    });
  });

  // =========================================================================
  //  setDescriptor / setSeeder / setMinter — zero address
  // =========================================================================

  describe('set* with zero address', () => {
    it('should revert setDescriptor with EmptyAddress', async () => {
      await expect(
        token.setDescriptor(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(token, 'EmptyAddress');
    });

    it('should revert setSeeder with EmptyAddress', async () => {
      await expect(
        token.setSeeder(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(token, 'EmptyAddress');
    });

    it('should revert setMinter with EmptyAddress', async () => {
      await expect(
        token.setMinter(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(token, 'EmptyAddress');
    });
  });

  // =========================================================================
  //  lockProvenanceHash — edge cases
  // =========================================================================

  describe('lockProvenanceHash edge cases', () => {
    it('should revert when locking twice', async () => {
      await token.lockProvenanceHash();

      await expect(token.lockProvenanceHash()).to.be.revertedWithCustomError(
        token,
        'ProvenanceHashLocked',
      );
    });

    it('should allow locking with empty provenance hash', async () => {
      // provenanceHash defaults to empty
      await token.lockProvenanceHash();
      expect(await token.isProvenanceHashLocked()).to.be.true;
      expect(await token.provenanceHash()).to.equal('');
    });
  });

  // =========================================================================
  //  getTraitIndices — full verification
  // =========================================================================

  describe('getTraitIndices full verification', () => {
    it('should return 12-element array matching seed fields', async () => {
      await token.toggleMinting();
      await token.mint(other.address);

      const seed = await token.getSeed(0);
      const indices = await token.getTraitIndices(0);

      expect(indices.length).to.equal(TRAIT_COUNT);
      expect(indices[0]).to.equal(seed.special);
      expect(indices[1]).to.equal(seed.choker);
      expect(indices[2]).to.equal(seed.headphone);
      expect(indices[3]).to.equal(seed.leftHand);
      expect(indices[4]).to.equal(seed.hat);
      expect(indices[5]).to.equal(seed.clothing);
      expect(indices[6]).to.equal(seed.ear);
      expect(indices[7]).to.equal(seed.back);
      expect(indices[8]).to.equal(seed.backDecoration);
      expect(indices[9]).to.equal(seed.background);
      expect(indices[10]).to.equal(seed.solidBackground);
      expect(indices[11]).to.equal(seed.hair);
    });
  });

  // =========================================================================
  //  Minter delegation
  // =========================================================================

  describe('minter delegation', () => {
    it('should prevent old minter from minting after setMinter', async () => {
      await token.toggleMinting();
      await token.setMinter(minter.address);

      // Old minter (owner) should fail
      await expect(
        token.mint(other.address),
      ).to.be.revertedWithCustomError(token, 'OnlyMinter');

      // New minter should succeed
      await token.connect(minter).mint(other.address);
      expect(await token.ownerOf(0)).to.equal(other.address);
    });
  });
});
