/**
 * Fiat bid endpoint chain hook (Issue #3009 Phase A、 T2)
 *
 * 役割 —
 * FiatBidModal から利用する backend endpoint chain wrapper。
 * (1) POST /api/v1/fiat-bid/authorize で与信枠取得
 * (2) 応答 tds2Url を localStorage に pending state 保存 + full redirect
 * (3) 3DS 完了 (ThreeDSReturn) 後、 POST /api/v1/fiat-bid/place-bid で bid tx 発火
 *
 * hook state = 4 段 stepper と 1:1 対応する discriminated union、
 *   idle → authorizing → three-ds → placing → success | failure
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P3 + P5 + P6、
 *        Phase1-02-issue-breakdown.md § Issue 6 T2 + T12。
 */

import type { FiatBidPendingState } from '@/pages/FiatBid/ThreeDSRedirect';

import { useCallback, useMemo, useState } from 'react';

import { FIAT_BID_STATE_KEY } from '@/pages/FiatBid/ThreeDSRedirect';

/** 4 段 stepper の識別子 (spec P7 の A' 案) */
export type FiatBidStep = 'idle' | 'authorizing' | 'three-ds' | 'placing' | 'success' | 'failure';

/** authorize endpoint 応答 shape */
export type AuthorizeResponse = {
  authId: string;
  tds2Url: string;
  jpyAmount: number;
  ethAmount: string;
  spotRate: number;
  spotRateSource: 'gmo' | 'coingecko';
};

/** place-bid endpoint 応答 shape */
export type PlaceBidResponse = {
  authId: string;
  status: 'bid-placed' | 'cancelled';
  txHash: string | null;
  message: string;
};

/** authorize request body (webapp が backend に送出) */
export type AuthorizeRequest = {
  auctionId: string;
  bidderWallet: string;
  bidderEmail?: string;
  jpyAmount: number;
  /** GMO Token 方式で client-side tokenize 済の card token */
  cardToken: string;
};

/** hook 内で使う fetcher 契約 (test 差替可能) */
export type FiatBidFetchers = {
  authorize: (body: AuthorizeRequest) => Promise<AuthorizeResponse>;
  placeBid: (body: { authId: string }) => Promise<PlaceBidResponse>;
};

/**
 * default authorize fetcher = env base + /api/v1/fiat-bid/authorize に POST
 */
const readApiBase = (): string => {
  const envValue =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.['VITE_NIJI_API_BASE_URL']
      : undefined;
  return typeof envValue === 'string' ? envValue : '';
};

const buildEndpoint = (path: string): string => {
  return `${readApiBase().replace(/\/$/, '')}${path}`;
};

export const defaultAuthorizeFetch = async (body: AuthorizeRequest): Promise<AuthorizeResponse> => {
  const response = await fetch(buildEndpoint('/api/v1/fiat-bid/authorize'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`authorize failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as AuthorizeResponse;
};

export const defaultPlaceBidFetch = async (body: { authId: string }): Promise<PlaceBidResponse> => {
  const response = await fetch(buildEndpoint('/api/v1/fiat-bid/place-bid'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`place-bid failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as PlaceBidResponse;
};

/** hook option */
export type UseFiatBidOptions = {
  fetchers?: Partial<FiatBidFetchers>;
  /** test 用 injectable、 default = localStorage.setItem */
  saveState?: (state: FiatBidPendingState) => void;
  /** test 用 injectable、 default = window.location.href への redirect */
  redirect?: (url: string) => void;
};

const defaultSaveState = (state: FiatBidPendingState): void => {
  try {
    window.localStorage.setItem(FIAT_BID_STATE_KEY, JSON.stringify(state));
  } catch {
    try {
      window.sessionStorage.setItem(FIAT_BID_STATE_KEY, JSON.stringify(state));
    } catch {
      // 両方 fail は redirect のみ実施 (return page で警告表示)
    }
  }
};

const defaultRedirect = (url: string): void => {
  window.location.href = url;
};

/**
 * FiatBidModal 用 hook。 state = 4 段 stepper、 authorize / placeBid の 2 action を提供。
 * authorize action は成功時に localStorage 保存 + full redirect (3DS 画面へ)、
 * placeBid action は 3DS 完了 (ThreeDSReturn) 後の callback からの復帰経路で呼出す。
 */
export const useFiatBid = (options: UseFiatBidOptions = {}) => {
  const authorizeFetch = options.fetchers?.authorize ?? defaultAuthorizeFetch;
  const placeBidFetch = options.fetchers?.placeBid ?? defaultPlaceBidFetch;
  // fetchers を useMemo で安定化 (react-hooks/exhaustive-deps warn 対応、 useCallback deps を安定 ref に)
  const fetchers: FiatBidFetchers = useMemo(
    () => ({ authorize: authorizeFetch, placeBid: placeBidFetch }),
    [authorizeFetch, placeBidFetch],
  );
  const saveState = options.saveState ?? defaultSaveState;
  const redirect = options.redirect ?? defaultRedirect;

  const [step, setStep] = useState<FiatBidStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [authResult, setAuthResult] = useState<AuthorizeResponse | undefined>(undefined);
  const [placeBidResult, setPlaceBidResult] = useState<PlaceBidResponse | undefined>(undefined);

  /**
   * authorize + 3DS redirect action。
   * 成功時に state = "three-ds" に遷移してから full redirect (webapp 側は unmount)、
   * fail 時に state = "failure" + errorMessage に遷移する。
   */
  const authorize = useCallback(
    async (body: AuthorizeRequest): Promise<AuthorizeResponse | undefined> => {
      setStep('authorizing');
      setErrorMessage(undefined);
      try {
        const result = await fetchers.authorize(body);
        setAuthResult(result);

        const pending: FiatBidPendingState = {
          authId: result.authId,
          auctionId: body.auctionId,
          jpyAmount: body.jpyAmount,
          bidderWallet: body.bidderWallet,
          spotRate: result.spotRate,
          ethAmount: result.ethAmount,
        };
        saveState(pending);

        setStep('three-ds');
        redirect(result.tds2Url);
        return result;
      } catch (err) {
        setStep('failure');
        setErrorMessage(err instanceof Error ? err.message : String(err));
        return undefined;
      }
    },
    [fetchers, saveState, redirect],
  );

  /**
   * place-bid action。 3DS 完了 (fiat_bid.status = 3ds-verified) 後の
   * ThreeDSReturn からの callback で呼出す。
   */
  const placeBid = useCallback(
    async (authId: string): Promise<PlaceBidResponse | undefined> => {
      setStep('placing');
      setErrorMessage(undefined);
      try {
        const result = await fetchers.placeBid({ authId });
        setPlaceBidResult(result);
        if (result.status === 'bid-placed') {
          setStep('success');
        } else {
          setStep('failure');
          setErrorMessage(result.message);
        }
        return result;
      } catch (err) {
        setStep('failure');
        setErrorMessage(err instanceof Error ? err.message : String(err));
        return undefined;
      }
    },
    [fetchers],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setErrorMessage(undefined);
    setAuthResult(undefined);
    setPlaceBidResult(undefined);
  }, []);

  return {
    step,
    errorMessage,
    authResult,
    placeBidResult,
    authorize,
    placeBid,
    reset,
  };
};
