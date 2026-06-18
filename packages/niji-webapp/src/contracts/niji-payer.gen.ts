import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiPayer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiPayerAbi = [
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
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiPayerAddress = {
  1: '0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D',
  11155111: '0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const nijiPayerConfig = { address: nijiPayerAddress, abi: nijiPayerAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayer = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"debtOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerDebtOf = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'debtOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerPaymentToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'paymentToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerQueue = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"queueAt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerQueueAt = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'queueAt',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"totalDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useReadNijiPayerTotalDebt = /*#__PURE__*/ createUseReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'totalDebt',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayerPayBackDebt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'payBackDebt',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayerRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayerSendOrRegisterDebt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'sendOrRegisterDebt',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayerTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWriteNijiPayerWithdrawPaymentToken = /*#__PURE__*/ createUseWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'withdrawPaymentToken',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayerPayBackDebt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'payBackDebt',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayerRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayerSendOrRegisterDebt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'sendOrRegisterDebt',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayerTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useSimulateNijiPayerWithdrawPaymentToken = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'withdrawPaymentToken',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWatchNijiPayerEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWatchNijiPayerOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiPayerAbi,
    address: nijiPayerAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"PaidBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWatchNijiPayerPaidBackDebtEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'PaidBackDebt',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"RegisteredDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWatchNijiPayerRegisteredDebtEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'RegisteredDebt',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"TokensWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const useWatchNijiPayerTokensWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'TokensWithdrawn',
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayer = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"debtOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerDebtOf = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'debtOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerOwner = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerPaymentToken = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'paymentToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerQueue = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"queueAt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerQueueAt = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'queueAt',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"totalDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const readNijiPayerTotalDebt = /*#__PURE__*/ createReadContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'totalDebt',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayer = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayerPayBackDebt = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'payBackDebt',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayerRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayerSendOrRegisterDebt = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'sendOrRegisterDebt',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayerTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const writeNijiPayerWithdrawPaymentToken = /*#__PURE__*/ createWriteContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'withdrawPaymentToken',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayer = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"payBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayerPayBackDebt = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'payBackDebt',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayerRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"sendOrRegisterDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayerSendOrRegisterDebt = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'sendOrRegisterDebt',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayerTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiPayerAbi}__ and `functionName` set to `"withdrawPaymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const simulateNijiPayerWithdrawPaymentToken = /*#__PURE__*/ createSimulateContract({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  functionName: 'withdrawPaymentToken',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiPayerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiPayerOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"PaidBackDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiPayerPaidBackDebtEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'PaidBackDebt',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"RegisteredDebt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiPayerRegisteredDebtEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'RegisteredDebt',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiPayerAbi}__ and `eventName` set to `"TokensWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x5a2A0951C6b3479DBEe1D5909Aac7B325d300D94)
 */
export const watchNijiPayerTokensWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiPayerAbi,
  address: nijiPayerAddress,
  eventName: 'TokensWithdrawn',
})
