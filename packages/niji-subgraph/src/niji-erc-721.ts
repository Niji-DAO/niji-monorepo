import { log } from '@graphprotocol/graph-ts';

import {
  DelegateChanged,
  DelegateVotesChanged,
  NijiMinted,
  Transfer,
} from './types/NijiToken/NijiToken';
import { Noun, Seed, DelegationEvent, TransferEvent } from './types/schema';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';

export function handleNijiMinted(event: NijiMinted): void {
  const nounId = event.params.tokenId.toString();

  const seed = new Seed(nounId);
  seed.special = event.params.seed.special;
  seed.choker = event.params.seed.choker;
  seed.headphone = event.params.seed.headphone;
  seed.leftHand = event.params.seed.leftHand;
  seed.hat = event.params.seed.hat;
  seed.clothing = event.params.seed.clothing;
  seed.ear = event.params.seed.ear;
  seed.back = event.params.seed.back;
  seed.backDecoration = event.params.seed.backDecoration;
  seed.background = event.params.seed.background;
  seed.solidBackground = event.params.seed.solidBackground;
  seed.hair = event.params.seed.hair;
  seed.save();

  const noun = Noun.load(nounId);
  if (noun == null) {
    log.error('[handleNijiMinted] Noun #{} not found. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  noun.seed = seed.id;
  noun.save();
}

// Use WebAssembly global due to lack of closure support
let accountNouns: string[] = [];

export function handleDelegateChanged(event: DelegateChanged): void {
  const tokenHolder = getOrCreateAccount(event.params.delegator.toHexString());
  const previousDelegate = getOrCreateDelegate(event.params.fromDelegate.toHexString());
  const newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  accountNouns = tokenHolder.nouns;

  tokenHolder.delegate = newDelegate.id;
  tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount =
    previousDelegate.tokenHoldersRepresentedAmount - 1;
  const previousNijiRepresented = previousDelegate.nijiRepresented; // Re-assignment required to update array
  previousDelegate.nijiRepresented = previousNijiRepresented.filter(n => !accountNouns.includes(n));
  newDelegate.tokenHoldersRepresentedAmount = newDelegate.tokenHoldersRepresentedAmount + 1;
  const newNijiRepresented = newDelegate.nijiRepresented; // Re-assignment required to update array
  for (let i = 0; i < accountNouns.length; i++) {
    newNijiRepresented.push(accountNouns[i]);
  }
  newDelegate.nijiRepresented = newNijiRepresented;
  previousDelegate.save();
  newDelegate.save();

  // Log a transfer event for each Noun
  for (let i = 0; i < accountNouns.length; i++) {
    const delegateChangedEvent = new DelegationEvent(
      event.transaction.hash.toHexString() + '_' + accountNouns[i],
    );
    delegateChangedEvent.blockNumber = event.block.number;
    delegateChangedEvent.blockTimestamp = event.block.timestamp;
    delegateChangedEvent.noun = accountNouns[i];
    delegateChangedEvent.previousDelegate = previousDelegate.id
      ? previousDelegate.id
      : tokenHolder.id;
    delegateChangedEvent.delegator = tokenHolder.id.toString();
    delegateChangedEvent.newDelegate = newDelegate.id ? newDelegate.id : tokenHolder.id;
    delegateChangedEvent.save();
  }
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  const governance = getGovernanceEntity();
  const delegate = getOrCreateDelegate(event.params.delegate.toHexString());
  const votesDifference = event.params.newVotes.minus(event.params.previousVotes);

  delegate.delegatedVotesRaw = event.params.newVotes;
  delegate.delegatedVotes = event.params.newVotes;
  delegate.save();

  if (event.params.previousVotes == BIGINT_ZERO && event.params.newVotes > BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates.plus(BIGINT_ONE);
  }
  if (event.params.newVotes == BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates.minus(BIGINT_ONE);
  }
  governance.delegatedVotesRaw = governance.delegatedVotesRaw.plus(votesDifference);
  governance.delegatedVotes = governance.delegatedVotesRaw;
  governance.save();
}

let transferredNounId: string; // Use WebAssembly global due to lack of closure support
export function handleTransfer(event: Transfer): void {
  const fromHolder = getOrCreateAccount(event.params.from.toHexString());
  const toHolder = getOrCreateAccount(event.params.to.toHexString());
  const governance = getGovernanceEntity();
  transferredNounId = event.params.tokenId.toString();

  const transferEvent = new TransferEvent(
    event.transaction.hash.toHexString() + '_' + transferredNounId,
  );
  transferEvent.blockNumber = event.block.number;
  transferEvent.blockTimestamp = event.block.timestamp;
  transferEvent.noun = event.params.tokenId.toString();
  transferEvent.previousHolder = fromHolder.id.toString();
  transferEvent.newHolder = toHolder.id.toString();
  transferEvent.save();

  // fromHolder
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders.plus(BIGINT_ONE);
    governance.save();
  } else {
    const fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw.minus(BIGINT_ONE);
    fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
    const fromHolderNouns = fromHolder.nouns; // Re-assignment required to update array
    fromHolder.nouns = fromHolderNouns.filter(n => n != transferredNounId);

    if (fromHolder.delegate != null) {
      const fromHolderDelegate = getOrCreateDelegate(fromHolder.delegate as string);
      const fromHolderNijiRepresented = fromHolderDelegate.nijiRepresented; // Re-assignment required to update array
      fromHolderDelegate.nijiRepresented = fromHolderNijiRepresented.filter(
        n => n != transferredNounId,
      );
      fromHolderDelegate.save();
    }

    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error('Negative balance on holder {} with balance {}', [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (fromHolder.tokenBalanceRaw == BIGINT_ZERO && fromHolderPreviousBalance > BIGINT_ZERO) {
      governance.currentTokenHolders = governance.currentTokenHolders.minus(BIGINT_ONE);
      governance.save();
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders.plus(BIGINT_ONE);
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders.minus(BIGINT_ONE);
    governance.save();
  }

  const delegateChangedEvent = new DelegationEvent(
    event.transaction.hash.toHexString() + '_' + event.params.tokenId.toString(),
  );
  delegateChangedEvent.blockNumber = event.block.number;
  delegateChangedEvent.blockTimestamp = event.block.timestamp;
  delegateChangedEvent.noun = event.params.tokenId.toString();
  delegateChangedEvent.previousDelegate = fromHolder.delegate
    ? fromHolder.delegate!.toString()
    : fromHolder.id.toString();
  delegateChangedEvent.newDelegate = toHolder.delegate
    ? toHolder.delegate!.toString()
    : toHolder.id.toString();
  delegateChangedEvent.delegator = fromHolder.id.toString();
  delegateChangedEvent.save();

  const toHolderDelegate = getOrCreateDelegate(
    toHolder.delegate ? toHolder.delegate! : toHolder.id,
  );
  const toHolderNijiRepresented = toHolderDelegate.nijiRepresented; // Re-assignment required to update array
  toHolderNijiRepresented.push(transferredNounId);
  toHolderDelegate.nijiRepresented = toHolderNijiRepresented;
  toHolderDelegate.save();

  const toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw.plus(BIGINT_ONE);
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw.plus(BIGINT_ONE);
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;
  const toHolderNouns = toHolder.nouns; // Re-assignment required to update array
  toHolderNouns.push(event.params.tokenId.toString());
  toHolder.nouns = toHolderNouns;

  if (toHolder.tokenBalanceRaw == BIGINT_ZERO && toHolderPreviousBalance > BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders.minus(BIGINT_ONE);
    governance.save();
  } else if (toHolder.tokenBalanceRaw > BIGINT_ZERO && toHolderPreviousBalance == BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders.plus(BIGINT_ONE);
    governance.save();

    if (!toHolder.delegate) {
      toHolder.delegate = toHolder.id;
    }
  }

  let noun = Noun.load(transferredNounId);
  if (noun == null) {
    noun = new Noun(transferredNounId);
  }

  noun.owner = toHolder.id;
  noun.save();

  toHolder.save();
}
