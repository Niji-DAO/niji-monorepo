import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/nijiAssets', () => ({
  NijiImageData: {
    images: {
      special: [{ filename: 'special-cool-special', data: '0x01' }],
      choker: [{ filename: 'choker', data: '0x02' }],
      headphone: [{ filename: 'headphone-pink-headphone', data: '0x03' }],
      leftHand: [{ filename: 'leftHand', data: '0x04' }],
      hat: [{ filename: 'hat-cool', data: '0x05' }],
      clothing: [{ filename: '', data: '0x06' }],
      ear: [{ filename: 'ear-x', data: '0x07' }],
      back: [{ filename: 'back-Y', data: '0x08' }],
      backDecoration: [{ filename: 'backDecoration-z', data: '0x09' }],
      background: [{ filename: '', data: '0x0a' }],
      solidBackground: [{ filename: 'solidBackground', data: '0x0b' }],
      hair: [{ filename: 'hair-rainbow', data: '0x0c' }],
    },
  },
  humanizeTraitKey: (key: string) => {
    if (key === 'leftHand') return 'Left Hand';
    if (key === 'backDecoration') return 'Back Decoration';
    if (key === 'solidBackground') return 'Solid Background';
    return key.charAt(0).toUpperCase() + key.slice(1);
  },
}));

import { traitName } from './traitName';

describe('traitName', () => {
  it('falls back to humanizeTraitKey when filename undefined (out-of-range index)', () => {
    expect(traitName('special', 99)).toBe('Special');
  });

  it('falls back to humanizeTraitKey for leftHand type when filename undefined', () => {
    expect(traitName('leftHand', 99)).toBe('Left Hand');
  });

  it('returns capitalized suffix after first hyphen when filename includes "-"', () => {
    expect(traitName('special', 0)).toBe('Cool Special');
  });

  it('returns full capitalized filename when no hyphen', () => {
    expect(traitName('choker', 0)).toBe('Choker');
  });

  it('handles multi-hyphen filename by taking part after first hyphen', () => {
    expect(traitName('headphone', 0)).toBe('Pink Headphone');
  });

  it('handles single-word filename for leftHand type', () => {
    expect(traitName('leftHand', 0)).toBe('LeftHand');
  });

  it('handles uppercase first letter preservation', () => {
    expect(traitName('hat', 0)).toBe('Cool');
  });

  it('handles empty filename string returns empty (not humanize fallback)', () => {
    expect(traitName('clothing', 0)).toBe('');
  });

  it('handles lowercase suffix after hyphen', () => {
    expect(traitName('ear', 0)).toBe('X');
  });

  it('preserves uppercase suffix characters after hyphen', () => {
    expect(traitName('back', 0)).toBe('Y');
  });

  it('handles compound key backDecoration with hyphen filename', () => {
    expect(traitName('backDecoration', 0)).toBe('Z');
  });

  it('rainbow hair filename returns Rainbow', () => {
    expect(traitName('hair', 0)).toBe('Rainbow');
  });
});
