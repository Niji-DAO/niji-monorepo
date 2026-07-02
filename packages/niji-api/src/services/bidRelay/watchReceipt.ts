/**
 * BidRelay receipt watcher (Issue #3008 Phase C)
 *
 * bid tx broadcast 後の receipt 監視 + AuctionBid event verify を担う。
 * NijiAuctionHouseV3 の event 名 = "AuctionBid" (Nouns V3 ABI 由来、 spec 上の "BidPlaced" 呼称は event 名ではなく状態遷移名)。
 *
 * flow —
 * (1) publicClient.waitForTransactionReceipt で 1 block confirm 待ち
 * (2) receipt.status === "success" なら AuctionBid event 抽出 + verify
 * (3) receipt.status === "reverted" なら BidRelayError throw (revert reason は receipt から推定困難、 classifyBidError で string match)
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P6、
 *        Phase1-02-issue-breakdown.md § Issue 5、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { nijiAuctionHouseAbi } from '@niji/sdk/actions';
import { decodeEventLog, type Address, type Hash, type PublicClient } from 'viem';

import { BidRelayError } from './index.js';

/** receipt watch 成功時の返値 (fiat_bid.status = "bid-placed" 遷移確定に使う) */
export type BidConfirmation = {
  txHash: Hash;
  blockNumber: bigint;
  /** AuctionBid event に含まれる nounId (chain 記録の一致 verify) */
  nounId: bigint;
  /** AuctionBid event に含まれる bid 額 (wei、 broadcast 時 value と一致 verify) */
  amount: bigint;
  /** chain 上の bidder = 運営 EOA address (代理 bid 発火の実行者記録) */
  sender: Address;
};

export type WaitForBidConfirmationOptions = {
  publicClient: PublicClient;
  txHash: Hash;
  auctionHouseAddress: Address;
  /** 1 block confirm 待ち (default = 1) */
  confirmations?: number;
  /** timeout (ms、 default = 60000 = 60 秒) */
  timeoutMs?: number;
};

/**
 * bid tx receipt watch + BidPlaced event verify
 *
 * receipt.status === "reverted" 時 BidRelayError('bid tx reverted', reason: 'Unknown') throw
 * receipt に BidPlaced event が含まれない時 BidRelayError('BidPlaced event not emitted') throw
 */
export const waitForBidConfirmation = async (
  options: WaitForBidConfirmationOptions,
): Promise<BidConfirmation> => {
  const confirmations = options.confirmations ?? 1;
  const timeoutMs = options.timeoutMs ?? 60_000;

  let receipt;
  try {
    receipt = await options.publicClient.waitForTransactionReceipt({
      hash: options.txHash,
      confirmations,
      timeout: timeoutMs,
    });
  } catch (err) {
    throw new BidRelayError('waitForTransactionReceipt failed', {
      reason: 'RpcError',
      cause: err,
    });
  }

  if (receipt.status !== 'success') {
    // revert = chain 上で他 bidder に上乗せされた or auction 終了直前 settle された 等、
    // handler 層で GMO alterTran cancel + user 通知 msg 選択 (BidRelayError.reason = Unknown)
    throw new BidRelayError('bid tx reverted', { reason: 'Unknown' });
  }

  // AuctionBid event を decode して nounId / amount / sender を抽出
  // auctionHouse から emit された log のみ対象、 他 contract log は無視
  const auctionHouseLogs = receipt.logs.filter(
    log => log.address.toLowerCase() === options.auctionHouseAddress.toLowerCase(),
  );

  for (const log of auctionHouseLogs) {
    try {
      const decoded = decodeEventLog({
        abi: nijiAuctionHouseAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === 'AuctionBid') {
        // AuctionBid struct — nounId (indexed) / sender / value / extended (bool)
        // gen.ts § AuctionBid event 定義参照
        const args = decoded.args as unknown as {
          sender: Address;
          nounId: bigint;
          value: bigint;
          extended: boolean;
        };
        return {
          txHash: options.txHash,
          blockNumber: receipt.blockNumber,
          nounId: args.nounId,
          amount: args.value,
          sender: args.sender,
        };
      }
    } catch {
      // decode 失敗した log は skip (他 event の混入 or ABI 不一致)
      continue;
    }
  }

  throw new BidRelayError('AuctionBid event not emitted in receipt logs', {
    reason: 'Unknown',
  });
};
