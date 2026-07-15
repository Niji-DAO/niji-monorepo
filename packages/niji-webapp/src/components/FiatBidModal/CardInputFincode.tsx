/**
 * CardInputFincode — fincode.js SDK の iframe embed で card 情報を tokenize する input (Issue #3115)。
 *
 * 従来の CardInput.tsx (自前 4 field + brand detect + validation) を PCI DSS SAQ-A-EP scope に軽減する
 * 経路として、 fincode.js の `ui.mount()` で fincode 側 iframe を自 site DOM に埋込、 card 生情報は
 * 自 site JS に一切触れない設計に置換する。
 *
 * 親 (FiatBidForm) 側は forwardRef 経由で `getToken()` を露出、 submit 直前に `await ref.current.getToken()`
 * で fincode 発行の card token を取得して backend authorize に渡す。 従来の onChange(cardData) callback は廃止、
 * ready 状態のみ `onReadyChange(ready)` で通知する。
 *
 * VITE_FINCODE_PUBLIC_KEY が未設定 (env template 未反映 or user credential 未配置) の場合は
 * error state (isReady=false + placeholder message) を明示、 mount 試行しない。
 *
 * SSOT — packages/niji-webapp/.env.example.local の VITE_FINCODE_PUBLIC_KEY / VITE_FINCODE_API_BASE、
 * decision-log 2026-07-15-fincode-migration-webapp-first.md。
 */
import type { FincodeInstance, FincodeUI } from '@fincode/js';

import * as React from 'react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { getCardToken, initFincode } from '@fincode/js';

/** 親から submit 時に token 取得するための ref API */
export interface CardInputFincodeHandle {
  /** fincode UI から card 情報 token を取得 (submit 直前呼出、 失敗時 throw) */
  getToken: () => Promise<string>;
  /** UI が mount + ready 状態か */
  isReady: boolean;
}

export type CardInputFincodeProps = {
  /** UI mount 完了 / 未完了通知 callback */
  onReadyChange?: (ready: boolean) => void;
  /** palette 種別 (cool/warm、 default = cool) */
  palette?: 'cool' | 'warm';
};

const MOUNT_TARGET_ID = 'niji-fincode-card-mount';
const FINCODE_JS_TEST_URL = 'https://js.test.fincode.jp/v1/fincode.js';

/**
 * fincode.js CDN script を head に pre-inject して window.Fincode を set 済にする。
 *
 * initFincode SDK の findFincodeScript() は template literal で regex を string 化する SDK 側 bug で
 * 常に existing script を見つけられず 2 重 inject する。 加えて Playwright headless で script tag inject 後の
 * load event listener が発火せず init promise が永久 pending になる。 事前に script pre-load して
 * window.Fincode を set 済にすることで initFincode の early return 経路 (initializer 存在時即 resolve) を通し
 * 上記 2 症状を回避する。
 */
const preloadFincodeScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));
    if ((window as unknown as { Fincode?: unknown }).Fincode !== undefined) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${FINCODE_JS_TEST_URL}"]`,
    );
    if (existing !== null) {
      if ((window as unknown as { Fincode?: unknown }).Fincode !== undefined) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('fincode.js load failed')), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.src = FINCODE_JS_TEST_URL;
    script.async = true;
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('fincode.js load timeout (5s)'));
    }, 5_000);
    script.addEventListener(
      'load',
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        // load 完了直後に window.Fincode が set されているか polling で追加確認 (script eval 遅延対策)
        let attempts = 0;
        const poll = window.setInterval(() => {
          attempts += 1;
          if ((window as unknown as { Fincode?: unknown }).Fincode !== undefined) {
            window.clearInterval(poll);
            resolve();
          } else if (attempts >= 50) {
            window.clearInterval(poll);
            reject(new Error('fincode.js loaded but window.Fincode 未 set (500ms)'));
          }
        }, 10);
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(new Error('fincode.js load failed'));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });
};

export const CardInputFincode = ({
  ref,
  onReadyChange,
  palette = 'cool',
}: CardInputFincodeProps & { ref?: React.RefObject<CardInputFincodeHandle | null> }) => {
  const publicKey = import.meta.env.VITE_FINCODE_PUBLIC_KEY as string | undefined;
  const fincodeRef = useRef<FincodeInstance | null>(null);
  const uiRef = useRef<FincodeUI | null>(null);
  const initedRef = useRef(false);
  const onReadyChangeRef = useRef(onReadyChange);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  });

  useImperativeHandle(
    ref,
    () => ({
      isReady,
      getToken: async () => {
        if (fincodeRef.current === null || uiRef.current === null) {
          throw new Error('fincode UI が未初期化です');
        }
        const res = await getCardToken({
          fincode: fincodeRef.current,
          ui: uiRef.current,
          number: '1',
        });
        const list = (res as unknown as { list?: Array<{ token?: string }> }).list;
        if (list === undefined || list.length === 0 || list[0].token === undefined) {
          throw new Error('fincode getCardToken response に token が含まれていません');
        }
        return list[0].token;
      },
    }),
    [isReady],
  );

  useEffect(() => {
    if (initedRef.current) return;
    if (publicKey === undefined || publicKey === '') {
      setInitError(
        'VITE_FINCODE_PUBLIC_KEY 未設定。 packages/niji-webapp/.env に fincode dashboard の public_key を追加してください。',
      );
      onReadyChangeRef.current?.(false);
      return;
    }
    initedRef.current = true;
    // raf + cleanup は StrictMode 1 回目 useEffect cleanup で raf cancel → 2 回目 initedRef skip で
    // init 未発火の root cause。 直接 async fire + initedRef guard で 2 重発火防止、 cleanup 不要
    // (unmount 後の SDK init は無害な dangling)。
    void (async () => {
      try {
        await preloadFincodeScript();
        const fincode = await initFincode({ publicKey, isLiveMode: false });
        const mountEl = document.getElementById(MOUNT_TARGET_ID);
        if (mountEl === null) {
          throw new Error(`mount target #${MOUNT_TARGET_ID} が DOM に存在しません`);
        }
        const ui = fincode.ui({ layout: 'vertical' });
        ui.create('token', { layout: 'vertical' });
        ui.mount(MOUNT_TARGET_ID, '100%');
        fincodeRef.current = fincode;
        uiRef.current = ui;
        setIsReady(true);
        onReadyChangeRef.current?.(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setInitError(`fincode SDK 初期化に失敗しました: ${message}`);
        onReadyChangeRef.current?.(false);
        initedRef.current = false;
      }
    })();
  }, [publicKey]);

  return (
    <div data-testid="card-input-fincode" data-palette={palette} className="flex flex-col gap-2">
      {initError !== null && (
        <p
          data-testid="card-input-fincode-error"
          className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
        >
          {initError}
        </p>
      )}
      <div
        id={MOUNT_TARGET_ID}
        data-testid="card-input-fincode-mount"
        className="min-h-[240px] w-full"
      />
      {/*
        fincode SDK は `elementId + "-form"` id の別 div を内部で参照する (SDK docs 未明示、
        CDN runtime code から判明)。 element 不在で `Cannot read properties of null (reading
        'setAttribute')` crash するため mount target と対で render する。
      */}
      <div id={`${MOUNT_TARGET_ID}-form`} />
    </div>
  );
};
CardInputFincode.displayName = 'CardInputFincode';

export default CardInputFincode;
