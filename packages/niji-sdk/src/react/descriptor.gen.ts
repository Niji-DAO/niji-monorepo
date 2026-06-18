import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiDescriptor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const nijiDescriptorAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_art', internalType: 'contract INounsArt', type: 'address' },
      { name: '_renderer', internalType: 'contract ISVGRenderer', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'BadPaletteLength' },
  { type: 'error', inputs: [], name: 'EmptyPalette' },
  { type: 'error', inputs: [], name: 'IndexNotFound' },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'art', internalType: 'contract INounsArt', type: 'address', indexed: false }],
    name: 'ArtUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'baseURI', internalType: 'string', type: 'string', indexed: false }],
    name: 'BaseURIUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'DataURIToggled',
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
  { type: 'event', anonymous: false, inputs: [], name: 'PartsLocked' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'renderer', internalType: 'contract ISVGRenderer', type: 'address', indexed: false },
    ],
    name: 'RendererUpdated',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'accessories',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accessoryCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addAccessories',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addAccessoriesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_background', internalType: 'string', type: 'string' }],
    name: 'addBackground',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addBodies',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addBodiesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addGlasses',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addGlassesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addHeads',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addHeadsFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_backgrounds', internalType: 'string[]', type: 'string[]' }],
    name: 'addManyBackgrounds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'arePartsLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'art',
    outputs: [{ name: '', internalType: 'contract INounsArt', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'backgroundCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'backgrounds',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'baseURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'bodies',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bodyCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'dataURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'generateSVGImage',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'description', internalType: 'string', type: 'string' },
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'genericDataURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'getPartsForSeed',
    outputs: [
      {
        name: '',
        internalType: 'struct ISVGRenderer.Part[]',
        type: 'tuple[]',
        components: [
          { name: 'image', internalType: 'bytes', type: 'bytes' },
          { name: 'palette', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'glasses',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'glassesCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'headCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'heads',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isDataURIEnabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'lockParts', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint8', type: 'uint8' }],
    name: 'palettes',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renderer',
    outputs: [{ name: '', internalType: 'contract ISVGRenderer', type: 'address' }],
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
    inputs: [{ name: '_art', internalType: 'contract INounsArt', type: 'address' }],
    name: 'setArt',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'descriptor', internalType: 'address', type: 'address' }],
    name: 'setArtDescriptor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'inflator', internalType: 'contract IInflator', type: 'address' }],
    name: 'setArtInflator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_baseURI', internalType: 'string', type: 'string' }],
    name: 'setBaseURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'paletteIndex', internalType: 'uint8', type: 'uint8' },
      { name: 'palette', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setPalette',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'paletteIndex', internalType: 'uint8', type: 'uint8' },
      { name: 'pointer', internalType: 'address', type: 'address' },
    ],
    name: 'setPalettePointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_renderer', internalType: 'contract ISVGRenderer', type: 'address' }],
    name: 'setRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'toggleDataURIEnabled',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateAccessories',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateAccessoriesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateBodies',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateBodiesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateGlasses',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateGlassesFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'encodedCompressed', internalType: 'bytes', type: 'bytes' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateHeads',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pointer', internalType: 'address', type: 'address' },
      { name: 'decompressedLength', internalType: 'uint80', type: 'uint80' },
      { name: 'imageCount', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'updateHeadsFromPointer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const nijiDescriptorAddress = {
  1: '0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC',
  11155111: '0x79E04ebCDf1ac2661697B23844149b43acc002d5',
  31337: '0x0000000000000000000000000000000000000000',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const nijiDescriptorConfig = {
  address: nijiDescriptorAddress,
  abi: nijiDescriptorAbi,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptor = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"accessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorAccessories = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'accessories',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"accessoryCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorAccessoryCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'accessoryCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"arePartsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorArePartsLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'arePartsLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"art"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorArt = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'art',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"backgroundCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorBackgroundCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'backgroundCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"backgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorBackgrounds = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'backgrounds',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"baseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorBaseUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'baseURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"bodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorBodies = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'bodies',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"bodyCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorBodyCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'bodyCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"dataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorDataUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'dataURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVGImage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorGenerateSvgImage = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVGImage',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"genericDataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorGenericDataUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'genericDataURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getPartsForSeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorGetPartsForSeed = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getPartsForSeed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"glasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorGlasses = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'glasses',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"glassesCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorGlassesCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'glassesCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"headCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorHeadCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'headCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"heads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorHeads = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'heads',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorIsDataUriEnabled = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isDataURIEnabled',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"palettes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorPalettes = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'palettes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorRenderer = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renderer',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useReadNijiDescriptorTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddAccessories = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addAccessories',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddAccessoriesFromPointer =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addAccessoriesFromPointer',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBackground"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddBackground = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBackground',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddBodies = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodies',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddBodiesFromPointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodiesFromPointer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddGlasses = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlasses',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddGlassesFromPointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlassesFromPointer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddHeads = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeads',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddHeadsFromPointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeadsFromPointer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addManyBackgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorAddManyBackgrounds = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addManyBackgrounds',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"lockParts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorLockParts = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'lockParts',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetArt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetArtDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtDescriptor',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtInflator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetArtInflator = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtInflator',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetBaseUri = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalette"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetPalette = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalette',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalettePointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetPalettePointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalettePointer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setRenderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorSetRenderer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setRenderer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"toggleDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorToggleDataUriEnabled = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'toggleDataURIEnabled',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateAccessories = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateAccessories',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateAccessoriesFromPointer =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateAccessoriesFromPointer',
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateBodies = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodies',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateBodiesFromPointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodiesFromPointer',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateGlasses = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateGlasses',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateGlassesFromPointer = /*#__PURE__*/ createUseWriteContract(
  {
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateGlassesFromPointer',
  },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateHeads = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeads',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWriteNijiDescriptorUpdateHeadsFromPointer = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeadsFromPointer',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddAccessories = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addAccessories',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddAccessoriesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addAccessoriesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBackground"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddBackground = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBackground',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddBodies = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodies',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddBodiesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addBodiesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddGlasses = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlasses',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddGlassesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addGlassesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddHeads = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeads',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddHeadsFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addHeadsFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addManyBackgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorAddManyBackgrounds = /*#__PURE__*/ createUseSimulateContract(
  { abi: nijiDescriptorAbi, address: nijiDescriptorAddress, functionName: 'addManyBackgrounds' },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"lockParts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorLockParts = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'lockParts',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetArt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetArtDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtDescriptor',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtInflator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetArtInflator = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtInflator',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetBaseUri = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalette"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetPalette = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalette',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalettePointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetPalettePointer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalettePointer',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setRenderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorSetRenderer = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setRenderer',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"toggleDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorToggleDataUriEnabled =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'toggleDataURIEnabled',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateAccessories = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateAccessories',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateAccessoriesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateAccessoriesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateBodies = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodies',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateBodiesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateBodiesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateGlasses = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateGlasses',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateGlassesFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateGlassesFromPointer',
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateHeads = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeads',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useSimulateNijiDescriptorUpdateHeadsFromPointer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateHeadsFromPointer',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"ArtUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorArtUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"BaseURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorBaseUriUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiDescriptorAbi, address: nijiDescriptorAddress, eventName: 'BaseURIUpdated' },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"DataURIToggled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorDataUriToggledEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiDescriptorAbi, address: nijiDescriptorAddress, eventName: 'DataURIToggled' },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"PartsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorPartsLockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'PartsLocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"RendererUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const useWatchNijiDescriptorRendererUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    eventName: 'RendererUpdated',
  });
