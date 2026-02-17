import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor } from '../../typechain';

describe('NijiDescriptor', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  const traitNames = ['special', 'choker', 'headphone', 'leftHand', 'hat', 'clothing', 'ear', 'back', 'backDecoration', 'background', 'solidBackground', 'hair'];
  const RESOLUTION = 320;
  const COMPOSITE_ORDER = [10, 9, 8, 0, 3, 7, 5, 1, 6, 11, 4, 2];

  // Sample PNG data (minimal valid PNG)
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

    // Deploy NijiArt first (with owner as descriptor initially)
    const NijiArtFactory = await ethers.getContractFactory('NijiArt');
    art = (await NijiArtFactory.deploy(owner.address, traitNames)) as NijiArt;
    await art.deployed();

    // Deploy NijiDescriptor
    const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
    descriptor = (await NijiDescriptorFactory.deploy(art.address, RESOLUTION, COMPOSITE_ORDER)) as NijiDescriptor;
    await descriptor.deployed();

    // Set descriptor as art's descriptor
    await art.setDescriptor(descriptor.address);
  });

  describe('constructor', () => {
    it('should set art correctly', async () => {
      expect(await descriptor.art()).to.equal(art.address);
    });

    it('should set resolution correctly', async () => {
      expect(await descriptor.resolution()).to.equal(RESOLUTION);
    });

    it('should set composite order correctly', async () => {
      const order = await descriptor.getCompositeOrder();
      expect(order.map(n => n.toNumber())).to.deep.equal(COMPOSITE_ORDER);
    });

    it('should set owner to deployer', async () => {
      expect(await descriptor.owner()).to.equal(owner.address);
    });

    it('should revert if art is zero address', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      await expect(
        NijiDescriptorFactory.deploy(ethers.constants.AddressZero, RESOLUTION, COMPOSITE_ORDER)
      ).to.be.revertedWith('EmptyArtAddress');
    });

    it('should revert if resolution is zero', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      await expect(
        NijiDescriptorFactory.deploy(art.address, 0, COMPOSITE_ORDER)
      ).to.be.revertedWith('InvalidResolution');
    });
  });

  describe('generateSVG', () => {
    beforeEach(async () => {
      // Add sample images to art (need owner as descriptor first)
      await art.transferDescriptor(owner.address);
      await art.addTraitImage(10, samplePng); // solidBackground
      await art.addTraitImage(9, samplePng);  // background
    });

    it('should generate valid SVG', async () => {
      // Skip traits without images
      const traitIndices = Array(12).fill(ethers.constants.MaxUint256);
      traitIndices[10] = 0; // solidBackground
      traitIndices[9] = 0;  // background

      const svg = await descriptor.generateSVG(traitIndices);

      expect(svg).to.include('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).to.include(`width="${RESOLUTION}"`);
      expect(svg).to.include(`height="${RESOLUTION}"`);
      expect(svg).to.include('</svg>');
    });

    it('should include PNG as base64 <image> tag', async () => {
      const traitIndices = Array(12).fill(ethers.constants.MaxUint256);
      traitIndices[10] = 0;

      const svg = await descriptor.generateSVG(traitIndices);

      expect(svg).to.include('<image');
      expect(svg).to.include('data:image/png;base64,');
    });
  });

  describe('tokenURI', () => {
    beforeEach(async () => {
      await art.transferDescriptor(owner.address);
      await art.addTraitImage(10, samplePng);
    });

    it('should generate valid tokenURI', async () => {
      const traitIndices = Array(12).fill(ethers.constants.MaxUint256);
      traitIndices[10] = 0;

      const uri = await descriptor.tokenURI(0, traitIndices);

      expect(uri).to.include('data:application/json;base64,');

      // Decode and check JSON
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      expect(json.name).to.equal('Niji #0');
      expect(json.description).to.include('Niji');
      expect(json.image).to.include('data:image/svg+xml;base64,');
    });

    it('should revert for empty trait indices', async () => {
      await expect(descriptor.tokenURI(0, [])).to.be.revertedWith('EmptyTraitIndices');
    });
  });

  describe('setArt', () => {
    it('should allow owner to update art', async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const newArt = await NijiArtFactory.deploy(owner.address, traitNames);
      await newArt.deployed();

      await expect(descriptor.connect(owner).setArt(newArt.address))
        .to.emit(descriptor, 'ArtUpdated')
        .withArgs(art.address, newArt.address);

      expect(await descriptor.art()).to.equal(newArt.address);
    });

    it('should revert if caller is not owner', async () => {
      await expect(
        descriptor.connect(other).setArt(other.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('setResolution', () => {
    it('should allow owner to update resolution', async () => {
      await expect(descriptor.connect(owner).setResolution(640))
        .to.emit(descriptor, 'ResolutionUpdated')
        .withArgs(320, 640);

      expect(await descriptor.resolution()).to.equal(640);
    });

    it('should revert for zero resolution', async () => {
      await expect(descriptor.setResolution(0)).to.be.revertedWith('InvalidResolution');
    });
  });

  describe('setCompositeOrder', () => {
    it('should allow owner to update composite order', async () => {
      const newOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      await expect(descriptor.connect(owner).setCompositeOrder(newOrder))
        .to.emit(descriptor, 'CompositeOrderUpdated')
        .withArgs(newOrder);

      const order = await descriptor.getCompositeOrder();
      expect(order.map(n => n.toNumber())).to.deep.equal(newOrder);
    });
  });

  describe('isConfigured', () => {
    it('should return true when properly configured', async () => {
      expect(await descriptor.isConfigured()).to.be.true;
    });
  });

  describe('SKIP_LAYER constant', () => {
    it('should equal type(uint256).max', async () => {
      const skipLayer = await descriptor.SKIP_LAYER();
      expect(skipLayer).to.equal(ethers.constants.MaxUint256);
    });
  });
});
