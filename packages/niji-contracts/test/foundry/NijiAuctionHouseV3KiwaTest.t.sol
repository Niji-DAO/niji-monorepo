// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';
import { DeployUtils } from './helpers/DeployUtils.sol';
import { NijiAuctionHouseProxy } from '../../contracts/proxies/NijiAuctionHouseProxy.sol';
import { NijiAuctionHouseV3 } from '../../contracts/NijiAuctionHouseV3.sol';
import { INijiAuctionHouseV3 as IAH } from '../../contracts/interfaces/INijiAuctionHouseV3.sol';

/// @notice 既存 NijiAuctionHouseV3.t.sol (892 行) で未 cover な観点を補完する kiwa-design 由来の test。
contract NijiAuctionHouseV3KiwaTest is Test, DeployUtils {
    address owner = address(0x1111);
    address noundersDAO = address(0x2222);
    address minter = address(0x3333);
    address nonOwner = address(0x4444);
    uint32 internal startTimestamp = 1702289583;

    NijiAuctionHouseV3 internal auction;

    // Niji 関連の event 宣言 (既存 contract と一致が必要)
    event AuctionTimeBufferUpdated(uint256 timeBuffer);
    event AuctionReservePriceUpdated(uint256 reservePrice);
    event AuctionMinBidIncrementPercentageUpdated(uint256 minBidIncrementPercentage);

    function setUp() public virtual {
        vm.warp(startTimestamp);
        (NijiAuctionHouseProxy auctionProxy, ) = _deployAuctionHouseAndToken(owner, noundersDAO, minter);
        auction = NijiAuctionHouseV3(address(auctionProxy));
        // 注 ... 既存 NijiAuctionHouseV3TestBase は setUp で unpause するが、 本 kiwa-test
        //       は unpause 自体を test 対象にするため deploy 直後の paused state を保持
    }

    // ====================================================
    // TC-001 状態遷移: deploy 直後 paused、 unpause で _createAuction 自動発火
    // ====================================================
    function test_TC001_unpause_autoCreatesAuction() public {
        assertTrue(auction.paused(), 'deployed contract must be paused');
        // 初期 auctionStorage.startTime = 0
        IAH.AuctionV2View memory before = auction.auction();
        assertEq(before.startTime, 0, 'startTime must be 0 before unpause');

        vm.prank(owner);
        auction.unpause();

        assertFalse(auction.paused(), 'auction must be unpaused');
        IAH.AuctionV2View memory afterAuction = auction.auction();
        assertGt(afterAuction.startTime, 0, 'startTime must be > 0 after unpause (_createAuction fired)');
    }

    // ====================================================
    // TC-002 異常系: non-owner が unpause で revert
    // ====================================================
    function test_TC002_unpause_nonOwner_reverts() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        auction.unpause();
    }

    // ====================================================
    // TC-003 異常系: non-owner が pause で revert
    // ====================================================
    function test_TC003_pause_nonOwner_reverts() public {
        vm.prank(owner);
        auction.unpause();

        vm.prank(nonOwner);
        vm.expectRevert();
        auction.pause();
    }

    // ====================================================
    // TC-004 状態遷移: pause 後 settleCurrentAndCreateNewAuction が whenNotPaused で revert
    // ====================================================
    function test_TC004_settleCurrentAndCreateNew_whenPaused_reverts() public {
        vm.prank(owner);
        auction.unpause();

        vm.prank(owner);
        auction.pause();

        vm.expectRevert(); // EnforcedPause
        auction.settleCurrentAndCreateNewAuction();
    }

    // ====================================================
    // TC-005 正常系: setTimeBuffer で event
    // ====================================================
    function test_TC005_setTimeBuffer_emitsEvent() public {
        uint56 newBuffer = 120; // 2 minutes

        vm.expectEmit(false, false, false, true);
        emit AuctionTimeBufferUpdated(uint256(newBuffer));

        vm.prank(owner);
        auction.setTimeBuffer(newBuffer);
        assertEq(auction.timeBuffer(), newBuffer);
    }

    // ====================================================
    // TC-006 異常系: setTimeBuffer が MAX_TIME_BUFFER 超で revert
    // ====================================================
    function test_TC006_setTimeBuffer_overMax_reverts() public {
        uint56 maxBuffer = auction.MAX_TIME_BUFFER();
        vm.prank(owner);
        vm.expectRevert();
        auction.setTimeBuffer(maxBuffer + 1);
    }

    // ====================================================
    // TC-007 正常系: setReservePrice で event + 更新
    // ====================================================
    function test_TC007_setReservePrice_emitsEvent() public {
        uint192 newReserve = 0.5 ether;

        vm.expectEmit(false, false, false, true);
        emit AuctionReservePriceUpdated(uint256(newReserve));

        vm.prank(owner);
        auction.setReservePrice(newReserve);
        assertEq(auction.reservePrice(), newReserve);
    }
}
