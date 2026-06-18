import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from '@wagmi/core/codegen';

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
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const readNijiStream = /*#__PURE__*/ createReadContract({ abi: nijiStreamAbi });

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"elapsedTime"`
 */
export const readNijiStreamElapsedTime = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'elapsedTime',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"factory"`
 */
export const readNijiStreamFactory = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'factory',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"payer"`
 */
export const readNijiStreamPayer = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'payer',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipient"`
 */
export const readNijiStreamRecipient = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipient',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientActiveBalance"`
 */
export const readNijiStreamRecipientActiveBalance = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientActiveBalance',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientBalance"`
 */
export const readNijiStreamRecipientBalance = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientBalance',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recipientCancelBalance"`
 */
export const readNijiStreamRecipientCancelBalance = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'recipientCancelBalance',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"remainingBalance"`
 */
export const readNijiStreamRemainingBalance = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'remainingBalance',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"startTime"`
 */
export const readNijiStreamStartTime = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'startTime',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"stopTime"`
 */
export const readNijiStreamStopTime = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'stopTime',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"token"`
 */
export const readNijiStreamToken = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'token',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"tokenAmount"`
 */
export const readNijiStreamTokenAmount = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'tokenAmount',
});

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"tokenAndOutstandingBalance"`
 */
export const readNijiStreamTokenAndOutstandingBalance = /*#__PURE__*/ createReadContract({
  abi: nijiStreamAbi,
  functionName: 'tokenAndOutstandingBalance',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const writeNijiStream = /*#__PURE__*/ createWriteContract({ abi: nijiStreamAbi });

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"cancel"`
 */
export const writeNijiStreamCancel = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'cancel',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"initialize"`
 */
export const writeNijiStreamInitialize = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recoverTokens"`
 */
export const writeNijiStreamRecoverTokens = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'recoverTokens',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"rescueETH"`
 */
export const writeNijiStreamRescueEth = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'rescueETH',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdraw"`
 */
export const writeNijiStreamWithdraw = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawAfterCancel"`
 */
export const writeNijiStreamWithdrawAfterCancel = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawAfterCancel',
});

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawFromActiveBalance"`
 */
export const writeNijiStreamWithdrawFromActiveBalance = /*#__PURE__*/ createWriteContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawFromActiveBalance',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const simulateNijiStream = /*#__PURE__*/ createSimulateContract({ abi: nijiStreamAbi });

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"cancel"`
 */
export const simulateNijiStreamCancel = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'cancel',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"initialize"`
 */
export const simulateNijiStreamInitialize = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'initialize',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"recoverTokens"`
 */
export const simulateNijiStreamRecoverTokens = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'recoverTokens',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"rescueETH"`
 */
export const simulateNijiStreamRescueEth = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'rescueETH',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdraw"`
 */
export const simulateNijiStreamWithdraw = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'withdraw',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawAfterCancel"`
 */
export const simulateNijiStreamWithdrawAfterCancel = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawAfterCancel',
});

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link nijiStreamAbi}__ and `functionName` set to `"withdrawFromActiveBalance"`
 */
export const simulateNijiStreamWithdrawFromActiveBalance = /*#__PURE__*/ createSimulateContract({
  abi: nijiStreamAbi,
  functionName: 'withdrawFromActiveBalance',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__
 */
export const watchNijiStreamEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamAbi,
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"ETHRescued"`
 */
export const watchNijiStreamEthRescuedEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'ETHRescued',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"StreamCancelled"`
 */
export const watchNijiStreamStreamCancelledEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'StreamCancelled',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"TokensRecovered"`
 */
export const watchNijiStreamTokensRecoveredEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'TokensRecovered',
});

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link nijiStreamAbi}__ and `eventName` set to `"TokensWithdrawn"`
 */
export const watchNijiStreamTokensWithdrawnEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: nijiStreamAbi,
  eventName: 'TokensWithdrawn',
});
