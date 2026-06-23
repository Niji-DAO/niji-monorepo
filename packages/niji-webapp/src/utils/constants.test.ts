import { describe, expect, it } from 'vitest';

import { AVERAGE_BLOCK_TIME_IN_SECS } from './constants';

describe('constants', () => {
  it('exports AVERAGE_BLOCK_TIME_IN_SECS as 12', () => {
    expect(AVERAGE_BLOCK_TIME_IN_SECS).toBe(12);
  });
});
