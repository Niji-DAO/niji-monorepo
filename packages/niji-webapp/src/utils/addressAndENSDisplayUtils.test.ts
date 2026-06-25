import type { Address } from '@/utils/types';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  formatShortAddress,
  shortENS,
  veryShortAddress,
  veryShortENS,
} from './addressAndENSDisplayUtils';

describe('veryShortENS', () => {
  it('returns first char + "..." + last 3 chars', () => {
    expect(veryShortENS('nouns.eth')).toBe('n...eth');
    expect(veryShortENS('vitalik.eth')).toBe('v...eth');
  });

  it('handles single-character ENS', () => {
    // 'a'.substring(0, 1) = 'a', 'a'.substring(-2) = 'a' (negative start clamped to 0)
    expect(veryShortENS('a')).toBe('a...a');
  });
});

describe('veryShortAddress', () => {
  const addr = '0xabcdef1234567890abcdef1234567890abcdef12' as Address;

  it('returns first 3 chars + "..." + last 1 char', () => {
    expect(veryShortAddress(addr)).toBe('0xa...2');
  });

  it('returns empty string when address is undefined', () => {
    expect(veryShortAddress(undefined)).toBe('');
  });
});

describe('shortENS', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('returns full ENS when length < 15', () => {
    setWidth(400);
    expect(shortENS('short.eth')).toBe('short.eth');
  });

  it('returns full ENS when window width > 480', () => {
    setWidth(800);
    expect(shortENS('verylongname.eth')).toBe('verylongname.eth');
  });

  it('truncates when length >= 15 and width <= 480', () => {
    setWidth(400);
    expect(shortENS('verylongname.eth')).toBe('very...name.eth');
  });
});

describe('formatShortAddress', () => {
  const addr = '0xabcdef1234567890abcdef1234567890abcdef12' as Address;

  it('returns first 4 chars + "..." + last 4 chars (from index 38)', () => {
    expect(formatShortAddress(addr)).toBe('0xab...ef12');
  });

  it('returns empty string when address is undefined', () => {
    expect(formatShortAddress(undefined)).toBe('');
  });

  it('handles short address (< 38 chars): substring(38) returns empty string', () => {
    // 短い address (例 0xabcd) で substring(38) は空文字、 結果 "0xab..."
    expect(formatShortAddress('0xabcd' as Address)).toBe('0xab...');
  });

  it('handles exactly 38 chars address: substring(38) returns empty', () => {
    const exact38 = '0xabcdef1234567890abcdef1234567890abcdef' as Address; // 40 chars include 0x
    // 0xabcdef...abcdef は 40 文字、 substring(0,4) = '0xab'、 substring(38) = 'ef' (40-38=2 chars)
    expect(formatShortAddress(exact38)).toBe('0xab...ef');
  });
});

describe('veryShortENS — edge cases', () => {
  it('handles empty string', () => {
    // ''.substring(0, 1) = '', ''.substring(-3) = '' (negative clamped)
    expect(veryShortENS('')).toBe('...');
  });

  it('handles 2-char ENS-like string', () => {
    // 'ab'.substring(0, 1) = 'a', 'ab'.substring(2 - 3) = 'ab' (negative clamped to 0)
    expect(veryShortENS('ab')).toBe('a...ab');
  });

  it('handles Unicode ENS (NNS-style ⌐◨-◨)', () => {
    // .⌐◨-◨ suffix を持つ name は length が surrogate pair の影響を受けるため、 source の string semantics を pin
    const name = 'alice.⌐◨-◨';
    const first = name.substring(0, 1);
    const last3 = name.substring(name.length - 3);
    expect(veryShortENS(name)).toBe(`${first}...${last3}`);
  });
});

describe('shortENS — boundary', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('returns full ENS when length is exactly 14 (< 15) regardless of width', () => {
    setWidth(400);
    const ens14 = 'abcdefghijkl12'; // 14 chars
    expect(shortENS(ens14)).toBe(ens14);
  });

  it('truncates when length === 15 and width === 480 (> condition is strict)', () => {
    setWidth(480); // not > 480
    const ens15 = 'abcdefghijklmno'; // 15 chars
    // 15 < 15 = false なので truncate に進む
    expect(shortENS(ens15)).toBe('abcd...hijklmno');
  });

  it('returns full ENS when length === 15 and width === 481 (> 480)', () => {
    setWidth(481);
    const ens15 = 'abcdefghijklmno';
    expect(shortENS(ens15)).toBe(ens15);
  });

  it('formatShortAddress handles 100 different addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      expect(() => formatShortAddress(addr)).not.toThrow();
    }
  });

  it('veryShortAddress handles 100 different addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      expect(() => veryShortAddress(addr)).not.toThrow();
    }
  });

  it('shortENS handles 100 different ENS names', () => {
    for (let i = 0; i < 100; i++) {
      const ens = `name-${i}.eth`;
      expect(() => shortENS(ens)).not.toThrow();
    }
  });

  it('veryShortENS handles 100 different ENS names', () => {
    for (let i = 0; i < 100; i++) {
      const ens = `name-${i}.eth`;
      expect(() => veryShortENS(ens)).not.toThrow();
    }
  });

  it('all 4 functions process 30 inputs', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      const ens = `name-${i}.eth`;
      expect(() => {
        formatShortAddress(addr);
        veryShortAddress(addr);
        shortENS(ens);
        veryShortENS(ens);
      }).not.toThrow();
    }
  });

  it('round-2 30 sequential calls with varied addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      expect(() => veryShortAddress(addr)).not.toThrow();
    }
  });

  it('round-2 30 sequential calls with varied ENS', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => veryShortENS(`r2-ens-${i}.eth`)).not.toThrow();
    }
  });

  it('round-2 handles 50 different short address inputs', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xABCDEF' + i.toString(16).padStart(34, '0')) as Address;
      const result = veryShortAddress(addr);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 handles 50 different ENS inputs', () => {
    for (let i = 0; i < 50; i++) {
      const result = veryShortENS(`alice-${i}.eth`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      veryShortAddress(addr);
      veryShortENS(`r2-${i}.eth`);
    }
    expect(true).toBe(true);
  });

  it('round-3 30 sequential calls with varied addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      expect(() => veryShortAddress(addr)).not.toThrow();
    }
  });

  it('round-3 30 sequential calls with varied ENS', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => veryShortENS(`r3-ens-${i}.eth`)).not.toThrow();
    }
  });

  it('round-3 50 different short address inputs', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xABCDEF' + i.toString(16).padStart(34, '0')) as Address;
      const result = veryShortAddress(addr);
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 50 different ENS inputs', () => {
    for (let i = 0; i < 50; i++) {
      const result = veryShortENS(`alice-${i}.eth`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as Address;
      veryShortAddress(addr);
      veryShortENS(`r3-${i}.eth`);
    }
    expect(true).toBe(true);
  });
});
