// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';

import { NijiDAOLogicSharedBaseTest } from '../helpers/NijiDAOLogicSharedBase.t.sol';
import { INijiDAOLogic } from '../../../contracts/interfaces/INijiDAOLogic.sol';
import { DeployUtilsV3 } from '../helpers/DeployUtilsV3.sol';
import { NijiDAOProxyV3 } from '../../../contracts/governance/NijiDAOProxyV3.sol';
import { NijiDAOTypes } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';

abstract contract NijiDAOLogic_GasSnapshot_propose is NijiDAOLogicSharedBaseTest {
    address immutable target = makeAddr('target');

    function setUp() public override {
        super.setUp();

        vm.startPrank(minter);
        uint256 _tokenId = nounsToken.mint();
        nounsToken.transferFrom(minter, proposer, _tokenId);
        vm.stopPrank();

        // ERC721Votes (OZ v5) self-delegate
        vm.prank(proposer);
        NijiToken(payable(address(nounsToken))).delegate(proposer);

        vm.roll(block.number + 1);
    }

    function test_propose_shortDescription() public {
        vm.prank(proposer);
        address[] memory targets = new address[](1);
        targets[0] = target;
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        string[] memory signatures = new string[](1);
        signatures[0] = '';
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = '';
        daoProxy.propose(targets, values, signatures, calldatas, 'short description');
    }

    function test_propose_longDescription() public {
        vm.prank(proposer);
        address[] memory targets = new address[](1);
        targets[0] = target;
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        string[] memory signatures = new string[](1);
        signatures[0] = '';
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = '';
        daoProxy.propose(targets, values, signatures, calldatas, getLongDescription());
    }

    function getLongDescription() internal view returns (string memory) {
        return vm.readFile('./test/foundry/files/longProposalDescription.txt');
    }
}

abstract contract NijiDAOLogic_GasSnapshot_castVote is NijiDAOLogicSharedBaseTest {
    address immutable nouner = makeAddr('nouner');
    address immutable target = makeAddr('target');

    function setUp() public override {
        super.setUp();

        vm.startPrank(minter);
        uint256 _tid1 = nounsToken.mint();
        nounsToken.transferFrom(minter, proposer, _tid1);
        uint256 _tid2 = nounsToken.mint();
        nounsToken.transferFrom(minter, nouner, _tid2);
        vm.stopPrank();

        // ERC721Votes (OZ v5) self-delegate
        vm.prank(proposer);
        nounsToken.delegate(proposer);
        vm.prank(nouner);
        nounsToken.delegate(nouner);

        vm.roll(block.number + 1);

        givenProposal();
        vm.roll(block.number + daoProxy.votingDelay() + 1);
    }

    function givenProposal() internal {
        address[] memory targets = new address[](1);
        targets[0] = target;
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        string[] memory signatures = new string[](1);
        signatures[0] = '';
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = '';
        vm.prank(proposer);
        daoProxy.propose(targets, values, signatures, calldatas, 'short description');
    }

    function test_castVote_against() public {
        vm.prank(nouner);
        daoProxy.castVote(1, 0);
    }

    function test_castVoteWithReason() public {
        vm.prank(nouner);
        daoProxy.castVoteWithReason(1, 0, "I don't like this proposal");
    }

    function test_castVote_lastMinuteFor() public {
        vm.roll(block.number + VOTING_PERIOD - LAST_MINUTE_BLOCKS);
        vm.prank(nouner);
        daoProxy.castVote(1, 1);
    }
}

abstract contract NijiDAOLogic_GasSnapshot_castVoteDuringObjectionPeriod is NijiDAOLogicSharedBaseTest {
    address immutable nouner = makeAddr('nouner');
    address immutable target = makeAddr('target');

    function setUp() public override {
        super.setUp();

        vm.startPrank(minter);
        uint256 _tid1 = nounsToken.mint();
        nounsToken.transferFrom(minter, proposer, _tid1);
        uint256 _tid2 = nounsToken.mint();
        nounsToken.transferFrom(minter, nouner, _tid2);
        vm.stopPrank();

        // ERC721Votes (OZ v5) self-delegate
        vm.prank(proposer);
        nounsToken.delegate(proposer);
        vm.prank(nouner);
        nounsToken.delegate(nouner);

        vm.roll(block.number + 1);

        givenProposal();
        vm.roll(block.number + daoProxy.votingDelay() + 1);

        // activate objection period
        vm.roll(block.number + VOTING_PERIOD - LAST_MINUTE_BLOCKS);
        vm.prank(proposer);
        daoProxy.castVote(1, 1);
        // enter objection period
        vm.roll(block.number + LAST_MINUTE_BLOCKS + 1);
    }

    function givenProposal() internal {
        address[] memory targets = new address[](1);
        targets[0] = target;
        uint256[] memory values = new uint256[](1);
        values[0] = 1 ether;
        string[] memory signatures = new string[](1);
        signatures[0] = '';
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = '';
        vm.prank(proposer);
        daoProxy.propose(targets, values, signatures, calldatas, 'short description');
    }

    function test_castVote_duringObjectionPeriod_against() public {
        vm.prank(nouner);
        daoProxy.castVote(1, 0);
    }
}

contract NijiDAOLogic_GasSnapshot_V3_propose is DeployUtilsV3, NijiDAOLogic_GasSnapshot_propose {
    function deployDAOProxy(
        address timelock,
        address nounsToken,
        address vetoer
    ) internal override returns (INijiDAOLogic) {
        return _createDAOV3Proxy(timelock, nounsToken, vetoer);
    }
}

contract NijiDAOLogic_GasSnapshot_V3_vote is DeployUtilsV3, NijiDAOLogic_GasSnapshot_castVote {
    function deployDAOProxy(
        address timelock,
        address nounsToken,
        address vetoer
    ) internal override returns (INijiDAOLogic) {
        return _createDAOV3Proxy(timelock, nounsToken, vetoer);
    }

    function test_proposalsV3() public view {
        daoProxy.proposalsV3(1);
    }
}

contract NijiDAOLogic_GasSnapshot_V3_voteDuringObjectionPeriod is
    DeployUtilsV3,
    NijiDAOLogic_GasSnapshot_castVoteDuringObjectionPeriod
{
    function deployDAOProxy(
        address timelock,
        address nounsToken,
        address vetoer
    ) internal override returns (INijiDAOLogic) {
        return _createDAOV3Proxy(timelock, nounsToken, vetoer);
    }
}
