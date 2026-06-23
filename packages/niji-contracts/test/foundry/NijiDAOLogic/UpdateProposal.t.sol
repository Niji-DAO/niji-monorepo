// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';
import { NijiDAOLogicBaseTest } from './NijiDAOLogicBaseTest.sol';
import { DeployUtils } from '../helpers/DeployUtils.sol';
import { SigUtils, ERC1271Stub } from '../helpers/SigUtils.sol';
import { NijiDAOProposals } from '../../../contracts/governance/NijiDAOProposals.sol';
import { NijiDAOProxyV3 } from '../../../contracts/governance/NijiDAOProxyV3.sol';
import { NijiDAOTypes } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';
import { IProxyRegistry } from '../../../contracts/external/opensea/IProxyRegistry.sol';
import { NijiDAOExecutor } from '../../../contracts/governance/NijiDAOExecutor.sol';

abstract contract UpdateProposalBaseTest is NijiDAOLogicBaseTest {
    address proposer = makeAddr('proposer');
    uint256 proposalId;

    function setUp() public override {
        super.setUp();

        // mint 1 noun to proposer (Niji ... tokenId は mint 戻り値経由、 0 開始)
        vm.startPrank(minter);
        uint256 _tokenId = nounsToken.mint();
        nounsToken.transferFrom(minter, proposer, _tokenId);
        vm.stopPrank();

        // ERC721Votes (OZ v5) self-delegate
        vm.prank(proposer);
        NijiToken(payable(address(nounsToken))).delegate(proposer);

        vm.roll(block.number + 1);

        proposalId = propose(proposer, makeAddr('target'), 0, '', '', '');
        vm.roll(block.number + 1);
    }
}

contract UpdateProposalPermissionsTest is UpdateProposalBaseTest {
    function test_givenProposalDoesntExist_reverts() public {
        vm.expectRevert('NijiDAO::state: invalid proposal id');
        updateProposal(proposer, proposalId + 1, makeAddr('target'), 0, '', '', '');

        vm.expectRevert('NijiDAO::state: invalid proposal id');
        updateProposalTransactions(proposer, proposalId + 1, makeAddr('target'), 0, '', '', '');

        vm.expectRevert('NijiDAO::state: invalid proposal id');
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId + 1, '', '');
    }

    function test_givenMsgSenderNotProposer_reverts() public {
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.OnlyProposerCanEdit.selector));
        updateProposal(makeAddr('not proposer'), proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.OnlyProposerCanEdit.selector));
        updateProposalTransactions(makeAddr('not proposer'), proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.OnlyProposerCanEdit.selector));
        vm.prank(makeAddr('not proposer'));
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenPropWithSigners_reverts() public {
        vm.startPrank(proposer);
        dao.cancel(proposalId);

        (address signer, uint256 signerPK) = makeAddrAndKey('signer');
        // Niji ... proposer は tokenId=0 を保有 (0 開始)
        nounsToken.transferFrom(proposer, signer, 0);
        vm.stopPrank();
        vm.roll(block.number + 1);

        uint256 expirationTimestamp = block.timestamp + 1234;
        uint256 propId = proposeBySigs(
            proposer,
            signer,
            signerPK,
            makeTxs(makeAddr('target'), 0, '', ''),
            'description',
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposerCannotUpdateProposalWithSigners.selector));
        updateProposal(proposer, propId, makeAddr('target'), 1, '', '', 'description');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposerCannotUpdateProposalWithSigners.selector));
        updateProposalTransactions(proposer, propId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposerCannotUpdateProposalWithSigners.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(propId, '', '');
    }

    function test_givenStatesPendingActiveSucceededQueuedAndExecuted_reverts() public {
        // Pending
        vm.roll(block.number + proposalUpdatablePeriodInBlocks);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Pending);
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');

        // Active
        vm.roll(block.number + VOTING_DELAY);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Active);
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');

        // Succeeded
        vm.prank(proposer);
        dao.castVote(proposalId, 1);
        vm.roll(block.number + VOTING_PERIOD);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Succeeded);
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');

        // Queued
        dao.queue(proposalId);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Queued);
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');

        // Executed
        vm.warp(block.timestamp + TIMELOCK_DELAY);
        dao.execute(proposalId);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Executed);
        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenStateCanceled_reverts() public {
        vm.prank(proposer);
        dao.cancel(proposalId);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Canceled);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenStateDefeated_reverts() public {
        vm.roll(block.number + proposalUpdatablePeriodInBlocks + VOTING_DELAY);
        vm.prank(proposer);
        dao.castVote(proposalId, 0);
        vm.roll(block.number + VOTING_PERIOD);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Defeated);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenStateExpired_reverts() public {
        vm.roll(block.number + proposalUpdatablePeriodInBlocks + VOTING_DELAY);
        vm.prank(proposer);
        dao.castVote(proposalId, 1);
        vm.roll(block.number + VOTING_PERIOD);
        dao.queue(proposalId);
        vm.warp(block.timestamp + TIMELOCK_DELAY + timelock.GRACE_PERIOD());
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Expired);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenStateVetoed_reverts() public {
        vm.prank(vetoer);
        dao.veto(proposalId);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Vetoed);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }

    function test_givenStateObjectionPeriod_reverts() public {
        vm.roll(
            block.number + proposalUpdatablePeriodInBlocks + VOTING_DELAY + VOTING_PERIOD - lastMinuteWindowInBlocks
        );
        vm.prank(proposer);
        dao.castVote(proposalId, 1);
        vm.roll(block.number + lastMinuteWindowInBlocks);
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.ObjectionPeriod);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposal(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        updateProposalTransactions(proposer, proposalId, makeAddr('target'), 0, '', '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.CanOnlyEditUpdatableProposals.selector));
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, '', '');
    }
}

contract UpdateProposalTransactionsTest is UpdateProposalBaseTest {
    function test_proposalsV3GetterReturnsUpdatableEndBlock() public {
        assertEq(dao.proposalsV3(proposalId).updatePeriodEndBlock, block.number - 1 + proposalUpdatablePeriodInBlocks);
    }

    function test_givenNoTxs_reverts() public {
        address[] memory targets = new address[](0);
        uint256[] memory values = new uint256[](0);
        string[] memory signatures = new string[](0);
        bytes[] memory calldatas = new bytes[](0);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.MustProvideActions.selector));
        vm.prank(proposer);
        dao.updateProposal(proposalId, targets, values, signatures, calldatas, '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.MustProvideActions.selector));
        vm.prank(proposer);
        dao.updateProposalTransactions(proposalId, targets, values, signatures, calldatas, '');
    }

    function test_givenTooManyTxs_reverts() public {
        address[] memory targets = new address[](11);
        uint256[] memory values = new uint256[](11);
        string[] memory signatures = new string[](11);
        bytes[] memory calldatas = new bytes[](11);
        for (uint256 i = 0; i < 11; ++i) {
            targets[i] = makeAddr('target');
            values[i] = i;
            signatures[i] = '';
            calldatas[i] = '';
        }

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.TooManyActions.selector));
        vm.prank(proposer);
        dao.updateProposal(proposalId, targets, values, signatures, calldatas, '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.TooManyActions.selector));
        vm.prank(proposer);
        dao.updateProposalTransactions(proposalId, targets, values, signatures, calldatas, '');
    }

    function test_givenTxsWithArityMismatch_reverts() public {
        address[] memory targets = new address[](1);
        targets[0] = makeAddr('target');
        uint256[] memory values = new uint256[](0);
        string[] memory signatures = new string[](0);
        bytes[] memory calldatas = new bytes[](0);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposalInfoArityMismatch.selector));
        vm.prank(proposer);
        dao.updateProposal(proposalId, targets, values, signatures, calldatas, '', '');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposalInfoArityMismatch.selector));
        vm.prank(proposer);
        dao.updateProposalTransactions(proposalId, targets, values, signatures, calldatas, '');
    }

    function test_givenStateUpdatable_updateProposal_updatesTxsAndEmitsEvent() public {
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Updatable);
        (
            address[] memory targetsBefore,
            uint256[] memory valuesBefore,
            string[] memory signaturesBefore,
            bytes[] memory calldatasBefore
        ) = dao.getActions(proposalId);
        assertEq(targetsBefore[0], makeAddr('target'));
        assertEq(valuesBefore[0], 0);
        assertEq(signaturesBefore[0], '');
        assertEq(calldatasBefore[0], '');
        NijiDAOProposals.ProposalTxs memory txsAfter = makeTxs(
            makeAddr('targetAfter'),
            1,
            'signatureAfter',
            'dataAfter'
        );

        vm.expectEmit(true, true, true, true);
        emit ProposalUpdated(
            proposalId,
            proposer,
            txsAfter.targets,
            txsAfter.values,
            txsAfter.signatures,
            txsAfter.calldatas,
            'descriptionAfter',
            'some update message'
        );
        updateProposal(
            proposer,
            proposalId,
            txsAfter.targets[0],
            txsAfter.values[0],
            txsAfter.signatures[0],
            txsAfter.calldatas[0],
            'descriptionAfter',
            'some update message'
        );

        (
            address[] memory targetsAfter,
            uint256[] memory valuesAfter,
            string[] memory signaturesAfter,
            bytes[] memory calldatasAfter
        ) = dao.getActions(proposalId);
        assertEq(targetsAfter[0], makeAddr('targetAfter'));
        assertEq(valuesAfter[0], 1);
        assertEq(signaturesAfter[0], 'signatureAfter');
        assertEq(calldatasAfter[0], 'dataAfter');
    }

    function test_givenStateUpdatable_updateProposalTransactions_updatesTxsAndEmitsEvent() public {
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Updatable);
        (
            address[] memory targetsBefore,
            uint256[] memory valuesBefore,
            string[] memory signaturesBefore,
            bytes[] memory calldatasBefore
        ) = dao.getActions(proposalId);
        assertEq(targetsBefore[0], makeAddr('target'));
        assertEq(valuesBefore[0], 0);
        assertEq(signaturesBefore[0], '');
        assertEq(calldatasBefore[0], '');
        NijiDAOProposals.ProposalTxs memory txsAfter = makeTxs(
            makeAddr('targetAfter'),
            1,
            'signatureAfter',
            'dataAfter'
        );

        vm.expectEmit(true, true, true, true);
        emit ProposalTransactionsUpdated(
            proposalId,
            proposer,
            txsAfter.targets,
            txsAfter.values,
            txsAfter.signatures,
            txsAfter.calldatas,
            'some update message'
        );
        updateProposalTransactions(
            proposer,
            proposalId,
            txsAfter.targets[0],
            txsAfter.values[0],
            txsAfter.signatures[0],
            txsAfter.calldatas[0],
            'some update message'
        );

        (
            address[] memory targetsAfter,
            uint256[] memory valuesAfter,
            string[] memory signaturesAfter,
            bytes[] memory calldatasAfter
        ) = dao.getActions(proposalId);
        assertEq(targetsAfter[0], makeAddr('targetAfter'));
        assertEq(valuesAfter[0], 1);
        assertEq(signaturesAfter[0], 'signatureAfter');
        assertEq(calldatasAfter[0], 'dataAfter');
    }
}

contract UpdateProposalDescriptionTest is UpdateProposalBaseTest {
    function test_givenStateUpdatable_updatesDescriptionAndEmitsEvent() public {
        assertTrue(dao.state(proposalId) == NijiDAOTypes.ProposalState.Updatable);

        vm.expectEmit(true, true, true, true);
        emit ProposalDescriptionUpdated(proposalId, proposer, 'new description', 'update message');
        vm.prank(proposer);
        dao.updateProposalDescription(proposalId, 'new description', 'update message');
    }
}
