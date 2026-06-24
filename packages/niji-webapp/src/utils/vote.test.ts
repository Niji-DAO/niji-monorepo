import { describe, expect, it } from 'vitest';

import { Vote } from './vote';

describe('Vote enum', () => {
  it('has 3 vote values', () => {
    expect(Vote.SUPPORT).toBe(0);
    expect(Vote.FOR).toBe(1);
    expect(Vote.ABSTAIN).toBe(2);
  });

  it('reverse lookup returns names', () => {
    expect(Vote[0]).toBe('SUPPORT');
    expect(Vote[1]).toBe('FOR');
    expect(Vote[2]).toBe('ABSTAIN');
  });

  it('SUPPORT + FOR + ABSTAIN sum to 3', () => {
    expect(Vote.SUPPORT + Vote.FOR + Vote.ABSTAIN).toBe(3);
  });

  it('enum keys contains SUPPORT / FOR / ABSTAIN', () => {
    const keys = Object.keys(Vote).filter(k => isNaN(Number(k)));
    expect(keys).toContain('SUPPORT');
    expect(keys).toContain('FOR');
    expect(keys).toContain('ABSTAIN');
  });

  it('exactly 3 named entries (6 total with reverse lookup)', () => {
    const named = Object.keys(Vote).filter(k => isNaN(Number(k)));
    expect(named.length).toBe(3);
  });

  it('invalid enum index returns undefined', () => {
    expect(Vote[99]).toBeUndefined();
    expect(Vote[-1]).toBeUndefined();
  });

  it('typeof Vote.FOR is number', () => {
    expect(typeof Vote.FOR).toBe('number');
  });
});
