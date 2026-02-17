import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { NijiArt } from '../../typechain';

describe('NijiArt', () => {
  let art: NijiArt;
  let owner: SignerWithAddress;
  let descriptor: SignerWithAddress;
  let other: SignerWithAddress;

  const traitNames = ['special', 'choker', 'headphone', 'leftHand', 'hat', 'clothing', 'ear', 'back', 'backDecoration', 'background', 'solidBackground', 'hair'];

  // Sample PNG data (minimal valid PNG: 1x1 transparent pixel)
  const samplePng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);

  beforeEach(async () => {
    [owner, descriptor, other] = await ethers.getSigners();

    const NijiArtFactory = await ethers.getContractFactory('NijiArt');
    art = (await NijiArtFactory.deploy(descriptor.address, traitNames)) as NijiArt;
    await art.deployed();
  });

  describe('constructor', () => {
    it('should set descriptor correctly', async () => {
      expect(await art.descriptor()).to.equal(descriptor.address);
    });

    it('should set trait names correctly', async () => {
      expect(await art.traitCount()).to.equal(traitNames.length);
      for (let i = 0; i < traitNames.length; i++) {
        expect(await art.traitNames(i)).to.equal(traitNames[i]);
      }
    });

    it('should set owner to deployer', async () => {
      expect(await art.owner()).to.equal(owner.address);
    });

    it('should revert if descriptor is zero address', async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      await expect(
        NijiArtFactory.deploy(ethers.constants.AddressZero, traitNames)
      ).to.be.revertedWith('EmptyDescriptorAddress');
    });
  });

  describe('addTraitImage', () => {
    it('should allow descriptor to add image and emit event', async () => {
      await expect(art.connect(descriptor).addTraitImage(0, samplePng))
        .to.emit(art, 'TraitImageAdded');

      expect(await art.getTraitImageCount(0)).to.equal(1);

      // Verify pointer was stored
      const pointer = await art.getTraitPointer(0, 0);
      expect(pointer).to.not.equal(ethers.constants.AddressZero);
    });

    it('should revert if caller is not descriptor', async () => {
      await expect(
        art.connect(other).addTraitImage(0, samplePng)
      ).to.be.revertedWith('SenderIsNotDescriptor');
    });

    it('should revert for invalid trait ID', async () => {
      await expect(
        art.connect(descriptor).addTraitImage(99, samplePng)
      ).to.be.revertedWith('InvalidTraitId');
    });

    it('should revert for empty PNG data', async () => {
      await expect(
        art.connect(descriptor).addTraitImage(0, [])
      ).to.be.revertedWith('EmptyPngData');
    });
  });

  describe('addTraitImages', () => {
    it('should allow descriptor to add multiple images', async () => {
      const images = [samplePng, samplePng, samplePng];
      await expect(art.connect(descriptor).addTraitImages(0, images))
        .to.emit(art, 'TraitImagesAdded')
        .withArgs(0, 0, 3);

      expect(await art.getTraitImageCount(0)).to.equal(3);
    });
  });

  describe('getTraitImage', () => {
    beforeEach(async () => {
      await art.connect(descriptor).addTraitImage(0, samplePng);
    });

    it('should return stored PNG data', async () => {
      const data = await art.getTraitImage(0, 0);
      expect(data).to.equal('0x' + samplePng.toString('hex'));
    });

    it('should revert for invalid trait ID', async () => {
      await expect(art.getTraitImage(99, 0)).to.be.revertedWith('InvalidTraitId');
    });

    it('should revert for invalid image index', async () => {
      await expect(art.getTraitImage(0, 99)).to.be.revertedWith('InvalidImageIndex');
    });
  });

  describe('setDescriptor', () => {
    it('should allow descriptor to update descriptor', async () => {
      await expect(art.connect(descriptor).setDescriptor(other.address))
        .to.emit(art, 'DescriptorUpdated')
        .withArgs(descriptor.address, other.address);

      expect(await art.descriptor()).to.equal(other.address);
    });

    it('should revert if caller is not descriptor', async () => {
      await expect(
        art.connect(other).setDescriptor(other.address)
      ).to.be.revertedWith('SenderIsNotDescriptor');
    });
  });

  describe('transferDescriptor', () => {
    it('should allow owner to transfer descriptor', async () => {
      await expect(art.connect(owner).transferDescriptor(other.address))
        .to.emit(art, 'DescriptorUpdated')
        .withArgs(descriptor.address, other.address);

      expect(await art.descriptor()).to.equal(other.address);
    });

    it('should revert if caller is not owner', async () => {
      await expect(
        art.connect(other).transferDescriptor(other.address)
      ).to.be.revertedWith('OwnableUnauthorizedAccount');
    });
  });

  describe('getTraitNames', () => {
    it('should return all trait names', async () => {
      const names = await art.getTraitNames();
      expect(names).to.deep.equal(traitNames);
    });
  });

  describe('getTraitName', () => {
    it('should return specific trait name', async () => {
      expect(await art.getTraitName(0)).to.equal('special');
      expect(await art.getTraitName(11)).to.equal('hair');
    });

    it('should revert for invalid trait ID', async () => {
      await expect(art.getTraitName(99)).to.be.revertedWith('InvalidTraitId');
    });
  });
});
