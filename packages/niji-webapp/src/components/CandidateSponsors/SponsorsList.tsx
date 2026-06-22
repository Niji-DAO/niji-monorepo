import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

import { Proposal } from '@/wrappers/nijiDao';
import { ProposalCandidate } from '@/wrappers/nijiData';

import classes from './CandidateSponsors.module.css';
import OriginalSignature from './OriginalSignature';
import Signature from './Signature';

interface SignerVoteCountMap {
  id: string;
  nijiRepresented?: ReadonlyArray<unknown>;
}

interface SponsorsListProps {
  candidate: ProposalCandidate;
  isUpdateToProposal?: boolean;
  isParentProposalUpdatable: boolean;
  isProposer: boolean;
  isAccountSigner: boolean;
  isOriginalSigner: boolean;
  isThresholdMet: boolean;
  account?: string;
  activePendingProposers: unknown;
  originalProposal?: Proposal;
  originalSignersDelegates?: SignerVoteCountMap[];
  connectedAccountNounVotes: number;
  setIsAccountSigner: (value: boolean) => void;
  setDataFetchPollInterval: (interval: number | null) => void;
  handleRefetchCandidateData: () => void;
  onOpenSubmitModal: () => void;
  onOpenUpdateModal: () => void;
  onOpenForm: () => void;
}

/**
 * Renders the list of sponsor signatures + placeholder slots + the action button (submit-onchain
 * for proposers / sponsor button for voters / inactive notice for old updates).
 */
export function SponsorsList({
  candidate,
  isUpdateToProposal,
  isParentProposalUpdatable,
  isProposer,
  isAccountSigner,
  isOriginalSigner,
  isThresholdMet,
  account,
  activePendingProposers,
  originalProposal,
  originalSignersDelegates,
  connectedAccountNounVotes,
  setIsAccountSigner,
  setDataFetchPollInterval,
  handleRefetchCandidateData,
  onOpenSubmitModal,
  onOpenUpdateModal,
  onOpenForm,
}: SponsorsListProps) {
  const signatures = candidate.version.content.contentSignatures;
  const signers = signatures?.map(signature => signature.signer.id.toLowerCase());

  return (
    <ul className={classes.sponsorsList}>
      {signatures.map(signature => {
        const sigVoteCount = signature.signer.voteCount || 0;
        if (!sigVoteCount || !activePendingProposers) return null;
        if (signature.canceled) return null;
        return (
          <Signature
            key={signature.signer.id}
            reason={signature.reason}
            voteCount={sigVoteCount}
            expirationTimestamp={signature.expirationTimestamp}
            signer={signature.signer.id}
            isAccountSigner={signature.signer.id.toLowerCase() === account?.toLowerCase()}
            sig={signature.sig}
            setDataFetchPollInterval={setDataFetchPollInterval}
            signerHasActiveOrPendingProposal={signature.signer.activeOrPendingProposal}
            isUpdateToProposal={isUpdateToProposal}
            isParentProposalUpdatable={isParentProposalUpdatable}
            handleRefetchCandidateData={handleRefetchCandidateData}
            setIsAccountSigner={setIsAccountSigner}
            handleSignatureRemoved={handleRefetchCandidateData}
          />
        );
      })}
      {isUpdateToProposal
        ? originalProposal?.signers.map((ogSigner, i) => {
            const sigVoteCount = originalSignersDelegates?.find(d => d.id === ogSigner.id)
              ?.nijiRepresented?.length;
            if (signers?.includes(ogSigner.id.toLowerCase())) return null;
            if (!sigVoteCount || !activePendingProposers) return null;
            return (
              <OriginalSignature
                key={i}
                signer={ogSigner.id}
                voteCount={sigVoteCount}
                isParentProposalUpdatable={isParentProposalUpdatable}
              />
            );
          })
        : candidate.requiredVotes > candidate.voteCount &&
          Array(candidate.requiredVotes - candidate.voteCount)
            .fill('')
            .map((_s, i) => (
              <li className={classes.placeholder} key={i}>
                {' '}
              </li>
            ))}
      <SponsorActionButton
        candidate={candidate}
        isUpdateToProposal={isUpdateToProposal}
        isParentProposalUpdatable={isParentProposalUpdatable}
        isProposer={isProposer}
        isAccountSigner={isAccountSigner}
        isOriginalSigner={isOriginalSigner}
        isThresholdMet={isThresholdMet}
        originalProposal={originalProposal}
        connectedAccountNounVotes={connectedAccountNounVotes}
        onOpenSubmitModal={onOpenSubmitModal}
        onOpenUpdateModal={onOpenUpdateModal}
        onOpenForm={onOpenForm}
      />
    </ul>
  );
}

interface SponsorActionButtonProps {
  candidate: ProposalCandidate;
  isUpdateToProposal?: boolean;
  isParentProposalUpdatable: boolean;
  isProposer: boolean;
  isAccountSigner: boolean;
  isOriginalSigner: boolean;
  isThresholdMet: boolean;
  originalProposal?: Proposal;
  connectedAccountNounVotes: number;
  onOpenSubmitModal: () => void;
  onOpenUpdateModal: () => void;
  onOpenForm: () => void;
}

function SponsorActionButton({
  candidate,
  isUpdateToProposal,
  isParentProposalUpdatable,
  isProposer,
  isAccountSigner,
  isOriginalSigner,
  isThresholdMet,
  originalProposal,
  connectedAccountNounVotes,
  onOpenSubmitModal,
  onOpenUpdateModal,
  onOpenForm,
}: SponsorActionButtonProps) {
  if (isUpdateToProposal && !isParentProposalUpdatable) {
    return (
      <p className={classes.inactiveCandidate}>
        <strong>
          <Link to={`/vote/${originalProposal?.id}`}>Proposal {originalProposal?.id}</Link>
        </strong>{' '}
        is no longer updatable
      </p>
    );
  }

  if (isProposer && isThresholdMet) {
    return (
      <button
        className={classes.button}
        onClick={() => (isUpdateToProposal ? onOpenUpdateModal() : onOpenSubmitModal())}
      >
        Submit onchain
      </button>
    );
  }

  const canSignNewCandidate = !isUpdateToProposal && !isAccountSigner && !candidate.isProposal;
  const canResign = isUpdateToProposal && isOriginalSigner && !isAccountSigner;
  if (!canSignNewCandidate && !canResign) return null;

  if (isProposer || connectedAccountNounVotes <= 0) {
    return (
      <div className={classes.withoutVotesMsg}>
        <p>
          <Trans>Sponsoring a proposal requires at least one Niji vote</Trans>
        </p>
      </div>
    );
  }

  return (
    <button className={classes.button} onClick={onOpenForm}>
      {isUpdateToProposal ? 'Re-sign' : 'Sponsor'}
    </button>
  );
}
