// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Script.sol';
import { OptimizedScript } from '../OptimizedScript.s.sol';
import { Rewards } from '../../contracts/client-incentives/Rewards.sol';
import { INijiDAOLogic } from '../../contracts/interfaces/INijiDAOLogic.sol';
import { INijiAuctionHouseV2 } from '../../contracts/interfaces/INijiAuctionHouseV2.sol';
import { RewardsDeployer } from './RewardsDeployer.sol';

abstract contract DeployRewardsBase is OptimizedScript {
    function runInternal(
        INijiDAOLogic dao,
        INijiAuctionHouseV2 auctionHouse,
        address admin,
        address ethToken
    ) internal returns (Rewards rewards) {
        requireDefaultProfile();

        uint256 deployerKey = vm.envUint('DEPLOYER_PRIVATE_KEY');

        vm.startBroadcast(deployerKey);

        rewards = RewardsDeployer.deployRewards({
            dao: dao,
            admin: admin,
            auctionHouse: address(auctionHouse),
            erc20: ethToken,
            descriptor: address(0)
        });

        vm.stopBroadcast();
    }
}
