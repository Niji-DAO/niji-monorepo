import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiToken
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenAbi = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: '_descriptor',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_seeder',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_maxSupply',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'BaseURIIsLocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CheckpointUnorderedInsertion',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContractsAreLocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DescriptorNotSet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ECDSAInvalidSignature',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'ECDSAInvalidSignatureS',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timepoint',
        type: 'uint256',
      },
      {
        internalType: 'uint48',
        name: 'clock',
        type: 'uint48',
      },
    ],
    name: 'ERC5805FutureLookup',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC6372InconsistentClock',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ERC721EnumerableForbiddenBatchMint',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'ERC721IncorrectOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ERC721InsufficientApproval',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC721InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'ERC721InvalidOperator',
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
    name: 'ERC721InvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC721InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC721InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ERC721NonexistentToken',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'ERC721OutOfBoundsIndex',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyPlaceholderURI',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EnforcedPause',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExpectedPause',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'currentNonce',
        type: 'uint256',
      },
    ],
    name: 'InvalidAccountNonce',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidShortString',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MaxSupplyReached',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'requested',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'MintBatchQuantityExceedsLimit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MintingNotActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyMinter',
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
    name: 'PlaceholderURINotSet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProvenanceHashLocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RenounceOwnershipDisabled',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RevealAlreadyDone',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'bits',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'SafeCastOverflowedUintDowncast',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SeederNotSet',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'str',
        type: 'string',
      },
    ],
    name: 'StringTooLong',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TokenDoesNotExist',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
    ],
    name: 'VotesExpiredSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawAmountExceedsBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'WithdrawFailed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'approved',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'BaseURILocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'newBaseURI',
        type: 'string',
      },
    ],
    name: 'BaseURIUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_fromTokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_toTokenId',
        type: 'uint256',
      },
    ],
    name: 'BatchMetadataUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'newContractURIHash',
        type: 'string',
      },
    ],
    name: 'ContractURIHashUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'ContractsLocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'delegator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'fromDelegate',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'toDelegate',
        type: 'address',
      },
    ],
    name: 'DelegateChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'previousVotes',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newVotes',
        type: 'uint256',
      },
    ],
    name: 'DelegateVotesChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldDescriptor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newDescriptor',
        type: 'address',
      },
    ],
    name: 'DescriptorUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'EIP712DomainChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256',
      },
    ],
    name: 'MetadataUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldMinter',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newMinter',
        type: 'address',
      },
    ],
    name: 'MinterUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    name: 'MintingToggled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
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
        indexed: false,
        internalType: 'struct INijiSeeder.Seed',
        name: 'seed',
        type: 'tuple',
      },
    ],
    name: 'NijiMinted',
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
        internalType: 'string',
        name: 'newPlaceholderURI',
        type: 'string',
      },
    ],
    name: 'PlaceholderURIUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'provenanceHash',
        type: 'string',
      },
    ],
    name: 'ProvenanceHashSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Revealed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldSeeder',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newSeeder',
        type: 'address',
      },
    ],
    name: 'SeederUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CLOCK_MODE',
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
    name: 'MAX_MINT_BATCH_SIZE',
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
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
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
    name: 'baseURI',
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
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'clock',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contractURI',
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
    name: 'currentTokenId',
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
        name: 'delegatee',
        type: 'address',
      },
    ],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegatee',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'delegateBySig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'delegates',
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
    name: 'descriptor',
    outputs: [
      {
        internalType: 'contract NijiDescriptor',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
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
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'exists',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getApproved',
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
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getCurrentVotes',
    outputs: [
      {
        internalType: 'uint96',
        name: '',
        type: 'uint96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timepoint',
        type: 'uint256',
      },
    ],
    name: 'getPastTotalSupply',
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
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'timepoint',
        type: 'uint256',
      },
    ],
    name: 'getPastVotes',
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
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'getPriorVotes',
    outputs: [
      {
        internalType: 'uint96',
        name: '',
        type: 'uint96',
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
    ],
    name: 'getSeed',
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
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getTraitIndices',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getVotes',
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
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
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
    name: 'isBaseURILocked',
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
    name: 'isContractsLocked',
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
    name: 'isMintingActive',
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
    name: 'isProvenanceHashLocked',
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
    name: 'isRevealed',
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
    name: 'lockBaseURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockContracts',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockProvenanceHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxSupply',
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
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'quantity',
        type: 'uint256',
      },
    ],
    name: 'mintBatch',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minter',
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
    name: 'name',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'nonces',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
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
    name: 'placeholderURI',
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
    name: 'provenanceHash',
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
    name: 'remainingSupply',
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
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reveal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'seeder',
    outputs: [
      {
        internalType: 'contract INijiSeeder',
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
    name: 'seeds',
    outputs: [
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
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'newBaseURI',
        type: 'string',
      },
    ],
    name: 'setBaseURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'newContractURIHash',
        type: 'string',
      },
    ],
    name: 'setContractURIHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_descriptor',
        type: 'address',
      },
    ],
    name: 'setDescriptor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_minter',
        type: 'address',
      },
    ],
    name: 'setMinter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_isActive',
        type: 'bool',
      },
    ],
    name: 'setMintingActive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'newPlaceholderURI',
        type: 'string',
      },
    ],
    name: 'setPlaceholderURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_provenanceHash',
        type: 'string',
      },
    ],
    name: 'setProvenanceHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_seeder',
        type: 'address',
      },
    ],
    name: 'setSeeder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
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
    name: 'symbol',
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
    name: 'toggleMinting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenByIndex',
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
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'tokenOfOwnerByIndex',
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
        name: 'tokenId',
        type: 'uint256',
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
    inputs: [],
    name: 'totalSupply',
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
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
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
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenAddress = {
  1: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
  31337: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  84532: '0xFD0d2dDBBD4ff405751c1495cbBe717ed90bd8d2',
  11155111: '0x4C4674bb72a096855496a7204962297bd7e12b85',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenConfig = { address: nijiTokenAddress, abi: nijiTokenAbi } as const;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiToken = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"CLOCK_MODE"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenCLOCKMODE = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'CLOCK_MODE',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MAX_MINT_BATCH_SIZE"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenMAXMINTBATCHSIZE = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'MAX_MINT_BATCH_SIZE',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenBalanceOf = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"baseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenBaseURI = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'baseURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"clock"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenClock = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'clock',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"contractURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenContractURI = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'contractURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"currentTokenId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenCurrentTokenId = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'currentTokenId',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegates"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenDelegates = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegates',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"descriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenDescriptor = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'descriptor',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"eip712Domain"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenEip712Domain = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'eip712Domain',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"exists"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenExists = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'exists',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getApproved"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetApproved = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getApproved',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getCurrentVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetCurrentVotes = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getCurrentVotes',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPastTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetPastTotalSupply = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPastTotalSupply',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPastVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetPastVotes = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPastVotes',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPriorVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetPriorVotes = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPriorVotes',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getSeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetSeed = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getSeed',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getTraitIndices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetTraitIndices = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getTraitIndices',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenGetVotes = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getVotes',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsApprovedForAll = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isApprovedForAll',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isBaseURILocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsBaseURILocked = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isBaseURILocked',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isContractsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsContractsLocked = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isContractsLocked',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsMintingActive = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isMintingActive',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isProvenanceHashLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsProvenanceHashLocked = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isProvenanceHashLocked',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isRevealed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenIsRevealed = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isRevealed',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"maxSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenMaxSupply = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'maxSupply',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"minter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenMinter = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'minter',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"name"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenName = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"nonces"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenNonces = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'nonces',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenOwner = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ownerOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenOwnerOf = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'ownerOf',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenPaused = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenPendingOwner = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"placeholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenPlaceholderURI = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'placeholderURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"provenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenProvenanceHash = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'provenanceHash',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"remainingSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenRemainingSupply = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'remainingSupply',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenRenounceOwnership = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenSeeder = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeder',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenSeeds = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeds',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenSupportsInterface = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'supportsInterface',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"symbol"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenSymbol = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenTokenByIndex = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenByIndex',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenTokenOfOwnerByIndex = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenOfOwnerByIndex',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenTokenURI = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const readNijiTokenTotalSupply = /*#__PURE__*/ createReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiToken = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenAcceptOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenApprove = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenBurn = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenDelegate = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenDelegateBySig = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenLockBaseURI = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockBaseURI',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockContracts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenLockContracts = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockContracts',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenLockProvenanceHash = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockProvenanceHash',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenMint = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mintBatch"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenMintBatch = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mintBatch',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenPause = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"reveal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenReveal = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'reveal',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSafeTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetApprovalForAll = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetBaseURI = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetContractURIHash = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetDescriptor = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetMinter = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetMintingActive = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMintingActive',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setPlaceholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetPlaceholderURI = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setPlaceholderURI',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetProvenanceHash = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setProvenanceHash',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenSetSeeder = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"toggleMinting"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenToggleMinting = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'toggleMinting',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenUnpause = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenWithdraw = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdrawAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const writeNijiTokenWithdrawAmount = /*#__PURE__*/ createWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdrawAmount',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiToken = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenAcceptOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenApprove = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenBurn = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenDelegate = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenDelegateBySig = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenLockBaseURI = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockBaseURI',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockContracts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenLockContracts = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockContracts',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenLockProvenanceHash = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockProvenanceHash',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenMint = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mintBatch"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenMintBatch = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mintBatch',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenPause = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"reveal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenReveal = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'reveal',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSafeTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetApprovalForAll = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetBaseURI = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetContractURIHash = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetDescriptor = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetMinter = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetMintingActive = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMintingActive',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setPlaceholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetPlaceholderURI = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setPlaceholderURI',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetProvenanceHash = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setProvenanceHash',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenSetSeeder = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"toggleMinting"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenToggleMinting = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'toggleMinting',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenTransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenUnpause = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenWithdraw = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdrawAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const simulateNijiTokenWithdrawAmount = /*#__PURE__*/ createSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdrawAmount',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Approval"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenApprovalEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Approval',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenApprovalForAllEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ApprovalForAll',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BaseURILocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenBaseURILockedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BaseURILocked',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BaseURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenBaseURIUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BaseURIUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BatchMetadataUpdate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenBatchMetadataUpdateEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BatchMetadataUpdate',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ContractURIHashUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenContractURIHashUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ContractURIHashUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ContractsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenContractsLockedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ContractsLocked',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DelegateChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenDelegateChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DelegateChanged',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DelegateVotesChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenDelegateVotesChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DelegateVotesChanged',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DescriptorUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenDescriptorUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DescriptorUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"EIP712DomainChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenEIP712DomainChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'EIP712DomainChanged',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MetadataUpdate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenMetadataUpdateEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MetadataUpdate',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MinterUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenMinterUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MinterUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MintingToggled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenMintingToggledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MintingToggled',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"NijiMinted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenNijiMintedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'NijiMinted',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenOwnershipTransferStartedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'OwnershipTransferStarted',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'OwnershipTransferred',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenPausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Paused',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"PlaceholderURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenPlaceholderURIUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'PlaceholderURIUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ProvenanceHashSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenProvenanceHashSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ProvenanceHashSet',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Revealed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenRevealedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Revealed',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"SeederUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenSeederUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'SeederUpdated',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Transfer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenTransferEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Transfer',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenUnpausedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Unpaused',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Withdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const watchNijiTokenWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Withdrawn',
});
