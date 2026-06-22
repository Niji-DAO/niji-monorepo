import React, { useState } from 'react';

import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Proposal, ProposalState, useActivePendingUpdatableProposers } from '@/wrappers/nijiDao';
import { ProposalCandidate } from '@/wrappers/nijiData';
import { useDelegateNounsAtBlockQuery, useUserVotes } from '@/wrappers/nijiToken';

import classes from './CandidateSponsors.module.css';
import SelectSponsorsToPropose from './SelectSponsorsToPropose';
import { SponsorsFormOverlay } from './SponsorsFormOverlay';
import { SponsorsHeader } from './SponsorsHeader';
import { SponsorsList } from './SponsorsList';
import SubmitUpdateProposal from './SubmitUpdateProposal';
import { useCandidateSponsorState } from './useCandidateSponsorState';

interface CandidateSponsorsProps {
  candidate: ProposalCandidate;
  slug: string;
  isProposer: boolean;
  id: string;
  handleRefetchCandidateData: () => void;
  setDataFetchPollInterval: (interval: number | null) => void;
  currentBlock: bigint;
  requiredVotes: number;
  userVotes: number;
  isSignerWithActiveOrPendingProposal?: boolean;
  latestProposal?: Proposal;
  isUpdateToProposal?: boolean;
  originalProposal?: Proposal;
  blockNumber?: bigint;
}

const CandidateSponsors: React.FC<CandidateSponsorsProps> = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFormDisplayed, setIsFormDisplayed] = React.useState<boolean>(false);
  const [addSignatureTransactionState, setAddSignatureTransactionState] = useState<
    'None' | 'Success' | 'Mining' | 'Fail' | 'Exception'
  >('None');

  const { address: account } = useAccount();
  const activePendingProposers = useActivePendingUpdatableProposers(props.blockNumber);
  const connectedAccountNounVotes = useUserVotes() || 0;

  const { isThresholdMet, isAccountSigner, isOriginalSigner, setIsAccountSigner } =
    useCandidateSponsorState({
      candidate: props.candidate,
      originalProposal: props.originalProposal,
      account,
    });

  const originalSigners = props.originalProposal?.signers.map(signer => signer.id.toLowerCase());
  const originalSignersDelegateSnapshot = useDelegateNounsAtBlockQuery(
    originalSigners ?? [],
    BigInt(props.blockNumber ?? 0),
  );
  const isParentProposalUpdatable = props.originalProposal?.status === ProposalState.UPDATABLE;
  const signatures = props.candidate.version.content.contentSignatures;

  const refetchData = () => {
    props.handleRefetchCandidateData();
  };

  return (
    <>
      <SelectSponsorsToPropose
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        signatures={signatures}
        requiredVotes={props.candidate.requiredVotes}
        candidate={props.candidate}
        blockNumber={props.blockNumber}
        setDataFetchPollInterval={props.setDataFetchPollInterval}
        handleRefetchCandidateData={props.handleRefetchCandidateData}
      />
      {props.isUpdateToProposal && (
        <SubmitUpdateProposal
          isModalOpen={isUpdateModalOpen}
          setIsModalOpen={setIsUpdateModalOpen}
          signatures={signatures}
          candidate={props.candidate}
          setDataFetchPollInterval={props.setDataFetchPollInterval}
          handleRefetchCandidateData={props.handleRefetchCandidateData}
          proposalIdToUpdate={props.originalProposal?.id ? props.originalProposal?.id : ''}
        />
      )}
      <div className={classes.wrapper}>
        {isThresholdMet && (
          <p className={classes.thresholdMet}>
            <CheckCircle2 className="inline-block h-4 w-4" /> Sponsor threshold met
          </p>
        )}
        <div
          className={clsx(classes.interiorWrapper, isFormDisplayed && classes.formOverlayVisible)}
        >
          {signatures ? (
            !isFormDisplayed ? (
              <>
                <SponsorsHeader
                  candidate={props.candidate}
                  isUpdateToProposal={props.isUpdateToProposal}
                  isThresholdMet={isThresholdMet}
                  originalProposal={props.originalProposal}
                />
                <SponsorsList
                  candidate={props.candidate}
                  isUpdateToProposal={props.isUpdateToProposal}
                  isParentProposalUpdatable={isParentProposalUpdatable}
                  isProposer={props.isProposer}
                  isAccountSigner={isAccountSigner}
                  isOriginalSigner={isOriginalSigner}
                  isThresholdMet={isThresholdMet}
                  account={account}
                  activePendingProposers={activePendingProposers}
                  originalProposal={props.originalProposal}
                  originalSignersDelegates={originalSignersDelegateSnapshot.data?.delegates}
                  connectedAccountNounVotes={connectedAccountNounVotes}
                  setIsAccountSigner={setIsAccountSigner}
                  setDataFetchPollInterval={props.setDataFetchPollInterval}
                  handleRefetchCandidateData={refetchData}
                  onOpenSubmitModal={() => setIsModalOpen(true)}
                  onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
                  onOpenForm={() => setIsFormDisplayed(!isFormDisplayed)}
                />
              </>
            ) : (
              <SponsorsFormOverlay
                isFormDisplayed={isFormDisplayed}
                candidate={props.candidate}
                id={props.id}
                transactionState={addSignatureTransactionState}
                setTransactionState={setAddSignatureTransactionState}
                setIsFormDisplayed={setIsFormDisplayed}
                handleRefetchCandidateData={props.handleRefetchCandidateData}
                setDataFetchPollInterval={props.setDataFetchPollInterval}
                proposalIdToUpdate={props.originalProposal?.id ? +props.originalProposal?.id : 0}
              />
            )
          ) : (
            <img
              src="/loading-noggles.svg"
              alt="loading"
              className={classes.transactionModalSpinner}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateSponsors;
