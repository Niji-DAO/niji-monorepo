import { describe, expect, it } from 'vitest';

import { pastAuctionsAtom, subgraphAuctionsToReduxSafe } from './pastAuctionsAtom';

const makeAuction = (overrides: Record<string, unknown> = {}) => ({
  amount: '1000',
  bidder: { id: '0xBIDDER' },
  startTime: '100',
  endTime: '200',
  id: '5',
  bids: [],
  ...overrides,
});

const makeBid = (overrides: Record<string, unknown> = {}) => ({
  amount: '500',
  bidder: { id: '0xSENDER' },
  txHash: '0xTX',
  txIndex: 0,
  blockTimestamp: '1700000000',
  ...overrides,
});

describe('pastAuctionsAtom', () => {
  it('initial value is empty array', () => {
    expect(pastAuctionsAtom.init).toEqual([]);
  });
});

describe('subgraphAuctionsToReduxSafe', () => {
  it('returns empty array when data.auctions undefined', () => {
    const out = subgraphAuctionsToReduxSafe({ auctions: undefined } as never);
    expect(out).toEqual([]);
  });

  it('converts auction fields BigInt-strings + settled=false', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ amount: '5000', startTime: '700', endTime: '800', id: '10' })],
    } as never);
    expect(out).toHaveLength(1);
    expect(out[0].activeAuction?.amount).toBe('5000');
    expect(out[0].activeAuction?.startTime).toBe('700');
    expect(out[0].activeAuction?.endTime).toBe('800');
    expect(out[0].activeAuction?.nounId).toBe('10');
    expect(out[0].activeAuction?.settled).toBe(false);
  });

  it('preserves amount=undefined when null', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ amount: null })],
    } as never);
    expect(out[0].activeAuction?.amount).toBeUndefined();
  });

  it('preserves bidder=undefined when null', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ bidder: null })],
    } as never);
    expect(out[0].activeAuction?.bidder).toBeUndefined();
  });

  it('maps bidder.id to bidder Address', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ bidder: { id: '0xALICE' } })],
    } as never);
    expect(out[0].activeAuction?.bidder).toBe('0xALICE');
  });

  it('converts bids array (sender / value / timestamp)', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [
        makeAuction({
          bids: [
            makeBid({
              amount: '1500',
              bidder: { id: '0xBOB' },
              txHash: '0xTX1',
              blockTimestamp: '1700000001',
            }),
          ],
        }),
      ],
    } as never);
    expect(out[0].bids).toHaveLength(1);
    expect(out[0].bids[0].value).toBe('1500');
    expect(out[0].bids[0].sender).toBe('0xBOB');
    expect(out[0].bids[0].transactionHash).toBe('0xTX1');
    expect(out[0].bids[0].timestamp).toBe('1700000001');
  });

  it('processes multiple auctions independently', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ id: '1' }), makeAuction({ id: '2' }), makeAuction({ id: '3' })],
    } as never);
    expect(out).toHaveLength(3);
    expect(out.map(a => a.activeAuction?.nounId)).toEqual(['1', '2', '3']);
  });

  it('returns auction with empty bids when bids=[]', () => {
    const out = subgraphAuctionsToReduxSafe({
      auctions: [makeAuction({ bids: [] })],
    } as never);
    expect(out[0].bids).toEqual([]);
  });
});
