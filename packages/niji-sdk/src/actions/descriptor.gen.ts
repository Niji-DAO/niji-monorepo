import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiDescriptor
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const nijiDescriptorAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_art',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_resolution',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: '_compositeOrder',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'EmptyArtAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyTraitIndices',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'provided',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expected',
        type: 'uint256',
      },
    ],
    name: 'InvalidCompositeOrderLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidResolution',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MetadataIsFrozen',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotConfigured',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RenounceOwnershipDisabled',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldArt',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newArt',
        type: 'address',
      },
    ],
    name: 'ArtUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'newCompositeOrder',
        type: 'uint256[]',
      },
    ],
    name: 'CompositeOrderUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'MetadataFrozen',
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
    name: 'OwnershipTransferStarted',
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
        internalType: 'uint256',
        name: 'oldResolution',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newResolution',
        type: 'uint256',
      },
    ],
    name: 'ResolutionUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'SKIP_LAYER',
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
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'art',
    outputs: [
      {
        internalType: 'contract NijiArt',
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
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'compositeOrder',
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
    inputs: [],
    name: 'freezeMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'traitIndices',
        type: 'uint256[]',
      },
    ],
    name: 'generateDataURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'traitIndices',
        type: 'uint256[]',
      },
    ],
    name: 'generateSVG',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'traitIndices',
        type: 'uint256[]',
      },
    ],
    name: 'generateSVGBase64',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCompositeOrder',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCompositeOrderLength',
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
    inputs: [],
    name: 'isConfigured',
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
    name: 'isMetadataFrozen',
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
    name: 'pendingOwner',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resolution',
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
        internalType: 'address',
        name: '_art',
        type: 'address',
      },
    ],
    name: 'setArt',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_compositeOrder',
        type: 'uint256[]',
      },
    ],
    name: 'setCompositeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_resolution',
        type: 'uint256',
      },
    ],
    name: 'setResolution',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'traitIndices',
        type: 'uint256[]',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'traitIndices',
        type: 'uint256[]',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
    ],
    name: 'tokenURIWithMetadata',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
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
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const nijiDescriptorAddress = {
  1: '0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC',
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  84532: '0x0000000000000000000000000000000000000000',
  11155111: '0x79E04ebCDf1ac2661697B23844149b43acc002d5',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const nijiDescriptorConfig = {
  address: nijiDescriptorAddress,
  abi: nijiDescriptorAbi,
} as const;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptor = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"SKIP_LAYER"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorSKIPLAYER = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'SKIP_LAYER',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"art"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorArt = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'art',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"compositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorCompositeOrder = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'compositeOrder',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateDataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorGenerateDataURI = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateDataURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVG"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorGenerateSVG = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVG',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVGBase64"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorGenerateSVGBase64 = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVGBase64',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorGetCompositeOrder = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getCompositeOrder',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getCompositeOrderLength"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorGetCompositeOrderLength = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getCompositeOrderLength',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isConfigured"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorIsConfigured = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isConfigured',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isMetadataFrozen"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorIsMetadataFrozen = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isMetadataFrozen',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorOwner = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorPendingOwner = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorRenounceOwnership = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"resolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorResolution = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'resolution',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorTokenURI = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURIWithMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const readNijiDescriptorTokenURIWithMetadata = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURIWithMetadata',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptor = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"freezeMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorFreezeMetadata = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'freezeMetadata',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorSetArt = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorSetCompositeOrder = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setCompositeOrder',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setResolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorSetResolution = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setResolution',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const writeNijiDescriptorTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptor = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"freezeMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorFreezeMetadata = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'freezeMetadata',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetArt = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetCompositeOrder = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setCompositeOrder',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setResolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetResolution = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setResolution',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const simulateNijiDescriptorTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"ArtUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorArtUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"CompositeOrderUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorCompositeOrderUpdatedEvent = /*#__PURE__*/ createWatchContractEvent(
  {
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'CompositeOrderUpdated',
  },
);

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"MetadataFrozen"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorMetadataFrozenEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'MetadataFrozen',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorOwnershipTransferStartedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'OwnershipTransferStarted',
  });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'OwnershipTransferred',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"ResolutionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const watchNijiDescriptorResolutionUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'ResolutionUpdated',
});
