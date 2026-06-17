// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import { DeployUtilsV3 } from './DeployUtilsV3.sol';
import { NijiDAOExecutorV2 } from '../../../contracts/governance/NijiDAOExecutorV2.sol';
import { ForkDAODeployer } from '../../../contracts/governance/fork/ForkDAODeployer.sol';
import { NounsTokenFork } from '../../../contracts/governance/fork/newdao/token/NounsTokenFork.sol';
import { NijiAuctionHouseFork } from '../../../contracts/governance/fork/newdao/NijiAuctionHouseFork.sol';
import { NijiDAOLogicV1Fork } from '../../../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';
import { INijiDAOForkEscrow } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { INijiDAOLogic } from '../../../contracts/interfaces/INijiDAOLogic.sol';

abstract contract DeployUtilsFork is DeployUtilsV3 {
    function _deployForkDAO(INijiDAOForkEscrow escrow) public returns (address treasury, address token, address dao) {
        ForkDAODeployer deployer = new ForkDAODeployer(
            address(new NounsTokenFork()),
            address(new NijiAuctionHouseFork()),
            address(new NijiDAOLogicV1Fork()),
            address(new NijiDAOExecutorV2()),
            DELAYED_GOV_DURATION,
            FORK_DAO_VOTING_PERIOD,
            FORK_DAO_VOTING_DELAY,
            FORK_DAO_PROPOSAL_THRESHOLD_BPS,
            FORK_DAO_QUORUM_VOTES_BPS
        );

        (treasury, token) = deployer.deployForkDAO(block.timestamp + FORK_PERIOD, escrow);
        dao = NijiDAOExecutorV2(payable(treasury)).admin();
    }

    function _deployForkDAO() public returns (address treasury, address token, address dao) {
        INijiDAOLogic originalDAO = _deployDAOV3();
        return _deployForkDAO(originalDAO.forkEscrow());
    }
}
