// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { IChainalysisSanctionsList } from '../external/chainalysis/IChainalysisSanctionsList.sol';

/// @notice ローカル / テスト用の Chainalysis sanctions oracle mock。
/// hardhat localhost deploy で AuctionHouseV3.initialize の oracle 引数として使う。
contract ChainalysisSanctionsListMock is IChainalysisSanctionsList {
    mapping(address => bool) public sanctioned;

    function isSanctioned(address addr) external view returns (bool) {
        return sanctioned[addr];
    }

    function setSanctioned(address addr, bool value) public {
        sanctioned[addr] = value;
    }
}
