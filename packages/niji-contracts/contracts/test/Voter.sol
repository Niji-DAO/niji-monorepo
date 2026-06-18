// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import { INijiDAOLogic } from '../interfaces/INijiDAOLogic.sol';

/**
 * @dev this contract is used to simulate voting via a multisig
 */
contract Voter {
    INijiDAOLogic public dao;
    uint256 public proposalId;
    uint8 public support;
    bool useReason;

    constructor(INijiDAOLogic dao_, uint256 proposalId_, uint8 support_, bool useReason_) {
        dao = dao_;
        proposalId = proposalId_;
        support = support_;
        useReason = useReason_;
    }

    function castVote() public {
        if (useReason) {
            dao.castRefundableVoteWithReason(proposalId, support, 'some reason');
        } else {
            dao.castRefundableVote(proposalId, support);
        }
    }
}
