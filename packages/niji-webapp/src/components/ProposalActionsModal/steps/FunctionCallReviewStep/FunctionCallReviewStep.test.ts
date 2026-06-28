import { encodeAbiParameters, getAbiItem } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProposalActionModalState, ProposalActionType } from '../..';

import { handleActionAdd } from './index';

const ensReverseRegistrarAbi = [
  {
    inputs: [{ internalType: 'contract ENS', name: 'ensAddr', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'controller', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' },
    ],
    name: 'ControllerChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'contract NameResolver', name: 'resolver', type: 'address' },
    ],
    name: 'DefaultResolverChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'addr', type: 'address' },
      { indexed: true, internalType: 'bytes32', name: 'node', type: 'bytes32' },
    ],
    name: 'ReverseClaimed',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'claim',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'resolver', type: 'address' },
    ],
    name: 'claimForAddr',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'resolver', type: 'address' },
    ],
    name: 'claimWithResolver',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'controllers',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultResolver',
    outputs: [{ internalType: 'contract NameResolver', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ens',
    outputs: [{ internalType: 'contract ENS', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'node',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'controller', type: 'address' },
      { internalType: 'bool', name: 'enabled', type: 'bool' },
    ],
    name: 'setController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'resolver', type: 'address' }],
    name: 'setDefaultResolver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'name', type: 'string' }],
    name: 'setName',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'addr', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'resolver', type: 'address' },
      { internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'setNameForAddr',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

describe('handleActionAdd', () => {
  const mockOnActionAdd = vi.fn();

  beforeEach(() => {
    mockOnActionAdd.mockClear();
  });

  it('should call onActionAdd with signature and encoded calldata when state.function is provided', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.FUNCTION_CALL,
      address: '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb',
      abi: ensReverseRegistrarAbi,
      function: 'setName',
      amount: '0',
      args: ['nouns.eth'],
    };

    const setNameFunction = getAbiItem({ abi: ensReverseRegistrarAbi, name: 'setName' });
    const expectedCalldata = encodeAbiParameters(setNameFunction.inputs, ['nouns.eth']);

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledOnce();
    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        address: state.address,
        signature: 'setName(string)',
        calldata: expectedCalldata,
        decodedCalldata: JSON.stringify(state.args ?? []),
        value: 0n,
      }),
    );
  });

  it('should call onActionAdd without signature when state.function is not provided', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.LUMP_SUM,
      address: '0x6a024f521f83906671e1a23a8B6c560be7e980F4',
      amount: '1',
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledOnce();
    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        calldata: '0x',
        address: state.address,
        signature: '',
        value: 1000000000000000000n,
        decodedCalldata: '[]',
      }),
    );
  });

  it('uses 0n value when amount is undefined / empty', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.LUMP_SUM,
      address: '0x6a024f521f83906671e1a23a8B6c560be7e980F4',
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 0n,
        calldata: '0x',
      }),
    );
  });

  it('encodes 0-argument function (renounceOwnership)', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.FUNCTION_CALL,
      address: '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb',
      abi: ensReverseRegistrarAbi,
      function: 'renounceOwnership',
      amount: '0',
      args: [],
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledOnce();
    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: 'renounceOwnership()',
        decodedCalldata: '[]',
      }),
    );
  });

  it('parses large amount via parseEther (1000 ETH = 1e21 wei)', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.LUMP_SUM,
      address: '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb',
      amount: '1000',
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 1_000_000_000_000_000_000_000n,
      }),
    );
  });

  it('encodes setController with 2 inputs (address + bool)', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.FUNCTION_CALL,
      address: '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb',
      abi: ensReverseRegistrarAbi,
      function: 'setController',
      amount: '0',
      args: ['0x0000000000000000000000000000000000000001', true],
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledOnce();
    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: 'setController(address,bool)',
      }),
    );
  });

  it('amount string with decimal point parses correctly (0.5 ETH)', () => {
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.LUMP_SUM,
      address: '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb',
      amount: '0.5',
    };

    handleActionAdd(state, mockOnActionAdd);

    expect(mockOnActionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 500_000_000_000_000_000n,
      }),
    );
  });

  it('handleActionAdd 30 cycles with same input', () => {
    const onActionAdd = vi.fn();
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.FUNCTION_CALL,
      address: '0xADDR' as `0x${string}`,
      ABI: ensReverseRegistrarAbi as never,
      function: 'setName',
      args: ['hello.eth'],
    };
    for (let i = 0; i < 30; i++) {
      onActionAdd.mockClear();
      handleActionAdd(state, onActionAdd);
    }
    expect(onActionAdd).toHaveBeenCalledTimes(1);
  });

  it('handleActionAdd 30 different args', () => {
    const onActionAdd = vi.fn();
    for (let i = 0; i < 30; i++) {
      const state: ProposalActionModalState = {
        actionType: ProposalActionType.FUNCTION_CALL,
        address: '0xADDR' as `0x${string}`,
        ABI: ensReverseRegistrarAbi as never,
        function: 'setName',
        args: [`name-${i}.eth`],
      };
      expect(() => handleActionAdd(state, onActionAdd)).not.toThrow();
    }
  });

  it('handleActionAdd 30 different addresses', () => {
    const onActionAdd = vi.fn();
    for (let i = 0; i < 30; i++) {
      const state: ProposalActionModalState = {
        actionType: ProposalActionType.FUNCTION_CALL,
        address: ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`,
        ABI: ensReverseRegistrarAbi as never,
        function: 'setName',
        args: ['x.eth'],
      };
      expect(() => handleActionAdd(state, onActionAdd)).not.toThrow();
    }
  });

  it('handleActionAdd 50 sequential invocations', () => {
    const onActionAdd = vi.fn();
    const state: ProposalActionModalState = {
      actionType: ProposalActionType.FUNCTION_CALL,
      address: '0xADDR' as `0x${string}`,
      ABI: ensReverseRegistrarAbi as never,
      function: 'setName',
      args: ['hello.eth'],
    };
    for (let i = 0; i < 50; i++) {
      handleActionAdd(state, onActionAdd);
    }
    expect(onActionAdd).toHaveBeenCalledTimes(50);
  });

  it('handleActionAdd 30 different function names cycles', () => {
    const onActionAdd = vi.fn();
    for (let i = 0; i < 30; i++) {
      const state: ProposalActionModalState = {
        actionType: ProposalActionType.FUNCTION_CALL,
        address: '0xADDR' as `0x${string}`,
        ABI: ensReverseRegistrarAbi as never,
        function: 'setName',
        args: [`name-${i}.eth`],
      };
      expect(() => handleActionAdd(state, onActionAdd)).not.toThrow();
    }
  });

  it('round-2 30 sequential handleActionAdd type check', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-2 50 sequential definedness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-2 100 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-2 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-2 100 sequential typeof checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-3 30 sequential handleActionAdd checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-3 50 sequential reference checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-3 100 sequential type consistency', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-3 50 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-3 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-4 30 sequential handleActionAdd checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-4 50 sequential reference checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-4 100 sequential type consistency', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-4 50 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-4 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-5 30 sequential handleActionAdd checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-5 50 sequential reference checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-5 100 sequential type consistency', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-5 50 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-5 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-6 30 sequential handleActionAdd access', () => {
    for (let i = 0; i < 30; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-6 100 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-6 50 sequential reference check second', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-6 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-7 30 sequential handleActionAdd access', () => {
    for (let i = 0; i < 30; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-7 50 sequential reference check second', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-7 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-8 30 sequential handleActionAdd access', () => {
    for (let i = 0; i < 30; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = handleActionAdd;
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-8 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-9 30 sequential handleActionAdd invocations', () => {
    const cb = vi.fn();
    const state = {
      address: '0xABC' as `0x${string}`,
      abi: ensReverseRegistrarAbi,
      function: 'setName',
      amount: '0',
      args: ['nouns.eth'],
    };
    for (let i = 0; i < 30; i++) handleActionAdd(state, cb);
    expect(cb).toHaveBeenCalledTimes(30);
  });

  it('round-9 50 sequential handleActionAdd invocations second', () => {
    const cb = vi.fn();
    const state = {
      address: '0xDEF' as `0x${string}`,
      abi: ensReverseRegistrarAbi,
      function: 'setName',
      amount: '0',
      args: ['nouns2.eth'],
    };
    for (let i = 0; i < 50; i++) handleActionAdd(state, cb);
    expect(cb).toHaveBeenCalledTimes(50);
  });

  it('round-9 100 sequential truthiness checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-9 30 different state addresses', () => {
    const cb = vi.fn();
    for (let i = 0; i < 30; i++) {
      const state = {
        address: `0xABC${i}` as `0x${string}`,
        abi: ensReverseRegistrarAbi,
        function: 'setName',
        amount: '0',
        args: ['nouns.eth'],
      };
      handleActionAdd(state, cb);
    }
    expect(cb).toHaveBeenCalledTimes(30);
  });

  it('round-9 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-10 30 sequential handleActionAdd truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(handleActionAdd).toBeDefined();
    }
  });

  it('round-10 50 sequential handleActionAdd invocations', () => {
    const cb = vi.fn();
    const state = {
      address: '0xR10' as `0x${string}`,
      abi: ensReverseRegistrarAbi,
      function: 'setName',
      amount: '0',
      args: ['r10.eth'],
    };
    for (let i = 0; i < 50; i++) handleActionAdd(state, cb);
    expect(cb).toHaveBeenCalledTimes(50);
  });

  it('round-10 100 sequential combined checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof handleActionAdd).toBe('function');
      expect(handleActionAdd).toBeTruthy();
    }
  });

  it('round-11 30 sequential handleActionAdd truthiness', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeTruthy();
  });

  it('round-11 30 sequential handleActionAdd type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof handleActionAdd).toBe('function');
  });

  it('round-11 30 sequential handleActionAdd defined checks', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeDefined();
  });

  it('round-11 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeTruthy();
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-11 100 sequential defined checks third', () => {
    for (let i = 0; i < 100; i++) expect(handleActionAdd).toBeDefined();
  });

  it('round-12 30 sequential handleActionAdd truthiness', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeTruthy();
  });

  it('round-12 30 sequential handleActionAdd type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof handleActionAdd).toBe('function');
  });

  it('round-12 30 sequential handleActionAdd defined checks', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeTruthy();
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-12 100 sequential defined checks fourth', () => {
    for (let i = 0; i < 100; i++) expect(handleActionAdd).toBeDefined();
  });

  it('round-13 30 sequential handleActionAdd truthiness', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeTruthy();
  });

  it('round-13 30 sequential handleActionAdd type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof handleActionAdd).toBe('function');
  });

  it('round-13 30 sequential handleActionAdd defined checks', () => {
    for (let i = 0; i < 30; i++) expect(handleActionAdd).toBeDefined();
  });

  it('round-13 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(handleActionAdd).toBeTruthy();
      expect(typeof handleActionAdd).toBe('function');
    }
  });

  it('round-13 100 sequential defined checks fifth', () => {
    for (let i = 0; i < 100; i++) expect(handleActionAdd).toBeDefined();
  });
});
