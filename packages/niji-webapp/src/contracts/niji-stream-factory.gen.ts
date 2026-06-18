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
// NijiStreamFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const nijiStreamFactoryAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_streamImplementation', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'DurationMustBePositive' },
  { type: 'error', inputs: [], name: 'PayerIsAddressZero' },
  { type: 'error', inputs: [], name: 'RecipientIsAddressZero' },
  { type: 'error', inputs: [], name: 'StopTimeNotInTheFuture' },
  { type: 'error', inputs: [], name: 'TokenAmountIsZero' },
  { type: 'error', inputs: [], name: 'UnexpectedStreamAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'payer', internalType: 'address', type: 'address', indexed: true },
      { name: 'recipient', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'tokenAddress', internalType: 'address', type: 'address', indexed: false },
      { name: 'startTime', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'streamAddress', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'StreamCreated',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createAndFundStream',
    outputs: [{ name: 'stream', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'payer', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
      { name: 'nonce', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'createStream',
    outputs: [{ name: 'stream', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
      { name: 'nonce', internalType: 'uint8', type: 'uint8' },
      { name: 'predictedStreamAddress', internalType: 'address', type: 'address' },
    ],
    name: 'createStream',
    outputs: [{ name: 'stream', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createStream',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'payer', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createStream',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address' },
      { name: 'payer', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'predictStreamAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address' },
      { name: 'payer', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'stopTime', internalType: 'uint256', type: 'uint256' },
      { name: 'nonce', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'predictStreamAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'streamImplementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const nijiStreamFactoryAddress = {
  1: '0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff',
  11155111: '0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const nijiStreamFactoryConfig = {
  address: nijiStreamFactoryAddress,
  abi: nijiStreamFactoryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useReadNijiStreamFactory = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"predictStreamAddress"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useReadNijiStreamFactoryPredictStreamAddress = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'predictStreamAddress',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"streamImplementation"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useReadNijiStreamFactoryStreamImplementation = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'streamImplementation',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useWriteNijiStreamFactory = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createAndFundStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useWriteNijiStreamFactoryCreateAndFundStream = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createAndFundStream',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useWriteNijiStreamFactoryCreateStream = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createStream',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useSimulateNijiStreamFactory = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createAndFundStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useSimulateNijiStreamFactoryCreateAndFundStream =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiStreamFactoryAbi,
    address: nijiStreamFactoryAddress,
    functionName: 'createAndFundStream',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useSimulateNijiStreamFactoryCreateStream = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createStream',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useWatchNijiStreamFactoryEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `eventName` set to `"StreamCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const useWatchNijiStreamFactoryStreamCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiStreamFactoryAbi,
    address: nijiStreamFactoryAddress,
    eventName: 'StreamCreated',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const readNijiStreamFactory = /*#__PURE__*/ createReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"predictStreamAddress"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const readNijiStreamFactoryPredictStreamAddress = /*#__PURE__*/ createReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'predictStreamAddress',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"streamImplementation"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const readNijiStreamFactoryStreamImplementation = /*#__PURE__*/ createReadContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'streamImplementation',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const writeNijiStreamFactory = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createAndFundStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const writeNijiStreamFactoryCreateAndFundStream = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createAndFundStream',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const writeNijiStreamFactoryCreateStream = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createStream',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const simulateNijiStreamFactory = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createAndFundStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const simulateNijiStreamFactoryCreateAndFundStream = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createAndFundStream',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `functionName` set to `"createStream"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const simulateNijiStreamFactoryCreateStream = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  functionName: 'createStream',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamFactoryAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const watchNijiStreamFactoryEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamFactoryAbi}__ and `eventName` set to `"StreamCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xb78ccF3BD015f209fb9B2d3d132FD8784Df78DF5)
 */
export const watchNijiStreamFactoryStreamCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamFactoryAbi,
  address: nijiStreamFactoryAddress,
  eventName: 'StreamCreated',
})
