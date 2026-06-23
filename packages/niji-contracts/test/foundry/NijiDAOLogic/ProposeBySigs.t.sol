// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';
import { NijiDAOLogicBaseTest } from './NijiDAOLogicBaseTest.sol';
import { DeployUtils } from '../helpers/DeployUtils.sol';
import { SigUtils, ERC1271Stub } from '../helpers/SigUtils.sol';
import { NijiDAOProposals } from '../../../contracts/governance/NijiDAOProposals.sol';
import { NijiDAOProxyV3 } from '../../../contracts/governance/NijiDAOProxyV3.sol';
import { NijiDAOTypes } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { IProxyRegistry } from '../../../contracts/external/opensea/IProxyRegistry.sol';
import { NijiDAOExecutor } from '../../../contracts/governance/NijiDAOExecutor.sol';

contract ProposeBySigsTest is NijiDAOLogicBaseTest {
    address proposerWithVote;
    uint256 proposerWithVotePK;
    address proposerWithNoVotes = makeAddr('proposerWithNoVotes');
    address signerWithNoVotes;
    uint256 signerWithNoVotesPK;
    address signerWithVote1;
    uint256 signerWithVote1PK;
    address signerWithVote2;
    uint256 signerWithVote2PK;

    function setUp() public override {
        super.setUp();

        (proposerWithVote, proposerWithVotePK) = makeAddrAndKey('proposerWithVote');
        (signerWithNoVotes, signerWithNoVotesPK) = makeAddrAndKey('signerWithNoVotes');
        (signerWithVote1, signerWithVote1PK) = makeAddrAndKey('signerWithVote1');
        (signerWithVote2, signerWithVote2PK) = makeAddrAndKey('signerWithVote2');

        vm.prank(address(timelock));
        dao._setProposalThresholdBPS(1_000);

        vm.startPrank(minter);
        uint256 _tid1 = nounsToken.mint();
        nounsToken.transferFrom(minter, proposerWithVote, _tid1);
        uint256 _tid2 = nounsToken.mint();
        nounsToken.transferFrom(minter, signerWithVote1, _tid2);
        uint256 _tid3 = nounsToken.mint();
        nounsToken.transferFrom(minter, signerWithVote2, _tid3);
        vm.roll(block.number + 1);
        vm.stopPrank();
    }

    function test_givenNoSigs_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](0);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.MustProvideSignatures.selector));
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, '');
    }

    function test_givenCanceledSig_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, '', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        vm.prank(signerWithVote1);
        dao.cancelSig(proposerSignatures[0].sig);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.SignatureIsCancelled.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, '');
    }

    function test_givenExpireddSig_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp - 1;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, '', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.SignatureExpired.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, '');
    }

    function test_givenSigOnDifferentDescription_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(
                proposerWithVote,
                signerWithVote1PK,
                txs,
                'different sig description',
                expirationTimestamp,
                address(dao)
            ),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(
            proposerSignatures,
            txs.targets,
            txs.values,
            txs.signatures,
            txs.calldatas,
            'prop description'
        );
    }

    function test_givenSigOnDifferentTargets_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        txs.targets[0] = makeAddr('different target');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentValues_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        txs.values[0] = 42;

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentSignatures_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        txs.signatures[0] = 'different signature';

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentCalldatas_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        txs.calldatas[0] = 'different calldatas';

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentExpiration_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        proposerSignatures[0].expirationTimestamp = expirationTimestamp + 1;

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentSigner_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        proposerSignatures[0].signer = makeAddr('different signer than sig');

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentDomainName_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(
                proposerWithVote,
                signerWithVote1PK,
                txs,
                'description',
                expirationTimestamp,
                address(dao),
                'different domain name'
            ),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSigOnDifferentVerifyingContract_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(
                proposerWithVote,
                signerWithVote1PK,
                txs,
                'description',
                expirationTimestamp,
                makeAddr('different verifying contract')
            ),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenERC1271CheckReturnsFalse_reverts() public {
        ERC1271Stub erc1271 = new ERC1271Stub();
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            address(erc1271),
            expirationTimestamp
        );
        erc1271.setResponse(keccak256(proposerSignatures[0].sig), false);

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.InvalidSignature.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenSignerWithAnActiveProp_reverts() public {
        propose(signerWithVote1, makeAddr('target'), 0, '', '', '');

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposerAlreadyHasALiveProposal.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerWithAnActiveProp_reverts() public {
        propose(proposerWithVote, makeAddr('target'), 0, '', '', '');

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(abi.encodeWithSelector(NijiDAOProposals.ProposerAlreadyHasALiveProposal.selector));
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerAndSignerWithVotesButBelowThreshold_reverts() public {
        // Minting to push proposer and signer below threshold
        vm.startPrank(minter);
        for (uint256 i = 0; i < 16; ++i) {
            nounsToken.mint();
        }
        vm.roll(block.number + 1);
        vm.stopPrank();

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        vm.expectRevert(NijiDAOProposals.VotesBelowProposalThreshold.selector);
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerWithEnoughVotesAndSignerWithNoVotes_reverts() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithNoVotesPK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithNoVotes,
            expirationTimestamp
        );

        vm.expectRevert(NijiDAOProposals.MustProvideSignatures.selector);
        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerAndSignerWithEnoughVotesCombined_worksAndEmitsEvents() public {
        // Minting to push proposer below threshold, while combined with signer they have enough
        vm.startPrank(minter);
        for (uint256 i = 0; i < 6; ++i) {
            nounsToken.mint();
        }
        vm.roll(block.number + 1);
        vm.stopPrank();

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        address[] memory expectedSigners = new address[](1);
        expectedSigners[0] = signerWithVote1;
        expectNewPropEvents(txs, proposerWithVote, dao.proposalCount() + 1, 1, 0, expectedSigners);

        vm.prank(proposerWithVote);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerIsAlsoSigner_reverts() public {
        // Minting to push proposer below threshold, while if counted twice will have enough
        vm.startPrank(minter);
        for (uint256 i = 0; i < 6; ++i) {
            nounsToken.mint();
        }
        vm.roll(block.number + 1);
        vm.stopPrank();
        assertEq(dao.proposalThreshold(), 1);

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithVote, proposerWithVotePK, txs, 'description', expirationTimestamp, address(dao)),
            proposerWithVote,
            expirationTimestamp
        );

        vm.prank(proposerWithVote);
        vm.expectRevert(NijiDAOProposals.ProposerAlreadyHasALiveProposal.selector);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerWithNoVotesAndSignerWithEnoughVotes_worksAndEmitsEvents() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );

        address[] memory expectedSigners = new address[](1);
        expectedSigners[0] = signerWithVote1;
        expectNewPropEvents(txs, proposerWithNoVotes, dao.proposalCount() + 1, 0, 0, expectedSigners);

        vm.prank(proposerWithNoVotes);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenOnesOfSignersHasNoVotes_signerIsFilteredOut() public {
        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](2);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(
                proposerWithNoVotes,
                signerWithNoVotesPK,
                txs,
                'description',
                expirationTimestamp,
                address(dao)
            ),
            signerWithNoVotes,
            expirationTimestamp
        );
        proposerSignatures[1] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote2PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote2,
            expirationTimestamp
        );

        address[] memory expectedSigners = new address[](1);
        expectedSigners[0] = signerWithVote2;
        expectNewPropEvents(txs, proposerWithNoVotes, dao.proposalCount() + 1, 0, 0, expectedSigners);

        vm.prank(proposerWithNoVotes);
        uint256 proposalId = dao.proposeBySigs(
            proposerSignatures,
            txs.targets,
            txs.values,
            txs.signatures,
            txs.calldatas,
            'description'
        );

        NijiDAOTypes.ProposalCondensedV3 memory proposal = dao.proposalsV3(proposalId);
        assertEq(proposal.signers, expectedSigners);
    }

    function test_givenProposerWithNoVotesAndTwoSignersWithEnoughVotes_worksAndEmitsEvents() public {
        // Minting to push a single signer below threshold
        vm.startPrank(minter);
        for (uint256 i = 0; i < 6; ++i) {
            nounsToken.mint();
        }
        vm.roll(block.number + 1);
        vm.stopPrank();

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](2);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );
        proposerSignatures[1] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote2PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote2,
            expirationTimestamp
        );

        address[] memory expectedSigners = new address[](2);
        expectedSigners[0] = signerWithVote1;
        expectedSigners[1] = signerWithVote2;
        expectNewPropEvents(txs, proposerWithNoVotes, dao.proposalCount() + 1, 1, 0, expectedSigners);

        vm.prank(proposerWithNoVotes);
        uint256 proposalId = dao.proposeBySigs(
            proposerSignatures,
            txs.targets,
            txs.values,
            txs.signatures,
            txs.calldatas,
            'description'
        );

        NijiDAOTypes.ProposalCondensedV3 memory proposal = dao.proposalsV3(proposalId);
        assertEq(proposal.signers, expectedSigners);
    }

    function test_givenProposerWithNoVotesAndTwoSignaturesBySameSigner_reverts() public {
        // Minting to push a single signer below threshold
        vm.startPrank(minter);
        for (uint256 i = 0; i < 6; ++i) {
            nounsToken.mint();
        }
        vm.roll(block.number + 1);
        vm.stopPrank();

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](2);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            signerWithVote1,
            expirationTimestamp
        );
        proposerSignatures[1] = NijiDAOTypes.ProposerSignature(
            signProposal(
                proposerWithNoVotes,
                signerWithVote1PK,
                txs,
                'description',
                expirationTimestamp + 1,
                address(dao)
            ),
            signerWithVote1,
            expirationTimestamp + 1
        );

        vm.prank(proposerWithNoVotes);
        vm.expectRevert(NijiDAOProposals.ProposerAlreadyHasALiveProposal.selector);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }

    function test_givenProposerWithNoVotesAndERC1271SignerWithEnoughVotes_worksAndEmitsEvents() public {
        ERC1271Stub erc1271 = new ERC1271Stub();
        vm.prank(signerWithVote1);
        nounsToken.delegate(address(erc1271));
        vm.roll(block.number + 1);

        NijiDAOProposals.ProposalTxs memory txs = makeTxs(makeAddr('target'), 0, '', '');
        uint256 expirationTimestamp = block.timestamp + 1234;
        NijiDAOTypes.ProposerSignature[] memory proposerSignatures = new NijiDAOTypes.ProposerSignature[](1);
        proposerSignatures[0] = NijiDAOTypes.ProposerSignature(
            signProposal(proposerWithNoVotes, signerWithVote1PK, txs, 'description', expirationTimestamp, address(dao)),
            address(erc1271),
            expirationTimestamp
        );

        erc1271.setResponse(keccak256(proposerSignatures[0].sig), true);

        address[] memory expectedSigners = new address[](1);
        expectedSigners[0] = address(erc1271);
        expectNewPropEvents(txs, proposerWithNoVotes, dao.proposalCount() + 1, 0, 0, expectedSigners);

        vm.prank(proposerWithNoVotes);
        dao.proposeBySigs(proposerSignatures, txs.targets, txs.values, txs.signatures, txs.calldatas, 'description');
    }
}
