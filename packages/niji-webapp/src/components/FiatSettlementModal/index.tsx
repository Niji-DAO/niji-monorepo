/**
 * FiatSettlementModal — 落札後 GMO capture + NFT transferFrom を実行する modal (Issue #3010 Phase C)
 *
 * 役割 —
 * (1) auction settle で fiat winner 確定した user が opendat 落札通知 (email or webapp) から起動
 * (2) auction 情報 + JPY 額 + 「クレカ決済を確定します」 CTA button を表示
 * (3) CTA click で useFiatSettlement.settleAndTransfer を呼出 (capture → transfer chain)
 * (4) 4 段 stepper で進行状態表示 (capturing / transferring / success / failure)
 * (5) 3DS 追加認証は Phase 1 mock で simulate、 実 GMO 切替時 (Phase 3) に追加 redirect flow を挟む
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P6, P7、
 *        Phase1-02-issue-breakdown.md § Issue 7 Phase C。
 */

import * as React from 'react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type FiatSettlementStep, useFiatSettlement } from '@/hooks/useFiatSettlement';

/** stepper label 表示 */
const STEP_LABELS: Record<FiatSettlementStep, string> = {
  idle: '',
  capturing: 'クレジット決済を確定しています',
  transferring: 'NFT を転送しています',
  success: 'NFT を送付しました',
  failure: '決済または転送に失敗しました',
};

export type FiatSettlementModalProps = {
  /** modal open state */
  open: boolean;
  /** modal close callback */
  onClose: () => void;
  /** 対象 auction ID (表示用) */
  auctionId: string;
  /** GMO auth ID (backend endpoint に渡す key) */
  authId: string;
  /** JPY 額 (表示用) */
  jpyAmount: number;
  /** test 用 injectable — useFiatSettlement の option 差替経路 */
  fetchersOverride?: Parameters<typeof useFiatSettlement>[0];
};

/**
 * FiatSettlementModal component
 *
 * open=true で modal を描画、 CTA click で settleAndTransfer を呼出。
 * step 'success' 到達で「閉じる」 button に切替、 'failure' で「再試行」 + error message 表示。
 */
export const FiatSettlementModal: React.FC<FiatSettlementModalProps> = ({
  open,
  onClose,
  auctionId,
  authId,
  jpyAmount,
  fetchersOverride,
}) => {
  const settlement = useFiatSettlement(fetchersOverride);

  const handleConfirm = useCallback(() => {
    void settlement.settleAndTransfer({ authId, tds2Result: '0' });
  }, [settlement, authId]);

  const handleRetry = useCallback(() => {
    settlement.reset();
    void settlement.settleAndTransfer({ authId, tds2Result: '0' });
  }, [settlement, authId]);

  const isSubmitting = settlement.step === 'capturing' || settlement.step === 'transferring';
  const isSuccess = settlement.step === 'success';
  const isFailure = settlement.step === 'failure';
  const showConfirm = settlement.step === 'idle';

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>落札されました</DialogTitle>
          <DialogDescription>
            Niji #{auctionId} を落札されました。 クレジット決済を確定して NFT を受取ってください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">対象</div>
            <div className="font-medium">Niji #{auctionId}</div>
            <div className="text-muted-foreground">決済額</div>
            <div className="font-medium">¥{jpyAmount.toLocaleString()}</div>
          </div>

          {settlement.step !== 'idle' && (
            <div
              data-testid="fiat-settlement-step-indicator"
              className="border-border bg-muted/30 rounded-md border px-3 py-2 text-sm"
            >
              {STEP_LABELS[settlement.step]}
            </div>
          )}

          {isFailure && settlement.errorMessage !== undefined && (
            <div
              data-testid="fiat-settlement-error"
              role="alert"
              className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            >
              {settlement.errorMessage}
            </div>
          )}

          {isSuccess && settlement.transferResult?.txHash != null && (
            <div
              data-testid="fiat-settlement-txhash"
              className="border-border bg-muted/30 break-all rounded-md border px-3 py-2 font-mono text-xs"
            >
              tx: {settlement.transferResult.txHash}
            </div>
          )}
        </div>

        <DialogFooter>
          {showConfirm && (
            <Button
              data-testid="fiat-settlement-confirm"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              クレカ決済を確定します
            </Button>
          )}
          {isSubmitting && <Button disabled>{STEP_LABELS[settlement.step]}</Button>}
          {isFailure && (
            <Button data-testid="fiat-settlement-retry" onClick={handleRetry}>
              再試行する
            </Button>
          )}
          {isSuccess && (
            <Button data-testid="fiat-settlement-close" onClick={onClose}>
              閉じる
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiatSettlementModal;
