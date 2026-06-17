// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { NijiDAOLogicV1Fork } from '../../../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';

contract MaliciousForkDAOQuitter {
    NijiDAOLogicV1Fork public dao;
    uint256[] public tokenIds;
    bool triedReentry;

    constructor(NijiDAOLogicV1Fork dao_) {
        dao = dao_;
    }

    function setTokenIds(uint256[] calldata tokenIds_) external {
        tokenIds = tokenIds_;
    }

    receive() external payable {
        if (!triedReentry) {
            triedReentry = true;
            dao.quit(tokenIds);
        }
    }
}
