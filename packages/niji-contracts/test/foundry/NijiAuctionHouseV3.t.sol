// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import 'forge-std/Test.sol';
import { DeployUtils } from './helpers/DeployUtils.sol';
import { NijiAuctionHouseProxy } from '../../contracts/proxies/NijiAuctionHouseProxy.sol';
import { NijiAuctionHouseProxyAdmin } from '../../contracts/proxies/NijiAuctionHouseProxyAdmin.sol';
import { NijiAuctionHouse } from '../../contracts/NijiAuctionHouse.sol';
import { INijiAuctionHouseV3 as IAH } from '../../contracts/interfaces/INijiAuctionHouseV3.sol';
import { NijiAuctionHouseV3 } from '../../contracts/NijiAuctionHouseV3.sol';
import { BidderWithGasGriefing } from './helpers/BidderWithGasGriefing.sol';
import { ChainalysisSanctionsListMock } from './helpers/ChainalysisSanctionsListMock.sol';

contract NijiAuctionHouseV3TestBase is Test, DeployUtils {
    address owner = address(0x1111);
    address noundersDAO = address(0x2222);
    address minter = address(0x3333);
    uint256[] nounIds;
    uint32 timestamp = 1702289583;

    NijiAuctionHouseV3 auction;

    function setUp() public virtual {
        vm.warp(timestamp);
        (NijiAuctionHouseProxy auctionProxy, ) = _deployAuctionHouseAndToken(owner, noundersDAO, minter);

        auction = NijiAuctionHouseV3(address(auctionProxy));

        vm.prank(owner);
        auction.unpause();
        vm.roll(block.number + 1);
    }

    function bidAndWinCurrentAuction(address bidder, uint256 bid) internal returns (uint256) {
        uint128 nounId = auction.auction().nounId;
        vm.deal(bidder, bid);
        vm.prank(bidder);
        auction.createBid{ value: bid }(nounId);
        endAuctionAndSettle();
        return block.timestamp;
    }

    function endAuctionAndSettle() internal {
        uint40 endTime = auction.auction().endTime;
        vm.warp(endTime);
        auction.settleCurrentAndCreateNewAuction();
    }

    function bidDontCreateNewAuction(address bidder, uint256 bid) internal returns (uint256) {
        uint128 nounId = auction.auction().nounId;
        uint40 endTime = auction.auction().endTime;
        vm.deal(bidder, bid);
        vm.prank(bidder);
        auction.createBid{ value: bid }(nounId);
        vm.warp(endTime);
        return block.timestamp;
    }
}

contract NijiAuctionHouseV3Test is NijiAuctionHouseV3TestBase {
    function test_createBid_revertsGivenWrongNounId() public {
        uint128 nounId = auction.auction().nounId;

        // Niji ... nounId=0 開始のため nounId-1 は uint underflow、 nounId>0 の場合のみ前 nounId 試行
        if (nounId > 0) {
            vm.expectRevert('Noun not up for auction');
            auction.createBid(nounId - 1);
        }

        vm.expectRevert('Noun not up for auction');
        auction.createBid(nounId + 1);
    }

    function test_createBid_revertsPastEndTime() public {
        uint128 nounId = auction.auction().nounId;
        uint40 endTime = auction.auction().endTime;
        vm.warp(endTime + 1);

        vm.expectRevert('Auction expired');
        auction.createBid(nounId);
    }

    function test_createBid_revertsGivenBidBelowReservePrice() public {
        vm.prank(owner);
        auction.setReservePrice(1 ether);

        uint128 nounId = auction.auction().nounId;

        vm.expectRevert('Must send at least reservePrice');
        auction.createBid{ value: 0.9 ether }(nounId);
    }

    function test_createBid_revertsGivenBidLowerThanMinIncrement() public {
        vm.prank(owner);
        auction.setMinBidIncrementPercentage(50);
        uint128 nounId = auction.auction().nounId;
        auction.createBid{ value: 1 ether }(nounId);

        vm.expectRevert('Must send more than last bid by minBidIncrementPercentage amount');
        auction.createBid{ value: 1.49 ether }(nounId);
    }

    function test_createBid_refundsPreviousBidder() public {
        uint256 nounId = auction.auction().nounId;
        address bidder1 = address(0x4444);
        address bidder2 = address(0x5555);

        vm.deal(bidder1, 1.1 ether);
        vm.prank(bidder1);
        auction.createBid{ value: 1.1 ether }(nounId);

        assertEq(bidder1.balance, 0);

        vm.deal(bidder2, 2.2 ether);
        vm.prank(bidder2);
        auction.createBid{ value: 2.2 ether }(nounId);

        assertEq(bidder1.balance, 1.1 ether);
        assertEq(bidder2.balance, 0);
    }

    function test_createBid_preventsGasGriefingUponRefunding() public {
        BidderWithGasGriefing badBidder = new BidderWithGasGriefing();
        uint256 nounId = auction.auction().nounId;

        badBidder.bid{ value: 1 ether }(auction, nounId);

        address bidder = address(0x4444);
        vm.deal(bidder, 1.2 ether);
        vm.prank(bidder);
        uint256 gasBefore = gasleft();
        auction.createBid{ value: 1.2 ether }(nounId);
        uint256 gasDiffWithGriefing = gasBefore - gasleft();

        address bidder2 = address(0x5555);
        vm.deal(bidder2, 2.2 ether);
        vm.prank(bidder2);
        gasBefore = gasleft();
        auction.createBid{ value: 2.2 ether }(nounId);
        uint256 gasDiffNoGriefing = gasBefore - gasleft();

        // Before the transfer with assembly fix this diff was greater
        // closer to 50K
        assertLt(gasDiffWithGriefing - gasDiffNoGriefing, 10_000);
    }

    function test_settleAuction_revertsWhenAuctionInProgress() public {
        vm.expectRevert("Auction hasn't completed");
        auction.settleCurrentAndCreateNewAuction();
    }

    function test_settleAuction_revertsWhenSettled() public {
        uint40 endTime = auction.auction().endTime;
        vm.warp(endTime + 1);

        vm.prank(owner);
        auction.pause();
        auction.settleAuction();

        vm.expectRevert('Auction has already been settled');
        auction.settleAuction();
    }

    function test_settleAuction_revertsWhenAuctionHasntBegunYet() public {
        (NijiAuctionHouseProxy auctionProxy, ) = _deployAuctionHouseAndToken(owner, noundersDAO, minter);

        auction = NijiAuctionHouseV3(address(auctionProxy));

        vm.expectRevert("Auction hasn't begun");
        auction.settleAuction();
    }

    function test_settleCurrentAndCreateNewAuction_revertsWhenPaused() public {
        uint40 endTime = auction.auction().endTime;
        vm.warp(endTime + 1);

        vm.prank(owner);
        auction.pause();

        vm.expectRevert('Pausable: paused');
        auction.settleCurrentAndCreateNewAuction();
    }

    function test_setMinBidIncrementPercentage_givenNonOwnerSender_reverts() public {
        vm.expectRevert('Ownable: caller is not the owner');
        auction.setMinBidIncrementPercentage(42);
    }

    function test_setMinBidIncrementPercentage_givenZero_reverts() public {
        vm.prank(auction.owner());
        vm.expectRevert('must be greater than zero');
        auction.setMinBidIncrementPercentage(0);
    }

    function test_setMinBidIncrementPercentage_givenNonZeroInput_works() public {
        assertNotEq(auction.minBidIncrementPercentage(), 42);

        vm.prank(auction.owner());
        auction.setMinBidIncrementPercentage(42);

        assertEq(auction.minBidIncrementPercentage(), 42);
    }
}

contract AuctionHouseSanctionsTest is NijiAuctionHouseV3TestBase {
    address sanctionedBidder = makeAddr('sanctioned bidder');
    ChainalysisSanctionsListMock sanctionsMock;

    function setUp() public override {
        super.setUp();
        sanctionsMock = ChainalysisSanctionsListMock(address(auction.sanctionsOracle()));
        sanctionsMock.setSanctioned(sanctionedBidder, true);
        vm.deal(sanctionedBidder, 1 ether);
    }

    function test_createBid_revertsGivenSanctionedBidder() public {
        uint128 nounId = auction.auction().nounId;

        vm.expectRevert('Sanctioned bidder');
        vm.prank(sanctionedBidder);
        auction.createBid{ value: 1 ether }(nounId);
    }
}

abstract contract NoracleBaseTest is NijiAuctionHouseV3TestBase {
    uint256[] expectedPrices;
    IAH.Settlement[] expectedSettlements;
    address bidder = makeAddr('bidder');

    function assertEq(IAH.Settlement[] memory s1, IAH.Settlement[] memory s2) internal {
        assertEq(s1.length, s2.length, 'wrong length');
        for (uint256 i; i < s1.length; i++) {
            assertEq(s1[i].blockTimestamp, s2[i].blockTimestamp, 'wrong timestamp');
            assertEq(s1[i].amount, s2[i].amount, 'wrong amount');
            assertEq(s1[i].winner, s2[i].winner, 'wrong winner');
            assertEq(s1[i].nounId, s2[i].nounId, 'wrong noun id');
        }
    }

    function reverse(IAH.Settlement[] storage s) internal view returns (IAH.Settlement[] memory) {
        IAH.Settlement[] memory s2 = new IAH.Settlement[](s.length);
        for (uint256 i = 0; i < s.length; ++i) {
            s2[s2.length - i - 1] = s[i];
        }
        return s2;
    }
}

contract NoracleTestOneAuctionSettledStateTest is NoracleBaseTest {
    IAH.Settlement nounId0Settlement;

    function setUp() public override {
        super.setUp();
        bidAndWinCurrentAuction(bidder, 1 ether);

        // Niji ... auction は nounId=0 から開始 (Nouns の 1 開始から差し替え済)。
        nounId0Settlement = IAH.Settlement({
            blockTimestamp: uint32(block.timestamp),
            amount: 1 ether,
            winner: bidder,
            nounId: 0,
            clientId: 0
        });
    }

    function test_prices() public {
        expectedPrices = [1 ether];

        assertEq(auction.getPrices(1), expectedPrices);
    }

    function test_prices_reverts_ifRequestMoreThanAvailableHistory() public {
        vm.expectRevert('Not enough history');
        auction.getPrices(2);
    }

    function test_getSettlements_skipFalse_1() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(1, false);

        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsRange_skipFalse_1() public {
        // Niji ... range(1, 2) は id=1 (現在 auction、 settlementHistory に未書き込みなので 0 entry)。
        IAH.Settlement[] memory settlements = auction.getSettlements(1, 2, false);
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 1, clientId: 0 })
        );
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsFromIdtoTimestamp_skipFalse_1() public {
        // Niji ... fromId=1 + endTimestamp=now、 nounId=1 は現在 auction (unsettled)、 maxId と一致 + blockTimestamp<=1 で continue → 空配列。
        IAH.Settlement[] memory settlements = auction.getSettlementsFromIdtoTimestamp(1, block.timestamp, false);
        assertEq(settlements.length, 0);
    }

    // Niji ... NounderNiji 廃止により nounId=0 は raw NounderNiji ではなく通常 auction の latest。
    // setUp で nounId=0 が 1 件 settle → getSettlements(N, false) は max 1 件のみ返す。
    function test_getSettlements_skipFalse_returnsRawNounderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(2, false);

        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsRange_skipFalse_returnsRawNounderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(0, 2, false);
        expectedSettlements.push(nounId0Settlement);
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 1, clientId: 0 })
        );
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsFromIdtoTimestamp_skipFalse_returnsRawNounderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, false);
        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsFormIdToTimestamp_skipFalse_stopsAtEndTimestamp() public {
        IAH.Settlement[] memory settlements = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp - 1, false);
        // Niji ... nounId=0 settle 完了済 + 現在 auction は nounId=1 (unsettled、 blockTimestamp=1 sentinel)。
        // endTimestamp=block.timestamp-1 → settle (id=0) は break 条件 settlementState.blockTimestamp(=now) > endTimestamp(=now-1) で break。
        // 結果空配列。
        assertEq(settlements.length, 0);
    }

    function test_getSettlementsFormIdToTimestamp_skipFalse_startIdInTheFuture_reverts() public {
        // Niji ... setUp 後の現在 auction nounId は 1。 startId=2 は startId>maxId で revert。
        vm.expectRevert('startId too large');
        auction.getSettlementsFromIdtoTimestamp(2, block.timestamp, false);
    }

    function test_getSettlementsRange_skipFalse_returnsEmptyData() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(0, 3, false);
        expectedSettlements.push(nounId0Settlement);
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 1, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 2, clientId: 0 })
        );
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlements_skipFalse_returnsLessResultsIfReachedNounZero() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(3, false);

        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlements_skipTrue_skipsNounderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(2, true);

        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsRange_skipTrue_skipsNounderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(0, 2, true);
        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsFromIdToTimestamp_skipTrue_skipsNonderNiji() public {
        IAH.Settlement[] memory settlements = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, true);
        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_getSettlementsRange_skipTrue_skipsEmptyData() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(0, 4, true);
        expectedSettlements.push(nounId0Settlement);
        assertEq(settlements, expectedSettlements);
    }

    function test_prices_preserves10DecimalsUnderUint64MaxValue() public {
        // amount is uint64; maxValue - 1 = 18446744073709551615
        // at 10 decimal points it's 1844674407.3709551615
        bidAndWinCurrentAuction(makeAddr('bidder'), 1844674407.3709551615999999 ether);

        IAH.Settlement[] memory settlements = auction.getSettlements(1, true);

        assertEq(settlements.length, 1);
        // Niji ... 2 回 settle 後の latest nounId は 1 (0 開始)。
        assertEq(settlements[0].nounId, 1);
        assertEq(settlements[0].amount, 1844674407.3709551615 ether);
        assertEq(settlements[0].winner, makeAddr('bidder'));

        uint256[] memory prices = auction.getPrices(1);
        assertEq(prices[0], 1844674407.3709551615 ether);
    }

    function test_prices_overflowsGracefullyOverUint64MaxValue() public {
        bidAndWinCurrentAuction(makeAddr('bidder'), 1844674407.3709551617 ether);

        IAH.Settlement[] memory settlements = auction.getSettlements(1, false);

        assertEq(settlements.length, 1);
        // Niji ... 2 回 settle 後の latest nounId は 1 (0 開始)。
        assertEq(settlements[0].nounId, 1);
        assertEq(settlements[0].amount, 1 * 1e8);
        assertEq(settlements[0].winner, makeAddr('bidder'));

        uint256[] memory prices = auction.getPrices(1);
        assertEq(prices[0], 1 * 1e8);
    }
}

contract NoracleTestManyAuctionsSettledStateTest is NoracleBaseTest {
    function setUp() public override {
        super.setUp();
        for (uint256 i = 1; i <= 20; ++i) {
            address bidder = makeAddr(vm.toString(i));
            bidAndWinCurrentAuction(bidder, i * 1e18);
        }
    }

    function test_getSettlements_skipsNounderNiji() public {
        // Niji ... NounderNiji 廃止 + nounId=0 開始のため、 20 回 settle で nounId=0〜19 が全て通常 auction。
        // skipFalse でも全 20 件 reverse 順で返る (上は最新)。
        IAH.Settlement[] memory settlements = auction.getSettlements(20, true);
        assertEq(settlements[0].nounId, 19);
        assertEq(settlements[1].nounId, 18);
        assertEq(settlements[10].nounId, 9);
        assertEq(settlements[19].nounId, 0);

        assertEq(settlements[0].amount, 20 ether);
        assertEq(settlements[1].amount, 19 ether);
        assertEq(settlements[10].amount, 10 ether);
        assertEq(settlements[19].amount, 1 ether);
    }

    function test_getPrices_skipsNounderNiji() public {
        // Niji ... NounderNiji 廃止のため 20 回 settle で 20 件全て価格取得。
        uint256[] memory prices = auction.getPrices(20);
        // prettier-ignore
        expectedPrices = [20e18, 19e18, 18e18, 17e18, 16e18, 15e18, 14e18, 13e18, 12e18, 11e18,
                          10e18, 9e18, 8e18, 7e18, 6e18, 5e18, 4e18, 3e18, 2e18, 1e18];
        assertEq(prices, expectedPrices);
    }

    function test_getSettlementRange_limitsToRange() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(3, 8, true);
        assertEq(settlements.length, 5);
        assertEq(settlements[0].nounId, 3);
        assertEq(settlements[1].nounId, 4);
        assertEq(settlements[2].nounId, 5);
        assertEq(settlements[3].nounId, 6);
        assertEq(settlements[4].nounId, 7);
    }

    function test_getSettlementFromIdToTimestamp_limitsToTimestamp() public {
        // get the timestamp of id 7
        uint256 endTimestamp = auction.getSettlements(7, 8, true)[0].blockTimestamp;

        IAH.Settlement[] memory settlements = auction.getSettlementsFromIdtoTimestamp(3, endTimestamp, true);
        assertEq(settlements.length, 5);
        assertEq(settlements[0].nounId, 3);
        assertEq(settlements[1].nounId, 4);
        assertEq(settlements[2].nounId, 5);
        assertEq(settlements[3].nounId, 6);
        assertEq(settlements[4].nounId, 7);
    }
}

contract NoracleTest_GapInHistoricPricesTest is NoracleBaseTest {
    function setUp() public override {
        super.setUp();

        // Niji ... auction は nounId=0 から開始 (旧 Nouns 1 開始から差替済)。
        // settle nounId=0 → token mint で gap (2,3,4) 作成 → settle nounId=1 → settle nounId=5。
        bidAndWinCurrentAuction(bidder, 1 ether); // settle nounId=0

        vm.startPrank(address(auction));
        for (uint256 i = 0; i < 3; ++i) {
            auction.nouns().mint(); // mint nouns 2,3,4
        }
        vm.stopPrank();

        bidAndWinCurrentAuction(bidder, 2 ether); // settle nounId=1
        bidAndWinCurrentAuction(bidder, 6 ether); // settle nounId=5
    }

    function test_prices_revertsIfEmptyAuctionData() public {
        // this works
        auction.getPrices(1);

        // this doesn't
        vm.expectRevert('Missing data');
        auction.getPrices(2);
    }

    function test_getSettlements_skipTrue_skipsEmptyData() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, true);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 6 ether, winner: bidder, nounId: 5, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 2 ether,
                winner: bidder,
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 20, true);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, true);
        assertEq(settlements3, reverse(expectedSettlements));
    }

    function test_getSettlements_skipFalse() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, false);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 6 ether, winner: bidder, nounId: 5, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 4, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 3, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 0, amount: 0, winner: address(0), nounId: 2, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 2 ether,
                winner: bidder,
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 6, false);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, false);
        assertEq(settlements3, reverse(expectedSettlements));
    }
}

contract NoracleTest_GapInHistoricPrices_AfterWarmUp_Test is NoracleBaseTest {
    function setUp() public override {
        super.setUp();

        auction.warmUpSettlementState(0, 6);

        // Niji ... auction は nounId=0 から開始 (旧 Nouns 1 開始から差替済)。
        bidAndWinCurrentAuction(bidder, 1 ether); // settle nounId=0

        vm.startPrank(address(auction));
        for (uint256 i = 0; i < 3; ++i) {
            auction.nouns().mint(); // mint nouns 2,3,4
        }
        vm.stopPrank();

        bidAndWinCurrentAuction(bidder, 2 ether); // settle nounId=1
        bidAndWinCurrentAuction(bidder, 6 ether); // settle nounId=5
    }

    function test_prices_revertsIfEmptyAuctionData() public {
        // this works
        auction.getPrices(1);

        // this doesn't
        vm.expectRevert('Missing data');
        auction.getPrices(2);
    }

    function test_getSettlements_skipTrue_skipsEmptyData() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, true);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 6 ether, winner: bidder, nounId: 5, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 2 ether,
                winner: bidder,
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 20, true);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, true);
        assertEq(settlements3, reverse(expectedSettlements));
    }

    function test_getSettlements_skipFalse() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, false);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 6 ether, winner: bidder, nounId: 5, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 1, amount: 0, winner: address(0), nounId: 4, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 1, amount: 0, winner: address(0), nounId: 3, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: 1, amount: 0, winner: address(0), nounId: 2, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 2 ether,
                winner: bidder,
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 6, false);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, false);
        assertEq(settlements3, reverse(expectedSettlements));
    }
}

contract NoracleTest_AuctionWithNoBids is NoracleBaseTest {
    function setUp() public override {
        super.setUp();

        // Niji ... auction は nounId=0 から開始 (旧 Nouns 1 開始から差替済)。
        bidAndWinCurrentAuction(bidder, 1 ether); // settle nounId=0
        endAuctionAndSettle(); // no winner for nounId=1
        bidAndWinCurrentAuction(bidder, 3 ether); // settle nounId=2
    }

    function test_getPrices_skipsAuctionsWithNotBids() public {
        uint256[] memory prices = auction.getPrices(2);
        expectedPrices = [3 ether, 1 ether];
        assertEq(prices, expectedPrices);
    }

    function test_getSettlements_skipFalse() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, false);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 3 ether, winner: bidder, nounId: 2, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 0,
                winner: address(0),
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 3, false);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, false);
        assertEq(settlements3, reverse(expectedSettlements));
    }

    function test_getSettlements_skipTrue_includesAuctionsWithNoBids() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, true);

        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({ blockTimestamp: uint32(ts), amount: 3 ether, winner: bidder, nounId: 2, clientId: 0 })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 0,
                winner: address(0),
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 48 hours),
                amount: 1 ether,
                winner: bidder,
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 20, true);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, true);
        assertEq(settlements3, reverse(expectedSettlements));
    }
}

contract NoracleTest_NoActiveAuction is NoracleBaseTest {
    function setUp() public override {
        super.setUp();

        bidAndWinCurrentAuction(makeAddr('bidder'), 1 ether);
        bidDontCreateNewAuction(makeAddr('bidder 2'), 2 ether);

        vm.prank(auction.owner());
        auction.pause();
        auction.settleAuction();
    }

    function test_prices_includesLastNoun() public {
        expectedPrices = [2 ether, 1 ether];
        uint256[] memory prices = auction.getPrices(2);
        assertEq(prices, expectedPrices);
    }

    function test_getSettlements_includesLastNoun() public {
        IAH.Settlement[] memory settlements = auction.getSettlements(20, true);

        // Niji ... auction は nounId=0 から開始 (旧 Nouns 1 開始から差替済)。
        // setUp で 2 回 settle: bidder=1 ether@nounId=0 → bidder 2=2 ether@nounId=1。
        uint256 ts = block.timestamp;
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts),
                amount: 2 ether,
                winner: makeAddr('bidder 2'),
                nounId: 1,
                clientId: 0
            })
        );
        expectedSettlements.push(
            IAH.Settlement({
                blockTimestamp: uint32(ts - 24 hours),
                amount: 1 ether,
                winner: makeAddr('bidder'),
                nounId: 0,
                clientId: 0
            })
        );
        assertEq(settlements, expectedSettlements);

        IAH.Settlement[] memory settlements2 = auction.getSettlements(0, 20, true);
        assertEq(settlements2, reverse(expectedSettlements));

        IAH.Settlement[] memory settlements3 = auction.getSettlementsFromIdtoTimestamp(0, block.timestamp, true);
        assertEq(settlements3, reverse(expectedSettlements));
    }
}

contract NijiAuctionHouseV3_setPricesTest is NoracleBaseTest {
    function test_setPrices_revertsForNonOwner() public {
        IAH.SettlementNoClientId[] memory settlements = new IAH.SettlementNoClientId[](1);
        settlements[0] = IAH.SettlementNoClientId({
            blockTimestamp: uint32(block.timestamp),
            amount: 42 ether,
            winner: makeAddr('winner'),
            nounId: 3
        });

        vm.expectRevert('Ownable: caller is not the owner');
        auction.setPrices(settlements);
    }

    function test_setPrices_worksForOwner() public {
        IAH.SettlementNoClientId[] memory settlements = new IAH.SettlementNoClientId[](20);

        uint256 nounId = 0;
        for (uint256 i = 0; i < 20; ++i) {
            // skip Nouners
            if (nounId <= 1820 && nounId % 10 == 0) {
                nounId++;
            }

            uint256 price = nounId * 1 ether;

            settlements[i] = IAH.SettlementNoClientId({
                blockTimestamp: 100000000 + uint32(nounId),
                amount: price,
                winner: makeAddr(vm.toString(nounId)),
                nounId: nounId
            });

            nounId++;
        }

        vm.prank(auction.owner());
        auction.setPrices(settlements);

        IAH.Settlement[] memory actualSettlements = auction.getSettlements(0, 23, true);
        assertEq(actualSettlements.length, 20);
        for (uint256 i = 0; i < 20; ++i) {
            assertEq(settlements[i].blockTimestamp, actualSettlements[i].blockTimestamp);
            assertEq(settlements[i].amount, actualSettlements[i].amount);
            assertEq(settlements[i].winner, actualSettlements[i].winner);
            assertEq(settlements[i].nounId, actualSettlements[i].nounId);
        }
    }
}

contract NijiAuctionHouseV3_OwnerFunctionsTest is NijiAuctionHouseV3TestBase {
    function test_setTimeBuffer_revertsForNonOwner() public {
        vm.expectRevert('Ownable: caller is not the owner');
        auction.setTimeBuffer(1 days);
    }

    function test_setTimeBuffer_revertsGivenValueAboveMax() public {
        vm.prank(auction.owner());
        vm.expectRevert('timeBuffer too large');
        auction.setTimeBuffer(1 days + 1);
    }

    function test_setTimeBuffer_worksForOwner() public {
        assertEq(auction.timeBuffer(), 5 minutes);

        vm.prank(auction.owner());
        auction.setTimeBuffer(1 days);

        assertEq(auction.timeBuffer(), 1 days);
    }
}

/**
 * @notice fiat 代理入札 (createBidFor) の test suite。
 *         2026-07-23 追加、 relayer 権限 + recipient / payer 分離 + refund 経路 + event の 4 系列で cover。
 */
contract NijiAuctionHouseV3CreateBidForTest is NijiAuctionHouseV3TestBase {
    address relayer = address(0xBEEF);
    address userA = address(0xAA01);
    address userB = address(0xBB02);

    function _grantRelayer() internal {
        vm.prank(owner);
        auction.grantRelayer(relayer);
    }

    function test_createBidFor_revertsForNonRelayer() public {
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        vm.deal(address(this), 1 ether);
        vm.expectRevert('AuctionHouse: caller is not a relayer');
        auction.createBidFor{ value: price }(nounId, userA);
    }

    function test_createBidFor_revertsForZeroRecipient() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        vm.deal(relayer, 1 ether);
        vm.prank(relayer);
        vm.expectRevert('Recipient cannot be zero address');
        auction.createBidFor{ value: price }(nounId, address(0));
    }

    function test_createBidFor_setsBidderToRecipientAndPayerToRelayer() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();

        vm.deal(relayer, 1 ether);
        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA);

        // auctionStorage.bidder が recipient (userA) に設定される
        assertEq(auction.auction().bidder, userA, 'bidder should equal recipient');
        // mapping で payer / recipient が個別に照会可能
        assertEq(auction.bidPayerOf(nounId), relayer, 'payer should equal relayer');
        assertEq(auction.bidRecipientOf(nounId), userA, 'recipient mapping should equal userA');
    }

    function test_createBidFor_emitsBidPlacedFor() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();

        vm.deal(relayer, 1 ether);
        vm.expectEmit(true, true, true, true);
        emit IAH.BidPlacedFor(nounId, relayer, userA, price, false);

        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA);
    }

    function test_createBid_doesNotEmitBidPlacedFor() public {
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        vm.deal(userA, 1 ether);

        vm.prank(userA);
        vm.recordLogs();
        auction.createBid{ value: price }(nounId);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        bytes32 sig = keccak256('BidPlacedFor(uint256,address,address,uint256,bool)');
        for (uint256 i = 0; i < logs.length; i++) {
            require(logs[i].topics[0] != sig, 'ETH path must not emit BidPlacedFor');
        }
        // ETH 経路では bidPayer / bidRecipient mapping は空のまま
        assertEq(auction.bidPayerOf(nounId), address(0), 'ETH path should not set bidPayer');
        assertEq(auction.bidRecipientOf(nounId), address(0), 'ETH path should not set bidRecipient');
    }

    function test_createBidFor_refundsRelayerNotRecipient_whenOverbid() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 firstBid = auction.reservePrice();
        uint256 secondBid = firstBid * 2;

        // fiat bid = relayer が userA 宛に入札
        vm.deal(relayer, firstBid);
        vm.prank(relayer);
        auction.createBidFor{ value: firstBid }(nounId, userA);
        assertEq(relayer.balance, 0, 'relayer should have spent all ETH');
        assertEq(userA.balance, 0, 'userA should not have received ETH yet');

        // userB が overbid
        vm.deal(userB, secondBid);
        vm.prank(userB);
        auction.createBid{ value: secondBid }(nounId);

        // refund は relayer (payer) に返る、 userA (recipient) には行かない
        assertEq(relayer.balance, firstBid, 'relayer should be refunded');
        assertEq(userA.balance, 0, 'userA (recipient) should not receive refund');
        // bidder は userB に更新、 fiat mapping は削除 (ETH で fiat を上書きした semantics)
        assertEq(auction.auction().bidder, userB, 'bidder should equal userB now');
        assertEq(auction.bidPayerOf(nounId), address(0), 'fiat payer mapping should be cleared');
        assertEq(auction.bidRecipientOf(nounId), address(0), 'fiat recipient mapping should be cleared');
    }

    function test_settle_sendsNftToRecipient_notPayer() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();

        vm.deal(relayer, 1 ether);
        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA);

        // settle 発火
        uint40 endTime = auction.auction().endTime;
        vm.warp(endTime);
        auction.settleCurrentAndCreateNewAuction();

        // NFT は recipient (userA) に届く、 relayer には行かない
        assertEq(auction.nouns().ownerOf(nounId), userA, 'NFT should belong to recipient');
    }

    function test_grantRelayer_revertsForNonOwner() public {
        vm.expectRevert('Ownable: caller is not the owner');
        auction.grantRelayer(relayer);
    }

    function test_revokeRelayer_blocksSubsequentCalls() public {
        _grantRelayer();
        vm.prank(owner);
        auction.revokeRelayer(relayer);
        assertFalse(auction.isRelayer(relayer), 'relayer flag should be false');

        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        vm.deal(relayer, 1 ether);
        vm.prank(relayer);
        vm.expectRevert('AuctionHouse: caller is not a relayer');
        auction.createBidFor{ value: price }(nounId, userA);
    }

    /**
     * @notice fiat → fiat overbid (同 relayer) の mapping / bidder / refund 挙動を verify。
     *         codex adversarial-review 2026-07-23 MINOR 対応。
     */
    function test_createBidFor_fiatOverbid_sameRelayer_updatesRecipientAndRefundsRelayer() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        uint256 secondPrice = price * 2;

        // 1st fiat bid = relayer, recipient=userA
        vm.deal(relayer, price + secondPrice);
        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA);

        // 2nd fiat bid = 同 relayer、 recipient=userB (別 user 宛)
        uint256 relayerBalBefore = relayer.balance;
        vm.prank(relayer);
        auction.createBidFor{ value: secondPrice }(nounId, userB);

        // recipient / payer mapping は最新値に更新
        assertEq(auction.auction().bidder, userB, 'bidder should be new recipient userB');
        assertEq(auction.bidPayerOf(nounId), relayer, 'payer stays as relayer');
        assertEq(auction.bidRecipientOf(nounId), userB, 'recipient updated to userB');
        // 前 bid の refund は relayer (payer) に返る、 userA (前 recipient) には行かない
        // relayerBalBefore は 2nd bid 発火直前の relayer 残高 (= secondPrice を持つ状態)
        // 2nd bid で secondPrice を消費 + 前 bid refund price = net 変化は -secondPrice + price
        assertEq(
            relayer.balance,
            relayerBalBefore - secondPrice + price,
            'relayer should be refunded first bid amount'
        );
        assertEq(userA.balance, 0, 'userA should not receive refund');
    }

    /**
     * @notice fiat → fiat overbid (別 relayer) の mapping / refund 挙動 verify。
     *         codex adversarial-review 2026-07-23 MINOR 対応。
     */
    function test_createBidFor_fiatOverbid_differentRelayer_refundsPrevRelayer() public {
        _grantRelayer();
        address relayer2 = address(0xCAFE);
        vm.prank(owner);
        auction.grantRelayer(relayer2);

        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        uint256 secondPrice = price * 2;

        // 1st = relayer が userA 宛
        vm.deal(relayer, price);
        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA);

        // 2nd = relayer2 が userB 宛
        vm.deal(relayer2, secondPrice);
        vm.prank(relayer2);
        auction.createBidFor{ value: secondPrice }(nounId, userB);

        // refund は前 relayer (relayer1) に返る、 別 relayer / userA には行かない
        assertEq(relayer.balance, price, 'previous relayer should be refunded');
        assertEq(userA.balance, 0, 'userA (prev recipient) should not receive refund');
        // mapping / bidder は 2nd に更新
        assertEq(auction.auction().bidder, userB, 'bidder = latest recipient');
        assertEq(auction.bidPayerOf(nounId), relayer2, 'payer = latest relayer');
        assertEq(auction.bidRecipientOf(nounId), userB, 'recipient = latest');
    }

    /**
     * @notice sanctioned recipient (fiat 支払 user) は createBidFor で revert。
     *         codex adversarial-review 2026-07-23 MINOR 対応。
     */
    function test_createBidFor_revertsForSanctionedRecipient() public {
        _grantRelayer();
        ChainalysisSanctionsListMock sanctionsMock = ChainalysisSanctionsListMock(
            address(auction.sanctionsOracle())
        );
        sanctionsMock.setSanctioned(userA, true);

        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        vm.deal(relayer, price);
        vm.prank(relayer);
        vm.expectRevert('Sanctioned bidder');
        auction.createBidFor{ value: price }(nounId, userA);
    }

    /**
     * @notice createBidFor(nounId, recipient, clientId>0) 経路の event + state coverage。
     *         codex adversarial-review 2026-07-23 MINOR 対応。
     */
    function test_createBidFor_withClientId_emitsBothEvents() public {
        _grantRelayer();
        uint128 nounId = auction.auction().nounId;
        uint256 price = auction.reservePrice();
        uint32 clientId = 42;

        vm.deal(relayer, price);

        // BidPlacedFor + AuctionBidWithClientId が両方 emit されることを verify
        vm.expectEmit(true, true, true, true);
        emit IAH.BidPlacedFor(nounId, relayer, userA, price, false);
        vm.expectEmit(true, false, true, true);
        emit IAH.AuctionBidWithClientId(nounId, price, clientId);

        vm.prank(relayer);
        auction.createBidFor{ value: price }(nounId, userA, clientId);

        assertEq(auction.auction().bidder, userA, 'bidder = recipient');
        assertEq(auction.bidPayerOf(nounId), relayer, 'payer = relayer');
    }
}
