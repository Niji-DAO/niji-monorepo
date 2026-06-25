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

  it('traitCategory key count check 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(Object.keys(traitCategory).length).toBe(12);
    }
  });

  it('traitCategory has special key 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect('special' in traitCategory).toBe(true);
    }
  });

  it('traitCategory has hat key 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect('hat' in traitCategory).toBe(true);
    }
  });

  it('traitCategory has background key 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect('background' in traitCategory).toBe(true);
    }
  });

  it('all 12 trait keys exist 50 cycles', () => {
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
    for (let i = 0; i < 50; i++) {
      expected.forEach(key => {
        expect(key in traitCategory).toBe(true);
      });
    }
  });
});
