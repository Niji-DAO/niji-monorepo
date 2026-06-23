import { parseEther, zeroAddress } from 'viem';
import { describe, expect, it } from 'vitest';

import { SupportedCurrency } from '@/components/ProposalActionsModal/steps/TransferFundsDetailsStep';

import {
  formatTokenAmount,
  getTokenAddressForCurrency,
  parseStreamCreationCallData,
} from './streamingPaymentUtils';

describe('formatTokenAmount', () => {
  it('USDC scales by 1_000_000', () => {
    expect(formatTokenAmount(1.5, SupportedCurrency.USDC)).toBe(1_500_000n);
  });

  it('WETH parses as ether (18 decimals)', () => {
    expect(formatTokenAmount(1, SupportedCurrency.WETH)).toBe(parseEther('1'));
  });

  it('STETH also parses as ether', () => {
    expect(formatTokenAmount(0.5, SupportedCurrency.STETH)).toBe(parseEther('0.5'));
  });

  it('default branch converts to bigint', () => {
    expect(formatTokenAmount(42)).toBe(42n);
  });

  it('returns 0n for undefined amount', () => {
    expect(formatTokenAmount(undefined, SupportedCurrency.USDC)).toBe(0n);
    expect(formatTokenAmount(undefined, SupportedCurrency.WETH)).toBe(0n);
    expect(formatTokenAmount(undefined)).toBe(0n);
  });

  it('returns 0n for amount=0 (falsy guard)', () => {
    expect(formatTokenAmount(0, SupportedCurrency.USDC)).toBe(0n);
  });
});

describe('getTokenAddressForCurrency', () => {
  it('USDC returns address (default chainId=1)', () => {
    expect(getTokenAddressForCurrency(SupportedCurrency.USDC)).not.toBe(zeroAddress);
  });

  it('WETH returns address', () => {
    expect(getTokenAddressForCurrency(SupportedCurrency.WETH)).not.toBe(zeroAddress);
  });

  it('STETH returns address', () => {
    expect(getTokenAddressForCurrency(SupportedCurrency.STETH)).not.toBe(zeroAddress);
  });

  it('default branch (ETH) returns zeroAddress', () => {
    expect(getTokenAddressForCurrency(SupportedCurrency.ETH)).toBe(zeroAddress);
  });

  it('undefined currency returns zeroAddress', () => {
    expect(getTokenAddressForCurrency(undefined)).toBe(zeroAddress);
  });

  it('unsupported chainId falls back to zeroAddress', () => {
    expect(getTokenAddressForCurrency(SupportedCurrency.USDC, 99999)).toBe(zeroAddress);
  });
});

describe('parseStreamCreationCallData', () => {
  it('parses 7-element callData (with streamAddress at index 6)', () => {
    const callData = '0xRecipient,1000,0xToken,1700000000,1800000000,42,0xStreamAddr';
    const result = parseStreamCreationCallData(callData);
    expect(result.recipient).toBe('0xRecipient');
    expect(result.streamAmount).toBe(1000);
    expect(result.tokenAddress).toBe('0xToken');
    expect(result.startTime).toBe(1700000000);
    expect(result.endTime).toBe(1800000000);
    expect(result.nonce).toBe('42');
    expect(result.streamAddress).toBe('0xStreamAddr');
  });

  it('returns empty defaults for too-short callData', () => {
    const result = parseStreamCreationCallData('a,b,c');
    expect(result).toEqual({
      recipient: '',
      streamAddress: '',
      startTime: 0,
      endTime: 0,
      streamAmount: 0,
      tokenAddress: '',
    });
  });

  it('handles 6-element input (streamAddress becomes undefined)', () => {
    const result = parseStreamCreationCallData('a,1,b,2,3,4');
    expect(result.recipient).toBe('a');
    expect(result.streamAddress).toBeUndefined();
    expect(result.nonce).toBe('4');
  });
});
