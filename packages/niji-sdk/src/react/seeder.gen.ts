import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

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
// React
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const useReadNijiSeeder = /*#__PURE__*/ createUseReadContract({ abi: nijiSeederAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"art"`
 */
export const useReadNijiSeederArt = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'art',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"entropySalt"`
 */
export const useReadNijiSeederEntropySalt = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'entropySalt',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"generateSeed"`
 */
export const useReadNijiSeederGenerateSeed = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'generateSeed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"generateSeedFromSource"`
 */
export const useReadNijiSeederGenerateSeedFromSource = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'generateSeedFromSource',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"getAllTraitCounts"`
 */
export const useReadNijiSeederGetAllTraitCounts = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'getAllTraitCounts',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"getTraitCount"`
 */
export const useReadNijiSeederGetTraitCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'getTraitCount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"isEntropySaltLocked"`
 */
export const useReadNijiSeederIsEntropySaltLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'isEntropySaltLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"owner"`
 */
export const useReadNijiSeederOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadNijiSeederPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useReadNijiSeederRenounceOwnership = /*#__PURE__*/ createUseReadContract({
  abi: nijiSeederAbi,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const useWriteNijiSeeder = /*#__PURE__*/ createUseWriteContract({ abi: nijiSeederAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteNijiSeederAcceptOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiSeederAbi,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"lockEntropySalt"`
 */
export const useWriteNijiSeederLockEntropySalt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiSeederAbi,
  functionName: 'lockEntropySalt',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setArt"`
 */
export const useWriteNijiSeederSetArt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiSeederAbi,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setEntropySalt"`
 */
export const useWriteNijiSeederSetEntropySalt = /*#__PURE__*/ createUseWriteContract({
  abi: nijiSeederAbi,
  functionName: 'setEntropySalt',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteNijiSeederTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiSeederAbi,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const useSimulateNijiSeeder = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateNijiSeederAcceptOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"lockEntropySalt"`
 */
export const useSimulateNijiSeederLockEntropySalt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'lockEntropySalt',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setArt"`
 */
export const useSimulateNijiSeederSetArt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'setArt',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"setEntropySalt"`
 */
export const useSimulateNijiSeederSetEntropySalt = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'setEntropySalt',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateNijiSeederTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiSeederAbi,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__
 */
export const useWatchNijiSeederEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiSeederAbi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"ArtUpdated"`
 */
export const useWatchNijiSeederArtUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'ArtUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"EntropySaltLockedEvent"`
 */
export const useWatchNijiSeederEntropySaltLockedEventEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiSeederAbi,
    eventName: 'EntropySaltLockedEvent',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"EntropySaltUpdated"`
 */
export const useWatchNijiSeederEntropySaltUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiSeederAbi,
  eventName: 'EntropySaltUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 */
export const useWatchNijiSeederOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiSeederAbi,
    eventName: 'OwnershipTransferStarted',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiSeederAbi}__ and `functionName` set to `"OwnershipTransferred"`
 */
export const useWatchNijiSeederOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiSeederAbi,
    eventName: 'OwnershipTransferred',
  });
