import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';

interface VoteSignalsHeaderProps {
  isCandidate?: boolean;
}

export function VoteSignalsHeader({ isCandidate }: VoteSignalsHeaderProps) {
  return (
    <div className={clsx('my-4', isCandidate && 'mt-8')}>
      <h2 className={clsx('m-0 mb-2 text-base font-bold', isCandidate && 'text-xl')}>
        {isCandidate ? <Trans>Pre-proposal feedback</Trans> : <Trans>Pre-voting feedback</Trans>}
      </h2>
      {!isCandidate && (
        <p className="m-0 p-0 text-base font-[PT_Root_UI] text-[var(--brand-gray-light-text)]">
          <Trans>
            Nijis voters can cast voting signals to give proposers of pending proposals an idea of
            how they intend to vote and helpful guidance on proposal changes to change their vote.
          </Trans>
        </p>
      )}
    </div>
  );
}

export function VoteSignalsFootnote() {
  return (
    <p className="m-0 mt-2 p-0 text-base text-sm font-[PT_Root_UI] leading-tight text-[var(--brand-gray-light-text)]">
      <Trans>
        Nijis voters can cast voting signals to give proposers of pending proposals an idea of how
        they intend to vote and helpful guidance on proposal changes to change their vote.
      </Trans>
    </p>
  );
}
