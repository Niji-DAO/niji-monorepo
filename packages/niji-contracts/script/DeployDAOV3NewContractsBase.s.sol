// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Script.sol';
import { NijiDAOExecutorV2 } from '../contracts/governance/NijiDAOExecutorV2.sol';
import { NijiDAOExecutorV2Test } from '../contracts/test/NijiDAOExecutorHarness.sol';
import { NijiDAOLogicV4 } from '../contracts/governance/NijiDAOLogicV4.sol';
import { NijiDAOExecutorProxy } from '../contracts/governance/NijiDAOExecutorProxy.sol';
import { INijiDAOExecutor } from '../contracts/governance/NijiDAOInterfaces.sol';
import { NijiDAOForkEscrow } from '../contracts/governance/fork/NijiDAOForkEscrow.sol';
import { NijiTokenFork } from '../contracts/governance/fork/newdao/token/NijiTokenFork.sol';
import { NijiAuctionHouseFork } from '../contracts/governance/fork/newdao/NijiAuctionHouseFork.sol';
import { NijiDAOLogicV1Fork } from '../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';
import { ForkDAODeployer } from '../contracts/governance/fork/ForkDAODeployer.sol';
import { ERC20Transferer } from '../contracts/utils/ERC20Transferer.sol';

interface NounsDAO {
    function nouns() external view returns (address);
}

contract DeployDAOV3NewContractsBase is Script {
    uint256 public constant DELAYED_GOV_DURATION = 30 days;
    uint256 public immutable forkDAOVotingPeriod;
    uint256 public immutable forkDAOVotingDelay;
    uint256 public constant FORK_DAO_PROPOSAL_THRESHOLD_BPS = 25; // 0.25%
    uint256 public constant FORK_DAO_QUORUM_VOTES_BPS = 1000; // 10%

    NounsDAO public immutable daoProxy;
    INijiDAOExecutor public immutable timelockV1;
    bool public immutable deployTimelockV2Harness; // should be true only for testnets

    constructor(
        address _daoProxy,
        address _timelockV1,
        bool _deployTimelockV2Harness,
        uint256 _forkDAOVotingPeriod,
        uint256 _forkDAOVotingDelay
    ) {
        daoProxy = NounsDAO(_daoProxy);
        timelockV1 = INijiDAOExecutor(_timelockV1);
        deployTimelockV2Harness = _deployTimelockV2Harness;
        forkDAOVotingPeriod = _forkDAOVotingPeriod;
        forkDAOVotingDelay = _forkDAOVotingDelay;
    }

    function run()
        public
        returns (
            NijiDAOForkEscrow forkEscrow,
            ForkDAODeployer forkDeployer,
            NijiDAOLogicV4 daoImpl,
            NijiDAOExecutorV2 timelockV2,
            ERC20Transferer erc20Transferer
        )
    {
        uint256 deployerKey = vm.envUint('DEPLOYER_PRIVATE_KEY');

        vm.startBroadcast(deployerKey);

        (forkEscrow, forkDeployer, daoImpl, timelockV2, erc20Transferer) = deployNewContracts();

        vm.stopBroadcast();
    }

    function deployNewContracts()
        internal
        returns (
            NijiDAOForkEscrow forkEscrow,
            ForkDAODeployer forkDeployer,
            NijiDAOLogicV4 daoImpl,
            NijiDAOExecutorV2 timelockV2,
            ERC20Transferer erc20Transferer
        )
    {
        NijiDAOExecutorV2 timelockV2Impl;
        if (deployTimelockV2Harness) {
            timelockV2Impl = new NijiDAOExecutorV2Test();
        } else {
            timelockV2Impl = new NijiDAOExecutorV2();
        }

        forkEscrow = new NijiDAOForkEscrow(address(daoProxy), address(daoProxy.nouns()));
        forkDeployer = new ForkDAODeployer(
            address(new NijiTokenFork()),
            address(new NijiAuctionHouseFork()),
            address(new NijiDAOLogicV1Fork()),
            address(timelockV2Impl),
            DELAYED_GOV_DURATION,
            forkDAOVotingPeriod,
            forkDAOVotingDelay,
            FORK_DAO_PROPOSAL_THRESHOLD_BPS,
            FORK_DAO_QUORUM_VOTES_BPS
        );
        daoImpl = new NijiDAOLogicV4();
        timelockV2 = deployAndInitTimelockV2(address(timelockV2Impl));
        erc20Transferer = new ERC20Transferer();
    }

    function deployAndInitTimelockV2(address timelockV2Impl) internal returns (NijiDAOExecutorV2 timelockV2) {
        bytes memory initCallData = abi.encodeWithSignature(
            'initialize(address,uint256)',
            address(daoProxy),
            timelockV1.delay()
        );

        timelockV2 = NijiDAOExecutorV2(payable(address(new NijiDAOExecutorProxy(timelockV2Impl, initCallData))));

        return timelockV2;
    }
}
