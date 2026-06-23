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
});

afterAll(() => {
  // no-op (dayjs extend は global、 unmount は不要)
});
