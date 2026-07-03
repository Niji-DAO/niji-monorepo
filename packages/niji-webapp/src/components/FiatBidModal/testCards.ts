/**
 * GMO PGマルチペイメント テストカード SSOT (Issue #3047)
 *
 * GMO 公式テストカード番号 (https://mp-faq.gmo-pg.com/s/article/T00010) を SSOT 化。
 * dev 環境の default プリフィル + テストカード切替 dropdown で使用する。
 *
 * 本番切替時は本 file を残置 + CardInput の default 値経路のみ空欄に差替、
 * 実 card 番号は user 入力 or GMO SDK 経路で Token 化される。
 *
 * 有効期限は「未来任意日 (12/28) = 2028 年 12 月」 で標準化、
 * 全カードの CVV は 3 桁 (AMEX のみ 4 桁 = GMO 仕様)。
 *
 * 3DS Success / Fail は VISA テストカード番号を base に差別化 (末尾 4 桁のみ変更)、
 * mock server 側の判定は末尾 4 桁 (last4) 経路で行う設計。
 */

export type CardBrand = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'unknown';

export type GmoTestCard = {
  /** card 番号 (16 桁、 AMEX のみ 15 桁) */
  number: string;
  /** 有効期限 (MM/YY 形式) */
  expiry: string;
  /** CVV (VISA/Master/JCB 3 桁、 AMEX 4 桁) */
  cvv: string;
  /** 名義 (英数半角) */
  holder: string;
  /** brand 識別子 (icon + validation 分岐に使用) */
  brand: CardBrand;
  /** dropdown 表示用 label */
  label: string;
};

export type TestCardKey = 'visa' | 'master' | 'jcb' | 'amex' | '3ds-success' | '3ds-fail';

/**
 * GMO 公式テストカード一覧 (Phase 1 mock で使用、 全カード同一 expiry/holder)
 *
 * 各 card 番号は GMO 公式ドキュメント準拠 —
 *  visa         ... 4111 1111 1111 1111 (VISA 標準テスト番号、 3DS Success 相当)
 *  master       ... 5111 1111 1111 1118 (Master 標準テスト番号)
 *  jcb          ... 3530 1113 3330 0000 (JCB 標準テスト番号)
 *  amex         ... 3782 8224 6310 005  (AMEX 15 桁、 CVV 4 桁)
 *  3ds-success  ... 4111 1111 1111 1111 (VISA と同 = mock 3DS success 経路)
 *  3ds-fail     ... 4111 1111 1111 1129 (VISA 末尾 4 桁変更 = mock 3DS fail 経路)
 */
export const GMO_TEST_CARDS: Record<TestCardKey, GmoTestCard> = {
  visa: {
    number: '4111111111111111',
    expiry: '12/28',
    cvv: '123',
    holder: 'TEST USER',
    brand: 'visa',
    label: 'VISA',
  },
  master: {
    number: '5111111111111118',
    expiry: '12/28',
    cvv: '123',
    holder: 'TEST USER',
    brand: 'mastercard',
    label: 'Master',
  },
  jcb: {
    number: '3530111333300000',
    expiry: '12/28',
    cvv: '123',
    holder: 'TEST USER',
    brand: 'jcb',
    label: 'JCB',
  },
  amex: {
    number: '378282246310005',
    expiry: '12/28',
    cvv: '1234',
    holder: 'TEST USER',
    brand: 'amex',
    label: 'AMEX',
  },
  '3ds-success': {
    number: '4111111111111111',
    expiry: '12/28',
    cvv: '123',
    holder: 'TEST USER',
    brand: 'visa',
    label: '3DS Success',
  },
  '3ds-fail': {
    number: '4111111111111129',
    expiry: '12/28',
    cvv: '123',
    holder: 'TEST USER',
    brand: 'visa',
    label: '3DS Fail',
  },
};

/** default テストカード (dev 環境の初期 state に採用) */
export const DEFAULT_TEST_CARD: GmoTestCard = GMO_TEST_CARDS.visa;

/** dropdown 表示順 (VISA → Master → JCB → AMEX → 3DS Success → 3DS Fail) */
export const TEST_CARD_KEYS: TestCardKey[] = [
  'visa',
  'master',
  'jcb',
  'amex',
  '3ds-success',
  '3ds-fail',
];
