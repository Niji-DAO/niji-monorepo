import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiLegacyTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const nounsLegacyTreasuryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'admin_', internalType: 'address', type: 'address' },
      { name: 'delay_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'target', internalType: 'address', type: 'address', indexed: true },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'signature', internalType: 'string', type: 'string', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'eta', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'CancelTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'target', internalType: 'address', type: 'address', indexed: true },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'signature', internalType: 'string', type: 'string', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'eta', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ExecuteTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'newAdmin', internalType: 'address', type: 'address', indexed: true }],
    name: 'NewAdmin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'newDelay', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'NewDelay',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'newPendingAdmin', internalType: 'address', type: 'address', indexed: true }],
    name: 'NewPendingAdmin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'txHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'target', internalType: 'address', type: 'address', indexed: true },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'signature', internalType: 'string', type: 'string', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'eta', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'QueueTransaction',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'GRACE_PERIOD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAXIMUM_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINIMUM_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'acceptAdmin', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'string', type: 'string' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'eta', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cancelTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'string', type: 'string' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'eta', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'executeTransaction',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingAdmin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'signature', internalType: 'string', type: 'string' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'eta', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'queueTransaction',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'queuedTransactions',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'delay_', internalType: 'uint256', type: 'uint256' }],
    name: 'setDelay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'pendingAdmin_', internalType: 'address', type: 'address' }],
    name: 'setPendingAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const nounsLegacyTreasuryAddress = {
  1: '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10',
  11155111: '0x332db58b51393f3a6b28d4DD8964234967e1aD33',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const nounsLegacyTreasuryConfig = {
  address: nounsLegacyTreasuryAddress,
  abi: nounsLegacyTreasuryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasury = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"GRACE_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryGracePeriod = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'GRACE_PERIOD',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"MAXIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryMaximumDelay = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'MAXIMUM_DELAY',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"MINIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryMinimumDelay = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'MINIMUM_DELAY',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryAdmin = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'admin',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"delay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryDelay = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'delay',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"pendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryPendingAdmin = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'pendingAdmin',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"queuedTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const readNijiLegacyTreasuryQueuedTransactions = /*#__PURE__*/ createReadContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'queuedTransactions',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasury = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasuryAcceptAdmin = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasuryCancelTransaction = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasuryExecuteTransaction = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasuryQueueTransaction = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasurySetDelay = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const writeNijiLegacyTreasurySetPendingAdmin = /*#__PURE__*/ createWriteContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasury = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasuryAcceptAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasuryCancelTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasuryExecuteTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasuryQueueTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasurySetDelay = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const simulateNijiLegacyTreasurySetPendingAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"CancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryCancelTransactionEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nounsLegacyTreasuryAbi,
    address: nounsLegacyTreasuryAddress,
    eventName: 'CancelTransaction',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"ExecuteTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryExecuteTransactionEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nounsLegacyTreasuryAbi,
    address: nounsLegacyTreasuryAddress,
    eventName: 'ExecuteTransaction',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"NewAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryNewAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  eventName: 'NewAdmin',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"NewDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryNewDelayEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  eventName: 'NewDelay',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"NewPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryNewPendingAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nounsLegacyTreasuryAbi,
  address: nounsLegacyTreasuryAddress,
  eventName: 'NewPendingAdmin',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nounsLegacyTreasuryAbi}__ and `eventName` set to `"QueueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x332db58b51393f3a6b28d4DD8964234967e1aD33)
 */
export const watchNijiLegacyTreasuryQueueTransactionEvent = /*#__PURE__*/ createWatchContractEvent(
  {
    abi: nounsLegacyTreasuryAbi,
    address: nounsLegacyTreasuryAddress,
    eventName: 'QueueTransaction',
  },
);
