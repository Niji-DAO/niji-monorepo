import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const atomValues: {
  auction: { activeAuction: unknown; bids: unknown[] };
  onDisplay: number | undefined;
  pastAuctions: unknown[] | undefined;
  lastNounId: number | undefined;
} = {
  auction: { activeAuction: undefined, bids: [] },
  onDisplay: undefined,
  pastAuctions: [],
  lastNounId: undefined,
};

vi.mock('jotai/react', () => ({
  useAtomValue: (atom: { tag: string }) => {
    if (atom.tag === 'auction') return atomValues.auction;
    if (atom.tag === 'onDisplay') return atomValues.onDisplay;
    if (atom.tag === 'pastAuctions') return atomValues.pastAuctions;
    if (atom.tag === 'lastNounId') return atomValues.lastNounId;
    return undefined;
  },
}));

vi.mock('@/state/atoms/auctionAtom', () => ({
  auctionAtom: { tag: 'auction' },
}));

vi.mock('@/state/atoms/onDisplayAuctionAtom', () => ({
  onDisplayAuctionNounIdAtom: { tag: 'onDisplay' },
  lastAuctionNounIdAtom: { tag: 'lastNounId' },
}));

vi.mock('@/state/atoms/pastAuctionsAtom', () => ({
  pastAuctionsAtom: { tag: 'pastAuctions' },
}));

vi.mock('@/utils/compareBids', () => ({
  compareBids: (a: { value: bigint }, b: { value: bigint }) => Number(b.value - a.value),
}));

const isNounderNijiMock = vi.fn();
const generateEmptyNounderAuctionMock = vi.fn();
vi.mock('@/utils/nounderNiji', () => ({
  isNounderNiji: (n: bigint) => isNounderNijiMock(n),
  generateEmptyNounderAuction: (n: bigint, past: unknown) =>
    generateEmptyNounderAuctionMock(n, past),
}));

import useOnDisplayAuction, { useAuctionBids } from './onDisplayAuction';

const makeAuction = (overrides: Record<string, unknown> = {}) => ({
  amount: '1000',
  bidder: '0xBIDDER',
  startTime: '0',
  endTime: '100',
  nounId: '5',
  settled: false,
  ...overrides,
});

const makeBid = (overrides: Record<string, unknown> = {}) => ({
  nounId: '5',
  sender: '0xSENDER',
  value: '1000',
  extended: false,
  transactionHash: '0xtx',
  transactionIndex: 0,
  timestamp: '1700000000',
  ...overrides,
});

beforeEach(() => {
  atomValues.auction = { activeAuction: undefined, bids: [] };
  atomValues.onDisplay = undefined;
  atomValues.pastAuctions = [];
  atomValues.lastNounId = undefined;
  isNounderNijiMock.mockReset();
  isNounderNijiMock.mockReturnValue(false);
  generateEmptyNounderAuctionMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useOnDisplayAuction', () => {
  it('returns undefined when onDisplayAuctionNounId is undefined', () => {
    atomValues.auction = { activeAuction: makeAuction(), bids: [] };
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when activeAuction is missing', () => {
    atomValues.onDisplay = 5;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current).toBeUndefined();
  });

  it('returns deserialized current auction when onDisplay equals lastAuctionNounId', () => {
    atomValues.auction = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    atomValues.onDisplay = 5;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current?.nounId).toBe(5n);
    expect(result.current?.amount).toBe(1000n);
    expect(result.current?.bidder).toBe('0xBIDDER');
  });

  it('uses isNounderNiji + generateEmptyNounderAuction for nounder ID', () => {
    isNounderNijiMock.mockReturnValue(true);
    generateEmptyNounderAuctionMock.mockReturnValue(makeAuction({ nounId: '10' }));
    atomValues.auction = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    atomValues.onDisplay = 10;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(generateEmptyNounderAuctionMock).toHaveBeenCalled();
    expect(result.current?.nounId).toBe(10n);
  });

  it('finds past auction matching nounId', () => {
    atomValues.auction = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    atomValues.onDisplay = 3;
    atomValues.pastAuctions = [{ activeAuction: makeAuction({ nounId: '3' }) }];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current?.nounId).toBe(3n);
  });

  it('returns undefined when past auction not found', () => {
    atomValues.auction = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    atomValues.onDisplay = 99;
    atomValues.pastAuctions = [{ activeAuction: makeAuction({ nounId: '3' }) }];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current).toBeUndefined();
  });
});

describe('useAuctionBids', () => {
  it('returns sorted bids for active auction (lastAuctionNounId match)', () => {
    atomValues.lastNounId = 5;
    atomValues.auction = {
      activeAuction: makeAuction(),
      bids: [makeBid({ value: '500' }), makeBid({ value: '1500' }), makeBid({ value: '1000' })],
    };
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useAuctionBids(5n));
    expect(result.current?.[0].value).toBe(1500n);
    expect(result.current?.[1].value).toBe(1000n);
    expect(result.current?.[2].value).toBe(500n);
  });

  it('returns undefined for past auction not in pastAuctions', () => {
    atomValues.lastNounId = 5;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useAuctionBids(99n));
    expect(result.current).toBeUndefined();
  });

  it('returns deserialized past auction bids when present', () => {
    atomValues.lastNounId = 5;
    atomValues.pastAuctions = [
      {
        activeAuction: makeAuction({ nounId: '3' }),
        bids: [makeBid({ value: '2000' })],
      },
    ];
    const { result } = renderHook(() => useAuctionBids(3n));
    expect(result.current?.length).toBe(1);
    expect(result.current?.[0].value).toBe(2000n);
    expect(result.current?.[0].nounId).toBe(5n);
  });

  it('deserialized bid has BigInt timestamp', () => {
    atomValues.lastNounId = 5;
    atomValues.auction = {
      activeAuction: makeAuction(),
      bids: [makeBid({ timestamp: '1700000000' })],
    };
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useAuctionBids(5n));
    expect(result.current?.[0].timestamp).toBe(1700000000n);
  });

  it('deserialized bid retains sender + transactionHash + extended flag', () => {
    atomValues.lastNounId = 5;
    atomValues.auction = {
      activeAuction: makeAuction(),
      bids: [makeBid({ sender: '0xALICE', transactionHash: '0xABCDEF', extended: true })],
    };
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useAuctionBids(5n));
    expect(result.current?.[0].sender).toBe('0xALICE');
    expect(result.current?.[0].transactionHash).toBe('0xABCDEF');
    expect(result.current?.[0].extended).toBe(true);
  });

  it('returns empty array when active auction has zero bids', () => {
    atomValues.lastNounId = 5;
    atomValues.auction = { activeAuction: makeAuction(), bids: [] };
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useAuctionBids(5n));
    expect(result.current).toEqual([]);
  });

  it('handles past auction with empty bids array', () => {
    atomValues.lastNounId = 5;
    atomValues.pastAuctions = [{ activeAuction: makeAuction({ nounId: '3' }), bids: [] }];
    const { result } = renderHook(() => useAuctionBids(3n));
    expect(result.current).toEqual([]);
  });
});

describe('useOnDisplayAuction additional cases', () => {
  it('returns undefined when pastAuctions is undefined', () => {
    atomValues.auction = { activeAuction: makeAuction({ nounId: '5' }), bids: [] };
    atomValues.onDisplay = 5;
    atomValues.pastAuctions = undefined;
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current).toBeUndefined();
  });

  it('current auction deserialized with settled=false (always reset)', () => {
    atomValues.auction = {
      activeAuction: makeAuction({ nounId: '5', settled: true }),
      bids: [],
    };
    atomValues.onDisplay = 5;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current?.settled).toBe(false);
  });

  it('deserialized auction has BigInt startTime/endTime', () => {
    atomValues.auction = {
      activeAuction: makeAuction({ nounId: '5', startTime: '100', endTime: '500' }),
      bids: [],
    };
    atomValues.onDisplay = 5;
    atomValues.pastAuctions = [];
    const { result } = renderHook(() => useOnDisplayAuction());
    expect(result.current?.startTime).toBe(100n);
    expect(result.current?.endTime).toBe(500n);
  });

  it('handles 50 different nounIds in active auction', () => {
    for (let i = 0; i < 50; i++) {
      atomValues.auction = {
        activeAuction: makeAuction({ nounId: String(i), startTime: '0', endTime: '100' }),
        bids: [],
      };
      atomValues.onDisplay = i;
      atomValues.pastAuctions = [];
      const { result } = renderHook(() => useOnDisplayAuction());
      expect(result.current?.nounId).toBe(BigInt(i));
    }
  });

  it('handles 50 different bid counts', () => {
    for (let i = 0; i < 50; i++) {
      atomValues.auction = {
        activeAuction: makeAuction({ nounId: '5', startTime: '0', endTime: '100' }),
        bids: Array.from({ length: i }, (_, j) => ({ id: String(j) })),
      };
      atomValues.onDisplay = 5;
      atomValues.pastAuctions = [];
      expect(() => renderHook(() => useOnDisplayAuction())).not.toThrow();
    }
  });

  it('handles 30 undefined onDisplay cycles', () => {
    for (let i = 0; i < 30; i++) {
      atomValues.auction = { activeAuction: undefined, bids: [] };
      atomValues.onDisplay = undefined;
      atomValues.pastAuctions = [];
      expect(() => renderHook(() => useOnDisplayAuction())).not.toThrow();
    }
  });

  it('handles 30 different pastAuctions counts', () => {
    for (let i = 0; i < 30; i++) {
      atomValues.auction = {
        activeAuction: makeAuction({ nounId: String(i + 1000), startTime: '0', endTime: '100' }),
        bids: [],
      };
      atomValues.onDisplay = i;
      atomValues.pastAuctions = Array.from({ length: i }, (_, j) => ({
        nounId: String(j),
        startTime: '0',
        endTime: '100',
      }));
      expect(() => renderHook(() => useOnDisplayAuction())).not.toThrow();
    }
  });

  it('handles 50 different startTime values', () => {
    for (let i = 0; i < 50; i++) {
      atomValues.auction = {
        activeAuction: makeAuction({
          nounId: '5',
          startTime: String(i * 100),
          endTime: String(i * 100 + 1000),
        }),
        bids: [],
      };
      atomValues.onDisplay = 5;
      atomValues.pastAuctions = [];
      const { result } = renderHook(() => useOnDisplayAuction());
      expect(result.current?.startTime).toBe(BigInt(i * 100));
    }
  });

  it('round-2 30 renderHook cycles useOnDisplayAuction', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useOnDisplayAuction());
      unmount();
    }
  });

  it('round-2 30 renderHook cycles useAuctionBids', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useAuctionBids(BigInt(i)));
      unmount();
    }
  });

  it('round-2 50 useAuctionBids cycles varied nounIds', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useAuctionBids(BigInt(i + 100)));
      unmount();
    }
  });

  it('round-2 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useOnDisplayAuction())).not.toThrow();
      expect(() => renderHook(() => useAuctionBids(BigInt(i)))).not.toThrow();
    }
  });

  it('round-2 100 sequential mixed renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } =
        i % 2 === 0
          ? renderHook(() => useOnDisplayAuction())
          : renderHook(() => useAuctionBids(BigInt(i)));
      unmount();
    }
  });
});
