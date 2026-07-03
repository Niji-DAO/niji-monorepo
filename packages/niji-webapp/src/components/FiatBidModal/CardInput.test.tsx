/**
 * CardInput behavior test (Issue #3047)
 *
 * 8 case で 4 field 入力 UI の挙動を検証 —
 * (1) pure logic = detectCardBrand / formatCardNumber / formatExpiry / validate*
 * (2) render 動作 = 4 field 表示 + dev 時 dropdown 表示 + prod 時 dropdown 非表示
 * (3) 入力挙動 = card number 4-4-4-4 auto format + brand 判定 + testcard 切替
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  CardInput,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateCvv,
  validateExpiry,
  validateHolder,
} from './CardInput';
import { DEFAULT_TEST_CARD, GMO_TEST_CARDS } from './testCards';

describe('detectCardBrand', () => {
  it('4 で始まる 番号 = visa', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
  });

  it('5 で始まる 番号 = mastercard', () => {
    expect(detectCardBrand('5111111111111118')).toBe('mastercard');
  });

  it('35 で始まる 番号 = jcb', () => {
    expect(detectCardBrand('3530111333300000')).toBe('jcb');
  });

  it('34 / 37 で始まる 番号 = amex', () => {
    expect(detectCardBrand('378282246310005')).toBe('amex');
    expect(detectCardBrand('341234567890123')).toBe('amex');
  });

  it('未対応 prefix / 空文字 = unknown', () => {
    expect(detectCardBrand('')).toBe('unknown');
    expect(detectCardBrand('9999999999999999')).toBe('unknown');
  });
});

describe('formatCardNumber', () => {
  it('16 桁 = 4-4-4-4 (VISA/Master/JCB)', () => {
    expect(formatCardNumber('4111111111111111', 'visa')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('5111111111111118', 'mastercard')).toBe('5111 1111 1111 1118');
  });

  it('15 桁 = 4-6-5 (AMEX)', () => {
    expect(formatCardNumber('378282246310005', 'amex')).toBe('3782 822463 10005');
  });

  it('入力途中 = 桁数分だけ format', () => {
    expect(formatCardNumber('4111', 'visa')).toBe('4111');
    expect(formatCardNumber('41111111', 'visa')).toBe('4111 1111');
  });
});

describe('formatExpiry', () => {
  it('2 桁 = そのまま', () => {
    expect(formatExpiry('12')).toBe('12');
  });

  it('3 桁以上 = MM/YY', () => {
    expect(formatExpiry('1228')).toBe('12/28');
    expect(formatExpiry('123')).toBe('12/3');
  });

  it('数字以外を除去', () => {
    expect(formatExpiry('12/28')).toBe('12/28');
    expect(formatExpiry('12a28')).toBe('12/28');
  });
});

describe('validateCardNumber', () => {
  it('VISA 16 桁 = ok', () => {
    expect(validateCardNumber('4111111111111111', 'visa')).toBe(true);
  });

  it('AMEX 15 桁 = ok', () => {
    expect(validateCardNumber('378282246310005', 'amex')).toBe(true);
  });

  it('桁数不足 = ng', () => {
    expect(validateCardNumber('4111', 'visa')).toBe(false);
    expect(validateCardNumber('37828', 'amex')).toBe(false);
  });
});

describe('validateExpiry', () => {
  it('未来の MM/YY = ok', () => {
    expect(validateExpiry('12/28')).toBe(true);
    expect(validateExpiry('01/99')).toBe(true);
  });

  it('過去の MM/YY = ng', () => {
    expect(validateExpiry('01/20')).toBe(false);
    expect(validateExpiry('12/24')).toBe(false);
  });

  it('不正 format = ng', () => {
    expect(validateExpiry('')).toBe(false);
    expect(validateExpiry('12')).toBe(false);
    expect(validateExpiry('13/28')).toBe(false);
    expect(validateExpiry('00/28')).toBe(false);
  });
});

describe('validateCvv', () => {
  it('VISA/Master/JCB 3 桁 = ok', () => {
    expect(validateCvv('123', 'visa')).toBe(true);
    expect(validateCvv('123', 'mastercard')).toBe(true);
    expect(validateCvv('123', 'jcb')).toBe(true);
  });

  it('AMEX 4 桁 = ok', () => {
    expect(validateCvv('1234', 'amex')).toBe(true);
  });

  it('桁数不一致 = ng', () => {
    expect(validateCvv('12', 'visa')).toBe(false);
    expect(validateCvv('123', 'amex')).toBe(false);
    expect(validateCvv('12345', 'visa')).toBe(false);
  });
});

describe('validateHolder', () => {
  it('英数半角 = ok', () => {
    expect(validateHolder('TEST USER')).toBe(true);
    expect(validateHolder('JOHN DOE')).toBe(true);
    expect(validateHolder("O'Brien")).toBe(true);
  });

  it('全角文字 = ng', () => {
    expect(validateHolder('テスト')).toBe(false);
    expect(validateHolder('田中太郎')).toBe(false);
  });

  it('空文字 = ng', () => {
    expect(validateHolder('')).toBe(false);
    expect(validateHolder('   ')).toBe(false);
  });
});

describe('CardInput render 動作', () => {
  it('isDev=false / initialCard 未指定 で全 field 空欄 + dropdown 非表示', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={false} />);

    expect((screen.getByTestId('card-input-number') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('card-input-expiry') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('card-input-cvv') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('card-input-holder') as HTMLInputElement).value).toBe('');
    expect(screen.queryByTestId('card-input-test-card-select')).toBeNull();
  });

  it('isDev=true で DEFAULT_TEST_CARD (VISA) プリフィル + dropdown 表示', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={true} />);

    expect((screen.getByTestId('card-input-number') as HTMLInputElement).value).toBe(
      '4111 1111 1111 1111',
    );
    expect((screen.getByTestId('card-input-expiry') as HTMLInputElement).value).toBe(
      DEFAULT_TEST_CARD.expiry,
    );
    expect((screen.getByTestId('card-input-cvv') as HTMLInputElement).value).toBe(
      DEFAULT_TEST_CARD.cvv,
    );
    expect((screen.getByTestId('card-input-holder') as HTMLInputElement).value).toBe(
      DEFAULT_TEST_CARD.holder,
    );
    expect(screen.getByTestId('card-input-test-card-select')).toBeInTheDocument();
    // brand icon = VISA
    expect(screen.getByTestId('card-brand-icon').textContent).toBe('VISA');
  });

  it('card 番号入力で 4-4-4-4 auto format + brand icon 切替', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={false} />);

    const numberInput = screen.getByTestId('card-input-number') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111111111111111' } });

    expect(numberInput.value).toBe('4111 1111 1111 1111');
    expect(screen.getByTestId('card-brand-icon').textContent).toBe('VISA');
    // brand data attribute も VISA
    expect(screen.getByTestId('card-input').getAttribute('data-brand')).toBe('visa');
  });

  it('AMEX 番号入力で 4-6-5 format + CVV 4 桁 accept', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={false} />);

    fireEvent.change(screen.getByTestId('card-input-number'), {
      target: { value: '378282246310005' },
    });
    fireEvent.change(screen.getByTestId('card-input-cvv'), { target: { value: '1234' } });

    expect((screen.getByTestId('card-input-number') as HTMLInputElement).value).toBe(
      '3782 822463 10005',
    );
    expect((screen.getByTestId('card-input-cvv') as HTMLInputElement).value).toBe('1234');
    expect(screen.getByTestId('card-brand-icon').textContent).toBe('AMEX');
  });

  it('テストカード dropdown 切替で 4 field 一括更新', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={true} />);

    // Master に切替
    const select = screen.getByTestId('card-input-test-card-select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'master' } });

    expect((screen.getByTestId('card-input-number') as HTMLInputElement).value).toBe(
      '5111 1111 1111 1118',
    );
    expect((screen.getByTestId('card-input-cvv') as HTMLInputElement).value).toBe(
      GMO_TEST_CARDS.master.cvv,
    );
    expect(screen.getByTestId('card-brand-icon').textContent).toBe('Master');
  });

  it('onChange callback で cardData + isValid 通知', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={true} />);

    // isDev=true で DEFAULT_TEST_CARD プリフィル → 初回 onChange で isValid=true
    // useEffect が mount 直後に発火する
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0].number).toBe('4111111111111111');
    expect(lastCall[0].brand).toBe('visa');
    expect(lastCall[1]).toBe(true);
  });

  it('過去日 expiry 入力で validation error 表示', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} isDev={false} />);

    fireEvent.change(screen.getByTestId('card-input-expiry'), { target: { value: '01/20' } });

    expect(screen.getByTestId('card-input-expiry-error').textContent).toContain('未来日');
  });

  it('palette=warm で data-palette=warm 付与', () => {
    const onChange = vi.fn();
    render(<CardInput onChange={onChange} palette="warm" isDev={false} />);

    expect(screen.getByTestId('card-input').getAttribute('data-palette')).toBe('warm');
  });
});
