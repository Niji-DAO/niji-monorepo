import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

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
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyer = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"MAX_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerMaxBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'MAX_BPS',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'admin',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"baselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'baselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"botDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerBotDiscountBPs = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'botDiscountBPs',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"ethAmountPerTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerEthAmountPerTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'ethAmountPerTokenAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"ethNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerEthNeeded = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'ethNeeded',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"maxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'maxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"maxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerMaxAdminBotDiscountBPs = /*#__PURE__*/ createUseReadContract(
  {
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'maxAdminBotDiscountBPs',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"minAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'minAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"minAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerMinAdminBotDiscountBPs = /*#__PURE__*/ createUseReadContract(
  {
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'minAdminBotDiscountBPs',
  },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPaused = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"payer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPayer = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'payer',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paymentToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPaymentToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'paymentToken',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"paymentTokenDecimalsDigits"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPaymentTokenDecimalsDigits =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'paymentTokenDecimalsDigits',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"price"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPrice = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'price',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"priceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerPriceFeed = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'priceFeed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeeded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerTokenAmountNeeded = /*#__PURE__*/ createUseReadContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'tokenAmountNeeded',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountNeededAndETHPayout"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerTokenAmountNeededAndEthPayout =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'tokenAmountNeededAndETHPayout',
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"tokenAmountPerEthAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useReadNijiUsdcTokenBuyerTokenAmountPerEthAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'tokenAmountPerEthAmount',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerBuyEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'buyETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerPause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setAdmin',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetBotDiscountBPs = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setBotDiscountBPs',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetPayer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPayer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerSetPriceFeed = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPriceFeed',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWriteNijiUsdcTokenBuyerWithdrawEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"buyETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerBuyEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'buyETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerPause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'renounceOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetAdmin = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setAdmin',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetBotDiscountBPs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setBotDiscountBPs',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetMaxAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMaxAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetMaxAdminBotDiscountBPs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMaxAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBaselinePaymentTokenAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetMinAdminBaselinePaymentTokenAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBaselinePaymentTokenAmount',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setMinAdminBotDiscountBPs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetMinAdminBotDiscountBPs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'setMinAdminBotDiscountBPs',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPayer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetPayer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPayer',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"setPriceFeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerSetPriceFeed = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'setPriceFeed',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    functionName: 'transferOwnership',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerUnpause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useSimulateNijiUsdcTokenBuyerWithdrawEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  functionName: 'withdrawETH',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"AdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerAdminSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'AdminSet',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"BaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'BaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"BotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'BotDiscountBPsSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerEthWithdrawnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'ETHWithdrawn',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerMaxAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MaxAdminBaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MaxAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerMaxAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MaxAdminBotDiscountBPsSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MinAdminBaselinePaymentTokenAmountSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerMinAdminBaselinePaymentTokenAmountSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MinAdminBaselinePaymentTokenAmountSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"MinAdminBotDiscountBPsSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerMinAdminBotDiscountBPsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'MinAdminBotDiscountBPsSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'Paused',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"PayerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerPayerSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'PayerSet',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"PriceFeedSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerPriceFeedSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiUsdcTokenBuyerAbi,
    address: nijiUsdcTokenBuyerAddress,
    eventName: 'PriceFeedSet',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"SoldETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerSoldEthEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'SoldETH',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiUsdcTokenBuyerAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x4f2aCdc74f6941390d9b1804faBc3E780388cfe5)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x821176470cFeF1dB78F1e2dbae136f73c36ddd48)
 */
export const useWatchNijiUsdcTokenBuyerUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiUsdcTokenBuyerAbi,
  address: nijiUsdcTokenBuyerAddress,
  eventName: 'Unpaused',
});
