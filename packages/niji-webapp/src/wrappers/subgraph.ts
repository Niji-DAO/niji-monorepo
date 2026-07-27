import { graphql } from '@/subgraphs';
import { BigNumberish } from '@/utils/types';

// Re-export generated documents with shorter aliases
export {
  GetProposalDocument as proposalDocument,
  GetPartialProposalsDocument as partialProposalsDocument,
  GetActivePendingUpdatableProposersDocument as activePendingUpdatableProposersDocument,
  GetUpdatableProposalsDocument as updatableProposalsDocument,
  GetCandidateProposalsDocument as candidateProposalsDocument,
  GetCandidateProposalDocument as candidateProposalDocument,
  GetCandidateProposalVersionsDocument as candidateProposalVersionsDocument,
  GetProposalVersionsDocument as proposalVersionsDocument,
  GetBidsByAuctionDocument as bidsByAuctionDocument,
  GetNounDocument as nounDocument,
  GetNounsIndexDocument as nounsIndexDocument,
  GetLatestBidsDocument as latestBidsDocument,
  GetNounVotingHistoryDocument as nounVotingHistoryDocument,
  GetNounTransferHistoryDocument as nounTransferHistoryDocument,
  GetNounDelegationHistoryDocument as nounDelegationHistoryDocument,
  GetCreateTimestampAllProposalsDocument as createTimestampAllProposalsDocument,
  GetProposalVotesDocument as proposalVotesDocument,
  GetAdjustedNounSupplyAtPropSnapshotDocument as adjustedNounSupplyAtPropSnapshotDocument,
  GetPropUsingDynamicQuorumDocument as propUsingDynamicQuorumDocument,
  GetProposalFeedbacksDocument as proposalFeedbacksDocument,
  GetCandidateFeedbacksDocument as candidateFeedbacksDocument,
  GetOwnedNounsDocument as ownedNounsDocument,
  GetAccountEscrowedNounsDocument as accountEscrowedNounsDocument,
  GetEscrowDepositEventsDocument as escrowDepositEventsDocument,
  GetForkJoinsDocument as forkJoinsDocument,
  GetEscrowWithdrawEventsDocument as escrowWithdrawEventsDocument,
  GetProposalTitlesDocument as proposalTitlesDocument,
  GetForkDetailsDocument as forkDetailsDocument,
  GetForksDocument as forksDocument,
  GetIsForkActiveDocument as isForkActiveDocument,
} from '@/subgraphs/graphql';

export interface IBid {
  id: string;
  bidder: {
    id: string;
  };
  amount: bigint;
  blockNumber: number;
  blockTimestamp: number;
  txHash: string;
  txIndex?: number;
  /** fiat 経路 (createBidFor) で subgraph が set する識別 flag、 crypto 経路では false */
  isFiat?: boolean;
  /** fiat 経路の payer (relayer / 運営 EOA)、 crypto 経路は null */
  payer?: { id: string } | null;
  /** fiat 経路の recipient (NFT 受取先 = user wallet)、 bidder と同一だが明示 record */
  recipient?: { id: string } | null;
  noun: {
    id: number;
    startTime?: BigNumberish;
    endTime?: BigNumberish;
    settled?: boolean;
  };
}

export const seedsDocument = graphql(`
  query GetSeeds($first: Int!) {
    seeds(first: $first) {
      id
      special
      choker
      headphone
      leftHand
      hat
      clothing
      ear
      back
      backDecoration
      background
      solidBackground
      hair
    }
  }
`);

export const delegateNounsAtBlockDocument = graphql(`
  query GetDelegateNounsAtBlock($delegates: [ID!]!, $block: Int!) {
    delegates(where: { id_in: $delegates }, block: { number: $block }) {
      id
      nijiRepresented {
        id
      }
    }
  }
`);

export const currentlyDelegatedNounsDocument = graphql(`
  query GetCurrentlyDelegatedNouns($delegate: ID!) {
    delegates(where: { id: $delegate }) {
      id
      nijiRepresented {
        id
      }
    }
  }
`);

export const auctionQuery = graphql(`
  query GetAuction($id: ID!) {
    auction(id: $id) {
      id
      amount
      settled
      bidder {
        id
      }
      startTime
      endTime
      noun {
        id
        seed {
          id
          special
          choker
          headphone
          leftHand
          hat
          clothing
          ear
          back
          backDecoration
          background
          solidBackground
          hair
        }
        owner {
          id
        }
      }
      bids {
        id
        blockNumber
        txIndex
        amount
      }
    }
  }
`);

export const latestAuctionsQuery = graphql(`
  query GetLatestAuctions($first: Int = 1000, $skip: Int = 0) {
    auctions(orderBy: startTime, orderDirection: desc, first: $first, skip: $skip) {
      id
      amount
      settled
      bidder {
        id
      }
      startTime
      endTime
      noun {
        id
        owner {
          id
        }
      }
      bids {
        id
        amount
        blockNumber
        blockTimestamp
        txHash
        txIndex
        bidder {
          id
        }
      }
    }
  }
`);
