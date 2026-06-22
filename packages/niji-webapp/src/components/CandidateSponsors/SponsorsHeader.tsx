import { Trans } from '@lingui/react/macro';

import { Proposal } from '@/wrappers/nijiDao';
import { ProposalCandidate } from '@/wrappers/nijiData';

import classes from './CandidateSponsors.module.css';

interface SponsorsHeaderProps {
  candidate: ProposalCandidate;
  isUpdateToProposal?: boolean;
  isThresholdMet: boolean;
  originalProposal?: Proposal;
}

/**
 * Header + subhead for the candidate sponsors panel. Switches text between the "new candidate"
 * flow and the "update to existing proposal" flow.
 */
export function SponsorsHeader({
  candidate,
  isUpdateToProposal,
  isThresholdMet,
  originalProposal,
}: SponsorsHeaderProps) {
  return (
    <>
      <h4 className={classes.header}>
        <strong>
          {isUpdateToProposal ? (
            <>
              {candidate.voteCount >= 0 ? candidate.voteCount : '...'} of{' '}
              {originalProposal?.signers.length || '...'} original signed votes
            </>
          ) : (
            <NewCandidateHeader candidate={candidate} />
          )}
        </strong>
      </h4>
      {candidate.proposerVotes > 0 && !isUpdateToProposal && (
        <p className={classes.proposerVotesLabel}>
          <Trans>
            Proposer has {candidate.proposerVotes} vote
            {candidate.proposerVotes > 1 ? 's' : ''}
          </Trans>
        </p>
      )}
      <p className={classes.subhead}>
        {isThresholdMet && !isUpdateToProposal ? (
          <Trans>
            This candidate has met the required threshold, but Nijis voters can still add support
            until it’s put onchain.
          </Trans>
        ) : isUpdateToProposal ? (
          <Trans>Update proposal candidates must be re-signed by the original signers.</Trans>
        ) : (
          <Trans>Proposal candidates must meet the required Nijis vote threshold.</Trans>
        )}
      </p>
    </>
  );
}

function NewCandidateHeader({ candidate }: { candidate: ProposalCandidate }) {
  const proposerOversaturated = candidate.proposerVotes > candidate.requiredVotes;
  if (candidate.voteCount === 0 && proposerOversaturated) {
    return <Trans>No sponsored votes needed</Trans>;
  }
  return (
    <>
      {candidate.voteCount >= 0 ? candidate.voteCount : '...'} of{' '}
      {proposerOversaturated ? (
        <em className={classes.naVotesLabel}>n/a</em>
      ) : candidate.requiredVotes != undefined ? (
        <>{candidate.requiredVotes}</>
      ) : (
        <>...</>
      )}{' '}
      sponsored votes
    </>
  );
}
