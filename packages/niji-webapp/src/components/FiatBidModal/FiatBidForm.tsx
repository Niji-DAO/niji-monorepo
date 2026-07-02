/**
 * FiatBidForm — クレカ (JPY) bid の form 部分 (Issue #3033 で FiatBidModal から抽出)
 *
 * 役割 — modal の Dialog wrapper を持たず、 form body のみを export する。
 * BidModal (Tabs 経由) から Tab content として組込む用途 + 既存 FiatBidModal から本 form を
 * Dialog で wrap する用途の 2 経路で reuse する。
 *
 * 保持する挙動 (Issue #3009 Phase C + Issue #3025 Phase 2) —
 * (1) JPY 入力 + 現在 spot rate 表示 + ETH 換算表示 (useSpotRate hook 経由)
 * (2) card 情報 (Phase 1 は GMO Token 方式を simulate、 mock で cardToken 生成)
 * (3) 特商法 link + Terms checkbox 強制 (未 check で submit disable)
 * (4) bid 上限 100 万円 client-side validation + backend validation の 2 層
 * (5) 4 段 stepper (Phase 1 新規) / 5 phase stepper (Phase 2 増額 branch)
 * (6) 送信 button click で useFiatBid.authorize (Phase 1) or useFiatBid.topup (Phase 2) を呼出
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P7、 Phase2-01-master-spec.md § P7、
 *        Issue #3033 (bid button 統合 + Tabs 化)。
 */

import type { FiatBidStep, FiatTopupPhase } from '@/hooks/useFiatBid';

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFiatBid } from '@/hooks/useFiatBid';
import { formatEthFromWei, jpyToEthWei, useSpotRate } from '@/hooks/useSpotRate';

/** bid 上限 (spec P4、 100 万円 client-side + backend validation の 2 層) */
export const BID_LIMIT_JPY = 1_000_000;

/** stepper label 表示 (spec P7 の 4 段、 Phase 1) */
const STEP_LABELS: Record<FiatBidStep, string> = {
  idle: '',
  authorizing: '与信枠を取得しています',
  'three-ds': '3D セキュア 2.0 認証中',
  placing: 'bid を送信しています',
  success: 'bid が成立しました',
  failure: '決済確保に失敗しました',
};

/** topup 5 phase stepper label (Phase 2、 Issue #3025) */
const TOPUP_PHASE_LABELS: Record<FiatTopupPhase, string> = {
  idle: '',
  pending: '新与信枠を取得しています',
  'auth-taken': '新 3D セキュア 2.0 認証中',
  'tx-broadcast': '新 bid を送信しています',
  'tx-confirmed': '新 bid が成立しました',
  'cleanup-queued': '旧与信枠の cleanup 中 (別 tab で作業続行可)',
  failure: '増額 bid に失敗しました',
};

/**
 * 増額 bid 用 JPY validation。 旧 jpyAmount より大きく、 100 万円上限に収まる整数のみ ok。
 *
 * Phase 1 の validateJpyAmount は「1 以上 + 100 万円以下」 のみ、 増額 branch では
 * 旧 jpyAmount 超過の追加 check を強制する (backend validation と 2 層で重畳)。
 */
export const validateTopupJpyAmount = (
  raw: string,
  oldJpyAmount: number,
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
  if (parsed <= oldJpyAmount) {
    return {
      ok: false,
      message: `増額のみ受付可能です (現 bid 額 ${oldJpyAmount.toLocaleString()} 円より大きい額を入力してください)`,
    };
  }
  return { ok: true, value: parsed };
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

/**
 * 既存 fiat_bid record 情報 (親から渡す、 Phase 2 増額 branch trigger)
 *
 * 存在する場合 = user が同 auction で既に fiat bid 成立済 → 「増額 bid」 mode 表示
 * undefined 時 = Phase 1 の新規 bid mode (default)
 */
export type ExistingFiatBid = {
  /** 既存 fiat_bid の authId (topup endpoint request の authId) */
  authId: string;
  /** 既存 fiat_bid の jpyAmount (増額 validation の下限、 backend と 2 層で強制) */
  jpyAmount: number;
};

/** form Props (BidModal Tab 経路 + 単独 FiatBidModal 経路の両方で受渡し) */
export type FiatBidFormProps = {
  /** modal close callback (form 内 cancel button + 完了時に親から close 経路を呼ぶ) */
  onClose: () => void;
  /** auction ID (bid 対象) */
  auctionId: string;
  /** bidder wallet address (親から wagmi useAccount 経由で渡す) */
  bidderWallet: string;
  /** 既存 fiat_bid record (存在すれば「増額 bid」 branch に切替、 Phase 2 Issue #3025) */
  existingFiatBid?: ExistingFiatBid;
  /** test 用 injectable — useFiatBid の fetchers 差替経路 */
  fetchersOverride?: Parameters<typeof useFiatBid>[0];
  /** test 用 injectable — useSpotRate の option 差替経路 */
  spotRateOverride?: Parameters<typeof useSpotRate>[0];
  /** test 用 injectable — cardToken 生成関数 (default = generateMockCardToken) */
  generateCardToken?: () => string;
};

/**
 * FiatBidForm component
 *
 * form 本体のみを render (Dialog wrapper は持たない、 BidModal Tab 経路と単独 FiatBidModal 経路で共有)。
 */
export const FiatBidForm = ({
  onClose,
  auctionId,
  bidderWallet,
  existingFiatBid,
  fetchersOverride,
  spotRateOverride,
  generateCardToken = generateMockCardToken,
}: FiatBidFormProps): React.JSX.Element => {
  const [jpyRaw, setJpyRaw] = useState<string>('');
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [emailRaw, setEmailRaw] = useState<string>('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const spotRate = useSpotRate(spotRateOverride);
  const fiatBid = useFiatBid(fetchersOverride);

  const isTopupMode = existingFiatBid !== undefined;

  const newBidValidation = useMemo(() => validateJpyAmount(jpyRaw), [jpyRaw]);
  const topupValidation = useMemo(
    () =>
      existingFiatBid !== undefined
        ? validateTopupJpyAmount(jpyRaw, existingFiatBid.jpyAmount)
        : undefined,
    [jpyRaw, existingFiatBid],
  );

  const jpyValidation = isTopupMode ? topupValidation! : newBidValidation;

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
    fiatBid.step === 'placing' ||
    fiatBid.topupPhase === 'pending';

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

      if (isTopupMode && existingFiatBid !== undefined) {
        await fiatBid.topup({
          authId: existingFiatBid.authId,
          newJpyAmount: jpyValidation.value,
          cardToken,
        });
        return;
      }

      await fiatBid.authorize({
        auctionId,
        bidderWallet,
        bidderEmail: emailRaw.trim() === '' ? undefined : emailRaw.trim(),
        jpyAmount: jpyValidation.value,
        cardToken,
      });
    },
    [
      jpyValidation,
      termsChecked,
      generateCardToken,
      fiatBid,
      auctionId,
      bidderWallet,
      emailRaw,
      isTopupMode,
      existingFiatBid,
    ],
  );

  const handleCancel = useCallback(() => {
    if (
      fiatBid.step === 'authorizing' ||
      fiatBid.step === 'placing' ||
      fiatBid.topupPhase === 'pending'
    ) {
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

  const currentStepLabel = isTopupMode
    ? TOPUP_PHASE_LABELS[fiatBid.topupPhase]
    : STEP_LABELS[fiatBid.step];
  const errorMessage = localError ?? fiatBid.errorMessage;

  const currentStepValue = isTopupMode ? fiatBid.topupPhase : fiatBid.step;
  const stepperTestId = isTopupMode ? 'fiat-topup-stepper' : 'fiat-bid-stepper';
  const submitButtonLabel = isTopupMode ? '増額 bid を実行' : 'bid を実行';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        {isTopupMode && existingFiatBid !== undefined && (
          <div
            className="rounded-md bg-blue-50 p-3 text-sm"
            data-testid="fiat-topup-existing-bid-summary"
          >
            <div className="font-medium">現 bid 額</div>
            <div>
              {existingFiatBid.jpyAmount.toLocaleString()} 円 (auth ID = {existingFiatBid.authId})
            </div>
          </div>
        )}

        <div>
          <label htmlFor="fiat-bid-jpy-amount" className="mb-1 block text-sm font-medium">
            {isTopupMode ? '新 bid 額 (JPY、 現額より大きい額)' : 'bid 額 (JPY)'}
          </label>
          <Input
            id="fiat-bid-jpy-amount"
            type="number"
            min={1}
            max={BID_LIMIT_JPY}
            value={jpyRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJpyRaw(e.target.value)}
            placeholder={
              isTopupMode && existingFiatBid !== undefined
                ? `例) ${(existingFiatBid.jpyAmount + 10_000).toLocaleString()}`
                : '例) 50000'
            }
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
            {spotRate.rate !== undefined ? `${spotRate.rate.toLocaleString()} JPY / ETH` : '取得中'}
            {spotRate.source !== undefined && (
              <span className="ml-2 text-xs text-gray-500">(source: {spotRate.source})</span>
            )}
          </div>
          <div>ETH 換算 = {ethWei === 0n ? '—' : `${formatEthFromWei(ethWei)} ETH`}</div>
        </div>

        {!isTopupMode && (
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
        )}

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermsChecked(e.target.checked)}
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
            data-testid={stepperTestId}
            data-step={currentStepValue}
          >
            {currentStepLabel}
          </div>
        )}

        {isTopupMode && fiatBid.topupPhase === 'cleanup-queued' && (
          <div
            className="rounded-md bg-yellow-50 p-3 text-xs"
            data-testid="fiat-topup-cleanup-disclaimer"
          >
            旧 authorization の cleanup 処理は非同期で進行しています。 modal を閉じたり、 別 tab
            で他の操作を続けても問題ありません。
          </div>
        )}

        {errorMessage !== undefined && (
          <div className="text-sm text-red-600" data-testid="fiat-bid-error-message">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          data-testid="fiat-bid-cancel"
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={submitDisabled} data-testid="fiat-bid-submit">
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

export default FiatBidForm;
