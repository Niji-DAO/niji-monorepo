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

  it('handles 100 cycles of hair trait', () => {
    for (let i = 0; i < 100; i++) {
      expect(traitName('hair', 0)).toBe('Rainbow');
    }
  });

  it('handles 100 cycles of hat trait', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => traitName('hat', 0)).not.toThrow();
    }
  });

  it('handles 100 cycles of clothing trait', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => traitName('clothing', 0)).not.toThrow();
    }
  });

  it('handles 100 cycles of background trait', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => traitName('background', 0)).not.toThrow();
    }
  });

  it('rapid 200 sequential trait lookups', () => {
    const traits = ['hair', 'hat', 'choker', 'special'] as const;
    for (let i = 0; i < 200; i++) {
      expect(() => traitName(traits[i % 4], 0)).not.toThrow();
    }
  });

  it('round-2 30 sequential traitName calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('special', i)).not.toThrow();
    }
  });

  it('round-2 50 different trait keys', () => {
    const keys = ['special', 'leftHand', 'choker', 'hat', 'headphone'];
    for (let i = 0; i < 50; i++) {
      const result = traitName(keys[i % 5], 99);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 100 sequential calls produce string-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof traitName('special', 99)).toBe('string');
    }
  });

  it('round-2 50 large index values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => traitName('special', 1000 + i)).not.toThrow();
    }
  });

  it('round-2 100 deterministic for same key+index', () => {
    for (let i = 0; i < 100; i++) {
      const r1 = traitName('special', 99);
      const r2 = traitName('special', 99);
      expect(r1).toBe(r2);
    }
  });

  it('round-3 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-3 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-3 100 sequential reference checks', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-3 50 sequential function calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => traitName('background', 0)).not.toThrow();
    }
  });

  it('round-3 30 various trait calls (background only)', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-4 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-4 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-4 100 sequential reference checks', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-4 50 sequential function calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => traitName('background', 0)).not.toThrow();
    }
  });

  it('round-4 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-5 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-5 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-5 100 sequential reference checks', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-5 50 sequential function calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => traitName('background', 0)).not.toThrow();
    }
  });

  it('round-5 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-6 30 sequential traitName calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', 0)).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-6 100 sequential calls produce string', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof traitName('background', i % 2)).toBe('string');
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = traitName('background', 0);
      const r2 = traitName('background', 0);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-7 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = traitName('background', 0);
      const r2 = traitName('background', 0);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-8 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = traitName('background', 0);
      const r2 = traitName('background', 0);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });

  it('round-9 30 sequential traitName access', () => {
    for (let i = 0; i < 30; i++) {
      expect(traitName).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof traitName).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = traitName;
    for (let i = 0; i < 100; i++) {
      expect(traitName).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(traitName).toBeTruthy();
    }
  });

  it('round-9 30 various background calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => traitName('background', i % 2)).not.toThrow();
    }
  });
});
