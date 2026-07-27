/**
 * Niji auction — settle flow (1 分 duration)
 *
 * 仕様 ... bid → 期限切れ → settle → 新 auction 開始 のフルフロー検証。
 *         PR #168 で auction が 1 分 duration になったため、 increaseTime(65) で
 *         endTime を 1 回越えた状態にしてから settle を呼ぶ。
 *         各 test は snapshot/revert で完結し、 他 spec の chain state に影響しない。
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';
import { parseEther } from 'viem';

import {
  ADDRESSES,
  ANVIL_KEYS,
  auctionAbi,
  increaseTime,
  makeWallet,
  publicClient,
  readAuction,
  revertChain,
  snapshotChain,
  tokenAbi,
} from './helpers/chain';

test.describe('Niji auction — settle flow', () => {
  test('TC-S01 bid → 期限切れ → settle で winner が落札 token を受領 + 新 auction 開始', async () => {
    const snapId = await snapshotChain();
    try {
      // 1) bidder2 が現 auction に bid
      const { account: winner, client: winnerClient } = makeWallet(ANVIL_KEYS.bidder2);
      const [nounIdBefore, , currentAmount, , endTime] = await readAuction();
      const bidValue =
        currentAmount === 0n ? parseEther('0.001') : (currentAmount * 102n) / 100n + 1n;
      const bidTx = await winnerClient.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounIdBefore],
        value: bidValue,
      });
      await publicClient.waitForTransactionReceipt({ hash: bidTx });

      // 2) endTime を超えるまで chain 時計を warp (1 分 duration なので 65s で十分)
      const now = Number((await publicClient.getBlock()).timestamp);
      const delta = endTime > now ? endTime - now + 5 : 5;
      await increaseTime(delta);

      // 3) settle (任意 caller、 deployer で実行)
      const { client: deployerClient } = makeWallet(ANVIL_KEYS.deployer);
      const settleTx = await deployerClient.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'settleCurrentAndCreateNewAuction',
      });
      await publicClient.waitForTransactionReceipt({ hash: settleTx });

      // 4) 旧 nounId の所有者が winner
      const ownerOfOld = await publicClient.readContract({
        address: ADDRESSES.NijiToken,
        abi: tokenAbi,
        functionName: 'ownerOf',
        args: [nounIdBefore],
      });
      expect(ownerOfOld.toLowerCase()).toBe(winner.address.toLowerCase());

      // 5) 新 auction が nounIdBefore+1 で開始
      const [nounIdAfter, , amountAfter, , , bidderAfter, settledAfter] = await readAuction();
      expect(nounIdAfter).toBe(nounIdBefore + 1n);
      expect(amountAfter).toBe(0n);
      expect(bidderAfter.toLowerCase()).toBe('0x0000000000000000000000000000000000000000');
      expect(settledAfter).toBe(false);

      // 6) totalSupply が増えている
      // Niji AuctionHouse は「現 auction settle (winner に mint) + 新 auction 起動 (新 nounId は
      // まだ mint されず active state 保持)」 の 2 step で、 nounIdAfter は「新 auction の nounId」 =
      // まだ mint されていない値。 mint 済 token 数 = nounIdBefore の落札分含めた累積で、
      // 常に `nounIdAfter` (= nounIdBefore + 1) と同数以上 (deploy 直後 Niji 0 済み + settle 済 Niji 1 分)。
      const total = await publicClient.readContract({
        address: ADDRESSES.NijiToken,
        abi: tokenAbi,
        functionName: 'totalSupply',
      });
      expect(total).toBeGreaterThanOrEqual(nounIdAfter);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-S02 settle 後の新 auction に bidder1 が入札成功', async () => {
    const snapId = await snapshotChain();
    try {
      // setup ... 現 auction を期限切れにして settle
      const [nounIdBefore, , , , endTimeBefore] = await readAuction();
      const now = Number((await publicClient.getBlock()).timestamp);
      const delta = endTimeBefore > now ? endTimeBefore - now + 5 : 5;
      await increaseTime(delta);

      const { client: deployerClient } = makeWallet(ANVIL_KEYS.deployer);
      const settleTx = await deployerClient.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'settleCurrentAndCreateNewAuction',
      });
      await publicClient.waitForTransactionReceipt({ hash: settleTx });

      // 新 auction に bidder1 が bid
      const { account: bidder, client: bidderClient } = makeWallet(ANVIL_KEYS.bidder1);
      const [nounIdNew] = await readAuction();
      expect(nounIdNew).toBe(nounIdBefore + 1n);

      const bidTx = await bidderClient.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounIdNew],
        value: parseEther('0.001'),
      });
      await publicClient.waitForTransactionReceipt({ hash: bidTx });

      const [, , amount, , , bidderAfter] = await readAuction();
      expect(amount).toBe(parseEther('0.001'));
      expect(bidderAfter.toLowerCase()).toBe(bidder.address.toLowerCase());
    } finally {
      await revertChain(snapId);
    }
  });
});
