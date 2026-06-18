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
// NijiAuctionHouse
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const nijiAuctionHouseAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_nouns', internalType: 'contract INijiToken', type: 'address' },
      { name: '_weth', internalType: 'address', type: 'address' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'sender', internalType: 'address', type: 'address', indexed: false },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'extended', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'AuctionBid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'clientId', internalType: 'uint32', type: 'uint32', indexed: true },
    ],
    name: 'AuctionBidWithClientId',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'startTime', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'endTime', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'endTime', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionExtended',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minBidIncrementPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionMinBidIncrementPercentageUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'reservePrice', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'AuctionReservePriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'winner', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'AuctionSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'clientId', internalType: 'uint32', type: 'uint32', indexed: true },
    ],
    name: 'AuctionSettledWithClientId',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'timeBuffer', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'AuctionTimeBufferUpdated',
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
      { name: 'newSanctionsOracle', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'SanctionsOracleSet',
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
    name: 'MAX_TIME_BUFFER',
    outputs: [{ name: '', internalType: 'uint56', type: 'uint56' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auction',
    outputs: [
      {
        name: '',
        internalType: 'struct INijiAuctionHouseV3.AuctionV2View',
        type: 'tuple',
        components: [
          { name: 'nounId', internalType: 'uint96', type: 'uint96' },
          { name: 'amount', internalType: 'uint128', type: 'uint128' },
          { name: 'startTime', internalType: 'uint40', type: 'uint40' },
          { name: 'endTime', internalType: 'uint40', type: 'uint40' },
          { name: 'bidder', internalType: 'address payable', type: 'address' },
          { name: 'settled', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auctionStorage',
    outputs: [
      { name: 'nounId', internalType: 'uint96', type: 'uint96' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
      { name: 'amount', internalType: 'uint128', type: 'uint128' },
      { name: 'startTime', internalType: 'uint40', type: 'uint40' },
      { name: 'endTime', internalType: 'uint40', type: 'uint40' },
      { name: 'bidder', internalType: 'address payable', type: 'address' },
      { name: 'settled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'nounId', internalType: 'uint256', type: 'uint256' }],
    name: 'biddingClient',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'nounId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nounId', internalType: 'uint256', type: 'uint256' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'auctionCount', internalType: 'uint256', type: 'uint256' }],
    name: 'getPrices',
    outputs: [{ name: 'prices', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'auctionCount', internalType: 'uint256', type: 'uint256' },
      { name: 'skipEmptyValues', internalType: 'bool', type: 'bool' },
    ],
    name: 'getSettlements',
    outputs: [
      {
        name: 'settlements',
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        type: 'tuple[]',
        components: [
          { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'nounId', internalType: 'uint256', type: 'uint256' },
          { name: 'clientId', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startId', internalType: 'uint256', type: 'uint256' },
      { name: 'endId', internalType: 'uint256', type: 'uint256' },
      { name: 'skipEmptyValues', internalType: 'bool', type: 'bool' },
    ],
    name: 'getSettlements',
    outputs: [
      {
        name: 'settlements',
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        type: 'tuple[]',
        components: [
          { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'nounId', internalType: 'uint256', type: 'uint256' },
          { name: 'clientId', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startId', internalType: 'uint256', type: 'uint256' },
      { name: 'endTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'skipEmptyValues', internalType: 'bool', type: 'bool' },
    ],
    name: 'getSettlementsFromIdtoTimestamp',
    outputs: [
      {
        name: 'settlements',
        internalType: 'struct INijiAuctionHouseV3.Settlement[]',
        type: 'tuple[]',
        components: [
          { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'nounId', internalType: 'uint256', type: 'uint256' },
          { name: 'clientId', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint192', type: 'uint192' },
      { name: '_timeBuffer', internalType: 'uint56', type: 'uint56' },
      { name: '_minBidIncrementPercentage', internalType: 'uint8', type: 'uint8' },
      {
        name: '_sanctionsOracle',
        internalType: 'contract IChainalysisSanctionsList',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minBidIncrementPercentage',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nouns',
    outputs: [{ name: '', internalType: 'contract INijiToken', type: 'address' }],
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint192', type: 'uint192' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sanctionsOracle',
    outputs: [{ name: '', internalType: 'contract IChainalysisSanctionsList', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_minBidIncrementPercentage', internalType: 'uint8', type: 'uint8' }],
    name: 'setMinBidIncrementPercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'settlements',
        internalType: 'struct INijiAuctionHouseV3.SettlementNoClientId[]',
        type: 'tuple[]',
        components: [
          { name: 'blockTimestamp', internalType: 'uint32', type: 'uint32' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'nounId', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'setPrices',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_reservePrice', internalType: 'uint192', type: 'uint192' }],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newSanctionsOracle', internalType: 'address', type: 'address' }],
    name: 'setSanctionsOracle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint56', type: 'uint56' }],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint56', type: 'uint56' }],
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
  {
    type: 'function',
    inputs: [
      { name: 'startId', internalType: 'uint256', type: 'uint256' },
      { name: 'endId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'warmUpSettlementState',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'weth',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const nijiAuctionHouseAddress = {
  1: '0x830BD73E4184ceF73443C15111a1DF14e495C706',
  11155111: '0x488609b7113FCf3B761A05956300d605E8f6BcAf',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const nijiAuctionHouseConfig = {
  address: nijiAuctionHouseAddress,
  abi: nijiAuctionHouseAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouse = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"MAX_TIME_BUFFER"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseMaxTimeBuffer = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'MAX_TIME_BUFFER',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseAuction = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auction',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auctionStorage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseAuctionStorage = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auctionStorage',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"biddingClient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseBiddingClient = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'biddingClient',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"duration"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseDuration = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'duration',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseGetPrices = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getPrices',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlements"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseGetSettlements = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getSettlements',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlementsFromIdtoTimestamp"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseGetSettlementsFromIdtoTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'getSettlementsFromIdtoTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"minBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseMinBidIncrementPercentage =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'minBidIncrementPercentage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"nouns"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseNouns = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'nouns',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHousePaused = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"reservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseReservePrice = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'reservePrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"sanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseSanctionsOracle = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'sanctionsOracle',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"timeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseTimeBuffer = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'timeBuffer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"weth"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useReadNijiAuctionHouseWeth = /*#__PURE__*/ createUseReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'weth',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouse = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseCreateBid = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHousePause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSetMinBidIncrementPercentage =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setMinBidIncrementPercentage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSetPrices = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSetSanctionsOracle = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setSanctionsOracle',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSettleAuction = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWriteNijiAuctionHouseWarmUpSettlementState = /*#__PURE__*/ createUseWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'warmUpSettlementState',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouse = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseCreateBid = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHousePause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSetMinBidIncrementPercentage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setMinBidIncrementPercentage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSetPrices = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSetSanctionsOracle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setSanctionsOracle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSettleAuction = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseUnpause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useSimulateNijiAuctionHouseWarmUpSettlementState =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'warmUpSettlementState',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionBidEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionBid',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionBidWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionBidWithClientIdEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionBidWithClientId',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionExtended"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionExtendedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionExtended',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionMinBidIncrementPercentageUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionMinBidIncrementPercentageUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionMinBidIncrementPercentageUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionReservePriceUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionReservePriceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionReservePriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionSettled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionSettledWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionSettledWithClientIdEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionSettledWithClientId',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionTimeBufferUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseAuctionTimeBufferUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionTimeBufferUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHousePausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Paused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"SanctionsOracleSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseSanctionsOracleSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'SanctionsOracleSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const useWatchNijiAuctionHouseUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Unpaused',
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouse = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"MAX_TIME_BUFFER"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseMaxTimeBuffer = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'MAX_TIME_BUFFER',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseAuction = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auction',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"auctionStorage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseAuctionStorage = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'auctionStorage',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"biddingClient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseBiddingClient = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'biddingClient',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"duration"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseDuration = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'duration',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseGetPrices = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getPrices',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlements"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseGetSettlements = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'getSettlements',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"getSettlementsFromIdtoTimestamp"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseGetSettlementsFromIdtoTimestamp =
  /*#__PURE__*/ createReadContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'getSettlementsFromIdtoTimestamp',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"minBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseMinBidIncrementPercentage = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'minBidIncrementPercentage',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"nouns"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseNouns = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'nouns',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseOwner = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHousePaused = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"reservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseReservePrice = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'reservePrice',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"sanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseSanctionsOracle = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'sanctionsOracle',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"timeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseTimeBuffer = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'timeBuffer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"weth"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const readNijiAuctionHouseWeth = /*#__PURE__*/ createReadContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'weth',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouse = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseCreateBid = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHousePause = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSetMinBidIncrementPercentage = /*#__PURE__*/ createWriteContract(
  {
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setMinBidIncrementPercentage',
  },
)

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSetPrices = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSetSanctionsOracle = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setSanctionsOracle',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSettleAuction = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createWriteContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseUnpause = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const writeNijiAuctionHouseWarmUpSettlementState = /*#__PURE__*/ createWriteContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'warmUpSettlementState',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouse = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"createBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseCreateBid = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'createBid',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHousePause = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setMinBidIncrementPercentage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSetMinBidIncrementPercentage =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'setMinBidIncrementPercentage',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setPrices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSetPrices = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setPrices',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setReservePrice"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSetReservePrice = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setReservePrice',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setSanctionsOracle"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSetSanctionsOracle = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setSanctionsOracle',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"setTimeBuffer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSetTimeBuffer = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'setTimeBuffer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSettleAuction = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'settleAuction',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseUnpause = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `functionName` set to `"warmUpSettlementState"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const simulateNijiAuctionHouseWarmUpSettlementState = /*#__PURE__*/ createSimulateContract({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  functionName: 'warmUpSettlementState',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionBid"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionBidEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionBid',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionBidWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionBidWithClientIdEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionBidWithClientId',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionCreated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionExtended"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionExtendedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionExtended',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionMinBidIncrementPercentageUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionMinBidIncrementPercentageUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionMinBidIncrementPercentageUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionReservePriceUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionReservePriceUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionReservePriceUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionSettled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionSettledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'AuctionSettled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionSettledWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionSettledWithClientIdEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionSettledWithClientId',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"AuctionTimeBufferUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseAuctionTimeBufferUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'AuctionTimeBufferUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiAuctionHouseAbi,
    address: nijiAuctionHouseAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHousePausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Paused',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"SanctionsOracleSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseSanctionsOracleSetEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: nijiAuctionHouseAbi, address: nijiAuctionHouseAddress, eventName: 'SanctionsOracleSet' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiAuctionHouseAbi}__ and `eventName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x488609b7113fcf3b761a05956300d605e8f6bcaf)
 */
export const watchNijiAuctionHouseUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiAuctionHouseAbi,
  address: nijiAuctionHouseAddress,
  eventName: 'Unpaused',
})
