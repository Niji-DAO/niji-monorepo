/**
 * Niji auction — error paths (revert 確認)
 *
 * 仕様 ... reservePrice 未満 / minBidIncrement 未満 / 不正 nounId / active 中 settle の revert 確認。
 *         各 test は snapshot/revert で完結し、 前 test の bid state に影響されないよう
 *         必要な前提 bid を test 内で行う。
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';
import { parseEther } from 'viem';

import {
  ADDRESSES,
  ANVIL_KEYS,
  auctionAbi,
  makeWallet,
  publicClient,
  readAuction,
  revertChain,
  snapshotChain,
} from './helpers/chain';

test.describe('Niji auction — error paths', () => {
  test('TC-E01 reservePrice 未満の入札は revert (未入札 auction で 0.0001 ETH)', async () => {
    const snapId = await snapshotChain();
    try {
      const { client } = makeWallet(ANVIL_KEYS.bidder2);
      const [nounId, , currentAmount] = await readAuction();

      // 既存 bid が乗っている case は reservePrice 未満が成立しないため value=1 wei で代替
      // (どちらにせよ reservePrice / increment いずれかで revert する)
      const tooLow = currentAmount === 0n ? parseEther('0.0001') : 1n;

      await expect(
        client.writeContract({
          address: ADDRESSES.AuctionHouseProxy,
          abi: auctionAbi,
          functionName: 'createBid',
          args: [nounId],
          value: tooLow,
        }),
      ).rejects.toThrow(/below reservePrice|reservePrice|increment|increase|higher/i);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-E02 minBidIncrement 未満の上書き入札は revert', async () => {
    const snapId = await snapshotChain();
    try {
      // setup ... reservePrice ちょうど / 既存 +2% で 1 回 bid して上書き対象を作る
      const { client: bidder1Client } = makeWallet(ANVIL_KEYS.bidder1);
      const [nounId, , initial] = await readAuction();
      const firstBid = initial === 0n ? parseEther('0.001') : (initial * 102n) / 100n + 1n;
      const tx1 = await bidder1Client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: firstBid,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx1 });

      // bidder2 が +1 wei で上書き試行 → +2% 未満で revert
      const { client: bidder2Client } = makeWallet(ANVIL_KEYS.bidder2);
      const [, , currentAmount] = await readAuction();
      await expect(
        bidder2Client.writeContract({
          address: ADDRESSES.AuctionHouseProxy,
          abi: auctionAbi,
          functionName: 'createBid',
          args: [nounId],
          value: currentAmount + 1n,
        }),
      ).rejects.toThrow(/increment|increase|higher than/i);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-E03 間違った nounId への入札は revert', async () => {
    const snapId = await snapshotChain();
    try {
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
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-E04 auction が active な間に settle は revert', async () => {
    const snapId = await snapshotChain();
    try {
      // setup ... reservePrice ちょうどで bid を入れて active 状態を確保
      const { account: bidder1, client: bidder1Client } = makeWallet(ANVIL_KEYS.bidder1);
      const [nounId, , initial] = await readAuction();
      const firstBid = initial === 0n ? parseEther('0.001') : (initial * 102n) / 100n + 1n;
      const bidTx = await bidder1Client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: firstBid,
      });
      await publicClient.waitForTransactionReceipt({ hash: bidTx });

      const { client: bidder2Client } = makeWallet(ANVIL_KEYS.bidder2);
      await expect(
        bidder2Client.writeContract({
          address: ADDRESSES.AuctionHouseProxy,
          abi: auctionAbi,
          functionName: 'settleCurrentAndCreateNewAuction',
        }),
      ).rejects.toThrow(/Auction hasn't begun|Auction|not.*ended|hasn't.*completed/i);

      // 落札者 / 金額 は変わっていない
      const [, , amount, , , bidder] = await readAuction();
      expect(amount).toBeGreaterThanOrEqual(firstBid);
      expect(bidder.toLowerCase()).toBe(bidder1.address.toLowerCase());
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-E05 bidder1 の残高が 1 回 bid で激減せず 9999 ETH 以上残る', async () => {
    const snapId = await snapshotChain();
    try {
      const { account: bidder1, client } = makeWallet(ANVIL_KEYS.bidder1);
      const [nounId, , initial] = await readAuction();
      const bidValue = initial === 0n ? parseEther('0.001') : (initial * 102n) / 100n + 1n;
      const tx = await client.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: bidValue,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      const balance = await publicClient.getBalance({ address: bidder1.address });
      // anvil 初期残高 10000 ETH、 0.001 ETH bid + gas を引いても 9999 ETH 以上残る
      expect(balance).toBeGreaterThan(parseEther('9999'));
    } finally {
      await revertChain(snapId);
    }
  });
});
