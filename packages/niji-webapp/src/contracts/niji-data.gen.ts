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
// NijiData
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const nijiDataAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'nijiToken_', internalType: 'address', type: 'address' },
      { name: 'nounsDao_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AmountExceedsBalance' },
  {
    type: 'error',
    inputs: [{ name: 'data', internalType: 'bytes', type: 'bytes' }],
    name: 'FailedWithdrawingETH',
  },
  { type: 'error', inputs: [], name: 'InvalidSignature' },
  { type: 'error', inputs: [], name: 'InvalidSupportValue' },
  { type: 'error', inputs: [], name: 'MustBeDunaAdmin' },
  { type: 'error', inputs: [], name: 'MustBeDunaAdminOrOwner' },
  { type: 'error', inputs: [], name: 'MustBeNounerOrPaySufficientFee' },
  { type: 'error', inputs: [], name: 'MustHaveVotes' },
  { type: 'error', inputs: [], name: 'MustProvideActions' },
  { type: 'error', inputs: [], name: 'OnlyProposerCanCreateUpdateCandidate' },
  { type: 'error', inputs: [], name: 'ProposalInfoArityMismatch' },
  { type: 'error', inputs: [], name: 'ProposalToUpdateMustBeUpdatable' },
  { type: 'error', inputs: [], name: 'SlugAlreadyUsed' },
  { type: 'error', inputs: [], name: 'SlugDoesNotExist' },
  { type: 'error', inputs: [], name: 'TooManyActions' },
  { type: 'error', inputs: [], name: 'UpdateProposalCandidatesOnlyWorkWithProposalsBySigs' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address', indexed: true }],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: true },
      { name: 'slug', internalType: 'string', type: 'string', indexed: false },
      { name: 'support', internalType: 'uint8', type: 'uint8', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'CandidateFeedbackSent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldCreateCandidateCost', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newCreateCandidateCost', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'CreateCandidateCostSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'message', internalType: 'string', type: 'string', indexed: false },
      { name: 'relatedProposals', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
    ],
    name: 'DunaAdminMessagePosted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldDunaAdmin', internalType: 'address', type: 'address', indexed: true },
      { name: 'newDunaAdmin', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DunaAdminSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ETHWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldFeeRecipient', internalType: 'address', type: 'address', indexed: true },
      { name: 'newFeeRecipient', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'FeeRecipientSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'proposalId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'support', internalType: 'uint8', type: 'uint8', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'FeedbackSent',
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
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'slug', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalCandidateCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
      { name: 'slug', internalType: 'string', type: 'string', indexed: false },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'encodedProposalHash', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'ProposalCandidateCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
      { name: 'slug', internalType: 'string', type: 'string', indexed: false },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'encodedProposalHash', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalCandidateUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'signal', internalType: 'uint8', type: 'uint8', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalComplianceSignaled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address', indexed: true },
      { name: 'sig', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'expirationTimestamp', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: false },
      { name: 'slug', internalType: 'string', type: 'string', indexed: false },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'encodedPropHash', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'sigDigest', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'SignatureAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldUpdateCandidateCost', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newUpdateCandidateCost', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'UpdateCandidateCostSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address', indexed: true }],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'message', internalType: 'string', type: 'string', indexed: false },
      { name: 'relatedProposals', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
    ],
    name: 'VoterMessageToDunaAdminPosted',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PRIOR_VOTES_BLOCKS_AGO',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sig', internalType: 'bytes', type: 'bytes' },
      { name: 'expirationTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'proposer', internalType: 'address', type: 'address' },
      { name: 'slug', internalType: 'string', type: 'string' },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256' },
      { name: 'encodedProp', internalType: 'bytes', type: 'bytes' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'addSignature',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'slug', internalType: 'string', type: 'string' }],
    name: 'cancelProposalCandidate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createCandidateCost',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'slug', internalType: 'string', type: 'string' },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createProposalCandidate',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dunaAdmin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeRecipient',
    outputs: [{ name: '', internalType: 'address payable', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: 'createCandidateCost_', internalType: 'uint256', type: 'uint256' },
      { name: 'updateCandidateCost_', internalType: 'uint256', type: 'uint256' },
      { name: 'feeRecipient_', internalType: 'address payable', type: 'address' },
      { name: 'dunaAdmin_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nounsDao',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nijiToken',
    outputs: [{ name: '', internalType: 'contract NijiTokenLike', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'relatedProposals', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'postDunaAdminMessage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'message', internalType: 'string', type: 'string' },
      { name: 'relatedProposals', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'postVoterMessageToDunaAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'propCandidates',
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
    inputs: [
      { name: 'proposer', internalType: 'address', type: 'address' },
      { name: 'slug', internalType: 'string', type: 'string' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'sendCandidateFeedback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'sendFeedback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newCreateCandidateCost', internalType: 'uint256', type: 'uint256' }],
    name: 'setCreateCandidateCost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newDunaAdmin', internalType: 'address', type: 'address' }],
    name: 'setDunaAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFeeRecipient', internalType: 'address payable', type: 'address' }],
    name: 'setFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newUpdateCandidateCost', internalType: 'uint256', type: 'uint256' }],
    name: 'setUpdateCandidateCost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'signal', internalType: 'uint8', type: 'uint8' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'signalProposalCompliance',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'updateCandidateCost',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'slug', internalType: 'string', type: 'string' },
      { name: 'proposalIdToUpdate', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'updateProposalCandidate',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newImplementation', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const nijiDataAddress = {
  1: '0xf790A5f59678dd733fb3De93493A91f472ca1365',
  11155111: '0x9040f720AA8A693F950B9cF94764b4b06079D002',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const nijiDataConfig = { address: nijiDataAddress, abi: nijiDataAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiData = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"PRIOR_VOTES_BLOCKS_AGO"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataPriorVotesBlocksAgo = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'PRIOR_VOTES_BLOCKS_AGO',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataCreateCandidateCost = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createCandidateCost',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"dunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataDunaAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'dunaAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"feeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataFeeRecipient = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'feeRecipient',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"nounsDao"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataNounsDao = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'nounsDao',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"nijiToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataNijiToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'nijiToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"propCandidates"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataPropCandidates = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'propCandidates',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useReadNijiDataUpdateCandidateCost = /*#__PURE__*/ createUseReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateCandidateCost',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiData = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"addSignature"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataAddSignature = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'addSignature',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"cancelProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataCancelProposalCandidate = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'cancelProposalCandidate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataCreateProposalCandidate = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createProposalCandidate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postDunaAdminMessage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataPostDunaAdminMessage = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postDunaAdminMessage',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postVoterMessageToDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataPostVoterMessageToDunaAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postVoterMessageToDunaAdmin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendCandidateFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSendCandidateFeedback = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendCandidateFeedback',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSendFeedback = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendFeedback',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setCreateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSetCreateCandidateCost = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setCreateCandidateCost',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSetDunaAdmin = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setDunaAdmin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setFeeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSetFeeRecipient = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setFeeRecipient',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setUpdateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSetUpdateCandidateCost = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setUpdateCandidateCost',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"signalProposalCompliance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataSignalProposalCompliance = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'signalProposalCompliance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataUpdateProposalCandidate = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateProposalCandidate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataUpgradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataUpgradeToAndCall = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWriteNijiDataWithdrawEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiData = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"addSignature"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataAddSignature = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'addSignature',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"cancelProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataCancelProposalCandidate = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'cancelProposalCandidate',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataCreateProposalCandidate = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createProposalCandidate',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postDunaAdminMessage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataPostDunaAdminMessage = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postDunaAdminMessage',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postVoterMessageToDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataPostVoterMessageToDunaAdmin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    functionName: 'postVoterMessageToDunaAdmin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendCandidateFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSendCandidateFeedback = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendCandidateFeedback',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSendFeedback = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendFeedback',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setCreateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSetCreateCandidateCost = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setCreateCandidateCost',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSetDunaAdmin = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setDunaAdmin',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setFeeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSetFeeRecipient = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setFeeRecipient',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setUpdateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSetUpdateCandidateCost = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setUpdateCandidateCost',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"signalProposalCompliance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataSignalProposalCompliance = /*#__PURE__*/ createUseSimulateContract(
  { abi: nijiDataAbi, address: nijiDataAddress, functionName: 'signalProposalCompliance' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataUpdateProposalCandidate = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateProposalCandidate',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataUpgradeTo = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataUpgradeToAndCall = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useSimulateNijiDataWithdrawEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"AdminChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataAdminChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'AdminChanged',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"BeaconUpgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataBeaconUpgradedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'BeaconUpgraded',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"CandidateFeedbackSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataCandidateFeedbackSentEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'CandidateFeedbackSent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"CreateCandidateCostSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataCreateCandidateCostSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'CreateCandidateCostSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"DunaAdminMessagePosted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataDunaAdminMessagePostedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'DunaAdminMessagePosted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"DunaAdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataDunaAdminSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'DunaAdminSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataEthWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'ETHWithdrawn',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"FeeRecipientSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataFeeRecipientSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'FeeRecipientSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"FeedbackSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataFeedbackSentEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'FeedbackSent',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiDataAbi, address: nijiDataAddress, eventName: 'OwnershipTransferred' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateCanceled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataProposalCandidateCanceledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'ProposalCandidateCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataProposalCandidateCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'ProposalCandidateCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataProposalCandidateUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'ProposalCandidateUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalComplianceSignaled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataProposalComplianceSignaledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'ProposalComplianceSignaled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"SignatureAdded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataSignatureAddedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'SignatureAdded',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"UpdateCandidateCostSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataUpdateCandidateCostSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'UpdateCandidateCostSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"Upgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataUpgradedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"VoterMessageToDunaAdminPosted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const useWatchNijiDataVoterMessageToDunaAdminPostedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'VoterMessageToDunaAdminPosted',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiData = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"PRIOR_VOTES_BLOCKS_AGO"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataPriorVotesBlocksAgo = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'PRIOR_VOTES_BLOCKS_AGO',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataCreateCandidateCost = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createCandidateCost',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"dunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataDunaAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'dunaAdmin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"feeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataFeeRecipient = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'feeRecipient',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"nounsDao"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataNounsDao = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'nounsDao',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"nijiToken"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataNijiToken = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'nijiToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataOwner = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"propCandidates"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataPropCandidates = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'propCandidates',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const readNijiDataUpdateCandidateCost = /*#__PURE__*/ createReadContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateCandidateCost',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiData = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"addSignature"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataAddSignature = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'addSignature',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"cancelProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataCancelProposalCandidate = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'cancelProposalCandidate',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataCreateProposalCandidate = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createProposalCandidate',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postDunaAdminMessage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataPostDunaAdminMessage = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postDunaAdminMessage',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postVoterMessageToDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataPostVoterMessageToDunaAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postVoterMessageToDunaAdmin',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataRenounceOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendCandidateFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSendCandidateFeedback = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendCandidateFeedback',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSendFeedback = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendFeedback',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setCreateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSetCreateCandidateCost = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setCreateCandidateCost',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSetDunaAdmin = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setDunaAdmin',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setFeeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSetFeeRecipient = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setFeeRecipient',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setUpdateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSetUpdateCandidateCost = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setUpdateCandidateCost',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"signalProposalCompliance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataSignalProposalCompliance = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'signalProposalCompliance',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataTransferOwnership = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataUpdateProposalCandidate = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateProposalCandidate',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataUpgradeTo = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataUpgradeToAndCall = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const writeNijiDataWithdrawEth = /*#__PURE__*/ createWriteContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiData = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"addSignature"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataAddSignature = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'addSignature',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"cancelProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataCancelProposalCandidate = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'cancelProposalCandidate',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"createProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataCreateProposalCandidate = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'createProposalCandidate',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postDunaAdminMessage"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataPostDunaAdminMessage = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postDunaAdminMessage',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"postVoterMessageToDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataPostVoterMessageToDunaAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'postVoterMessageToDunaAdmin',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataRenounceOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendCandidateFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSendCandidateFeedback = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendCandidateFeedback',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"sendFeedback"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSendFeedback = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'sendFeedback',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setCreateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSetCreateCandidateCost = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setCreateCandidateCost',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setDunaAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSetDunaAdmin = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setDunaAdmin',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setFeeRecipient"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSetFeeRecipient = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setFeeRecipient',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"setUpdateCandidateCost"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSetUpdateCandidateCost = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'setUpdateCandidateCost',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"signalProposalCompliance"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataSignalProposalCompliance = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'signalProposalCompliance',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataTransferOwnership = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'transferOwnership',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"updateProposalCandidate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataUpdateProposalCandidate = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'updateProposalCandidate',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeTo"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataUpgradeTo = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataUpgradeToAndCall = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiDataAbi}__ and `functionName` set to `"withdrawETH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const simulateNijiDataWithdrawEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  functionName: 'withdrawETH',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"AdminChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataAdminChangedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'AdminChanged',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"BeaconUpgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataBeaconUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'BeaconUpgraded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"CandidateFeedbackSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataCandidateFeedbackSentEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'CandidateFeedbackSent',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"CreateCandidateCostSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataCreateCandidateCostSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'CreateCandidateCostSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"DunaAdminMessagePosted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataDunaAdminMessagePostedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'DunaAdminMessagePosted',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"DunaAdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataDunaAdminSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'DunaAdminSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ETHWithdrawn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataEthWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'ETHWithdrawn',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"FeeRecipientSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataFeeRecipientSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'FeeRecipientSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"FeedbackSent"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataFeedbackSentEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'FeedbackSent',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataOwnershipTransferredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateCanceled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataProposalCandidateCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'ProposalCandidateCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataProposalCandidateCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'ProposalCandidateCreated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalCandidateUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataProposalCandidateUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'ProposalCandidateUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"ProposalComplianceSignaled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataProposalComplianceSignaledEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: nijiDataAbi, address: nijiDataAddress, eventName: 'ProposalComplianceSignaled' },
)

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"SignatureAdded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataSignatureAddedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'SignatureAdded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"UpdateCandidateCostSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataUpdateCandidateCostSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'UpdateCandidateCostSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"Upgraded"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataUpgradedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiDataAbi,
  address: nijiDataAddress,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiDataAbi}__ and `eventName` set to `"VoterMessageToDunaAdminPosted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xf790a5f59678dd733fb3de93493a91f472ca1365)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x9040f720aa8a693f950b9cf94764b4b06079d002)
 */
export const watchNijiDataVoterMessageToDunaAdminPostedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiDataAbi,
    address: nijiDataAddress,
    eventName: 'VoterMessageToDunaAdminPosted',
  })
