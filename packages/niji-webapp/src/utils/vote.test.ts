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
});
