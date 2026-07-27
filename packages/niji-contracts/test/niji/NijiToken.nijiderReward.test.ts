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

/**
 * Nijider founder reward (NounsToken.noundersDAO 相当)。
 *
 * mint() は 10 個ごと (tokenId % 10 == 0) に Nijider DAO へ 1 個 mint してから、 次の id を
 * auction house (msg.sender) に返す。 nijidersDAO 未設定 / reward window 外では reward を skip する。
 */
describe('NijiToken — Nijider founder reward', () => {
  let art: NijiArt;
  let descriptor: NijiDescriptor;
  let seeder: NijiSeeder;
  let token: NijiToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let nijider: SignerWithAddress;
  let other: SignerWithAddress;

  const MAX_SUPPLY = 0; // unlimited

  beforeEach(async () => {
    [owner, minter, nijider, other] = await ethers.getSigners();

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

  describe('setNijidersDAO', () => {
    it('owner が初期設定できる', async () => {
      await expect(token.setNijidersDAO(nijider.address))
        .to.emit(token, 'NijidersDAOUpdated')
        .withArgs(ethers.ZeroAddress, nijider.address);
      expect(await token.nijidersDAO()).to.equal(nijider.address);
    });

    it('設定後は Nijider DAO 自身のみ変更できる (owner は不可)', async () => {
      await token.setNijidersDAO(nijider.address);

      await expect(token.setNijidersDAO(other.address)).to.be.revertedWithCustomError(
        token,
        'OnlyNijidersDAO',
      );

      await expect(token.connect(nijider).setNijidersDAO(other.address))
        .to.emit(token, 'NijidersDAOUpdated')
        .withArgs(nijider.address, other.address);
      expect(await token.nijidersDAO()).to.equal(other.address);
    });

    it('未設定時に owner 以外は設定できない', async () => {
      await expect(
        token.connect(other).setNijidersDAO(other.address),
      ).to.be.revertedWithCustomError(token, 'OnlyNijidersDAO');
    });
  });

  describe('founder reward の mint 挙動', () => {
    beforeEach(async () => {
      await token.setNijidersDAO(nijider.address);
      await token.setNijiderRewardLastId(1820);
    });

    it('初回 mint で Niji 0 が Nijider、 auction は Niji 1 を受け取る', async () => {
      const tx = await token.connect(minter).mint();
      await expect(tx).to.emit(token, 'NijiderRewardMinted').withArgs(0, nijider.address);

      expect(await token.ownerOf(0)).to.equal(nijider.address);
      expect(await token.ownerOf(1)).to.equal(minter.address);
      expect(await token.totalSupply()).to.equal(2);
    });

    it('10 個ごとに Nijider へ付与される (0, 10, 20)', async () => {
      // 22 token 分 mint = id 0..21、 reward は 0 / 10 / 20 の 3 個
      for (let i = 0; i < 20; i++) {
        await token.connect(minter).mint();
      }

      expect(await token.ownerOf(0)).to.equal(nijider.address);
      expect(await token.ownerOf(10)).to.equal(nijider.address);
      expect(await token.ownerOf(20)).to.equal(nijider.address);

      // reward 以外は auction (minter) が保有
      expect(await token.ownerOf(1)).to.equal(minter.address);
      expect(await token.ownerOf(9)).to.equal(minter.address);
      expect(await token.ownerOf(11)).to.equal(minter.address);
    });

    it('reward window (nijiderRewardLastId) を超えると付与されない', async () => {
      await token.setNijiderRewardLastId(0); // id 0 のみ reward 対象

      await token.connect(minter).mint(); // id0 = reward, id1 = auction
      expect(await token.ownerOf(0)).to.equal(nijider.address);

      // 以降は reward なし = 1 mint で 1 token のみ
      const supplyBefore = await token.totalSupply();
      await token.connect(minter).mint();
      expect(await token.totalSupply()).to.equal(supplyBefore + 1n);
    });

    it('nijidersDAO 未設定なら reward を skip する', async () => {
      await token.connect(nijider).setNijidersDAO(ethers.ZeroAddress);

      await token.connect(minter).mint();
      expect(await token.ownerOf(0)).to.equal(minter.address);
      expect(await token.totalSupply()).to.equal(1);
    });
  });

  describe('mint(address) は founder reward の対象外', () => {
    it('直接 mint(to) は reward を挟まず 1 token のみ', async () => {
      await token.setNijidersDAO(nijider.address);
      await token.setNijiderRewardLastId(1820);

      await token.connect(minter)['mint(address)'](other.address);
      expect(await token.ownerOf(0)).to.equal(other.address);
      expect(await token.totalSupply()).to.equal(1);
    });
  });
});
