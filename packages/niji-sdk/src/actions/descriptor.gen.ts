import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

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
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptor = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"accessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorAccessories = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'accessories',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"accessoryCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorAccessoryCount = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'accessoryCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"arePartsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorArePartsLocked = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'arePartsLocked',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"art"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorArt = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'art',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"backgroundCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorBackgroundCount = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'backgroundCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"backgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorBackgrounds = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'backgrounds',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"baseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorBaseUri = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'baseURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"bodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorBodies = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'bodies',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"bodyCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorBodyCount = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'bodyCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"dataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorDataUri = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'dataURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"generateSVGImage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorGenerateSvgImage = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'generateSVGImage',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"genericDataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorGenericDataUri = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'genericDataURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"getPartsForSeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorGetPartsForSeed = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'getPartsForSeed',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"glasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorGlasses = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'glasses',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"glassesCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorGlassesCount = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'glassesCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"headCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorHeadCount = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'headCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"heads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorHeads = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'heads',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"isDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorIsDataUriEnabled = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'isDataURIEnabled',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorOwner = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"palettes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorPalettes = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'palettes',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorRenderer = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renderer',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const readNijiDescriptorTokenUri = /*#__PURE__*/ createReadContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptor = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddAccessories = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addAccessories',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddAccessoriesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addAccessoriesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBackground"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddBackground = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBackground',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddBodies = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodies',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddBodiesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodiesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddGlasses = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlasses',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddGlassesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlassesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddHeads = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeads',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddHeadsFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeadsFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addManyBackgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorAddManyBackgrounds = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addManyBackgrounds',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"lockParts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorLockParts = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'lockParts',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetArt = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetArtDescriptor = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtDescriptor',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtInflator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetArtInflator = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtInflator',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetBaseUri = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalette"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetPalette = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalette',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalettePointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetPalettePointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalettePointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setRenderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorSetRenderer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setRenderer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"toggleDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorToggleDataUriEnabled = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'toggleDataURIEnabled',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateAccessories = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateAccessories',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateAccessoriesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateAccessoriesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateBodies = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodies',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateBodiesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodiesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateGlasses = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateGlasses',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateGlassesFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateGlassesFromPointer',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateHeads = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeads',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const writeNijiDescriptorUpdateHeadsFromPointer = /*#__PURE__*/ createWriteContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeadsFromPointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptor = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddAccessories = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addAccessories',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddAccessoriesFromPointer =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'addAccessoriesFromPointer',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBackground"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddBackground = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBackground',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddBodies = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodies',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddBodiesFromPointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addBodiesFromPointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddGlasses = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlasses',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddGlassesFromPointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addGlassesFromPointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddHeads = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeads',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddHeadsFromPointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addHeadsFromPointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"addManyBackgrounds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorAddManyBackgrounds = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'addManyBackgrounds',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"lockParts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorLockParts = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'lockParts',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetArt = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetArtDescriptor = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtDescriptor',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setArtInflator"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetArtInflator = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setArtInflator',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetBaseUri = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalette"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetPalette = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalette',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setPalettePointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetPalettePointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setPalettePointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"setRenderer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorSetRenderer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'setRenderer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"toggleDataURIEnabled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorToggleDataUriEnabled = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'toggleDataURIEnabled',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessories"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateAccessories = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateAccessories',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateAccessoriesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateAccessoriesFromPointer =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateAccessoriesFromPointer',
  });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodies"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateBodies = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodies',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateBodiesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateBodiesFromPointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateBodiesFromPointer',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlasses"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateGlasses = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateGlasses',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateGlassesFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateGlassesFromPointer = /*#__PURE__*/ createSimulateContract(
  {
    abi: nijiDescriptorAbi,
    address: nijiDescriptorAddress,
    functionName: 'updateGlassesFromPointer',
  },
);

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeads"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateHeads = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeads',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `functionName` set to `"updateHeadsFromPointer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const simulateNijiDescriptorUpdateHeadsFromPointer = /*#__PURE__*/ createSimulateContract({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  functionName: 'updateHeadsFromPointer',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"ArtUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorArtUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"BaseURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorBaseUriUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'BaseURIUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"DataURIToggled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorDataUriToggledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'DataURIToggled',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: nijiDescriptorAbi, address: nijiDescriptorAddress, eventName: 'OwnershipTransferred' },
);

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"PartsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorPartsLockedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'PartsLocked',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDescriptorAbi}__ and `eventName` set to `"RendererUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x79e04ebcdf1ac2661697b23844149b43acc002d5)
 */
export const watchNijiDescriptorRendererUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDescriptorAbi,
  address: nijiDescriptorAddress,
  eventName: 'RendererUpdated',
});
