// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import '../governance/NijiDAOLogicV4.sol';
import { NijiDAOAdmin } from '../governance/NijiDAOAdmin.sol';

/**
 * @dev A modified version of NijiDAOLogicV4 that exposes the `initialize` function for testing purposes.
 * The modification removes bounds checks on parameters, so we can dramatically shorten test scenarios setup.
 */
contract NijiDAOLogicV3Harness is NijiDAOLogicV4 {
    using NijiDAOAdmin for Storage;

    function initialize(
        address timelock_,
        address nouns_,
        address forkEscrow_,
        address forkDAODeployer_,
        address vetoer_,
        NijiDAOParams calldata daoParams_,
        DynamicQuorumParams calldata dynamicQuorumParams_
    ) public override {
        if (address(ds.timelock) != address(0)) revert CanOnlyInitializeOnce();
        if (msg.sender != ds.admin) revert AdminOnly();
        if (timelock_ == address(0)) revert InvalidTimelockAddress();
        if (nouns_ == address(0)) revert InvalidNijiAddress();

        ds.votingPeriod = daoParams_.votingPeriod;
        ds.votingDelay = daoParams_.votingDelay;
        ds.proposalThresholdBPS = daoParams_.proposalThresholdBPS;
        ds.timelock = INijiDAOExecutorV2(timelock_);
        ds.nouns = NijiTokenLike(nouns_);
        ds.forkEscrow = INijiDAOForkEscrow(forkEscrow_);
        ds.forkDAODeployer = IForkDAODeployer(forkDAODeployer_);
        ds.vetoer = vetoer_;
        NijiDAOAdmin._setDynamicQuorumParams(
            dynamicQuorumParams_.minQuorumVotesBPS,
            dynamicQuorumParams_.maxQuorumVotesBPS,
            dynamicQuorumParams_.quorumCoefficient
        );
        NijiDAOAdmin._setLastMinuteWindowInBlocks(daoParams_.lastMinuteWindowInBlocks);
        NijiDAOAdmin._setObjectionPeriodDurationInBlocks(daoParams_.objectionPeriodDurationInBlocks);
        NijiDAOAdmin._setProposalUpdatablePeriodInBlocks(daoParams_.proposalUpdatablePeriodInBlocks);
    }
}
