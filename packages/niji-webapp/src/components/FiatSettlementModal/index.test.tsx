/**
 * FiatSettlementModal behavior test (Issue #3010 Phase C)
 *
 * 検証対象 —
 * (1) modal open + CTA button 表示 (idle state)
 * (2) CTA click で settleAndTransfer 呼出 → capture → transfer → success 遷移 + txHash 表示
 * (3) capture-failed 応答で failure 遷移 + error message 表示 + retry button 表示
 * (4) transfer-failed 応答で failure 遷移
 * (5) close button click で onClose 呼出
 */

import type { CaptureResponse, TransferResponse } from '@/hooks/useFiatSettlement';

import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { FiatSettlementModal } from './index';

const buildWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = 'FiatSettlementModalTestWrapper';
  return Wrapper;
};

const capturedResponse: CaptureResponse = {
  authId: 'auth-1',
  status: 'captured',
  message: 'クレジット決済が確定しました。',
};

const captureFailedResponse: CaptureResponse = {
  authId: 'auth-1',
  status: 'capture-failed',
  message: 'カードが期限切れです。',
};

const transferredResponse: TransferResponse = {
  authId: 'auth-1',
  status: 'transferred',
  txHash: '0xTXHASH',
  message: 'NFT を送付しました。',
};

const transferFailedResponse: TransferResponse = {
  authId: 'auth-1',
  status: 'transfer-failed',
  txHash: null,
  message: 'NFT 転送に失敗しました。',
};

describe('FiatSettlementModal', () => {
  const baseProps = {
    open: true,
    onClose: () => {},
    auctionId: '42',
    authId: 'auth-1',
    jpyAmount: 50000,
  };

  it('open=true で対象 + JPY 額 + CTA 表示', () => {
    const Wrapper = buildWrapper();
    render(
      <Wrapper>
        <FiatSettlementModal {...baseProps} />
      </Wrapper>,
    );

    // title + description + grid の 3 箇所で Niji #42 が現れる可能性がある、 getAllByText で 1 個以上を確認
    expect(screen.getAllByText(/Niji #42/).length).toBeGreaterThan(0);
    expect(screen.getByText(/¥50,000/)).toBeInTheDocument();
    expect(screen.getByTestId('fiat-settlement-confirm')).toBeInTheDocument();
  });

  it('CTA click で capture → transfer 呼出 → success + txHash 表示', async () => {
    const captureSpy = vi.fn(async () => capturedResponse);
    const transferSpy = vi.fn(async () => transferredResponse);
    const Wrapper = buildWrapper();

    render(
      <Wrapper>
        <FiatSettlementModal
          {...baseProps}
          fetchersOverride={{
            fetchers: {
              capture: captureSpy,
              transfer: transferSpy,
            },
          }}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('fiat-settlement-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('fiat-settlement-close')).toBeInTheDocument();
    });

    expect(captureSpy).toHaveBeenCalledWith({ authId: 'auth-1', tds2Result: '0' });
    expect(transferSpy).toHaveBeenCalledWith({ authId: 'auth-1' });
    expect(screen.getByTestId('fiat-settlement-txhash').textContent).toContain('0xTXHASH');
  });

  it('capture-failed で failure 遷移 + error message + retry button 表示', async () => {
    const captureSpy = vi.fn(async () => captureFailedResponse);
    const transferSpy = vi.fn();
    const Wrapper = buildWrapper();

    render(
      <Wrapper>
        <FiatSettlementModal
          {...baseProps}
          fetchersOverride={{
            fetchers: {
              capture: captureSpy,
              transfer: transferSpy,
            },
          }}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('fiat-settlement-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('fiat-settlement-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fiat-settlement-error').textContent).toContain('期限切れ');
    expect(screen.getByTestId('fiat-settlement-retry')).toBeInTheDocument();
    expect(transferSpy).not.toHaveBeenCalled();
  });

  it('transfer-failed で failure 遷移', async () => {
    const captureSpy = vi.fn(async () => capturedResponse);
    const transferSpy = vi.fn(async () => transferFailedResponse);
    const Wrapper = buildWrapper();

    render(
      <Wrapper>
        <FiatSettlementModal
          {...baseProps}
          fetchersOverride={{
            fetchers: {
              capture: captureSpy,
              transfer: transferSpy,
            },
          }}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('fiat-settlement-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('fiat-settlement-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fiat-settlement-error').textContent).toContain('NFT 転送');
    expect(captureSpy).toHaveBeenCalled();
    expect(transferSpy).toHaveBeenCalled();
  });

  it('close button click で onClose 呼出', async () => {
    const onClose = vi.fn();
    const Wrapper = buildWrapper();
    const captureSpy = vi.fn(async () => capturedResponse);
    const transferSpy = vi.fn(async () => transferredResponse);

    render(
      <Wrapper>
        <FiatSettlementModal
          {...baseProps}
          onClose={onClose}
          fetchersOverride={{
            fetchers: {
              capture: captureSpy,
              transfer: transferSpy,
            },
          }}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('fiat-settlement-confirm'));

    await waitFor(() => {
      expect(screen.getByTestId('fiat-settlement-close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('fiat-settlement-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
