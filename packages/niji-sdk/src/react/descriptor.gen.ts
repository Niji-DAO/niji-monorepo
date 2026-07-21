import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

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
  84532: '0xb19CEb12010230Cd89708623e764B83616A5865d',
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
// React
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptor = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"SKIP_LAYER"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorSKIPLAYER = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'SKIP_LAYER',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"art"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorArt = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'art',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"compositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorCompositeOrder = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'compositeOrder',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateDataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorGenerateDataURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateDataURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVG"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorGenerateSVG = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVG',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVGBase64"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorGenerateSVGBase64 = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVGBase64',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorGetCompositeOrder = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getCompositeOrder',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getCompositeOrderLength"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorGetCompositeOrderLength = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getCompositeOrderLength',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isConfigured"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorIsConfigured = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isConfigured',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isMetadataFrozen"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorIsMetadataFrozen = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isMetadataFrozen',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorRenounceOwnership = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"resolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorResolution = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'resolution',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorTokenURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURIWithMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useReadNijiDescriptorTokenURIWithMetadata = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURIWithMetadata',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAcceptOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"freezeMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorFreezeMetadata = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'freezeMetadata',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetArt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetCompositeOrder = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setCompositeOrder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setResolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetResolution = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setResolution',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWriteNijiDescriptorTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAcceptOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"freezeMetadata"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorFreezeMetadata = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'freezeMetadata',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetArt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setCompositeOrder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetCompositeOrder = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setCompositeOrder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setResolution"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetResolution = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setResolution',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"ArtUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorArtUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"CompositeOrderUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorCompositeOrderUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'CompositeOrderUpdated',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"MetadataFrozen"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorMetadataFrozenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'MetadataFrozen',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'OwnershipTransferStarted',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"ResolutionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79E04ebCDf1ac2661697B23844149b43acc002d5)
 */
export const useWatchNijiDescriptorResolutionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'ResolutionUpdated',
  });
