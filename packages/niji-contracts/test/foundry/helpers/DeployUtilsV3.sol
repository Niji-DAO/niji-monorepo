// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import { DeployUtils } from './DeployUtils.sol';
import { INijiDAOLogic } from '../../../contracts/interfaces/INijiDAOLogic.sol';
import { NijiDAOLogicV4 } from '../../../contracts/governance/NijiDAOLogicV4.sol';
import { NijiDAOProxyV3 } from '../../../contracts/governance/NijiDAOProxyV3.sol';
import { NijiDAOForkEscrow } from '../../../contracts/governance/fork/NijiDAOForkEscrow.sol';
import { NijiDAOExecutorV2 } from '../../../contracts/governance/NijiDAOExecutorV2.sol';
import { ERC1967Proxy } from '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';
import { NijiAuctionHouseV3 } from '../../../contracts/NijiAuctionHouseV3.sol';
import { NijiAuctionHouseProxy } from '../../../contracts/proxies/NijiAuctionHouseProxy.sol';
import { NijiAuctionHouseProxyAdmin } from '../../../contracts/proxies/NijiAuctionHouseProxyAdmin.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';
import { ForkDAODeployer } from '../../../contracts/governance/fork/ForkDAODeployer.sol';
import { NijiTokenFork } from '../../../contracts/governance/fork/newdao/token/NijiTokenFork.sol';
import { NijiAuctionHouseFork } from '../../../contracts/governance/fork/newdao/NijiAuctionHouseFork.sol';
import { NijiDAOLogicV1Fork } from '../../../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';
import { NijiDAOTypes } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { INijiDAOLogic } from '../../../contracts/interfaces/INijiDAOLogic.sol';
import { INijiToken } from '../../../contracts/interfaces/INijiToken.sol';
import { WETH } from '../../../contracts/test/WETH.sol';
import { ChainalysisSanctionsListMock } from './ChainalysisSanctionsListMock.sol';

abstract contract DeployUtilsV3 is DeployUtils {
    NijiAuctionHouseProxyAdmin auctionHouseProxyAdmin;

    function _createDAOV3Proxy(
        address timelock,
        address nounsToken,
        address vetoer,
        NijiDAOTypes.NijiDAOParams memory daoParams,
        NijiDAOTypes.DynamicQuorumParams memory dqParams
    ) internal returns (INijiDAOLogic dao) {
        uint256 nonce = vm.getNonce(address(this));
        address predictedForkEscrowAddress = computeCreateAddress(address(this), nonce + 2);
        dao = INijiDAOLogic(
            address(
                new NijiDAOProxyV3(
                    timelock,
                    nounsToken,
                    predictedForkEscrowAddress,
                    address(0),
                    vetoer,
                    timelock,
                    address(new NijiDAOLogicV4()),
                    daoParams,
                    dqParams
                )
            )
        );
        address(new NijiDAOForkEscrow(address(dao), address(nounsToken)));
    }

    function _createDAOV3Proxy(
        address timelock,
        address nounsToken,
        address vetoer
    ) internal returns (INijiDAOLogic dao) {
        dao = _createDAOV3Proxy(
            timelock,
            nounsToken,
            vetoer,
            NijiDAOTypes.NijiDAOParams({
                votingPeriod: VOTING_PERIOD,
                votingDelay: VOTING_DELAY,
                proposalThresholdBPS: PROPOSAL_THRESHOLD,
                lastMinuteWindowInBlocks: LAST_MINUTE_BLOCKS,
                objectionPeriodDurationInBlocks: OBJECTION_PERIOD_BLOCKS,
                proposalUpdatablePeriodInBlocks: 0
            }),
            NijiDAOTypes.DynamicQuorumParams({
                minQuorumVotesBPS: 200,
                maxQuorumVotesBPS: 2000,
                quorumCoefficient: 10000
            })
        );
    }

    struct Temp {
        NijiDAOExecutorV2 timelock;
        NijiToken nounsToken;
    }

    function _deployDAOV3WithParams(uint256 auctionDuration) internal returns (INijiDAOLogic) {
        Temp memory t;
        t.timelock = NijiDAOExecutorV2(payable(address(new ERC1967Proxy(address(new NijiDAOExecutorV2()), ''))));
        t.timelock.initialize(address(1), TIMELOCK_DELAY);

        auctionHouseProxyAdmin = new NijiAuctionHouseProxyAdmin();
        t.nounsToken = deployToken(address(0));

        NijiAuctionHouseV3 auctionHouseImpl = new NijiAuctionHouseV3(INijiToken(address(t.nounsToken)), address(new WETH()), auctionDuration);
        NijiAuctionHouseProxy auctionProxy = new NijiAuctionHouseProxy(
            address(auctionHouseImpl),
            address(auctionHouseProxyAdmin),
            ''
        );
        auctionHouseProxyAdmin.transferOwnership(address(t.timelock));

        t.nounsToken.setMinter(address(auctionProxy));
        t.nounsToken.transferOwnership(address(t.timelock));
        vm.prank(address(t.timelock));
        t.nounsToken.acceptOwnership();

        address daoLogicImplementation = address(new NijiDAOLogicV4());

        ForkDAODeployer forkDeployer = new ForkDAODeployer(
            address(new NijiTokenFork()),
            address(new NijiAuctionHouseFork()),
            address(new NijiDAOLogicV1Fork()),
            address(new NijiDAOExecutorV2()),
            DELAYED_GOV_DURATION,
            FORK_DAO_VOTING_PERIOD,
            FORK_DAO_VOTING_DELAY,
            FORK_DAO_PROPOSAL_THRESHOLD_BPS,
            FORK_DAO_QUORUM_VOTES_BPS
        );

        // forkEscrow は NijiDAOProxyV3 deploy 直後 (nonce+1) に deploy される
        // 旧 +2 は daoLogicImplementation を引数評価で deploy する想定だったが、
        // line 107 で先に deploy 済のため実 deploy 順序は ProxyV3 (N) → ForkEscrow (N+1)
        address predictedForkEscrowAddress = computeCreateAddress(address(this), vm.getNonce(address(this)) + 1);

        INijiDAOLogic dao = INijiDAOLogic(
            payable(
                new NijiDAOProxyV3(
                    address(t.timelock),
                    address(t.nounsToken),
                    predictedForkEscrowAddress,
                    address(forkDeployer),
                    makeAddr('vetoer'),
                    address(t.timelock),
                    daoLogicImplementation,
                    NijiDAOTypes.NijiDAOParams({
                        votingPeriod: VOTING_PERIOD,
                        votingDelay: VOTING_DELAY,
                        proposalThresholdBPS: PROPOSAL_THRESHOLD,
                        lastMinuteWindowInBlocks: LAST_MINUTE_BLOCKS,
                        objectionPeriodDurationInBlocks: OBJECTION_PERIOD_BLOCKS,
                        proposalUpdatablePeriodInBlocks: UPDATABLE_PERIOD_BLOCKS
                    }),
                    NijiDAOTypes.DynamicQuorumParams({
                        minQuorumVotesBPS: 200,
                        maxQuorumVotesBPS: 2000,
                        quorumCoefficient: 10000
                    })
                )
            )
        );

        address(new NijiDAOForkEscrow(address(dao), address(t.nounsToken)));

        ChainalysisSanctionsListMock sanctionsOracle = new ChainalysisSanctionsListMock();

        vm.prank(address(t.timelock));
        NijiAuctionHouseV3(address(auctionProxy)).initialize({
            _reservePrice: 0,
            _timeBuffer: 2,
            _minBidIncrementPercentage: 1,
            _sanctionsOracle: sanctionsOracle
        });

        vm.prank(address(t.timelock));
        t.timelock.setPendingAdmin(address(dao));
        vm.prank(address(dao));
        t.timelock.acceptAdmin();

        vm.startPrank(address(t.timelock));
        dao._setForkPeriod(FORK_PERIOD);
        dao._setForkThresholdBPS(FORK_THRESHOLD_BPS);
        vm.stopPrank();

        return dao;
    }

    function _deployDAOV3() internal returns (INijiDAOLogic) {
        return _deployDAOV3WithParams(10 minutes);
    }
}
