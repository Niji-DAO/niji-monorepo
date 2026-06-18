import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiStream
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nijiStreamAbi = [
  { type: 'error', inputs: [], name: 'AmountExceedsBalance' },
  { type: 'error', inputs: [], name: 'CallerNotPayer' },
  { type: 'error', inputs: [], name: 'CallerNotPayerOrRecipient' },
  { type: 'error', inputs: [], name: 'CantWithdrawZero' },
  { type: 'error', inputs: [], name: 'ETHRescueFailed' },
  { type: 'error', inputs: [], name: 'OnlyFactory' },
  { type: 'error', inputs: [], name: 'RescueTokenAmountExceedsExcessBalance' },
  { type: 'error', inputs: [], name: 'StreamNotActive' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'payer', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ETHRescued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'payer', internalType: 'address', type: 'address', indexed: true },
      { name: 'recipient', internalType: 'address', type: 'address', indexed: true },
      { name: 'recipientBalance', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'StreamCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'payer', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenAddress', internalType: 'address', type: 'address', indexed: false },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'TokensRecovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'msgSender', internalType: 'address', type: 'address', indexed: true },
      { name: 'recipient', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'TokensWithdrawn',
  },
  { type: 'function', inputs: [], name: 'cancel', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'elapsedTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  { type: 'function', inputs: [], name: 'initialize', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'payer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'recipient',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'recipientActiveBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'recipientBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'recipientCancelBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'recoverTokens',
    outputs: [{ name: 'tokensToWithdraw', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'recoverTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'remainingBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rescueETH',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'startTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stopTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenAndOutstandingBalance',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawAfterCancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawFromActiveBalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const useReadNijiStream = /*#__PURE__*/ createUseReadContract({ abi: nijiStreamAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"elapsedTime"`
 */
export const useReadNijiStreamElapsedTime = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'elapsedTime',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"factory"`
 */
export const useReadNijiStreamFactory = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'factory',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"payer"`
 */
export const useReadNijiStreamPayer = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'payer',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipient"`
 */
export const useReadNijiStreamRecipient = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipient',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientActiveBalance"`
 */
export const useReadNijiStreamRecipientActiveBalance = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientActiveBalance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientBalance"`
 */
export const useReadNijiStreamRecipientBalance = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientBalance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientCancelBalance"`
 */
export const useReadNijiStreamRecipientCancelBalance = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientCancelBalance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"remainingBalance"`
 */
export const useReadNijiStreamRemainingBalance = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'remainingBalance',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"startTime"`
 */
export const useReadNijiStreamStartTime = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'startTime',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"stopTime"`
 */
export const useReadNijiStreamStopTime = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'stopTime',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"token"`
 */
export const useReadNijiStreamToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'token',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"tokenAmount"`
 */
export const useReadNijiStreamTokenAmount = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'tokenAmount',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"tokenAndOutstandingBalance"`
 */
export const useReadNijiStreamTokenAndOutstandingBalance = /*#__PURE__*/ createUseReadContract({
  abi: nijiStreamAbi,
  functionName: 'tokenAndOutstandingBalance',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const useWriteNijiStream = /*#__PURE__*/ createUseWriteContract({ abi: nijiStreamAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteNijiStreamCancel = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'cancel',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteNijiStreamInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recoverTokens"`
 */
export const useWriteNijiStreamRecoverTokens = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'recoverTokens',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"rescueETH"`
 */
export const useWriteNijiStreamRescueEth = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'rescueETH',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteNijiStreamWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawAfterCancel"`
 */
export const useWriteNijiStreamWithdrawAfterCancel = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawAfterCancel',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawFromActiveBalance"`
 */
export const useWriteNijiStreamWithdrawFromActiveBalance = /*#__PURE__*/ createUseWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawFromActiveBalance',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const useSimulateNijiStream = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateNijiStreamCancel = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'cancel',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateNijiStreamInitialize = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recoverTokens"`
 */
export const useSimulateNijiStreamRecoverTokens = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'recoverTokens',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"rescueETH"`
 */
export const useSimulateNijiStreamRescueEth = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'rescueETH',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateNijiStreamWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawAfterCancel"`
 */
export const useSimulateNijiStreamWithdrawAfterCancel = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawAfterCancel',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawFromActiveBalance"`
 */
export const useSimulateNijiStreamWithdrawFromActiveBalance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nijiStreamAbi,
    functionName: 'withdrawFromActiveBalance',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const useWatchNijiStreamEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamAbi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"ETHRescued"`
 */
export const useWatchNijiStreamEthRescuedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'ETHRescued',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"StreamCancelled"`
 */
export const useWatchNijiStreamStreamCancelledEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'StreamCancelled',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"TokensRecovered"`
 */
export const useWatchNijiStreamTokensRecoveredEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'TokensRecovered',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"TokensWithdrawn"`
 */
export const useWatchNijiStreamTokensWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'TokensWithdrawn',
});
