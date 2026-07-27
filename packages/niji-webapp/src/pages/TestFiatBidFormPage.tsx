/**
 * TestFiatBidFormPage — e2e 専用の FiatBidForm 直接 mount page (2026-07-17)。
 *
 * 経緯 —
 * `/` route 経由の FiatBidForm 到達は wallet 接続 + auction active state + subgraph fetch の 3 依存が必要、
 * anvil 環境で auto-settler が常時 auction progress するため e2e で bid button 出現待ちが不安定
 * (実測 12 回 reload polling 2 分でも fail)。 本 page は FiatBidForm を直接 mount して依存を排除、
 * CardInput 4 field + fincode.tokens() + real authorize-fincode-server (:42071) chain を verify する。
 *
 * 経路 —
 * `import.meta.env.DEV` 限定で App.tsx に route 登録、 production build には含まれない (Vite dead code elimination)。
 * query params で auctionId / bidderWallet / minBidEth を受取り FiatBidForm を mount する。
 *
 * SSOT — packages/niji-webapp/src/components/FiatBidModal/FiatBidForm.tsx (form 実装)、
 *        packages/niji-webapp/src/pages/TestFiatSettlementModal.tsx (pattern reference)。
 */

import { useCallback, useState } from 'react';

import { useSearchParams } from 'react-router';

import { FiatBidForm } from '@/components/FiatBidModal/FiatBidForm';

export const TestFiatBidFormPage = () => {
  const [params] = useSearchParams();
  const auctionId = params.get('auctionId') ?? '1';
  const bidderWallet = params.get('bidderWallet') ?? '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const minBidEthRaw = params.get('minBidEth');
  const minBidEth = minBidEthRaw !== null ? Number(minBidEthRaw) : 0.001;

  // 2026-07-17 追加 = e2e で auto-close 挙動 verify するため close state で form を unmount する。
  const [closed, setClosed] = useState(false);
  const handleClose = useCallback(() => {
    console.log('[TestFiatBidFormPage] onClose invoked → form unmount');
    setClosed(true);
  }, []);

  return (
    <div data-testid="test-fiat-bid-form-page" style={{ padding: 24, maxWidth: 640 }}>
      <h1>Test: FiatBidForm</h1>
      <p>
        FiatBidForm を直接 mount する e2e 専用 page。 production build には含まれない (isDev gate)。
      </p>
      {closed ? (
        <div data-testid="fiat-bid-form-closed">Modal は auto-close 済</div>
      ) : (
        <FiatBidForm
          onClose={handleClose}
          auctionId={auctionId}
          bidderWallet={bidderWallet}
          minBidEth={minBidEth}
          palette="cool"
        />
      )}
    </div>
  );
};

export default TestFiatBidFormPage;
