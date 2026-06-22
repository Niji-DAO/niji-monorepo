import { AnimatePresence, motion } from 'motion/react';

import { ProposalCandidate } from '@/wrappers/nijiData';

import classes from './CandidateSponsors.module.css';
import SignatureForm from './SignatureForm';

type TransactionState = 'None' | 'Success' | 'Mining' | 'Fail' | 'Exception';

interface SponsorsFormOverlayProps {
  isFormDisplayed: boolean;
  candidate: ProposalCandidate;
  id: string;
  transactionState: TransactionState;
  setTransactionState: (state: TransactionState) => void;
  setIsFormDisplayed: (value: boolean) => void;
  handleRefetchCandidateData: () => void;
  setDataFetchPollInterval: (interval: number | null) => void;
  proposalIdToUpdate: number;
}

/**
 * Overlay panel that hosts the SignatureForm with motion enter/exit. Closing the overlay also
 * stops the fast-poll loop the parent had started during sign-in.
 */
export function SponsorsFormOverlay({
  isFormDisplayed,
  candidate,
  id,
  transactionState,
  setTransactionState,
  setIsFormDisplayed,
  handleRefetchCandidateData,
  setDataFetchPollInterval,
  proposalIdToUpdate,
}: SponsorsFormOverlayProps) {
  return (
    <AnimatePresence>
      {transactionState === 'Success' && (
        <div className="transactionStatus success">
          <p>Success!</p>
        </div>
      )}
      {isFormDisplayed && (
        <motion.div
          className={classes.formOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            className={classes.closeButton}
            onClick={() => {
              setIsFormDisplayed(false);
              setDataFetchPollInterval(0);
            }}
          >
            &times;
          </button>
          <SignatureForm
            id={id}
            transactionState={transactionState}
            setTransactionState={setTransactionState}
            setIsFormDisplayed={setIsFormDisplayed}
            candidate={candidate}
            handleRefetchCandidateData={handleRefetchCandidateData}
            setDataFetchPollInterval={setDataFetchPollInterval}
            proposalIdToUpdate={proposalIdToUpdate}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
