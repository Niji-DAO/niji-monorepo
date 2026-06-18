import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiUSDCPayer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiUsdcPayerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_paymentToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'CastError' },
  { type: 'error', inputs: [], name: 'Empty' },
  { type: 'error', inputs: [], name: 'OutOfBounds' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'account', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'remainingDebt', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'PaidBackDebt',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'account', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'RegisteredDebt',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'account', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'TokensWithdrawn',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'debtOf',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'payBackDebt',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paymentToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'queue',
    outputs: [
      { name: '_begin', internalType: 'int128', type: 'int128' },
      { name: '_end', internalType: 'int128', type: 'int128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'queueAt',
    outputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sendOrRegisterDebt',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalDebt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawPaymentToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiUsdcPayerAddress = {
  1: '0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D',
  11155111: '0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94',
  31337: '0x0000000000000000000000000000000000000000',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiUsdcPayerConfig = {
  address: nijiUsdcPayerAddress,
  abi: nijiUsdcPayerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayer = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"debtOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerDebtOf = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'debtOf',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerOwner = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerPaymentToken = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'paymentToken',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerQueue = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'queue',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"queueAt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerQueueAt = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'queueAt',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"totalDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiUsdcPayerTotalDebt = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'totalDebt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayer = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayerPayBackDebt = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'payBackDebt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayerRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayerSendOrRegisterDebt = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'sendOrRegisterDebt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayerTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiUsdcPayerWithdrawPaymentToken = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'withdrawPaymentToken',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayer = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayerPayBackDebt = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'payBackDebt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayerRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayerSendOrRegisterDebt = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'sendOrRegisterDebt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayerTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiUsdcPayerWithdrawPaymentToken = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  functionName: 'withdrawPaymentToken',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiUsdcPayerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiUsdcPayerOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  eventName: 'OwnershipTransferred',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `eventName` set to `"PaidBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiUsdcPayerPaidBackDebtEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  eventName: 'PaidBackDebt',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `eventName` set to `"RegisteredDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiUsdcPayerRegisteredDebtEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  eventName: 'RegisteredDebt',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcPayerAbi}__ and `eventName` set to `"TokensWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiUsdcPayerTokensWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcPayerAbi,
  address: nijiUsdcPayerAddress,
  eventName: 'TokensWithdrawn',
});
