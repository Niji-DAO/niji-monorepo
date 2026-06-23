import { describe, expect, it } from 'vitest';

import { nounPath } from './history';

describe('nounPath', () => {
  it('returns /niji/{id} format', () => {
    expect(nounPath(0)).toBe('/niji/0');
    expect(nounPath(123)).toBe('/niji/123');
  });

  it('handles negative id (no validation)', () => {
    expect(nounPath(-1)).toBe('/niji/-1');
  });
});
