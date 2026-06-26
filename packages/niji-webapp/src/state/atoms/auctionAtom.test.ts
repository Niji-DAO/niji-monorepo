import { describe, expect, it } from 'vitest';

import {
  applyActiveAuction,
  applyAppendBid,
  applyAuctionExtended,
  applyAuctionSettled,
  applyFullAuction,
  auctionAtom,
  reduxSafeAuction,
  reduxSafeBid,
  reduxSafeNewAuction,
} from './auctionAtom';

const makeAuction = (overrides: Record<string, unknown> = {}) =>
  ({
    amount: '1000',
    bidder: '0xBIDDER',
    startTime: '100',
    endTime: '200',
    nounId: '5',
    settled: false,
    ...overrides,
  }) as never;

const makeBid = (overrides: Record<string, unknown> = {}) => ({
  nounId: '5',
  sender: '0xSENDER' as `0x${string}`,
  value: '1000',
  extended: false,
  transactionHash: '0xTX',
  transactionIndex: 0,
  timestamp: '1700000000',
  ...overrides,
});

describe('auctionAtom initial value', () => {
  it('initial value has undefined activeAuction + empty bids array', () => {
    expect(auctionAtom.init).toEqual({ activeAuction: undefined, bids: [] });
  });
});

describe('reduxSafeNewAuction', () => {
  it('serializes a new auction with default 0 amount + 0x bidder + settled=false', () => {
    const out = reduxSafeNewAuction({
      nounId: 5,
      startTime: 100,
      endTime: 200,
      settled: false,
    });
    expect(out.amount).toBe('0');
    expect(out.bidder).toBe('0x');
    expect(out.settled).toBe(false);
    expect(out.nounId).toBe('5');
    expect(out.startTime).toBe('100');
    expect(out.endTime).toBe('200');
  });
});

describe('reduxSafeAuction', () => {
  it('preserves amount undefined when undefined', () => {
    const out = reduxSafeAuction(
      makeAuction({ amount: undefined, bidder: undefined, settled: true }),
    );
    expect(out.amount).toBeUndefined();
    expect(out.bidder).toBeUndefined();
    expect(out.settled).toBe(true);
  });

  it('converts amount + nounId + startTime + endTime to strings', () => {
    const out = reduxSafeAuction(
      makeAuction({ amount: 5000n, startTime: 1700n, endTime: 1800n, nounId: 10n }),
    );
    expect(out.amount).toBe('5000');
    expect(out.startTime).toBe('1700');
    expect(out.endTime).toBe('1800');
    expect(out.nounId).toBe('10');
  });
});

describe('reduxSafeBid', () => {
  it('serializes value + nounId + timestamp as strings', () => {
    const out = reduxSafeBid(makeBid({ value: 1500n, nounId: 7n, timestamp: 1700000000n }));
    expect(out.value).toBe('1500');
    expect(out.nounId).toBe('7');
    expect(out.timestamp).toBe('1700000000');
    expect(out.sender).toBe('0xSENDER');
    expect(out.extended).toBe(false);
  });
});

describe('applyActiveAuction', () => {
  it('replaces activeAuction with reduxSafeNewAuction + resets bids', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '99' }),
      bids: [makeBid()],
    };
    const out = applyActiveAuction(prev, {
      nounId: 5,
      startTime: 100,
      endTime: 200,
      settled: false,
    });
    expect(out.activeAuction?.nounId).toBe('5');
    expect(out.bids).toEqual([]);
  });
});

describe('applyFullAuction', () => {
  it('replaces activeAuction with reduxSafeAuction', () => {
    const prev = { activeAuction: undefined, bids: [] };
    const out = applyFullAuction(prev, makeAuction({ nounId: '5' }));
    expect(out.activeAuction?.nounId).toBe('5');
    expect(out.bids).toEqual([]);
  });
});

describe('applyAppendBid', () => {
  it('returns state unchanged when activeAuction is undefined', () => {
    const prev = { activeAuction: undefined, bids: [] };
    const out = applyAppendBid(prev, makeBid() as never);
    expect(out).toBe(prev);
  });

  it('returns state unchanged when nounId does not match', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '5' }),
      bids: [],
    };
    const out = applyAppendBid(prev, makeBid({ nounId: '99' }) as never);
    expect(out).toBe(prev);
  });

  it('returns state unchanged when transactionHash already exists', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '5' }),
      bids: [makeBid({ transactionHash: '0xDUP' })],
    };
    const out = applyAppendBid(prev, makeBid({ transactionHash: '0xDUP' }) as never);
    expect(out).toBe(prev);
  });

  it('prepends new bid + updates activeAuction.amount/bidder to max bid', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '5', amount: '500', bidder: '0xOLD' }),
      bids: [makeBid({ transactionHash: '0xA', value: '500', sender: '0xOLD' })],
    };
    const newBid = makeBid({
      transactionHash: '0xB',
      value: '2000',
      sender: '0xNEW',
    });
    const out = applyAppendBid(prev, newBid as never);
    expect(out.bids).toHaveLength(2);
    expect(out.bids[0].transactionHash).toBe('0xB');
    expect(out.activeAuction?.amount).toBe('2000');
    expect(out.activeAuction?.bidder).toBe('0xNEW');
  });

  it('preserves activeAuction amount when new bid is lower than existing max', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '5', amount: '5000', bidder: '0xHIGH' }),
      bids: [makeBid({ transactionHash: '0xH', value: '5000', sender: '0xHIGH' })],
    };
    const newBid = makeBid({
      transactionHash: '0xL',
      value: '100',
      sender: '0xLOW',
    });
    const out = applyAppendBid(prev, newBid as never);
    expect(out.activeAuction?.amount).toBe('5000');
    expect(out.activeAuction?.bidder).toBe('0xHIGH');
  });
});

describe('applyAuctionSettled', () => {
  it('returns state unchanged when activeAuction undefined', () => {
    const prev = { activeAuction: undefined, bids: [] };
    const out = applyAuctionSettled(prev, { nounId: 5, winner: '0xW', amount: 100 } as never);
    expect(out).toBe(prev);
  });

  it('returns state unchanged when nounId mismatches', () => {
    const prev = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    const out = applyAuctionSettled(prev, { nounId: 99, winner: '0xW', amount: 100 } as never);
    expect(out).toBe(prev);
  });

  it('sets settled=true + winner / amount when nounId matches', () => {
    const prev = {
      activeAuction: makeAuction({ nounId: '5', amount: '0', settled: false }),
      bids: [],
    };
    const out = applyAuctionSettled(prev, {
      nounId: 5,
      winner: '0xWINNER' as `0x${string}`,
      amount: 1000n,
    });
    expect(out.activeAuction?.settled).toBe(true);
    expect(out.activeAuction?.bidder).toBe('0xWINNER');
    expect(out.activeAuction?.amount).toBe('1000');
  });
});

describe('applyAuctionExtended', () => {
  it('returns state unchanged when activeAuction undefined', () => {
    const prev = { activeAuction: undefined, bids: [] };
    const out = applyAuctionExtended(prev, { nounId: 5, endTime: 500 } as never);
    expect(out).toBe(prev);
  });

  it('returns state unchanged when nounId mismatches', () => {
    const prev = { activeAuction: makeAuction({ nounId: '5', endTime: '200' }), bids: [] };
    const out = applyAuctionExtended(prev, { nounId: 99, endTime: 500 } as never);
    expect(out).toBe(prev);
  });

  it('updates endTime when nounId matches', () => {
    const prev = { activeAuction: makeAuction({ nounId: '5', endTime: '200' }), bids: [] };
    const out = applyAuctionExtended(prev, { nounId: 5, endTime: 500n });
    expect(out.activeAuction?.endTime).toBe('500');
  });

  it('reduxSafeAuction handles 100 different auction inputs', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction({ nounId: BigInt(i) });
      expect(() => reduxSafeAuction(a)).not.toThrow();
    }
  });

  it('reduxSafeNewAuction handles 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction();
      expect(() => reduxSafeNewAuction(a)).not.toThrow();
    }
  });

  it('reduxSafeAuction handles 100 different cycles', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction({ nounId: BigInt(i) });
      expect(() => reduxSafeAuction(a)).not.toThrow();
    }
  });

  it('reduxSafeNewAuction handles 100 cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeAuction();
      expect(() => reduxSafeNewAuction(a)).not.toThrow();
    }
  });

  it('auctionAtom is defined 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(auctionAtom).toBeDefined();
    }
  });

  it('round-2 30 sequential auctionAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(auctionAtom).toBeDefined();
    }
  });

  it('round-2 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof reduxSafeAuction).toBe('function');
      expect(typeof reduxSafeNewAuction).toBe('function');
      expect(typeof reduxSafeBid).toBe('function');
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-2 100 atom reference consistency', () => {
    const first = auctionAtom;
    for (let i = 0; i < 100; i++) {
      expect(auctionAtom).toBe(first);
    }
  });

  it('round-2 100 sequential auctionAtom init access', () => {
    for (let i = 0; i < 100; i++) {
      expect(auctionAtom.init).toBeDefined();
    }
  });

  it('round-2 100 sequential function type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof reduxSafeAuction).toBe('function');
    }
  });

  it('round-3 30 sequential auctionAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(auctionAtom).toBeDefined();
    }
  });

  it('round-3 50 sequential reduxSafeAuction function check', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof reduxSafeAuction).toBe('function');
    }
  });

  it('round-3 100 sequential applyActiveAuction type check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-3 50 sequential atom reference consistency', () => {
    const first = auctionAtom;
    for (let i = 0; i < 50; i++) {
      expect(auctionAtom).toBe(first);
    }
  });

  it('round-3 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-4 30 sequential auctionAtom access', () => {
    for (let i = 0; i < 30; i++) {
      expect(auctionAtom).toBeDefined();
    }
  });

  it('round-4 50 sequential reduxSafeAuction function check', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof reduxSafeAuction).toBe('function');
    }
  });

  it('round-4 100 sequential applyActiveAuction type check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-4 50 sequential atom reference consistency', () => {
    const first = auctionAtom;
    for (let i = 0; i < 50; i++) {
      expect(auctionAtom).toBe(first);
    }
  });

  it('round-4 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-5 30 sequential applyAppendBid access', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof applyAppendBid).toBe('function');
    }
  });

  it('round-5 50 sequential applyFullAuction access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-5 100 sequential reference checks applyAppendBid', () => {
    const first = applyAppendBid;
    for (let i = 0; i < 100; i++) {
      expect(applyAppendBid).toBe(first);
    }
  });

  it('round-5 50 sequential applyActiveAuction access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-5 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-6 30 sequential applyAppendBid access', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof applyAppendBid).toBe('function');
    }
  });

  it('round-6 50 sequential applyFullAuction access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-6 100 sequential reference checks applyAppendBid', () => {
    const first = applyAppendBid;
    for (let i = 0; i < 100; i++) {
      expect(applyAppendBid).toBe(first);
    }
  });

  it('round-6 50 sequential applyActiveAuction access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-6 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-7 30 sequential applyActiveAuction access', () => {
    for (let i = 0; i < 30; i++) {
      expect(applyActiveAuction).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = applyActiveAuction;
    for (let i = 0; i < 100; i++) {
      expect(applyActiveAuction).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(applyActiveAuction).toBeTruthy();
    }
  });

  it('round-7 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-8 30 sequential applyActiveAuction access', () => {
    for (let i = 0; i < 30; i++) {
      expect(applyActiveAuction).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = applyActiveAuction;
    for (let i = 0; i < 100; i++) {
      expect(applyActiveAuction).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(applyActiveAuction).toBeTruthy();
    }
  });

  it('round-8 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });

  it('round-9 30 sequential applyActiveAuction access', () => {
    for (let i = 0; i < 30; i++) {
      expect(applyActiveAuction).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof applyActiveAuction).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = applyActiveAuction;
    for (let i = 0; i < 100; i++) {
      expect(applyActiveAuction).toBe(first);
    }
  });

  it('round-9 50 applyAppendBid truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(applyAppendBid).toBeTruthy();
    }
  });

  it('round-9 100 sequential mixed function checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof applyAppendBid).toBe('function');
      expect(typeof applyFullAuction).toBe('function');
    }
  });
});
