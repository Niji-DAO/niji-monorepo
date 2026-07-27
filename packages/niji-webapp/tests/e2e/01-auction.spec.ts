/**
 * Niji auction — contract layer (anvil 31337)
 *
 * 仕様 ... auctionStorage / reservePrice / minBidIncrement / createBid を直接 chain
 *         layer で確認する。 PR #168 の AUCTION_DURATION=60 (1 分) を前提に、
 *         各 test を snapshot/revert で独立化して状態共有を切る。
 *
 * 前提 (global-setup.ts):
 *   - anvil 8547 chain-id 31337
 *   - deploy-niji-full 完了 (deterministic deploy)
 *   - auto-settler が並走で auction を進める可能性があるため、 各 test 冒頭で
 *     snapshot を取り finally で revert (chain time 進行を test 範囲内に閉じる)
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
  tokenAbi,
} from './helpers/chain';

test.describe('Niji auction — contract layer (anvil 31337)', () => {
  test('TC-A01 auctionStorage が unpause 直後の活きた auction を返す', async () => {
    const snapId = await snapshotChain();
    try {
      const [nounId, , amount, startTime, endTime, bidder, settled] = await readAuction();
      expect(nounId).toBeGreaterThanOrEqual(0n);
      expect(startTime).toBeGreaterThan(0);
      expect(endTime).toBeGreaterThan(startTime);
      // auction が未入札の場合 amount=0、 既存 bid が乗っている場合は >0 のまま許容
      if (amount === 0n) {
        expect(bidder.toLowerCase()).toBe('0x0000000000000000000000000000000000000000');
      }
      expect(settled).toBe(false);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-A02 NijiToken.totalSupply が AuctionHouse 経由で 1 mint 以上', async () => {
    const snapId = await snapshotChain();
    try {
      const total = await publicClient.readContract({
        address: ADDRESSES.NijiToken,
        abi: tokenAbi,
        functionName: 'totalSupply',
      });
      expect(total).toBeGreaterThanOrEqual(1n);

      // 現 auction の nounId が出品中 (= AuctionHouseProxy 所有)
      const [nounId] = await readAuction();
      const owner = await publicClient.readContract({
        address: ADDRESSES.NijiToken,
        abi: tokenAbi,
        functionName: 'ownerOf',
        args: [nounId],
      });
      expect(owner.toLowerCase()).toBe(ADDRESSES.AuctionHouseProxy.toLowerCase());
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-A03 reservePrice と minBidIncrementPercentage が deploy 値と一致', async () => {
    const snapId = await snapshotChain();
    try {
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
    } finally {
      await revertChain(snapId);
    }
  });

  // F-05 review 対応 (2026-07-27) = TC-A04 単独の flaky (chain state 順序依存、 単発では 40ms pass、
  // 全 spec 順序実行時に intermittent fail) を 独立 describe + retries: 1 で 1 test scope に閉じる。
  // top-level retries: 0 に戻したため、 他 test の 新規 regression は retry で silent pass せず gate される。
  // 真の解決は chain state snapshot/revert 経路の bug 根絶 (別 Issue で追跡)。
  test.describe('TC-A04 flaky isolation (retries: 1)', () => {
    test.describe.configure({ retries: 1 });

    test('TC-A04 bidder1 が reservePrice ちょうどで入札成功 (snapshot 内で完結)', async () => {
      const snapId = await snapshotChain();
      try {
        const { account, client } = makeWallet(ANVIL_KEYS.bidder1);
        const [nounId, , currentAmount] = await readAuction();

        // 既存 bid が乗っているケース (auto-settler 走行中) は +2% で上書き、 未入札なら reserve ちょうど
        const bidValue =
          currentAmount === 0n ? parseEther('0.001') : (currentAmount * 102n) / 100n + 1n;

        const txHash = await client.writeContract({
          address: ADDRESSES.AuctionHouseProxy,
          abi: auctionAbi,
          functionName: 'createBid',
          args: [nounId],
          value: bidValue,
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const [, , amountAfter, , , bidderAfter] = await readAuction();
        expect(amountAfter).toBeGreaterThanOrEqual(bidValue);
        expect(bidderAfter.toLowerCase()).toBe(account.address.toLowerCase());
      } finally {
        await revertChain(snapId);
      }
    });
  });

  test('TC-A05 bidder2 が +2% の上書き入札に成功 (snapshot 内で 2 連続 bid)', async () => {
    const snapId = await snapshotChain();
    try {
      // 1) bidder1 が reservePrice ちょうど (or 既存 +2%) で bid
      const { client: client1 } = makeWallet(ANVIL_KEYS.bidder1);
      const [nounId, , initialAmount] = await readAuction();
      const firstBid =
        initialAmount === 0n ? parseEther('0.001') : (initialAmount * 102n) / 100n + 1n;
      const tx1 = await client1.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: firstBid,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx1 });

      // 2) bidder2 が +2% で上書き
      const { account: acc2, client: client2 } = makeWallet(ANVIL_KEYS.bidder2);
      const [, , currentAmount] = await readAuction();
      const newBid = (currentAmount * 102n) / 100n + 1n;
      const tx2 = await client2.writeContract({
        address: ADDRESSES.AuctionHouseProxy,
        abi: auctionAbi,
        functionName: 'createBid',
        args: [nounId],
        value: newBid,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx2 });

      const [, , amountAfter, , , bidderAfter] = await readAuction();
      expect(amountAfter).toBeGreaterThanOrEqual(newBid);
      expect(bidderAfter.toLowerCase()).toBe(acc2.address.toLowerCase());
    } finally {
      await revertChain(snapId);
    }
  });
});
