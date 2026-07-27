import { lazy, Suspense } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useAccount } from 'wagmi';

// CSS 順序 = index.css (@tailwind base 含む) を先に、 bootstrap.min.css を後に load する。
// bootstrap → index.css の順だと tailwind preflight が bootstrap の accordion / collapse 系 style を
// 上書きし、 Documentation accordion 開いた content が 一瞬表示 → 消える bug が発生していた (Issue #3091)。
// tailwind utilities は class ベースで individual だが preflight (base reset) は universal reset で bootstrap の
// component style と衝突する。 bootstrap を最後 load することで preflight を上書きし、
// accordion transition / collapse display state が正常動作する。
import '@/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Footer } from '@/components/Footer';
import NavBar from '@/components/NavBar';
import NetworkAlert from '@/components/NetworkAlert';
import { Toaster } from '@/components/ui/sonner';
import { CHAIN_ID } from '@/config';
// AuctionPage は default route (/ と /niji/:id) で FCP に必須なので eager import 維持。
// 他 21 pages は React.lazy で code splitting、 main bundle から切り離し。
import AuctionPage from '@/pages/Auction';

const BrandAssetsPage = lazy(() =>
  import('@/pages/BrandAssets/BrandAssetsPage').then(m => ({ default: m.BrandAssetsPage })),
);
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })),
);
const CandidatePage = lazy(() => import('@/pages/Candidate'));
const CandidateHistoryPage = lazy(() => import('@/pages/CandidateHistoryPage'));
const CreateCandidatePage = lazy(() => import('@/pages/CreateCandidate'));
const CreateProposalPage = lazy(() => import('@/pages/CreateProposal'));
const CrystalBallPage = lazy(() => import('@/pages/CrystalBall'));
const DelegatePage = lazy(() => import('@/pages/DelegatePage'));
const EditCandidatePage = lazy(() => import('@/pages/EditCandidate'));
const EditProposalPage = lazy(() => import('@/pages/EditProposal'));
const FaucetPage = lazy(() => import('@/pages/Faucet'));
const ForkPage = lazy(() => import('@/pages/Fork'));
// Issue #3007 = 3DS 2.0 full redirect / return pages (bundle 影響を抑えるため lazy import)
const ThreeDSRedirectPage = lazy(() => import('@/pages/FiatBid/ThreeDSRedirect'));
const ThreeDSReturnPage = lazy(() => import('@/pages/FiatBid/ThreeDSReturn'));
const ForksPage = lazy(() => import('@/pages/Forks'));
const GovernancePage = lazy(() => import('@/pages/Governance'));
// Issue #3011 = 特商法 static page (Phase 1 = webapp footer 経由で常時参照可能に置く)
const TokushohoPage = lazy(() => import('@/pages/Legal/Tokushoho'));
const NijisPage = lazy(() => import('@/pages/NijisPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));
const NoundersPage = lazy(() => import('@/pages/Nounders'));
const Playground = lazy(() => import('@/pages/Playground'));
const ProposalHistory = lazy(() => import('@/pages/ProposalHistory'));
const TraitsPage = lazy(() => import('@/pages/TraitsPage'));
const VotePage = lazy(() => import('@/pages/Vote'));
// TC-FB11 activate = e2e 専用の FiatSettlementModal 直接 mount page (F-04 review 対応 2026-07-27)
//
// 旧実装は `lazy(() => import(...))` の call を top-level に置き、 Route を isDev gate していた。
// この場合 Rollup が dynamic import string を保持するため prod build に `Test*-<hash>.js` chunk が
// 生成される (test-only code + test-id が production artifact に混入する)。
//
// 新実装は import.meta.env.DEV の compile-time 定数分岐で lazy() 自体を prod build から dead code
// eliminate する。 Vite (Rollup) は `import.meta.env.DEV` を build 時定数として fold し、
// `? lazy(...) : null` の 逆枝が eliminate される = prod build に Test*.js chunk が生成されない。
// production の Route branch も `TestPage != null && ...` で render skip する。
const TestFiatSettlementModalPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/TestFiatSettlementModal'))
  : null;
// 2026-07-17 = FiatBidForm 直接 mount page (CardInput + fincode.tokens() 経路 e2e verify、 isDev gate)
const TestFiatBidFormPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/TestFiatBidFormPage'))
  : null;
const TestBidModalPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/TestBidModalPage'))
  : null;

import classes from './App.module.css';

function App() {
  const { chainId } = useAccount();

  dayjs.extend(relativeTime);

  return (
    <div className={`${classes.wrapper}`}>
      {chainId !== undefined && Number(CHAIN_ID) !== chainId && <NetworkAlert />}
      <BrowserRouter>
        <NavBar />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<AuctionPage />} />
            <Route path="/niji/:id" element={<AuctionPage />} />
            <Route path="/nounders" element={<NoundersPage />} />
            <Route path="/create-proposal" element={<CreateProposalPage />} />
            <Route path="/create-candidate" element={<CreateCandidatePage />} />
            <Route path="/vote" element={<GovernancePage />} />
            <Route path="/vote/:id" element={<VotePage />} />
            <Route path="/vote/:id/history" element={<ProposalHistory />} />
            <Route path="/vote/:id/history/:versionNumber" element={<ProposalHistory />} />
            <Route
              path="/vote/:id/edit"
              element={<EditProposalPage match={{ params: { id: ':id' } }} />}
            />
            <Route path="/candidates/:id" element={<CandidatePage />} />
            <Route
              path="/candidates/:id/edit"
              element={<EditCandidatePage match={{ params: { id: ':id' } }} />}
            />
            <Route path="/candidates/:id/history" element={<CandidateHistoryPage />} />
            <Route
              path="/candidates/:id/history/:versionNumber"
              element={<CandidateHistoryPage />}
            />
            <Route path="/playground" element={<Playground />} />
            <Route path="/delegate" element={<DelegatePage />} />
            <Route path="/traits" element={<TraitsPage />} />
            <Route path="/explore" element={<Navigate to="/nijis" replace />} />
            <Route path="/nijis" element={<NijisPage />} />
            <Route path="/fork/:id" element={<ForkPage />} />
            <Route path="/fork" element={<ForksPage />} />
            <Route path="/brand" element={<BrandAssetsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/crystal-ball" element={<CrystalBallPage />} />
            {/* Issue #3007 = fiat bid 3DS 2.0 full redirect + return page (Phase 1 MVP) */}
            <Route path="/fiat-bid/3ds-redirect" element={<ThreeDSRedirectPage />} />
            <Route path="/fiat-bid/3ds-return" element={<ThreeDSReturnPage />} />
            {/* Issue #3011 = 特定商取引法に基づく表記 (GMO 加盟店契約要件、 grilling P5 SSOT) */}
            <Route path="/legal/tokushoho" element={<TokushohoPage />} />
            {Number(CHAIN_ID) === 31337 && <Route path="/faucet" element={<FaucetPage />} />}
            {/* F-04 review 対応 (2026-07-27) = component null check で TypeScript narrowing、
                prod build では import.meta.env.DEV = false で全 branch が dead code eliminate される */}
            {import.meta.env.DEV && TestFiatSettlementModalPage && (
              <Route path="/test/fiat-settlement-modal" element={<TestFiatSettlementModalPage />} />
            )}
            {import.meta.env.DEV && TestFiatBidFormPage && (
              <Route path="/test/fiat-bid-form" element={<TestFiatBidFormPage />} />
            )}
            {import.meta.env.DEV && TestBidModalPage && (
              <Route path="/test/bid-modal" element={<TestBidModalPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
        <Toaster
          expand
          closeButton
          toastOptions={{
            classNames: {
              closeButton:
                '[--toast-close-button-start:auto] [--toast-close-button-end:0] [--toast-close-button-transform:translate(35%,-35%)]',
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
