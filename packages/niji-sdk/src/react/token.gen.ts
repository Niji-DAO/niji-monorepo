import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

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
  84532: '0xE8470ff7F6028d37f60C8c8CA79C7426031b3D35',
  11155111: '0x4C4674bb72a096855496a7204962297bd7e12b85',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenConfig = { address: nijiTokenAddress, abi: nijiTokenAbi } as const;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"CLOCK_MODE"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenCLOCKMODE = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'CLOCK_MODE',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MAX_MINT_BATCH_SIZE"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenMAXMINTBATCHSIZE = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'MAX_MINT_BATCH_SIZE',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"baseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenBaseURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'baseURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"clock"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenClock = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'clock',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"contractURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenContractURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'contractURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"currentTokenId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenCurrentTokenId = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'currentTokenId',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegates"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDelegates = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegates',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"descriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDescriptor = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'descriptor',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"eip712Domain"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenEip712Domain = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'eip712Domain',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"exists"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenExists = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'exists',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getApproved"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getApproved',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getCurrentVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetCurrentVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getCurrentVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPastTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetPastTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPastTotalSupply',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPastVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetPastVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPastVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPriorVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetPriorVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPriorVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getSeed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetSeed = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getSeed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getTraitIndices"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetTraitIndices = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getTraitIndices',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isApprovedForAll',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isBaseURILocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsBaseURILocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isBaseURILocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isContractsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsContractsLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isContractsLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsMintingActive = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isMintingActive',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isProvenanceHashLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsProvenanceHashLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isProvenanceHashLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isRevealed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsRevealed = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isRevealed',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"maxSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenMaxSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'maxSupply',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"minter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenMinter = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'minter',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"name"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenName = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"nonces"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenNonces = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'nonces',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ownerOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'ownerOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenPaused = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'paused',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pendingOwner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pendingOwner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"placeholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenPlaceholderURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'placeholderURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"provenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenProvenanceHash = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'provenanceHash',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"remainingSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenRemainingSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'remainingSupply',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenRenounceOwnership = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSeeder = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeder',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSeeds = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeds',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSupportsInterface = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'supportsInterface',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"symbol"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenByIndex = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenByIndex',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenOfOwnerByIndex = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenOfOwnerByIndex',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenURI = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiToken = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenAcceptOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenDelegate = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenDelegateBySig = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockBaseURI = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockBaseURI',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockContracts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockContracts = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockContracts',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockProvenanceHash = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockProvenanceHash',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mintBatch"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenMintBatch = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mintBatch',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenPause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"reveal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenReveal = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'reveal',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSafeTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetBaseURI = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetContractURIHash = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetMinter = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetMintingActive = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMintingActive',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setPlaceholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetPlaceholderURI = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setPlaceholderURI',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetProvenanceHash = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setProvenanceHash',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetSeeder = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"toggleMinting"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenToggleMinting = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'toggleMinting',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdrawAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenWithdrawAmount = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdrawAmount',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiToken = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"acceptOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenAcceptOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'acceptOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenDelegate = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenDelegateBySig = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockBaseURI = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockBaseURI',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockContracts"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockContracts = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockContracts',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockProvenanceHash = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockProvenanceHash',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenMint = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mintBatch"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenMintBatch = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mintBatch',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"pause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenPause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'pause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"reveal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenReveal = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'reveal',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSafeTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetApprovalForAll = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setBaseURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetBaseURI = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setBaseURI',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetContractURIHash = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetMinter = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMintingActive"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetMintingActive = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMintingActive',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setPlaceholderURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetPlaceholderURI = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setPlaceholderURI',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setProvenanceHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetProvenanceHash = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setProvenanceHash',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetSeeder = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"toggleMinting"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenToggleMinting = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'toggleMinting',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"unpause"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenUnpause = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'unpause',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"withdrawAmount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenWithdrawAmount = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'withdrawAmount',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Approval"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenApprovalEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Approval',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenApprovalForAllEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ApprovalForAll',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BaseURILocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenBaseURILockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BaseURILocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BaseURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenBaseURIUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BaseURIUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"BatchMetadataUpdate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenBatchMetadataUpdateEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'BatchMetadataUpdate',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ContractURIHashUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenContractURIHashUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'ContractURIHashUpdated',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ContractsLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenContractsLockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ContractsLocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DelegateChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDelegateChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DelegateChanged',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DelegateVotesChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDelegateVotesChangedEvent = /*#__PURE__*/ createUseWatchContractEvent(
  {
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'DelegateVotesChanged',
  },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DescriptorUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDescriptorUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DescriptorUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"EIP712DomainChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenEIP712DomainChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'EIP712DomainChanged',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MetadataUpdate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenMetadataUpdateEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MetadataUpdate',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MinterUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenMinterUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MinterUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"MintingToggled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenMintingToggledEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MintingToggled',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"NijiMinted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenNijiMintedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'NijiMinted',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"OwnershipTransferStarted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'OwnershipTransferStarted',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent(
  {
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'OwnershipTransferred',
  },
);

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Paused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Paused',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"PlaceholderURIUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenPlaceholderURIUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'PlaceholderURIUpdated',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ProvenanceHashSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenProvenanceHashSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ProvenanceHashSet',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Revealed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenRevealedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Revealed',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"SeederUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenSeederUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'SeederUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Transfer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenTransferEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Transfer',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Unpaused"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Unpaused',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"Withdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4C4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Withdrawn',
});
