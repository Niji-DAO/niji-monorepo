/**
 * 落札通知 email template behavior test (Issue #3011 Phase B)
 *
 * rules/quality.md § test-passed marker 発行前提 準拠。
 * template 生成 pure function の subject / text / html / settlementUrl を検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildSettlementUrl, buildWinnerEmail, formatJpyAmount } from './winner.js';

describe('formatJpyAmount', () => {
  it('100000 → "100,000"', () => {
    expect(formatJpyAmount(100000)).toBe('100,000');
  });

  it('1000 → "1,000"', () => {
    expect(formatJpyAmount(1000)).toBe('1,000');
  });

  it('999 → "999"', () => {
    expect(formatJpyAmount(999)).toBe('999');
  });

  it('0 → "0"', () => {
    expect(formatJpyAmount(0)).toBe('0');
  });

  it('1234567 → "1,234,567"', () => {
    expect(formatJpyAmount(1234567)).toBe('1,234,567');
  });
});

describe('buildSettlementUrl', () => {
  it('base + auctionId で query 付き URL 生成', () => {
    expect(buildSettlementUrl('https://niji-dao.example', 42n)).toBe(
      'https://niji-dao.example/niji/42?fiat-settlement=true',
    );
  });

  it('trailing slash は削除される', () => {
    expect(buildSettlementUrl('https://niji-dao.example/', 42n)).toBe(
      'https://niji-dao.example/niji/42?fiat-settlement=true',
    );
  });

  it('auctionId 0n も許容', () => {
    expect(buildSettlementUrl('https://niji-dao.example', 0n)).toBe(
      'https://niji-dao.example/niji/0?fiat-settlement=true',
    );
  });

  it('auctionId 999n も許容', () => {
    expect(buildSettlementUrl('https://niji-dao.example', 999n)).toBe(
      'https://niji-dao.example/niji/999?fiat-settlement=true',
    );
  });

  it('localhost dev URL でも動く', () => {
    expect(buildSettlementUrl('http://localhost:2424', 42n)).toBe(
      'http://localhost:2424/niji/42?fiat-settlement=true',
    );
  });
});

describe('buildWinnerEmail', () => {
  const validInput = {
    authId: 'mock-access-00000001',
    auctionId: 42n,
    jpyAmount: 100000,
    webappBaseUrl: 'https://niji-dao.example',
  };

  it('subject に auction ID を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.subject).toContain('42');
  });

  it('subject に「落札しました」 の文言を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.subject).toContain('落札しました');
  });

  it('subject prefix に "【Niji DAO】" が付く', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.subject.startsWith('【Niji DAO】')).toBe(true);
  });

  it('text 本文に formatted 落札額 "100,000 円" を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain('100,000 円');
  });

  it('text 本文に settlementUrl を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain(out.settlementUrl);
  });

  it('text 本文に「24 時間以内」 の期限文言を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain('24 時間以内');
  });

  it('text 本文に「3D セキュア 2.0 認証」 の文言を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain('3D セキュア 2.0 認証');
  });

  it('text 本文に「クレカ決済を確定します」 CTA 文言を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain('クレカ決済を確定します');
  });

  it('html 本文に settlementUrl の a href を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html).toContain(`href="${out.settlementUrl}"`);
  });

  it('html 本文に "決済を確定する" button 文言を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html).toContain('決済を確定する');
  });

  it('html 本文に formatted 落札額 "100,000 円" を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html).toContain('100,000 円');
  });

  it('html 本文に "<!DOCTYPE html>" prefix を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html.startsWith('<!DOCTYPE html>')).toBe(true);
  });

  it('html 本文に lang="ja" 属性を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html).toContain('lang="ja"');
  });

  it('settlementUrl が buildSettlementUrl の結果と一致', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.settlementUrl).toBe(
      buildSettlementUrl(validInput.webappBaseUrl, validInput.auctionId),
    );
  });

  it('auctionId 999n の巨大値でも subject に正しく反映', () => {
    const out = buildWinnerEmail({ ...validInput, auctionId: 999n });
    expect(out.subject).toContain('999');
    expect(out.text).toContain('999');
  });

  it('jpyAmount 5000 の低額でも整形される', () => {
    const out = buildWinnerEmail({ ...validInput, jpyAmount: 5000 });
    expect(out.text).toContain('5,000 円');
  });

  it('jpyAmount 1000000 (100 万円) 高額でも整形される', () => {
    const out = buildWinnerEmail({ ...validInput, jpyAmount: 1000000 });
    expect(out.text).toContain('1,000,000 円');
  });

  it('text と html は別文字列 (同一 subject を共有するが本文形式は独立)', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).not.toBe(out.html);
  });

  it('text 本文は plain text (HTML tag を含まない)', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).not.toContain('<html');
    expect(out.text).not.toContain('<body');
    expect(out.text).not.toContain('<a href');
  });

  it('html 本文は HTML tag を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.html).toContain('<html');
    expect(out.html).toContain('<body');
    expect(out.html).toContain('<h1');
  });

  it('mail 本文に運営連絡先 "support@niji-dao.example" を含む', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).toContain('support@niji-dao.example');
    expect(out.html).toContain('support@niji-dao.example');
  });

  it('authId は email 本文には表示されない (追跡専用)', () => {
    const out = buildWinnerEmail(validInput);
    expect(out.text).not.toContain(validInput.authId);
    expect(out.html).not.toContain(validInput.authId);
  });

  it('100 件生成しても template が安定 (deterministic 出力)', () => {
    const out1 = buildWinnerEmail(validInput);
    for (let i = 0; i < 100; i++) {
      const outN = buildWinnerEmail(validInput);
      expect(outN.subject).toBe(out1.subject);
      expect(outN.text).toBe(out1.text);
      expect(outN.html).toBe(out1.html);
    }
  });
});
