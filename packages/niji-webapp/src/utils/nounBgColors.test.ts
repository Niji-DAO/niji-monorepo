import { describe, expect, it } from 'vitest';

import { beige, grey } from './nounBgColors';

describe('nounBgColors', () => {
  it('exports grey hex code', () => {
    expect(grey).toBe('#d5d7e1');
  });

  it('exports beige hex code', () => {
    expect(beige).toBe('#e1d7d5');
  });

  it('grey and beige are distinct', () => {
    expect(grey).not.toBe(beige);
  });
});
