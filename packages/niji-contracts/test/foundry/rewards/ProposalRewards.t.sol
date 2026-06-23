// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { NijiDAOLogicBaseTest } from '../NijiDAOLogic/NijiDAOLogicBaseTest.sol';
import { ERC20Mock } from '../helpers/ERC20Mock.sol';
import { Rewards } from '../../../contracts/client-incentives/Rewards.sol';
import { INijiAuctionHouseV2 } from '../../../contracts/interfaces/INijiAuctionHouseV2.sol';
import { NijiAuctionHouseProxy } from '../../../contracts/proxies/NijiAuctionHouseProxy.sol';
import { RewardsDeployer } from '../../../script/Rewards/RewardsDeployer.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';
import 'forge-std/Test.sol';

abstract contract BaseProposalRewardsTest is NijiDAOLogicBaseTest {
    Rewards rewards;
    ERC20Mock erc20Mock = new ERC20Mock();
    INijiAuctionHouseV2 auctionHouse;

    address admin = makeAddr('admin');
    address bidder1 = makeAddr('bidder1');
    address bidder2 = makeAddr('bidder2');
    address client1Wallet = makeAddr('client1Wallet');
    uint32 clientId1;
    uint32 clientId2;
    uint32[] votingClientIds;
    Rewards.AuctionRewardParams auctionParams;
    Rewards.ProposalRewardParams proposalParams;

    uint256 constant SECONDS_IN_BLOCK = 12;

    function setUp() public virtual override {
        _setUpDAO();

        vm.deal(bidder1, 1000 ether);
        vm.deal(bidder2, 1000 ether);

        // need at least one settled auction
        bidAndSettleAuction(1 ether);
        bidAndSettleAuction(bidder2, 1 ether);
        mineBlocks(1);

        // increase total supply to > 10
        while (nounsToken.totalSupply() < 10) {
            bidAndSettleAuction({ bidAmount: 1 ether });
        }

        // Niji ... 旧 Nouns で noundersDAO に 10 件毎 (tokenId 0/10/20...) 自動 distribute されていた
        // 想定で noundersDAO → bidder2 への transferFrom が必要だったが、
        // Niji 仕様で founder distribution は廃止、 該当 transferFrom は不要 (削除)。

        // ERC721Votes (OZ v5) self-delegate (bidder1 / bidder2 が token 受領済)
        // Niji ... ERC721Votes は token 受領時 delegatee=address(0) で受け取り、 後から delegate で votes 移動。
        // propose 時の getPriorVotes(at block-1) で 0 になるのを防ぐため delegate 後 mineBlocks(1) 必須。
        vm.prank(bidder1);
        NijiToken(payable(address(nounsToken))).delegate(bidder1);
        vm.prank(bidder2);
        NijiToken(payable(address(nounsToken))).delegate(bidder2);
        mineBlocks(1);

        rewards = RewardsDeployer.deployRewards(dao, admin, minter, address(erc20Mock), address(0));

        vm.prank(address(dao.timelock()));
        rewards.setProposalRewardParams(
            Rewards.ProposalRewardParams({
                minimumRewardPeriod: 2 weeks,
                numProposalsEnoughForReward: 30,
                proposalRewardBps: 100,
                votingRewardBps: 50,
                proposalEligibilityQuorumBps: 1000
            })
        );

        vm.prank(address(dao.timelock()));
        rewards.enableProposalRewards();

        vm.prank(client1Wallet);
        clientId1 = rewards.registerClient('client1', 'client1 description');
        clientId2 = rewards.registerClient('client2', 'client2 description');

        erc20Mock.mint(address(rewards), 100 ether);

        vm.prank(rewards.owner());
        rewards.setClientApproval(clientId1, true);
    }

    function _setUpDAO() internal {
        dao = _deployDAOV3WithParams({ auctionDuration: 24 hours });
        nounsToken = dao.nouns();
        minter = nounsToken.minter();

        auctionHouse = INijiAuctionHouseV2(minter);
        vm.prank(address(dao.timelock()));
        auctionHouse.unpause();
    }

    function proposeVoteAndEndVotingPeriod(uint32 clientId) internal returns (uint32) {
        uint32 proposalId = proposeAndVote(clientId);
        mineBlocks(VOTING_PERIOD);
        return proposalId;
    }

    function proposeAndVote(uint32 clientId) internal returns (uint32) {
        uint256 proposalId = propose(bidder1, address(1), 1 ether, '', '', 'my proposal', clientId);
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
        vote(bidder1, proposalId, 1, 'i support');
        return uint32(proposalId);
    }

    function bidAndSettleAuction(address bidder, uint256 bidAmount) internal returns (uint256) {
        uint256 nounId = auctionHouse.auction().nounId;

        vm.prank(bidder);
        auctionHouse.createBid{ value: bidAmount }(nounId);

        return fastforwardAndSettleAuction();
    }

    function bidAndSettleAuction(uint256 bidAmount) internal returns (uint256) {
        return bidAndSettleAuction(bidder1, bidAmount);
    }

    function fastforwardAndSettleAuction() internal returns (uint256) {
        uint256 nounId = auctionHouse.auction().nounId;

        uint256 blocksToEnd = (auctionHouse.auction().endTime - block.timestamp) / SECONDS_IN_BLOCK + 1;
        mineBlocks(blocksToEnd);
        auctionHouse.settleCurrentAndCreateNewAuction();

        return nounId;
    }

    function settleAuction() internal returns (uint256 settledNounId) {
        settledNounId = auctionHouse.auction().nounId;
        auctionHouse.settleCurrentAndCreateNewAuction();
    }

    function mineBlocks(uint256 numBlocks) internal {
        vm.roll(block.number + numBlocks);
        vm.warp(block.timestamp + numBlocks * SECONDS_IN_BLOCK);
    }

    function vote(address voter_, uint256 proposalId_, uint8 support, string memory reason) internal {
        vm.prank(voter_);
        dao.castRefundableVoteWithReason(proposalId_, support, reason);
    }

    function vote(address voter_, uint256 proposalId_, uint8 support, string memory reason, uint32 clientId) internal {
        vm.prank(voter_);
        dao.castRefundableVoteWithReason(proposalId_, support, reason, clientId);
    }
}

contract DisablingTest is BaseProposalRewardsTest {
    function test_rewardsAreDisabledByDefault() public {
        rewards = RewardsDeployer.deployRewards(dao, admin, minter, address(erc20Mock), address(0));
        assertFalse(rewards.proposalRewardsEnabled());
    }

    function test_disableRewards_revertsForNonOwner() public {
        vm.prank(makeAddr('rando'));
        vm.expectRevert('Ownable: caller is not the owner');
        rewards.disableProposalRewards();
    }

    function test_disableRewards_worksForOwner() public {
        vm.prank(rewards.owner());
        rewards.disableProposalRewards();

        assertFalse(rewards.proposalRewardsEnabled());
    }
}

contract DisabledTest is BaseProposalRewardsTest {
    function setUp() public override {
        super.setUp();
        vm.prank(rewards.owner());
        rewards.disableProposalRewards();
    }

    function test_updateRewardsReverts() public {
        vm.expectRevert(Rewards.RewardsDisabled.selector);
        rewards.updateRewardsForProposalWritingAndVoting(5, votingClientIds);
    }
}

contract ProposalRewardsTest is BaseProposalRewardsTest {
    function test_revertsIfNoAuctionRevenue() public {
        fastforwardAndSettleAuction();
        fastforwardAndSettleAuction();

        vm.warp(block.timestamp + 2 weeks + 1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        votingClientIds = [0];
        vm.expectRevert('auctionRevenue must be > 0');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_revertsIfProposalsNotDoneWithVoting() public {
        bidAndSettleAuction({ bidAmount: 5 ether });

        vm.warp(block.timestamp + 2 weeks + 1);
        uint32 proposalId = proposeAndVote(clientId1);

        settleAuction();
        votingClientIds = [0];
        vm.expectRevert('all proposals must be done with voting');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_revertsIfProposalWithNoVotesYetIsNotDoneWithVoting() public {
        bidAndSettleAuction({ bidAmount: 5 ether });

        vm.warp(block.timestamp + 2 weeks + 1);
        proposeVoteAndEndVotingPeriod(clientId1);
        uint256 proposalId2 = propose(bidder1, address(1), 1 ether, '', '', 'my proposal', clientId1);

        settleAuction();
        votingClientIds = [0];
        vm.expectRevert('all proposals must be done with voting');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: uint32(proposalId2),
            votingClientIds: votingClientIds
        });
    }

    function test_rewardsAfterMinimumRewardPeriod() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        votingClientIds = [0];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.15 ether); // 15 eth * 1%
    }

    function test_refundsGas() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        votingClientIds = [0];

        uint256 startGas = gasleft();
        vm.fee(100 gwei);
        vm.txGasPrice(100 gwei);
        vm.prank(makeAddr('caller'), makeAddr('caller tx.origin'));
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
        uint256 gasUsed = startGas - gasleft();
        uint256 approxEthRefunded = (gasUsed + 36000) * 100 gwei;

        assertApproxEqAbs(erc20Mock.balanceOf(makeAddr('caller tx.origin')), approxEthRefunded, 0.01 ether);
    }

    function test_allVotingClientIdsMustHaveVotes() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        votingClientIds = [0, 2];
        vm.expectRevert('all clientId must have votes');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_votingClientIdsMustBeSorted() public {
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        votingClientIds = [0, 5, 4];
        vm.expectRevert('must be sorted & unique');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_votingClientIdsMustBeUnique() public {
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        votingClientIds = [0, 0];
        vm.expectRevert('must be sorted & unique');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        votingClientIds = [0, 1, 0];
        vm.expectRevert('must be sorted & unique');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_doesntRewardIneligibleProposals() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        propose(bidder2, address(1), 1 ether, '', '', 'my proposal', clientId1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId2);

        settleAuction();
        votingClientIds = [0];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0 ether);
        assertEq(rewards.clientBalance(clientId2), 0.15 ether); // 15 eth * 1%
    }

    function test_onlyEligibleProposalsCanSetTheRewardsPeriod() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        proposeVoteAndEndVotingPeriod(clientId2);

        settleAuction();
        bidAndSettleAuction({ bidAmount: 100 ether });

        // trying to create a bogus proposal to capture the high auction as reward
        uint32 proposalId = uint32(propose(bidder2, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + VOTING_PERIOD + 1);

        votingClientIds = [0];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId2), 0.15 ether); // 15 eth * 1%
    }

    function test_cantUseIneligibleProposalToPassTheMinimumPeriod() public {
        // The state in this test:
        // Number of eligible proposals < `numProposalsEnoughForReward`
        // The last proposal is after `minimumRewardPeriod`, but it's not eligible, so it shouldn't
        // be considered when looking at how much time passed.
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        proposeVoteAndEndVotingPeriod(clientId2);

        vm.warp(startTimestamp + 2 weeks + 1);

        // bogus proposal no one will vote on
        uint32 proposalId = uint32(propose(bidder2, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + VOTING_PERIOD + 1);

        votingClientIds = [0];
        vm.expectRevert('not enough time passed');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_splitsRewardsBetweenEligibleProposals() public {
        uint256 firstAuctionId = rewards.nextProposalRewardFirstAuctionId();
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        uint256 lastAuctionId = bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        proposeVoteAndEndVotingPeriod(clientId1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId2);

        settleAuction();
        votingClientIds = [0];

        // Niji ... rewardPerVote actual 3.75e15 (founder distribution 廃止反映)
        vm.expectEmit();
        emit Rewards.ProposalRewardsUpdated(
            1,
            2,
            firstAuctionId,
            lastAuctionId,
            15 ether,
            0.075 ether,
            3750000000000000
        );
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.075 ether); // 15 eth * 1% / 2
        assertEq(rewards.clientBalance(clientId2), 0.075 ether); // 15 eth * 1% / 2
    }

    function test_givenClientIdAboveTotalSupply_skipsIt() public {
        uint256 firstAuctionId = rewards.nextProposalRewardFirstAuctionId();
        uint256 startTimestamp = block.timestamp;
        uint32 badClientId = rewards.nextTokenId();

        bidAndSettleAuction({ bidAmount: 5 ether });
        uint256 lastAuctionId = bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        proposeVoteAndEndVotingPeriod(clientId1);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(badClientId);

        settleAuction();
        votingClientIds = [0];

        // Niji ... rewardPerVote actual 3.75e15
        vm.expectEmit();
        emit Rewards.ProposalRewardsUpdated(
            1,
            2,
            firstAuctionId,
            lastAuctionId,
            15 ether,
            0.075 ether,
            3750000000000000
        );
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.075 ether); // 15 eth * 1% / 2
    }

    function test_doesntRewardIfMinimumPeriodHasntPassed() public {
        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks - 10);

        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();

        votingClientIds = [0];
        vm.expectRevert('not enough time passed');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_rewardsIfMinimumNumberOfProposalsWereCreated_evenIfMinimumPeriodHasntPassed() public {
        // set numProposalsEnoughForReward to 1
        vm.prank(address(dao.timelock()));
        rewards.setProposalRewardParams(
            Rewards.ProposalRewardParams({
                minimumRewardPeriod: 2 weeks,
                numProposalsEnoughForReward: 1,
                proposalRewardBps: 100,
                votingRewardBps: 50,
                proposalEligibilityQuorumBps: 1000
            })
        );

        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 5 ether });
        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks - 10);

        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();

        votingClientIds = [0];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
        assertEq(rewards.clientBalance(clientId1), 0.15 ether); // 15 eth * 1%
    }
}

contract ProposalRewardsEligibilityTest is BaseProposalRewardsTest {
    uint256 lastNounId;
    uint32 proposalId;

    function setUp() public virtual override {
        super.setUp();

        uint256 startTimestamp = block.timestamp;
        bidAndSettleAuction({ bidAmount: 5 ether });
        vm.warp(startTimestamp + 2 weeks + 1);
        proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        lastNounId = settleAuction();

        // Niji ... Nounders auto-distribution 廃止のため totalSupply 12 → 11、 bidder1 votes 8 → 9 (snapshot timing で settleAuction 前)。
        assertEq(nounsToken.totalSupply(), 11);
        assertEq(nounsToken.getCurrentVotes(bidder1), 9);

        votingClientIds = [0];
    }

    function test_ineligibleIfBelowQuorum() public {
        // Niji ... quorum を totalSupply (11) のほぼ全数に設定して proposal を ineligible に。
        proposalParams.proposalEligibilityQuorumBps = 10000;
        vm.prank(address(dao.timelock()));
        rewards.setProposalRewardParams(proposalParams);

        vm.expectRevert('at least one eligible proposal');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_eligibleIfAboveQuorum() public {
        // Niji ... 7000 BPS で (11 * 7000 / 10000) = 7 quorum、 bidder1 vote=9 で eligible。
        proposalParams.proposalEligibilityQuorumBps = 7000;
        vm.prank(address(dao.timelock()));
        rewards.setProposalRewardParams(proposalParams);

        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_canceledProposalsAreIneligible() public {
        // Niji ... 7000 BPS で eligible だが cancel で ineligible に降格する流れを確認。
        proposalParams.proposalEligibilityQuorumBps = 7000;
        vm.prank(address(dao.timelock()));
        rewards.setProposalRewardParams(proposalParams);

        vm.prank(bidder1);
        dao.cancel(proposalId);

        vm.expectRevert('at least one eligible proposal');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }
}

contract AfterOneSuccessfulRewardsDistributionTest is BaseProposalRewardsTest {
    uint256 lastProposalCreationTimestamp;

    function setUp() public virtual override {
        super.setUp();

        uint256 startTimestamp = block.timestamp;

        bidAndSettleAuction({ bidAmount: 10 ether });

        vm.warp(startTimestamp + 2 weeks + 1);
        lastProposalCreationTimestamp = block.timestamp;
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        votingClientIds = [0];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.1 ether); // 10 eth * 1%
    }

    function test_revertsIfMinimumPeriodHasntPassedAgain() public {
        bidAndSettleAuction({ bidAmount: 5 ether });

        vm.warp(lastProposalCreationTimestamp + 2 weeks - 10);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        vm.expectRevert('not enough time passed');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_rewardsIfMinimumPeriodPassedAgain() public {
        bidAndSettleAuction({ bidAmount: 5 ether });

        vm.warp(lastProposalCreationTimestamp + 2 weeks + 10);
        uint32 proposalId = proposeVoteAndEndVotingPeriod(clientId1);

        settleAuction();
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.15 ether);
    }

    function test_clientCanWithdrawBalance() public {
        vm.prank(client1Wallet);
        vm.expectEmit();
        emit Rewards.ClientBalanceWithdrawal(clientId1, 0.05 ether, client1Wallet);
        rewards.withdrawClientBalance(clientId1, client1Wallet, 0.05 ether);

        assertEq(erc20Mock.balanceOf(client1Wallet), 0.05 ether);
    }

    function test_withdrawingMoreThanBalanceReverts() public {
        uint96 balance = rewards.clientBalance(clientId1);
        vm.prank(client1Wallet);
        vm.expectRevert('amount too large');
        rewards.withdrawClientBalance(clientId1, client1Wallet, balance + 1);
    }

    function test_withdrawingUpdatesBalance() public {
        uint96 balance = rewards.clientBalance(clientId1);

        vm.prank(client1Wallet);
        rewards.withdrawClientBalance(clientId1, client1Wallet, balance);

        vm.prank(client1Wallet);
        vm.expectRevert('amount too large');
        rewards.withdrawClientBalance(clientId1, client1Wallet, 1);
    }

    function test_withdraw_revertsIfNotClientIdOwner() public {
        vm.expectRevert(Rewards.OnlyNFTOwner.selector);
        rewards.withdrawClientBalance(clientId1, client1Wallet, 1);
    }
}

contract VotesRewardsTest is BaseProposalRewardsTest {
    uint32 proposalId;
    uint32[] expectedClientIds;

    function setUp() public virtual override {
        super.setUp();

        uint256 startTimestamp = block.timestamp;
        bidAndSettleAuction({ bidAmount: 15 ether });
        vm.warp(startTimestamp + 2 weeks + 1);

        proposalId = uint32(propose(bidder1, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
    }

    function test_singleClientVotingGetsAllTheRewards() public {
        vote(bidder1, proposalId, 1, 'i support', clientId1);
        mineBlocks(VOTING_PERIOD);

        settleAuction();
        votingClientIds = [clientId1];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        // Niji ... 9 votes / round-off で 3 wei 不足
        assertEq(rewards.clientBalance(clientId1), 74999999999999997); // 15 eth * 0.5% (round-off)
    }

    function test_rewardSplitBetweenTwoClients() public {
        // cast 9 votes (Niji ... founder distribution 廃止で bidder1 が 9 件保有)
        assertEq(nounsToken.getCurrentVotes(bidder1), 9);
        vote(bidder1, proposalId, 1, 'i support', clientId1);

        // cast 1 vote
        assertEq(nounsToken.getCurrentVotes(bidder2), 1);
        vote(bidder2, proposalId, 1, 'i support', clientId2);

        mineBlocks(VOTING_PERIOD);

        settleAuction();
        votingClientIds = [clientId1, clientId2];
        // 9:1 比率 = 67.5e15 / 7.5e15
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId1, 0.0675 ether);
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId2, 0.0075 ether);
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.0675 ether); // 15 eth * 0.5% * (9/10)
        assertEq(rewards.clientBalance(clientId2), 0.0075 ether); // 15 eth * 0.5% * (1/10)
    }

    function test_givenAnInvalidClientId_skipsIt() public {
        uint32 badClientId = rewards.nextTokenId();

        // cast 9 votes (Niji ... founder distribution 廃止)
        assertEq(nounsToken.getCurrentVotes(bidder1), 9);
        vote(bidder1, proposalId, 1, 'i support', clientId1);

        // cast 1 vote
        assertEq(nounsToken.getCurrentVotes(bidder2), 1);
        vote(bidder2, proposalId, 1, 'i support', clientId2);

        uint32 proposalId2 = uint32(propose(bidder2, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
        vote(bidder1, proposalId2, 1, 'i support', badClientId);
        vote(bidder2, proposalId2, 1, 'i support', badClientId);

        mineBlocks(VOTING_PERIOD);

        settleAuction();
        votingClientIds = [clientId1, clientId2, badClientId];
        // 9:1 比率 (10 votes total / 20 votes (2 proposal) = 比率 9/20:1/20)
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId1, 0.03375 ether);
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId2, 0.00375 ether);
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId2,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.03375 ether); // 15 eth * 0.5% * (9/20)
        assertEq(rewards.clientBalance(clientId2), 0.00375 ether); // 15 eth * 0.5% * (1/20)
    }

    function test_givenAProposalWhereNotAllClientContributed_updateRewardsWorks() public {
        // cast 9 votes (Niji ... founder distribution 廃止)
        assertEq(nounsToken.getCurrentVotes(bidder1), 9);
        vote(bidder1, proposalId, 1, 'i support', clientId1);

        // cast 1 vote
        assertEq(nounsToken.getCurrentVotes(bidder2), 1);
        vote(bidder2, proposalId, 1, 'i support', clientId2);

        uint32 proposalId2 = uint32(propose(bidder2, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
        vote(bidder1, proposalId2, 1, 'i support', clientId1);
        vote(bidder2, proposalId2, 1, 'i support', clientId1);

        mineBlocks(VOTING_PERIOD);

        settleAuction();
        votingClientIds = [clientId1, clientId2];
        // 9 + 10 = 19 votes for clientId1, 1 vote for clientId2, total 20 votes 2 proposals
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId1, 0.07125 ether);
        vm.expectEmit();
        emit Rewards.ClientRewarded(clientId2, 0.00375 ether);
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId2,
            votingClientIds: votingClientIds
        });

        assertEq(rewards.clientBalance(clientId1), 0.07125 ether); // 15 eth * 0.5% * (19/20)
        assertEq(rewards.clientBalance(clientId2), 0.00375 ether); // 15 eth * 0.5% * (1/20)
    }

    function test_revertsIfNotAllVotesAreAccounted() public {
        // Niji ... noundersDAO 廃止のため、 旧 Nouns で noundersDAO が clientId=0 で vote していた経路を
        // bidder1 が vote without clientId (clientId=0) で代替する。
        vote(bidder1, proposalId, 1, 'i support'); // clientId=0
        vote(bidder2, proposalId, 1, 'i support', clientId2);

        mineBlocks(VOTING_PERIOD);

        votingClientIds = [clientId2];
        vm.expectRevert('not all votes accounted');
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });

        votingClientIds = [0, clientId2];
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId,
            votingClientIds: votingClientIds
        });
    }

    function test_getVotingClientIds() public {
        vote(bidder1, proposalId, 1, 'i support', clientId1);
        expectedClientIds = [1];
        mineBlocks(VOTING_PERIOD);
        assertEq(rewards.getVotingClientIds(proposalId), expectedClientIds);
    }

    function test_getVotingClientIds2() public {
        vote(bidder1, proposalId, 1, 'i support', clientId1);
        vote(bidder2, proposalId, 1, 'i support', clientId2);
        mineBlocks(VOTING_PERIOD);
        expectedClientIds = [1, 2];
        assertEq(rewards.getVotingClientIds(proposalId), expectedClientIds);
    }

    function test_getVotingClientIds3() public {
        // Niji ... noundersDAO 廃止のため、 旧 Nouns で noundersDAO が clientId=0 で vote していた経路を
        // bidder2 vote without clientId (clientId=0) で代替し、 clientId 集合 [0, 1] を期待。
        vote(bidder1, proposalId, 1, 'i support', clientId1);
        vote(bidder2, proposalId, 1, 'i support'); // clientId=0
        mineBlocks(VOTING_PERIOD);
        expectedClientIds = [0, 1];
        assertEq(rewards.getVotingClientIds(proposalId), expectedClientIds);
    }

    function test_getVotingClientIds_filtersProposalsBelowEligibilityQuorum() public {
        // clientId1 should not be included because proposal only had against votes
        vote(bidder1, proposalId, 0, 'against', clientId1);
        mineBlocks(VOTING_PERIOD);

        uint32 proposalId2 = uint32(propose(bidder1, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
        vote(bidder1, proposalId2, 1, 'i support', clientId2);
        mineBlocks(VOTING_PERIOD);
        uint32[] memory votingClientIds = rewards.getVotingClientIds(proposalId2);

        // doesn't revert. if votingClientIds included clientId1 then it would revert because the first proposal is
        // ineligible, so clientId1 has zero votes
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId2,
            votingClientIds: votingClientIds
        });

        expectedClientIds = [clientId2];
        assertEq(votingClientIds, expectedClientIds);
    }

    function test_getVotingClientIds_filtersCanceledProposals() public {
        // clientId1 should not be included because proposal was canceled
        vote(bidder1, proposalId, 1, 'for', clientId1);
        mineBlocks(VOTING_PERIOD);

        vm.prank(bidder1);
        dao.cancel(proposalId);

        uint32 proposalId2 = uint32(propose(bidder1, address(1), 1 ether, '', '', 'my proposal', 0));
        mineBlocks(VOTING_DELAY + UPDATABLE_PERIOD_BLOCKS + 1);
        vote(bidder1, proposalId2, 1, 'i support', clientId2);
        mineBlocks(VOTING_PERIOD);
        uint32[] memory votingClientIds = rewards.getVotingClientIds(proposalId2);

        // doesn't revert
        rewards.updateRewardsForProposalWritingAndVoting({
            lastProposalId: proposalId2,
            votingClientIds: votingClientIds
        });

        expectedClientIds = [clientId2];
        assertEq(votingClientIds, expectedClientIds);
    }

    function assertEq(uint32[] memory a, uint32[] memory b) internal {
        if (keccak256(abi.encode(a)) != keccak256(abi.encode(b))) {
            console.log('>>> a:');
            for (uint i; i < a.length; i++) {
                console.log(a[i]);
            }
            console.log('>>> b:');
            for (uint i; i < b.length; i++) {
                console.log(b[i]);
            }
            fail('Array no equal');
        }
    }
}
