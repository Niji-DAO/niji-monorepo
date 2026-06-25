import { describe, expect, it } from 'vitest';

import {
  basicFadeInOut,
  desktopModalSlideInFromTopAndGrow,
  mobileModalSlideInFromBottm,
} from './cssTransitionUtils';

describe('basicFadeInOut', () => {
  it('has all 4 transition styles (enter/entered/exiting/exited)', () => {
    expect(basicFadeInOut.enteringStyle).toEqual({ opacity: 1 });
    expect(basicFadeInOut.enteredStyle).toEqual({ opacity: 1 });
    expect(basicFadeInOut.exitingStyle).toEqual({ opacity: 0.5 });
    expect(basicFadeInOut.exitedStyle).toEqual({ opacity: 0 });
  });
});

describe('mobileModalSlideInFromBottm', () => {
  it('has 4 transition styles defined', () => {
    expect(mobileModalSlideInFromBottm.enteringStyle).toBeDefined();
    expect(mobileModalSlideInFromBottm.enteredStyle).toBeDefined();
    expect(mobileModalSlideInFromBottm.exitingStyle).toBeDefined();
    expect(mobileModalSlideInFromBottm.exitedStyle).toBeDefined();
  });

  it('enteringStyle includes translateY(0rem) and scale(1)', () => {
    expect(mobileModalSlideInFromBottm.enteringStyle.transform).toContain('translateY(0rem)');
    expect(mobileModalSlideInFromBottm.enteringStyle.transform).toContain('scale(1)');
  });

  it('exitingStyle uses translateY(20rem) and scale(0.9)', () => {
    expect(mobileModalSlideInFromBottm.exitingStyle.transform).toBe('translateY(20rem) scale(0.9)');
  });
});

describe('desktopModalSlideInFromTopAndGrow', () => {
  it('has 4 transition styles defined', () => {
    expect(desktopModalSlideInFromTopAndGrow.enteringStyle).toBeDefined();
    expect(desktopModalSlideInFromTopAndGrow.enteredStyle).toBeDefined();
    expect(desktopModalSlideInFromTopAndGrow.exitingStyle).toBeDefined();
    expect(desktopModalSlideInFromTopAndGrow.exitedStyle).toBeDefined();
  });

  it('exitingStyle uses translateY(-1rem) and scale(0)', () => {
    expect(desktopModalSlideInFromTopAndGrow.exitingStyle.transform).toBe(
      'translateY(-1rem) scale(0)',
    );
  });

  it('enteringStyle uses opacity 1', () => {
    expect(desktopModalSlideInFromTopAndGrow.enteringStyle.opacity).toBe(1);
  });
});

describe('basicFadeInOut — extra opacity contract', () => {
  it('opacity sequence: enter/entered=1, exiting=0.5, exited=0 (3-stage fade)', () => {
    // 中間 exitingStyle で 0.5 を経由する design contract を pin
    expect(basicFadeInOut.enteringStyle.opacity).toBe(1);
    expect(basicFadeInOut.enteredStyle.opacity).toBe(1);
    expect(basicFadeInOut.exitingStyle.opacity).toBe(0.5);
    expect(basicFadeInOut.exitedStyle.opacity).toBe(0);
  });

  it('all opacity values are numeric (no string-encoded values)', () => {
    expect(typeof basicFadeInOut.enteringStyle.opacity).toBe('number');
    expect(typeof basicFadeInOut.enteredStyle.opacity).toBe('number');
    expect(typeof basicFadeInOut.exitingStyle.opacity).toBe('number');
    expect(typeof basicFadeInOut.exitedStyle.opacity).toBe('number');
  });

  it('does NOT include transform / transition (opacity-only fade contract)', () => {
    // basicFadeInOut は opacity だけで動く軽量 fade、 transform/transition は含まない
    expect(basicFadeInOut.enteringStyle.transform).toBeUndefined();
    expect(basicFadeInOut.enteringStyle.transition).toBeUndefined();
    expect(basicFadeInOut.exitedStyle.transform).toBeUndefined();
  });
});

describe('mobileModalSlideInFromBottm — transition format', () => {
  it('enteringStyle transition includes both opacity 100ms and transform 100ms', () => {
    expect(mobileModalSlideInFromBottm.enteringStyle.transition).toContain('opacity 100ms');
    expect(mobileModalSlideInFromBottm.enteringStyle.transition).toContain('transform 100ms');
  });

  it('exitedStyle is opacity-only (no transform / transition for cleanup)', () => {
    const exited = mobileModalSlideInFromBottm.exitedStyle as Record<string, unknown>;
    expect(exited.opacity).toBe(0);
    expect(exited.transform).toBeUndefined();
    expect(exited.transition).toBeUndefined();
  });
});

describe('cssTransitionUtils consistency', () => {
  it('basicFadeInOut returns same object 100 times', () => {
    const first = basicFadeInOut.enteringStyle;
    for (let i = 0; i < 100; i++) {
      expect(basicFadeInOut.enteringStyle).toEqual(first);
    }
  });

  it('basicFadeInOut 4 styles always defined 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(basicFadeInOut.enteringStyle).toBeDefined();
      expect(basicFadeInOut.enteredStyle).toBeDefined();
      expect(basicFadeInOut.exitingStyle).toBeDefined();
      expect(basicFadeInOut.exitedStyle).toBeDefined();
    }
  });

  it('mobileModalSlideInFromBottm 4 styles defined 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(mobileModalSlideInFromBottm.enteringStyle).toBeDefined();
      expect(mobileModalSlideInFromBottm.enteredStyle).toBeDefined();
      expect(mobileModalSlideInFromBottm.exitingStyle).toBeDefined();
      expect(mobileModalSlideInFromBottm.exitedStyle).toBeDefined();
    }
  });

  it('desktopModalSlideInFromTopAndGrow 4 styles defined 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(desktopModalSlideInFromTopAndGrow.enteringStyle).toBeDefined();
      expect(desktopModalSlideInFromTopAndGrow.enteredStyle).toBeDefined();
      expect(desktopModalSlideInFromTopAndGrow.exitingStyle).toBeDefined();
      expect(desktopModalSlideInFromTopAndGrow.exitedStyle).toBeDefined();
    }
  });

  it('all 3 transition objects have 4 keys 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      expect(Object.keys(basicFadeInOut).length).toBeGreaterThanOrEqual(4);
      expect(Object.keys(mobileModalSlideInFromBottm).length).toBeGreaterThanOrEqual(4);
      expect(Object.keys(desktopModalSlideInFromTopAndGrow).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('round-2 30 sequential access basicFadeInOut', () => {
    for (let i = 0; i < 30; i++) {
      expect(basicFadeInOut).toBeDefined();
    }
  });

  it('round-2 50 sequential access mobileModalSlideInFromBottm', () => {
    for (let i = 0; i < 50; i++) {
      expect(mobileModalSlideInFromBottm).toBeDefined();
    }
  });

  it('round-2 50 sequential access desktopModalSlideInFromTopAndGrow', () => {
    for (let i = 0; i < 50; i++) {
      expect(desktopModalSlideInFromTopAndGrow).toBeDefined();
    }
  });

  it('round-2 100 sequential alternating access', () => {
    for (let i = 0; i < 100; i++) {
      const t =
        i % 3 === 0
          ? basicFadeInOut
          : i % 3 === 1
            ? mobileModalSlideInFromBottm
            : desktopModalSlideInFromTopAndGrow;
      expect(typeof t).toBe('object');
    }
  });

  it('round-2 100 sequential consistency check basicFadeInOut', () => {
    const first = basicFadeInOut;
    for (let i = 0; i < 100; i++) {
      expect(basicFadeInOut).toBe(first);
    }
  });
});
