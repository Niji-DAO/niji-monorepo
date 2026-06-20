import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const nijiTreasuryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address', indexed: true }],
    name: 'BeaconUpgraded',
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
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'erc20Token', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ERC20Sent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ETHSent',
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
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address', indexed: true }],
    name: 'Upgraded',
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
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [
      { name: 'admin_', internalType: 'address', type: 'address' },
      { name: 'delay_', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
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
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'erc20Token', internalType: 'address', type: 'address' },
      { name: 'tokensToSend', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sendERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address payable', type: 'address' },
      { name: 'ethToSend', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sendETH',
    outputs: [],
    stateMutability: 'nonpayable',
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
  {
    type: 'function',
    inputs: [{ name: 'newImplementation', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const nijiTreasuryAddress = {
  1: '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71',
  11155111: '0x07e5D6a1550aD5E597A9b0698A474AA080A2fB28',
  31337: '0x0000000000000000000000000000000000000000',
  84532: '0x0000000000000000000000000000000000000000',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const nijiTreasuryConfig = {
  address: nijiTreasuryAddress,
  abi: nijiTreasuryAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasury = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"GRACE_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryGracePeriod = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'GRACE_PERIOD',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"MAXIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryMaximumDelay = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'MAXIMUM_DELAY',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"MINIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryMinimumDelay = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'MINIMUM_DELAY',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"NAME"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryName = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'NAME',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'admin',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"delay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryDelay = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'delay',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"pendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryPendingAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'pendingAdmin',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queuedTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const readNijiTreasuryQueuedTransactions = /*#__PURE__*/ createReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queuedTransactions',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasury = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryAcceptAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryCancelTransaction = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryExecuteTransaction = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryQueueTransaction = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendERC20"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasurySendErc20 = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendERC20',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasurySendEth = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendETH',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasurySetDelay = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasurySetPendingAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeTo',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const writeNijiTreasuryUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeToAndCall',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasury = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryAcceptAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryCancelTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryExecuteTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryQueueTransaction = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendERC20"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasurySendErc20 = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendERC20',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasurySendEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendETH',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasurySetDelay = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasurySetPendingAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeTo',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const simulateNijiTreasuryUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeToAndCall',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"AdminChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryAdminChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'AdminChanged',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"BeaconUpgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryBeaconUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'BeaconUpgraded',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"CancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryCancelTransactionEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'CancelTransaction',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ERC20Sent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryErc20SentEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'ERC20Sent',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ETHSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryEthSentEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'ETHSent',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ExecuteTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryExecuteTransactionEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'ExecuteTransaction',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryNewAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewAdmin',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryNewDelayEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewDelay',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryNewPendingAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewPendingAdmin',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"QueueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryQueueTransactionEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'QueueTransaction',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const watchNijiTreasuryUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'Upgraded',
});
