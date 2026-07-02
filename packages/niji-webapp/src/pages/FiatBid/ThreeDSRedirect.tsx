/**
 * 3DS 2.0 full redirect handler page (Issue #3007 Phase A、 T1)
 *
 * 役割 —
 * backend の /api/v1/fiat-bid/authorize 応答で受領した tds2Url に window.location.href で
 * 遷移する薄い page。 popup 経路が Safari で intermittent fail する既知問題を回避するため、
 * 全 UA で full redirect を採用する (Phase 1 SSOT、 grilling P5)。
 *
 * 起動経路 (Phase 1) —
 * (a) auction ページ「クレカで bid」 modal → authorize 応答受領 → 本 page に navigate
 *     (Issue #3008 で bid modal が localStorage 経由で tds2Url を渡す)
 * (b) 本 page は URL query から tds2Url を受け取り window.location.href で 3DS 画面へ full redirect
 *
 * localStorage 保存 (Phase 1) —
 * full redirect 前に auctionId / bidDraft (jpyAmount / cardToken) を localStorage に保存、
 * return page 復元時に auction context を再構築する (grilling P5 確定 SSOT)。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5、
 *        Phase1-02-issue-breakdown.md § Issue 4 T1-T3。
 */

import * as React from 'react';
import { useEffect } from 'react';

import { useSearchParams } from 'react-router';

/** localStorage key SSOT (Return page と共有) */
export const FIAT_BID_STATE_KEY = 'niji.fiat-bid.pending';

/** localStorage に保存する pending 情報 shape */
export type FiatBidPendingState = {
  authId: string;
  auctionId: string;
  jpyAmount: number;
  bidderWallet: string;
  /** authorize 応答 spot rate (return page で表示用) */
  spotRate: number;
  /** authorize 応答 ETH wei 額 (return page 表示用) */
  ethAmount: string;
};

export type ThreeDSRedirectProps = {
  /** test 用 injectable、 default = window.location.href への redirect */
  redirect?: (url: string) => void;
  /** test 用 injectable、 default = localStorage.setItem */
  saveState?: (state: FiatBidPendingState) => void;
};

/**
 * 3DS redirect 実行 (URL query から tds2Url + pending state を読取り、 保存 + redirect)
 * useEffect 内で 1 度だけ実行、 unmount 前に redirect 完了する想定
 */
export const ThreeDSRedirect = ({
  redirect = url => {
    window.location.href = url;
  },
  saveState = state => {
    try {
      window.localStorage.setItem(FIAT_BID_STATE_KEY, JSON.stringify(state));
    } catch {
      // localStorage 使えない環境 (Safari private mode 等) は sessionStorage fallback
      try {
        window.sessionStorage.setItem(FIAT_BID_STATE_KEY, JSON.stringify(state));
      } catch {
        // 両方 fail は redirect のみ実施 (return page で警告表示)
      }
    }
  },
}: ThreeDSRedirectProps = {}): React.JSX.Element => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tds2Url = searchParams.get('tds2Url');
    const authId = searchParams.get('authId');
    const auctionId = searchParams.get('auctionId');
    const jpyAmountRaw = searchParams.get('jpyAmount');
    const bidderWallet = searchParams.get('bidderWallet');
    const spotRateRaw = searchParams.get('spotRate');
    const ethAmount = searchParams.get('ethAmount');

    if (!tds2Url || !authId || !auctionId || !jpyAmountRaw || !bidderWallet) {
      // 必須 param 欠損時は redirect せず、 auction top に戻る
      return;
    }

    const jpyAmount = Number.parseInt(jpyAmountRaw, 10);
    if (!Number.isFinite(jpyAmount) || jpyAmount <= 0) {
      return;
    }

    const spotRate = Number.parseInt(spotRateRaw ?? '0', 10);
    saveState({
      authId,
      auctionId,
      jpyAmount,
      bidderWallet,
      spotRate: Number.isFinite(spotRate) ? spotRate : 0,
      ethAmount: ethAmount ?? '0',
    });

    redirect(tds2Url);
  }, [searchParams, redirect, saveState]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>3D セキュア 2.0 認証に遷移しています</h2>
      <p>
        認証画面に自動で移動します。 自動で切り替わらない場合は、 URL 直接指定または「戻る」 で
        auction ページに戻ってください。
      </p>
    </div>
  );
};

export default ThreeDSRedirect;
