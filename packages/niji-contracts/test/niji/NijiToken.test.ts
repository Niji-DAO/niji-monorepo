import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor, NijiSeeder, NijiToken } from '../../typechain';
import {
  SAMPLE_PNG,
  RESOLUTION,
  COMPOSITE_ORDER,
  deployNijiArt,
  deployNijiDescriptor,
  deployNijiSeeder,
  deployNijiToken,
  populateAllTraits,
  decodeTokenURI,
  shouldBehaveLikeOwnable2Step,
} from './helpers';

describe('NijiToken', () => {
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

    // Deploy contracts
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

    // Setup: set descriptor on art
    await art.setDescriptor(await descriptor.getAddress());

    // Add sample images for all traits
    await art.transferDescriptor(owner.address);
    await populateAllTraits(art, SAMPLE_PNG);
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
      await expect(token['mint(address)'](other.address))
        .to.emit(token, 'Transfer')
        .withArgs(ethers.ZeroAddress, other.address, 0);

      expect(await token.ownerOf(0)).to.equal(other.address);
      expect(await token.currentTokenId()).to.equal(1);
    });

    it('should emit NijiMinted event', async () => {
      await expect(token['mint(address)'](other.address)).to.emit(token, 'NijiMinted');
    });

    it('should store seed for token', async () => {
      await token['mint(address)'](other.address);
      const seed = await token.getSeed(0);

      // Seed should have valid values
      expect(seed.special).to.be.at.least(0);
      expect(seed.hair).to.be.at.least(0);
    });

    it('should revert if minting is not active', async () => {
      await token.toggleMinting(); // Turn off

      await expect(token['mint(address)'](other.address)).to.be.revertedWithCustomError(
        token,
        'MintingNotActive',
      );
    });

    it('should revert if caller is not minter', async () => {
      await expect(token.connect(other)['mint(address)'](other.address)).to.be.revertedWithCustomError(
        token,
        'OnlyMinter',
      );
    });

    it('should revert if max supply reached', async () => {
      // Deploy with max supply of 1
      const limitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        1,
      );
      await limitedToken.toggleMinting();

      await limitedToken['mint(address)'](other.address);
      await expect(limitedToken['mint(address)'](other.address)).to.be.revertedWithCustomError(
        limitedToken,
        'MaxSupplyReached',
      );
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
      await token['mint(address)'](other.address);
    });

    it('should return valid tokenURI', async () => {
      const uri = await token.tokenURI(0);

      expect(uri).to.include('data:application/json;base64,');

      // Decode and check JSON
      const json = decodeTokenURI(uri);

      expect(json.name).to.equal('Niji #0');
      expect(json.image).to.include('data:image/svg+xml;base64,');
    });

    it('should revert for non-existent token', async () => {
      await expect(token.tokenURI(999)).to.be.revertedWithCustomError(token, 'TokenDoesNotExist');
    });

    it('should include attributes in tokenURI', async () => {
      const uri = await token.tokenURI(0);
      const json = decodeTokenURI(uri);

      expect(json.attributes).to.be.an('array');
      expect(json.attributes.length).to.be.greaterThan(0);

      // Each attribute should have trait_type and value
      for (const attr of json.attributes) {
        expect(attr.trait_type).to.be.a('string');
        expect(attr.value).to.be.a('string');
      }
    });
  });

  describe('getSeed', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token['mint(address)'](other.address);
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
      await token['mint(address)'](other.address);
    });

    it('should return trait indices array', async () => {
      const indices = await token.getTraitIndices(0);

      expect(indices.length).to.equal(12);
    });
  });

  describe('setDescriptor', () => {
    it('should allow owner to update descriptor', async () => {
      const newDescriptor = await deployNijiDescriptor(await art.getAddress());
      const descriptorAddr = await descriptor.getAddress();
      const newDescriptorAddr = await newDescriptor.getAddress();

      await expect(token.setDescriptor(newDescriptorAddr))
        .to.emit(token, 'DescriptorUpdated')
        .withArgs(descriptorAddr, newDescriptorAddr);

      expect(await token.descriptor()).to.equal(newDescriptorAddr);
    });

    it('should revert if caller is not owner', async () => {
      await expect(token.connect(other).setDescriptor(other.address)).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('setSeeder', () => {
    it('should allow owner to update seeder', async () => {
      const newSeeder = await deployNijiSeeder(await art.getAddress());
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

      await token.connect(minter)['mint(address)'](other.address);
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
      await expect(token.toggleMinting()).to.emit(token, 'MintingToggled').withArgs(true);
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

  shouldBehaveLikeOwnable2Step(
    () => token,
    () => owner,
    () => other,
    () => minter,
  );

  describe('contractURI', () => {
    it('should return ipfs:// with empty hash by default', async () => {
      expect(await token.contractURI()).to.equal('ipfs://');
    });

    it('should allow owner to set contract URI hash', async () => {
      const hash = 'QmTest1234567890abcdef';
      await token.setContractURIHash(hash);
      expect(await token.contractURI()).to.equal(`ipfs://${hash}`);
    });

    it('should emit ContractURIHashUpdated event', async () => {
      const hash = 'QmTest1234567890abcdef';
      await expect(token.setContractURIHash(hash))
        .to.emit(token, 'ContractURIHashUpdated')
        .withArgs(hash);
    });

    it('should allow updating hash multiple times', async () => {
      const hash1 = 'QmFirst';
      const hash2 = 'QmSecond';

      await token.setContractURIHash(hash1);
      expect(await token.contractURI()).to.equal(`ipfs://${hash1}`);

      await token.setContractURIHash(hash2);
      expect(await token.contractURI()).to.equal(`ipfs://${hash2}`);
    });

    it('should revert if caller is not owner', async () => {
      await expect(token.connect(other).setContractURIHash('QmTest')).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('provenanceHash', () => {
    const SAMPLE_HASH = 'abc123def456789';

    it('should default to empty string', async () => {
      expect(await token.provenanceHash()).to.equal('');
    });

    it('should allow owner to set provenance hash', async () => {
      await token.setProvenanceHash(SAMPLE_HASH);
      expect(await token.provenanceHash()).to.equal(SAMPLE_HASH);
    });

    it('should emit ProvenanceHashSet event', async () => {
      await expect(token.setProvenanceHash(SAMPLE_HASH))
        .to.emit(token, 'ProvenanceHashSet')
        .withArgs(SAMPLE_HASH);
    });

    it('should allow updating before lock', async () => {
      await token.setProvenanceHash(SAMPLE_HASH);
      const updatedHash = 'updated_hash_value';
      await token.setProvenanceHash(updatedHash);
      expect(await token.provenanceHash()).to.equal(updatedHash);
    });

    it('should revert setProvenanceHash after lock', async () => {
      await token.setProvenanceHash(SAMPLE_HASH);
      await token.lockProvenanceHash();

      await expect(token.setProvenanceHash('new_hash')).to.be.revertedWithCustomError(
        token,
        'ProvenanceHashLocked',
      );
    });

    it('should revert if non-owner calls setProvenanceHash', async () => {
      await expect(
        token.connect(other).setProvenanceHash(SAMPLE_HASH),
      ).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await token.toggleMinting();
      await token['mint(address)'](other.address);
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
      await token['mint(address)'](other.address);

      expect(await token.remainingSupply()).to.equal(MAX_SUPPLY - 1);
    });

    it('should return max uint for unlimited supply', async () => {
      const unlimitedToken = await deployNijiToken(
        'Niji',
        'NIJI',
        await descriptor.getAddress(),
        await seeder.getAddress(),
        0, // unlimited
      );

      expect(await unlimitedToken.remainingSupply()).to.equal(ethers.MaxUint256);
    });
  });

  describe('pausable', () => {
    it('should not be paused by default', async () => {
      expect(await token.paused()).to.be.false;
    });

    it('should allow owner to pause', async () => {
      await expect(token.pause()).to.emit(token, 'Paused').withArgs(owner.address);
      expect(await token.paused()).to.be.true;
    });

    it('should allow owner to unpause', async () => {
      await token.pause();
      await expect(token.unpause()).to.emit(token, 'Unpaused').withArgs(owner.address);
      expect(await token.paused()).to.be.false;
    });

    it('should revert when non-owner tries to pause', async () => {
      await expect(token.connect(other).pause()).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should revert when non-owner tries to unpause', async () => {
      await token.pause();
      await expect(token.connect(other).unpause()).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should block mint when paused', async () => {
      await token.toggleMinting();
      await token.pause();
      await expect(token['mint(address)'](other.address)).to.be.revertedWithCustomError(
        token,
        'EnforcedPause',
      );
    });

    it('should block mintBatch when paused', async () => {
      await token.toggleMinting();
      await token.pause();
      await expect(token.mintBatch(other.address, 2)).to.be.revertedWithCustomError(
        token,
        'EnforcedPause',
      );
    });

    it('should block transfer when paused', async () => {
      await token.toggleMinting();
      const tokenId = await token['mint(address)'].staticCall(other.address);
      await token['mint(address)'](other.address);
      await token.pause();
      await expect(
        token.connect(other).transferFrom(other.address, owner.address, tokenId),
      ).to.be.revertedWithCustomError(token, 'EnforcedPause');
    });

    it('should block burn when paused', async () => {
      await token.toggleMinting();
      const tokenId = await token['mint()'].staticCall();
      await token['mint()']();
      await token.pause();
      await expect(token.burn(tokenId)).to.be.revertedWithCustomError(token, 'EnforcedPause');
    });

    it('should resume operations when unpaused', async () => {
      await token.toggleMinting();
      await token.pause();
      await token.unpause();
      await expect(token['mint(address)'](other.address)).to.not.be.reverted;
    });

    it('should keep transferOwnership / acceptOwnership available while paused (owner rescue path)', async () => {
      await token.pause();
      await expect(token.transferOwnership(other.address)).to.not.be.reverted;
      await expect(token.connect(other).acceptOwnership()).to.not.be.reverted;
      expect(await token.owner()).to.equal(other.address);
      expect(await token.paused()).to.be.true;
    });

    it('should keep owner admin setters callable while paused (setMintingActive)', async () => {
      await token.pause();
      await expect(token.setMintingActive(true)).to.not.be.reverted;
      expect(await token.isMintingActive()).to.be.true;
      expect(await token.paused()).to.be.true;
    });

    it('should keep view functions (tokenURI / getSeed) callable while paused', async () => {
      await token.toggleMinting();
      await token['mint(address)'](other.address);
      await token.pause();

      const uri = await token.tokenURI(0);
      expect(uri).to.include('data:application/json;base64,');
      const seed = await token.getSeed(0);
      expect(seed.special).to.be.at.least(0);
    });
  });

  describe('withdraw', () => {
    it('should accept ETH via receive()', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });
      expect(await ethers.provider.getBalance(tokenAddr)).to.equal(ethers.parseEther('1'));
    });

    it('should allow owner to withdraw full balance', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('2') });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await token.withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(await ethers.provider.getBalance(tokenAddr)).to.equal(0);
      expect(ownerBalanceAfter - ownerBalanceBefore + gasCost).to.equal(ethers.parseEther('2'));
    });

    it('should emit Withdrawn event on withdraw', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      await expect(token.withdraw())
        .to.emit(token, 'Withdrawn')
        .withArgs(owner.address, ethers.parseEther('1'));
    });

    it('should revert withdraw when contract balance is zero', async () => {
      await expect(token.withdraw()).to.be.revertedWithCustomError(
        token,
        'WithdrawAmountExceedsBalance',
      );
    });

    it('should revert when non-owner calls withdraw', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      await expect(token.connect(other).withdraw()).to.be.revertedWithCustomError(
        token,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should allow owner to withdraw a partial amount', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('3') });

      await expect(token.withdrawAmount(ethers.parseEther('1')))
        .to.emit(token, 'Withdrawn')
        .withArgs(owner.address, ethers.parseEther('1'));

      expect(await ethers.provider.getBalance(tokenAddr)).to.equal(ethers.parseEther('2'));
    });

    it('should revert withdrawAmount when amount is zero', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      await expect(token.withdrawAmount(0)).to.be.revertedWithCustomError(
        token,
        'WithdrawAmountExceedsBalance',
      );
    });

    it('should revert withdrawAmount when amount exceeds balance', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      await expect(
        token.withdrawAmount(ethers.parseEther('2')),
      ).to.be.revertedWithCustomError(token, 'WithdrawAmountExceedsBalance');
    });

    it('should revert when non-owner calls withdrawAmount', async () => {
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      await expect(
        token.connect(other).withdrawAmount(ethers.parseEther('1')),
      ).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });

    it('should revert with WithdrawFailed when owner-side ETH transfer rejects (withdraw)', async () => {
      // Transfer ownership to a contract that always reverts on receive
      const Rejecting = await ethers.getContractFactory('RejectingReceiver');
      const rejecting = await Rejecting.deploy();
      const rejectingAddr = await rejecting.getAddress();

      await token.transferOwnership(rejectingAddr);
      await rejecting.acceptOwnershipOn(await token.getAddress());

      // Fund the token contract
      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      // Call withdraw from rejecting (now owner) and expect WithdrawFailed
      const tokenIface = token.interface;
      const callData = tokenIface.encodeFunctionData('withdraw');
      await expect(rejecting.callOn(tokenAddr, callData)).to.be.reverted;
    });

    it('should revert with WithdrawFailed when owner-side ETH transfer rejects (withdrawAmount)', async () => {
      const Rejecting = await ethers.getContractFactory('RejectingReceiver');
      const rejecting = await Rejecting.deploy();
      const rejectingAddr = await rejecting.getAddress();

      await token.transferOwnership(rejectingAddr);
      await rejecting.acceptOwnershipOn(await token.getAddress());

      const tokenAddr = await token.getAddress();
      await owner.sendTransaction({ to: tokenAddr, value: ethers.parseEther('1') });

      const tokenIface = token.interface;
      const callData = tokenIface.encodeFunctionData('withdrawAmount', [ethers.parseEther('1')]);
      await expect(rejecting.callOn(tokenAddr, callData)).to.be.reverted;
    });
  });
});
