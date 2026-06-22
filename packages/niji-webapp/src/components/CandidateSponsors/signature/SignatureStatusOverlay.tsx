import { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { CheckCircle2, X } from 'lucide-react';
import { Spinner } from 'react-bootstrap';

import link from '@/assets/icons/Link.svg';
import { buildEtherscanTxLink } from '@/utils/etherscan';

import classes from '../CandidateSponsors.module.css';

interface SignatureStatusOverlayProps {
  isOverlayVisible: boolean;
  isWaiting: boolean;
  isLoading: boolean;
  isTxSuccessful: boolean;
  isGetSignatureWaiting: boolean;
  isGetSignaturePending: boolean;
  isGetSignatureTxSuccessful: boolean;
  isSignPending: boolean;
  errorMessage: ReactNode;
  getSignatureErrorMessage: string;
  transactionHash?: string;
  onTryAgain: () => void;
  onClose: () => void;
}

/**
 * Status overlay that shows progress / success / error across the 2-step sign flow.
 * 1. signature request (wallet sign)
 * 2. submit signature (on-chain tx)
 */
export function SignatureStatusOverlay({
  isOverlayVisible,
  isWaiting,
  isLoading,
  isTxSuccessful,
  isGetSignatureWaiting,
  isGetSignaturePending,
  isGetSignatureTxSuccessful,
  isSignPending,
  errorMessage,
  getSignatureErrorMessage,
  transactionHash,
  onTryAgain,
  onClose,
}: SignatureStatusOverlayProps) {
  if (!isOverlayVisible) return null;

  const isBusy = isWaiting || isGetSignatureWaiting || isLoading || isGetSignaturePending;

  return (
    <div className={classes.submitSignatureStatusOverlay}>
      <span className={clsx(isBusy && classes.loadingButton)}>
        {isBusy && (
          <img
            src="/loading-noggles.svg"
            alt="loading"
            className={classes.transactionModalSpinner}
          />
        )}
        {isGetSignatureWaiting && 'Awaiting signature'}
        {isWaiting && 'Awaiting confirmation'}
        {isSignPending && 'Confirming signature'}
        {isLoading && 'Submitting signature'}
      </span>

      {(getSignatureErrorMessage || errorMessage) && (
        <p className={clsx(classes.statusMessage, classes.errorMessage)}>
          {getSignatureErrorMessage || errorMessage}
          <button type="button" onClick={onTryAgain}>
            Try again
          </button>
        </p>
      )}

      {isTxSuccessful && (
        <p className={clsx(classes.statusMessage, classes.successMessage)}>
          <a
            href={transactionHash ? buildEtherscanTxLink(transactionHash) : undefined}
            target="_blank"
            rel="noreferrer"
          >
            Signature added successfully
            {transactionHash && <img src={link} width={16} alt="link symbol" />}
          </a>
        </p>
      )}

      <ul className={classes.steps}>
        <li>
          <strong>
            {(isGetSignatureWaiting || isSignPending) && (
              <span className={classes.spinner}>
                <Spinner animation="border" />
              </span>
            )}
            {isGetSignatureTxSuccessful && <CheckCircle2 height={20} width={20} color="green" />}
            {getSignatureErrorMessage && <X height={20} width={20} color="red" />}
          </strong>
          <Trans>Signature request</Trans>
        </li>
        <li>
          <strong>
            {(isWaiting || isLoading) && (
              <span className={classes.spinner}>
                <Spinner animation="border" />
              </span>
            )}
            {isTxSuccessful && <CheckCircle2 height={20} width={20} color="green" />}
            {(getSignatureErrorMessage || errorMessage) && <X height={20} width={20} color="red" />}
            {!(
              isWaiting ||
              isLoading ||
              isTxSuccessful ||
              errorMessage ||
              getSignatureErrorMessage
            ) && <span className={classes.placeholder}></span>}
          </strong>
          <Trans>Submit signature</Trans>
        </li>
      </ul>

      {isTxSuccessful && (
        <button type="button" className={classes.closeButton} onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
}
