import { test, expect } from '@playwright/test';
import { parseEther } from 'viem';
import {
  ADDRESSES,
  ANVIL_KEYS,
  auctionAbi,
  increaseTime,
  makeWallet,
  publicClient,
  readAuction,
  tokenAbi,
} from './helpers/chain';

test.describe('Niji auction — settle flow', () => {
  // auction.spec.ts と直列実行されるので、 ここでは「未入札状態の auction を settle
  // すれば mint されず totalSupply 据え置き」 のフルフローを検証する。
  // anvil global setup で reset 済 → auction.spec.ts で bidder2 が落札 →
  // この describe では auction を期限切れにして bidder2 が落札 token を受領するか確認。

  test('auction 期限切れで bidder2 (現 winner) が落札 token を受領する', async () => {
    const [nounIdBefore, , , , endTime, bidderBefore] = await readAuction();
    expect(bidderBefore.toLowerCase()).toBe(makeWallet(ANVIL_KEYS.bidder2).account.address.toLowerCase());

    const now = Number((await publicClient.getBlock()).timestamp);
    // endTime を超えるまで時計を進める。 + 60 秒のマージン。
    if (endTime > now) {
      await increaseTime(endTime - now + 60);
    }

    // settle (任意の caller でよい、 deployer で実行)
    const { client } = makeWallet(ANVIL_KEYS.deployer);
    const txHash = await client.writeContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'settleCurrentAndCreateNewAuction',
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // 旧 nounId は winner が所有
    const ownerOfOld = await publicClient.readContract({
      address: ADDRESSES.NijiToken,
      abi: tokenAbi,
      functionName: 'ownerOf',
      args: [nounIdBefore],
    });
    expect(ownerOfOld.toLowerCase()).toBe(bidderBefore.toLowerCase());

    // 新 auction が #1 として開始されている
    const [nounIdAfter, , amountAfter, , , bidderAfter, settledAfter] = await readAuction();
    expect(nounIdAfter).toBe(nounIdBefore + 1n);
    expect(amountAfter).toBe(0n);
    expect(bidderAfter.toLowerCase()).toBe('0x0000000000000000000000000000000000000000');
    expect(settledAfter).toBe(false);

    // totalSupply は 2 (#0 落札済 + #1 出品中)
    const total = await publicClient.readContract({
      address: ADDRESSES.NijiToken,
      abi: tokenAbi,
      functionName: 'totalSupply',
    });
    expect(total).toBeGreaterThanOrEqual(2n);
  });

  test('新 auction (#1) に bidder1 が入札成功', async () => {
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
});
