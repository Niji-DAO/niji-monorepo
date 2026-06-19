import { test, expect } from '@playwright/test';
import { parseEther } from 'viem';
import {
  ADDRESSES,
  ANVIL_KEYS,
  auctionAbi,
  makeWallet,
  publicClient,
  readAuction,
} from './helpers/chain';

test.describe('Niji auction — error paths', () => {
  // settle.spec.ts までで auction #1 が active + bidder1 が 0.001 ETH 入札済の状態。
  // ここからエラーパスを叩く。

  test('reservePrice 未満の入札は revert', async () => {
    const { client } = makeWallet(ANVIL_KEYS.bidder2);
    const [nounId] = await readAuction();
    await expect(
      client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        // amount=0 + value <= reservePrice (0.001) なら revert
        value: parseEther('0.0001'),
      }),
    ).rejects.toThrow(/below reservePrice|reservePrice|increment/i);
  });

  test('minBidIncrement 未満の上書き入札は revert', async () => {
    const { client } = makeWallet(ANVIL_KEYS.bidder2);
    const [nounId, , currentAmount] = await readAuction();
    // currentAmount + 1 wei では +2% 未満なので revert
    await expect(
      client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: currentAmount + 1n,
      }),
    ).rejects.toThrow(/increment|increase|higher than/i);
  });

  test('間違った nounId への入札は revert', async () => {
    const { client } = makeWallet(ANVIL_KEYS.bidder2);
    const [nounId] = await readAuction();
    const wrong = nounId + 100n;
    await expect(
      client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [wrong],
        value: parseEther('0.01'),
      }),
    ).rejects.toThrow(/Niji not up for auction|nounId|not for sale|not on auction|auction/i);
  });

  test('auction が active な間に settle は revert', async () => {
    const { client } = makeWallet(ANVIL_KEYS.bidder2);
    await expect(
      client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'settleCurrentAndCreateNewAuction',
      }),
    ).rejects.toThrow(/Auction hasn't begun|Auction|not.*ended|hasn't.*completed/i);

    // 落札者 / 金額 は変わっていないこと
    const [, , amount, , , bidder] = await readAuction();
    expect(amount).toBe(parseEther('0.001'));
    expect(bidder.toLowerCase()).toBe(makeWallet(ANVIL_KEYS.bidder1).account.address.toLowerCase());
  });

  test('await publicClient.getBalance で bidder1 は (initial - 0.001 - gas) ETH 残し', async () => {
    const balance = await publicClient.getBalance({
      address: makeWallet(ANVIL_KEYS.bidder1).account.address,
    });
    // anvil 初期残高 10000 ETH、 0.001 ETH bid + gas を引いてもまだ 9999 ETH 以上
    expect(balance).toBeGreaterThan(parseEther('9999'));
  });
});
