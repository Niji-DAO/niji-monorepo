/**
 * Tokushoho behavior test (Issue #3011 Phase A)
 *
 * rules/quality.md § test-passed marker 発行前提 準拠。
 * 特商法 page が 8 項目全 label 表示 + placeholder 4 件 marker 明記を検証する。
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tokushoho, tokushohoItems, TOKUSHOHO_TODO_MARKER } from './Tokushoho';

describe('Tokushoho', () => {
  it('renders 8 tokushoho items (rowcount = 8)', () => {
    const { container } = render(<Tokushoho />);
    const rows = container.querySelectorAll('[data-testid^="tokushoho-item-"]');
    expect(rows.length).toBe(8);
  });

  it('renders 4 placeholder items (販売者名 / 所在地 / 電話番号 / 代表者)', () => {
    const { container } = render(<Tokushoho />);
    const placeholders = container.querySelectorAll('[data-testid="tokushoho-placeholder"]');
    expect(placeholders.length).toBe(4);
  });

  it('renders 4 confirmed items (販売価格 / 支払方法 / 商品引渡時期 / 返品ポリシー)', () => {
    const { container } = render(<Tokushoho />);
    const confirmed = container.querySelectorAll('[data-testid="tokushoho-confirmed"]');
    expect(confirmed.length).toBe(4);
  });

  it('placeholder items include TOKUSHOHO_TODO_MARKER', () => {
    const { container } = render(<Tokushoho />);
    const placeholders = container.querySelectorAll('[data-testid="tokushoho-placeholder"]');
    placeholders.forEach(el => {
      expect(el.textContent).toContain(TOKUSHOHO_TODO_MARKER);
    });
  });

  it('confirmed items do NOT include TOKUSHOHO_TODO_MARKER', () => {
    const { container } = render(<Tokushoho />);
    const confirmed = container.querySelectorAll('[data-testid="tokushoho-confirmed"]');
    confirmed.forEach(el => {
      expect(el.textContent).not.toContain(TOKUSHOHO_TODO_MARKER);
    });
  });

  it('renders h1 title "特定商取引法に基づく表記"', () => {
    const { container } = render(<Tokushoho />);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toBe('特定商取引法に基づく表記');
  });

  it('renders 販売価格 item with 落札額 explanation', () => {
    const { container } = render(<Tokushoho />);
    expect(container.textContent).toContain('落札額');
  });

  it('renders 支払方法 item with 3D セキュア mention', () => {
    const { container } = render(<Tokushoho />);
    expect(container.textContent).toContain('3D セキュア');
  });

  it('renders 商品引渡時期 item with transferFrom mention', () => {
    const { container } = render(<Tokushoho />);
    expect(container.textContent).toContain('transferFrom');
  });

  it('renders 返品ポリシー item with 返品は原則不可 wording', () => {
    const { container } = render(<Tokushoho />);
    expect(container.textContent).toContain('返品は原則不可');
  });

  it('has data-testid="legal-tokushoho" root marker for e2e', () => {
    const { container } = render(<Tokushoho />);
    expect(container.querySelector('[data-testid="legal-tokushoho"]')).not.toBeNull();
  });

  it('renders 補足事項 section', () => {
    const { container } = render(<Tokushoho />);
    expect(container.textContent).toContain('補足事項');
  });

  it('tokushohoItems has 8 entries (exported SSOT)', () => {
    expect(tokushohoItems.length).toBe(8);
  });

  it('tokushohoItems has exactly 4 placeholder entries', () => {
    const placeholders = tokushohoItems.filter(item => item.isPlaceholder);
    expect(placeholders.length).toBe(4);
  });

  it('tokushohoItems has exactly 4 confirmed entries', () => {
    const confirmed = tokushohoItems.filter(item => !item.isPlaceholder);
    expect(confirmed.length).toBe(4);
  });

  it('placeholder labels match spec (販売者名 / 所在地 / 電話番号 / 代表者)', () => {
    const placeholderLabels = tokushohoItems
      .filter(item => item.isPlaceholder)
      .map(item => item.label);
    expect(placeholderLabels).toEqual(['販売者名', '所在地', '電話番号', '代表者']);
  });

  it('confirmed labels match spec (販売価格 / 支払方法 / 商品引渡時期 / 返品ポリシー)', () => {
    const confirmedLabels = tokushohoItems
      .filter(item => !item.isPlaceholder)
      .map(item => item.label);
    expect(confirmedLabels).toEqual(['販売価格', '支払方法', '商品引渡時期', '返品ポリシー']);
  });

  it('renders mount-unmount 50 cycles without crash', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Tokushoho />);
      unmount();
    }
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Tokushoho key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
});
