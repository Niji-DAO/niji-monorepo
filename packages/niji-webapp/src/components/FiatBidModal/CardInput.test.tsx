// CardInput.tsx 削除に伴い test 群も撤去 (Phase 3 で fincode 経路に固定化)。
// vitest が空 file を error 扱いするため minimal skip test を残す。
import { describe, it } from 'vitest';

describe.skip('CardInput (removed)', () => {
  it('placeholder', () => {});
});
