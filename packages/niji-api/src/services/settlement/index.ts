/**
 * SettlementWatcher + TransferRelay service (Issue #3010 Phase A + E)
 *
 * 責務 —
 * - SettlementWatcher = AuctionSettled event handler、 winner が運営 EOA の場合に fiat_bid record を
 *   lookup + notification queue に enqueue (email 送信 + webapp 通知 trigger)。
 *   indexer と orchestrator を分離、 副作用は queue enqueue のみで別 worker が処理する。
 * - TransferRelay = 運営 EOA から user wallet に NijiToken.transferFrom viem で発火する service。
 *   Issue #3008 BidRelay と類似構造の signer + publicClient + contract address DI。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P7 (A' 案 = settle 後 transferFrom)、
 *        Phase1-02-issue-breakdown.md § Issue 7 Phase A, E,
 *        rules/quality.md § test-passed marker 発行前提
 */

import { nijiTokenAbi } from '@niji/sdk/actions';
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
 * SettlementWatcher — AuctionSettled event を受けて fiat winner を検出する service
 *
 * flow —
 * (1) AuctionSettled event の winner 引数を運営 EOA address と比較
 * (2) winner が運営 EOA なら nounId をキーに fiat_bid record を lookup
 * (3) 該当 record があれば notification queue に enqueue、 別 worker が email + webapp 通知を処理
 * (4) 該当なしなら no-op (通常 ETH winner)
 *
 * indexer 側の event handler は本 service を呼ぶだけで、 副作用 (email 送信 / tx 発火) は queue 経由
 */
export type FiatWinnerRecord = {
  authId: string;
  bidderWallet: `0x${string}`;
  bidderEmail: string | null;
  auctionId: bigint;
};

export type SettlementQueue = {
  /**
   * fiat winner 検出時に notification 対象を queue に enqueue する
   * Phase 1 = in-memory (Ponder サーバ instance 内)、 Phase 3 = SQS / Redis で cross-instance 対応
   */
  enqueueFiatWinner: (record: FiatWinnerRecord) => Promise<void>;
};

export type SettlementLookup = {
  /**
   * nounId をキーに fiat_bid record を lookup、 status が bid-placed のものを返す
   * bid-placed 以外 (cancelled 等) は既に GMO 与信枠 revoked で notification 不要
   */
  findFiatWinnerForAuction: (auctionId: bigint) => Promise<FiatWinnerRecord | null>;
};

export type SettlementWatcherOptions = {
  operatorEoa: Address;
  lookup: SettlementLookup;
  queue: SettlementQueue;
};

export class SettlementWatcher {
  private readonly operatorEoa: Address;
  private readonly lookup: SettlementLookup;
  private readonly queue: SettlementQueue;

  constructor(options: SettlementWatcherOptions) {
    this.operatorEoa = options.operatorEoa.toLowerCase() as Address;
    this.lookup = options.lookup;
    this.queue = options.queue;
  }

  /**
   * AuctionSettled event handler の core logic
   * winner が運営 EOA なら fiat winner の可能性、 fiat_bid lookup で確定
   * lookup miss (winner=operator EOA でも DB に fiat_bid 記録なし) は運営自己 bid で notification 対象外
   */
  async handleAuctionSettled(input: {
    auctionId: bigint;
    winner: Address;
  }): Promise<{ notified: boolean; record: FiatWinnerRecord | null }> {
    const winnerLower = input.winner.toLowerCase() as Address;
    if (winnerLower !== this.operatorEoa) {
      // 通常 ETH winner、 fiat 経路の notification 対象外
      return { notified: false, record: null };
    }

    const record = await this.lookup.findFiatWinnerForAuction(input.auctionId);
    if (record === null) {
      // 運営 EOA が winner だが fiat_bid 該当なし = 運営自己 bid (test / operational 用途)
      return { notified: false, record: null };
    }

    await this.queue.enqueueFiatWinner(record);
    return { notified: true, record };
  }
}

// ============================================================================
// TransferRelay — 運営 EOA から user wallet に NijiToken.transferFrom を発火する service
// ============================================================================

export type SignerProvider = {
  readonly address: Address;
  getWalletClient: () => WalletClient;
};

/**
 * env 変数直読の Signer (Phase 1、 Phase 3 で KMS に置換)
 * BidRelay と共有できる shape だが、 transfer 側でも独立生成できるよう別 export
 */
export const createTransferEnvSigner = (options: {
  privateKey: Hex;
  rpcUrl: string;
}): SignerProvider => {
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

export const createTransferPublicClient = (rpcUrl: string): PublicClient => {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  return client as unknown as PublicClient;
};

export type TransferSuccess = {
  txHash: Hash;
  to: Address;
  nounId: bigint;
};

export type TransferRevertReason = 'InvalidRecipient' | 'NotOwner' | 'RpcError' | 'Unknown';

export class TransferRelayError extends Error {
  public readonly reason: TransferRevertReason;
  constructor(
    message: string,
    options: { reason: TransferRevertReason; cause?: unknown } = { reason: 'Unknown' },
  ) {
    super(message);
    this.name = 'TransferRelayError';
    this.reason = options.reason;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export const classifyTransferError = (err: unknown): TransferRevertReason => {
  const message = err instanceof Error ? err.message : String(err);
  if (/zero address|invalid recipient|erc721invalidreceiver/i.test(message))
    return 'InvalidRecipient';
  if (/not owner|not approved|erc721incorrectowner|caller is not/i.test(message)) return 'NotOwner';
  if (/network|fetch|econn|timeout|rpc/i.test(message)) return 'RpcError';
  return 'Unknown';
};

export type TransferRelayOptions = {
  signer: SignerProvider;
  publicClient: PublicClient;
  /** NijiToken (ERC-721) contract address (Base Sepolia) */
  nijiTokenAddress: Address;
};

export class TransferRelay {
  private readonly signer: SignerProvider;
  private readonly publicClient: PublicClient;
  private readonly nijiTokenAddress: Address;

  constructor(options: TransferRelayOptions) {
    this.signer = options.signer;
    this.publicClient = options.publicClient;
    this.nijiTokenAddress = options.nijiTokenAddress;
  }

  /**
   * NijiToken.transferFrom(operator, to, nounId) を broadcast
   * 運営 EOA が保有する nounId を user wallet に転送する
   */
  async transferNft(input: { to: Address; nounId: bigint }): Promise<TransferSuccess> {
    if (input.to === '0x0000000000000000000000000000000000000000') {
      throw new TransferRelayError('recipient is zero address', { reason: 'InvalidRecipient' });
    }

    let txHash: Hash;
    try {
      const walletClient = this.signer.getWalletClient();
      const account = walletClient.account;
      if (account === undefined) {
        throw new TransferRelayError('signer WalletClient missing account', { reason: 'Unknown' });
      }
      txHash = await walletClient.writeContract({
        account,
        chain: baseSepolia,
        address: this.nijiTokenAddress,
        abi: nijiTokenAbi,
        functionName: 'transferFrom',
        args: [this.signer.address, input.to, input.nounId],
      });
    } catch (err) {
      if (err instanceof TransferRelayError) throw err;
      throw new TransferRelayError('transferFrom broadcast failed', {
        reason: classifyTransferError(err),
        cause: err,
      });
    }

    return {
      txHash,
      to: input.to,
      nounId: input.nounId,
    };
  }

  get client(): PublicClient {
    return this.publicClient;
  }

  get tokenAddress(): Address {
    return this.nijiTokenAddress;
  }
}
