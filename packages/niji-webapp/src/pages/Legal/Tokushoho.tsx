/**
 * 特定商取引法に基づく表記 static page (Issue #3011 Phase A)
 *
 * 役割 —
 * GMO クレカ決済 (fiat bid) 導入に伴う加盟店契約要件を満たす static page。
 * grilling P5 で確定した「特商法表記を webapp footer 経由で常時参照可能に置く」 要件の実装。
 *
 * 販売者情報 4 項目 (販売者名 / 住所 / 電話 / 代表者) は Phase 1 では placeholder。
 * Phase 3 本番切替時に user 確認済の運営会社確定情報を反映する ([TODO: Phase 3 本番切替時 user 確認] marker)。
 *
 * SSOT —
 * - tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5
 * - tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md § Issue 8
 */

import * as React from 'react';

/**
 * 特商法 8 項目の記載内容
 * 販売者情報 4 項目は Phase 3 で確定、 Phase 1 は placeholder + TODO marker
 */
export const TOKUSHOHO_TODO_MARKER = '[TODO: Phase 3 本番切替時 user 確認]';

export type TokushohoItem = {
  label: string;
  value: string;
  isPlaceholder: boolean;
};

/**
 * 特商法 8 項目の SSOT
 * export しておくと test で 8 件揃っているか / placeholder 4 件を verify 可能
 */
export const tokushohoItems: TokushohoItem[] = [
  {
    label: '販売者名',
    value: `${TOKUSHOHO_TODO_MARKER} (運営会社名を Phase 3 で反映)`,
    isPlaceholder: true,
  },
  {
    label: '所在地',
    value: `${TOKUSHOHO_TODO_MARKER} (運営会社所在地を Phase 3 で反映)`,
    isPlaceholder: true,
  },
  {
    label: '電話番号',
    value: `${TOKUSHOHO_TODO_MARKER} (問合せ電話番号を Phase 3 で反映)`,
    isPlaceholder: true,
  },
  {
    label: '代表者',
    value: `${TOKUSHOHO_TODO_MARKER} (代表者名を Phase 3 で反映)`,
    isPlaceholder: true,
  },
  {
    label: '販売価格',
    value:
      'auction 落札額 (日本円表示、 決済時に spot rate 換算)。 auction 進行中の入札単位は最低 1000 円 (Phase 1 MVP)。',
    isPlaceholder: false,
  },
  {
    label: '支払方法',
    value:
      'クレジットカード (VISA / Master / JCB / AMEX)。 3D セキュア 2.0 認証必須、 認証失敗時は決済不可。',
    isPlaceholder: false,
  },
  {
    label: '商品引渡時期',
    value:
      'GMO 決済確定後、 運営 EOA から user wallet に NijiToken (ERC-721) を transferFrom (通常数分以内)。 RPC 遅延 / gas 不足時は運営が手動 retry (最大 3 回 / 1h 間隔)。',
    isPlaceholder: false,
  },
  {
    label: '返品ポリシー',
    value:
      'NFT の特性上、 決済確定後の返品は原則不可。 chargeback (card 会社経由の dispute) は card 会社所定の手続に従う。',
    isPlaceholder: false,
  },
];

export const Tokushoho = (): React.JSX.Element => {
  return (
    <main
      style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}
      data-testid="legal-tokushoho"
    >
      <h1 style={{ marginBottom: '0.5rem' }}>特定商取引法に基づく表記</h1>
      <p style={{ marginBottom: '2rem', color: '#555' }}>
        本表記は「特定商取引に関する法律」 第 11 条 (通信販売の広告) に基づき、 Niji DAO が運営する
        auction (fiat bid 経路 = クレジットカード決済) について記載します。
      </p>

      <dl>
        {tokushohoItems.map(item => (
          <div
            key={item.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid #eee',
            }}
            data-testid={`tokushoho-item-${item.label}`}
          >
            <dt style={{ fontWeight: 'bold' }}>{item.label}</dt>
            <dd
              style={{ margin: 0, color: item.isPlaceholder ? '#a15c00' : '#222' }}
              data-testid={item.isPlaceholder ? 'tokushoho-placeholder' : 'tokushoho-confirmed'}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <section style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h2 style={{ fontSize: '1.1rem' }}>補足事項</h2>
        <ul>
          <li>
            Phase 1 は Base Sepolia (testnet) 環境での MVP 運用、 実 JPY 決済は Phase 3
            以降で開始する
          </li>
          <li>
            chargeback / dispute 対応は運営 email 窓口経由で受付、 GMO
            ペイメントゲートウェイ経由で処理する
          </li>
          <li>NFT の on-chain 保有は user wallet に紐づき、 運営側からの剥奪は技術的に不可</li>
        </ul>
      </section>
    </main>
  );
};

export default Tokushoho;
