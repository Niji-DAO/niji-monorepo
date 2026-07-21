/**
 * 3DS 2.0 return handler page (Issue #3007 Phase A、 T2-T3)
 *
 * 役割 —
 * 3DS 認証画面 (mock or 実 GMO) からの return URL 受領 page。
 * URL query から result (success / fail) + transactionId を受け取り、
 * backend の /api/v1/fiat-bid/3ds-callback を呼び出して fiat_bid.status を遷移する。
 *
 * flow —
 * (1) 3DS 画面から success/fail link で本 page に URL query 付き遷移
 * (2) localStorage / URL query から authId + transactionId + result を復元
 * (3) POST /api/v1/fiat-bid/3ds-callback → 応答で final status ("3ds-verified" or "cancelled") 表示
 * (4) success → auction ページに戻る (Issue #3008 の bid tx 発火に引き継ぐ)
 * (5) fail → 「認証失敗、 再試行してください」 modal 相当のメッセージ表示
 *
 * localStorage 復元 (Phase 1) —
 * ThreeDSRedirect で保存された state を FIAT_BID_STATE_KEY で読出し、
 * auctionId 等の context を再構築する。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5、
 *        Phase1-02-issue-breakdown.md § Issue 4 T2-T3。
 */

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router';

import { FIAT_BID_STATE_KEY, type FiatBidPendingState } from './ThreeDSRedirect';

/** callback API 応答 shape (backend /api/v1/fiat-bid/3ds-callback 契約と一致) */
export type ThreeDsCallbackResponse = {
  authId: string;
  status: '3ds-verified' | 'cancelled';
};

/** 表示 status enum */
export type ReturnStatus =
  | 'processing'
  | 'success'
  | 'failure'
  | 'timeout'
  | 'invalid'
  | 'challenge';

/** fincode 3DS callback API 応答 shape (backend /3ds-callback-fincode 契約と一致) */
export type FincodeThreeDsCallbackResponse = {
  authId: string;
  status: '3ds-verified' | 'challenge-required' | 'cancelled';
  challengeUrl?: string;
  transResult?: string;
  reason?: string;
};

/** place-bid 応答の必要部分 (useFiatBid の PlaceBidResponse と同契約) */
export type PlaceBidResult = {
  authId: string;
  status: 'bid-placed' | 'cancelled';
  txHash: string | null;
  message?: string;
};

/** callback API 呼出関数 (test 用に injectable) */
export type CallbackFn = (payload: {
  authId: string;
  transactionId: string;
  result: 'success' | 'fail';
}) => Promise<ThreeDsCallbackResponse>;

/**
 * default callback = webapp の env で指定された API base URL に fetch POST
 * VITE_NIJI_API_BASE_URL は env で override 可能、 default は同一 origin の /api (Vite proxy 前提)
 */
export const defaultCallbackFn: CallbackFn = async payload => {
  const envValue =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.['VITE_NIJI_API_BASE_URL']
      : undefined;
  const apiBase = typeof envValue === 'string' ? envValue : '';
  const url = `${apiBase.replace(/\/$/, '')}/api/v1/fiat-bid/3ds-callback`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`callback failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as ThreeDsCallbackResponse;
};

/** API base URL 解決 (fiat bid 系 endpoint 共通) */
const resolveApiBase = (): string => {
  const envValue =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.['VITE_NIJI_API_BASE_URL']
      : undefined;
  return (typeof envValue === 'string' ? envValue : '').replace(/\/$/, '');
};

const postJson = async <T,>(path: string, payload: unknown, label: string): Promise<T> => {
  const response = await fetch(`${resolveApiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`${label} failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as T;
};

/** fincode 3DS callback 呼出関数 (test 用に injectable) */
export type FincodeCallbackFn = (payload: {
  authId: string;
  retry?: boolean;
}) => Promise<FincodeThreeDsCallbackResponse>;

/**
 * default fincode callback = POST /api/v1/fiat-bid/3ds-callback-fincode。
 * 認証実行と認証後決済実行を backend 側でまとめて行い、 与信を確定させる。
 */
export const defaultFincodeCallbackFn: FincodeCallbackFn = async payload =>
  postJson<FincodeThreeDsCallbackResponse>(
    '/api/v1/fiat-bid/3ds-callback-fincode',
    payload,
    '3ds callback',
  );

/** place-bid 呼出関数 (test 用に injectable) */
export type PlaceBidFn = (payload: {
  authId: string;
  bidderWallet: string;
}) => Promise<PlaceBidResult>;

/**
 * default place-bid = POST /api/v1/fiat-bid/place-bid。
 * bidderWallet は backend 必須 field で、 欠けると 400 になる。
 */
export const defaultPlaceBidFn: PlaceBidFn = async payload =>
  postJson<PlaceBidResult>('/api/v1/fiat-bid/place-bid', payload, 'place bid');

/**
 * localStorage / sessionStorage 復元 helper
 * ThreeDSRedirect が保存した pending state を返す (無ければ null)
 */
export const loadPendingState = (): FiatBidPendingState | null => {
  const raw = ((): string | null => {
    try {
      const local = window.localStorage.getItem(FIAT_BID_STATE_KEY);
      if (local) return local;
    } catch {
      // ignore
    }
    try {
      return window.sessionStorage.getItem(FIAT_BID_STATE_KEY);
    } catch {
      return null;
    }
  })();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FiatBidPendingState;
  } catch {
    return null;
  }
};

/** pending state を消去 (success / fail / cleanup 経路で呼出) */
export const clearPendingState = (): void => {
  try {
    window.localStorage.removeItem(FIAT_BID_STATE_KEY);
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(FIAT_BID_STATE_KEY);
  } catch {
    // ignore
  }
};

export type ThreeDSReturnProps = {
  /** test 用 injectable、 default = defaultCallbackFn (GMO 経路) */
  callbackFn?: CallbackFn;
  /** test 用 injectable、 default = defaultFincodeCallbackFn (fincode 経路) */
  fincodeCallbackFn?: FincodeCallbackFn;
  /** test 用 injectable、 default = defaultPlaceBidFn */
  placeBidFn?: PlaceBidFn;
  /** test 用 injectable、 default = loadPendingState */
  loadState?: () => FiatBidPendingState | null;
  /** test 用 injectable、 default = clearPendingState */
  clearState?: () => void;
  /** test 用 injectable、 default = window.location.href への遷移 (challenge 画面) */
  redirect?: (url: string) => void;
};

export const ThreeDSReturn = ({
  callbackFn = defaultCallbackFn,
  fincodeCallbackFn = defaultFincodeCallbackFn,
  placeBidFn = defaultPlaceBidFn,
  loadState = loadPendingState,
  clearState = clearPendingState,
  redirect = url => {
    window.location.href = url;
  },
}: ThreeDSReturnProps = {}): React.JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ReturnStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // URL query 検証 + pending state 復元は render 時 1 度だけ。
  // fincode は tds2_ret_url に `MD` (= access_id) を付けて戻す。 GMO は transactionId + result。
  // どちらの query が来たかで経路を判定する。
  const params = useMemo(() => {
    const transactionId = searchParams.get('transactionId') ?? '';
    const result = searchParams.get('result') ?? '';
    const urlAuthId =
      searchParams.get('MD') ?? searchParams.get('accessId') ?? searchParams.get('authId') ?? '';
    // challenge 認証から戻った 2 回目は結果を取り直す経路に切替える
    const retry = searchParams.get('retry') === '1';
    // transactionId の有無で経路を決める。 GMO は必ず付けてくるが fincode は付けない。
    // result の妥当性は GMO 経路に入った後に検査する (不正値で fincode 経路に流さない)。
    const isGmoRoute = transactionId !== '';
    return { transactionId, result, urlAuthId, retry, isGmoRoute };
  }, [searchParams]);

  /**
   * fincode 経路 — 3DS 認証実行 → 与信確定 → 代理入札まで進める。
   *
   * 認証が通っただけでは入札は発火しないため、 3ds-verified を受けたら続けて place-bid を呼ぶ。
   * bidderWallet は redirect を跨いで失われるので pending state から復元する
   * (backend の place-bid は bidderWallet 欠落時に 400 を返す)。
   */
  const invokeFincodeRoute = useCallback(
    async (authId: string, pending: FiatBidPendingState | null) => {
      const callbackPayload: { authId: string; retry?: boolean } = { authId };
      if (params.retry) callbackPayload.retry = true;
      const response = await fincodeCallbackFn(callbackPayload);

      if (response.status === 'challenge-required') {
        // pending state は消さない。 challenge から戻って retry=1 で再度ここに来る
        setStatus('challenge');
        if (response.challengeUrl !== undefined && response.challengeUrl !== '') {
          redirect(response.challengeUrl);
        } else {
          setStatus('failure');
          setErrorMessage('チャレンジ認証が必要ですが遷移先 URL が返却されませんでした。');
        }
        return;
      }

      if (response.status !== '3ds-verified') {
        clearState();
        setStatus('failure');
        setErrorMessage(
          response.reason !== undefined && response.reason !== ''
            ? `3D セキュア認証が拒否されました (${response.reason})`
            : '3D セキュア認証が拒否されました。 別のカードでお試しください。',
        );
        return;
      }

      const bidderWallet = pending?.bidderWallet ?? '';
      if (bidderWallet === '') {
        clearState();
        setStatus('failure');
        setErrorMessage(
          '認証は完了しましたが入札先 wallet を復元できませんでした。 auction ページから再度お試しください。',
        );
        return;
      }

      const placed = await placeBidFn({ authId, bidderWallet });
      clearState();
      if (placed.status === 'bid-placed') {
        setStatus('success');
      } else {
        setStatus('failure');
        setErrorMessage(placed.message ?? '入札に失敗しました。');
      }
    },
    [params.retry, fincodeCallbackFn, placeBidFn, clearState, redirect],
  );

  const invokeCallback = useCallback(async () => {
    const pending = loadState();
    const authId = params.urlAuthId || (pending?.authId ?? '');
    if (!authId) {
      setStatus('invalid');
      setErrorMessage('必須 URL query が欠損しています (authId=なし)');
      return;
    }

    try {
      if (!params.isGmoRoute) {
        await invokeFincodeRoute(authId, pending);
        return;
      }

      if (params.result !== 'success' && params.result !== 'fail') {
        setStatus('invalid');
        setErrorMessage(
          `必須 URL query が欠損しています (authId=${authId} / transactionId=${params.transactionId} / result=${params.result || 'なし'})`,
        );
        return;
      }

      const response = await callbackFn({
        authId,
        transactionId: params.transactionId,
        result: params.result as 'success' | 'fail',
      });
      clearState();
      if (response.status === '3ds-verified') {
        setStatus('success');
      } else {
        setStatus('failure');
      }
    } catch (err) {
      setStatus('failure');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }, [params, callbackFn, loadState, clearState, invokeFincodeRoute]);

  useEffect(() => {
    void invokeCallback();
  }, [invokeCallback]);

  const returnToAuction = useCallback(() => {
    const pending = loadState();
    // pending 有ればその auctionId に戻る、 無ければ auction top に戻る
    if (pending?.auctionId) {
      navigate(`/niji/${pending.auctionId}`);
    } else {
      navigate('/');
    }
  }, [loadState, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }} data-testid="fiat-bid-3ds-return">
      {status === 'processing' && (
        <>
          <h2>3D セキュア 2.0 認証結果を確認しています</h2>
          <p>数秒お待ちください。</p>
        </>
      )}
      {status === 'challenge' && (
        <>
          <h2>追加の本人確認が必要です</h2>
          <p>カード会社の認証画面に移動します。</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2>認証が完了しました</h2>
          <p>入札を受け付けました。 auction ページに戻ります。</p>
          <button onClick={returnToAuction} type="button">
            auction に戻る
          </button>
        </>
      )}
      {status === 'failure' && (
        <>
          <h2>認証に失敗しました</h2>
          <p>{errorMessage || '3D セキュア 2.0 認証で問題が発生しました。 再度お試しください。'}</p>
          <button onClick={returnToAuction} type="button">
            auction に戻る
          </button>
        </>
      )}
      {status === 'invalid' && (
        <>
          <h2>不正なアクセスです</h2>
          <p>{errorMessage}</p>
          <button onClick={returnToAuction} type="button">
            auction に戻る
          </button>
        </>
      )}
    </div>
  );
};

export default ThreeDSReturn;
