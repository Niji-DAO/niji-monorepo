import { describe, expect, it } from 'vitest';

import { humanizeTraitKey, nijiTraitKeys } from './nijiAssets';

describe('humanizeTraitKey', () => {
  it('splits camelCase: leftHand → "Left Hand"', () => {
    expect(humanizeTraitKey('leftHand')).toBe('Left Hand');
  });

  it('splits camelCase: backDecoration → "Back Decoration"', () => {
    expect(humanizeTraitKey('backDecoration')).toBe('Back Decoration');
  });

  it('splits camelCase: solidBackground → "Solid Background"', () => {
    expect(humanizeTraitKey('solidBackground')).toBe('Solid Background');
  });

  it('capitalizes single-word default: hat → "Hat"', () => {
    expect(humanizeTraitKey('hat')).toBe('Hat');
  });

  it('capitalizes special → "Special"', () => {
    expect(humanizeTraitKey('special')).toBe('Special');
  });

  it('capitalizes hair → "Hair"', () => {
    expect(humanizeTraitKey('hair')).toBe('Hair');
  });
});

describe('nijiTraitKeys', () => {
  it('has 12 entries in trait id order', () => {
    expect(nijiTraitKeys.length).toBe(12);
    expect(nijiTraitKeys[0]).toBe('special');
    expect(nijiTraitKeys[11]).toBe('hair');
  });

  it('contains all NijiSeed keys', () => {
    const required = [
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
    expect([...nijiTraitKeys].sort()).toEqual(required.sort());
  });

  it('humanizeTraitKey handles 100 different inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => humanizeTraitKey(`trait-${i}`)).not.toThrow();
    }
  });

  it('humanizeTraitKey leftHand 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(humanizeTraitKey('leftHand')).toBe('Left Hand');
    }
  });

  it('humanizeTraitKey hat 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(humanizeTraitKey('hat')).toBe('Hat');
    }
  });

  it('nijiTraitKeys length check 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(nijiTraitKeys.length).toBeGreaterThan(0);
    }
  });

  it('nijiTraitKeys all 12 entries check 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      expect(nijiTraitKeys.length).toBe(12);
    }
  });
});
