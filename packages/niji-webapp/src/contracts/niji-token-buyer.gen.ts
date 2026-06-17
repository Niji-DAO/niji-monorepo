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
// NijiTokenBuyer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiTokenBuyerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_priceFeed', internalType: 'contract IPriceFeed', type: 'address' },
      { name: '_baselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_minAdminBaselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_maxAdminBaselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_botDiscountBPs', internalType: 'uint16', type: 'uint16' },
      { name: '_minAdminBotDiscountBPs', internalType: 'uint16', type: 'uint16' },
      { name: '_maxAdminBotDiscountBPs', internalType: 'uint16', type: 'uint16' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_admin', internalType: 'address', type: 'address' },
      { name: '_payer', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'data', internalType: 'bytes', type: 'bytes' }],
    name: 'FailedSendingETH',
  },
  {
    type: 'error',
    inputs: [{ name: 'data', internalType: 'bytes', type: 'bytes' }],
    name: 'FailedWithdrawingETH',
  },
  { type: 'error', inputs: [], name: 'InvalidBaselinePaymentTokenAmount' },
  { type: 'error', inputs: [], name: 'InvalidBotDiscountBPs' },
  { type: 'error', inputs: [], name: 'OnlyAdminOrOwner' },
  {
    type: 'error',
    inputs: [
      { name: 'expected', internalType: 'uint256', type: 'uint256' },
      { name: 'actual', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ReceivedInsufficientTokens',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'AdminSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldAmount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newAmount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'BaselinePaymentTokenAmountSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldBPs', internalType: 'uint16', type: 'uint16', indexed: false },
      { name: 'newBPs', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'BotDiscountBPsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ETHWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldAmount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newAmount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'MaxAdminBaselinePaymentTokenAmountSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldBPs', internalType: 'uint16', type: 'uint16', indexed: false },
      { name: 'newBPs', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'MaxAdminBotDiscountBPsSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldAmount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newAmount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'MinAdminBaselinePaymentTokenAmountSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldBPs', internalType: 'uint16', type: 'uint16', indexed: false },
      { name: 'newBPs', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'MinAdminBotDiscountBPsSet',
  },
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldPayer', internalType: 'address', type: 'address', indexed: false },
      { name: 'newPayer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'PayerSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldFeed', internalType: 'address', type: 'address', indexed: false },
      { name: 'newFeed', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'PriceFeedSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'ethOut', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'tokenIn', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'SoldETH',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baselinePaymentTokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'botDiscountBPs',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'buyETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'buyETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'ethAmountPerTokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'additionalTokens', internalType: 'uint256', type: 'uint256' },
      { name: 'bufferBPs', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ethNeeded',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAdminBaselinePaymentTokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxAdminBotDiscountBPs',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minAdminBaselinePaymentTokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minAdminBotDiscountBPs',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'payer',
    outputs: [{ name: '', internalType: 'contract IPayer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paymentToken',
    outputs: [{ name: '', internalType: 'contract IERC20Metadata', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paymentTokenDecimalsDigits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'price',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'priceFeed',
    outputs: [{ name: '', internalType: 'contract IPriceFeed', type: 'address' }],
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
    inputs: [{ name: 'newAdmin', internalType: 'address', type: 'address' }],
    name: 'setAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBaselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'setBaselinePaymentTokenAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newBotDiscountBPs', internalType: 'uint16', type: 'uint16' }],
    name: 'setBotDiscountBPs',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newMaxAdminBaselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxAdminBaselinePaymentTokenAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMaxAdminBotDiscountBPs', internalType: 'uint16', type: 'uint16' }],
    name: 'setMaxAdminBotDiscountBPs',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newMinAdminBaselinePaymentTokenAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMinAdminBaselinePaymentTokenAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newMinAdminBotDiscountBPs', internalType: 'uint16', type: 'uint16' }],
    name: 'setMinAdminBotDiscountBPs',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newPayer', internalType: 'address', type: 'address' }],
    name: 'setPayer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newPriceFeed', internalType: 'contract IPriceFeed', type: 'address' }],
    name: 'setPriceFeed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenAmountNeeded',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenAmountNeededAndETHPayout',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'ethAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenAmountPerEthAmount',
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
  { type: 'function', inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', inputs: [], name: 'withdrawETH', outputs: [], stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiTokenBuyerAddress = {
  1: '0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5',
  11155111: '0x821176470cFeF1dB78F1e2dbae136f73c36ddd48',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiTokenBuyerConfig = {
  address: nijiTokenBuyerAddress,
  abi: nijiTokenBuyerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyer = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"MAX_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerMaxBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'MAX_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'admin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"baselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerBaselinePaymentTokenAmount = /*#__PURE__*/ createUseReadContract(
  {
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'baselinePaymentTokenAmount',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"botDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerBotDiscountBPs = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'botDiscountBPs',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"ethAmountPerTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerEthAmountPerTokenAmount = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'ethAmountPerTokenAmount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"ethNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerEthNeeded = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'ethNeeded',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"maxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'maxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"maxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerMaxAdminBotDiscountBPs = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'maxAdminBotDiscountBPs',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"minAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'minAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"minAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerMinAdminBotDiscountBPs = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'minAdminBotDiscountBPs',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPaused = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"payer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPayer = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'payer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPaymentToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'paymentToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paymentTokenDecimalsDigits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPaymentTokenDecimalsDigits = /*#__PURE__*/ createUseReadContract(
  {
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'paymentTokenDecimalsDigits',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"price"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPrice = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'price',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"priceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerPriceFeed = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'priceFeed',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerTokenAmountNeeded = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'tokenAmountNeeded',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeededAndETHPayout"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerTokenAmountNeededAndEthPayout =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'tokenAmountNeededAndETHPayout',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountPerEthAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiTokenBuyerTokenAmountPerEthAmount = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'tokenAmountPerEthAmount',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerBuyEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'buyETH',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerPause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setAdmin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetPayer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPayer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerSetPriceFeed = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPriceFeed',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiTokenBuyerWithdrawEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerBuyEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'buyETH',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerPause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetAdmin = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setAdmin',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetPayer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPayer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerSetPriceFeed = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPriceFeed',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerUnpause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiTokenBuyerWithdrawEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"AdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerAdminSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'AdminSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"BaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'BaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"BotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'BotDiscountBPsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerEthWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'ETHWithdrawn',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerMaxAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MaxAdminBaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerMaxAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MaxAdminBotDiscountBPsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MinAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerMinAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MinAdminBaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MinAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerMinAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MinAdminBotDiscountBPsSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'Paused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"PayerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerPayerSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'PayerSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"PriceFeedSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerPriceFeedSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'PriceFeedSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"SoldETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerSoldEthEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'SoldETH',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiTokenBuyerUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'Unpaused',
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyer = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"MAX_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerMaxBps = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'MAX_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'admin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"baselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerBaselinePaymentTokenAmount = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'baselinePaymentTokenAmount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"botDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'botDiscountBPs',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"ethAmountPerTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerEthAmountPerTokenAmount = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'ethAmountPerTokenAmount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"ethNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerEthNeeded = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'ethNeeded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"maxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createReadContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'maxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"maxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerMaxAdminBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'maxAdminBotDiscountBPs',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"minAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createReadContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'minAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"minAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerMinAdminBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'minAdminBotDiscountBPs',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerOwner = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPaused = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"payer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPayer = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'payer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPaymentToken = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'paymentToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"paymentTokenDecimalsDigits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPaymentTokenDecimalsDigits = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'paymentTokenDecimalsDigits',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"price"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPrice = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'price',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"priceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerPriceFeed = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'priceFeed',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerTokenAmountNeeded = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'tokenAmountNeeded',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeededAndETHPayout"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerTokenAmountNeededAndEthPayout = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'tokenAmountNeededAndETHPayout',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"tokenAmountPerEthAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiTokenBuyerTokenAmountPerEthAmount = /*#__PURE__*/ createReadContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'tokenAmountPerEthAmount',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyer = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerBuyEth = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'buyETH',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerPause = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setAdmin',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetBaselinePaymentTokenAmount = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setBaselinePaymentTokenAmount',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetMaxAdminBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setMaxAdminBotDiscountBPs',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createWriteContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetMinAdminBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setMinAdminBotDiscountBPs',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetPayer = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPayer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerSetPriceFeed = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPriceFeed',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerUnpause = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiTokenBuyerWithdrawEth = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyer = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerBuyEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'buyETH',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerPause = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setAdmin',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetPayer = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPayer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerSetPriceFeed = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'setPriceFeed',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerUnpause = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiTokenBuyerWithdrawEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"AdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerAdminSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'AdminSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"BaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'BaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"BotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerBotDiscountBPsSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'BotDiscountBPsSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerEthWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'ETHWithdrawn',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerMaxAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MaxAdminBaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerMaxAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MaxAdminBotDiscountBPsSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MinAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerMinAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MinAdminBaselinePaymentTokenAmountSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"MinAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerMinAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiTokenBuyerAbi,
    address: nijiTokenBuyerAddress,
    eventName: 'MinAdminBotDiscountBPsSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: nijiTokenBuyerAbi, address: nijiTokenBuyerAddress, eventName: 'OwnershipTransferred' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerPausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'Paused',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"PayerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerPayerSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'PayerSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"PriceFeedSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerPriceFeedSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'PriceFeedSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"SoldETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerSoldEthEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'SoldETH',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenBuyerAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiTokenBuyerUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenBuyerAbi,
  address: nijiTokenBuyerAddress,
  eventName: 'Unpaused',
})
