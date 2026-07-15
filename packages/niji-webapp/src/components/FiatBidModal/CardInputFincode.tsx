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
    // StrictMode 二重 mount 対策 = initedRef で 1 回のみ init 保証。 fincode SDK は internal で
    // document.getElementById(MOUNT_TARGET_ID) を参照するため、 2 回目 invocation で element ref が
    // null になり setAttribute で crash する race condition を回避 (実測 error 「Cannot read
    // properties of null (reading 'setAttribute')」)。 onReadyChange は ref 経由で stable。
    if (initedRef.current) return;
    if (publicKey === undefined || publicKey === '') {
      setInitError(
        'VITE_FINCODE_PUBLIC_KEY 未設定。 packages/niji-webapp/.env に fincode dashboard の public_key を追加してください。',
      );
      onReadyChangeRef.current?.(false);
      return;
    }
    initedRef.current = true;
    // Radix Dialog Portal 経由で mount target div が render される timing と、 SDK が
    // document.getElementById(MOUNT_TARGET_ID) を呼ぶ timing の race を回避するため、
    // requestAnimationFrame で next paint 直前まで SDK init を defer する。
    // (実測 error 「Cannot read properties of null (reading 'setAttribute')」 の対処)。
    const raf = requestAnimationFrame(() => {
      void (async () => {
        try {
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
    });
    return () => {
      cancelAnimationFrame(raf);
    };
    // cleanup では ref を null 化しない (init 済 SDK を破壊しない)、 iframe は DOM 削除で GC。
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
    </div>
  );
};
CardInputFincode.displayName = 'CardInputFincode';

export default CardInputFincode;
