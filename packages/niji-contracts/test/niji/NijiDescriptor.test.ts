import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor } from '../../typechain';
import {
  TRAIT_NAMES,
  SAMPLE_PNG,
  RESOLUTION,
  COMPOSITE_ORDER,
  deployNijiArt,
  deployNijiDescriptor,
  populateAllTraits,
  decodeTokenURI,
  shouldBehaveLikeOwnable2Step,
} from './helpers';

describe('NijiDescriptor', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();

    // Deploy NijiArt first (with owner as descriptor initially)
    art = await deployNijiArt(owner.address);

    // Deploy NijiDescriptor
    descriptor = await deployNijiDescriptor(await art.getAddress());

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
        NijiDescriptorFactory.deploy(ethers.ZeroAddress, RESOLUTION, COMPOSITE_ORDER),
      ).to.be.revertedWithCustomError(NijiDescriptorFactory, 'EmptyArtAddress');
    });

    it('should revert if resolution is zero', async () => {
      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      await expect(
        NijiDescriptorFactory.deploy(await art.getAddress(), 0, COMPOSITE_ORDER),
      ).to.be.revertedWithCustomError(NijiDescriptorFactory, 'InvalidResolution');
    });
  });

  describe('generateSVG', () => {
    beforeEach(async () => {
      // Add sample images to art (need owner as descriptor first)
      await art.transferDescriptor(owner.address);
      await art.addTraitImage(10, SAMPLE_PNG); // solidBackground
      await art.addTraitImage(9, SAMPLE_PNG); // background
    });

    it('should generate valid SVG', async () => {
      // Skip traits without images
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[10] = 0; // solidBackground
      traitIndices[9] = 0; // background

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
      await art.addTraitImage(10, SAMPLE_PNG);
    });

    it('should generate valid tokenURI', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[10] = 0;

      const uri = await descriptor.tokenURI(0, traitIndices);

      expect(uri).to.include('data:application/json;base64,');

      // Decode and check JSON
      const json = decodeTokenURI(uri);

      expect(json.name).to.equal('Niji #0');
      expect(json.description).to.include('Niji');
      expect(json.image).to.include('data:image/svg+xml;base64,');
    });

    it('should revert for empty trait indices', async () => {
      await expect(descriptor.tokenURI(0, [])).to.be.revertedWithCustomError(
        descriptor,
        'EmptyTraitIndices',
      );
    });
  });

  describe('tokenURI attributes', () => {
    beforeEach(async () => {
      await art.transferDescriptor(owner.address);
      await populateAllTraits(art, SAMPLE_PNG);
    });

    it('should include attributes array in JSON', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[0] = 0; // special
      traitIndices[11] = 2; // hair

      const uri = await descriptor.tokenURI(0, traitIndices);
      const json = decodeTokenURI(uri);

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(2);
    });

    it('should have trait_type matching art.getTraitName', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);
      traitIndices[0] = 0; // special
      traitIndices[11] = 2; // hair

      const uri = await descriptor.tokenURI(0, traitIndices);
      const json = decodeTokenURI(uri);

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
      const json = decodeTokenURI(uri);

      expect(json.attributes.length).to.equal(1);
      expect(json.attributes[0].trait_type).to.equal('special');
      expect(json.attributes[0].value).to.equal('1');
    });

    it('should return empty array when all traits are SKIP_LAYER', async () => {
      const traitIndices = Array(12).fill(ethers.MaxUint256);

      const uri = await descriptor.tokenURI(0, traitIndices);
      const json = decodeTokenURI(uri);

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(0);
    });
  });

  describe('setArt', () => {
    it('should allow owner to update art', async () => {
      const newArt = await deployNijiArt(owner.address);
      const artAddr = await art.getAddress();
      const newArtAddr = await newArt.getAddress();

      await expect(descriptor.connect(owner).setArt(newArtAddr))
        .to.emit(descriptor, 'ArtUpdated')
        .withArgs(artAddr, newArtAddr);

      expect(await descriptor.art()).to.equal(newArtAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(descriptor.connect(other).setArt(other.address)).to.be.revertedWithCustomError(
        descriptor,
        'OwnableUnauthorizedAccount',
      );
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
      await expect(descriptor.setResolution(0)).to.be.revertedWithCustomError(
        descriptor,
        'InvalidResolution',
      );
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

  shouldBehaveLikeOwnable2Step(
    () => descriptor,
    () => owner,
    () => other,
    () => owner,
  );

  describe('renounceOwnership disabled (non-owner)', () => {
    it('should revert with OwnableUnauthorizedAccount when called by non-owner', async () => {
      await expect(descriptor.connect(other).renounceOwnership()).to.be.revertedWithCustomError(
        descriptor,
        'OwnableUnauthorizedAccount',
      );
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

  describe('JSON escape – tokenURIWithMetadata', () => {
    beforeEach(async () => {
      await art.transferDescriptor(owner.address);
      await art.addTraitImage(10, SAMPLE_PNG);
    });

    const traitIndices = () => {
      const t = Array(12).fill(ethers.MaxUint256);
      t[10] = 0;
      return t;
    };

    it('should escape double quotes in name and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0,
        traitIndices(),
        'My "Cool" Art',
        'A description',
      );
      // JSON.parse succeeds = escaping is correct (would throw on unescaped ")
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('My "Cool" Art #0');
      expect(json.description).to.equal('A description');
    });

    it('should escape backslash in name and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0,
        traitIndices(),
        'path\\to\\art',
        'A description',
      );
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('path\\to\\art #0');
    });

    it('should escape newline in description and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(0, traitIndices(), 'Art', 'Line1\nLine2');
      const json = decodeTokenURI(uri);
      // JSON.parse converts \n back to actual newline
      expect(json.description).to.equal('Line1\nLine2');
    });

    it('should escape control characters in description and JSON.parse succeeds', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0,
        traitIndices(),
        'Art',
        'before\x01after',
      );
      const json = decodeTokenURI(uri);
      // JSON.parse converts \u0001 back to actual control char
      expect(json.description).to.equal('before\x01after');
    });

    it('should handle mixed special characters', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0,
        traitIndices(),
        'He said "hi"\\wow',
        'tab\there\nnewline',
      );
      const json = decodeTokenURI(uri);
      expect(json.name).to.equal('He said "hi"\\wow #0');
      expect(json.description).to.equal('tab\there\nnewline');
    });

    it('should not alter safe strings', async () => {
      const uri = await descriptor.tokenURIWithMetadata(
        0,
        traitIndices(),
        'SafeName',
        'Safe description with spaces and 123',
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
      const specialArt = await deployNijiArt(signer.address, specialTraitNames);

      const NijiDescriptorFactory = await ethers.getContractFactory('NijiDescriptor');
      const specialDescriptor = (await NijiDescriptorFactory.deploy(
        await specialArt.getAddress(),
        RESOLUTION,
        [0],
      )) as unknown as NijiDescriptor;

      await specialArt.setDescriptor(await specialDescriptor.getAddress());
      await specialArt.transferDescriptor(signer.address);
      await specialArt.addTraitImage(0, SAMPLE_PNG);

      const uri = await specialDescriptor.tokenURI(0, [0]);
      const json = decodeTokenURI(uri);

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.equal(1);
      expect(json.attributes[0].trait_type).to.equal('my"trait');
    });
  });
});
