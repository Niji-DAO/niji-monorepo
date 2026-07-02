/**
 * BidRelay service (Issue #3008 Phase A + B + C)
 *
 * 運営 EOA が代理で NijiAuctionHouseV3.createBid tx を発火する service。
 *
 * fiat bidder は 3DS 認証で fiat_bid.status = "3ds-verified" 状態、
 * 本 service が chain 上で bid tx を broadcast、 tx hash 取得 + 1 block confirm で fiat_bid.status = "bid-placed"。
 * tx revert (BidTooLow / AuctionEnded / gas 高騰 / RPC 障害) 時は GMO alterTran cancel + fiat_bid.status = "cancelled"。
 *
 * 秘密鍵管理 —
 * Phase 1 = env 変数 (OPERATOR_EOA_PRIVATE_KEY) 直、 SignerProvider interface で抽象化。
 * Phase 3 = KmsSigner (AWS KMS) に置換予定、 interface 定義で移行時 scope 最小化。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P3-c, P6、
 *        Phase1-02-issue-breakdown.md § Issue 5、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { nijiAuctionHouseAbi } from '@niji/sdk/actions';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
  type Hex,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

/**
 * Signer 抽象 (Phase 1 = EnvSigner env 直読、 Phase 3 = KmsSigner に置換)
 * address 取得 + tx sign の 2 method で運営 EOA を代理する
 */
export type SignerProvider = {
  readonly address: Address;
  /** 現在の Signer instance を wrap した viem WalletClient を返す (実 broadcast 用) */
  getWalletClient: () => WalletClient;
};

/**
 * Phase 1 = env 変数直読の Signer 実装
 * OPERATOR_EOA_PRIVATE_KEY を privateKeyToAccount に渡して WalletClient を生成
 */
export const createEnvSigner = (options: { privateKey: Hex; rpcUrl: string }): SignerProvider => {
  const account = privateKeyToAccount(options.privateKey);
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(options.rpcUrl),
  });
  return {
    address: account.address,
    getWalletClient: () => walletClient,
  };
};

/**
 * PublicClient factory (chain read + wait for receipt に使う)
 * test では stub PublicClient を options で DI
 * baseSepolia の chain-specific 型は generic PublicClient と unification できないため
 * unknown as PublicClient で intentional widen (BidRelay 内で必要 method のみ使う)
 */
export const createBaseSepoliaPublicClient = (rpcUrl: string): PublicClient => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  return client as unknown as PublicClient;
};

/** bid tx broadcast 結果 (fiat_bid.status = "bid-placed" 遷移用) */
export type PlaceBidSuccess = {
  txHash: Hash;
  /** chain 上の auction ID (BidPlaced event verify で使う) */
  auctionId: bigint;
  /** bid 額 (wei、 記録用) */
  ethAmount: bigint;
};

/** bid tx revert 理由の enum (GMO cancel + user 通知 msg を分岐) */
export type BidRevertReason =
  | 'BidTooLow'
  | 'AuctionEnded'
  | 'GasPriceHigh'
  | 'RpcError'
  | 'Unknown';

/**
 * bid tx broadcast fail を意味する error
 * revert 理由 + 元 error を保持、 handler 層が GMO cancel + user 通知 msg 選択に使う
 */
export class BidRelayError extends Error {
  public readonly reason: BidRevertReason;
  constructor(
    message: string,
    options: { reason: BidRevertReason; cause?: unknown } = { reason: 'Unknown' },
  ) {
    super(message);
    this.name = 'BidRelayError';
    this.reason = options.reason;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/** viem error message から revert 理由を推定 (Phase 1 = string match、 Phase 2 で custom error decode に強化) */
export const classifyBidError = (err: unknown): BidRevertReason => {
  const message = err instanceof Error ? err.message : String(err);
  if (/bidtoolow|must send more/i.test(message)) return 'BidTooLow';
  if (/auctionended|auction expired|auction has ended/i.test(message)) return 'AuctionEnded';
  if (/gas price|underpriced|replacement transaction/i.test(message)) return 'GasPriceHigh';
  if (/network|fetch|econn|timeout|rpc/i.test(message)) return 'RpcError';
  return 'Unknown';
};

export type BidRelayOptions = {
  /** 運営 EOA (Phase 1 = createEnvSigner の返値、 test = stub) */
  signer: SignerProvider;
  /** chain read + wait receipt 用 (test = stub PublicClient) */
  publicClient: PublicClient;
  /** NijiAuctionHouseV3 contract address (Base Sepolia、 未 deploy 環境は 0x0 で env から後で差替) */
  auctionHouseAddress: Address;
};

/**
 * BidRelay service — 運営 EOA が代理で NijiAuctionHouseV3.createBid tx を発火する
 *
 * flow —
 * (1) 現在の auction ID を chain から取得 (nijiAuctionHouseAbi.auction() view call)
 * (2) createBid(nounId) を bid value = ethAmount で broadcast
 * (3) tx hash を返却 (handler が fiat_bid.status = "bid-placed" UPDATE)
 * (4) 別 method waitForBidConfirmation で 1 block confirm + BidPlaced event verify
 *
 * error handling —
 * broadcast 失敗 or receipt status = "reverted" で BidRelayError throw、 handler が GMO cancel + user 通知
 */
export class BidRelay {
  private readonly signer: SignerProvider;
  private readonly publicClient: PublicClient;
  private readonly auctionHouseAddress: Address;

  constructor(options: BidRelayOptions) {
    this.signer = options.signer;
    this.publicClient = options.publicClient;
    this.auctionHouseAddress = options.auctionHouseAddress;
  }

  /**
   * 現在の auction を chain から取得
   * NijiAuctionHouseV3.auction() は AuctionV2View struct を返す (nounId / amount / startTime / endTime / bidder / settled)
   * 本 service では nounId のみ使う (createBid target)
   */
  async getCurrentAuctionId(): Promise<bigint> {
    // readContract で auction() struct を取得、 nounId は uint96 だが JS bigint で受ける
    const result = (await this.publicClient.readContract({
      address: this.auctionHouseAddress,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as {
      nounId: bigint;
      amount: bigint;
      startTime: number;
      endTime: number;
      bidder: Address;
      settled: boolean;
    };
    return result.nounId;
  }

  /**
   * bid tx を broadcast、 tx hash を返す
   * revert / broadcast 失敗は BidRelayError throw
   *
   * @param input.ethAmount bid 額 (wei)
   * @returns { txHash, auctionId, ethAmount }
   */
  async placeBid(input: { ethAmount: bigint }): Promise<PlaceBidSuccess> {
    let auctionId: bigint;
    try {
      auctionId = await this.getCurrentAuctionId();
    } catch (err) {
      throw new BidRelayError('failed to read current auction id', {
        reason: classifyBidError(err),
        cause: err,
      });
    }

    // createBid(nounId) を writeContract で broadcast、 value = ethAmount で運営 EOA から送信
    // NijiAuctionHouseV3 は payable createBid、 msg.sender = 運営 EOA が chain 上 bidder として記録される
    // (fiat bidder wallet ≠ chain 上 bidder、 settle 後の transferFrom で fiat bidder wallet に NFT 送る 2 段構成)
    //
    // NijiAuctionHouseV3 abi は createBid が 2 overload (uint256 / uint256,uint32) を持つが、
    // writeContract は functionName + args 数で overload 解決するので明示 disambiguation 不要
    // (single-arg 呼出 = createBid(uint256) が選択される)。
    let txHash: Hash;
    try {
      const walletClient = this.signer.getWalletClient();
      const account = walletClient.account;
      if (account === undefined) {
        throw new BidRelayError('signer WalletClient missing account', { reason: 'Unknown' });
      }
      txHash = await walletClient.writeContract({
        account,
        chain: baseSepolia,
        address: this.auctionHouseAddress,
        abi: nijiAuctionHouseAbi,
        functionName: 'createBid',
        args: [auctionId],
        value: input.ethAmount,
      });
    } catch (err) {
      if (err instanceof BidRelayError) throw err;
      throw new BidRelayError('bid tx broadcast failed', {
        reason: classifyBidError(err),
        cause: err,
      });
    }

    return {
      txHash,
      auctionId,
      ethAmount: input.ethAmount,
    };
  }

  /** publicClient (watchReceipt が使う) */
  get client(): PublicClient {
    return this.publicClient;
  }

  /** auctionHouse address (watchReceipt が event source として使う) */
  get auctionHouse(): Address {
    return this.auctionHouseAddress;
  }
}
