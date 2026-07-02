export const nijiSeederAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_art',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'EntropySaltLocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidArtAddress',
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
    inputs: [],
    name: 'EntropySaltLockedEvent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'newSalt',
        type: 'bytes32',
      },
    ],
    name: 'EntropySaltUpdated',
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
    inputs: [],
    name: 'entropySalt',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
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
        internalType: 'address',
        name: 'descriptor',
        type: 'address',
      },
    ],
    name: 'generateSeed',
    outputs: [
      {
        components: [
          {
            internalType: 'uint48',
            name: 'special',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'choker',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'headphone',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'leftHand',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'hat',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'clothing',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'ear',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'back',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'backDecoration',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'background',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'solidBackground',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'hair',
            type: 'uint48',
          },
        ],
        internalType: 'struct INijiSeeder.Seed',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'randomSource',
        type: 'uint256',
      },
    ],
    name: 'generateSeedFromSource',
    outputs: [
      {
        components: [
          {
            internalType: 'uint48',
            name: 'special',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'choker',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'headphone',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'leftHand',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'hat',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'clothing',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'ear',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'back',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'backDecoration',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'background',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'solidBackground',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'hair',
            type: 'uint48',
          },
        ],
        internalType: 'struct INijiSeeder.Seed',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllTraitCounts',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'traitId',
        type: 'uint256',
      },
    ],
    name: 'getTraitCount',
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
    name: 'isEntropySaltLocked',
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
    name: 'lockEntropySalt',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'bytes32',
        name: 'newSalt',
        type: 'bytes32',
      },
    ],
    name: 'setEntropySalt',
    outputs: [],
    stateMutability: 'nonpayable',
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
