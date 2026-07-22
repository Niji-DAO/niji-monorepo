/**
 * TestBidModalPage — dev 専用の BidModal 直マウント page (2026-07-23)。
 *
 * 経緯 —
 * `/` route 経由の BidModal は `auction != undefined` + wallet 接続 + auction active state の
 * 3 依存があり、 anvil 起動なしでは開けない。 本 page は BidModal を mock auction data で直接
 * mount し、 ETH tab / fiat tab の意匠比較を視覚的に取れるようにする (design regression 検知用)。
 *
 * 経路 —
 * `import.meta.env.DEV` 限定で App.tsx に route 登録、 production build には含まれない
 * (Vite dead code elimination)。 query params で palette (cool / warm) を切替可能。
 *
 * SSOT — packages/niji-webapp/src/components/BidModal/index.tsx (実体)、
 *        packages/niji-webapp/src/pages/TestFiatBidFormPage.tsx (pattern reference)。
 */

import type { Auction } from '@/wrappers/nijiAuction';

import { useCallback, useState } from 'react';

import { useSearchParams } from 'react-router';

import { BidModal, type BidModalPalette } from '@/components/BidModal';

/** BidModal を開くために最低限必要な mock auction (chain / subgraph 非依存)。 */
const buildMockAuction = (): Auction => ({
  amount: 100_000_000_000_000_000n,
  bidder: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  endTime: BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
  startTime: BigInt(Math.floor(Date.now() / 1000) - 60 * 60),
  nounId: 1n,
  settled: false,
});

export const TestBidModalPage = () => {
  const [params] = useSearchParams();
  const palette = (params.get('palette') === 'warm' ? 'warm' : 'cool') as BidModalPalette;
  const initialTab = params.get('tab') === 'fiat' ? 'fiat' : 'eth';

  const [isOpen, setIsOpen] = useState(true);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <div data-testid="test-bid-modal-page" style={{ padding: 24, maxWidth: 640 }}>
      <h1>Test: BidModal</h1>
      <p>
        BidModal を直接 mount する e2e / 視覚回帰専用 page。 production build には含まれない (isDev
        gate)。
      </p>
      {!isOpen && (
        <button
          type="button"
          data-testid="test-bid-modal-reopen"
          onClick={() => setIsOpen(true)}
          style={{ padding: '8px 16px', borderRadius: 8 }}
        >
          再度開く
        </button>
      )}
      <BidModal
        open={isOpen}
        onClose={handleClose}
        auction={buildMockAuction()}
        bidderWallet="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        palette={palette}
        defaultTab={initialTab}
      />
    </div>
  );
};

export default TestBidModalPage;
