import { test, expect } from '@playwright/test';
import { parseEther } from 'viem';
import {
  ADDRESSES,
  ANVIL_KEYS,
  auctionAbi,
  makeWallet,
  publicClient,
  readAuction,
  tokenAbi,
} from './helpers/chain';

test.describe('Niji auction — contract layer (anvil 31337)', () => {
  test('auctionStorage が unpause 直後の活きた auction を返す', async () => {
    const [nounId, , amount, startTime, endTime, bidder, settled] = await readAuction();
    expect(nounId).toBeGreaterThanOrEqual(0n);
    expect(amount).toBe(0n);
    expect(startTime).toBeGreaterThan(0);
    expect(endTime).toBeGreaterThan(startTime);
    expect(bidder.toLowerCase()).toBe('0x0000000000000000000000000000000000000000');
    expect(settled).toBe(false);
  });

  test('NijiToken.totalSupply が AuctionHouse 経由で 1 mint された', async () => {
    const total = await publicClient.readContract({
      address: ADDRESSES.NijiToken,
      abi: tokenAbi,
      functionName: 'totalSupply',
    });
    expect(total).toBeGreaterThanOrEqual(1n);
    const owner = await publicClient.readContract({
      address: ADDRESSES.NijiToken,
      abi: tokenAbi,
      functionName: 'ownerOf',
      args: [0n],
    });
    // auction の出品物なので AuctionHouseProxy が所有
    expect(owner.toLowerCase()).toBe(ADDRESSES.AuctionHouseProxy.toLowerCase());
  });

  test('reservePrice と minBidIncrementPercentage が deploy 値と一致', async () => {
    const reserve = await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'reservePrice',
    });
    expect(reserve).toBe(parseEther('0.001'));
    const minInc = await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'minBidIncrementPercentage',
    });
    expect(minInc).toBe(2);
  });

  test('bidder1 が reservePrice ちょうどで入札成功', async () => {
    const { account, client } = makeWallet(ANVIL_KEYS.bidder1);
    const [nounId] = await readAuction();
    const txHash = await client.writeContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'createBid',
      args: [nounId],
      value: parseEther('0.001'),
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    const [, , amount, , , bidder] = await readAuction();
    expect(amount).toBe(parseEther('0.001'));
    expect(bidder.toLowerCase()).toBe(account.address.toLowerCase());
  });

  test('bidder2 が +2% の上書き入札に成功', async () => {
    const { account, client } = makeWallet(ANVIL_KEYS.bidder2);
    const [nounId, , currentAmount] = await readAuction();
    // 1.02 倍 + ceiling 余裕
    const newBid = (currentAmount * 102n) / 100n + 1n;
    const txHash = await client.writeContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'createBid',
      args: [nounId],
      value: newBid,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    const [, , amountAfter, , , bidderAfter] = await readAuction();
    expect(amountAfter).toBeGreaterThanOrEqual(newBid);
    expect(bidderAfter.toLowerCase()).toBe(account.address.toLowerCase());
  });
});
