import React, { useEffect, useState } from 'react';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

import { Spinner } from '@/components/Spinner';
import { useSendFeedback, VoteSignalDetail } from '@/wrappers/nijiData';

import { useVoteSignalsFeedback } from './useVoteSignalsFeedback';
import VoteSignalGroup from './VoteSignalGroup';
import { VoteSignalsForm, VoteSignalsPending } from './VoteSignalsForm';
import { VoteSignalsFootnote, VoteSignalsHeader } from './VoteSignalsHeader';
import { VoteSignalsUserFeedback } from './VoteSignalsUserFeedback';

type VoteSignalsProps = {
  proposalId?: string;
  proposer?: string;
  versionTimestamp: bigint;
  feedback?: VoteSignalDetail[];
  userVotes?: number;
  isCandidate?: boolean;
  candidateSlug?: string;
  setDataFetchPollInterval: (interval: number) => void;
  handleRefetch: () => void;
  isFeedbackClosed?: boolean;
};

function VoteSignals({
  candidateSlug,
  feedback: feedbackList,
  handleRefetch,
  isCandidate,
  isFeedbackClosed,
  proposalId,
  proposer,
  setDataFetchPollInterval,
  userVotes,
  versionTimestamp,
}: Readonly<VoteSignalsProps>) {
  const [reasonText, setReasonText] = React.useState('');
  const [support, setSupport] = React.useState<number | undefined>();
  const [isTransactionWaiting, setIsTransactionWaiting] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<number | undefined>(undefined);

  const {
    sendProposalFeedback,
    sendProposalFeedbackState,
    sendCandidateFeedback,
    sendCandidateFeedbackState,
  } = useSendFeedback();

  const { address: account } = useAccount();
  const { forFeedback, againstFeedback, abstainFeedback, hasUserVoted, userVoteSupport } =
    useVoteSignalsFeedback({ feedbackList, versionTimestamp, account });
  const [localHasUserVoted, setLocalHasUserVoted] = useState(false);
  const userHasVoted = hasUserVoted || localHasUserVoted;

  async function handleFeedbackSubmit(
    proposalIdNum: number,
    supportNum: number,
    reason: string | null,
    cSlug?: string,
    cProposer?: string,
  ) {
    if (supportNum > 2) return;
    if (isCandidate === true && cSlug && cProposer) {
      await sendCandidateFeedback({
        args: [cProposer as `0x${string}`, cSlug, supportNum, reason || ''],
      });
    } else {
      await sendProposalFeedback({ args: [BigInt(proposalIdNum), supportNum, reason || ''] });
    }
  }

  const { _ } = useLingui();
  useEffect(() => {
    const status =
      isCandidate === true ? sendCandidateFeedbackState?.status : sendProposalFeedbackState?.status;
    const errorMessage =
      isCandidate === true
        ? sendCandidateFeedbackState?.errorMessage
        : sendProposalFeedbackState?.errorMessage;

    if (status === 'None') {
      setIsTransactionPending(false);
    } else if (status === 'PendingSignature') {
      setIsTransactionWaiting(true);
    } else if (status === 'Mining') {
      setIsTransactionWaiting(false);
      setIsTransactionPending(true);
      setDataFetchPollInterval(50);
    } else if (status === 'Success') {
      handleRefetch();
      setIsTransactionPending(false);
      setLocalHasUserVoted(true);
      setExpandedGroup(support);
    } else if (status === 'Fail' || status === 'Exception') {
      toast.error(errorMessage || _(t`Please try again.`));
      setIsTransactionPending(false);
      setIsTransactionWaiting(false);
      setDataFetchPollInterval(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendCandidateFeedbackState, sendProposalFeedbackState, _]);

  const isBusy = isTransactionPending || isTransactionWaiting;
  const showFeedbackPanel = !isFeedbackClosed && userVotes !== undefined && userVotes > 0;

  if (!proposalId) return null;

  return (
    <div className={clsx(isCandidate && 'relative top-0')}>
      <VoteSignalsHeader isCandidate={isCandidate} />
      <div
        className={clsx(
          'flex flex-col items-center justify-between overflow-hidden rounded-xl border border-[#e6e6e6]',
          !isCandidate && 'lg:sticky lg:top-5',
        )}
      >
        {!feedbackList ? (
          <div className="mx-auto flex h-full w-full items-center justify-center p-5 text-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="w-full px-4 py-1.5">
              <VoteSignalGroup
                voteSignals={forFeedback}
                support={1}
                isExpanded={expandedGroup === 1}
              />
              <VoteSignalGroup
                voteSignals={againstFeedback}
                support={0}
                isExpanded={expandedGroup === 0}
              />
              <VoteSignalGroup
                voteSignals={abstainFeedback}
                support={2}
                isExpanded={expandedGroup === 2}
              />
            </div>
            {showFeedbackPanel && (
              <div
                className={clsx(
                  'flex w-full flex-col items-center justify-center gap-2.5 border-t border-[#e6e6e6] bg-[#f4f4f8] p-5',
                  userVoteSupport && 'block',
                )}
              >
                {!userHasVoted ? (
                  isBusy ? (
                    <VoteSignalsPending />
                  ) : (
                    <VoteSignalsForm
                      support={support}
                      setSupport={setSupport}
                      reasonText={reasonText}
                      setReasonText={setReasonText}
                      isBusy={isBusy}
                      onSubmit={() => {
                        setIsTransactionWaiting(true);
                        if (proposalId && support !== undefined) {
                          handleFeedbackSubmit(
                            +proposalId,
                            support,
                            reasonText,
                            candidateSlug,
                            proposer,
                          );
                        }
                      }}
                    />
                  )
                ) : (
                  <VoteSignalsUserFeedback userVoteSupport={userVoteSupport} />
                )}
              </div>
            )}
          </>
        )}
      </div>
      {isCandidate && <VoteSignalsFootnote />}
    </div>
  );
}

export default VoteSignals;
