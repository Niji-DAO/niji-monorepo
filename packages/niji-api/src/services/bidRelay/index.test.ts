/**
 * BidRelay service behavior test (Issue #3008 Phase D)
 *
 * 検証対象 —
 * (1) placeBid happy path — auction() view call → createBid writeContract → txHash 返却
 * (2) placeBid revert — writeContract throw で BidRelayError.reason = 分類 reason
 * (3) getCurrentAuctionId — auction() view call の nounId 抽出
 * (4) classifyBidError — 各 revert 文言に対して正しい BidRevertReason を返す
 *
 * viem PublicClient / WalletClient は class 実装が公開されていないため、
 * SignerProvider interface + PublicClient interface を stub object で差替える。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠 (behavior test / 変更箇所 execute / test runner PASS)。
 */

import { describe, expect, it, vi } from 'vitest';

import { BidRelay, BidRelayError, classifyBidError, type SignerProvider } from './index.js';

/** viem PublicClient の必要 method のみ持つ stub 型 (readContract) */
type PublicClientLike = {
  readContract: ReturnType<typeof vi.fn>;
};

/** viem WalletClient の必要 method のみ持つ stub 型 (writeContract / account) */
type WalletClientLike = {
  account: { address: `0x${string}` };
  writeContract: ReturnType<typeof vi.fn>;
};

const OPERATOR_ADDRESS: `0x${string}` = '0x1234567890123456789012345678901234567890';
const AUCTION_HOUSE_ADDRESS: `0x${string}` = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const makeSigner = (walletClient: WalletClientLike): SignerProvider => ({
  address: OPERATOR_ADDRESS,
  // viem WalletClient 型と厳密一致しないが、 本 test は writeContract / account のみ使う
  getWalletClient: () => walletClient as unknown as ReturnType<SignerProvider['getWalletClient']>,
});

const mockAuctionResult = {
  nounId: 42n,
  amount: 100_000_000_000_000_000n,
  startTime: 1720000000,
  endTime: 1720086400,
  bidder: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  settled: false,
};

describe('classifyBidError', () => {
  it('BidTooLow 系文言を BidTooLow に分類', () => {
    expect(classifyBidError(new Error('reverted: BidTooLow()'))).toBe('BidTooLow');
    expect(classifyBidError(new Error('Must send more than reserve price'))).toBe('BidTooLow');
  });

  it('AuctionEnded 系文言を AuctionEnded に分類', () => {
    expect(classifyBidError(new Error('AuctionEnded()'))).toBe('AuctionEnded');
    expect(classifyBidError(new Error('Auction has ended'))).toBe('AuctionEnded');
    expect(classifyBidError(new Error('Auction expired'))).toBe('AuctionEnded');
  });

  it('gas 高騰系文言を GasPriceHigh に分類', () => {
    expect(classifyBidError(new Error('gas price too low'))).toBe('GasPriceHigh');
    expect(classifyBidError(new Error('transaction underpriced'))).toBe('GasPriceHigh');
    expect(classifyBidError(new Error('replacement transaction underpriced'))).toBe('GasPriceHigh');
  });

  it('RPC 系文言を RpcError に分類', () => {
    expect(classifyBidError(new Error('fetch failed'))).toBe('RpcError');
    expect(classifyBidError(new Error('ECONNREFUSED'))).toBe('RpcError');
    expect(classifyBidError(new Error('request timeout'))).toBe('RpcError');
    expect(classifyBidError(new Error('RPC error 500'))).toBe('RpcError');
  });

  it('未分類文言を Unknown に分類', () => {
    expect(classifyBidError(new Error('something unexpected'))).toBe('Unknown');
    expect(classifyBidError('bare string error')).toBe('Unknown');
    expect(classifyBidError(null)).toBe('Unknown');
  });
});

describe('BidRelay.getCurrentAuctionId', () => {
  it('auction() view call の nounId を返す', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract: vi.fn(),
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    const auctionId = await relay.getCurrentAuctionId();
    expect(auctionId).toBe(42n);

    expect(readContract).toHaveBeenCalledTimes(1);
    const calls = readContract.mock.calls as unknown as Array<
      Array<{ address: string; functionName: string }>
    >;
    const call = calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.address).toBe(AUCTION_HOUSE_ADDRESS);
    expect(call?.functionName).toBe('auction');
  });
});

describe('BidRelay.placeBid', () => {
  const bidAmount = 250_000_000_000_000_000n; // 0.25 ETH wei
  const stubTxHash = '0xdeadbeef000000000000000000000000000000000000000000000000000000ff' as const;

  it('happy path — auction ID 取得 → writeContract → txHash 返却', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const writeContract = vi.fn(async () => stubTxHash);
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract,
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    const result = await relay.placeBid({ ethAmount: bidAmount });

    expect(result.txHash).toBe(stubTxHash);
    expect(result.auctionId).toBe(42n);
    expect(result.ethAmount).toBe(bidAmount);

    // readContract で auction() 取得、 writeContract で createBid broadcast
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(writeContract).toHaveBeenCalledTimes(1);
    const writeCalls = writeContract.mock.calls as unknown as Array<
      Array<{
        address: string;
        functionName: string;
        args: bigint[];
        value: bigint;
      }>
    >;
    const writeCall = writeCalls[0]?.[0];
    expect(writeCall).toBeDefined();
    expect(writeCall?.address).toBe(AUCTION_HOUSE_ADDRESS);
    expect(writeCall?.functionName).toBe('createBid');
    // 単一引数 = createBid(uint256) overload 選択、 args = [auctionId]
    expect(writeCall?.args).toEqual([42n]);
    expect(writeCall?.value).toBe(bidAmount);
  });

  it('writeContract throw で BidRelayError.reason=BidTooLow', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const writeContract = vi.fn(async () => {
      throw new Error('execution reverted: BidTooLow()');
    });
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract,
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    await expect(relay.placeBid({ ethAmount: bidAmount })).rejects.toMatchObject({
      name: 'BidRelayError',
      reason: 'BidTooLow',
    });
  });

  it('writeContract throw で BidRelayError.reason=AuctionEnded', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const writeContract = vi.fn(async () => {
      throw new Error('execution reverted: AuctionEnded()');
    });
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract,
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    await expect(relay.placeBid({ ethAmount: bidAmount })).rejects.toMatchObject({
      name: 'BidRelayError',
      reason: 'AuctionEnded',
    });
  });

  it('readContract fail で BidRelayError (auction id 取得 fail)', async () => {
    const readContract = vi.fn(async () => {
      throw new Error('RPC network error');
    });
    const writeContract = vi.fn();
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract,
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    await expect(relay.placeBid({ ethAmount: bidAmount })).rejects.toMatchObject({
      name: 'BidRelayError',
      reason: 'RpcError',
    });
    // writeContract は呼ばれない
    expect(writeContract).not.toHaveBeenCalled();
  });

  it('WalletClient.account 欠損で BidRelayError', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const writeContract = vi.fn();
    const publicClient: PublicClientLike = { readContract };
    // account なし WalletClient
    const walletClient = {
      account: undefined,
      writeContract,
    };
    const relay = new BidRelay({
      signer: {
        address: OPERATOR_ADDRESS,
        getWalletClient: () =>
          walletClient as unknown as ReturnType<SignerProvider['getWalletClient']>,
      },
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    await expect(relay.placeBid({ ethAmount: bidAmount })).rejects.toBeInstanceOf(BidRelayError);
    expect(writeContract).not.toHaveBeenCalled();
  });

  it('unknown revert 文言で BidRelayError.reason=Unknown', async () => {
    const readContract = vi.fn(async () => mockAuctionResult);
    const writeContract = vi.fn(async () => {
      throw new Error('mysterious internal error');
    });
    const publicClient: PublicClientLike = { readContract };
    const walletClient: WalletClientLike = {
      account: { address: OPERATOR_ADDRESS },
      writeContract,
    };
    const relay = new BidRelay({
      signer: makeSigner(walletClient),
      publicClient: publicClient as unknown as import('viem').PublicClient,
      auctionHouseAddress: AUCTION_HOUSE_ADDRESS,
    });

    await expect(relay.placeBid({ ethAmount: bidAmount })).rejects.toMatchObject({
      name: 'BidRelayError',
      reason: 'Unknown',
    });
  });
});
