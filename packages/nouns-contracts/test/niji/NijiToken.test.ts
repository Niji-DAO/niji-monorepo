import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor, NijiSeeder, NijiToken } from '../../typechain';

describe('NijiToken', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let seeder: NijiSeeder;
  let token: NijiToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let other: SignerWithAddress;

  const traitNames = ['special', 'choker', 'headphone', 'leftHand', 'hat', 'clothing', 'ear', 'back', 'backDecoration', 'background', 'solidBackground', 'hair'];
  const RESOLUTION = 320;
  const COMPOSITE_ORDER = [10, 9, 8, 0, 3, 7, 5, 1, 6, 11, 4, 2];
  const MAX_SUPPLY = 100;

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
    [owner, minter, other] = await ethers.getSigners();

    // Deploy NijiArt
    const NijiArtFactory = await ethers.getContractFactory('NijiArt');
    art = (await NijiArtFactory.deploy(owner.address, traitNames)) as unknown as NijiArt;

    // Deploy NijiDescriptor
    const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
    descriptor = (await NijiDescriptorFactory.deploy(await art.getAddress(), RESOLUTION, COMPOSITE_ORDER)) as unknown as NijiDescriptor;

    // Deploy NijiSeeder
    const NijiSeederFactory = await ethers.getContractFactory('NijiSeeder');
    seeder = (await NijiSeederFactory.deploy(await art.getAddress())) as unknown as NijiSeeder;

    // Deploy NijiToken
    const NijiTokenFactory = await ethers.getContractFactory('NijiToken');
    token = (await NijiTokenFactory.deploy(
      'Niji',
      'NIJI',
      await descriptor.getAddress(),
      await seeder.getAddress(),
      MAX_SUPPLY
    )) as unknown as NijiToken;

    // Setup: set descriptor on art
    await art.setDescriptor(await descriptor.getAddress());

    // Add sample images for all traits
    await art.transferDescriptor(owner.address);
    for (let i = 0; i < 12; i++) {
      await art.addTraitImages(i, [samplePng, samplePng, samplePng]);
    }
  });

  describe('constructor', () => {
    it('should set name correctly', async () => {
      expect(await token.name()).to.equal('Niji');
    });

    it('should set symbol correctly', async () => {
      expect(await token.symbol()).to.equal('NIJI');
    });

    it('should set descriptor correctly', async () => {
      expect(await token.descriptor()).to.equal(await descriptor.getAddress());
    });

    it('should set seeder correctly', async () => {
      expect(await token.seeder()).to.equal(await seeder.getAddress());
    });

    it('should set maxSupply correctly', async () => {
      expect(await token.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it('should set owner as minter', async () => {
      expect(await token.minter()).to.equal(owner.address);
    });

    it('should have minting inactive by default', async () => {
      expect(await token.isMintingActive()).to.be.false;
    });
  });

  describe('mint', () => {
    beforeEach(async () => {
      await token.toggleMinting();
    });

    it('should mint token to recipient', async () => {
      await expect(token.mint(other.address))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.ZeroAddress, other.address, 0);

      expect(await token.ownerOf(0)).to.equal(other.address);
      expect(await token.currentTokenId()).to.equal(1);
    });

    it('should emit NijiMinted event', async () => {
      await expect(token.mint(other.address))
        .to.emit(token, 'NijiMinted');
    });

    it('should store seed for token', async () => {
      await token.mint(other.address);
      const seed = await token.getSeed(0);

      // Seed should have valid values
      expect(seed.special).to.be.at.least(0);
      expect(seed.hair).to.be.at.least(0);
    });

    it('should revert if minting is not active', async () => {
      await token.toggleMinting(); // Turn off

      await expect(token.mint(other.address)).to.be.revertedWithCustomError(token, 'MintingNotActive');
    });

    it('should revert if caller is not minter', async () => {
      await expect(token.connect(other).mint(other.address)).to.be.revertedWithCustomError(token, 'OnlyMinter');
    });

    it('should revert if max supply reached', async () => {
      // Deploy with max supply of 1
      const NijiTokenFactory = await ethers.getContractFactory('NijiToken');
      const limitedToken = await NijiTokenFactory.deploy(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        1
      );
      await limitedToken.toggleMinting();

      await limitedToken.mint(other.address);
      await expect(limitedToken.mint(other.address)).to.be.revertedWithCustomError(limitedToken, 'MaxSupplyReached');
    });
  });

  describe('mintBatch', () => {
    beforeEach(async () => {
      await token.toggleMinting();
    });

    it('should mint multiple tokens', async () => {
      const tokenIds = await token.mintBatch.staticCall(other.address, 3);

      expect(tokenIds.length).to.equal(3);
      expect(tokenIds[0]).to.equal(0);
      expect(tokenIds[1]).to.equal(1);
      expect(tokenIds[2]).to.equal(2);

      await token.mintBatch(other.address, 3);
      expect(await token.balanceOf(other.address)).to.equal(3);
    });
  });

  describe('tokenURI', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token.mint(other.address);
    });

    it('should return valid tokenURI', async () => {
      const uri = await token.tokenURI(0);

      expect(uri).to.include('data:application/json;base64,');

      // Decode and check JSON
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      expect(json.name).to.equal('Niji #0');
      expect(json.image).to.include('data:image/svg+xml;base64,');
    });

    it('should revert for non-existent token', async () => {
      await expect(token.tokenURI(999)).to.be.revertedWithCustomError(token, 'TokenDoesNotExist');
    });
  });

  describe('getSeed', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token.mint(other.address);
    });

    it('should return seed for token', async () => {
      const seed = await token.getSeed(0);

      expect(seed.special).to.exist;
      expect(seed.hair).to.exist;
    });

    it('should revert for non-existent token', async () => {
      await expect(token.getSeed(999)).to.be.revertedWithCustomError(token, 'TokenDoesNotExist');
    });
  });

  describe('getTraitIndices', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token.mint(other.address);
    });

    it('should return trait indices array', async () => {
      const indices = await token.getTraitIndices(0);

      expect(indices.length).to.equal(12);
    });
  });

  describe('setDescriptor', () => {
    it('should allow owner to update descriptor', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const newDescriptor = await NijiDescriptorFactory.deploy(await art.getAddress(), RESOLUTION, COMPOSITE_ORDER);
      const descriptorAddr = await descriptor.getAddress();
      const newDescriptorAddr = await newDescriptor.getAddress();

      await expect(token.setDescriptor(newDescriptorAddr))
        .to.emit(token, 'DescriptorUpdated')
        .withArgs(descriptorAddr, newDescriptorAddr);

      expect(await token.descriptor()).to.equal(newDescriptorAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(
        token.connect(other).setDescriptor(other.address)
      ).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });

  describe('setSeeder', () => {
    it('should allow owner to update seeder', async () => {
      const NijiSeederFactory = await ethers.getContractFactory('NijiSeeder');
      const newSeeder = await NijiSeederFactory.deploy(await art.getAddress());
      const seederAddr = await seeder.getAddress();
      const newSeederAddr = await newSeeder.getAddress();

      await expect(token.setSeeder(newSeederAddr))
        .to.emit(token, 'SeederUpdated')
        .withArgs(seederAddr, newSeederAddr);

      expect(await token.seeder()).to.equal(newSeederAddr);
    });
  });

  describe('setMinter', () => {
    it('should allow owner to update minter', async () => {
      await expect(token.setMinter(minter.address))
        .to.emit(token, 'MinterUpdated')
        .withArgs(owner.address, minter.address);

      expect(await token.minter()).to.equal(minter.address);
    });

    it('should allow new minter to mint', async () => {
      await token.setMinter(minter.address);
      await token.toggleMinting();

      await token.connect(minter).mint(other.address);
      expect(await token.ownerOf(0)).to.equal(other.address);
    });
  });

  describe('toggleMinting', () => {
    it('should toggle minting state', async () => {
      expect(await token.isMintingActive()).to.be.false;

      await token.toggleMinting();
      expect(await token.isMintingActive()).to.be.true;

      await token.toggleMinting();
      expect(await token.isMintingActive()).to.be.false;
    });

    it('should emit MintingToggled event', async () => {
      await expect(token.toggleMinting())
        .to.emit(token, 'MintingToggled')
        .withArgs(true);
    });
  });

  describe('setMintingActive', () => {
    it('should set minting state directly', async () => {
      await token.setMintingActive(true);
      expect(await token.isMintingActive()).to.be.true;

      await token.setMintingActive(false);
      expect(await token.isMintingActive()).to.be.false;
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token.mint(other.address);
    });

    it('should return true for existing token', async () => {
      expect(await token.exists(0)).to.be.true;
    });

    it('should return false for non-existing token', async () => {
      expect(await token.exists(999)).to.be.false;
    });
  });

  describe('remainingSupply', () => {
    it('should return remaining supply', async () => {
      expect(await token.remainingSupply()).to.equal(MAX_SUPPLY);

      await token.toggleMinting();
      await token.mint(other.address);

      expect(await token.remainingSupply()).to.equal(MAX_SUPPLY - 1);
    });

    it('should return max uint for unlimited supply', async () => {
      const NijiTokenFactory = await ethers.getContractFactory('NijiToken');
      const unlimitedToken = await NijiTokenFactory.deploy(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        0 // unlimited
      );

      expect(await unlimitedToken.remainingSupply()).to.equal(ethers.MaxUint256);
    });
  });
});
