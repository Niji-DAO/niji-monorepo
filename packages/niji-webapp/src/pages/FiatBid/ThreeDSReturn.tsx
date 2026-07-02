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
export type ReturnStatus = 'processing' | 'success' | 'failure' | 'timeout' | 'invalid';

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
  /** test 用 injectable、 default = defaultCallbackFn */
  callbackFn?: CallbackFn;
  /** test 用 injectable、 default = loadPendingState */
  loadState?: () => FiatBidPendingState | null;
  /** test 用 injectable、 default = clearPendingState */
  clearState?: () => void;
};

export const ThreeDSReturn = ({
  callbackFn = defaultCallbackFn,
  loadState = loadPendingState,
  clearState = clearPendingState,
}: ThreeDSReturnProps = {}): React.JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ReturnStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // URL query 検証 + pending state 復元は render 時 1 度だけ
  const params = useMemo(() => {
    const transactionId = searchParams.get('transactionId') ?? '';
    const result = searchParams.get('result') ?? '';
    const urlAuthId = searchParams.get('accessId') ?? searchParams.get('authId') ?? '';
    return { transactionId, result, urlAuthId };
  }, [searchParams]);

  const invokeCallback = useCallback(async () => {
    const pending = loadState();
    const authId = params.urlAuthId || (pending?.authId ?? '');
    if (
      !authId ||
      !params.transactionId ||
      (params.result !== 'success' && params.result !== 'fail')
    ) {
      setStatus('invalid');
      setErrorMessage(
        `必須 URL query が欠損しています (authId=${authId || 'なし'} / transactionId=${params.transactionId || 'なし'} / result=${params.result || 'なし'})`,
      );
      return;
    }

    try {
      const response = await callbackFn({
        authId,
        transactionId: params.transactionId,
        result: params.result,
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
  }, [params, callbackFn, loadState, clearState]);

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
      {status === 'success' && (
        <>
          <h2>認証が完了しました</h2>
          <p>bid 発火準備が整いました。 auction ページに戻ります。</p>
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
