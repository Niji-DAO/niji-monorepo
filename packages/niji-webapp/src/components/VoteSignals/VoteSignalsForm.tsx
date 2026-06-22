import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { FormControl } from 'react-bootstrap';

interface VoteSignalsFormProps {
  support: number | undefined;
  setSupport: (value: number | undefined) => void;
  reasonText: string;
  setReasonText: (value: string) => void;
  isBusy: boolean;
  onSubmit: () => void;
}

/**
 * "Add your feedback" form: 3 support buttons (For / Against / Abstain) + reason textarea + submit.
 */
export function VoteSignalsForm({
  support,
  setSupport,
  reasonText,
  setReasonText,
  isBusy,
  onSubmit,
}: VoteSignalsFormProps) {
  const toggleSupport = (value: number) => {
    if (support === value) setSupport(undefined);
    else setSupport(value);
  };

  const buttonBase =
    'duration-125 cursor-pointer rounded-[10px] border-0 border-2 border-transparent px-4 py-2.5 text-sm font-bold leading-none text-white outline-2 outline-transparent transition-all ease-in-out md:w-full hover:border-2 hover:border-white hover:opacity-80 hover:outline-2 hover:outline-[rgba(0,0,0,0.05)]';
  const active = 'border-2 border-white outline-2 outline-black';
  const inactive = 'opacity-40';

  return (
    <>
      <p className="m-0 p-0 text-base font-bold leading-tight">
        <Trans>Add your feedback</Trans>
      </p>
      <div className="flex flex-row gap-2.5 md:w-full md:flex-col">
        <button
          className={clsx(
            buttonBase,
            'bg-[var(--brand-color-green)]',
            support === undefined && 'opacity-100',
            support === 1 ? active : support !== undefined && inactive,
          )}
          disabled={isBusy}
          onClick={() => toggleSupport(1)}
        >
          <Trans>For</Trans>
        </button>
        <button
          className={clsx(
            buttonBase,
            'bg-[var(--brand-color-red)]',
            support === undefined && 'opacity-100',
            support === 0 ? active : support !== undefined && inactive,
          )}
          disabled={isBusy}
          onClick={() => toggleSupport(0)}
        >
          <Trans>Against</Trans>
        </button>
        <button
          className={clsx(
            buttonBase,
            'bg-[var(--brand-gray-light-text)]',
            support === undefined && 'opacity-100',
            support === 2 ? active : support !== undefined && inactive,
          )}
          disabled={isBusy}
          onClick={() => toggleSupport(2)}
        >
          <Trans>Abstain</Trans>
        </button>
      </div>
      <FormControl
        className="mb-0 w-full rounded-lg border border-[#aaa] p-2.5 text-sm"
        placeholder="Optional reason"
        value={reasonText}
        disabled={isBusy}
        onChange={event => setReasonText(event.target.value)}
        as="textarea"
      />
      <button
        className={clsx(
          buttonBase,
          'bg-black',
          'disabled:cursor-not-allowed disabled:opacity-20',
          'disabled:hover:border-2 disabled:hover:border-transparent disabled:hover:opacity-20 disabled:hover:outline-2 disabled:hover:outline-transparent',
        )}
        disabled={support === undefined || isBusy}
        onClick={onSubmit}
      >
        <Trans>Submit</Trans>
      </button>
    </>
  );
}

export function VoteSignalsPending() {
  return (
    <>
      <p className="m-0 p-0 text-base font-bold leading-tight">
        <Trans>Adding your feedback</Trans>
      </p>
      <img src="/loading-noggles.svg" alt="loading" className="mx-auto max-w-[60px] p-2.5" />
    </>
  );
}
