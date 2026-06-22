import clsx from 'clsx';
import dayjs from 'dayjs';

import classes from '../CandidateSponsors.module.css';

interface SignatureFormFieldsProps {
  reasonText: string;
  setReasonText: (value: string) => void;
  setExpirationDate: (value: number) => void;
  expirationDate: number | undefined;
  dateErrorMessage: string;
  isWaiting: boolean;
  isLoading: boolean;
  proposalIdToUpdate: number;
  transactionState: string;
  onSign: () => void;
}

/**
 * Reason textarea + expiration date input + sign button.
 */
export function SignatureFormFields({
  reasonText,
  setReasonText,
  setExpirationDate,
  expirationDate,
  dateErrorMessage,
  isWaiting,
  isLoading,
  proposalIdToUpdate,
  transactionState,
  onSign,
}: SignatureFormFieldsProps) {
  return (
    <>
      <div className={clsx(classes.fields, (isWaiting || isLoading) && classes.disabled)}>
        <h4 className={classes.formLabel}>Sponsor this proposal candidate</h4>
        <textarea
          placeholder="Optional reason"
          value={reasonText}
          onChange={event => setReasonText(event.target.value)}
          disabled={isWaiting || isLoading}
        />

        <h4 className={classes.formLabel}>Expiration date (required)</h4>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setExpirationDate(+dayjs(e.target.value).unix())}
          disabled={isWaiting || isLoading}
        />
        {dateErrorMessage && <p className={classes.dateErrorMessage}>{dateErrorMessage}</p>}
      </div>
      <div className="text-center">
        {isWaiting || isLoading ? (
          <img src="/loading-noggles.svg" alt="loading" className={classes.loadingNoggles} />
        ) : (
          <button
            type="button"
            className={classes.button}
            onClick={onSign}
            disabled={
              transactionState === 'Mining' ||
              expirationDate === undefined ||
              dateErrorMessage !== ''
            }
          >
            {proposalIdToUpdate ? 'Re-sign' : 'Sponsor'}
          </button>
        )}
      </div>
    </>
  );
}
