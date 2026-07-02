import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiSeeder
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const readNijiSeeder = /*#__PURE__*/ createReadContract({ abi: nijiSeederAbi });

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"art"`
 */
export const readNijiSeederArt = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'art',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"entropySalt"`
 */
export const readNijiSeederEntropySalt = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'entropySalt',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"generateSeed"`
 */
export const readNijiSeederGenerateSeed = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'generateSeed',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"generateSeedFromSource"`
 */
export const readNijiSeederGenerateSeedFromSource = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'generateSeedFromSource',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"getAllTraitCounts"`
 */
export const readNijiSeederGetAllTraitCounts = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'getAllTraitCounts',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"getTraitCount"`
 */
export const readNijiSeederGetTraitCount = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'getTraitCount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"isEntropySaltLocked"`
 */
export const readNijiSeederIsEntropySaltLocked = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'isEntropySaltLocked',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"owner"`
 */
export const readNijiSeederOwner = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const readNijiSeederPendingOwner = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const readNijiSeederRenounceOwnership = /*#__PURE__*/ createReadContract({
  abi: nijiSeederAbi,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const writeNijiSeeder = /*#__PURE__*/ createWriteContract({ abi: nijiSeederAbi });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const writeNijiSeederAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiSeederAbi,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"lockEntropySalt"`
 */
export const writeNijiSeederLockEntropySalt = /*#__PURE__*/ createWriteContract({
  abi: nijiSeederAbi,
  functionName: 'lockEntropySalt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setArt"`
 */
export const writeNijiSeederSetArt = /*#__PURE__*/ createWriteContract({
  abi: nijiSeederAbi,
  functionName: 'setArt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setEntropySalt"`
 */
export const writeNijiSeederSetEntropySalt = /*#__PURE__*/ createWriteContract({
  abi: nijiSeederAbi,
  functionName: 'setEntropySalt',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeNijiSeederTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiSeederAbi,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const simulateNijiSeeder = /*#__PURE__*/ createSimulateContract({ abi: nijiSeederAbi });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const simulateNijiSeederAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"lockEntropySalt"`
 */
export const simulateNijiSeederLockEntropySalt = /*#__PURE__*/ createSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'lockEntropySalt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setArt"`
 */
export const simulateNijiSeederSetArt = /*#__PURE__*/ createSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'setArt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setEntropySalt"`
 */
export const simulateNijiSeederSetEntropySalt = /*#__PURE__*/ createSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'setEntropySalt',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateNijiSeederTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const watchNijiSeederEvent = /*#__PURE__*/ createWatchContractEvent({ abi: nijiSeederAbi });

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"ArtUpdated"`
 */
export const watchNijiSeederArtUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"EntropySaltLockedEvent"`
 */
export const watchNijiSeederEntropySaltLockedEventEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'EntropySaltLockedEvent',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"EntropySaltUpdated"`
 */
export const watchNijiSeederEntropySaltUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'EntropySaltUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 */
export const watchNijiSeederOwnershipTransferStartedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'OwnershipTransferStarted',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"OwnershipTransferred"`
 */
export const watchNijiSeederOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'OwnershipTransferred',
});
