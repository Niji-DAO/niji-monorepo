import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { currentUnixEpoch, toUnixEpoch, unixToDateString } from './timeUtils';

beforeAll(() => {
  dayjs.extend(utc);
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

afterAll(() => {
  // no-op (dayjs extend は global、 unmount は不要)
});
