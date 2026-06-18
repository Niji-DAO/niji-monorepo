// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import { NijiDAOExecutorV2 } from '../../contracts/governance/NijiDAOExecutorV2.sol';
import { NijiDAOData } from '../../contracts/governance/data/NijiDAOData.sol';
import { NijiAuctionHouseFork } from '../../contracts/governance/fork/newdao/NijiAuctionHouseFork.sol';
import { INijiToken } from '../../contracts/interfaces/INijiToken.sol';
import { NijiDAOLogicV1Fork } from '../../contracts/governance/fork/newdao/governance/NijiDAOLogicV1Fork.sol';
import { NijiTokenFork } from '../../contracts/governance/fork/newdao/token/NijiTokenFork.sol';
import { INijiDAOForkEscrow } from '../../contracts/governance/NijiDAOInterfaces.sol';

contract InitializersLocked is Test {
    function test_NijiDAOExecutorV2_locks_initializer() public {
        NijiDAOExecutorV2 c = new NijiDAOExecutorV2();
        vm.expectRevert('Initializable: contract is already initialized');
        c.initialize(address(0), 3 days);
    }

    function test_NijiDAOData_locks_initializer() public {
        NijiDAOData c = new NijiDAOData(address(1), address(2));
        vm.expectRevert('Initializable: contract is already initialized');
        c.initialize(address(1), 0, 0, payable(address(2)));
    }

    function test_NijiAuctionHouseFork_locks_initializer() public {
        NijiAuctionHouseFork c = new NijiAuctionHouseFork();
        vm.expectRevert('Initializable: contract is already initialized');
        c.initialize(address(0), INijiToken(address(0)), address(0), 0, 0, 0, 0);
    }

    function test_NijiDAOLogicV1Fork_locks_initializer() public {
        NijiDAOLogicV1Fork c = new NijiDAOLogicV1Fork();
        vm.expectRevert('Initializable: contract is already initialized');
        c.initialize(address(0), address(1), 0, 0, 0, 0, new address[](0), 0);
    }

    function test_NijiTokenFork_locks_initializer() public {
        NijiTokenFork c = new NijiTokenFork();
        vm.expectRevert('Initializable: contract is already initialized');
        c.initialize(address(0), address(1), INijiDAOForkEscrow(address(3)), 0, 0, 0, 0);
    }
}
