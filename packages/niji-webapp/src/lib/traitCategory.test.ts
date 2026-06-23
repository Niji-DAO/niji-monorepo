import { describe, expect, it } from 'vitest';

import { traitCategory } from './traitCategory';

describe('traitCategory', () => {
  it('contains all expected niji trait keys', () => {
    const expected = [
      'special',
      'choker',
      'headphone',
      'leftHand',
      'hat',
      'clothing',
      'ear',
      'back',
      'backDecoration',
      'background',
      'solidBackground',
      'hair',
    ];
    expect(Object.keys(traitCategory).sort()).toEqual([...expected].sort());
  });

  it('maps each key to its own name (identity map)', () => {
    for (const [k, v] of Object.entries(traitCategory)) {
      expect(v).toBe(k);
    }
  });

  it('does not contain stale Nouns-original keys (accessory / body / glasses)', () => {
    expect(traitCategory).not.toHaveProperty('accessory');
    expect(traitCategory).not.toHaveProperty('body');
    expect(traitCategory).not.toHaveProperty('glasses');
  });

  it('exposes exactly 12 keys', () => {
    expect(Object.keys(traitCategory).length).toBe(12);
  });
});
