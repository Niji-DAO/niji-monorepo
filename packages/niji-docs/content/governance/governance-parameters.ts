import {
  readNijiGovernorAdjustedTotalSupply,
  readNijiGovernorGetDynamicQuorumParamsAt,
  readNijiGovernorMaxQuorumVotes,
  readNijiGovernorMinQuorumVotes,
  readNijiGovernorProposalThreshold,
  readNijiGovernorProposalUpdatablePeriodInBlocks,
  readNijiGovernorVotingDelay,
  readNijiGovernorVotingPeriod,
} from '@niji/sdk/governor';
import { readNijiTreasuryDelay, readNijiTreasuryGracePeriod } from '@niji/sdk/treasury';
import { getBlockNumber } from '@wagmi/core';

import config, { wagmiConfig } from '@/config';

export const minQuorumVotes = async () => {
  return readNijiGovernorMinQuorumVotes(wagmiConfig, {});
};

export const maxQuorumVotes = async () => {
  return readNijiGovernorMaxQuorumVotes(wagmiConfig, {});
};

export const dynamicQuorumParams = async () => {
  const currentBlockNumber = await getBlockNumber(wagmiConfig);

  return readNijiGovernorGetDynamicQuorumParamsAt(wagmiConfig, {
    args: [currentBlockNumber],
  });
};

export const adjustedTotalSupply = async () =>
  await readNijiGovernorAdjustedTotalSupply(wagmiConfig, {});

export const maxQuorumAgainstVotes = async () => {
  const { maxQuorumVotesBPS, minQuorumVotesBPS, quorumCoefficient } = await dynamicQuorumParams();

  return Math.ceil(
    (100 * Number(await adjustedTotalSupply()) * (maxQuorumVotesBPS - minQuorumVotesBPS)) /
      quorumCoefficient,
  );
};

export const quorumIncreasePerAgainstVote = async () => {
  return (
    Number((await maxQuorumVotes()) - (await minQuorumVotes())) / (await maxQuorumAgainstVotes())
  ).toFixed(2);
};

const secondsInADay = 86400;

export const updatablePeriodDurationDays = async () => {
  const updatablePeriodInBlocks = await readNijiGovernorProposalUpdatablePeriodInBlocks(
    wagmiConfig,
    {},
  );
  return (Number(updatablePeriodInBlocks) * config.mainnetBlockDurationSeconds) / secondsInADay;
};

export const pendingPeriodDurationDays = async () => {
  const pendingPeriodInBlocks = await readNijiGovernorVotingDelay(wagmiConfig, {});

  return (Number(pendingPeriodInBlocks) * config.mainnetBlockDurationSeconds) / secondsInADay;
};

export const activePeriodDurationDays = async () => {
  const activePeriodInBlocks = await readNijiGovernorVotingPeriod(wagmiConfig, {});

  return (Number(activePeriodInBlocks) * config.mainnetBlockDurationSeconds) / secondsInADay;
};

export const queuedPeriodDurationDays = async () => {
  const queuedPeriodInSeconds = await readNijiTreasuryDelay(wagmiConfig, {});
  return Number(queuedPeriodInSeconds) / secondsInADay;
};

export const gracePeriodDurationDays = async () => {
  const gracePeriodInSeconds = await readNijiTreasuryGracePeriod(wagmiConfig, {});
  return Number(gracePeriodInSeconds) / secondsInADay;
};

export const minProposalDurationDays = async () => {
  return (
    (await updatablePeriodDurationDays()) +
    (await pendingPeriodDurationDays()) +
    (await activePeriodDurationDays()) +
    (await queuedPeriodDurationDays())
  );
};

export const nounsRequiredToPropose = async () => {
  return (await readNijiGovernorProposalThreshold(wagmiConfig, {})) + 1n;
};
