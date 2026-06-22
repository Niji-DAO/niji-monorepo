import { ReactNode, useCallback, useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { useAddSignature } from '@/wrappers/nijiData';

/**
 * Holds the entire sign-flow state machine: waiting flags, success / error transitions,
 * date validation, overlay visibility, and addSignature status mapping.
 *
 * The container only owns the typed-data signing branch (which depends on candidate / proposalId
 * shape) and stays focused on layout.
 */
export function useSignatureFlow(args: {
  setDataFetchPollInterval: (interval: number | null) => void;
  handleRefetchCandidateData: () => void;
  signatureData?: `0x${string}`;
  isSignPending: boolean;
}) {
  const { setDataFetchPollInterval, handleRefetchCandidateData, signatureData, isSignPending } =
    args;
  const { addSignature, addSignatureState } = useAddSignature();

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isGetSignatureWaiting, setIsGetSignatureWaiting] = useState(false);
  const [isGetSignatureTxSuccessful, setIsGetSignatureTxSuccessful] = useState(false);
  const [getSignatureErrorMessage, setGetSignatureErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isTxSuccessful, setIsTxSuccessful] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ReactNode>('');
  const [dateErrorMessage, setDateErrorMessage] = useState('');

  const clearTransactionState = useCallback(() => {
    setIsWaiting(false);
    setIsLoading(false);
    setIsTxSuccessful(false);
    setErrorMessage('');
    setIsGetSignatureWaiting(false);
    setGetSignatureErrorMessage('');
    setIsGetSignatureTxSuccessful(false);
    setIsOverlayVisible(false);
    setDataFetchPollInterval(0);
  }, [setDataFetchPollInterval]);

  const handleAddSignatureState = useCallback(
    ({ errorMessage: errMsg, status }: { errorMessage?: string; status: string }) => {
      switch (status) {
        case 'None':
          setIsLoading(false);
          setIsWaiting(false);
          break;
        case 'PendingSignature':
          setIsWaiting(true);
          break;
        case 'Mining':
          setIsLoading(true);
          setIsWaiting(false);
          setDataFetchPollInterval(50);
          break;
        case 'Success':
          handleRefetchCandidateData();
          setIsTxSuccessful(true);
          setIsLoading(false);
          break;
        case 'Fail':
        case 'Exception':
          setDataFetchPollInterval(0);
          setErrorMessage(errMsg);
          setIsLoading(false);
          setIsWaiting(false);
          break;
      }
    },
    [setDataFetchPollInterval, handleRefetchCandidateData],
  );

  useEffect(() => {
    handleAddSignatureState(addSignatureState);
  }, [addSignatureState, handleAddSignatureState]);

  useEffect(() => {
    if (
      isWaiting ||
      isLoading ||
      isTxSuccessful ||
      errorMessage ||
      isGetSignatureWaiting ||
      isSignPending ||
      isGetSignatureTxSuccessful ||
      getSignatureErrorMessage
    ) {
      setIsOverlayVisible(true);
    }
  }, [
    isWaiting,
    isLoading,
    isTxSuccessful,
    errorMessage,
    isGetSignatureWaiting,
    isSignPending,
    isGetSignatureTxSuccessful,
    getSignatureErrorMessage,
  ]);

  useEffect(() => {
    if (signatureData && isGetSignatureWaiting) {
      setIsGetSignatureWaiting(false);
      setIsGetSignatureTxSuccessful(true);
    }
  }, [signatureData, isGetSignatureWaiting]);

  const validateExpirationDate = useCallback((expirationDate: number | undefined) => {
    if (expirationDate === undefined) return;
    const today = new Date();
    if (+dayjs(expirationDate) > +dayjs(today) / 1000) {
      setDateErrorMessage('');
    } else {
      setDateErrorMessage('Date must be in the future');
    }
  }, []);

  return {
    addSignature,
    addSignatureState,
    isOverlayVisible,
    isGetSignatureWaiting,
    setIsGetSignatureWaiting,
    isGetSignatureTxSuccessful,
    setIsGetSignatureTxSuccessful,
    getSignatureErrorMessage,
    setGetSignatureErrorMessage,
    isLoading,
    isWaiting,
    setIsWaiting,
    isTxSuccessful,
    errorMessage,
    dateErrorMessage,
    validateExpirationDate,
    clearTransactionState,
  };
}
