// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import { Ownable2Step } from '@openzeppelin/contracts-v5/access/Ownable2Step.sol';

/// @title RejectingReceiver - test harness that always reverts on ETH receive
/// @notice Used to exercise the WithdrawFailed branch of NijiToken withdraw / withdrawAmount.
contract RejectingReceiver {
    error AlwaysRejected();

    receive() external payable {
        revert AlwaysRejected();
    }

    /// @notice Accept ownership of an Ownable2Step contract (used after transferOwnership)
    /// @dev Calls the target's acceptOwnership() so this contract becomes the new owner.
    function acceptOwnershipOn(address target) external {
        Ownable2Step(target).acceptOwnership();
    }

    /// @notice Invoke an arbitrary contract function from this harness (used to call withdraw as owner)
    /// @dev Forwards revert data raw so custom errors (including WithdrawFailed(bytes)) propagate cleanly.
    function callOn(address target, bytes calldata data) external returns (bytes memory) {
        (bool ok, bytes memory ret) = target.call(data);
        if (!ok) {
            assembly {
                revert(add(ret, 0x20), mload(ret))
            }
        }
        return ret;
    }
}
