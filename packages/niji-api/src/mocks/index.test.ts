/**
 * GMO mock conditional 起動の behavior test
 * 目的 = env `USE_GMO_MOCK` の値で isGmoMockEnabled が期待通り true/false を返す
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isGmoMockEnabled } from './index.js';

let originalUseGmoMock: string | undefined;

beforeEach(() => {
  originalUseGmoMock = process.env['USE_GMO_MOCK'];
});

afterEach(() => {
  if (originalUseGmoMock === undefined) {
    delete process.env['USE_GMO_MOCK'];
  } else {
    process.env['USE_GMO_MOCK'] = originalUseGmoMock;
  }
});

describe('isGmoMockEnabled', () => {
  it('未設定時は false を返す', () => {
    delete process.env['USE_GMO_MOCK'];
    expect(isGmoMockEnabled()).toBe(false);
  });

  it('USE_GMO_MOCK=true で true を返す', () => {
    process.env['USE_GMO_MOCK'] = 'true';
    expect(isGmoMockEnabled()).toBe(true);
  });

  it('USE_GMO_MOCK=1 で true を返す', () => {
    process.env['USE_GMO_MOCK'] = '1';
    expect(isGmoMockEnabled()).toBe(true);
  });

  it('USE_GMO_MOCK=yes (大文字混じり) で true を返す', () => {
    process.env['USE_GMO_MOCK'] = 'YES';
    expect(isGmoMockEnabled()).toBe(true);
  });

  it('USE_GMO_MOCK=false で false を返す', () => {
    process.env['USE_GMO_MOCK'] = 'false';
    expect(isGmoMockEnabled()).toBe(false);
  });

  it('USE_GMO_MOCK=random-string で false を返す (truthy 以外は全て false)', () => {
    process.env['USE_GMO_MOCK'] = 'random-string';
    expect(isGmoMockEnabled()).toBe(false);
  });

  it('前後 whitespace 含む値も trim 後判定 (env 直入力の防御)', () => {
    process.env['USE_GMO_MOCK'] = '  true  ';
    expect(isGmoMockEnabled()).toBe(true);
  });
});
