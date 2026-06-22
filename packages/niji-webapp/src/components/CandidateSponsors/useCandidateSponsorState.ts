import { useEffect, useState } from 'react';

import { Proposal } from '@/wrappers/nijiDao';
import { ProposalCandidate } from '@/wrappers/nijiData';

interface UseCandidateSponsorStateArgs {
  candidate: ProposalCandidate;
  originalProposal?: Proposal;
  account?: string;
}

export interface CandidateSponsorState {
  isThresholdMet: boolean;
  isAccountSigner: boolean;
  isOriginalSigner: boolean;
  setIsAccountSigner: (value: boolean) => void;
}

/**
 * Derives signer / threshold / original-signer flags from the candidate + original proposal +
 * connected account. Extracted from the container so the rendering tree stays focused on layout.
 */
export function useCandidateSponsorState({
  candidate,
  originalProposal,
  account,
}: UseCandidateSponsorStateArgs): CandidateSponsorState {
  const [isThresholdMet, setIsThresholdMet] = useState(false);
  const [isAccountSigner, setIsAccountSigner] = useState(false);
  const [isOriginalSigner, setIsOriginalSigner] = useState(false);

  const signatures = candidate.version.content.contentSignatures;
  const originalSigners = originalProposal?.signers.map(signer => signer.id.toLowerCase());

  useEffect(() => {
    if (candidate.proposerVotes + candidate.voteCount >= candidate.requiredVotes) {
      setIsThresholdMet(true);
    } else {
      setIsThresholdMet(false);
    }
    if (originalProposal?.signers) {
      setIsThresholdMet(signatures.length >= originalProposal.signers.length);
    }
  }, [candidate, originalProposal?.signers, signatures]);

  useEffect(() => {
    if (!originalProposal?.signers || !account) return;
    setIsOriginalSigner(
      Boolean(originalSigners && originalSigners.includes(account.toLowerCase())),
    );
  }, [originalProposal, account, originalSigners]);

  useEffect(() => {
    if (!signatures || !account) return;
    const accountIsSigner = signatures.some(
      sig => sig.signer.id.toLowerCase() === account.toLowerCase(),
    );
    setIsAccountSigner(accountIsSigner);
  }, [signatures, account]);

  return { isThresholdMet, isAccountSigner, isOriginalSigner, setIsAccountSigner };
}
