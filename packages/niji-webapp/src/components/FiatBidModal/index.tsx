/**
 * FiatBidModal — クレカで JPY 建てで bid する modal (Issue #3009 Phase C + Issue #3025 Phase 2 増額 branch)
 *
 * Issue #3033 以降、 form 本体は FiatBidForm.tsx に切出、 本 file は Dialog wrapper のみ担当する。
 * BidModal (Tabs 経路、 Issue #3033) と単独 FiatBidModal (fiat 専用経路、 既存 test 互換) の 2 経路で
 * FiatBidForm を reuse する構造。
 *
 * Issue #3039 以降 — site design (cool/warm palette + PT Root UI) に統合。
 * BidModal.module.css を共有して DialogContent 側に palette 適用、 内部 form は FiatBidForm 側で処理。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P7、
 *        Phase1-02-issue-breakdown.md § Issue 6、
 *        Phase2-01-master-spec.md § P7、
 *        Phase2-02-issue-breakdown.md § Issue P2-4、
 *        Issue #3033 (form 抽出 + BidModal Tabs 統合)、
 *        Issue #3039 (palette 統合)。
 */

import * as React from 'react';

import { FiatBidForm } from '@/components/FiatBidModal/FiatBidForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import bidModalClasses from '@/components/BidModal/BidModal.module.css';

// re-export for backward compat (Issue #3051 で validate 系を ETH primary に置換)
export {
  BID_LIMIT_JPY,
  validateEthAmount,
  validateTopupEthAmount,
} from '@/components/FiatBidModal/FiatBidForm';
export type { ExistingFiatBid } from '@/components/FiatBidModal/FiatBidForm';

import type {
  ExistingFiatBid,
  FiatBidFormPalette,
  FiatBidFormProps,
} from '@/components/FiatBidModal/FiatBidForm';

const BID_LIMIT_JPY_DISPLAY = 1_000_000;

/** modal Props (親 Bid から open state を受渡し) */
export type FiatBidModalProps = {
  /** modal open state (親から制御) */
  open: boolean;
  /** palette 種別 (Issue #3039、 default = "cool") */
  palette?: FiatBidFormPalette;
} & FiatBidFormProps;

/**
 * FiatBidModal component
 *
 * Dialog wrapper + FiatBidForm 呼出。
 * open=true で modal を描画、 form 内 submit で useFiatBid.authorize (Phase 1) or
 * useFiatBid.topup (Phase 2 増額 branch) を呼出。
 */
export const FiatBidModal = ({
  open,
  onClose,
  auctionId,
  bidderWallet,
  minBidEth,
  existingFiatBid,
  palette = 'cool',
  fetchersOverride,
  spotRateOverride,
}: FiatBidModalProps): React.JSX.Element => {
  const isTopupMode = existingFiatBid !== undefined;
  const modalTitle = isTopupMode ? '増額 bid (ETH)' : 'クレカで bid (ETH)';
  const modalDescription = isTopupMode
    ? `現在の bid 額 ${(existingFiatBid as ExistingFiatBid).ethAmount} ETH を増額します。 上限 JPY 換算 ${BID_LIMIT_JPY_DISPLAY.toLocaleString()} 円、 GMO 決済時に spot rate で JPY 請求されます。`
    : `ETH 額を入力して bid します。 上限 JPY 換算 ${BID_LIMIT_JPY_DISPLAY.toLocaleString()} 円、 GMO 決済時に spot rate で JPY 請求されます。`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        data-testid="fiat-bid-modal"
        data-mode={isTopupMode ? 'topup' : 'new-bid'}
        data-palette={palette}
        className={bidModalClasses.dialogContent}
      >
        <DialogHeader>
          <DialogTitle className={bidModalClasses.dialogTitle}>{modalTitle}</DialogTitle>
          <DialogDescription className={bidModalClasses.dialogDescription}>
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        <FiatBidForm
          onClose={onClose}
          auctionId={auctionId}
          bidderWallet={bidderWallet}
          minBidEth={minBidEth}
          existingFiatBid={existingFiatBid}
          palette={palette}
          fetchersOverride={fetchersOverride}
          spotRateOverride={spotRateOverride}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FiatBidModal;
