// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';

import { DeployUtilsFork } from '../../helpers/DeployUtilsFork.sol';
import { NounsTokenFork } from '../../../../contracts/governance/fork/newdao/token/NounsTokenFork.sol';
import { NijiDAOExecutorV2 } from '../../../../contracts/governance/NijiDAOExecutorV2.sol';
import { NijiDAOLogicV1Fork } from '../../../../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';
import { NijiAuctionHouseFork } from '../../../../contracts/governance/fork/newdao/NijiAuctionHouseFork.sol';
import { UUPSUpgradeable } from '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';

contract ForkDAODeployerTest is DeployUtilsFork {
    NijiDAOLogicV1Fork dao;
    NijiDAOExecutorV2 treasury;
    NounsTokenFork token;
    NijiAuctionHouseFork auction;

    function setUp() public {
        (address treasuryAddress, address tokenAddress, address daoAddress) = _deployForkDAO();

        token = NounsTokenFork(tokenAddress);
        auction = NijiAuctionHouseFork(token.minter());
        dao = NijiDAOLogicV1Fork(daoAddress);
        treasury = NijiDAOExecutorV2(payable(treasuryAddress));
    }

    function test_token_nonTreasuryCannotUpgrade() public {
        NounsTokenFork newLogic = new NounsTokenFork();

        vm.expectRevert('Ownable: caller is not the owner');
        token.upgradeTo(address(newLogic));
    }

    function test_token_treasuryCanUpgrade() public {
        NounsTokenFork newLogic = new NounsTokenFork();

        vm.prank(address(treasury));
        token.upgradeTo(address(newLogic));

        assertEq(get1967Implementation(address(token)), address(newLogic));
    }

    function test_auction_nonTreasuryCannotUpgrade() public {
        NijiAuctionHouseFork newLogic = new NijiAuctionHouseFork();

        vm.expectRevert('Ownable: caller is not the owner');
        auction.upgradeTo(address(newLogic));
    }

    function test_auction_treasuryCanUpgrade() public {
        NijiAuctionHouseFork newLogic = new NijiAuctionHouseFork();

        vm.prank(address(treasury));
        auction.upgradeTo(address(newLogic));

        assertEq(get1967Implementation(address(auction)), address(newLogic));
    }

    function test_dao_nonTreasuryCannotUpgrade() public {
        NijiDAOLogicV1Fork newLogic = new NijiDAOLogicV1Fork();

        vm.expectRevert('NijiDAO::_authorizeUpgrade: admin only');
        dao.upgradeTo(address(newLogic));
    }

    function test_dao_treasuryCanUpgrade() public {
        NijiDAOLogicV1Fork newLogic = new NijiDAOLogicV1Fork();

        vm.prank(address(treasury));
        dao.upgradeTo(address(newLogic));

        assertEq(get1967Implementation(address(dao)), address(newLogic));
    }

    function test_treasury_nonTreasuryCannotUpgrade() public {
        NijiDAOExecutorV2 newLogic = new NijiDAOExecutorV2();

        vm.expectRevert('NijiDAOExecutor::_authorizeUpgrade: Call must come from NijiDAOExecutor.');
        treasury.upgradeTo(address(newLogic));
    }

    function test_treasury_treasuryCanUpgrade() public {
        NijiDAOExecutorV2 newLogic = new NijiDAOExecutorV2();

        vm.prank(address(treasury));
        treasury.upgradeTo(address(newLogic));

        assertEq(get1967Implementation(address(treasury)), address(newLogic));
    }

    function test_govContractParams() public {
        assertEq(dao.votingPeriod(), FORK_DAO_VOTING_PERIOD);
        assertEq(dao.votingDelay(), FORK_DAO_VOTING_DELAY);
        assertEq(dao.proposalThresholdBPS(), FORK_DAO_PROPOSAL_THRESHOLD_BPS);
        assertEq(dao.quorumVotesBPS(), FORK_DAO_QUORUM_VOTES_BPS);
    }
}
