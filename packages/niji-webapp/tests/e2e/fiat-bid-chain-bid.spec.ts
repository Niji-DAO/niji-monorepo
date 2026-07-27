/**
 * TC-FB10c chain bid tx broadcast (anvil 直叩き経路)
 *
 * fincode iframe cross-origin 制約で TC-FB10 (fiat-bid.spec.ts) は smoke test に scope 縮小、
 * bid tx broadcast の chain 側 verify は本 spec で anvil 直叩き経路 = viem client で
 * NijiAuctionHouseV3.createBid を deployer wallet から発火 → AuctionBid event 確認。
 *
 * 元 TC-FB10 の step 7-8 (bid tx broadcast + AuctionBid event assert) を UI 経路から分離。
 * production 側 BidRelay (backend の 運営 EOA が place-bid endpoint 応答時に tx 発火) と同 shape の
 * chain 動作を verify する、 UI 経路依存を持たないため kiwa fixture 不要 = fiat-bid-parallel project
 * で高速並列実行可能。
 *
 * SSOT — decision-log 2026-07-16-niji-e2e-fincode-iframe-scope-shrink.md
 */
import { expect, test } from '@playwright/test';
import { createWalletClient, http, parseAbi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { ADDRESSES, ANVIL_KEYS, anvil, publicClient } from './helpers/chain';

test.describe('TC-FB10c chain bid tx broadcast (anvil 直叩き、 fincode iframe UI 経路の chain 側代替)', () => {
  test('deployer wallet で createBid → AuctionBid event が anvil chain に emit + amount / sender 一致', async () => {
    test.setTimeout(30_000);

    const auctionAbi = parseAbi([
      'function auctionStorage() view returns (uint96 nounId, uint32 clientId, uint128 amount, uint40 startTime, uint40 endTime, address bidder, bool settled)',
      'function reservePrice() view returns (uint192)',
      'function minBidIncrementPercentage() view returns (uint8)',
      'function createBid(uint256 nounId) payable',
      // INijiAuctionHouseV3.sol SSOT: sender は non-indexed (test ABI で indexed 指定すると
      // parseEventLogs が topic hash mismatch で event を捕捉できず events.length=0)
      'event AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended)',
    ]);

    const [initialNounId, , initialAmount] = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'auctionStorage',
    })) as readonly [bigint, number, bigint, number, number, `0x${string}`, boolean];

    const reservePrice = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'reservePrice',
    })) as bigint;
    const minIncPct = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'minBidIncrementPercentage',
    })) as number;

    // 現 amount + increment% 以上、 initialAmount === 0 なら reservePrice (無ければ 0.01 ETH) の default、
    // 0.02 ETH 最低保証で TC-FB10 元 spec の bid 額と一致
    const nextMinBid =
      initialAmount === 0n
        ? reservePrice > 0n
          ? reservePrice
          : 10_000_000_000_000_000n
        : (initialAmount * (BigInt(minIncPct) + 100n)) / 100n + 1n;
    const bidValue = nextMinBid < 20_000_000_000_000_000n ? 20_000_000_000_000_000n : nextMinBid;

    const deployerAccount = privateKeyToAccount(ANVIL_KEYS.deployer);
    const deployerClient = createWalletClient({
      account: deployerAccount,
      chain: anvil,
      transport: http(),
    });
    const bidTxHash = await deployerClient.writeContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'createBid',
      args: [initialNounId],
      value: bidValue,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: bidTxHash });
    expect(receipt.status).toBe('success');

    const events = parseEventLogs({
      abi: auctionAbi,
      eventName: 'AuctionBid',
      logs: receipt.logs,
    });
    expect(events.length, 'AuctionBid event が emit されている').toBeGreaterThan(0);
    const bidEvent = events[0];
    expect(bidEvent.args.nounId, 'AuctionBid.nounId が現 auction 対象と一致').toBe(initialNounId);
    expect(bidEvent.args.sender.toLowerCase(), 'AuctionBid.sender が operator (deployer)').toBe(
      deployerAccount.address.toLowerCase(),
    );
    expect(bidEvent.args.value, 'AuctionBid.value が送信 bidValue と一致').toBe(bidValue);
  });
});
