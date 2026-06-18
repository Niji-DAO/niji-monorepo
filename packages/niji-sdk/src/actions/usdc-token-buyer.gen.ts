import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiUSDCTokenBuyer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiUsdcTokenBuyerAbi = [
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
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiUsdcTokenBuyerAddress = {
  1: '0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5',
  11155111: '0x821176470cFeF1dB78F1e2dbae136f73c36ddd48',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const nijiUsdcTokenBuyerConfig = {
  address: nijiUsdcTokenBuyerAddress,
  abi: nijiUsdcTokenBuyerAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyer = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"MAX_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerMaxBps = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'MAX_BPS',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'admin',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"baselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerBaselinePaymentTokenAmount = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'baselinePaymentTokenAmount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"botDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'botDiscountBPs',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"ethAmountPerTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerEthAmountPerTokenAmount = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'ethAmountPerTokenAmount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"ethNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerEthNeeded = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'ethNeeded',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"maxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'maxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"maxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerMaxAdminBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'maxAdminBotDiscountBPs',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"minAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'minAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"minAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerMinAdminBotDiscountBPs = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'minAdminBotDiscountBPs',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerOwner = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPaused = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"payer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPayer = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'payer',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPaymentToken = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'paymentToken',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paymentTokenDecimalsDigits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPaymentTokenDecimalsDigits = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'paymentTokenDecimalsDigits',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"price"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPrice = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'price',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"priceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerPriceFeed = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'priceFeed',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerTokenAmountNeeded = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'tokenAmountNeeded',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeededAndETHPayout"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerTokenAmountNeededAndEthPayout =
  /*#__PURE__*/ createReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'tokenAmountNeededAndETHPayout',
  });

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountPerEthAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const readNijiUsdcTokenBuyerTokenAmountPerEthAmount = /*#__PURE__*/ createReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'tokenAmountPerEthAmount',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyer = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerBuyEth = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'buyETH',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerPause = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setAdmin',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetMaxAdminBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setMaxAdminBotDiscountBPs',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetMinAdminBotDiscountBPs = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setMinAdminBotDiscountBPs',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetPayer = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPayer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerSetPriceFeed = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPriceFeed',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerUnpause = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const writeNijiUsdcTokenBuyerWithdrawEth = /*#__PURE__*/ createWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyer = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerBuyEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'buyETH',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerPause = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setAdmin',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetPayer = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPayer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerSetPriceFeed = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPriceFeed',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerUnpause = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const simulateNijiUsdcTokenBuyerWithdrawEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"AdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerAdminSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'AdminSet',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"BaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'BaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"BotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerBotDiscountBPsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'BotDiscountBPsSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerEthWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'ETHWithdrawn',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerMaxAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MaxAdminBaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerMaxAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MaxAdminBotDiscountBPsSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MinAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerMinAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MinAdminBaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MinAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerMinAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MinAdminBotDiscountBPsSet',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerPausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'Paused',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"PayerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerPayerSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'PayerSet',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"PriceFeedSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerPriceFeedSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'PriceFeedSet',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"SoldETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerSoldEthEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'SoldETH',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const watchNijiUsdcTokenBuyerUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'Unpaused',
});
