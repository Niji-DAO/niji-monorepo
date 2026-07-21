import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiAuctionHouse
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const nijiAuctionHouseAbi = [
  {
    inputs: [
      {
        internalType: 'contract INijiToken',
        name: '_nouns',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_weth',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'extended',
        type: 'bool',
      },
    ],
    name: 'AuctionBid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'clientId',
        type: 'uint32',
      },
    ],
    name: 'AuctionBidWithClientId',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    name: 'AuctionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    name: 'AuctionExtended',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minBidIncrementPercentage',
        type: 'uint256',
      },
    ],
    name: 'AuctionMinBidIncrementPercentageUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservePrice',
        type: 'uint256',
      },
    ],
    name: 'AuctionReservePriceUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AuctionSettled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'clientId',
        type: 'uint32',
      },
    ],
    name: 'AuctionSettledWithClientId',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timeBuffer',
        type: 'uint256',
      },
    ],
    name: 'AuctionTimeBufferUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newSanctionsOracle',
        type: 'address',
      },
    ],
    name: 'SanctionsOracleSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'MAX_TIME_BUFFER',
    outputs: [
      {
        internalType: 'uint56',
        name: '',
        type: 'uint56',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'auction',
    outputs: [
      {
        components: [
          {
            internalType: 'uint96',
            name: 'nounId',
            type: 'uint96',
          },
          {
            internalType: 'uint128',
            name: 'amount',
            type: 'uint128',
          },
          {
            internalType: 'uint40',
            name: 'startTime',
            type: 'uint40',
          },
          {
            internalType: 'uint40',
            name: 'endTime',
            type: 'uint40',
          },
          {
            internalType: 'address payable',
            name: 'bidder',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'settled',
            type: 'bool',
          },
        ],
        internalType: 'struct INijiAuctionHouseV3.AuctionV2View',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'auctionStorage',
    outputs: [
      {
        internalType: 'uint96',
        name: 'nounId',
        type: 'uint96',
      },
      {
        internalType: 'uint32',
        name: 'clientId',
        type: 'uint32',
      },
      {
        internalType: 'uint128',
        name: 'amount',
        type: 'uint128',
      },
      {
        internalType: 'uint40',
        name: 'startTime',
        type: 'uint40',
      },
      {
        internalType: 'uint40',
        name: 'endTime',
        type: 'uint40',
      },
      {
        internalType: 'address payable',
        name: 'bidder',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'settled',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
    ],
    name: 'biddingClient',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
    ],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'nounId',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'clientId',
        type: 'uint32',
      },
    ],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'duration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'auctionCount',
        type: 'uint256',
      },
    ],
    name: 'getPrices',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'prices',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'auctionCount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'skipEmptyValues',
        type: 'bool',
      },
    ],
    name: 'getSettlements',
    outputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'blockTimestamp',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nounId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'clientId',
            type: 'uint32',
          },
        ],
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        name: 'settlements',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'skipEmptyValues',
        type: 'bool',
      },
    ],
    name: 'getSettlements',
    outputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'blockTimestamp',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nounId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'clientId',
            type: 'uint32',
          },
        ],
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        name: 'settlements',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endTimestamp',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'skipEmptyValues',
        type: 'bool',
      },
    ],
    name: 'getSettlementsFromIdtoTimestamp',
    outputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'blockTimestamp',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nounId',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'clientId',
            type: 'uint32',
          },
        ],
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        name: 'settlements',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint192',
        name: '_reservePrice',
        type: 'uint192',
      },
      {
        internalType: 'uint56',
        name: '_timeBuffer',
        type: 'uint56',
      },
      {
        internalType: 'uint8',
        name: '_minBidIncrementPercentage',
        type: 'uint8',
      },
      {
        internalType: 'contract IChainalysisSanctionsList',
        name: '_sanctionsOracle',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minBidIncrementPercentage',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nouns',
    outputs: [
      {
        internalType: 'contract INijiToken',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
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
    inputs: [],
    name: 'reservePrice',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sanctionsOracle',
    outputs: [
      {
        internalType: 'contract IChainalysisSanctionsList',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: '_minBidIncrementPercentage',
        type: 'uint8',
      },
    ],
    name: 'setMinBidIncrementPercentage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'blockTimestamp',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'winner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nounId',
            type: 'uint256',
          },
        ],
        internalType: 'struct INijiAuctionHouseV3.SettlementNoClientId[]',
        name: 'settlements',
        type: 'tuple[]',
      },
    ],
    name: 'setPrices',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint192',
        name: '_reservePrice',
        type: 'uint192',
      },
    ],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newSanctionsOracle',
        type: 'address',
      },
    ],
    name: 'setSanctionsOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint56',
        name: '_timeBuffer',
        type: 'uint56',
      },
    ],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timeBuffer',
    outputs: [
      {
        internalType: 'uint56',
        name: '',
        type: 'uint56',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'startId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endId',
        type: 'uint256',
      },
    ],
    name: 'warmUpSettlementState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'weth',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const nijiAuctionHouseAddress = {
  1: '0x830BD73E4184ceF73443C15111a1DF14e495C706',
  31337: '0x1Dbbf529D78d6507B0dd71F6c02f41138d828990',
  84532: '0x2dD20203b271053D59ef2B8141674AceD71A1a03',
  11155111: '0x488609b7113FCf3B761A05956300d605E8f6BcAf',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const nijiAuctionHouseConfig = {
  address: nijiAuctionHouseAddress,
  abi: nijiAuctionHouseAbi,
} as const;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouse = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"MAX_TIME_BUFFER"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseMAXTIMEBUFFER = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'MAX_TIME_BUFFER',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseAuction = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auction',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auctionStorage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseAuctionStorage = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auctionStorage',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"biddingClient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseBiddingClient = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'biddingClient',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"duration"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseDuration = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'duration',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseGetPrices = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getPrices',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlements"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseGetSettlements = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getSettlements',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlementsFromIdtoTimestamp"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseGetSettlementsFromIdtoTimestamp = /*#__PURE__*/ createReadContract(
  {
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'getSettlementsFromIdtoTimestamp',
  },
);

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"minBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseMinBidIncrementPercentage = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'minBidIncrementPercentage',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"nouns"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseNouns = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'nouns',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseOwner = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHousePaused = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"reservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseReservePrice = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'reservePrice',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"sanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseSanctionsOracle = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'sanctionsOracle',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"timeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseTimeBuffer = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'timeBuffer',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"weth"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const readNijiAuctionHouseWeth = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'weth',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouse = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseCreateBid = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHousePause = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSetMinBidIncrementPercentage = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setMinBidIncrementPercentage',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSetPrices = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSetSanctionsOracle = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setSanctionsOracle',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSettleAuction = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createWriteContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseUnpause = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const writeNijiAuctionHouseWarmUpSettlementState = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'warmUpSettlementState',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouse = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseCreateBid = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHousePause = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSetMinBidIncrementPercentage =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setMinBidIncrementPercentage',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSetPrices = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSetSanctionsOracle = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setSanctionsOracle',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSettleAuction = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseUnpause = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const simulateNijiAuctionHouseWarmUpSettlementState = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'warmUpSettlementState',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionBidEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionBid',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionBidWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionBidWithClientIdEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionBidWithClientId',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionCreated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionExtended"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionExtendedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionExtended',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionMinBidIncrementPercentageUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionMinBidIncrementPercentageUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionMinBidIncrementPercentageUpdated',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionReservePriceUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionReservePriceUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionReservePriceUpdated',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionSettled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionSettledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionSettled',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionSettledWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionSettledWithClientIdEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionSettledWithClientId',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"AuctionTimeBufferUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseAuctionTimeBufferUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionTimeBufferUpdated',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHousePausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Paused',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"SanctionsOracleSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseSanctionsOracleSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'SanctionsOracleSet',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113FCf3B761A05956300d605E8f6BcAf)
 */
export const watchNijiAuctionHouseUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Unpaused',
});
