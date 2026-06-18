import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { NijiArt, NijiDescriptor, NijiSeeder, NijiToken } from '../../typechain';
import {
  SAMPLE_PNG,
  deployNijiArt,
  deployNijiDescriptor,
  deployNijiSeeder,
  deployNijiToken,
  populateAllTraits,
} from './helpers';

describe('NijiToken (ERC721Votes)', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let seeder: NijiSeeder;
  let token: NijiToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const MAX_SUPPLY = 100;

  beforeEach(async () => {
    [owner, minter, alice, bob] = await ethers.getSigners();

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

    await token.setMinter(minter.address);
    await token.setMintingActive(true);
  });

  describe('Vote tracking', () => {
    it('returns 0 votes before delegation, even after minting', async () => {
      await token.connect(minter).mint(alice.address);
      expect(await token.getVotes(alice.address)).to.equal(0n);
    });

    it('counts 1 vote per token after self-delegation', async () => {
      await token.connect(minter).mint(alice.address);
      await token.connect(minter).mint(alice.address);
      await token.connect(alice).delegate(alice.address);
      expect(await token.getVotes(alice.address)).to.equal(2n);
    });

    it('moves voting power on transfer of an already-delegated token', async () => {
      await token.connect(minter).mint(alice.address);
      await token.connect(alice).delegate(alice.address);
      await token.connect(bob).delegate(bob.address);
      await token.connect(alice).transferFrom(alice.address, bob.address, 0);
      expect(await token.getVotes(alice.address)).to.equal(0n);
      expect(await token.getVotes(bob.address)).to.equal(1n);
    });

    it('delegates voting power to a third party', async () => {
      await token.connect(minter).mint(alice.address);
      await token.connect(alice).delegate(bob.address);
      expect(await token.getVotes(alice.address)).to.equal(0n);
      expect(await token.getVotes(bob.address)).to.equal(1n);
    });
  });

  describe('Historical votes (getPastVotes)', () => {
    it('returns historical vote balance at a past block', async () => {
      await token.connect(minter).mint(alice.address);
      await token.connect(alice).delegate(alice.address);

      const checkpointBlock = await ethers.provider.getBlockNumber();
      await ethers.provider.send('evm_mine', []);

      await token.connect(minter).mint(alice.address);
      await ethers.provider.send('evm_mine', []);

      expect(await token.getPastVotes(alice.address, checkpointBlock)).to.equal(1n);
      expect(await token.getVotes(alice.address)).to.equal(2n);
    });

    it('reverts when querying current or future block', async () => {
      const current = await ethers.provider.getBlockNumber();
      await expect(token.getPastVotes(alice.address, current)).to.be.reverted;
    });
  });

  describe('Delegates getter', () => {
    it('returns zero address before delegation', async () => {
      expect(await token.delegates(alice.address)).to.equal(ethers.ZeroAddress);
    });

    it('returns the delegate address after delegation', async () => {
      await token.connect(alice).delegate(bob.address);
      expect(await token.delegates(alice.address)).to.equal(bob.address);
    });
  });
});
