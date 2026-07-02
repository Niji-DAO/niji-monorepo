/**
 * FiatBidModal — クレカで JPY 建てで bid する modal (Issue #3009 Phase C + Issue #3025 Phase 2 増額 branch)
 *
 * Issue #3033 以降、 form 本体は FiatBidForm.tsx に切出、 本 file は Dialog wrapper のみ担当する。
 * BidModal (Tabs 経路、 Issue #3033) と単独 FiatBidModal (fiat 専用経路、 既存 test 互換) の 2 経路で
 * FiatBidForm を reuse する構造。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P7、
 *        Phase1-02-issue-breakdown.md § Issue 6、
 *        Phase2-01-master-spec.md § P7、
 *        Phase2-02-issue-breakdown.md § Issue P2-4、
 *        Issue #3033 (form 抽出 + BidModal Tabs 統合)。
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

// re-export for backward compat (既存 import 経路を壊さない)
export {
  BID_LIMIT_JPY,
  generateMockCardToken,
  validateJpyAmount,
  validateTopupJpyAmount,
} from '@/components/FiatBidModal/FiatBidForm';
export type { ExistingFiatBid } from '@/components/FiatBidModal/FiatBidForm';

import type { ExistingFiatBid, FiatBidFormProps } from '@/components/FiatBidModal/FiatBidForm';

const BID_LIMIT_JPY_DISPLAY = 1_000_000;

/** modal Props (親 Bid から open state を受渡し) */
export type FiatBidModalProps = {
  /** modal open state (親から制御) */
  open: boolean;
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
  existingFiatBid,
  fetchersOverride,
  spotRateOverride,
  generateCardToken,
}: FiatBidModalProps): React.JSX.Element => {
  const isTopupMode = existingFiatBid !== undefined;
  const modalTitle = isTopupMode ? '増額 bid (JPY)' : 'クレカで bid (JPY)';
  const modalDescription = isTopupMode
    ? `現在の bid 額 ${(existingFiatBid as ExistingFiatBid).jpyAmount.toLocaleString()} 円を増額します。 上限 ${BID_LIMIT_JPY_DISPLAY.toLocaleString()} 円、 現在の spot rate に基づき ETH 換算されます。`
    : `JPY 建てで bid します。 上限 ${BID_LIMIT_JPY_DISPLAY.toLocaleString()} 円、 現在の spot rate に基づき ETH 換算されます。`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
    >
      <DialogContent data-testid="fiat-bid-modal" data-mode={isTopupMode ? 'topup' : 'new-bid'}>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <FiatBidForm
          onClose={onClose}
          auctionId={auctionId}
          bidderWallet={bidderWallet}
          existingFiatBid={existingFiatBid}
          fetchersOverride={fetchersOverride}
          spotRateOverride={spotRateOverride}
          generateCardToken={generateCardToken}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FiatBidModal;
