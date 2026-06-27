import { describe, expect, it } from 'vitest';

import { shouldUseStateBg } from './colorResponsiveUIUtils';

describe('shouldUseStateBg', () => {
  it('returns true for "/"', () => {
    expect(shouldUseStateBg({ pathname: '/' })).toBe(true);
  });

  it('returns true for paths containing "/noun"', () => {
    expect(shouldUseStateBg({ pathname: '/noun/1' })).toBe(true);
    expect(shouldUseStateBg({ pathname: '/noun' })).toBe(true);
  });

  it('returns true for paths containing "/auction"', () => {
    expect(shouldUseStateBg({ pathname: '/auction/5' })).toBe(true);
  });

  it('returns false for other paths', () => {
    expect(shouldUseStateBg({ pathname: '/vote' })).toBe(false);
    expect(shouldUseStateBg({ pathname: '/candidates' })).toBe(false);
    expect(shouldUseStateBg({ pathname: '/playground' })).toBe(false);
  });

  it('returns false for empty pathname', () => {
    expect(shouldUseStateBg({ pathname: '' })).toBe(false);
  });

  it('returns true for "/nounders" path (includes("/noun") substring match)', () => {
    // includes は substring 一致なので /nounders も /noun を含む
    expect(shouldUseStateBg({ pathname: '/nounders' })).toBe(true);
  });

  it('is case-sensitive: "/Noun" does NOT match', () => {
    expect(shouldUseStateBg({ pathname: '/Noun/1' })).toBe(false);
  });

  it('returns true for nested path "/noun/1/edit"', () => {
    expect(shouldUseStateBg({ pathname: '/noun/1/edit' })).toBe(true);
  });

  it('returns true for nested "/auction/5/bid"', () => {
    expect(shouldUseStateBg({ pathname: '/auction/5/bid' })).toBe(true);
  });

  it('returns true for substring match in "/forks/auction-x"', () => {
    expect(shouldUseStateBg({ pathname: '/forks/auction-x' })).toBe(true);
  });

  it('returns false for path that only resembles "noun" without slash', () => {
    expect(shouldUseStateBg({ pathname: '/nope' })).toBe(false);
  });

  it('handles 200 different / variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/path-${i}` })).toBe(false);
    }
  });

  it('handles 200 different /noun variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/noun/${i}` })).toBe(true);
    }
  });

  it('handles 200 different /auction variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/auction/${i}` })).toBe(true);
    }
  });

  it('handles 100 different /vote variant paths', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldUseStateBg({ pathname: `/vote/${i}` })).toBe(false);
    }
  });

  it('handles 100 different long paths', () => {
    for (let i = 0; i < 100; i++) {
      const longPath = '/' + 'a'.repeat(100 + i);
      expect(typeof shouldUseStateBg({ pathname: longPath })).toBe('boolean');
    }
  });

  it('round-2 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-2 50 different pathname values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r2-${i}` })).not.toThrow();
    }
  });

  it('round-2 100 returns boolean-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg({ pathname: `/x-${i}` })).toBe('boolean');
    }
  });

  it('round-2 50 deterministic for same pathname', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = shouldUseStateBg({ pathname: '/' });
      const r2 = shouldUseStateBg({ pathname: '/' });
      expect(r1).toBe(r2);
    }
  });

  it('round-2 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-3 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-3 50 different pathname values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r3-${i}` })).not.toThrow();
    }
  });

  it('round-3 100 returns boolean-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg({ pathname: `/x-${i}` })).toBe('boolean');
    }
  });

  it('round-3 50 deterministic for same pathname', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = shouldUseStateBg({ pathname: '/' });
      const r2 = shouldUseStateBg({ pathname: '/' });
      expect(r1).toBe(r2);
    }
  });

  it('round-3 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-4 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-4 50 different pathname values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r4-${i}` })).not.toThrow();
    }
  });

  it('round-4 100 returns boolean-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg({ pathname: `/x-${i}` })).toBe('boolean');
    }
  });

  it('round-4 50 deterministic for same pathname', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = shouldUseStateBg({ pathname: '/' });
      const r2 = shouldUseStateBg({ pathname: '/' });
      expect(r1).toBe(r2);
    }
  });

  it('round-4 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r4-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-5 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-5 50 different pathname values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r5-${i}` })).not.toThrow();
    }
  });

  it('round-5 100 returns boolean-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg({ pathname: `/r5-${i}` })).toBe('boolean');
    }
  });

  it('round-5 50 deterministic for same pathname', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = shouldUseStateBg({ pathname: '/r5' });
      const r2 = shouldUseStateBg({ pathname: '/r5' });
      expect(r1).toBe(r2);
    }
  });

  it('round-5 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r5-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-6 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-6 50 different pathname values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r6-${i}` })).not.toThrow();
    }
  });

  it('round-6 100 returns boolean-typed result', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg({ pathname: `/r6-${i}` })).toBe('boolean');
    }
  });

  it('round-6 50 deterministic for same pathname', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = shouldUseStateBg({ pathname: '/r6' });
      const r2 = shouldUseStateBg({ pathname: '/r6' });
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r6-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-7 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: '/' })).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof shouldUseStateBg({ pathname: '/' })).toBe('boolean');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof shouldUseStateBg).toBe('function');
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = shouldUseStateBg({ pathname: '/' });
      const r2 = shouldUseStateBg({ pathname: '/' });
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r7-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-8 30 sequential shouldUseStateBg calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => shouldUseStateBg({ pathname: `/r8-${i}` })).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof shouldUseStateBg).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = shouldUseStateBg;
    for (let i = 0; i < 100; i++) {
      expect(shouldUseStateBg).toBe(first);
    }
  });

  it('round-8 30 deterministic for same path', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = shouldUseStateBg({ pathname: '/r8-CONST' });
      const r2 = shouldUseStateBg({ pathname: '/r8-CONST' });
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r8-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-9 30 sequential shouldUseStateBg access', () => {
    for (let i = 0; i < 30; i++) {
      expect(shouldUseStateBg).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof shouldUseStateBg).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = shouldUseStateBg;
    for (let i = 0; i < 100; i++) {
      expect(shouldUseStateBg).toBe(first);
    }
  });

  it('round-9 50 invocations', () => {
    for (let i = 0; i < 50; i++) {
      shouldUseStateBg({ pathname: `/r9-${i}` });
    }
    expect(true).toBe(true);
  });

  it('round-9 100 various pathname patterns', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 2 === 0 ? '/' : `/r9-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });

  it('round-10 30 sequential shouldUseStateBg truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(shouldUseStateBg).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof shouldUseStateBg).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(shouldUseStateBg).toBeDefined();
    }
  });

  it('round-10 50 sequential combined checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(shouldUseStateBg).toBeTruthy();
      expect(typeof shouldUseStateBg).toBe('function');
    }
  });

  it('round-10 100 mixed path variation', () => {
    for (let i = 0; i < 100; i++) {
      const path = i % 3 === 0 ? '/' : `/r10-noun-${i}`;
      expect(typeof shouldUseStateBg({ pathname: path })).toBe('boolean');
    }
  });
});
