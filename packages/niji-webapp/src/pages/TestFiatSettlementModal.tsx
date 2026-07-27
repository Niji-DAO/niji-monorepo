/**
 * TestFiatSettlementModal — e2e (kiwa + Playwright) 専用の Modal 直接 mount page (Issue TC-FB11 activate)。
 *
 * 経緯 —
 * FiatSettlementModal + useFiatSettlement + backend capture/transfer endpoint は Phase 3 完遂で完成、
 * ただし「auction settle 時に fiat winner を判定して Modal を auto-open する」 SettlementWatcher hook が
 * production 経路に未接続。 本 page は e2e 側で Modal 単体の統合 test (capture → transfer → success →
 * txHash 表示) を可能にするための test-only route を提供する。
 *
 * 経路 —
 * `import.meta.env.DEV` 限定で App.tsx 側に route 登録、 production build には含まれない (Vite が
 * dead code elimination)。 query params で authId / auctionId / jpyAmount を受取り、
 * FiatSettlementModal を open=true で mount する。 capture / transfer は default fetcher (fetch → /api/v1/*)、
 * Playwright test 側で page.route mock を貼って backend 起動不要で verify する設計。
 *
 * SSOT — packages/niji-webapp/src/components/FiatSettlementModal/index.tsx (Modal 実装)、
 *        packages/niji-webapp/src/hooks/useFiatSettlement.ts (capture → transfer chain)、
 *        packages/niji-webapp/tests/e2e/fiat-bid.spec.ts § TC-FB11 (本 page を叩く e2e)。
 */

import { useCallback, useState } from 'react';

import { useSearchParams } from 'react-router';

import { FiatSettlementModal } from '@/components/FiatSettlementModal';

export const TestFiatSettlementModalPage = () => {
  const [params] = useSearchParams();
  const authId = params.get('authId') ?? 'e2e-test-auth-id';
  const auctionId = params.get('auctionId') ?? '1';
  const jpyAmountRaw = params.get('jpyAmount');
  const jpyAmount = jpyAmountRaw !== null ? Number(jpyAmountRaw) : 10_000;

  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <div data-testid="test-fiat-settlement-page" style={{ padding: 24 }}>
      <h1>Test: FiatSettlementModal</h1>
      <p>Modal を直接 mount する e2e 専用 page。 production build には含まれない (isDev gate)。</p>
      <FiatSettlementModal
        open={open}
        onClose={handleClose}
        authId={authId}
        auctionId={auctionId}
        jpyAmount={jpyAmount}
      />
    </div>
  );
};

export default TestFiatSettlementModalPage;
