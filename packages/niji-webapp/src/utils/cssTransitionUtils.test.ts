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
});
