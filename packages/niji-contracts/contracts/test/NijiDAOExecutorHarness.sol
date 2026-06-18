// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import '../governance/NijiDAOExecutor.sol';
import '../governance/NijiDAOExecutorV2.sol';

interface Administered {
    function _acceptAdmin() external returns (uint256);
}

contract NijiDAOExecutorHarness is NijiDAOExecutor {
    constructor(address admin_, uint256 delay_) NijiDAOExecutor(admin_, delay_) {}

    function harnessSetPendingAdmin(address pendingAdmin_) public {
        pendingAdmin = pendingAdmin_;
    }

    function harnessSetAdmin(address admin_) public {
        admin = admin_;
    }
}

contract NijiDAOExecutorTest is NijiDAOExecutor {
    constructor(address admin_, uint256 delay_) NijiDAOExecutor(admin_, 2 days) {
        delay = delay_;
    }

    function harnessSetAdmin(address admin_) public {
        require(msg.sender == admin);
        admin = admin_;
    }

    function harnessAcceptAdmin(Administered administered) public {
        administered._acceptAdmin();
    }
}

contract NijiDAOExecutorV2Test is NijiDAOExecutorV2 {
    function initialize(address admin_, uint256 delay_) public override {
        super.initialize(admin_, 2 days);
        delay = delay_;
    }

    function harnessSetAdmin(address admin_) public {
        require(msg.sender == admin);
        admin = admin_;
    }

    function harnessAcceptAdmin(Administered administered) public {
        administered._acceptAdmin();
    }
}
