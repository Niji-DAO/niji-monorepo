import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt } from '../../typechain';
import { TRAIT_NAMES, SAMPLE_PNG, deployNijiArt, shouldBehaveLikeOwnable2Step } from './helpers';

describe('NijiArt', () => {
  let art: NijiArt;
  let owner: SignerWithAddress;
  let descriptor: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, descriptor, other] = await ethers.getSigners();
    art = await deployNijiArt(descriptor.address);
  });

  describe('constructor', () => {
    it('should set descriptor correctly', async () => {
      expect(await art.descriptor()).to.equal(descriptor.address);
    });

    it('should set trait names correctly', async () => {
      expect(await art.traitCount()).to.equal(TRAIT_NAMES.length);
      for (let i = 0; i < TRAIT_NAMES.length; i++) {
        expect(await art.traitNames(i)).to.equal(TRAIT_NAMES[i]);
      }
    });

    it('should set owner to deployer', async () => {
      expect(await art.owner()).to.equal(owner.address);
    });

    it('should revert if descriptor is zero address', async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      await expect(
        NijiArtFactory.deploy(ethers.ZeroAddress, TRAIT_NAMES),
      ).to.be.revertedWithCustomError(NijiArtFactory, 'EmptyDescriptorAddress');
    });
  });

  describe('addTraitImage', () => {
    it('should allow descriptor to add image and emit event', async () => {
      await expect(art.connect(descriptor).addTraitImage(0, SAMPLE_PNG)).to.emit(
        art,
        'TraitImageAdded',
      );

      expect(await art.getTraitImageCount(0)).to.equal(1);

      // Verify pointer was stored
      const pointer = await art.getTraitPointer(0, 0);
      expect(pointer).to.not.equal(ethers.ZeroAddress);
    });

    it('should revert if caller is not descriptor', async () => {
      await expect(art.connect(other).addTraitImage(0, SAMPLE_PNG)).to.be.revertedWithCustomError(
        art,
        'SenderIsNotDescriptor',
      );
    });

    it('should revert for invalid trait ID', async () => {
      await expect(
        art.connect(descriptor).addTraitImage(99, SAMPLE_PNG),
      ).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });

    it('should revert for empty PNG data', async () => {
      await expect(art.connect(descriptor).addTraitImage(0, '0x')).to.be.revertedWithCustomError(
        art,
        'EmptyPngData',
      );
    });
  });

  describe('addTraitImages', () => {
    it('should allow descriptor to add multiple images', async () => {
      const images = [SAMPLE_PNG, SAMPLE_PNG, SAMPLE_PNG];
      await expect(art.connect(descriptor).addTraitImages(0, images))
        .to.emit(art, 'TraitImagesAdded')
        .withArgs(0, 0, 3);

      expect(await art.getTraitImageCount(0)).to.equal(3);
    });
  });

  describe('getTraitImage', () => {
    beforeEach(async () => {
      await art.connect(descriptor).addTraitImage(0, SAMPLE_PNG);
    });

    it('should return stored PNG data', async () => {
      const data = await art.getTraitImage(0, 0);
      expect(data).to.equal('0x' + SAMPLE_PNG.toString('hex'));
    });

    it('should revert for invalid trait ID', async () => {
      await expect(art.getTraitImage(99, 0)).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });

    it('should revert for invalid image index', async () => {
      await expect(art.getTraitImage(0, 99)).to.be.revertedWithCustomError(
        art,
        'InvalidImageIndex',
      );
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
      await expect(art.connect(other).setDescriptor(other.address)).to.be.revertedWithCustomError(
        art,
        'SenderIsNotDescriptor',
      );
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
        art.connect(other).transferDescriptor(other.address),
      ).to.be.revertedWithCustomError(art, 'OwnableUnauthorizedAccount');
    });
  });

  shouldBehaveLikeOwnable2Step(
    () => art,
    () => owner,
    () => other,
    () => descriptor,
  );

  describe('getTraitNames', () => {
    it('should return all trait names', async () => {
      const names = await art.getTraitNames();
      expect(names).to.deep.equal(TRAIT_NAMES);
    });
  });

  describe('getTraitName', () => {
    it('should return specific trait name', async () => {
      expect(await art.getTraitName(0)).to.equal('special');
      expect(await art.getTraitName(11)).to.equal('hair');
    });

    it('should revert for invalid trait ID', async () => {
      await expect(art.getTraitName(99)).to.be.revertedWithCustomError(art, 'InvalidTraitId');
    });
  });
});
