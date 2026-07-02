import { lazy, Suspense } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useAccount } from 'wagmi';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@/index.css';

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
