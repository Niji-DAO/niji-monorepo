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

/**
 * authorize endpoint 応答 shape
 *
 * spotRateSource は backend `SpotRateSource` (`packages/niji-api/src/services/spotRate/index.ts` SSOT) と
 * 一致させる。 Issue #3061 で `mock` union を追加、 `gmo` legacy label は既存 mock fixture 互換で残置。
 *
 * Phase 2 fincode (Issue #3115) で以下 2 field を追加。
 * - tds2Url = optional 化 (fincode status=AUTHORIZED 時は 3DS 不要で undefined)
 * - status  = 追加 (fincode AUTHORIZED / AUTHENTICATED / CAPTURED、 GMO 経路では undefined)
 */
export type AuthorizeResponse = {
  authId: string;
  /** 3DS 認証 URL、 GMO 経路は必ず string、 fincode 経路は status=AUTHENTICATED 時のみ返却 */
  tds2Url?: string;
  jpyAmount: number;
  ethAmount: string;
  spotRate: number;
  spotRateSource: 'gmo' | 'gmo-coin' | 'coingecko' | 'mock';
  /** 決済 status (fincode 経路のみ、 GMO 経路では undefined、 Issue #3115) */
  status?: 'AUTHORIZED' | 'AUTHENTICATED' | 'CAPTURED';
};

/** place-bid endpoint 応答 shape */
export type PlaceBidResponse = {
  authId: string;
  status: 'bid-placed' | 'cancelled';
  txHash: string | null;
  message: string;
};

/** authorize request body (webapp が backend に送出)
 *
 * Issue #3051 で入力軸を ETH primary に反転。
 * webapp は ETH 額 (wei 文字列) + spot rate + JPY 換算値 (audit 用) の 3 値を送信する。
 * backend の GMO 与信枠請求は JPY 単位 (GMO API 仕様) なので、 backend 側で jpyAmount を使う。
 */
export type AuthorizeRequest = {
  auctionId: string;
  bidderWallet: string;
  bidderEmail?: string;
  /** ETH 額 wei (bigint 文字列、 primary 契約軸、 Issue #3051 で追加) */
  ethAmount: string;
  /** spot rate (JPY/ETH、 換算根拠、 audit 用、 Issue #3051 で追加) */
  spotRate: number;
  /** JPY 換算額 (client-side で ethAmount × spotRate 丸め、 100 万円上限判定 + backend GMO 請求額、 Issue #3051 で追加) */
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
  /** spot rate 取得元 (Issue #3061 で `mock` union 追加、 `AuthorizeResponse.spotRateSource` と同 SSOT) */
  spotRateSource: 'gmo' | 'gmo-coin' | 'coingecko' | 'mock';
  /** user 通知 msg */
  message: string;
};

/** topup request body (webapp が backend に送出)
 *
 * Issue #3051 で入力軸を ETH primary に反転、 authorize と同 shape に統一。
 * newEthAmount = 新 ETH 額 wei string、 newSpotRate = 換算根拠、 newJpyAmount = 増額後 JPY 総額。
 */
export type TopupRequest = {
  authId: string;
  /** 新 ETH 額 wei (bigint 文字列、 primary 契約軸、 Issue #3051 で追加) */
  newEthAmount: string;
  /** 新 spot rate (JPY/ETH、 換算根拠、 audit 用、 Issue #3051 で追加) */
  newSpotRate: number;
  /** 新 JPY 額 (client-side で newEthAmount × newSpotRate 丸め、 100 万円上限判定 + backend GMO 請求額、 Issue #3051 で追加) */
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

/**
 * fincode UI flag 検出 (Issue #3115)
 * VITE_USE_FINCODE_UI=true 時は fincode 経路 endpoint (authorize-fincode) を叩き、
 * false / 未設定時は GMO 経路 endpoint (authorize) を叩く。
 * FiatBidForm 側の card 入力 UI 切替 (fincode.js iframe vs GMO Token 方式 mock) と同 env flag で連動。
 *
 * 引数 envSource は test で差替可能に、 default は `import.meta.env` (useSpotRate と同 pattern)。
 */
export const isFincodeBackendEnabled = (
  envSource: Record<string, string | undefined> = ((): Record<string, string | undefined> => {
    return typeof import.meta !== 'undefined'
      ? ((import.meta as { env?: Record<string, string> }).env ?? {})
      : {};
  })(),
): boolean => {
  const envValue = envSource['VITE_USE_FINCODE_UI'];
  return typeof envValue === 'string' && envValue.trim().toLowerCase() === 'true';
};

/** authorize endpoint path 決定 (fincode / GMO 切替、 Issue #3115) */
export const resolveAuthorizePath = (envSource?: Record<string, string | undefined>): string => {
  return isFincodeBackendEnabled(envSource)
    ? '/api/v1/fiat-bid/authorize-fincode'
    : '/api/v1/fiat-bid/authorize';
};

export const defaultAuthorizeFetch = async (body: AuthorizeRequest): Promise<AuthorizeResponse> => {
  const response = await fetch(buildEndpoint(resolveAuthorizePath()), {
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

        // fincode 経路で status=AUTHORIZED / CAPTURED (3DS 不要) の場合は tds2Url が undefined、
        // 3DS redirect skip + placing step 移行 + placeBid 自動呼出で bid tx 発火まで一気通貫 (Issue #3115)。
        // GMO 経路は必ず tds2Url を返すため fall-through で従来通り 3DS redirect する。
        if (result.tds2Url === undefined) {
          setStep('placing');
          try {
            const placeResult = await fetchers.placeBid({ authId: result.authId });
            setPlaceBidResult(placeResult);
            if (placeResult.status === 'bid-placed') {
              setStep('success');
            } else {
              setStep('failure');
              setErrorMessage(placeResult.message);
            }
          } catch (placeErr) {
            setStep('failure');
            setErrorMessage(placeErr instanceof Error ? placeErr.message : String(placeErr));
          }
          return result;
        }
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
