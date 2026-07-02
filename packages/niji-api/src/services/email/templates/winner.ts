/**
 * 落札通知 email template (Issue #3011 Phase B)
 *
 * 役割 —
 * fiat winner (SettlementWatcher が queue に enqueue した FiatWinnerRecord) を受けて、
 * bidder に送る「落札されました、 決済を確定してください」 email の subject / text / html を生成する pure function。
 *
 * 責務分離 —
 * 本 module は template 生成のみを担い、 SendGrid / SES / SMTP など実送信 client との統合は
 * 呼出側 (別 worker) が担当する。 template 単体で unit test 可能な shape に絞る。
 *
 * SSOT —
 * - tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P8
 * - tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md § Issue 8 Phase B
 * - Issue #3010 の SettlementWatcher が enqueue する FiatWinnerRecord shape に依存
 */

export type WinnerEmailInput = {
  /** GMO 与信 authId (追跡用、 email 本文には表示しない) */
  authId: string;
  /** auction ID (落札対象 auction、 落札通知内で表示) */
  auctionId: bigint;
  /** 落札額 (JPY、 通知本文で明示) */
  jpyAmount: number;
  /** 決済確定 CTA link の base URL (webapp、 例 https://niji-dao.example) */
  webappBaseUrl: string;
};

export type WinnerEmailOutput = {
  subject: string;
  text: string;
  html: string;
  /** webapp modal 遷移 URL (CTA link で使う、 test 用にも export) */
  settlementUrl: string;
};

/**
 * 決済確定 CTA link を生成
 * webapp 側で /niji/{auctionId}?fiat-settlement=true query 付き遷移で FiatSettlementModal を open する pattern
 * (Issue #3010 の FiatSettlementModal 実装と契約 pin)
 */
export const buildSettlementUrl = (baseUrl: string, auctionId: bigint): string => {
  const trimmed = baseUrl.replace(/\/$/, '');
  return `${trimmed}/niji/${auctionId.toString()}?fiat-settlement=true`;
};

/**
 * 落札額 (JPY) を 3 桁区切りの表示形式に整形
 * 100000 → "100,000"
 */
export const formatJpyAmount = (jpyAmount: number): string => {
  return jpyAmount.toLocaleString('ja-JP');
};

/**
 * 落札通知 email template を生成
 * subject + text 本文 + html 本文 + settlementUrl を返す
 */
export const buildWinnerEmail = (input: WinnerEmailInput): WinnerEmailOutput => {
  const { auctionId, jpyAmount, webappBaseUrl } = input;
  const settlementUrl = buildSettlementUrl(webappBaseUrl, auctionId);
  const formattedAmount = formatJpyAmount(jpyAmount);

  const subject = `【Niji DAO】auction #${auctionId.toString()} を落札しました。 決済確定のお願い`;

  const text = [
    'Niji DAO をご利用いただきありがとうございます。',
    '',
    `auction #${auctionId.toString()} を落札されました。`,
    `落札額 = ${formattedAmount} 円`,
    '',
    '以下 URL より 24 時間以内に決済確定をお願いします。',
    `決済確定 URL — ${settlementUrl}`,
    '',
    '決済確定手順 —',
    '1. 上記 URL を開くと決済確定 modal が表示されます',
    '2. 「クレカ決済を確定します」 button を押下',
    '3. 3D セキュア 2.0 認証を完了',
    '4. 決済確定後、 運営から NFT を wallet に送付します (通常数分以内)',
    '',
    'ご不明点は support@niji-dao.example までご連絡ください。',
    '',
    'Niji DAO 運営',
  ].join('\n');

  const html = [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '<head><meta charset="utf-8"><title>' + subject + '</title></head>',
    '<body style="font-family: sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 2rem;">',
    '  <h1 style="font-size: 1.4rem;">auction #' + auctionId.toString() + ' を落札されました</h1>',
    '  <p>Niji DAO をご利用いただきありがとうございます。</p>',
    '  <p>落札額 — <strong>' + formattedAmount + ' 円</strong></p>',
    '  <p>以下 button より 24 時間以内に決済確定をお願いします。</p>',
    '  <p style="text-align: center; margin: 2rem 0;">',
    '    <a href="' +
      settlementUrl +
      '" style="display: inline-block; padding: 0.8rem 2rem; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px;">',
    '      決済を確定する',
    '    </a>',
    '  </p>',
    '  <h2 style="font-size: 1.1rem;">決済確定手順</h2>',
    '  <ol>',
    '    <li>上記 button を押下すると決済確定 modal が表示されます</li>',
    '    <li>「クレカ決済を確定します」 button を押下</li>',
    '    <li>3D セキュア 2.0 認証を完了</li>',
    '    <li>決済確定後、 運営から NFT を wallet に送付します (通常数分以内)</li>',
    '  </ol>',
    '  <p style="color: #666; font-size: 0.9rem; margin-top: 2rem;">',
    '    ご不明点は <a href="mailto:support@niji-dao.example">support@niji-dao.example</a> までご連絡ください。<br>',
    '    Niji DAO 運営',
    '  </p>',
    '</body>',
    '</html>',
  ].join('\n');

  return { subject, text, html, settlementUrl };
};
