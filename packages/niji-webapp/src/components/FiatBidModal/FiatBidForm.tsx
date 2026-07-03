/**
 * FiatBidForm — クレカ (JPY 決済) bid の form 部分 (Issue #3033 で FiatBidModal から抽出)
 *
 * 役割 — modal の Dialog wrapper を持たず、 form body のみを export する。
 * BidModal (Tabs 経由) から Tab content として組込む用途 + 既存 FiatBidModal から本 form を
 * Dialog で wrap する用途の 2 経路で reuse する。
 *
 * 保持する挙動 (Issue #3009 Phase C + Issue #3025 Phase 2 + Issue #3051 で入力軸反転) —
 * (1) ETH 入力 + 現在 spot rate 表示 + JPY 換算表示 (useSpotRate hook 経由)
 *     — Issue #3051 で JPY 入力 → ETH 入力軸に反転、 ETH tab と同じ入力体系に統一
 * (2) card 情報 (Phase 1 は GMO Token 方式を simulate、 mock で cardToken 生成)
 * (3) 特商法 link + Terms checkbox 強制 (未 check で submit disable)
 * (4) bid 上限 100 万円 client-side validation + backend validation の 2 層
 *     — Issue #3051 以降は ETH * spot rate = JPY 換算値 ≤ 100 万円 で判定
 * (5) 4 段 stepper (Phase 1 新規) / 5 phase stepper (Phase 2 増額 branch)
 * (6) 送信 button click で useFiatBid.authorize (Phase 1) or useFiatBid.topup (Phase 2) を呼出
 *     — Issue #3051 以降は { ethAmount, spotRate, jpyAmount } を primary 契約軸で送信
 *
 * Issue #3039 以降 — site design (cool/warm palette + PT Root UI) に統合。
 * FiatBidForm.module.css で shadcn/ui default class を override、 palette=cool|warm で 2 色系切替。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4 (ETH 固定 SSOT、 Issue #3051 で JPY→ETH に撤廃)、
 *        Phase2-01-master-spec.md § P7、
 *        Issue #3033 (bid button 統合 + Tabs 化)、 Issue #3039 (palette 統合)、
 *        Issue #3051 (JPY→ETH 入力軸反転)。
 */

import type { CardData } from './CardInput';
import type { FiatBidStep, FiatTopupPhase } from '@/hooks/useFiatBid';

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFiatBid } from '@/hooks/useFiatBid';
import { ethToJpy, ethToWei, useSpotRate } from '@/hooks/useSpotRate';

import { CardInput } from './CardInput';
import classes from './FiatBidForm.module.css';
import { DEFAULT_TEST_CARD } from './testCards';

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
 * ETH 額入力 validation 結果 (Issue #3051)。
 *
 * ok=true 時は ETH 額 (float、 例 0.05) + JPY 換算値 (ethAmount × spotRate 丸め) を返し、
 * form 側でそのまま useFiatBid.authorize / topup へ渡す ethAmount / jpyAmount とする。
 */
export type EthValidationResult =
  | { ok: true; value: number; jpyEquivalent: number }
  | { ok: false; message: string };

/**
 * ETH 額入力 validation (Issue #3051、 JPY→ETH 入力軸反転)。
 *
 * 判定順 (fail 時に最初に該当する 1 条件を返す) —
 * (1) 空文字 → 「ETH 額を入力してください」
 * (2) 非有限 or 非正の float → 「ETH 額は正の数で入力してください」
 * (3) spot rate 未取得 → 「spot rate 取得中です、 しばらくお待ちください」
 * (4) minBidEth 未満 → 「minimum bid X ETH 以上を入力してください」
 * (5) JPY 換算 > 100 万円上限 → 「bid 上限 100 万円を超えています (JPY 換算 = 約 X 円)」
 *
 * spot rate は必須 (換算値なしで JPY 上限判定不可)、 undefined は fail branch に落とす。
 * minBidEth は auction contract の min-bid 増分から親 (BidModal) が計算して渡す。
 */
export const validateEthAmount = (
  raw: string,
  minBidEth: number | undefined,
  spotRate: number | undefined,
): EthValidationResult => {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, message: 'ETH 額を入力してください' };
  }
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { ok: false, message: 'ETH 額は正の数で入力してください' };
  }
  if (spotRate === undefined || !Number.isFinite(spotRate) || spotRate <= 0) {
    return { ok: false, message: 'spot rate 取得中です、 しばらくお待ちください' };
  }
  if (minBidEth !== undefined && parsed < minBidEth) {
    return {
      ok: false,
      message: `minimum bid ${minBidEth} ETH 以上を入力してください`,
    };
  }
  const jpyEquivalent = ethToJpy(parsed, spotRate);
  if (jpyEquivalent > BID_LIMIT_JPY) {
    return {
      ok: false,
      message: `bid 上限 ${BID_LIMIT_JPY.toLocaleString()} 円を超えています (JPY 換算 = 約 ${jpyEquivalent.toLocaleString()} 円)`,
    };
  }
  return { ok: true, value: parsed, jpyEquivalent };
};

/**
 * 増額 bid 用 ETH validation (Issue #3051、 JPY→ETH 入力軸反転)。
 *
 * validateEthAmount と同 5 条件 + 「新 ETH 額 > 旧 ETH 額」 の追加 check を強制する。
 * 旧 ETH 額は existingFiatBid.ethAmount (bigint wei) から親が float 換算して渡す。
 * backend の topup endpoint も同 check を強制する (2 層で重畳、 dev-flow の quality.md 準拠)。
 */
export const validateTopupEthAmount = (
  raw: string,
  minBidEth: number | undefined,
  spotRate: number | undefined,
  oldEthAmount: number,
): EthValidationResult => {
  const base = validateEthAmount(raw, minBidEth, spotRate);
  if (!base.ok) return base;
  if (base.value <= oldEthAmount) {
    return {
      ok: false,
      message: `増額のみ受付可能です (現 bid 額 ${oldEthAmount} ETH より大きい額を入力してください)`,
    };
  }
  return base;
};

/**
 * card Token 生成 (Phase 1 mock 経路、 Issue #3047 で cardData 対応拡張)
 *
 * 実 GMO 統合時は window.Multipayment.getToken 経由で GMO 公開鍵ベースの Token 化を行うが、
 * Phase 1 では mock server で simulate する契約なので client-side でも同 shape で mock 生成する。
 *
 * cardData 指定時 = `mock-tok-{brand}-{last4}-{timestamp}` 形式で brand + last4 を埋込み、
 * mock server 側で testCard 種別 (3DS Fail 等) を判定できるようにする。
 * cardData 未指定時 (既存 test 互換) = `mock-tok-{timestamp}-{random}` 形式。
 */
export const generateMockCardToken = (cardData?: CardData): string => {
  const timestamp = Date.now().toString(36);
  if (cardData !== undefined && cardData.number.length >= 4) {
    const last4 = cardData.number.slice(-4);
    return `mock-tok-${cardData.brand}-${last4}-${timestamp}`;
  }
  const random = Math.random().toString(36).slice(2, 8);
  return `mock-tok-${timestamp}-${random}`;
};

/**
 * 既存 fiat_bid record 情報 (親から渡す、 Phase 2 増額 branch trigger)
 *
 * 存在する場合 = user が同 auction で既に fiat bid 成立済 → 「増額 bid」 mode 表示
 * undefined 時 = Phase 1 の新規 bid mode (default)
 *
 * Issue #3051 で入力軸 ETH 反転に伴い ethAmount 追加、 jpyAmount は summary 表示 + 後方互換用に残置。
 */
export type ExistingFiatBid = {
  /** 既存 fiat_bid の authId (topup endpoint request の authId) */
  authId: string;
  /** 既存 fiat_bid の ETH 額 (float、 増額 validation の下限、 Issue #3051 で追加) */
  ethAmount: number;
  /** 既存 fiat_bid の JPY 額 (summary 表示 + audit 用に残置) */
  jpyAmount: number;
};

/**
 * FiatBidForm palette 種別 (Issue #3039、 BidModal と同 SSOT)
 * cool = grey background (デフォルト)、 warm = beige background。
 */
export type FiatBidFormPalette = 'cool' | 'warm';

/** form Props (BidModal Tab 経路 + 単独 FiatBidModal 経路の両方で受渡し) */
export type FiatBidFormProps = {
  /** modal close callback (form 内 cancel button + 完了時に親から close 経路を呼ぶ) */
  onClose: () => void;
  /** auction ID (bid 対象) */
  auctionId: string;
  /** bidder wallet address (親から wagmi useAccount 経由で渡す) */
  bidderWallet: string;
  /**
   * minimum bid ETH 額 (auction contract の 現在 bid + minBidIncPercentage から親が計算)
   * Issue #3051 で入力軸 ETH 反転に伴い追加、 ETH tab と共通 min-bid logic。
   * undefined 時 = 未取得扱いで validation は spot rate check のみ、 minimum bid check は skip。
   */
  minBidEth?: number;
  /** 既存 fiat_bid record (存在すれば「増額 bid」 branch に切替、 Phase 2 Issue #3025) */
  existingFiatBid?: ExistingFiatBid;
  /** palette 種別 (Issue #3039、 default = "cool" で後方互換) */
  palette?: FiatBidFormPalette;
  /** test 用 injectable — useFiatBid の fetchers 差替経路 */
  fetchersOverride?: Parameters<typeof useFiatBid>[0];
  /** test 用 injectable — useSpotRate の option 差替経路 */
  spotRateOverride?: Parameters<typeof useSpotRate>[0];
  /** test 用 injectable — cardToken 生成関数 (default = generateMockCardToken) */
  generateCardToken?: (cardData?: CardData) => string;
  /**
   * dev 環境判定 (Issue #3047、 CardInput の default プリフィル + テストカード dropdown 制御)
   * default = import.meta.env.DEV、 test で override 可能。
   */
  isDev?: boolean;
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
  minBidEth,
  existingFiatBid,
  palette = 'cool',
  fetchersOverride,
  spotRateOverride,
  generateCardToken = generateMockCardToken,
  isDev = import.meta.env.DEV,
}: FiatBidFormProps): React.JSX.Element => {
  const [ethRaw, setEthRaw] = useState<string>('');
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [emailRaw, setEmailRaw] = useState<string>('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  /**
   * cardData 内部 state (Issue #3047 で追加)
   *
   * CardInput の onChange callback で更新、 dev 環境 default で DEFAULT_TEST_CARD をプリフィル、
   * 本番環境 default で空欄 (isCardValid = false → submit disable)。
   * DEFAULT_TEST_CARD は label field を含むので、 CardData shape の 5 field のみ抽出する。
   */
  const [cardData, setCardData] = useState<CardData>(() => {
    if (!isDev) {
      return { number: '', expiry: '', cvv: '', holder: '', brand: 'unknown' };
    }
    const { number, expiry, cvv, holder, brand } = DEFAULT_TEST_CARD;
    return { number, expiry, cvv, holder, brand };
  });
  const [isCardValid, setIsCardValid] = useState<boolean>(isDev);

  const handleCardChange = useCallback((data: CardData, valid: boolean) => {
    setCardData(data);
    setIsCardValid(valid);
  }, []);

  const spotRate = useSpotRate(spotRateOverride);
  const fiatBid = useFiatBid(fetchersOverride);

  const isTopupMode = existingFiatBid !== undefined;

  const newBidValidation = useMemo(
    () => validateEthAmount(ethRaw, minBidEth, spotRate.rate),
    [ethRaw, minBidEth, spotRate.rate],
  );
  const topupValidation = useMemo(
    () =>
      existingFiatBid !== undefined
        ? validateTopupEthAmount(ethRaw, minBidEth, spotRate.rate, existingFiatBid.ethAmount)
        : undefined,
    [ethRaw, minBidEth, spotRate.rate, existingFiatBid],
  );

  const ethValidation = isTopupMode ? topupValidation! : newBidValidation;

  const jpyDisplay = useMemo(() => {
    if (!ethValidation.ok || spotRate.rate === undefined) return '—';
    return `約 ${ethValidation.jpyEquivalent.toLocaleString()} 円`;
  }, [ethValidation, spotRate.rate]);

  const submitDisabled =
    !ethValidation.ok ||
    !termsChecked ||
    !isCardValid ||
    spotRate.rate === undefined ||
    fiatBid.step === 'authorizing' ||
    fiatBid.step === 'three-ds' ||
    fiatBid.step === 'placing' ||
    fiatBid.topupPhase === 'pending';

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLocalError(undefined);

      if (!ethValidation.ok) {
        setLocalError(ethValidation.message);
        return;
      }
      if (!termsChecked) {
        setLocalError('特商法および利用規約への同意が必要です');
        return;
      }
      if (!isCardValid) {
        setLocalError('card 情報を正しく入力してください');
        return;
      }
      if (spotRate.rate === undefined) {
        setLocalError('spot rate 取得中です、 しばらくお待ちください');
        return;
      }

      const cardToken = generateCardToken(cardData);
      // ethRaw から直接 wei 化 (float 中間変換を経由しないため 0.1 → 1e17 wei の精度確保、 viem parseEther 相当)
      const ethAmountWei = ethToWei(ethRaw.trim()).toString();

      if (isTopupMode && existingFiatBid !== undefined) {
        await fiatBid.topup({
          authId: existingFiatBid.authId,
          newEthAmount: ethAmountWei,
          newSpotRate: spotRate.rate,
          newJpyAmount: ethValidation.jpyEquivalent,
          cardToken,
        });
        return;
      }

      await fiatBid.authorize({
        auctionId,
        bidderWallet,
        bidderEmail: emailRaw.trim() === '' ? undefined : emailRaw.trim(),
        ethAmount: ethAmountWei,
        spotRate: spotRate.rate,
        jpyAmount: ethValidation.jpyEquivalent,
        cardToken,
      });
    },
    [
      ethRaw,
      ethValidation,
      termsChecked,
      isCardValid,
      generateCardToken,
      cardData,
      fiatBid,
      auctionId,
      bidderWallet,
      emailRaw,
      isTopupMode,
      existingFiatBid,
      spotRate.rate,
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
    setEthRaw('');
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className={classes.form}
      data-palette={palette}
      data-testid="fiat-bid-form"
    >
      <div className="space-y-4">
        {isTopupMode && existingFiatBid !== undefined && (
          <div className={classes.existingBidSummary} data-testid="fiat-topup-existing-bid-summary">
            <div className={classes.existingBidLabel}>現 bid 額</div>
            <div>
              {existingFiatBid.ethAmount} ETH (JPY 換算 ={' '}
              {existingFiatBid.jpyAmount.toLocaleString()} 円、 auth ID = {existingFiatBid.authId})
            </div>
          </div>
        )}

        <div>
          <label htmlFor="fiat-bid-eth-amount" className={`mb-1 block ${classes.formLabel}`}>
            {isTopupMode ? '新 bid 額 (ETH、 現額より大きい額)' : 'bid 額 (ETH)'}
          </label>
          <Input
            id="fiat-bid-eth-amount"
            type="number"
            min={0}
            step="0.01"
            value={ethRaw}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEthRaw(e.target.value)}
            placeholder={
              isTopupMode && existingFiatBid !== undefined
                ? `Ξ ${(existingFiatBid.ethAmount + 0.01).toFixed(2)}`
                : minBidEth !== undefined
                  ? `Ξ ${minBidEth}`
                  : 'Ξ 0.05'
            }
            data-testid="fiat-bid-eth-input"
            required
            className={classes.ethInput}
          />
          {!ethValidation.ok && ethRaw !== '' && (
            <p className={classes.errorInline} data-testid="fiat-bid-eth-error">
              {ethValidation.message}
            </p>
          )}
          {minBidEth !== undefined && (
            <p className={classes.formHint} data-testid="fiat-bid-min-bid-copy">
              minimum bid — Ξ {minBidEth} or more
            </p>
          )}
        </div>

        <div className={classes.rateSummary} data-testid="fiat-bid-rate-summary">
          <div>
            現在 spot rate ={' '}
            {spotRate.rate !== undefined ? `${spotRate.rate.toLocaleString()} JPY / ETH` : '取得中'}
            {spotRate.source !== undefined && (
              <span className={classes.rateSource}>(source: {spotRate.source})</span>
            )}
          </div>
          <div data-testid="fiat-bid-jpy-display">JPY 換算 = {jpyDisplay}</div>
        </div>

        {!isTopupMode && (
          <div>
            <label htmlFor="fiat-bid-email" className={`mb-1 block ${classes.formLabel}`}>
              通知 email (任意)
            </label>
            <Input
              id="fiat-bid-email"
              type="email"
              value={emailRaw}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailRaw(e.target.value)}
              placeholder="you@example.com"
              data-testid="fiat-bid-email-input"
              className={classes.emailInput}
            />
          </div>
        )}

        <div>
          <label htmlFor="card-input-number" className={`mb-1 block ${classes.formLabel}`}>
            card 情報 (GMO Token 方式)
          </label>
          <CardInput onChange={handleCardChange} palette={palette} isDev={isDev} />
          <p className={`mt-2 ${classes.formHint}`}>
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
          <label htmlFor="fiat-bid-terms" className={classes.termsLabel}>
            <a
              href="/legal/tokushoho"
              target="_blank"
              rel="noopener noreferrer"
              className={classes.termsLink}
            >
              特商法に関する表記
            </a>{' '}
            および利用規約に同意します
          </label>
        </div>

        {currentStepLabel !== '' && (
          <div className={classes.stepper} data-testid={stepperTestId} data-step={currentStepValue}>
            {currentStepLabel}
          </div>
        )}

        {isTopupMode && fiatBid.topupPhase === 'cleanup-queued' && (
          <div className={classes.cleanupDisclaimer} data-testid="fiat-topup-cleanup-disclaimer">
            旧 authorization の cleanup 処理は非同期で進行しています。 modal を閉じたり、 別 tab
            で他の操作を続けても問題ありません。
          </div>
        )}

        {errorMessage !== undefined && (
          <div className={classes.errorMessage} data-testid="fiat-bid-error-message">
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
          className={classes.cancelBtn}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={submitDisabled}
          data-testid="fiat-bid-submit"
          className={classes.submitBtn}
        >
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

export default FiatBidForm;
