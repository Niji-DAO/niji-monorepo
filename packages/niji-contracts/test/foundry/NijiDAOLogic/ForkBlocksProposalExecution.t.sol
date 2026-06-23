// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';
import { NijiDAOLogicBaseTest } from './NijiDAOLogicBaseTest.sol';
import { NijiDAOProposals } from '../../../contracts/governance/NijiDAOProposals.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';

abstract contract ExecutableProposalState is NijiDAOLogicBaseTest {
    address user = makeAddr('user');
    uint256 proposalId;

    function setUp() public virtual override {
        super.setUp();

        vm.startPrank(minter);
        uint256 _tokenId = nounsToken.mint();
        nounsToken.transferFrom(minter, user, _tokenId);
        vm.stopPrank();

        // ERC721Votes (OZ v5) self-delegate
        vm.prank(user);
        NijiToken(payable(address(nounsToken))).delegate(user);

        vm.roll(block.number + 1);

        // prep an executable proposal
        proposalId = propose(user, makeAddr('target'), 0, '', '', '');

        vm.roll(block.number + dao.votingDelay() + dao.proposalUpdatablePeriodInBlocks() + 1);

        vm.prank(user);
        dao.castVote(proposalId, 1);

        vm.roll(block.number + dao.votingPeriod());
        dao.queue(proposalId);

        vm.warp(block.timestamp + timelock.delay());
    }
}

contract ExecutableProposalStateTest is ExecutableProposalState {
    function test_executionWorksWhenNoActiveFork() public {
        dao.execute(proposalId);
    }
}

abstract contract ExecutableProposalWithActiveForkState is ExecutableProposalState {
    uint256[] tokenIds;

    function setUp() public virtual override {
        super.setUp();

        vm.startPrank(user);
        tokenIds = [1];
        nounsToken.approve(address(dao), 1);
        dao.escrowToFork(tokenIds, new uint256[](0), '');
        vm.stopPrank();

        dao.executeFork();
    }
}

contract ExecutableProposalWithActiveForkStateTest is ExecutableProposalWithActiveForkState {
    function test_executionRevertsDuringFork() public {
        vm.expectRevert(NijiDAOProposals.CannotExecuteDuringForkingPeriod.selector);
        dao.execute(proposalId);
    }

    function test_executionWorksAfterForkIsDone() public {
        vm.warp(dao.forkEndTimestamp() + 1);
        dao.execute(proposalId);
    }
}
