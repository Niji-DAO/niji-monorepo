import { useEffect, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { nijiGovernorAddress } from '@niji/sdk/react';
import { encodePacked, getAddress } from 'viem';
import { useSignTypedData } from 'wagmi';

import { defaultChain } from '@/wagmi';
import { ProposalCandidate } from '@/wrappers/nijiData';

import classes from './CandidateSponsors.module.css';
import { calcProposalEncodeData } from './signature/encodeProposalData';
import { SignatureFormFields } from './signature/SignatureFormFields';
import { SignatureStatusOverlay } from './signature/SignatureStatusOverlay';
import { createProposalTypes, TransactionState, updateProposalTypes } from './signature/types';
import { useSignatureFlow } from './signature/useSignatureFlow';

type SignatureFormProps = {
  id: string;
  transactionState: TransactionState;
  setTransactionState: (state: TransactionState) => void;
  setIsFormDisplayed: (displayed: boolean) => void;
  candidate: ProposalCandidate;
  handleRefetchCandidateData: () => void;
  setDataFetchPollInterval: (interval: number | null) => void;
  proposalIdToUpdate: number;
};

const SignatureForm = (props: Readonly<SignatureFormProps>) => {
  const [reasonText, setReasonText] = useState('');
  const [expirationDate, setExpirationDate] = useState<number>();

  const chainId = defaultChain.id;
  const [domain, setDomain] = useState({
    name: 'Niji DAO',
    chainId,
    verifyingContract: nijiGovernorAddress[chainId],
  });

  useEffect(() => {
    setDomain(prev => ({ ...prev, verifyingContract: nijiGovernorAddress[chainId] }));
  }, []);

  const { data, signTypedData, isPending: isSignPending } = useSignTypedData();
  const flow = useSignatureFlow({
    setDataFetchPollInterval: props.setDataFetchPollInterval,
    handleRefetchCandidateData: props.handleRefetchCandidateData,
    signatureData: data,
    isSignPending,
  });

  useEffect(() => {
    flow.validateExpirationDate(expirationDate);
  }, [expirationDate, flow]);

  const getSignature = async () => {
    flow.setIsGetSignatureWaiting(true);
    try {
      const baseValue = {
        proposer: getAddress(props.candidate.proposer),
        targets: props.candidate.version.content.targets.map(t => getAddress(t)),
        values: props.candidate.version.content.values.map(v => BigInt(v)),
        signatures: props.candidate.version.content.signatures,
        calldatas: props.candidate.version.content.calldatas,
        description: props.candidate.version.content.description,
        expiry: BigInt(expirationDate || 0),
      };

      if (props.proposalIdToUpdate > 0) {
        signTypedData({
          domain,
          types: updateProposalTypes,
          primaryType: 'UpdateProposal',
          message: { proposalId: BigInt(props.proposalIdToUpdate), ...baseValue },
        });
      } else {
        if (!props.candidate) return;
        signTypedData({
          domain,
          types: createProposalTypes,
          primaryType: 'Proposal',
          message: baseValue,
        });
      }

      flow.setIsGetSignatureWaiting(false);
      flow.setIsGetSignatureTxSuccessful(true);
      return data;
    } catch (err: unknown) {
      flow.setGetSignatureErrorMessage(
        err instanceof Error ? err.message : 'Unknown error occurred',
      );
      flow.setIsGetSignatureWaiting(false);
      return undefined;
    }
  };

  async function sign() {
    const signature = await getSignature();
    if (!signature) return;

    flow.setIsGetSignatureWaiting(false);
    flow.setIsWaiting(true);

    const encodedProp = await calcProposalEncodeData(
      props.candidate.proposer,
      props.candidate.version.content.targets,
      props.candidate.version.content.values.map(v => BigInt(v)),
      props.candidate.version.content.signatures,
      props.candidate.version.content.calldatas,
      props.candidate.version.content.description,
    );

    const encodedPropUpdate =
      props.proposalIdToUpdate > 0
        ? encodePacked(['uint256', 'bytes'], [BigInt(props.proposalIdToUpdate), encodedProp])
        : encodedProp;

    await flow.addSignature({
      args: [
        signature as `0x${string}`,
        expirationDate ? BigInt(expirationDate) : BigInt(0),
        props.candidate.proposer as `0x${string}`,
        props.candidate.slug,
        BigInt(props.proposalIdToUpdate),
        props.proposalIdToUpdate > 0 ? encodedPropUpdate : encodedProp,
        reasonText,
      ],
    });
  }

  return (
    <div className={classes.formWrapper}>
      <SignatureFormFields
        reasonText={reasonText}
        setReasonText={setReasonText}
        setExpirationDate={setExpirationDate}
        expirationDate={expirationDate}
        dateErrorMessage={flow.dateErrorMessage}
        isWaiting={flow.isWaiting}
        isLoading={flow.isLoading}
        proposalIdToUpdate={props.proposalIdToUpdate}
        transactionState={props.transactionState}
        onSign={sign}
      />
      <SignatureStatusOverlay
        isOverlayVisible={flow.isOverlayVisible}
        isWaiting={flow.isWaiting}
        isLoading={flow.isLoading}
        isTxSuccessful={flow.isTxSuccessful}
        isGetSignatureWaiting={flow.isGetSignatureWaiting}
        isGetSignaturePending={false}
        isGetSignatureTxSuccessful={flow.isGetSignatureTxSuccessful}
        isSignPending={isSignPending}
        errorMessage={flow.errorMessage}
        getSignatureErrorMessage={flow.getSignatureErrorMessage}
        transactionHash={flow.addSignatureState.transaction?.hash}
        onTryAgain={flow.clearTransactionState}
        onClose={() => {
          props.setIsFormDisplayed(false);
          flow.clearTransactionState();
        }}
      />
      <p className={classes.note}>
        <Trans>
          Once a signed proposal is onchain, signers will need to wait until the proposal is queued
          or defeated before putting another proposal onchain.
        </Trans>
      </p>
    </div>
  );
};

export default SignatureForm;
