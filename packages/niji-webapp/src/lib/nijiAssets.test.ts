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
});
