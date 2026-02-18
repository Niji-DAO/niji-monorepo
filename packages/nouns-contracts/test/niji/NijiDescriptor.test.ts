import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
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
    art = (await NijiArtFactory.deploy(owner.address, traitNames)) as unknown as NijiArt;

    // Deploy NijiDescriptor
    const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
    descriptor = (await NijiDescriptorFactory.deploy(await art.getAddress(), RESOLUTION, COMPOSITE_ORDER)) as unknown as NijiDescriptor;

    // Set descriptor as art's descriptor
    await art.setDescriptor(await descriptor.getAddress());
  });

  describe('constructor', () => {
    it('should set art correctly', async () => {
      expect(await descriptor.art()).to.equal(await art.getAddress());
    });

    it('should set resolution correctly', async () => {
      expect(await descriptor.resolution()).to.equal(RESOLUTION);
    });

    it('should set composite order correctly', async () => {
      const order = await descriptor.getCompositeOrder();
      expect(order.map(n => Number(n))).to.deep.equal(COMPOSITE_ORDER);
    });

    it('should set owner to deployer', async () => {
      expect(await descriptor.owner()).to.equal(owner.address);
    });

    it('should revert if art is zero address', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      await expect(
        NijiDescriptorFactory.deploy(ethers.ZeroAddress, RESOLUTION, COMPOSITE_ORDER)
      ).to.be.revertedWithCustomError(NijiDescriptorFactory, 'EmptyArtAddress');
    });

    it('should revert if resolution is zero', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      await expect(
        NijiDescriptorFactory.deploy(await art.getAddress(), 0, COMPOSITE_ORDER)
      ).to.be.revertedWithCustomError(NijiDescriptorFactory, 'InvalidResolution');
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
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[10] = 0; // solidBackground
      traitIndices[9] = 0;  // background

      const svg = await descriptor.generateSVG(traitIndices);

      expect(svg).to.include('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).to.include(`width="${RESOLUTION}"`);
      expect(svg).to.include(`height="${RESOLUTION}"`);
      expect(svg).to.include('</svg>');
    });

    it('should include PNG as base64 <image> tag', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
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
      const traitIndices = Array(12).fill(ethers.MaxUint256);
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
      await expect(descriptor.tokenURI(0, [])).to.be.revertedWithCustomError(descriptor, 'EmptyTraitIndices');
    });
  });

  describe('tokenURI attributes', () => {
    beforeEach(async () => {
      await art.transferDescriptor(owner.address);
      for (let i = 0; i < 12; i++) {
        await art.addTraitImages(i, [samplePng, samplePng, samplePng]);
      }
    });

    it('should include attributes array in JSON', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[0] = 0; // special
      traitIndices[11] = 2; // hair

      const uri = await descriptor.tokenURI(0, traitIndices);
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(2);
    });

    it('should have trait_type matching art.getTraitName', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[0] = 0; // special
      traitIndices[11] = 2; // hair

      const uri = await descriptor.tokenURI(0, traitIndices);
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      const specialAttr = json.attributes.find((a: any) => a.trait_type === 'special');
      const hairAttr = json.attributes.find((a: any) => a.trait_type === 'hair');

      expect(specialAttr).to.exist;
      expect(specialAttr.value).to.equal('0');
      expect(hairAttr).to.exist;
      expect(hairAttr.value).to.equal('2');
    });

    it('should exclude SKIP_LAYER traits from attributes', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[0] = 1; // only special is set

      const uri = await descriptor.tokenURI(0, traitIndices);
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      expect(json.attributes.length).to.equal(1);
      expect(json.attributes[0].trait_type).to.equal('special');
      expect(json.attributes[0].value).to.equal('1');
    });

    it('should return empty array when all traits are SKIP_LAYER', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);

      const uri = await descriptor.tokenURI(0, traitIndices);
      const jsonB64 = uri.replace('data:application/json;base64,', '');
      const json = JSON.parse(Buffer.from(jsonB64, 'base64').toString());

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(0);
    });
  });

  describe('setArt', () => {
    it('should allow owner to update art', async () => {
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const newArt = await NijiArtFactory.deploy(owner.address, traitNames);
      const artAddr = await art.getAddress();
      const newArtAddr = await newArt.getAddress();

      await expect(descriptor.connect(owner).setArt(newArtAddr))
        .to.emit(descriptor, 'ArtUpdated')
        .withArgs(artAddr, newArtAddr);

      expect(await descriptor.art()).to.equal(newArtAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(
        descriptor.connect(other).setArt(other.address)
      ).to.be.revertedWithCustomError(descriptor, 'OwnableUnauthorizedAccount');
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
      await expect(descriptor.setResolution(0)).to.be.revertedWithCustomError(descriptor, 'InvalidResolution');
    });
  });

  describe('setCompositeOrder', () => {
    it('should allow owner to update composite order', async () => {
      const newOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      await expect(descriptor.connect(owner).setCompositeOrder(newOrder))
        .to.emit(descriptor, 'CompositeOrderUpdated')
        .withArgs(newOrder);

      const order = await descriptor.getCompositeOrder();
      expect(order.map(n => Number(n))).to.deep.equal(newOrder);
    });
  });

  describe('Ownable2Step', () => {
    it('transferOwnership should not change owner immediately', async () => {
      await descriptor.transferOwnership(other.address);
      expect(await descriptor.owner()).to.equal(owner.address);
    });

    it('transferOwnership should set pendingOwner', async () => {
      await descriptor.transferOwnership(other.address);
      expect(await descriptor.pendingOwner()).to.equal(other.address);
    });

    it('transferOwnership should emit OwnershipTransferStarted', async () => {
      await expect(descriptor.transferOwnership(other.address))
        .to.emit(descriptor, 'OwnershipTransferStarted')
        .withArgs(owner.address, other.address);
    });

    it('acceptOwnership should transfer ownership to pendingOwner', async () => {
      await descriptor.transferOwnership(other.address);
      await descriptor.connect(other).acceptOwnership();
      expect(await descriptor.owner()).to.equal(other.address);
    });

    it('acceptOwnership should revert if caller is not pendingOwner', async () => {
      await descriptor.transferOwnership(other.address);
      // owner is not the pendingOwner, so this should revert
      await expect(
        descriptor.acceptOwnership()
      ).to.be.revertedWithCustomError(descriptor, 'OwnableUnauthorizedAccount');
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
      expect(skipLayer).to.equal(ethers.MaxUint256);
    });
  });

  // =========================================================================
  //  JSON Escape Tests (#33)
  // =========================================================================

  /** Helper: decode data-URI → parsed JSON */
  function decodeTokenURI(uri: string): any {
    const jsonB64 = uri.replace('data:application/json;base64,', '');
    return JSON.parse(Buffer.from(jsonB64, 'base64').toString());
  }

  describe('JSON escape – tokenURIWithMetadata', () => {
    beforeEach(async () => {
      await art.transferDescriptor(owner.address);
      await art.addTraitImage(10, samplePng);
    });

    const traitIndices = () => {
      const t = Array(12).fill(ethers.MaxUint256);
      t[10] = 0;
      return t;
    };

    it('should escape double quotes in name and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'My "Cool" Art', 'A description'
      );
      // JSON.parse succeeds = escaping is correct (would throw on unescaped ")
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('My "Cool" Art #0');
      expect(json.description).to.equal('A description');
    });

    it('should escape backslash in name and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'path\\to\\art', 'A description'
      );
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('path\\to\\art #0');
    });

    it('should escape newline in description and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'Art', 'Line1\nLine2'
      );
      const json = decodeTokenURI(uri);
      // JSON.parse converts \n back to actual newline
      expect(json.description).to.equal('Line1\nLine2');
    });

    it('should escape control characters in description and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'Art', 'before\x01after'
      );
      const json = decodeTokenURI(uri);
      // JSON.parse converts \u0001 back to actual control char
      expect(json.description).to.equal('before\x01after');
    });

    it('should handle mixed special characters', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'He said "hi"\\wow', 'tab\there\nnewline'
      );
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('He said "hi"\\wow #0');
      expect(json.description).to.equal('tab\there\nnewline');
    });

    it('should not alter safe strings', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0, traitIndices(), 'SafeName', 'Safe description with spaces and 123'
      );
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('SafeName #0');
      expect(json.description).to.equal('Safe description with spaces and 123');
    });
  });

  describe('JSON escape – attributes with special trait names', () => {
    it('should escape double quote in trait name', async () => {
      const [signer] = await ethers.getSigners();

      // Deploy new art with a trait name containing a double quote
      const specialTraitNames = ['my"trait'];
      const NijiArtFactory = await ethers.getContractFactory('NijiArt');
      const specialArt = (await NijiArtFactory.deploy(signer.address, specialTraitNames)) as unknown as NijiArt;

      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const specialDescriptor = (await NijiDescriptorFactory.deploy(
        await specialArt.getAddress(), RESOLUTION, [0]
      )) as unknown as NijiDescriptor;

      await specialArt.setDescriptor(await specialDescriptor.getAddress());
      await specialArt.transferDescriptor(signer.address);
      await specialArt.addTraitImage(0, samplePng);

      const uri = await specialDescriptor.tokenURI(0, [0]);
      const json = decodeTokenURI(uri);

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(1);
      expect(json.attributes[0].trait_type).to.equal('my"trait');
    });
  });
});
