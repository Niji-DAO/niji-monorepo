import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { VoteSignalDetail } from '@/wrappers/nijiData';

const SUPPORT_TEXT = ['Against', 'For', 'Abstain'] as const;

interface VoteSignalsUserFeedbackProps {
  userVoteSupport?: VoteSignalDetail;
}

/**
 * Display after the connected account has already submitted feedback: shows the chosen support
 * level + age + (optional) reason text.
 * Accepts `userVoteSupport: undefined` to preserve the original behavior where the "voted" branch
 * renders an empty paragraph between submit success and the subgraph refetch arrival (the user
 * sees their state transition to "already voted" immediately, then the details fill in).
 */
export function VoteSignalsUserFeedback({ userVoteSupport }: VoteSignalsUserFeedbackProps) {
  return (
    <div className="text-left">
      <p>
        <Trans>
          You provided{' '}
          <span
            className={clsx(
              userVoteSupport?.supportDetailed === 1 && 'text-[var(--brand-color-green)]',
              userVoteSupport?.supportDetailed === 0 && 'text-[var(--brand-color-red)]',
              userVoteSupport?.supportDetailed === 2 && 'text-[var(--brand-gray-light-text)]',
            )}
          >
            {userVoteSupport && SUPPORT_TEXT[userVoteSupport.supportDetailed].toLowerCase()}
          </span>{' '}
          feedback{' '}
          {userVoteSupport?.createdTimestamp &&
            dayjs(userVoteSupport.createdTimestamp * 1000).fromNow()}
        </Trans>
      </p>
      {userVoteSupport?.reason && (
        <div>
          <p className="text-left text-sm font-normal italic text-[var(--brand-gray-light-text)]">
            &ldquo;{userVoteSupport.reason}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
