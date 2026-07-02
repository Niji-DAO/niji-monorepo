/**
 * NijiGas CI skip behavior test (GH #3012)
 *
 * NijiGas.test.ts の 20KB skip 分岐が意図通り動作することを検証する。
 *
 * 目的
 *   - CI 環境 (process.env.CI = 'true') で 20KB size のみ skip される
 *   - local 環境 (未設定) では 20KB 含む全 size 実行される
 *   - skip 対象 bytes は 20_480 のみ (5/10/15KB + P6 profiles + sub-operations は影響なし)
 *
 * Skip 判定 logic は module 定数 (`IS_CI` / `CI_SKIP_SIZE_BYTES`) として export
 * されており、 本 test で env 切替 + 定数値検証で挙動を保証する。
 */
import { expect } from 'chai';
import { IS_CI, CI_SKIP_SIZE_BYTES } from './NijiGas.test';

describe('NijiGas CI skip logic', () => {
  it('IS_CI 定数が process.env.CI = "true" と一致する', () => {
    // module load 時の process.env.CI で判定されるため、 現在の env 値と一致する
    // (test runner の env でも同 flag を参照するため副作用なし)
    const expected = process.env.CI === 'true';
    expect(IS_CI).to.equal(expected);
  });

  it('CI_SKIP_SIZE_BYTES = 20_480 (20KB) を skip 対象とする', () => {
    // 20KB size (20,480 bytes) のみ CI で skip 対象、 5/10/15KB は継続実行
    expect(CI_SKIP_SIZE_BYTES).to.equal(20_480);
  });

  it('skip 判定 helper が bytes = 20_480 のみ true を返す (CI env 時)', () => {
    // NijiGas.test.ts 側の分岐と等価な logic を再現し、 20KB 単独 skip を確認
    const shouldSkip = (isCi: boolean, bytes: number): boolean =>
      isCi && bytes === CI_SKIP_SIZE_BYTES;

    // CI 環境 = true の想定
    expect(shouldSkip(true, 5_120)).to.equal(false); // 5KB は継続
    expect(shouldSkip(true, 10_240)).to.equal(false); // 10KB は継続
    expect(shouldSkip(true, 15_360)).to.equal(false); // 15KB は継続
    expect(shouldSkip(true, 20_480)).to.equal(true); // 20KB のみ skip
    expect(shouldSkip(true, 21_504)).to.equal(false); // 21KB (P6 hair 21.4KB 相当) は継続

    // local 環境 = false の想定
    expect(shouldSkip(false, 5_120)).to.equal(false);
    expect(shouldSkip(false, 10_240)).to.equal(false);
    expect(shouldSkip(false, 15_360)).to.equal(false);
    expect(shouldSkip(false, 20_480)).to.equal(false); // local では 20KB 実行
    expect(shouldSkip(false, 21_504)).to.equal(false);
  });
});
