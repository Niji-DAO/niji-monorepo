/**
 * FiatBidModal — クレカで JPY 建てで bid する modal (Issue #3009 Phase C)
 *
 * 役割 —
 * (1) auction ページの Bid component から open される modal
 * (2) JPY 入力 + 現在 spot rate 表示 + ETH 換算表示 (useSpotRate hook 経由)
 * (3) card 情報 (Phase 1 は GMO Token 方式を simulate、 mock で cardToken 生成)
 * (4) 特商法 link + Terms checkbox 強制 (未 check で submit disable)
 * (5) bid 上限 100 万円 client-side validation + backend validation の 2 層
 * (6) 4 段 stepper (「与信枠取得中」 → 「3DS 認証中」 → 「bid 送信中」 → 「bid 成功」)
 *     を useFiatBid hook step と同期表示
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P7 (A' 案 = wallet 接続必須 + fiat modal 切替)、
 *        Phase1-02-issue-breakdown.md § Issue 6。
 */

import type { FiatBidStep } from '@/hooks/useFiatBid';

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFiatBid } from '@/hooks/useFiatBid';
import { formatEthFromWei, jpyToEthWei, useSpotRate } from '@/hooks/useSpotRate';

/** bid 上限 (spec P4、 100 万円 client-side + backend validation の 2 層) */
export const BID_LIMIT_JPY = 1_000_000;

/** stepper label 表示 (spec P7 の 4 段) */
const STEP_LABELS: Record<FiatBidStep, string> = {
  idle: '',
  authorizing: '与信枠を取得しています',
  'three-ds': '3D セキュア 2.0 認証中',
  placing: 'bid を送信しています',
  success: 'bid が成立しました',
  failure: '決済確保に失敗しました',
};

/**
 * card Token 生成 (Phase 1 mock 経路)
 *
 * 実 GMO 統合時は window.Multipayment.getToken 経由で GMO 公開鍵ベースの Token 化を行うが、
 * Phase 1 では mock server で simulate する契約なので client-side でも同 shape で mock 生成する。
 * mock cardToken = `mock-tok-${timestamp}` 形式、 backend の mock GmoClient が受理する。
 */
export const generateMockCardToken = (): string => {
  return `mock-tok-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

/** JPY 入力の client-side validation */
export const validateJpyAmount = (
  raw: string,
): { ok: true; value: number } | { ok: false; message: string } => {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, message: 'JPY 額を入力してください' };
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { ok: false, message: 'JPY 額は正の整数で入力してください' };
  }
  if (parsed > BID_LIMIT_JPY) {
    return { ok: false, message: `bid 上限 ${BID_LIMIT_JPY.toLocaleString()} 円を超えています` };
  }
  return { ok: true, value: parsed };
};

/** modal Props (親 Bid から open state を受渡し) */
export type FiatBidModalProps = {
  /** modal open state (親から制御) */
  open: boolean;
  /** modal close callback */
  onClose: () => void;
  /** auction ID (bid 対象) */
  auctionId: string;
  /** bidder wallet address (親から wagmi useAccount 経由で渡す) */
  bidderWallet: string;
  /** test 用 injectable — useFiatBid の fetchers 差替経路 */
  fetchersOverride?: Parameters<typeof useFiatBid>[0];
  /** test 用 injectable — useSpotRate の option 差替経路 */
  spotRateOverride?: Parameters<typeof useSpotRate>[0];
  /** test 用 injectable — cardToken 生成関数 (default = generateMockCardToken) */
  generateCardToken?: () => string;
};

/**
 * FiatBidModal component
 *
 * open=true で modal を描画、 submit で useFiatBid.authorize を呼出、
 * 成功時は hook 側で 3DS 画面へ full redirect、 fail 時は stepper に error 表示。
 */
export const FiatBidModal = ({
  open,
  onClose,
  auctionId,
  bidderWallet,
  fetchersOverride,
  spotRateOverride,
  generateCardToken = generateMockCardToken,
}: FiatBidModalProps): React.JSX.Element => {
  const [jpyRaw, setJpyRaw] = useState<string>('');
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [emailRaw, setEmailRaw] = useState<string>('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const spotRate = useSpotRate(spotRateOverride);
  const fiatBid = useFiatBid(fetchersOverride);

  const jpyValidation = useMemo(() => validateJpyAmount(jpyRaw), [jpyRaw]);
  const ethWei = useMemo(() => {
    if (!jpyValidation.ok || spotRate.rate === undefined) return 0n;
    return jpyToEthWei(jpyValidation.value, spotRate.rate);
  }, [jpyValidation, spotRate.rate]);

  const submitDisabled =
    !jpyValidation.ok ||
    !termsChecked ||
    spotRate.rate === undefined ||
    fiatBid.step === 'authorizing' ||
    fiatBid.step === 'three-ds' ||
    fiatBid.step === 'placing';

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLocalError(undefined);

      if (!jpyValidation.ok) {
        setLocalError(jpyValidation.message);
        return;
      }
      if (!termsChecked) {
        setLocalError('特商法および利用規約への同意が必要です');
        return;
      }

      const cardToken = generateCardToken();
      await fiatBid.authorize({
        auctionId,
        bidderWallet,
        bidderEmail: emailRaw.trim() === '' ? undefined : emailRaw.trim(),
        jpyAmount: jpyValidation.value,
        cardToken,
      });
    },
    [jpyValidation, termsChecked, generateCardToken, fiatBid, auctionId, bidderWallet, emailRaw],
  );

  const handleClose = useCallback(() => {
    if (fiatBid.step === 'authorizing' || fiatBid.step === 'placing') {
      // 通信中は close させない (与信枠取得済 + tx 発火中の state 不整合防止)
      return;
    }
    fiatBid.reset();
    setJpyRaw('');
    setTermsChecked(false);
    setEmailRaw('');
    setLocalError(undefined);
    onClose();
  }, [fiatBid, onClose]);

  const currentStepLabel = STEP_LABELS[fiatBid.step];
  const errorMessage = localError ?? fiatBid.errorMessage;

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent data-testid="fiat-bid-modal">
        <DialogHeader>
          <DialogTitle>クレカで bid (JPY)</DialogTitle>
          <DialogDescription>
            JPY 建てで bid します。 上限 {BID_LIMIT_JPY.toLocaleString()} 円、 現在の spot rate
            に基づき ETH 換算されます。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="fiat-bid-jpy-amount" className="mb-1 block text-sm font-medium">
                bid 額 (JPY)
              </label>
              <Input
                id="fiat-bid-jpy-amount"
                type="number"
                min={1}
                max={BID_LIMIT_JPY}
                value={jpyRaw}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJpyRaw(e.target.value)}
                placeholder="例) 50000"
                data-testid="fiat-bid-jpy-input"
                required
              />
              {!jpyValidation.ok && jpyRaw !== '' && (
                <p className="mt-1 text-sm text-red-600" data-testid="fiat-bid-jpy-error">
                  {jpyValidation.message}
                </p>
              )}
            </div>

            <div className="rounded-md bg-gray-50 p-3 text-sm" data-testid="fiat-bid-rate-summary">
              <div>
                現在 spot rate ={' '}
                {spotRate.rate !== undefined
                  ? `${spotRate.rate.toLocaleString()} JPY / ETH`
                  : '取得中'}
                {spotRate.source !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">(source: {spotRate.source})</span>
                )}
              </div>
              <div>ETH 換算 = {ethWei === 0n ? '—' : `${formatEthFromWei(ethWei)} ETH`}</div>
            </div>

            <div>
              <label htmlFor="fiat-bid-email" className="mb-1 block text-sm font-medium">
                通知 email (任意)
              </label>
              <Input
                id="fiat-bid-email"
                type="email"
                value={emailRaw}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailRaw(e.target.value)}
                placeholder="you@example.com"
                data-testid="fiat-bid-email-input"
              />
            </div>

            <div>
              <label htmlFor="fiat-bid-card-token-hint" className="mb-1 block text-sm font-medium">
                card 情報 (GMO Token 方式)
              </label>
              <p id="fiat-bid-card-token-hint" className="text-xs text-gray-500">
                card 情報は GMO 公開鍵で Token 化され、 webapp / niji サーバーには保存されません。
                (Phase 1 は mock Token を simulate)
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="fiat-bid-terms"
                type="checkbox"
                checked={termsChecked}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTermsChecked(e.target.checked)
                }
                className="mt-1"
                data-testid="fiat-bid-terms-checkbox"
              />
              <label htmlFor="fiat-bid-terms" className="text-sm">
                <a
                  href="/legal/tokushoho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  特商法に関する表記
                </a>{' '}
                および利用規約に同意します
              </label>
            </div>

            {currentStepLabel !== '' && (
              <div
                className="rounded-md border p-3 text-sm"
                data-testid="fiat-bid-stepper"
                data-step={fiatBid.step}
              >
                {currentStepLabel}
              </div>
            )}

            {errorMessage !== undefined && (
              <div className="text-sm text-red-600" data-testid="fiat-bid-error-message">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="fiat-bid-cancel"
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitDisabled} data-testid="fiat-bid-submit">
              bid を実行
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FiatBidModal;
