import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

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
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasury = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"GRACE_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryGracePeriod = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'GRACE_PERIOD',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"MAXIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryMaximumDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'MAXIMUM_DELAY',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"MINIMUM_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryMinimumDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'MINIMUM_DELAY',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"NAME"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryName = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'NAME',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'admin',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"delay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'delay',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"pendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryPendingAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'pendingAdmin',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queuedTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useReadNijiTreasuryQueuedTransactions = /*#__PURE__*/ createUseReadContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queuedTransactions',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasury = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryAcceptAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryCancelTransaction = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryExecuteTransaction = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryQueueTransaction = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendERC20"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasurySendErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendERC20',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasurySendEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasurySetDelay = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasurySetPendingAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryUpgradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeTo',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWriteNijiTreasuryUpgradeToAndCall = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeToAndCall',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasury = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"acceptAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryAcceptAdmin = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'acceptAdmin',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"cancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryCancelTransaction = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'cancelTransaction',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"executeTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryExecuteTransaction = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'executeTransaction',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"queueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryQueueTransaction = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'queueTransaction',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendERC20"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasurySendErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendERC20',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"sendETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasurySendEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'sendETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasurySetDelay = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setDelay',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"setPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasurySetPendingAdmin = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'setPendingAdmin',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryUpgradeTo = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeTo',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useSimulateNijiTreasuryUpgradeToAndCall = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  functionName: 'upgradeToAndCall',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"AdminChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryAdminChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'AdminChanged',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"BeaconUpgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryBeaconUpgradedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'BeaconUpgraded',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"CancelTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryCancelTransactionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTreasuryAbi,
    address: nijiTreasuryAddress,
    eventName: 'CancelTransaction',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ERC20Sent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryErc20SentEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'ERC20Sent',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ETHSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryEthSentEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'ETHSent',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"ExecuteTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryExecuteTransactionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTreasuryAbi,
    address: nijiTreasuryAddress,
    eventName: 'ExecuteTransaction',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryNewAdminEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewAdmin',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryNewDelayEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewDelay',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"NewPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryNewPendingAdminEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'NewPendingAdmin',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"QueueTransaction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryQueueTransactionEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiTreasuryAbi, address: nijiTreasuryAddress, eventName: 'QueueTransaction' },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xb1a32fc9f9d8b2cf86c068cae13108809547ef71)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x07e5d6a1550ad5e597a9b0698a474aa080a2fb28)
 */
export const useWatchNijiTreasuryUpgradedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTreasuryAbi,
  address: nijiTreasuryAddress,
  eventName: 'Upgraded',
});
