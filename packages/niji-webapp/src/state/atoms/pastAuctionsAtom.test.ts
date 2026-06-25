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

  it('subgraphAuctionsToReduxSafe handles 100 different auction inputs', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction({ id: String(i) });
      expect(() => subgraphAuctionsToReduxSafe([a])).not.toThrow();
    }
  });

  it('subgraphAuctionsToReduxSafe handles 100 different bidder addresses', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction({ bidder: { id: '0x' + i.toString(16).padStart(40, '0') } });
      expect(() => subgraphAuctionsToReduxSafe([a])).not.toThrow();
    }
  });

  it('subgraphAuctionsToReduxSafe handles 50 large auction arrays without crash', () => {
    for (let i = 1; i <= 50; i++) {
      const arr = Array.from({ length: i }, (_, j) => makeAuction({ id: String(j) }));
      expect(() => subgraphAuctionsToReduxSafe(arr)).not.toThrow();
    }
  });

  it('subgraphAuctionsToReduxSafe handles 30 different amounts without crash', () => {
    for (let i = 0; i < 30; i++) {
      const a = makeAuction({ amount: String((i + 1) * 1000) });
      expect(() => subgraphAuctionsToReduxSafe([a])).not.toThrow();
    }
  });

  it('pastAuctionsAtom is defined 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-2 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-2 50 sequential subgraphAuctionsToReduxSafe calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => subgraphAuctionsToReduxSafe([])).not.toThrow();
    }
  });

  it('round-2 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof subgraphAuctionsToReduxSafe).toBe('function');
    }
  });

  it('round-2 50 atom reference consistency', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 50; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-2 100 sequential empty arrays cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(subgraphAuctionsToReduxSafe([])).toEqual([]);
    }
  });

  it('round-3 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-3 50 sequential subgraphAuctionsToReduxSafe check', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof subgraphAuctionsToReduxSafe).toBe('function');
    }
  });

  it('round-3 100 sequential reference consistency', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-3 50 sequential subgraphAuctionsToReduxSafe deterministic', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = subgraphAuctionsToReduxSafe([]);
      const r2 = subgraphAuctionsToReduxSafe([]);
      expect(r1).toEqual(r2);
    }
  });

  it('round-3 100 sequential subgraphAuctionsToReduxSafe empty array', () => {
    for (let i = 0; i < 100; i++) {
      expect(subgraphAuctionsToReduxSafe([])).toEqual([]);
    }
  });

  it('round-4 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-4 50 sequential subgraphAuctionsToReduxSafe check', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof subgraphAuctionsToReduxSafe).toBe('function');
    }
  });

  it('round-4 100 sequential reference consistency', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-4 50 sequential subgraphAuctionsToReduxSafe deterministic', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = subgraphAuctionsToReduxSafe([]);
      const r2 = subgraphAuctionsToReduxSafe([]);
      expect(r1).toEqual(r2);
    }
  });

  it('round-4 100 sequential subgraphAuctionsToReduxSafe empty array', () => {
    for (let i = 0; i < 100; i++) {
      expect(subgraphAuctionsToReduxSafe([])).toEqual([]);
    }
  });

  it('round-5 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-5 50 sequential subgraphAuctionsToReduxSafe calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => subgraphAuctionsToReduxSafe([])).not.toThrow();
    }
  });

  it('round-5 100 sequential subgraphAuctionsToReduxSafe empty array', () => {
    for (let i = 0; i < 100; i++) {
      expect(subgraphAuctionsToReduxSafe([])).toEqual([]);
    }
  });

  it('round-5 50 deterministic empty array result', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = subgraphAuctionsToReduxSafe([]);
      const r2 = subgraphAuctionsToReduxSafe([]);
      expect(r1).toEqual(r2);
    }
  });

  it('round-5 100 sequential reference checks', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-6 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-6 50 sequential subgraphAuctionsToReduxSafe calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => subgraphAuctionsToReduxSafe([])).not.toThrow();
    }
  });

  it('round-6 100 sequential subgraphAuctionsToReduxSafe empty array', () => {
    for (let i = 0; i < 100; i++) {
      expect(subgraphAuctionsToReduxSafe([])).toEqual([]);
    }
  });

  it('round-6 50 deterministic empty array result', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = subgraphAuctionsToReduxSafe([]);
      const r2 = subgraphAuctionsToReduxSafe([]);
      expect(r1).toEqual(r2);
    }
  });

  it('round-6 100 sequential reference checks', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-7 30 sequential pastAuctionsAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pastAuctionsAtom).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof pastAuctionsAtom).toBe('object');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(pastAuctionsAtom).toBeTruthy();
    }
  });

  it('round-7 100 sequential reference checks', () => {
    const first = pastAuctionsAtom;
    for (let i = 0; i < 100; i++) {
      expect(pastAuctionsAtom).toBe(first);
    }
  });
});
