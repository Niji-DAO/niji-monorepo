/**
 * CardInput — クレカ 4 field 入力 UI (Issue #3047)
 *
 * FiatBidForm の hint テキスト位置に置換される、 実クレカ決済画面と同等の入力欄。
 * 4 field (card number / expiry / CVV / holder name) を内部 state で保持、
 * onChange で親 (FiatBidForm) に cardData + isValid を報告する。
 *
 * SSOT ...
 * (1) card brand 判定 = VISA (4*) / Master (5*) / JCB (35*) / AMEX (34, 37*) の 4 種、 それ以外は 'unknown'
 * (2) card number auto format = 4-4-4-4 (VISA/Master/JCB) or 4-6-5 (AMEX)、 内部 state は数字のみ保持
 * (3) expiry auto format = MM/YY (2 桁 + / + 2 桁)、 過去日 validation は当年 (2 桁) + 当月比較
 * (4) CVV = brand 依存 (VISA/Master/JCB 3 桁、 AMEX 4 桁)
 * (5) holder name = 英数半角 + 拡張 latin (アクセント付), 全角文字 reject
 * (6) dev 環境時のみ default プリフィル + テストカード切替 dropdown 表示
 *
 * palette (cool/warm) は data-palette 属性経路で親から継承、 CardInput 自身も明示的に付与する
 * (BidModal Tab 経路 + 単独 FiatBidModal 経路の両方で確実に効かせるため)。
 */

import type { CardBrand, GmoTestCard, TestCardKey } from './testCards';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';

import classes from './CardInput.module.css';
import { DEFAULT_TEST_CARD, GMO_TEST_CARDS, TEST_CARD_KEYS } from './testCards';

/** 親に報告する cardData shape (mock cardToken 生成に使う実値 + 検証結果) */
export type CardData = {
  /** card 番号 (数字のみ、 space 除去済) */
  number: string;
  /** 有効期限 (MM/YY 形式) */
  expiry: string;
  /** CVV (brand 依存 3-4 桁) */
  cvv: string;
  /** 名義 (英数半角 + 拡張 latin) */
  holder: string;
  /** 判定 brand (icon 表示 + validation 分岐) */
  brand: CardBrand;
};

export type CardInputProps = {
  /** 親から onChange で cardData + isValid を受取る callback */
  onChange: (data: CardData, isValid: boolean) => void;
  /** palette 種別 (cool/warm、 default = cool) */
  palette?: 'cool' | 'warm';
  /** dev 環境判定 (default プリフィル + dropdown 表示制御、 test で override 可能) */
  isDev?: boolean;
  /** 初期 cardData (test 用、 未指定なら isDev=true 時のみ DEFAULT_TEST_CARD) */
  initialCard?: GmoTestCard;
};

/** brand 判定 (数字のみの card 番号を受取、 先頭 1-2 桁で判定) */
export const detectCardBrand = (rawNumber: string): CardBrand => {
  const digits = rawNumber.replace(/\D/g, '');
  if (digits.length === 0) return 'unknown';
  if (digits.startsWith('4')) return 'visa';
  if (digits.startsWith('5')) return 'mastercard';
  if (digits.startsWith('35')) return 'jcb';
  if (digits.startsWith('34') || digits.startsWith('37')) return 'amex';
  return 'unknown';
};

/** card 番号 4-4-4-4 or 4-6-5 format (AMEX のみ 4-6-5) */
export const formatCardNumber = (rawNumber: string, brand: CardBrand): string => {
  const digits = rawNumber.replace(/\D/g, '');
  if (brand === 'amex') {
    // AMEX = 4-6-5 (15 桁)
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(part => part.length > 0)
      .join(' ');
  }
  // VISA/Master/JCB/unknown = 4-4-4-4 (16 桁)
  return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12), digits.slice(12, 16)]
    .filter(part => part.length > 0)
    .join(' ');
};

/** expiry MM/YY auto format (数字 2 桁 + / + 2 桁) */
export const formatExpiry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

/** card 番号 validation (brand 依存桁数 check) */
export const validateCardNumber = (number: string, brand: CardBrand): boolean => {
  const digits = number.replace(/\D/g, '');
  if (brand === 'amex') return digits.length === 15;
  return digits.length === 16;
};

/** expiry validation (MM/YY 形式 + 未来日 check、 空文字は invalid) */
export const validateExpiry = (expiry: string): boolean => {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (match === null) return false;
  const month = Number.parseInt(match[1] ?? '0', 10);
  const year = Number.parseInt(match[2] ?? '0', 10);
  if (month < 1 || month > 12) return false;
  // 過去日 check = 今の年月と比較 (2 桁年 = 20YY)
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
};

/** CVV validation (brand 依存桁数) */
export const validateCvv = (cvv: string, brand: CardBrand): boolean => {
  const digits = cvv.replace(/\D/g, '');
  if (brand === 'amex') return digits.length === 4;
  return digits.length === 3;
};

/** holder 名義 validation (英数半角 + 拡張 latin、 1 文字以上) */
export const validateHolder = (holder: string): boolean => {
  if (holder.trim().length === 0) return false;
  // 英数半角 + space + 拡張 latin (アクセント付) を許容、 全角文字 / kanji / kana を reject
  return /^[\d '.A-Za-zÀ-ſ\-]+$/.test(holder);
};

/** brand icon 表示 (emoji で mvp、 icon library import 追加禁止) */
const brandLabel = (brand: CardBrand): string => {
  switch (brand) {
    case 'visa':
      return 'VISA';
    case 'mastercard':
      return 'Master';
    case 'jcb':
      return 'JCB';
    case 'amex':
      return 'AMEX';
    default:
      return '';
  }
};

/**
 * CardInput component
 */
export const CardInput = ({
  onChange,
  palette = 'cool',
  isDev = false,
  initialCard,
}: CardInputProps): React.JSX.Element => {
  // 初期 state = initialCard 指定 → 使用、 isDev=true → DEFAULT_TEST_CARD、 それ以外 → 空欄
  const initial = initialCard ?? (isDev ? DEFAULT_TEST_CARD : undefined);
  const [cardNumber, setCardNumber] = useState<string>(initial?.number ?? '');
  const [expiry, setExpiry] = useState<string>(initial?.expiry ?? '');
  const [cvv, setCvv] = useState<string>(initial?.cvv ?? '');
  const [holder, setHolder] = useState<string>(initial?.holder ?? '');
  const [selectedTestKey, setSelectedTestKey] = useState<TestCardKey>('visa');

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const formattedNumber = useMemo(() => formatCardNumber(cardNumber, brand), [cardNumber, brand]);

  const isNumberValid = useMemo(() => validateCardNumber(cardNumber, brand), [cardNumber, brand]);
  const isExpiryValid = useMemo(() => validateExpiry(expiry), [expiry]);
  const isCvvValid = useMemo(() => validateCvv(cvv, brand), [cvv, brand]);
  const isHolderValid = useMemo(() => validateHolder(holder), [holder]);
  const isValid = isNumberValid && isExpiryValid && isCvvValid && isHolderValid;

  // 親への onChange 通知 (state 変更ごと)
  useEffect(() => {
    onChange(
      {
        number: cardNumber.replace(/\D/g, ''),
        expiry,
        cvv,
        holder,
        brand,
      },
      isValid,
    );
  }, [cardNumber, expiry, cvv, holder, brand, isValid, onChange]);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // 上限桁数 = brand 依存 (VISA/Master/JCB 16、 AMEX 15) だが handler 内では brand 判定前 raw
    // なので 16 桁上限で slice、 表示上は formatCardNumber が brand に応じて format する。
    // AMEX (34/37 で始まる) は 16 桁目まで入力されても validateCardNumber で ng 判定される。
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits);
  }, []);

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  }, []);

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3);
      setCvv(digits);
    },
    [brand],
  );

  const handleHolderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHolder(e.target.value);
  }, []);

  const handleTestCardSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as TestCardKey;
    setSelectedTestKey(key);
    const testCard = GMO_TEST_CARDS[key];
    setCardNumber(testCard.number);
    setExpiry(testCard.expiry);
    setCvv(testCard.cvv);
    setHolder(testCard.holder);
  }, []);

  return (
    <div
      className={classes.cardInput}
      data-palette={palette}
      data-testid="card-input"
      data-brand={brand}
    >
      {isDev && (
        <div className={classes.testCardSelector}>
          <label htmlFor="card-input-test-card" className={classes.fieldLabel}>
            テストカード切替 (dev のみ)
          </label>
          <select
            id="card-input-test-card"
            className={classes.testCardSelect}
            value={selectedTestKey}
            onChange={handleTestCardSelect}
            data-testid="card-input-test-card-select"
          >
            {TEST_CARD_KEYS.map(key => (
              <option key={key} value={key}>
                {GMO_TEST_CARDS[key].label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={classes.fieldGroup}>
        <label htmlFor="card-input-number" className={classes.fieldLabel}>
          card 番号
        </label>
        {/*
          brand 見出しはカード風 preview を廃止したため、 番号入力欄の内側右に小さく置く。
          brand が判別できない (unknown / 空) 場合は空文字を返し領域だけ確保する。
        */}
        <div className={classes.numberFieldWrap}>
          <Input
            id="card-input-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={formattedNumber}
            onChange={handleNumberChange}
            placeholder="1234 5678 9012 3456"
            data-testid="card-input-number"
            className={classes.numberField}
            aria-invalid={cardNumber !== '' && !isNumberValid}
          />
          <span className={classes.brandBadge} data-testid="card-brand-icon">
            {brandLabel(brand)}
          </span>
        </div>
        {cardNumber !== '' && !isNumberValid && (
          <p className={classes.errorInline} data-testid="card-input-number-error">
            card 番号は {brand === 'amex' ? 15 : 16} 桁で入力してください
          </p>
        )}
      </div>

      <div className={classes.fieldRow}>
        <div className={classes.fieldGroup}>
          <label htmlFor="card-input-expiry" className={classes.fieldLabel}>
            有効期限 (MM/YY)
          </label>
          <Input
            id="card-input-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={handleExpiryChange}
            placeholder="12/28"
            data-testid="card-input-expiry"
            className={classes.textField}
            aria-invalid={expiry !== '' && !isExpiryValid}
          />
          {expiry !== '' && !isExpiryValid && (
            <p className={classes.errorInline} data-testid="card-input-expiry-error">
              有効期限は MM/YY 形式で未来日を入力してください
            </p>
          )}
        </div>

        <div className={classes.fieldGroup}>
          <label htmlFor="card-input-cvv" className={classes.fieldLabel}>
            CVV
          </label>
          <Input
            id="card-input-cvv"
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            value={cvv}
            onChange={handleCvvChange}
            placeholder={brand === 'amex' ? '1234' : '123'}
            data-testid="card-input-cvv"
            className={classes.textField}
            aria-invalid={cvv !== '' && !isCvvValid}
          />
          {cvv !== '' && !isCvvValid && (
            <p className={classes.errorInline} data-testid="card-input-cvv-error">
              CVV は {brand === 'amex' ? 4 : 3} 桁で入力してください
            </p>
          )}
        </div>
      </div>

      <div className={classes.fieldGroup}>
        <label htmlFor="card-input-holder" className={classes.fieldLabel}>
          名義 (英数半角)
        </label>
        <Input
          id="card-input-holder"
          type="text"
          autoComplete="cc-name"
          value={holder}
          onChange={handleHolderChange}
          placeholder="TEST USER"
          data-testid="card-input-holder"
          className={classes.textField}
          aria-invalid={holder !== '' && !isHolderValid}
        />
        {holder !== '' && !isHolderValid && (
          <p className={classes.errorInline} data-testid="card-input-holder-error">
            名義は英数半角で入力してください
          </p>
        )}
      </div>
    </div>
  );
};

export default CardInput;
