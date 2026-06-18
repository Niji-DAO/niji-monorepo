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
// NijiGovernor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const nijiGovernorAbi = [
  { type: 'error', inputs: [], name: 'AdminOnly' },
  { type: 'error', inputs: [], name: 'CanOnlyInitializeOnce' },
  { type: 'error', inputs: [], name: 'InvalidNounsAddress' },
  { type: 'error', inputs: [], name: 'InvalidTimelockAddress' },
  { type: 'error', inputs: [], name: 'MustProvideActions' },
  { type: 'error', inputs: [], name: 'ProposalInfoArityMismatch' },
  { type: 'error', inputs: [], name: 'ProposerAlreadyHasALiveProposal' },
  { type: 'error', inputs: [], name: 'TooManyActions' },
  { type: 'error', inputs: [], name: 'UnsafeUint16Cast' },
  { type: 'error', inputs: [], name: 'VotesBelowProposalThreshold' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'numTokens', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'DAONounsSupplyIncreasedFromEscrow',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'DAOWithdrawNounsFromEscrow',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldErc20Tokens', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'newErc20tokens', internalType: 'address[]', type: 'address[]', indexed: false },
    ],
    name: 'ERC20TokensToIncludeInForkSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'forkId', internalType: 'uint32', type: 'uint32', indexed: true },
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'proposalIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'EscrowedToFork',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'forkId', internalType: 'uint32', type: 'uint32', indexed: true },
      { name: 'forkTreasury', internalType: 'address', type: 'address', indexed: false },
      { name: 'forkToken', internalType: 'address', type: 'address', indexed: false },
      { name: 'forkEndTimestamp', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'tokensInEscrow', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ExecuteFork',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldForkDAODeployer', internalType: 'address', type: 'address', indexed: false },
      { name: 'newForkDAODeployer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'ForkDAODeployerSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldForkPeriod', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newForkPeriod', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ForkPeriodSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldForkThreshold', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newForkThreshold', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ForkThresholdSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'forkId', internalType: 'uint32', type: 'uint32', indexed: true },
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'proposalIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'JoinFork',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldLastMinuteWindowInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newLastMinuteWindowInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'LastMinuteWindowSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldMaxQuorumVotesBPS', internalType: 'uint16', type: 'uint16', indexed: false },
      { name: 'newMaxQuorumVotesBPS', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'MaxQuorumVotesBPSSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldMinQuorumVotesBPS', internalType: 'uint16', type: 'uint16', indexed: false },
      { name: 'newMinQuorumVotesBPS', internalType: 'uint16', type: 'uint16', indexed: false },
    ],
    name: 'MinQuorumVotesBPSSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'NewAdmin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldPendingAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newPendingAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'NewPendingAdmin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldPendingVetoer', internalType: 'address', type: 'address', indexed: false },
      { name: 'newPendingVetoer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'NewPendingVetoer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldVetoer', internalType: 'address', type: 'address', indexed: false },
      { name: 'newVetoer', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'NewVetoer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldObjectionPeriodDurationInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newObjectionPeriodDurationInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'ObjectionPeriodDurationSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'ProposalCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: false },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'startBlock', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'endBlock', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'ProposalCreatedOnTimelockV1',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: false },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'startBlock', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'endBlock', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'proposalThreshold', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'quorumVotes', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalCreatedWithRequirements',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'signers', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'updatePeriodEndBlock', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'proposalThreshold', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'quorumVotes', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'clientId', internalType: 'uint32', type: 'uint32', indexed: true },
    ],
    name: 'ProposalCreatedWithRequirements',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: true },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
      { name: 'updateMessage', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalDescriptionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'ProposalExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'objectionPeriodEndBlock', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProposalObjectionPeriodSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'eta', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProposalQueued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldProposalThresholdBPS', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newProposalThresholdBPS', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ProposalThresholdBPSSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: true },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'updateMessage', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalTransactionsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldProposalUpdatablePeriodInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'newProposalUpdatablePeriodInBlocks',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'ProposalUpdatablePeriodSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'proposer', internalType: 'address', type: 'address', indexed: true },
      { name: 'targets', internalType: 'address[]', type: 'address[]', indexed: false },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
      { name: 'signatures', internalType: 'string[]', type: 'string[]', indexed: false },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]', indexed: false },
      { name: 'description', internalType: 'string', type: 'string', indexed: false },
      { name: 'updateMessage', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'ProposalUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'ProposalVetoed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldQuorumCoefficient', internalType: 'uint32', type: 'uint32', indexed: false },
      { name: 'newQuorumCoefficient', internalType: 'uint32', type: 'uint32', indexed: false },
    ],
    name: 'QuorumCoefficientSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldQuorumVotesBPS', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newQuorumVotesBPS', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'QuorumVotesBPSSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address', indexed: true },
      { name: 'refundAmount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'refundSent', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'RefundableVote',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address', indexed: true },
      { name: 'sig', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'SignatureCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'timelock', internalType: 'address', type: 'address', indexed: false },
      { name: 'timelockV1', internalType: 'address', type: 'address', indexed: false },
      { name: 'admin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'TimelocksAndAdminSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address', indexed: true },
      { name: 'proposalId', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'support', internalType: 'uint8', type: 'uint8', indexed: false },
      { name: 'votes', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'VoteCast',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'voter', internalType: 'address', type: 'address', indexed: true },
      { name: 'proposalId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'clientId', internalType: 'uint32', type: 'uint32', indexed: true },
    ],
    name: 'VoteCastWithClientId',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldVotingDelay', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newVotingDelay', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'VotingDelaySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'oldVotingPeriod', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newVotingPeriod', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'VotingPeriodSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'sent', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'forkId', internalType: 'uint32', type: 'uint32', indexed: true },
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]', indexed: false },
    ],
    name: 'WithdrawFromForkEscrow',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_PROPOSAL_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_VOTING_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_VOTING_PERIOD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_PROPOSAL_THRESHOLD_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_VOTING_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_VOTING_PERIOD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'adjustedTotalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'sig', internalType: 'bytes', type: 'bytes' }],
    name: 'cancelSig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'castRefundableVote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'castRefundableVote',
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
    name: 'castRefundableVoteWithReason',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
      { name: 'reason', internalType: 'string', type: 'string' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'castRefundableVoteWithReason',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'castVote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'support', internalType: 'uint8', type: 'uint8' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'castVoteBySig',
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
    name: 'castVoteWithReason',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'againstVotes', internalType: 'uint256', type: 'uint256' },
      { name: 'adjustedTotalSupply_', internalType: 'uint256', type: 'uint256' },
      {
        name: 'params',
        internalType: 'struct NounsDAOTypes.DynamicQuorumParams',
        type: 'tuple',
        components: [
          { name: 'minQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'maxQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'quorumCoefficient', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'dynamicQuorumVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'erc20TokensToIncludeInFork',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'proposalIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'escrowToFork',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'executeFork',
    outputs: [
      { name: 'forkTreasury', internalType: 'address', type: 'address' },
      { name: 'forkToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkDAODeployer',
    outputs: [{ name: '', internalType: 'contract IForkDAODeployer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkEndTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkEscrow',
    outputs: [{ name: '', internalType: 'contract INounsDAOForkEscrow', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forkThresholdBPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'getActions',
    outputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'blockNumber_', internalType: 'uint256', type: 'uint256' }],
    name: 'getDynamicQuorumParamsAt',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.DynamicQuorumParams',
        type: 'tuple',
        components: [
          { name: 'minQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'maxQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'quorumCoefficient', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'voter', internalType: 'address', type: 'address' },
    ],
    name: 'getReceipt',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.Receipt',
        type: 'tuple',
        components: [
          { name: 'hasVoted', internalType: 'bool', type: 'bool' },
          { name: 'support', internalType: 'uint8', type: 'uint8' },
          { name: 'votes', internalType: 'uint96', type: 'uint96' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'timelock_', internalType: 'address', type: 'address' },
      { name: 'nouns_', internalType: 'address', type: 'address' },
      { name: 'forkEscrow_', internalType: 'address', type: 'address' },
      { name: 'forkDAODeployer_', internalType: 'address', type: 'address' },
      { name: 'vetoer_', internalType: 'address', type: 'address' },
      {
        name: 'daoParams_',
        internalType: 'struct NounsDAOTypes.NounsDAOParams',
        type: 'tuple',
        components: [
          { name: 'votingPeriod', internalType: 'uint256', type: 'uint256' },
          { name: 'votingDelay', internalType: 'uint256', type: 'uint256' },
          { name: 'proposalThresholdBPS', internalType: 'uint256', type: 'uint256' },
          { name: 'lastMinuteWindowInBlocks', internalType: 'uint32', type: 'uint32' },
          { name: 'objectionPeriodDurationInBlocks', internalType: 'uint32', type: 'uint32' },
          { name: 'proposalUpdatablePeriodInBlocks', internalType: 'uint32', type: 'uint32' },
        ],
      },
      {
        name: 'dynamicQuorumParams_',
        internalType: 'struct NounsDAOTypes.DynamicQuorumParams',
        type: 'tuple',
        components: [
          { name: 'minQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'maxQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
          { name: 'quorumCoefficient', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'proposalIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'joinFork',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastMinuteWindowInBlocks',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'latestProposalIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxQuorumVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minQuorumVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nouns',
    outputs: [{ name: '', internalType: 'contract NijiTokenLike', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numTokensInForkEscrow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'objectionPeriodDurationInBlocks',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingVetoer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'firstProposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'lastProposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'proposalEligibilityQuorumBps', internalType: 'uint16', type: 'uint16' },
      { name: 'excludeCanceled', internalType: 'bool', type: 'bool' },
      { name: 'requireVotingEnded', internalType: 'bool', type: 'bool' },
      { name: 'votingClientIds', internalType: 'uint32[]', type: 'uint32[]' },
    ],
    name: 'proposalDataForRewards',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.ProposalForRewards[]',
        type: 'tuple[]',
        components: [
          { name: 'endBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'objectionPeriodEndBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'forVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'againstVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'abstainVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
          { name: 'creationTimestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'clientId', internalType: 'uint32', type: 'uint32' },
          {
            name: 'voteData',
            internalType: 'struct NounsDAOTypes.ClientVoteData[]',
            type: 'tuple[]',
            components: [
              { name: 'votes', internalType: 'uint32', type: 'uint32' },
              { name: 'txs', internalType: 'uint32', type: 'uint32' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalMaxOperations',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalThreshold',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalThresholdBPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proposalUpdatablePeriodInBlocks',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'proposals',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.ProposalCondensedV2',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'proposer', internalType: 'address', type: 'address' },
          { name: 'proposalThreshold', internalType: 'uint256', type: 'uint256' },
          { name: 'quorumVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'eta', internalType: 'uint256', type: 'uint256' },
          { name: 'startBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'endBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'forVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'againstVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'abstainVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'canceled', internalType: 'bool', type: 'bool' },
          { name: 'vetoed', internalType: 'bool', type: 'bool' },
          { name: 'executed', internalType: 'bool', type: 'bool' },
          { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
          { name: 'creationBlock', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'proposalsV3',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.ProposalCondensedV3',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'proposer', internalType: 'address', type: 'address' },
          { name: 'proposalThreshold', internalType: 'uint256', type: 'uint256' },
          { name: 'quorumVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'eta', internalType: 'uint256', type: 'uint256' },
          { name: 'startBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'endBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'forVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'againstVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'abstainVotes', internalType: 'uint256', type: 'uint256' },
          { name: 'canceled', internalType: 'bool', type: 'bool' },
          { name: 'vetoed', internalType: 'bool', type: 'bool' },
          { name: 'executed', internalType: 'bool', type: 'bool' },
          { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
          { name: 'creationBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'updatePeriodEndBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'objectionPeriodEndBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'executeOnTimelockV1', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
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
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'propose',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
    ],
    name: 'propose',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'proposerSignatures',
        internalType: 'struct NounsDAOTypes.ProposerSignature[]',
        type: 'tuple[]',
        components: [
          { name: 'sig', internalType: 'bytes', type: 'bytes' },
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'expirationTimestamp', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
    ],
    name: 'proposeBySigs',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'proposerSignatures',
        internalType: 'struct NounsDAOTypes.ProposerSignature[]',
        type: 'tuple[]',
        components: [
          { name: 'sig', internalType: 'bytes', type: 'bytes' },
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'expirationTimestamp', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'proposeBySigs',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
    ],
    name: 'proposeOnTimelockV1',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'clientId', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'proposeOnTimelockV1',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'queue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'quorumParamsCheckpoints',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.DynamicQuorumParamsCheckpoint[]',
        type: 'tuple[]',
        components: [
          { name: 'fromBlock', internalType: 'uint32', type: 'uint32' },
          {
            name: 'params',
            internalType: 'struct NounsDAOTypes.DynamicQuorumParams',
            type: 'tuple',
            components: [
              { name: 'minQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
              { name: 'maxQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
              { name: 'quorumCoefficient', internalType: 'uint32', type: 'uint32' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'quorumParamsCheckpoints',
    outputs: [
      {
        name: '',
        internalType: 'struct NounsDAOTypes.DynamicQuorumParamsCheckpoint',
        type: 'tuple',
        components: [
          { name: 'fromBlock', internalType: 'uint32', type: 'uint32' },
          {
            name: 'params',
            internalType: 'struct NounsDAOTypes.DynamicQuorumParams',
            type: 'tuple',
            components: [
              { name: 'minQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
              { name: 'maxQuorumVotesBPS', internalType: 'uint16', type: 'uint16' },
              { name: 'quorumCoefficient', internalType: 'uint32', type: 'uint32' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'quorumVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'quorumVotesBPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'state',
    outputs: [{ name: '', internalType: 'enum NounsDAOTypes.ProposalState', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timelock',
    outputs: [{ name: '', internalType: 'contract INounsDAOExecutor', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timelockV1',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'updateMessage', internalType: 'string', type: 'string' },
    ],
    name: 'updateProposal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'proposerSignatures',
        internalType: 'struct NounsDAOTypes.ProposerSignature[]',
        type: 'tuple[]',
        components: [
          { name: 'sig', internalType: 'bytes', type: 'bytes' },
          { name: 'signer', internalType: 'address', type: 'address' },
          { name: 'expirationTimestamp', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'updateMessage', internalType: 'string', type: 'string' },
    ],
    name: 'updateProposalBySigs',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'description', internalType: 'string', type: 'string' },
      { name: 'updateMessage', internalType: 'string', type: 'string' },
    ],
    name: 'updateProposalDescription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'proposalId', internalType: 'uint256', type: 'uint256' },
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'signatures', internalType: 'string[]', type: 'string[]' },
      { name: 'calldatas', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'updateMessage', internalType: 'string', type: 'string' },
    ],
    name: 'updateProposalTransactions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'proposalId', internalType: 'uint256', type: 'uint256' }],
    name: 'veto',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vetoer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'voteSnapshotBlockSwitchProposalId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'votingDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'votingPeriod',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawDAONounsFromEscrowIncreasingTotalSupply',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'withdrawDAONounsFromEscrowToTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'withdrawFromForkEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const nijiGovernorAddress = {
  1: '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
  11155111: '0x35d2670d7C8931AACdd37C89Ddcb0638c3c44A57',
} as const

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const nijiGovernorConfig = { address: nijiGovernorAddress, abi: nijiGovernorAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernor = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_PROPOSAL_THRESHOLD_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMaxProposalThresholdBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_VOTING_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMaxVotingDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_VOTING_DELAY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_VOTING_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMaxVotingPeriod = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_VOTING_PERIOD',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_PROPOSAL_THRESHOLD_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMinProposalThresholdBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_VOTING_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMinVotingDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_VOTING_DELAY',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_VOTING_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMinVotingPeriod = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_VOTING_PERIOD',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"adjustedTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorAdjustedTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'adjustedTotalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorAdmin = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'admin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"dynamicQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorDynamicQuorumVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'dynamicQuorumVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"erc20TokensToIncludeInFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorErc20TokensToIncludeInFork = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'erc20TokensToIncludeInFork',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkDAODeployer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkDaoDeployer = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkDAODeployer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkEndTimestamp"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkEndTimestamp = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkEndTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkEscrow = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkEscrow',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkPeriod = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkPeriod',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkThreshold"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkThreshold = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkThreshold',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkThresholdBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorForkThresholdBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkThresholdBPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getActions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorGetActions = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getActions',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getDynamicQuorumParamsAt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorGetDynamicQuorumParamsAt = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getDynamicQuorumParamsAt',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getReceipt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorGetReceipt = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getReceipt',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"lastMinuteWindowInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorLastMinuteWindowInBlocks = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'lastMinuteWindowInBlocks',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"latestProposalIds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorLatestProposalIds = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'latestProposalIds',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"maxQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMaxQuorumVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'maxQuorumVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"minQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorMinQuorumVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'minQuorumVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"nouns"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorNouns = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'nouns',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"numTokensInForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorNumTokensInForkEscrow = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'numTokensInForkEscrow',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"objectionPeriodDurationInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorObjectionPeriodDurationInBlocks =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'objectionPeriodDurationInBlocks',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"pendingVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorPendingVetoer = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'pendingVetoer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalCount = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalCount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalDataForRewards"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalDataForRewards = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalDataForRewards',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalMaxOperations"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalMaxOperations = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalMaxOperations',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalThreshold"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalThreshold = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalThreshold',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalThresholdBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalThresholdBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalThresholdBPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalUpdatablePeriodInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalUpdatablePeriodInBlocks =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'proposalUpdatablePeriodInBlocks',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposals"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposals = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalsV3"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorProposalsV3 = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalsV3',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumParamsCheckpoints"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorQuorumParamsCheckpoints = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumParamsCheckpoints',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorQuorumVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumVotesBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorQuorumVotesBps = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumVotesBPS',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"state"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorState = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'state',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"timelock"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorTimelock = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'timelock',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"timelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorTimelockV1 = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'timelockV1',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"vetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorVetoer = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'vetoer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"voteSnapshotBlockSwitchProposalId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorVoteSnapshotBlockSwitchProposalId =
  /*#__PURE__*/ createUseReadContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'voteSnapshotBlockSwitchProposalId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"votingDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorVotingDelay = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'votingDelay',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"votingPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useReadNijiGovernorVotingPeriod = /*#__PURE__*/ createUseReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'votingPeriod',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancel"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCancel = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancelSig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCancelSig = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancelSig',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCastRefundableVote = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castRefundableVote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCastRefundableVoteWithReason =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'castRefundableVoteWithReason',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCastVote = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCastVoteBySig = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorCastVoteWithReason = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"escrowToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorEscrowToFork = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'escrowToFork',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"execute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorExecute = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'execute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"executeFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorExecuteFork = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'executeFork',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"joinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorJoinFork = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'joinFork',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"propose"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorPropose = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'propose',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorProposeBySigs = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeBySigs',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorProposeOnTimelockV1 = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeOnTimelockV1',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorQueue = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorUpdateProposal = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposal',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorUpdateProposalBySigs = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalBySigs',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalDescription"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorUpdateProposalDescription = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalDescription',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorUpdateProposalTransactions = /*#__PURE__*/ createUseWriteContract(
  {
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'updateProposalTransactions',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"veto"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorVeto = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'veto',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowIncreasingTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorWithdrawDaoNounsFromEscrowIncreasingTotalSupply =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowIncreasingTotalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowToTreasury"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorWithdrawDaoNounsFromEscrowToTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowToTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWriteNijiGovernorWithdrawFromForkEscrow = /*#__PURE__*/ createUseWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'withdrawFromForkEscrow',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancel"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCancel = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancelSig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCancelSig = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancelSig',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCastRefundableVote = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castRefundableVote',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCastRefundableVoteWithReason =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'castRefundableVoteWithReason',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCastVote = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVote',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCastVoteBySig = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorCastVoteWithReason = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"escrowToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorEscrowToFork = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'escrowToFork',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"execute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorExecute = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'execute',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"executeFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorExecuteFork = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'executeFork',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"joinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorJoinFork = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'joinFork',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"propose"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorPropose = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'propose',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorProposeBySigs = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeBySigs',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorProposeOnTimelockV1 = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeOnTimelockV1',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorQueue = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorUpdateProposal = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposal',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorUpdateProposalBySigs = /*#__PURE__*/ createUseSimulateContract(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, functionName: 'updateProposalBySigs' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalDescription"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorUpdateProposalDescription =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'updateProposalDescription',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorUpdateProposalTransactions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'updateProposalTransactions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"veto"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorVeto = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'veto',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowIncreasingTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorWithdrawDaoNounsFromEscrowIncreasingTotalSupply =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowIncreasingTotalSupply',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowToTreasury"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorWithdrawDaoNounsFromEscrowToTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowToTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useSimulateNijiGovernorWithdrawFromForkEscrow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawFromForkEscrow',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"DAONounsSupplyIncreasedFromEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorDaoNounsSupplyIncreasedFromEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'DAONounsSupplyIncreasedFromEscrow',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"DAOWithdrawNounsFromEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorDaoWithdrawNounsFromEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'DAOWithdrawNounsFromEscrow',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ERC20TokensToIncludeInForkSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorErc20TokensToIncludeInForkSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ERC20TokensToIncludeInForkSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"EscrowedToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorEscrowedToForkEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'EscrowedToFork',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ExecuteFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorExecuteForkEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ExecuteFork',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkDAODeployerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorForkDaoDeployerSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ForkDAODeployerSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorForkPeriodSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ForkPeriodSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkThresholdSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorForkThresholdSetEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, eventName: 'ForkThresholdSet' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"JoinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorJoinForkEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'JoinFork',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"LastMinuteWindowSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorLastMinuteWindowSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'LastMinuteWindowSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"MaxQuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorMaxQuorumVotesBpsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'MaxQuorumVotesBPSSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"MinQuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorMinQuorumVotesBpsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'MinQuorumVotesBPSSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorNewAdminEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewAdmin',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorNewPendingAdminEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewPendingAdmin',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewPendingVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorNewPendingVetoerEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, eventName: 'NewPendingVetoer' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorNewVetoerEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewVetoer',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ObjectionPeriodDurationSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorObjectionPeriodDurationSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ObjectionPeriodDurationSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCanceled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalCanceledEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, eventName: 'ProposalCanceled' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalCreated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreatedOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalCreatedOnTimelockV1Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalCreatedOnTimelockV1',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreatedWithRequirements"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalCreatedWithRequirementsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalCreatedWithRequirements',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalDescriptionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalDescriptionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalDescriptionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalExecuted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalExecutedEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, eventName: 'ProposalExecuted' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalObjectionPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalObjectionPeriodSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalObjectionPeriodSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalQueued"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalQueuedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalQueued',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalThresholdBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalThresholdBpsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalThresholdBPSSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalTransactionsUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalTransactionsUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalTransactionsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalUpdatablePeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalUpdatablePeriodSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalUpdatablePeriodSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalVetoed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorProposalVetoedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalVetoed',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"QuorumCoefficientSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorQuorumCoefficientSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'QuorumCoefficientSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"QuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorQuorumVotesBpsSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'QuorumVotesBPSSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"RefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorRefundableVoteEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'RefundableVote',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"SignatureCancelled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorSignatureCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'SignatureCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"TimelocksAndAdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorTimelocksAndAdminSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'TimelocksAndAdminSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VoteCast"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorVoteCastEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VoteCast',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VoteCastWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorVoteCastWithClientIdEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'VoteCastWithClientId',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VotingDelaySet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorVotingDelaySetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VotingDelaySet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VotingPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorVotingPeriodSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VotingPeriodSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"Withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorWithdrawEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'Withdraw',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"WithdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const useWatchNijiGovernorWithdrawFromForkEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'WithdrawFromForkEscrow',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernor = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_PROPOSAL_THRESHOLD_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMaxProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_VOTING_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMaxVotingDelay = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_VOTING_DELAY',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MAX_VOTING_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMaxVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MAX_VOTING_PERIOD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_PROPOSAL_THRESHOLD_BPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMinProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_PROPOSAL_THRESHOLD_BPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_VOTING_DELAY"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMinVotingDelay = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_VOTING_DELAY',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"MIN_VOTING_PERIOD"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMinVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'MIN_VOTING_PERIOD',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"adjustedTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorAdjustedTotalSupply = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'adjustedTotalSupply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"admin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorAdmin = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'admin',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"dynamicQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorDynamicQuorumVotes = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'dynamicQuorumVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"erc20TokensToIncludeInFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorErc20TokensToIncludeInFork = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'erc20TokensToIncludeInFork',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkDAODeployer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkDaoDeployer = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkDAODeployer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkEndTimestamp"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkEndTimestamp = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkEndTimestamp',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkEscrow = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkEscrow',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkPeriod = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkPeriod',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkThreshold"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkThreshold = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkThreshold',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"forkThresholdBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorForkThresholdBps = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'forkThresholdBPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getActions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorGetActions = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getActions',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getDynamicQuorumParamsAt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorGetDynamicQuorumParamsAt = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getDynamicQuorumParamsAt',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"getReceipt"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorGetReceipt = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'getReceipt',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"lastMinuteWindowInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorLastMinuteWindowInBlocks = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'lastMinuteWindowInBlocks',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"latestProposalIds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorLatestProposalIds = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'latestProposalIds',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"maxQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMaxQuorumVotes = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'maxQuorumVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"minQuorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorMinQuorumVotes = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'minQuorumVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"nouns"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorNouns = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'nouns',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"numTokensInForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorNumTokensInForkEscrow = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'numTokensInForkEscrow',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"objectionPeriodDurationInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorObjectionPeriodDurationInBlocks = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'objectionPeriodDurationInBlocks',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"pendingVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorPendingVetoer = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'pendingVetoer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalCount"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalCount = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalCount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalDataForRewards"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalDataForRewards = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalDataForRewards',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalMaxOperations"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalMaxOperations = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalMaxOperations',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalThreshold"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalThreshold = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalThreshold',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalThresholdBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalThresholdBps = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalThresholdBPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalUpdatablePeriodInBlocks"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalUpdatablePeriodInBlocks = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalUpdatablePeriodInBlocks',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposals"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposals = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposals',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposalsV3"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorProposalsV3 = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposalsV3',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumParamsCheckpoints"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorQuorumParamsCheckpoints = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumParamsCheckpoints',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorQuorumVotes = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumVotes',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"quorumVotesBPS"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorQuorumVotesBps = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'quorumVotesBPS',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"state"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorState = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'state',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"timelock"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorTimelock = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'timelock',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"timelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorTimelockV1 = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'timelockV1',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"vetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorVetoer = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'vetoer',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"voteSnapshotBlockSwitchProposalId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorVoteSnapshotBlockSwitchProposalId = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'voteSnapshotBlockSwitchProposalId',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"votingDelay"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorVotingDelay = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'votingDelay',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"votingPeriod"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const readNijiGovernorVotingPeriod = /*#__PURE__*/ createReadContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'votingPeriod',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernor = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancel"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCancel = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancel',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancelSig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCancelSig = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancelSig',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCastRefundableVote = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castRefundableVote',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCastRefundableVoteWithReason = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castRefundableVoteWithReason',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCastVote = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVote',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCastVoteBySig = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorCastVoteWithReason = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"escrowToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorEscrowToFork = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'escrowToFork',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"execute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorExecute = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'execute',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"executeFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorExecuteFork = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'executeFork',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"joinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorJoinFork = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'joinFork',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"propose"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorPropose = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'propose',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorProposeBySigs = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeBySigs',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorProposeOnTimelockV1 = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeOnTimelockV1',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorQueue = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorUpdateProposal = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposal',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorUpdateProposalBySigs = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalBySigs',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalDescription"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorUpdateProposalDescription = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalDescription',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorUpdateProposalTransactions = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalTransactions',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"veto"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorVeto = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'veto',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowIncreasingTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorWithdrawDaoNounsFromEscrowIncreasingTotalSupply =
  /*#__PURE__*/ createWriteContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowIncreasingTotalSupply',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowToTreasury"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorWithdrawDaoNounsFromEscrowToTreasury =
  /*#__PURE__*/ createWriteContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowToTreasury',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const writeNijiGovernorWithdrawFromForkEscrow = /*#__PURE__*/ createWriteContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'withdrawFromForkEscrow',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernor = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancel"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCancel = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancel',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"cancelSig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCancelSig = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'cancelSig',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCastRefundableVote = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castRefundableVote',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castRefundableVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCastRefundableVoteWithReason =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'castRefundableVoteWithReason',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCastVote = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVote',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCastVoteBySig = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteBySig',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"castVoteWithReason"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorCastVoteWithReason = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'castVoteWithReason',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"escrowToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorEscrowToFork = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'escrowToFork',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"execute"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorExecute = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'execute',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"executeFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorExecuteFork = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'executeFork',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"initialize"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"joinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorJoinFork = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'joinFork',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"propose"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorPropose = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'propose',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorProposeBySigs = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeBySigs',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"proposeOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorProposeOnTimelockV1 = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'proposeOnTimelockV1',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"queue"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorQueue = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'queue',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposal"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorUpdateProposal = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposal',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalBySigs"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorUpdateProposalBySigs = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalBySigs',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalDescription"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorUpdateProposalDescription = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'updateProposalDescription',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"updateProposalTransactions"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorUpdateProposalTransactions = /*#__PURE__*/ createSimulateContract(
  {
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'updateProposalTransactions',
  },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"veto"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorVeto = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'veto',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowIncreasingTotalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorWithdrawDaoNounsFromEscrowIncreasingTotalSupply =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowIncreasingTotalSupply',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawDAONounsFromEscrowToTreasury"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorWithdrawDaoNounsFromEscrowToTreasury =
  /*#__PURE__*/ createSimulateContract({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    functionName: 'withdrawDAONounsFromEscrowToTreasury',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiGovernorAbi}__ and `functionName` set to `"withdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const simulateNijiGovernorWithdrawFromForkEscrow = /*#__PURE__*/ createSimulateContract({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  functionName: 'withdrawFromForkEscrow',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"DAONounsSupplyIncreasedFromEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorDaoNounsSupplyIncreasedFromEscrowEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'DAONounsSupplyIncreasedFromEscrow',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"DAOWithdrawNounsFromEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorDaoWithdrawNounsFromEscrowEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'DAOWithdrawNounsFromEscrow',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ERC20TokensToIncludeInForkSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorErc20TokensToIncludeInForkSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ERC20TokensToIncludeInForkSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"EscrowedToFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorEscrowedToForkEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'EscrowedToFork',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ExecuteFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorExecuteForkEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ExecuteFork',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkDAODeployerSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorForkDaoDeployerSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ForkDAODeployerSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorForkPeriodSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ForkPeriodSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ForkThresholdSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorForkThresholdSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ForkThresholdSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"JoinFork"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorJoinForkEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'JoinFork',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"LastMinuteWindowSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorLastMinuteWindowSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'LastMinuteWindowSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"MaxQuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorMaxQuorumVotesBpsSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'MaxQuorumVotesBPSSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"MinQuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorMinQuorumVotesBpsSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'MinQuorumVotesBPSSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorNewAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewAdmin',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewPendingAdmin"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorNewPendingAdminEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewPendingAdmin',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewPendingVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorNewPendingVetoerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewPendingVetoer',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"NewVetoer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorNewVetoerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'NewVetoer',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ObjectionPeriodDurationSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorObjectionPeriodDurationSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ObjectionPeriodDurationSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCanceled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalCanceledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalCanceled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalCreatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalCreated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreatedOnTimelockV1"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalCreatedOnTimelockV1Event =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalCreatedOnTimelockV1',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalCreatedWithRequirements"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalCreatedWithRequirementsEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalCreatedWithRequirements',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalDescriptionUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalDescriptionUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalDescriptionUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalExecuted"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalExecutedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalExecuted',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalObjectionPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalObjectionPeriodSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalObjectionPeriodSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalQueued"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalQueuedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalQueued',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalThresholdBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalThresholdBpsSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalThresholdBPSSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalTransactionsUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalTransactionsUpdatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalTransactionsUpdated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalUpdatablePeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalUpdatablePeriodSetEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: nijiGovernorAbi,
    address: nijiGovernorAddress,
    eventName: 'ProposalUpdatablePeriodSet',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalUpdatedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalUpdated',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"ProposalVetoed"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorProposalVetoedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'ProposalVetoed',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"QuorumCoefficientSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorQuorumCoefficientSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'QuorumCoefficientSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"QuorumVotesBPSSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorQuorumVotesBpsSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'QuorumVotesBPSSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"RefundableVote"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorRefundableVoteEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'RefundableVote',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"SignatureCancelled"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorSignatureCancelledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'SignatureCancelled',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"TimelocksAndAdminSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorTimelocksAndAdminSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'TimelocksAndAdminSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VoteCast"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorVoteCastEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VoteCast',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VoteCastWithClientId"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorVoteCastWithClientIdEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VoteCastWithClientId',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VotingDelaySet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorVotingDelaySetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VotingDelaySet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"VotingPeriodSet"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorVotingPeriodSetEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'VotingPeriodSet',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"Withdraw"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorWithdrawEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiGovernorAbi,
  address: nijiGovernorAddress,
  eventName: 'Withdraw',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiGovernorAbi}__ and `eventName` set to `"WithdrawFromForkEscrow"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57)
 */
export const watchNijiGovernorWithdrawFromForkEscrowEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: nijiGovernorAbi, address: nijiGovernorAddress, eventName: 'WithdrawFromForkEscrow' },
)
