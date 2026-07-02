/**
 * BidRelay watchReceipt behavior test (Issue #3008 Phase C/D)
 *
 * 検証対象 —
 * (1) receipt.status = "success" + AuctionBid event → BidConfirmation 返却
 * (2) receipt.status = "reverted" → BidRelayError.reason = Unknown
 * (3) AuctionBid event なし → BidRelayError ('AuctionBid event not emitted...')
 * (4) waitForTransactionReceipt throw → BidRelayError.reason = RpcError
 *
 * viem PublicClient は必要 method (waitForTransactionReceipt) のみ持つ stub で差替。
 * event log の encode は encodeEventTopics + encodeAbiParameters で正確に生成。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠 (behavior test / 変更箇所 execute / test runner PASS)。
 */

import { nijiAuctionHouseAbi } from '@niji/sdk/actions';
import {
  encodeAbiParameters,
  encodeEventTopics,
  keccak256,
  toHex,
  type Address,
  type Hash,
  type PublicClient,
} from 'viem';
import { describe, expect, it, vi } from 'vitest';

import { waitForBidConfirmation } from './watchReceipt.js';

import { BidRelayError } from './index.js';

const AUCTION_HOUSE_ADDRESS: Address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const OPERATOR_ADDRESS: Address = '0x1234567890123456789012345678901234567890';
const OTHER_CONTRACT: Address = '0x9999999999999999999999999999999999999999';
const STUB_TX_HASH: Hash = '0xdeadbeef000000000000000000000000000000000000000000000000000000ff';

/** AuctionBid event log を encode (nounId indexed / sender + value + extended non-indexed) */
const encodeAuctionBidLog = (input: {
  nounId: bigint;
  sender: Address;
  value: bigint;
  extended: boolean;
  contractAddress: Address;
}) => {
  const topics = encodeEventTopics({
    abi: nijiAuctionHouseAbi,
    eventName: 'AuctionBid',
    args: {
      nounId: input.nounId,
    },
  });
  const data = encodeAbiParameters(
    [
      { name: 'sender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'extended', type: 'bool' },
    ],
    [input.sender, input.value, input.extended],
  );
  return {
    address: input.contractAddress,
    topics,
    data,
    // receipt log 型に必要な他 field は test 内で使わないので dummy 埋め
    blockNumber: 100n,
    blockHash: keccak256(toHex('block')),
    transactionHash: STUB_TX_HASH,
    transactionIndex: 0,
    logIndex: 0,
    removed: false,
  };
};

const makeReceiptStub = (input: {
  status: 'success' | 'reverted';
  logs?: Array<ReturnType<typeof encodeAuctionBidLog>>;
}) => ({
  status: input.status,
  blockNumber: 100n,
  blockHash: keccak256(toHex('block')),
  transactionHash: STUB_TX_HASH,
  transactionIndex: 0,
  from: OPERATOR_ADDRESS,
  to: AUCTION_HOUSE_ADDRESS,
  contractAddress: null,
  gasUsed: 200_000n,
  cumulativeGasUsed: 200_000n,
  effectiveGasPrice: 1_000_000_000n,
  logsBloom: '0x' + '0'.repeat(512),
  logs: input.logs ?? [],
  type: 'eip1559' as const,
});

describe('waitForBidConfirmation', () => {
  it('success + AuctionBid event で BidConfirmation を返す', async () => {
    const bidValue = 250_000_000_000_000_000n;
    const nounId = 42n;
    const log = encodeAuctionBidLog({
      nounId,
      sender: OPERATOR_ADDRESS,
      value: bidValue,
      extended: false,
      contractAddress: AUCTION_HOUSE_ADDRESS,
    });
    const receipt = makeReceiptStub({ status: 'success', logs: [log] });
    const publicClient = {
      waitForTransactionReceipt: vi.fn(async () => receipt),
    } as unknown as PublicClient;

    const result = await waitForBidConfirmation({
      publicClient,
      txHash: STUB_TX_HASH,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    expect(result.txHash).toBe(STUB_TX_HASH);
    expect(result.blockNumber).toBe(100n);
    expect(result.nounId).toBe(nounId);
    expect(result.amount).toBe(bidValue);
    expect(result.sender.toLowerCase()).toBe(OPERATOR_ADDRESS.toLowerCase());
  });

  it('receipt.status = "reverted" で BidRelayError', async () => {
    const receipt = makeReceiptStub({ status: 'reverted' });
    const publicClient = {
      waitForTransactionReceipt: vi.fn(async () => receipt),
    } as unknown as PublicClient;

    await expect(
      waitForBidConfirmation({
        publicClient,
        txHash: STUB_TX_HASH,
        auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
      }),
    ).rejects.toBeInstanceOf(BidRelayError);
  });

  it('AuctionBid event なしで BidRelayError (auctionHouse log 0 件)', async () => {
    const receipt = makeReceiptStub({ status: 'success', logs: [] });
    const publicClient = {
      waitForTransactionReceipt: vi.fn(async () => receipt),
    } as unknown as PublicClient;

    await expect(
      waitForBidConfirmation({
        publicClient,
        txHash: STUB_TX_HASH,
        auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
      }),
    ).rejects.toMatchObject({
      name: 'BidRelayError',
      message: expect.stringContaining('AuctionBid event not emitted'),
    });
  });

  it('他 contract の log は無視する (auction house log のみ verify)', async () => {
    // 別 contract に emit された AuctionBid 相当 log は無視され、 event なし error
    const bidValue = 250_000_000_000_000_000n;
    const nonMatchingLog = encodeAuctionBidLog({
      nounId: 42n,
      sender: OPERATOR_ADDRESS,
      value: bidValue,
      extended: false,
      contractAddress: OTHER_CONTRACT,
    });
    const receipt = makeReceiptStub({ status: 'success', logs: [nonMatchingLog] });
    const publicClient = {
      waitForTransactionReceipt: vi.fn(async () => receipt),
    } as unknown as PublicClient;

    await expect(
      waitForBidConfirmation({
        publicClient,
        txHash: STUB_TX_HASH,
        auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
      }),
    ).rejects.toMatchObject({
      name: 'BidRelayError',
      message: expect.stringContaining('AuctionBid event not emitted'),
    });
  });

  it('waitForTransactionReceipt throw で BidRelayError.reason = RpcError', async () => {
    const publicClient = {
      waitForTransactionReceipt: vi.fn(async () => {
        throw new Error('RPC timeout');
      }),
    } as unknown as PublicClient;

    await expect(
      waitForBidConfirmation({
        publicClient,
        txHash: STUB_TX_HASH,
        auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
      }),
    ).rejects.toMatchObject({
      name: 'BidRelayError',
      reason: 'RpcError',
    });
  });

  it('confirmations / timeoutMs 引数を publicClient に伝搬', async () => {
    const bidValue = 250_000_000_000_000_000n;
    const log = encodeAuctionBidLog({
      nounId: 42n,
      sender: OPERATOR_ADDRESS,
      value: bidValue,
      extended: false,
      contractAddress: AUCTION_HOUSE_ADDRESS,
    });
    const receipt = makeReceiptStub({ status: 'success', logs: [log] });
    const waitStub = vi.fn(async () => receipt);
    const publicClient = {
      waitForTransactionReceipt: waitStub,
    } as unknown as PublicClient;

    await waitForBidConfirmation({
      publicClient,
      txHash: STUB_TX_HASH,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
      confirmations: 3,
      timeoutMs: 30_000,
    });

    expect(waitStub).toHaveBeenCalledTimes(1);
    const calls = waitStub.mock.calls as unknown as Array<
      Array<{ hash: string; confirmations: number; timeout: number }>
    >;
    const call = calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.hash).toBe(STUB_TX_HASH);
    expect(call?.confirmations).toBe(3);
    expect(call?.timeout).toBe(30_000);
  });
});
