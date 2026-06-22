import { useEffect, useState } from 'react';

import { VoteSignalDetail } from '@/wrappers/nijiData';

interface VoteSignalsFeedbackArgs {
  feedbackList?: VoteSignalDetail[];
  versionTimestamp: bigint;
  account?: string;
}

export interface VoteSignalsFeedbackResult {
  forFeedback: VoteSignalDetail[];
  againstFeedback: VoteSignalDetail[];
  abstainFeedback: VoteSignalDetail[];
  hasUserVoted: boolean;
  userVoteSupport: VoteSignalDetail | undefined;
}

/**
 * Splits the raw feedback list into for / against / abstain buckets and detects whether the
 * connected account has already voted. Filters out feedback older than `versionTimestamp` so
 * version-scoped votes do not bleed into newer proposal revisions.
 */
export function useVoteSignalsFeedback({
  feedbackList,
  versionTimestamp,
  account,
}: VoteSignalsFeedbackArgs): VoteSignalsFeedbackResult {
  const [forFeedback, setForFeedback] = useState<VoteSignalDetail[]>([]);
  const [againstFeedback, setAgainstFeedback] = useState<VoteSignalDetail[]>([]);
  const [abstainFeedback, setAbstainFeedback] = useState<VoteSignalDetail[]>([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [userVoteSupport, setUserVoteSupport] = useState<VoteSignalDetail>();

  useEffect(() => {
    if (!feedbackList) return;
    const filtered = versionTimestamp
      ? feedbackList.filter(f => f.createdTimestamp >= versionTimestamp)
      : feedbackList;

    const forIt: VoteSignalDetail[] = [];
    const againstIt: VoteSignalDetail[] = [];
    const abstainIt: VoteSignalDetail[] = [];
    filtered.forEach(feedback => {
      if (feedback.supportDetailed === 1) forIt.push(feedback);
      else if (feedback.supportDetailed === 0) againstIt.push(feedback);
      else if (feedback.supportDetailed === 2) abstainIt.push(feedback);
    });
    setForFeedback(forIt);
    setAgainstFeedback(againstIt);
    setAbstainFeedback(abstainIt);

    if (account) {
      // Match the original behavior: when a voter has submitted multiple feedback events,
      // keep walking the filtered list so the **last** matching entry wins (most recent feedback).
      // `Array.find` would return the first match instead, which is a behavior change.
      let latestUserFeedback: VoteSignalDetail | undefined;
      filtered.forEach(feedback => {
        if (feedback.voter.id.toUpperCase() === account.toUpperCase()) {
          latestUserFeedback = feedback;
        }
      });
      if (latestUserFeedback) {
        setHasUserVoted(true);
        setUserVoteSupport(latestUserFeedback);
      }
    }
  }, [feedbackList, versionTimestamp, account]);

  return { forFeedback, againstFeedback, abstainFeedback, hasUserVoted, userVoteSupport };
}
