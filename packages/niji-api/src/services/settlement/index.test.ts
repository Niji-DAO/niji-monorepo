/**
 * SettlementWatcher + TransferRelay behavior test (Issue #3010 Phase A + E)
 *
 * 検証対象 —
 * SettlementWatcher —
 * (1) 通常 ETH winner (運営 EOA ≠ winner) は notification 対象外
 * (2) 運営 EOA が winner + fiat_bid 該当あり → queue.enqueueFiatWinner 呼出 + notified=true
 * (3) 運営 EOA が winner + fiat_bid 該当なし (運営自己 bid) → queue 呼ばず + notified=false
 * (4) address 比較は大文字小文字非依存
 *
 * TransferRelay —
 * (1) happy path — writeContract 呼出 + txHash 返却
 * (2) zero address recipient → TransferRelayError(InvalidRecipient) throw
 * (3) writeContract throw → TransferRelayError(reason classified)
 *
 * classifyTransferError —
 * - "not owner" → NotOwner
 * - "network" → RpcError
 * - "zero address" → InvalidRecipient
 * - unknown → Unknown
 */

import type { PublicClient, WalletClient, Hash, Address } from 'viem';

import { describe, expect, it, vi } from 'vitest';

import {
  SettlementWatcher,
  TransferRelay,
  TransferRelayError,
  classifyTransferError,
  type FiatWinnerRecord,
  type SignerProvider,
} from './index.js';

const operatorEoa = '0x00000000000000000000000000000000000000AA' as Address;
const userWallet = '0x00000000000000000000000000000000000000BB' as Address;
const someWinner = '0x00000000000000000000000000000000000000CC' as Address;

const seededFiatRecord: FiatWinnerRecord = {
  authId: 'mock-access-00000001',
  bidderWallet: userWallet,
  bidderEmail: 'winner@example.com',
  auctionId: 42n,
};

describe('SettlementWatcher.handleAuctionSettled', () => {
  it('通常 ETH winner (運営 EOA ≠ winner) は notification 対象外', async () => {
    const lookupSpy = vi.fn();
    const queueSpy = vi.fn();
    const watcher = new SettlementWatcher({
      operatorEoa,
      lookup: { findFiatWinnerForAuction: lookupSpy },
      queue: { enqueueFiatWinner: queueSpy },
    });

    const result = await watcher.handleAuctionSettled({
      auctionId: 42n,
      winner: someWinner,
    });

    expect(result.notified).toBe(false);
    expect(result.record).toBeNull();
    expect(lookupSpy).not.toHaveBeenCalled();
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it('運営 EOA が winner + fiat_bid 該当あり → queue に enqueue', async () => {
    const lookupSpy = vi.fn(async () => seededFiatRecord);
    const queueSpy = vi.fn(async () => undefined);
    const watcher = new SettlementWatcher({
      operatorEoa,
      lookup: { findFiatWinnerForAuction: lookupSpy },
      queue: { enqueueFiatWinner: queueSpy },
    });

    const result = await watcher.handleAuctionSettled({
      auctionId: 42n,
      winner: operatorEoa,
    });

    expect(result.notified).toBe(true);
    expect(result.record).toEqual(seededFiatRecord);
    expect(lookupSpy).toHaveBeenCalledWith(42n);
    expect(queueSpy).toHaveBeenCalledWith(seededFiatRecord);
  });

  it('運営 EOA が winner + fiat_bid なし (運営自己 bid) → queue 呼ばず', async () => {
    const lookupSpy = vi.fn(async () => null);
    const queueSpy = vi.fn();
    const watcher = new SettlementWatcher({
      operatorEoa,
      lookup: { findFiatWinnerForAuction: lookupSpy },
      queue: { enqueueFiatWinner: queueSpy },
    });

    const result = await watcher.handleAuctionSettled({
      auctionId: 99n,
      winner: operatorEoa,
    });

    expect(result.notified).toBe(false);
    expect(lookupSpy).toHaveBeenCalledWith(99n);
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it('address 比較は大文字小文字非依存', async () => {
    const lookupSpy = vi.fn(async () => seededFiatRecord);
    const queueSpy = vi.fn(async () => undefined);
    const upperOperator = operatorEoa.toUpperCase() as Address;
    const watcher = new SettlementWatcher({
      operatorEoa: upperOperator,
      lookup: { findFiatWinnerForAuction: lookupSpy },
      queue: { enqueueFiatWinner: queueSpy },
    });

    // winner は元の小文字 pattern を lower に変換して比較する想定
    const result = await watcher.handleAuctionSettled({
      auctionId: 42n,
      winner: operatorEoa.toLowerCase() as Address,
    });

    expect(result.notified).toBe(true);
  });
});

describe('classifyTransferError', () => {
  it('recipient エラーで InvalidRecipient', () => {
    expect(classifyTransferError(new Error('ERC721InvalidReceiver'))).toBe('InvalidRecipient');
    expect(classifyTransferError(new Error('zero address'))).toBe('InvalidRecipient');
  });

  it('owner エラーで NotOwner', () => {
    expect(classifyTransferError(new Error('caller is not owner nor approved'))).toBe('NotOwner');
    expect(classifyTransferError(new Error('ERC721IncorrectOwner'))).toBe('NotOwner');
  });

  it('network エラーで RpcError', () => {
    expect(classifyTransferError(new Error('fetch failed'))).toBe('RpcError');
    expect(classifyTransferError(new Error('timeout'))).toBe('RpcError');
  });

  it('unknown → Unknown', () => {
    expect(classifyTransferError(new Error('something weird'))).toBe('Unknown');
  });
});

const nijiTokenAddress = '0x00000000000000000000000000000000000000EE' as Address;

/**
 * WalletClient stub、 writeContract のみ差替
 */
const makeSigner = (behavior: {
  writeContract?: (params: unknown) => Promise<Hash>;
}): SignerProvider => {
  return {
    address: operatorEoa,
    getWalletClient: () =>
      ({
        account: { address: operatorEoa },
        writeContract: behavior.writeContract ?? (async () => '0xabc' as Hash),
      }) as unknown as WalletClient,
  };
};

const stubPublicClient = {} as unknown as PublicClient;

describe('TransferRelay.transferNft', () => {
  it('happy path — writeContract 呼出 + txHash 返却', async () => {
    const stubTxHash = '0xdeadbeef' as Hash;
    const writeSpy = vi.fn(async () => stubTxHash);
    const relay = new TransferRelay({
      signer: makeSigner({ writeContract: writeSpy }),
      publicClient: stubPublicClient,
      nijiTokenAddress,
    });

    const result = await relay.transferNft({ to: userWallet, nounId: 42n });

    expect(result.txHash).toBe(stubTxHash);
    expect(result.to).toBe(userWallet);
    expect(result.nounId).toBe(42n);
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const call = writeSpy.mock.calls[0];
    expect(call).toBeDefined();
    // vitest mock.calls は unknown[][] で型付、 実 runtime では単一 param object を渡している
    const writeArg = (
      call as unknown as [
        {
          functionName: string;
          args: [Address, Address, bigint];
          address: Address;
        },
      ]
    )[0];
    expect(writeArg.functionName).toBe('transferFrom');
    expect(writeArg.args).toEqual([operatorEoa, userWallet, 42n]);
    expect(writeArg.address).toBe(nijiTokenAddress);
  });

  it('zero address recipient で TransferRelayError(InvalidRecipient) throw', async () => {
    const writeSpy = vi.fn();
    const relay = new TransferRelay({
      signer: makeSigner({ writeContract: writeSpy }),
      publicClient: stubPublicClient,
      nijiTokenAddress,
    });

    await expect(
      relay.transferNft({
        to: '0x0000000000000000000000000000000000000000' as Address,
        nounId: 42n,
      }),
    ).rejects.toMatchObject({
      name: 'TransferRelayError',
      reason: 'InvalidRecipient',
    });
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('writeContract throw → TransferRelayError(reason classified)', async () => {
    const relay = new TransferRelay({
      signer: makeSigner({
        writeContract: async () => {
          throw new Error('caller is not owner nor approved');
        },
      }),
      publicClient: stubPublicClient,
      nijiTokenAddress,
    });

    await expect(relay.transferNft({ to: userWallet, nounId: 42n })).rejects.toMatchObject({
      name: 'TransferRelayError',
      reason: 'NotOwner',
    });
  });

  it('rpc error → TransferRelayError(RpcError)', async () => {
    const relay = new TransferRelay({
      signer: makeSigner({
        writeContract: async () => {
          throw new Error('network fetch failed');
        },
      }),
      publicClient: stubPublicClient,
      nijiTokenAddress,
    });

    await expect(relay.transferNft({ to: userWallet, nounId: 42n })).rejects.toMatchObject({
      reason: 'RpcError',
    });
  });

  it('TransferRelayError は re-throw されて classify されない', async () => {
    const inner = new TransferRelayError('custom', { reason: 'InvalidRecipient' });
    const relay = new TransferRelay({
      signer: makeSigner({
        writeContract: async () => {
          throw inner;
        },
      }),
      publicClient: stubPublicClient,
      nijiTokenAddress,
    });

    await expect(relay.transferNft({ to: userWallet, nounId: 42n })).rejects.toBe(inner);
  });
});
