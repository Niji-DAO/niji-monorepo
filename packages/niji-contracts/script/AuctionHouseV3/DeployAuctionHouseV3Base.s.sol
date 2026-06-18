// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Script.sol';
import { INijiAuctionHouseV2 } from '../../contracts/interfaces/INijiAuctionHouseV2.sol';
import { NijiAuctionHouseV3 } from '../../contracts/NijiAuctionHouseV3.sol';
import { OptimizedScript } from '../OptimizedScript.s.sol';

abstract contract DeployAuctionHouseV3Base is OptimizedScript {
    INijiAuctionHouseV2 public immutable auctionV2;

    constructor(address _auctionHouseProxy) {
        auctionV2 = INijiAuctionHouseV2(payable(_auctionHouseProxy));
    }

    function run() public returns (NijiAuctionHouseV3 newLogic) {
        requireDefaultProfile();
        uint256 deployerKey = vm.envUint('DEPLOYER_PRIVATE_KEY');

        vm.startBroadcast(deployerKey);

        newLogic = new NijiAuctionHouseV3(auctionV2.nouns(), auctionV2.weth(), auctionV2.duration());

        vm.stopBroadcast();
    }
}
