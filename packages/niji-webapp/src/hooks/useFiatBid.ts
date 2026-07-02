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

/**
 * 5 段 stepper の識別子 (Phase 2 grilling P7 A' 案の増額 bid 経路、 Issue #3025)
 *
 * pending → auth-taken → tx-broadcast → tx-confirmed → cleanup-queued
 *
 * 各 phase の対応 —
 * - pending      = topup endpoint 呼出開始 (旧 auth verify 中 = Phase A / B)
 * - auth-taken   = GMO 新 authorize 完了 (新 authId 取得済 = Phase B 完了)
 * - tx-broadcast = BidRelay で chain bid tx broadcast 中 (Phase C)
 * - tx-confirmed = bid tx 確定 (Phase C 完了 + fiat_bid record 新 authId に UPDATE = Phase E)
 * - cleanup-queued = 旧 auth cleanup queue に enqueue 済 (Phase D 完了、 async cleanup 走行中)
 * - failure       = 各 phase の error 停止 (Phase 1 の failure と共用)
 *
 * async cleanup 完了 (旧 auth VOID 成功) は endpoint 応答時点で観測不能なので stepper 外
 */
export type FiatTopupPhase =
  | 'idle'
  | 'pending'
  | 'auth-taken'
  | 'tx-broadcast'
  | 'tx-confirmed'
  | 'cleanup-queued'
  | 'failure';

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

/** topup endpoint 応答 shape (POST /api/v1/fiat-bid/topup、 Issue #3023) */
export type TopupResponse = {
  /** 新 authId (増額後の GMO 与信枠 ID) */
  authId: string;
  /** 旧 authId (async cleanup queue に enqueue 済) */
  oldAuthId: string;
  /** bid tx hash (成功時)、 revert 時 null */
  txHash: string | null;
  /** 遷移後 status */
  status: 'bid-placed' | 'cancelled';
  /** 新 JPY 額 (増額後) */
  jpyAmount: number;
  /** 新 ETH 額 wei (増額後、 文字列) */
  ethAmount: string;
  /** 新 spot rate */
  spotRate: number;
  /** spot rate 取得元 */
  spotRateSource: 'gmo' | 'coingecko';
  /** user 通知 msg */
  message: string;
};

/** topup request body (webapp が backend に送出) */
export type TopupRequest = {
  authId: string;
  newJpyAmount: number;
  cardToken: string;
};

/** hook 内で使う fetcher 契約 (test 差替可能) */
export type FiatBidFetchers = {
  authorize: (body: AuthorizeRequest) => Promise<AuthorizeResponse>;
  placeBid: (body: { authId: string }) => Promise<PlaceBidResponse>;
  topup: (body: TopupRequest) => Promise<TopupResponse>;
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

/**
 * default topup fetcher = env base + /api/v1/fiat-bid/topup に POST
 *
 * backend (Issue #3023) は 5 phase sequential + async cleanup enqueue を実施、
 * 応答時点で Phase D (enqueue) 完了、 async cleanup 完了は観測不能。
 */
export const defaultTopupFetch = async (body: TopupRequest): Promise<TopupResponse> => {
  const response = await fetch(buildEndpoint('/api/v1/fiat-bid/topup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`topup failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as TopupResponse;
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
  const topupFetch = options.fetchers?.topup ?? defaultTopupFetch;
  // fetchers を useMemo で安定化 (react-hooks/exhaustive-deps warn 対応、 useCallback deps を安定 ref に)
  const fetchers: FiatBidFetchers = useMemo(
    () => ({ authorize: authorizeFetch, placeBid: placeBidFetch, topup: topupFetch }),
    [authorizeFetch, placeBidFetch, topupFetch],
  );
  const saveState = options.saveState ?? defaultSaveState;
  const redirect = options.redirect ?? defaultRedirect;

  const [step, setStep] = useState<FiatBidStep>('idle');
  const [topupPhase, setTopupPhase] = useState<FiatTopupPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [authResult, setAuthResult] = useState<AuthorizeResponse | undefined>(undefined);
  const [placeBidResult, setPlaceBidResult] = useState<PlaceBidResponse | undefined>(undefined);
  const [topupResult, setTopupResult] = useState<TopupResponse | undefined>(undefined);

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

  /**
   * topup action — 増額 bid endpoint 呼出 + 5 phase state 遷移。
   *
   * topup endpoint (POST /api/v1/fiat-bid/topup、 Issue #3023) は同期返却で
   * Phase A-E を sequential 実行、 応答時点で Phase D (旧 auth cleanup enqueue) 完了。
   * async cleanup 実行完了は観測不能なので stepper 外 (別 tab disclaimer で説明)。
   *
   * 5 phase の遷移経路 —
   * - 呼出前 → pending (呼出直前 setState)
   * - topup fetch 成功 → auth-taken → tx-broadcast → tx-confirmed → cleanup-queued の即時遷移 (endpoint 応答時に 4 phase 完了扱い)
   * - status = "cancelled" → failure (bid tx revert、 旧 auth 保持)
   * - fetch error → failure
   *
   * grilling P7 A' 案の設計 = endpoint 応答は「全 phase 完了」 で観測可能な 1 event なので
   * 5 phase の視覚遷移は「呼出直前 = pending → 応答 = cleanup-queued」 の 2 event 表示。
   * 中間 phase は progress bar の label 順次 show で simulate (setState + setTimeout の連鎖ではなく、
   * endpoint 応答直後に final phase に飛ばす + label 順次 show は modal 側で管理する契約)。
   */
  const topup = useCallback(
    async (body: TopupRequest): Promise<TopupResponse | undefined> => {
      setTopupPhase('pending');
      setErrorMessage(undefined);
      try {
        const result = await fetchers.topup(body);
        setTopupResult(result);
        if (result.status === 'bid-placed') {
          setTopupPhase('cleanup-queued');
        } else {
          setTopupPhase('failure');
          setErrorMessage(result.message);
        }
        return result;
      } catch (err) {
        setTopupPhase('failure');
        setErrorMessage(err instanceof Error ? err.message : String(err));
        return undefined;
      }
    },
    [fetchers],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setTopupPhase('idle');
    setErrorMessage(undefined);
    setAuthResult(undefined);
    setPlaceBidResult(undefined);
    setTopupResult(undefined);
  }, []);

  return {
    step,
    topupPhase,
    errorMessage,
    authResult,
    placeBidResult,
    topupResult,
    authorize,
    placeBid,
    topup,
    reset,
  };
};
