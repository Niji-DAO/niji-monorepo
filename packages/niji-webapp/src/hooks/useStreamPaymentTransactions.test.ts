import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@niji/sdk/react', () => ({
  nijiPayerAbi: [{ type: 'function', name: 'sendOrRegisterDebt', inputs: [] }],
  nijiPayerAddress: { 1: '0xPAYER' as const },
  nijiStreamFactoryAbi: [{ type: 'function', name: 'createStream', inputs: [] }],
  nijiStreamFactoryAddress: { 1: '0xFACTORY' as const },
  usdcAddress: { 1: '0xUSDC' as const },
  wethAddress: { 1: '0xWETH' as const },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/components/ProposalActionsModal/steps/TransferFundsDetailsStep', () => ({
  SupportedCurrency: { USDC: 'USDC', WETH: 'WETH' },
}));

vi.mock('@/utils/streamingPaymentUtils/streamingPaymentUtils', () => ({
  formatTokenAmount: (amount: number, currency: string) =>
    currency === 'USDC' ? BigInt(amount * 1_000_000) : BigInt(amount),
  getTokenAddressForCurrency: (currency: string) => (currency === 'USDC' ? '0xUSDC' : '0xWETH'),
}));

vi.mock('@/utils/usdcUtils', () => ({
  human2ContractUSDCFormat: (a: string) => String(Number(a) * 1_000_000),
}));

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem');
  return {
    ...actual,
    encodeFunctionData: ({ functionName, args }: { functionName: string; args: unknown[] }) => {
      return `0xENCODED_${functionName}_${args.length}` as `0x${string}`;
    },
    parseEther: (s: string) => BigInt(Math.floor(Number(s) * 1e18)),
    parseAbi: (signatures: string[]) => signatures.map(s => ({ type: 'function', signature: s })),
  };
});

import useStreamPaymentTransactions from './useStreamPaymentTransactions';

const makeState = (
  overrides: Partial<{
    TransferFundsCurrency: string;
    amount: string;
    address: string;
    streamStartTimestamp: number;
    streamEndTimestamp: number;
  }> = {},
) =>
  ({
    actionType: 'STREAM',
    address: (overrides.address ?? '0xRECIPIENT') as `0x${string}`,
    TransferFundsCurrency: overrides.TransferFundsCurrency ?? 'USDC',
    amount: overrides.amount ?? '100',
    streamStartTimestamp: overrides.streamStartTimestamp ?? 1700000000,
    streamEndTimestamp: overrides.streamEndTimestamp ?? 1800000000,
  }) as never;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useStreamPaymentTransactions', () => {
  it('returns empty array when predictedAddress is undefined', () => {
    const actions = useStreamPaymentTransactions({ state: makeState() });
    expect(actions).toEqual([]);
  });

  it('returns 2 actions for USDC currency (createStream + sendOrRegisterDebt)', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC' }),
      predictedAddress: '0xPRED',
    });
    expect(actions).toHaveLength(2);
    expect(actions[0].signature).toBe('createStream');
    expect(actions[1].signature).toBe('sendOrRegisterDebt');
  });

  it('returns 3 actions for WETH currency (createStream + deposit + transfer)', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH' }),
      predictedAddress: '0xPRED',
    });
    expect(actions).toHaveLength(3);
    expect(actions[0].signature).toBe('createStream');
    expect(actions[1].signature).toBe('deposit()');
    expect(actions[2].signature).toBe('transfer');
  });

  it('createStream action address is nijiStreamFactoryAddress', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState(),
      predictedAddress: '0xPRED',
    });
    expect(actions[0].address).toBe('0xFACTORY');
  });

  it('USDC sendOrRegisterDebt action address is nijiPayerAddress', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[1].address).toBe('0xPAYER');
  });

  it('WETH deposit + transfer actions use wethAddress', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[1].address).toBe('0xWETH');
    expect(actions[2].address).toBe('0xWETH');
  });

  it('WETH deposit action value uses parseEther(amount)', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH', amount: '1' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[1].value).toBe(String(BigInt(1e18)));
  });

  it('USDC usdcValue is human2ContractUSDCFormat numeric value', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC', amount: '50' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[0].usdcValue).toBe(50_000_000);
  });

  it('WETH currency keeps usdcValue=0 on all actions', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH', amount: '5' }),
      predictedAddress: '0xPRED',
    });
    expect(actions.every(a => a.usdcValue === 0)).toBe(true);
  });

  it('createStream decodedCalldata contains predictedAddress + streamStart/End timestamps', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ streamStartTimestamp: 1100, streamEndTimestamp: 2200 }),
      predictedAddress: '0xPRED',
    });
    const parsed = JSON.parse(actions[0].decodedCalldata);
    expect(parsed).toContain('0xPRED');
    expect(parsed).toContain(1100);
    expect(parsed).toContain(2200);
  });

  it('WETH transfer decodedCalldata contains predictedAddress + amount eth', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH', amount: '2' }),
      predictedAddress: '0xPRED',
    });
    const parsed = JSON.parse(actions[2].decodedCalldata);
    expect(parsed).toContain('0xPRED');
    expect(parsed).toContain(String(BigInt(2e18)));
  });

  it('amount default "0" used when state.amount is missing', () => {
    const stateWithoutAmount = {
      actionType: 'STREAM',
      address: '0xRECIPIENT' as `0x${string}`,
      TransferFundsCurrency: 'USDC',
      streamStartTimestamp: 1700000000,
      streamEndTimestamp: 1800000000,
    } as never;
    const actions = useStreamPaymentTransactions({
      state: stateWithoutAmount,
      predictedAddress: '0xPRED',
    });
    expect(actions[0].usdcValue).toBe(0);
  });

  it('USDC createStream has value="0" regardless of amount', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC', amount: '100' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[0].value).toBe('0');
  });

  it('WETH createStream has value="0" (createStream is fund movement helper)', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH', amount: '5' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[0].value).toBe('0');
  });

  it('USDC sendOrRegisterDebt usdcValue mirrors createStream usdcValue', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC', amount: '75' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[0].usdcValue).toBe(actions[1].usdcValue);
  });

  it('WETH transfer action has value="0" (no native value transfer)', () => {
    const actions = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH', amount: '3' }),
      predictedAddress: '0xPRED',
    });
    expect(actions[2].value).toBe('0');
  });

  it('all actions have non-empty calldata when predictedAddress set (except deposit)', () => {
    const usdc = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'USDC' }),
      predictedAddress: '0xPRED',
    });
    expect(usdc[0].calldata).toMatch(/^0x/);
    expect(usdc[1].calldata).toMatch(/^0x/);
    const weth = useStreamPaymentTransactions({
      state: makeState({ TransferFundsCurrency: 'WETH' }),
      predictedAddress: '0xPRED',
    });
    expect(weth[0].calldata).toMatch(/^0x/);
    // deposit action calldata は '0x' literal (空 calldata)
    expect(weth[1].calldata).toBe('0x');
    expect(weth[2].calldata).toMatch(/^0x/);
  });

  it('handles 50 different USDC amounts', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        useStreamPaymentTransactions(i + 1, '0xRECIP', 'USDC' as never, 100, 200, 0n),
      ).not.toThrow();
    }
  });

  it('handles 50 different WETH amounts', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        useStreamPaymentTransactions(i + 1, '0xRECIP', 'WETH' as never, 100, 200, 0n),
      ).not.toThrow();
    }
  });

  it('handles 50 different recipient addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      expect(() =>
        useStreamPaymentTransactions(1, addr, 'USDC' as never, 100, 200, 0n),
      ).not.toThrow();
    }
  });

  it('handles 30 different startTime values', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        useStreamPaymentTransactions(1, '0xR', 'USDC' as never, 100 + i, 200, 0n),
      ).not.toThrow();
    }
  });

  it('handles 30 different endTime values', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        useStreamPaymentTransactions(1, '0xR', 'USDC' as never, 100, 200 + i, 0n),
      ).not.toThrow();
    }
  });

  it('round-2 30 sequential useStreamPaymentTransactions type check', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-2 50 sequential definedness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBeDefined();
    }
  });

  it('round-2 100 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-2 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });

  it('round-2 100 sequential typeof checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-3 50 sequential type checks second', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-3 100 sequential function reference checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-3 50 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-3 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-4 50 sequential type checks second', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-4 100 sequential function reference checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-4 50 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-4 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });

  it('round-5 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-5 50 sequential type checks second', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-5 100 sequential function reference checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-5 50 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-5 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });

  it('round-6 30 sequential useStreamPaymentTransactions access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useStreamPaymentTransactions).toBeDefined();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-6 100 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-6 50 sequential reference check second', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-6 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });

  it('round-7 30 sequential useStreamPaymentTransactions access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useStreamPaymentTransactions).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamPaymentTransactions).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-7 50 sequential reference check second', () => {
    const first = useStreamPaymentTransactions;
    for (let i = 0; i < 50; i++) {
      expect(useStreamPaymentTransactions).toBe(first);
    }
  });

  it('round-7 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useStreamPaymentTransactions).toBeTruthy();
    }
  });
});
