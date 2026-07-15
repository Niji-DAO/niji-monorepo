/**
 * FincodeTestCardHelper — dev mode で fincode iframe 用の test card 値を表示する helper (Issue #3115 Phase 3)。
 *
 * 経緯 —
 * fincode.js Card Elements の iframe は cross-origin (fincode 側 host) のため、 自 site JS から
 * iframe 内 input field に値を fill する経路が存在しない (PCI DSS SAQ-A-EP 由来のセキュリティ境界)。
 * dev / test 環境で毎回 test card を手入力する UX 負荷を軽減する目的で、 iframe 隣に
 * copy button 付きの helper を表示する design。
 *
 * 表示条件 —
 * (1) import.meta.env.DEV === true (Vite dev mode)、 or
 * (2) VITE_SHOW_FINCODE_TEST_HELPER === 'true' (production build でも明示的に表示可能な override)
 *
 * fincode 公式 test card 値 —
 * - 番号 = 4111 1111 1111 1111 (成功)、 4000 0000 0000 0002 (auth fail simulation)
 * - 有効期限 = 12/30 (任意の未来 MM/YY)
 * - 名義人 = TEST USER
 * - CVC = 123
 *
 * SSOT — packages/niji-webapp/src/components/FiatBidModal/CardInputFincode.tsx (fincode iframe host)、
 *        decision-log 2026-07-16-fincode-jpy-primary-reversal-full-stack.md § test env 全値埋め。
 */
import * as React from 'react';
import { useCallback, useState } from 'react';

/**
 * fincode 公式 test card fixtures。
 * fincode 公式ドキュメントで案内される test card 番号 + 任意の未来有効期限 + 任意の 3 桁 cvc。
 */
export const FINCODE_TEST_CARD_FIXTURES = {
  success: {
    number: '4111111111111111',
    displayNumber: '4111 1111 1111 1111',
    label: '成功 (Visa)',
  },
  authFail: {
    number: '4000000000000002',
    displayNumber: '4000 0000 0000 0002',
    label: 'auth fail (issuer 拒否)',
  },
  expiry: '12/30',
  holder: 'TEST USER',
  cvc: '123',
} as const;

export type FincodeTestCardHelperProps = {
  /**
   * dev mode override (test 差替可能に env source を注入)、
   * default = import.meta.env.DEV || VITE_SHOW_FINCODE_TEST_HELPER
   */
  envSource?: {
    DEV?: boolean;
    VITE_SHOW_FINCODE_TEST_HELPER?: string;
  };
  /**
   * clipboard 書込関数 (test 差替可能)、 default = navigator.clipboard.writeText。
   * clipboard API 未サポート環境 (http / secure context 外) では undefined を返す。
   */
  writeToClipboard?: (text: string) => Promise<void>;
};

/** 表示可否判定 (dev mode or 明示 override) */
export const isFincodeTestHelperEnabled = (
  envSource: FincodeTestCardHelperProps['envSource'] = ((): FincodeTestCardHelperProps['envSource'] => {
    if (typeof import.meta === 'undefined') return {};
    const env = (import.meta as { env?: Record<string, unknown> }).env;
    return {
      DEV: env?.['DEV'] === true,
      VITE_SHOW_FINCODE_TEST_HELPER:
        typeof env?.['VITE_SHOW_FINCODE_TEST_HELPER'] === 'string'
          ? (env['VITE_SHOW_FINCODE_TEST_HELPER'] as string)
          : undefined,
    };
  })(),
): boolean => {
  if (envSource?.DEV === true) return true;
  const override = envSource?.VITE_SHOW_FINCODE_TEST_HELPER;
  return typeof override === 'string' && override.trim().toLowerCase() === 'true';
};

/** default clipboard writer (browser 環境で clipboard API を叩く) */
const defaultWriteToClipboard = async (text: string): Promise<void> => {
  if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
    throw new Error('clipboard API not available (secure context 外 or SSR)');
  }
  await navigator.clipboard.writeText(text);
};

type CopyableFieldProps = {
  label: string;
  value: string;
  displayValue?: string;
  onCopy: (value: string) => Promise<void>;
  testId: string;
};

const CopyableField: React.FC<CopyableFieldProps> = ({
  label,
  value,
  displayValue,
  onCopy,
  testId,
}) => {
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const handleClick = useCallback(async () => {
    try {
      await onCopy(value);
      setCopiedAt(Date.now());
      window.setTimeout(() => setCopiedAt(null), 2000);
    } catch {
      // clipboard fail 時は copied indicator 発火しない、 user が手動 fallback する経路に任せる
    }
  }, [onCopy, value]);
  const copied = copiedAt !== null && Date.now() - copiedAt < 2000;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 text-gray-600">{label}</span>
      <code className="flex-1 rounded bg-gray-100 px-2 py-1 font-mono text-gray-800">
        {displayValue ?? value}
      </code>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${label} をクリップボードにコピー`}
        data-testid={testId}
        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
      >
        {copied ? '✓ copied' : 'copy'}
      </button>
    </div>
  );
};

/**
 * FincodeTestCardHelper 本体。 fincode iframe の直下に表示、 dev mode でのみ render される。
 * fincode iframe の cross-origin 制約により自動 fill は不可能、 copy button で 1 click copy →
 * user が iframe に paste (2 手) する UX にする。
 */
export const FincodeTestCardHelper: React.FC<FincodeTestCardHelperProps> = ({
  envSource,
  writeToClipboard = defaultWriteToClipboard,
}) => {
  if (!isFincodeTestHelperEnabled(envSource)) {
    return null;
  }

  const { success, authFail, expiry, holder, cvc } = FINCODE_TEST_CARD_FIXTURES;

  const copyAll = async () => {
    const bundle = `番号: ${success.displayNumber}\n有効期限: ${expiry}\n名義人: ${holder}\nCVC: ${cvc}`;
    try {
      await writeToClipboard(bundle);
    } catch {
      // fail 時 silent、 個別 button で fallback
    }
  };

  return (
    <div
      data-testid="fincode-test-card-helper"
      className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3"
      role="region"
      aria-label="fincode test card helper (dev mode)"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-yellow-800">
          🧪 fincode test card (dev mode)
        </span>
        <button
          type="button"
          onClick={copyAll}
          aria-label="test card 全 field を一括コピー"
          data-testid="fincode-test-card-helper-copy-all"
          className="rounded bg-yellow-200 px-2 py-1 text-xs hover:bg-yellow-300"
        >
          全部コピー
        </button>
      </div>
      <div className="space-y-1">
        <CopyableField
          label="番号 (成功)"
          value={success.number}
          displayValue={`${success.displayNumber} — ${success.label}`}
          onCopy={writeToClipboard}
          testId="fincode-test-card-helper-copy-success"
        />
        <CopyableField
          label="番号 (fail)"
          value={authFail.number}
          displayValue={`${authFail.displayNumber} — ${authFail.label}`}
          onCopy={writeToClipboard}
          testId="fincode-test-card-helper-copy-fail"
        />
        <CopyableField
          label="有効期限"
          value={expiry}
          onCopy={writeToClipboard}
          testId="fincode-test-card-helper-copy-expiry"
        />
        <CopyableField
          label="名義人"
          value={holder}
          onCopy={writeToClipboard}
          testId="fincode-test-card-helper-copy-holder"
        />
        <CopyableField
          label="CVC"
          value={cvc}
          onCopy={writeToClipboard}
          testId="fincode-test-card-helper-copy-cvc"
        />
      </div>
      <p className="mt-2 text-xs text-yellow-700">
        fincode iframe は cross-origin のため自動 fill 不可、 copy button で iframe に paste
        してください。
      </p>
    </div>
  );
};
