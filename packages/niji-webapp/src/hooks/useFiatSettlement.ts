/**
 * Fiat settlement (capture + transfer) endpoint chain hook (Issue #3010 Phase C)
 *
 * 役割 —
 * FiatSettlementModal から利用する backend endpoint chain wrapper。
 * (1) POST /api/v1/fiat-bid/capture で GMO 実売上確定
 * (2) capture 成功で POST /api/v1/fiat-bid/transfer で運営 EOA から user wallet に NFT 送付
 *
 * hook state = 4 段 stepper、
 *   idle → capturing → transferring → success | failure
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P6, P7、
 *        Phase1-02-issue-breakdown.md § Issue 7 Phase C-E,
 */

import { useCallback, useMemo, useState } from 'react';

export type FiatSettlementStep = 'idle' | 'capturing' | 'transferring' | 'success' | 'failure';

export type CaptureResponse = {
  authId: string;
  status: 'captured' | 'capture-failed';
  message: string;
};

export type TransferResponse = {
  authId: string;
  status: 'transferred' | 'transfer-failed';
  txHash: string | null;
  message: string;
};

export type FiatSettlementFetchers = {
  capture: (body: { authId: string; tds2Result?: string }) => Promise<CaptureResponse>;
  transfer: (body: { authId: string }) => Promise<TransferResponse>;
};

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

export const defaultCaptureFetch = async (body: {
  authId: string;
  tds2Result?: string;
}): Promise<CaptureResponse> => {
  const response = await fetch(buildEndpoint('/api/v1/fiat-bid/capture'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`capture failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as CaptureResponse;
};

export const defaultTransferFetch = async (body: { authId: string }): Promise<TransferResponse> => {
  const response = await fetch(buildEndpoint('/api/v1/fiat-bid/transfer'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`transfer failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as TransferResponse;
};

export type UseFiatSettlementOptions = {
  fetchers?: Partial<FiatSettlementFetchers>;
};

/**
 * FiatSettlementModal 用 hook。
 * settleAndTransfer で capture → transfer の 2 段 chain を実行、 stepper 表示に対応する state を提供。
 */
export const useFiatSettlement = (options: UseFiatSettlementOptions = {}) => {
  const captureFetch = options.fetchers?.capture ?? defaultCaptureFetch;
  const transferFetch = options.fetchers?.transfer ?? defaultTransferFetch;
  const fetchers: FiatSettlementFetchers = useMemo(
    () => ({ capture: captureFetch, transfer: transferFetch }),
    [captureFetch, transferFetch],
  );

  const [step, setStep] = useState<FiatSettlementStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [captureResult, setCaptureResult] = useState<CaptureResponse | undefined>(undefined);
  const [transferResult, setTransferResult] = useState<TransferResponse | undefined>(undefined);

  const settleAndTransfer = useCallback(
    async (input: { authId: string; tds2Result?: string }): Promise<void> => {
      setStep('capturing');
      setErrorMessage(undefined);

      let captureResponse: CaptureResponse;
      try {
        const captureBody =
          input.tds2Result === undefined
            ? { authId: input.authId }
            : { authId: input.authId, tds2Result: input.tds2Result };
        captureResponse = await fetchers.capture(captureBody);
        setCaptureResult(captureResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(message);
        setStep('failure');
        return;
      }

      if (captureResponse.status === 'capture-failed') {
        setErrorMessage(captureResponse.message);
        setStep('failure');
        return;
      }

      setStep('transferring');

      let transferResponse: TransferResponse;
      try {
        transferResponse = await fetchers.transfer({ authId: input.authId });
        setTransferResult(transferResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(message);
        setStep('failure');
        return;
      }

      if (transferResponse.status === 'transfer-failed') {
        setErrorMessage(transferResponse.message);
        setStep('failure');
        return;
      }

      setStep('success');
    },
    [fetchers],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setErrorMessage(undefined);
    setCaptureResult(undefined);
    setTransferResult(undefined);
  }, []);

  return {
    step,
    errorMessage,
    captureResult,
    transferResult,
    settleAndTransfer,
    reset,
  };
};
