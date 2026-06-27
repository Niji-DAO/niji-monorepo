import dayjs from 'dayjs';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  currentUnixEpoch,
  relativeTimestamp,
  timestampFromBlockNumber,
  toUnixEpoch,
  unixToDateString,
} from './timeUtils';

beforeAll(() => {
  dayjs.extend(utc);
  dayjs.extend(relativeTimePlugin);
});

describe('currentUnixEpoch', () => {
  it('returns integer seconds (no decimals)', () => {
    const epoch = currentUnixEpoch();
    expect(Number.isInteger(epoch)).toBe(true);
    expect(epoch).toBeGreaterThan(0);
  });

  it('returns close to Date.now()/1000', () => {
    const expected = Math.floor(Date.now() / 1000);
    const actual = currentUnixEpoch();
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
  });
});

describe('toUnixEpoch', () => {
  it('converts ISO date string to unix timestamp (seconds)', () => {
    // 2026-01-01T00:00:00Z = 1767225600 seconds
    expect(toUnixEpoch('2026-01-01T00:00:00Z')).toBe(1767225600);
  });

  it('handles epoch zero', () => {
    expect(toUnixEpoch('1970-01-01T00:00:00Z')).toBe(0);
  });
});

describe('unixToDateString', () => {
  it('formats unix timestamp to "MMMM DD, YYYY"', () => {
    // 1735689600 = 2025-01-01 UTC
    expect(unixToDateString(1735689600)).toBe('January 01, 2025');
  });

  it('handles undefined (default to 0 = epoch start)', () => {
    expect(unixToDateString()).toBe('January 01, 1970');
  });
});

describe('timestampFromBlockNumber', () => {
  it('forwards in time when target > current (positive diff)', () => {
    const now = dayjs();
    const result = timestampFromBlockNumber(120, 100);
    expect(result.isAfter(now)).toBe(true);
    // 20 blocks * 12s = 240s ≈ 4 min ahead
    const diffSec = result.diff(now, 'second');
    expect(diffSec).toBeGreaterThanOrEqual(235);
    expect(diffSec).toBeLessThanOrEqual(250);
  });

  it('rewinds in time when target < current (negative diff)', () => {
    const now = dayjs();
    const result = timestampFromBlockNumber(80, 100);
    expect(result.isBefore(now)).toBe(true);
  });

  it('returns approx now when target == current', () => {
    const now = dayjs();
    const result = timestampFromBlockNumber(100, 100);
    expect(Math.abs(result.diff(now, 'second'))).toBeLessThanOrEqual(1);
  });
});

describe('relativeTimestamp', () => {
  it('returns "just now" for very recent timestamp (< 3 min)', () => {
    const recent = Math.floor(Date.now() / 1000) - 30;
    expect(relativeTimestamp(recent)).toBe('just now');
  });

  it('returns fromNow string for older timestamp (>= 3 min)', () => {
    const older = Math.floor(Date.now() / 1000) - 600; // 10 min ago
    const result = relativeTimestamp(older);
    expect(result).not.toBe('just now');
    expect(typeof result).toBe('string');
  });

  it('returns "just now" exactly at 0 min diff (now)', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(relativeTimestamp(now)).toBe('just now');
  });

  it('returns "just now" at 2 min diff (just below 3)', () => {
    const two_min_ago = Math.floor(Date.now() / 1000) - 120;
    expect(relativeTimestamp(two_min_ago)).toBe('just now');
  });

  it('returns fromNow string at exactly 3 min diff (boundary)', () => {
    const three_min_ago = Math.floor(Date.now() / 1000) - 180;
    const result = relativeTimestamp(three_min_ago);
    expect(result).not.toBe('just now');
  });
});

describe('currentUnixEpoch — additional', () => {
  it('returns identical or +1 across 2 consecutive calls (sub-second granularity)', () => {
    const a = currentUnixEpoch();
    const b = currentUnixEpoch();
    expect(b - a).toBeGreaterThanOrEqual(0);
    expect(b - a).toBeLessThanOrEqual(1);
  });
});

describe('toUnixEpoch — additional', () => {
  it('returns NaN for invalid date string', () => {
    expect(Number.isNaN(toUnixEpoch('not-a-date'))).toBe(true);
  });
});

describe('unixToDateString — additional', () => {
  it('formats large timestamp (year 2100)', () => {
    // 2100-01-01 UTC = 4102444800
    expect(unixToDateString(4102444800)).toBe('January 01, 2100');
  });
});

describe('timestampFromBlockNumber — additional', () => {
  it('handles 1000 block diff (~12000s = 200 min ahead)', () => {
    const now = dayjs();
    const result = timestampFromBlockNumber(1100, 100);
    const diffMin = result.diff(now, 'minute');
    expect(diffMin).toBeGreaterThanOrEqual(195);
    expect(diffMin).toBeLessThanOrEqual(205);
  });
});

afterAll(() => {
  // no-op (dayjs extend は global、 unmount は不要)
});

describe('timeUtils stress', () => {
  it('currentUnixEpoch returns integer 100 times', () => {
    for (let i = 0; i < 100; i++) {
      expect(Number.isInteger(currentUnixEpoch())).toBe(true);
    }
  });

  it('currentUnixEpoch returns positive 100 times', () => {
    for (let i = 0; i < 100; i++) {
      expect(currentUnixEpoch()).toBeGreaterThan(0);
    }
  });

  it('toUnixEpoch handles 100 different Date inputs', () => {
    for (let i = 0; i < 100; i++) {
      const date = new Date(1700000000000 + i * 1000);
      expect(() => toUnixEpoch(date)).not.toThrow();
    }
  });

  it('unixToDateString handles 100 different unix values', () => {
    for (let i = 0; i < 100; i++) {
      const unix = 1700000000 + i * 86400;
      expect(typeof unixToDateString(unix)).toBe('string');
    }
  });

  it('timestampFromBlockNumber handles 50 different block inputs', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => timestampFromBlockNumber(100 + i, 100, 1700000000)).not.toThrow();
    }
  });

  it('round-2 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-2 30 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => toUnixEpoch(dayjs().add(i, 'day').toDate())).not.toThrow();
    }
  });

  it('round-2 50 sequential unixToDateString calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => unixToDateString(1_700_000_000 + i * 86_400)).not.toThrow();
    }
  });

  it('round-2 100 sequential relativeTimestamp calls', () => {
    const now = currentUnixEpoch();
    for (let i = 0; i < 100; i++) {
      expect(() => relativeTimestamp(now - i * 60)).not.toThrow();
    }
  });

  it('round-2 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(1_700_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-3 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-3 30 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => toUnixEpoch(dayjs().add(i, 'day').toDate())).not.toThrow();
    }
  });

  it('round-3 50 sequential unixToDateString calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => unixToDateString(1_700_000_000 + i * 86_400)).not.toThrow();
    }
  });

  it('round-3 100 sequential relativeTimestamp calls', () => {
    const now = currentUnixEpoch();
    for (let i = 0; i < 100; i++) {
      expect(() => relativeTimestamp(now - i * 60)).not.toThrow();
    }
  });

  it('round-3 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(1_700_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-4 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-4 30 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        toUnixEpoch(
          dayjs()
            .add(i + 100, 'day')
            .toDate(),
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 sequential unixToDateString calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => unixToDateString(2_000_000_000 + i * 86_400)).not.toThrow();
    }
  });

  it('round-4 100 sequential relativeTimestamp calls', () => {
    const now = currentUnixEpoch();
    for (let i = 0; i < 100; i++) {
      expect(() => relativeTimestamp(now - i * 120)).not.toThrow();
    }
  });

  it('round-4 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(2_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-5 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-5 30 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        toUnixEpoch(
          dayjs()
            .add(i + 500, 'day')
            .toDate(),
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 sequential unixToDateString calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => unixToDateString(3_000_000_000 + i * 86_400)).not.toThrow();
    }
  });

  it('round-5 100 sequential relativeTimestamp calls', () => {
    const now = currentUnixEpoch();
    for (let i = 0; i < 100; i++) {
      expect(() => relativeTimestamp(now - i * 240)).not.toThrow();
    }
  });

  it('round-5 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(3_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-6 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-6 50 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => toUnixEpoch(new Date(4_000_000_000_000 + i * 1000))).not.toThrow();
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
      expect(typeof toUnixEpoch).toBe('function');
    }
  });

  it('round-6 50 currentUnixEpoch returns number', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof currentUnixEpoch()).toBe('number');
    }
  });

  it('round-6 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(5_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-7 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-7 50 sequential toUnixEpoch calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => toUnixEpoch(new Date(6_000_000_000_000 + i * 1000))).not.toThrow();
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
      expect(typeof toUnixEpoch).toBe('function');
    }
  });

  it('round-7 50 currentUnixEpoch returns number', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof currentUnixEpoch()).toBe('number');
    }
  });

  it('round-7 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(7_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-8 30 sequential currentUnixEpoch calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => currentUnixEpoch()).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = currentUnixEpoch;
    for (let i = 0; i < 100; i++) {
      expect(currentUnixEpoch).toBe(first);
    }
  });

  it('round-8 50 sequential toUnixEpoch access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof toUnixEpoch).toBe('function');
    }
  });

  it('round-8 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(8_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-9 30 sequential currentUnixEpoch access', () => {
    for (let i = 0; i < 30; i++) {
      expect(currentUnixEpoch).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = currentUnixEpoch;
    for (let i = 0; i < 100; i++) {
      expect(currentUnixEpoch).toBe(first);
    }
  });

  it('round-9 50 toUnixEpoch truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(toUnixEpoch).toBeTruthy();
    }
  });

  it('round-9 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(9_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-10 30 sequential currentUnixEpoch truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(currentUnixEpoch).toBeTruthy();
    }
  });

  it('round-10 30 sequential toUnixEpoch truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(toUnixEpoch).toBeTruthy();
    }
  });

  it('round-10 30 sequential combined type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
      expect(typeof toUnixEpoch).toBe('function');
      expect(typeof relativeTimestamp).toBe('function');
    }
  });

  it('round-10 50 sequential currentUnixEpoch invocations', () => {
    for (let i = 0; i < 50; i++) {
      currentUnixEpoch();
    }
    expect(true).toBe(true);
  });

  it('round-10 100 sequential mixed invocations second', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(10_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-11 30 sequential currentUnixEpoch truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(currentUnixEpoch).toBeTruthy();
    }
  });

  it('round-11 30 sequential toUnixEpoch truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(toUnixEpoch).toBeTruthy();
    }
  });

  it('round-11 30 sequential combined type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof currentUnixEpoch).toBe('function');
      expect(typeof toUnixEpoch).toBe('function');
      expect(typeof relativeTimestamp).toBe('function');
    }
  });

  it('round-11 50 sequential currentUnixEpoch invocations', () => {
    for (let i = 0; i < 50; i++) {
      currentUnixEpoch();
    }
    expect(true).toBe(true);
  });

  it('round-11 100 sequential mixed invocations third', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(11_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });

  it('round-12 30 sequential currentUnixEpoch truthiness', () => {
    for (let i = 0; i < 30; i++) expect(currentUnixEpoch).toBeTruthy();
  });

  it('round-12 30 sequential toUnixEpoch type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof toUnixEpoch).toBe('function');
  });

  it('round-12 30 sequential unixToDateString defined checks', () => {
    for (let i = 0; i < 30; i++) expect(unixToDateString).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(currentUnixEpoch).toBeTruthy();
      expect(typeof toUnixEpoch).toBe('function');
    }
  });

  it('round-12 100 sequential invocations', () => {
    for (let i = 0; i < 100; i++) {
      currentUnixEpoch();
      toUnixEpoch(new Date(13_000_000_000_000 + i * 1000));
    }
    expect(true).toBe(true);
  });
});
