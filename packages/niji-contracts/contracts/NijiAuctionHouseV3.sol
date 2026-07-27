// SPDX-License-Identifier: GPL-3.0

/// @title The Niji DAO auction house

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

// LICENSE
// NijiAuctionHouse.sol is a modified version of Zora's AuctionHouse.sol:
// https://github.com/ourzora/auction-house/blob/54a12ec1a6cf562e49f0a4917990474b11350a2d/contracts/AuctionHouse.sol
//
// AuctionHouse.sol source code Copyright Zora licensed under the GPL-3.0 license.
// With modifications by Nounders DAO.

pragma solidity ^0.8.19;

import { PausableUpgradeable } from '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { INijiAuctionHouseV3 } from './interfaces/INijiAuctionHouseV3.sol';
import { INijiToken } from './interfaces/INijiToken.sol';
import { IWETH } from './interfaces/IWETH.sol';
import { IChainalysisSanctionsList } from './external/chainalysis/IChainalysisSanctionsList.sol';

/**
 * @dev The contract inherits from PausableUpgradeable & ReentrancyGuardUpgradeable most of all the keep the same
 * storage layout as the NijiAuctionHouse contract
 */
contract NijiAuctionHouseV3 is
    INijiAuctionHouseV3,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    /// @notice A hard-coded cap on time buffer to prevent accidental auction disabling if set with a very high value.
    uint56 public constant MAX_TIME_BUFFER = 1 days;

    /// @notice The Niji ERC721 token contract
    INijiToken public immutable nouns;

    /// @notice The address of the WETH contract
    address public immutable weth;

    /// @notice The duration of a single auction
    uint256 public immutable duration;

    /// @notice The minimum price accepted in an auction
    uint192 public reservePrice;

    /// @notice The minimum amount of time left in an auction after a new bid is created
    uint56 public timeBuffer;

    /// @notice The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    /// @notice The active auction
    INijiAuctionHouseV3.AuctionV2 public auctionStorage;

    /// @notice The Niji price feed state
    mapping(uint256 => SettlementState) settlementHistory;

    /// @notice The contract used to verify bidders are not sanctioned wallets
    IChainalysisSanctionsList public sanctionsOracle;

    /// @notice Fiat 代理入札で使う relayer 権限 mapping。 owner が grant/revoke する。
    /// @dev 追加 storage は末尾 mapping 1 slot、 proxy upgrade layout safe。
    mapping(address => bool) private _isRelayer;

    /// @notice fiat 経路で bid した場合の payer (relayer) を nounId 単位で記録。
    /// @dev address(0) = ETH 経路の bid (payer = bidder = recipient で分離不要)。
    mapping(uint256 => address) private _bidPayer;

    /// @notice fiat 経路で bid した場合の recipient (NFT 受取先) を nounId 単位で記録。
    /// @dev address(0) = ETH 経路の bid。 auctionStorage.bidder との違い =
    ///      ETH では両者同じ、 fiat では auctionStorage.bidder = recipient / _bidPayer[nounId] = relayer。
    mapping(uint256 => address) private _bidRecipient;

    constructor(INijiToken _nouns, address _weth, uint256 _duration) initializer {
        nouns = _nouns;
        weth = _weth;
        duration = _duration;
    }

    /**
     * @notice Initialize the auction house and base contracts,
     * populate configuration values, and pause the contract.
     * @dev This function can only be called once.
     */
    function initialize(
        uint192 _reservePrice,
        uint56 _timeBuffer,
        uint8 _minBidIncrementPercentage,
        IChainalysisSanctionsList _sanctionsOracle
    ) external initializer {
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init();

        _pause();

        reservePrice = _reservePrice;
        timeBuffer = _timeBuffer;
        minBidIncrementPercentage = _minBidIncrementPercentage;
        sanctionsOracle = _sanctionsOracle;

        emit SanctionsOracleSet(address(_sanctionsOracle));
    }

    /**
     * @notice Settle the current auction, mint a new Noun, and put it up for auction.
     */
    function settleCurrentAndCreateNewAuction() external override whenNotPaused {
        _settleAuction();
        _createAuction();
    }

    /**
     * @notice Settle the current auction.
     * @dev This function can only be called when the contract is paused.
     */
    function settleAuction() external override whenPaused {
        _settleAuction();
    }

    /**
     * @notice Create a bid for a Noun, with a given amount.
     * @dev This contract only accepts payment in ETH.
     */
    function createBid(uint256 nounId) external payable override {
        createBid(nounId, 0);
    }

    /**
     * @notice Create a bid for a Noun, with a given amount.
     * @param nounId id of the Noun to bid on
     * @param clientId the client which facilitate this action
     * @dev This contract only accepts payment in ETH.
     */
    function createBid(uint256 nounId, uint32 clientId) public payable override {
        // ETH 経路 = recipient = msg.sender で bidder / payer / recipient が同一。 fiat 分離なし。
        _createBidInternal(nounId, payable(msg.sender), address(0), clientId);
    }

    /**
     * @notice Fiat 代理入札 (relayer 経路)。 msg.sender = relayer, recipient = NFT 受取先。
     * @dev refund は payer (relayer) に返る。 上書き入札されると fincode void 経路と対応、
     *      user wallet に ETH refund する二重返還を回避する。
     */
    function createBidFor(uint256 nounId, address recipient) external payable override onlyRelayer {
        createBidFor(nounId, recipient, 0);
    }

    /**
     * @notice Fiat 代理入札 (clientId 付き)。
     */
    function createBidFor(
        uint256 nounId,
        address recipient,
        uint32 clientId
    ) public payable override onlyRelayer {
        require(recipient != address(0), 'Recipient cannot be zero address');
        _createBidInternal(nounId, payable(recipient), msg.sender, clientId);
    }

    /**
     * @notice createBid / createBidFor の共通 core。
     * @param nounId auction 対象 nounId
     * @param recipient auctionStorage.bidder に入れる = NFT 受取先
     * @param payer address(0) なら ETH 経路 (refund は recipient に返る)、
     *              != address(0) なら fiat 経路 (refund は payer = relayer に返る)
     * @param clientId client reward ID
     */
    function _createBidInternal(
        uint256 nounId,
        address payable recipient,
        address payer,
        uint32 clientId
    ) internal {
        INijiAuctionHouseV3.AuctionV2 memory _auction = auctionStorage;

        (uint192 _reservePrice, uint56 _timeBuffer, uint8 _minBidIncrementPercentage) = (
            reservePrice,
            timeBuffer,
            minBidIncrementPercentage
        );

        _requireNotSanctioned(recipient);
        require(_auction.nounId == nounId, 'Noun not up for auction');
        require(block.timestamp < _auction.endTime, 'Auction expired');
        require(msg.value >= _reservePrice, 'Must send at least reservePrice');
        require(
            msg.value >= _auction.amount + ((_auction.amount * _minBidIncrementPercentage) / 100),
            'Must send more than last bid by minBidIncrementPercentage amount'
        );

        // 前 bid の payer / recipient を refund 判定用に控える。 現 auction の直前 bid を上書きする形。
        address prevPayer = _bidPayer[nounId];
        address payable prevBidder = _auction.bidder;

        auctionStorage.clientId = clientId;
        auctionStorage.amount = uint128(msg.value);
        auctionStorage.bidder = recipient;

        // fiat 経路のみ payer / recipient mapping を書換、 ETH 経路では既存 mapping を上書き削除
        // (連続入札で fiat → ETH → fiat と遷移するケースの整合)。
        if (payer != address(0)) {
            _bidPayer[nounId] = payer;
            _bidRecipient[nounId] = recipient;
        } else if (prevPayer != address(0)) {
            // ETH で fiat bid を上書きする際、 過去の fiat mapping を消して ETH semantics に戻す。
            delete _bidPayer[nounId];
            delete _bidRecipient[nounId];
        }

        // Extend the auction if the bid was received within `timeBuffer` of the auction end time
        bool extended = _auction.endTime - block.timestamp < _timeBuffer;

        // 既存 subgraph の後方互換 = AuctionBid.sender は「chain の msg.sender」 (fiat では relayer)。
        // fiat は追加で BidPlacedFor emit、 subgraph 側で join して recipient 表示に置換する。
        emit AuctionBid(_auction.nounId, msg.sender, msg.value, extended);
        if (payer != address(0)) {
            emit BidPlacedFor(_auction.nounId, payer, recipient, msg.value, extended);
        }
        if (clientId > 0) emit AuctionBidWithClientId(_auction.nounId, msg.value, clientId);

        if (extended) {
            auctionStorage.endTime = _auction.endTime = uint40(block.timestamp + _timeBuffer);
            emit AuctionExtended(_auction.nounId, _auction.endTime);
        }

        // Refund the last bidder, if applicable.
        // 前 bid が fiat なら relayer に返す (資金元と一致、 user wallet への流出防止)。
        // 前 bid が ETH なら bidder に返す (既存挙動維持、 msg.sender = bidder)。
        if (prevBidder != address(0)) {
            address payable refundTo = prevPayer != address(0) ? payable(prevPayer) : prevBidder;
            _safeTransferETHWithFallback(refundTo, _auction.amount);
        }
    }

    /**
     * @notice Get the current auction.
     */
    function auction() external view returns (AuctionV2View memory) {
        return
            AuctionV2View({
                nounId: auctionStorage.nounId,
                amount: auctionStorage.amount,
                startTime: auctionStorage.startTime,
                endTime: auctionStorage.endTime,
                bidder: auctionStorage.bidder,
                settled: auctionStorage.settled
            });
    }

    /**
     * @notice Pause the Niji auction house.
     * @dev This function can only be called by the owner when the
     * contract is unpaused. While no new auctions can be started when paused,
     * anyone can settle an ongoing auction.
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the Niji auction house.
     * @dev This function can only be called by the owner when the
     * contract is paused. If required, this function will start a new auction.
     */
    function unpause() external override onlyOwner {
        _unpause();

        if (auctionStorage.startTime == 0 || auctionStorage.settled) {
            _createAuction();
        }
    }

    /**
     * @notice Set the auction time buffer.
     * @dev Only callable by the owner.
     */
    function setTimeBuffer(uint56 _timeBuffer) external override onlyOwner {
        require(_timeBuffer <= MAX_TIME_BUFFER, 'timeBuffer too large');

        timeBuffer = _timeBuffer;

        emit AuctionTimeBufferUpdated(_timeBuffer);
    }

    /**
     * @notice Set the auction reserve price.
     * @dev Only callable by the owner.
     */
    function setReservePrice(uint192 _reservePrice) external override onlyOwner {
        reservePrice = _reservePrice;

        emit AuctionReservePriceUpdated(_reservePrice);
    }

    /**
     * @notice Set the auction minimum bid increment percentage.
     * @dev Only callable by the owner.
     */
    function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage) external override onlyOwner {
        require(_minBidIncrementPercentage > 0, 'must be greater than zero');

        minBidIncrementPercentage = _minBidIncrementPercentage;

        emit AuctionMinBidIncrementPercentageUpdated(_minBidIncrementPercentage);
    }

    /**
     * @notice Set the sanctions oracle address.
     * @dev Only callable by the owner.
     */
    /**
     * @notice Grant relayer role (fiat 代理入札の payer 権限)。 owner 専用。
     */
    function grantRelayer(address relayer) external override onlyOwner {
        require(relayer != address(0), 'Relayer cannot be zero address');
        _isRelayer[relayer] = true;
        emit RelayerGranted(relayer);
    }

    /**
     * @notice Revoke relayer role。 owner 専用。 key rotation / 事故対応で使う。
     */
    function revokeRelayer(address relayer) external override onlyOwner {
        _isRelayer[relayer] = false;
        emit RelayerRevoked(relayer);
    }

    /**
     * @notice createBidFor の呼び出し権限を持つか照会。
     */
    function isRelayer(address relayer) external view override returns (bool) {
        return _isRelayer[relayer];
    }

    /**
     * @notice fiat 経路で bid した場合の payer (relayer) を nounId 単位で返す。
     *         address(0) = ETH 経路の bid or 未入札。
     */
    function bidPayerOf(uint256 nounId) external view override returns (address) {
        return _bidPayer[nounId];
    }

    /**
     * @notice fiat 経路で bid した場合の recipient (NFT 受取先) を nounId 単位で返す。
     *         address(0) = ETH 経路の bid or 未入札。
     */
    function bidRecipientOf(uint256 nounId) external view override returns (address) {
        return _bidRecipient[nounId];
    }

    /**
     * @notice createBidFor 権限 gate。 grantRelayer で許可されたアドレスのみ通す。
     */
    modifier onlyRelayer() {
        require(_isRelayer[msg.sender], 'AuctionHouse: caller is not a relayer');
        _;
    }

    function setSanctionsOracle(address newSanctionsOracle) public onlyOwner {
        sanctionsOracle = IChainalysisSanctionsList(newSanctionsOracle);

        emit SanctionsOracleSet(newSanctionsOracle);
    }

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the `auction` state variable and emit an AuctionCreated event.
     * If the mint reverts, the minter was updated without pausing this contract first. To remedy this,
     * catch the revert and pause this contract.
     */
    function _createAuction() internal {
        try nouns.mint() returns (uint256 nounId) {
            uint40 startTime = uint40(block.timestamp);
            uint40 endTime = startTime + uint40(duration);

            auctionStorage = AuctionV2({
                nounId: uint96(nounId),
                clientId: 0,
                amount: 0,
                startTime: startTime,
                endTime: endTime,
                bidder: payable(0),
                settled: false
            });

            emit AuctionCreated(nounId, startTime, endTime);
        } catch Error(string memory) {
            _pause();
        }
    }

    /**
     * @notice Settle an auction, finalizing the bid and paying out to the owner.
     * @dev If there are no bids, the Noun is burned.
     */
    function _settleAuction() internal {
        INijiAuctionHouseV3.AuctionV2 memory _auction = auctionStorage;

        require(_auction.startTime != 0, "Auction hasn't begun");
        require(!_auction.settled, 'Auction has already been settled');
        require(block.timestamp >= _auction.endTime, "Auction hasn't completed");

        auctionStorage.settled = true;

        if (_auction.bidder == address(0)) {
            nouns.burn(_auction.nounId);
        } else {
            nouns.transferFrom(address(this), _auction.bidder, _auction.nounId);
        }

        if (_auction.amount > 0) {
            _safeTransferETHWithFallback(owner(), _auction.amount);
        }

        SettlementState storage settlementState = settlementHistory[_auction.nounId];
        settlementState.blockTimestamp = uint32(block.timestamp);
        settlementState.amount = ethPriceToUint64(_auction.amount);
        settlementState.winner = _auction.bidder;
        if (_auction.clientId > 0) settlementState.clientId = _auction.clientId;

        emit AuctionSettled(_auction.nounId, _auction.bidder, _auction.amount);
        if (_auction.clientId > 0) emit AuctionSettledWithClientId(_auction.nounId, _auction.clientId);
    }

    /**
     * @notice Transfer ETH. If the ETH transfer fails, wrap the ETH and try send it as WETH.
     */
    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWETH(weth).deposit{ value: amount }();
            IERC20(weth).transfer(to, amount);
        }
    }

    /**
     * @notice Transfer ETH and return the success status.
     * @dev This function only forwards 30,000 gas to the callee.
     */
    function _safeTransferETH(address to, uint256 value) internal returns (bool) {
        bool success;
        assembly {
            success := call(30000, to, value, 0, 0, 0, 0)
        }
        return success;
    }

    /**
     * @notice Revert if `sanctionsOracle` is set and `account` is sanctioned.
     */
    function _requireNotSanctioned(address account) internal view {
        IChainalysisSanctionsList sanctionsOracle_ = sanctionsOracle;
        if (address(sanctionsOracle_) != address(0)) {
            require(!sanctionsOracle_.isSanctioned(account), 'Sanctioned bidder');
        }
    }

    /**
     * @notice Set historic prices; only callable by the owner, which in Niji is the treasury (timelock) contract.
     * @dev This function lowers auction price accuracy from 18 decimals to 10 decimals, as part of the price history
     * bit packing, to save gas.
     * @param settlements The list of historic prices to set.
     */
    function setPrices(SettlementNoClientId[] memory settlements) external onlyOwner {
        for (uint256 i = 0; i < settlements.length; ++i) {
            SettlementState storage settlementState = settlementHistory[settlements[i].nounId];
            settlementState.blockTimestamp = settlements[i].blockTimestamp;
            settlementState.amount = ethPriceToUint64(settlements[i].amount);
            settlementState.winner = settlements[i].winner;
        }
    }

    /**
     * @notice Warm up the settlement state for a range of Noun IDs.
     * @dev Helps lower the gas cost of auction settlement when storing settlement data
     * thanks to the state slot being non-zero.
     * @dev Only writes to slots where blockTimestamp is zero, meaning it will not overwrite existing data.
     * @dev Skips Nounder reward nouns.
     * @param startId the first Noun ID to warm up.
     * @param endId end Noun ID (up to, but not including).
     */
    function warmUpSettlementState(uint256 startId, uint256 endId) external {
        for (uint256 i = startId; i < endId; ++i) {
            // Skipping Nounder rewards, no need to warm up those slots since they are never used.
            if (i <= 1820 && i % 10 == 0) continue;

            SettlementState storage settlementState = settlementHistory[i];
            if (settlementState.blockTimestamp == 0) {
                settlementState.blockTimestamp = 1;
                settlementState.slotWarmedUp = true;
            }
        }
    }

    /**
     * @notice Get past auction settlements.
     * @dev Returns up to `auctionCount` settlements in reverse order, meaning settlements[0] will be the most recent auction price.
     * Includes auctions with no bids (blockTimestamp will be > 1)
     * @param auctionCount The number of price observations to get.
     * @param skipEmptyValues if true, skips nounder reward ids and ids with missing data
     * @return settlements An array of type `Settlement`, where each Settlement includes a timestamp,
     * the Noun ID of that auction, the winning bid amount, and the winner's address.
     */
    function getSettlements(
        uint256 auctionCount,
        bool skipEmptyValues
    ) external view returns (Settlement[] memory settlements) {
        uint256 latestNounId = auctionStorage.nounId;
        if (!auctionStorage.settled && latestNounId > 0) {
            latestNounId -= 1;
        }

        settlements = new Settlement[](auctionCount);
        uint256 actualCount = 0;

        SettlementState memory settlementState;
        for (uint256 id = latestNounId; actualCount < auctionCount; --id) {
            settlementState = settlementHistory[id];

            if (skipEmptyValues && settlementState.blockTimestamp <= 1) {
                if (id == 0) break;
                continue;
            }

            settlements[actualCount] = Settlement({
                blockTimestamp: settlementState.blockTimestamp,
                amount: uint64PriceToUint256(settlementState.amount),
                winner: settlementState.winner,
                nounId: id,
                clientId: settlementState.clientId
            });
            ++actualCount;

            if (id == 0) break;
        }

        if (auctionCount > actualCount) {
            // this assembly trims the observations array, getting rid of unused cells
            assembly {
                mstore(settlements, actualCount)
            }
        }
    }

    /**
     * @notice Get past auction prices.
     * @dev Returns prices in reverse order, meaning prices[0] will be the most recent auction price.
     * Skips auctions where there was no winner, i.e. no bids.
     * Skips nounder rewards noun ids.
     * Reverts if getting a empty data for an auction that happened, e.g. historic data not filled
     * Reverts if there's not enough auction data, i.e. reached noun id 0
     * @param auctionCount The number of price observations to get.
     * @return prices An array of uint256 prices.
     */
    function getPrices(uint256 auctionCount) external view returns (uint256[] memory prices) {
        uint256 latestNounId = auctionStorage.nounId;
        if (!auctionStorage.settled && latestNounId > 0) {
            latestNounId -= 1;
        }

        prices = new uint256[](auctionCount);
        uint256 actualCount = 0;

        SettlementState memory settlementState;
        // Niji ... nounId=0 開始のため id=0 を loop に含める (旧 Nouns nounId=1 開始想定の `id > 0` を修正)。
        // 旧 Nouns の Nounder skip (id % 10 == 0 で skip) は Niji で founder distribution 廃止のため不要、 完全削除済。
        for (uint256 id = latestNounId; actualCount < auctionCount; --id) {
            settlementState = settlementHistory[id];
            require(settlementState.blockTimestamp > 1, 'Missing data');
            if (settlementState.winner == address(0)) {
                if (id == 0) break;
                continue; // Skip auctions with no bids
            }

            prices[actualCount] = uint64PriceToUint256(settlementState.amount);
            ++actualCount;

            if (id == 0) break;
        }

        require(auctionCount == actualCount, 'Not enough history');
    }

    /**
     * @notice Get all past auction settlements starting at `startId` and settled before or at `endTimestamp`.
     * @param startId the first Noun ID to get prices for.
     * @param endTimestamp the latest timestamp for auctions
     * @param skipEmptyValues if true, skips nounder reward ids and ids with missing data
     * @return settlements An array of type `Settlement`, where each Settlement includes a timestamp,
     * the Noun ID of that auction, the winning bid amount, and the winner's address.
     */
    function getSettlementsFromIdtoTimestamp(
        uint256 startId,
        uint256 endTimestamp,
        bool skipEmptyValues
    ) public view returns (Settlement[] memory settlements) {
        uint256 maxId = auctionStorage.nounId;
        require(startId <= maxId, 'startId too large');
        settlements = new Settlement[](maxId - startId + 1);
        uint256 actualCount = 0;
        SettlementState memory settlementState;
        for (uint256 id = startId; id <= maxId; ++id) {
            settlementState = settlementHistory[id];

            if (skipEmptyValues && settlementState.blockTimestamp <= 1) continue;

            // don't include the currently auctioned noun if it hasn't settled
            if ((id == maxId) && (settlementState.blockTimestamp <= 1)) continue;

            if (settlementState.blockTimestamp > endTimestamp) break;

            settlements[actualCount] = Settlement({
                blockTimestamp: settlementState.blockTimestamp,
                amount: uint64PriceToUint256(settlementState.amount),
                winner: settlementState.winner,
                nounId: id,
                clientId: settlementState.clientId
            });
            ++actualCount;
        }

        if (settlements.length > actualCount) {
            // this assembly trims the settlements array, getting rid of unused cells
            assembly {
                mstore(settlements, actualCount)
            }
        }
    }

    /**
     * @notice Get a range of past auction settlements.
     * @dev Returns prices in chronological order, as opposed to `getSettlements(count)` which returns prices in reverse order.
     * Includes auctions with no bids (blockTimestamp will be > 1)
     * @param startId the first Noun ID to get prices for.
     * @param endId end Noun ID (up to, but not including).
     * @param skipEmptyValues if true, skips nounder reward ids and ids with missing data
     * @return settlements An array of type `Settlement`, where each Settlement includes a timestamp,
     * the Noun ID of that auction, the winning bid amount, and the winner's address.
     */
    function getSettlements(
        uint256 startId,
        uint256 endId,
        bool skipEmptyValues
    ) external view returns (Settlement[] memory settlements) {
        settlements = new Settlement[](endId - startId);
        uint256 actualCount = 0;

        SettlementState memory settlementState;
        for (uint256 id = startId; id < endId; ++id) {
            settlementState = settlementHistory[id];

            if (skipEmptyValues && settlementState.blockTimestamp <= 1) continue;

            settlements[actualCount] = Settlement({
                blockTimestamp: settlementState.blockTimestamp,
                amount: uint64PriceToUint256(settlementState.amount),
                winner: settlementState.winner,
                nounId: id,
                clientId: settlementState.clientId
            });
            ++actualCount;
        }

        if (settlements.length > actualCount) {
            // this assembly trims the settlements array, getting rid of unused cells
            assembly {
                mstore(settlements, actualCount)
            }
        }
    }

    /***
     * @notice Get the client ID that facilitated the winning bid for a Noun. Returns 0 if there is no settlement data
     * for the Noun in question, or if the winning bid was not facilitated by a registered client.
     */
    function biddingClient(uint256 nounId) external view returns (uint32) {
        return settlementHistory[nounId].clientId;
    }

    /**
     * @dev Convert an ETH price of 256 bits with 18 decimals, to 64 bits with 10 decimals.
     * Max supported value is 1844674407.3709551615 ETH.
     *
     */
    function ethPriceToUint64(uint256 ethPrice) internal pure returns (uint64) {
        return uint64(ethPrice / 1e8);
    }

    /**
     * @dev Convert a 64 bit 10 decimal price to a 256 bit 18 decimal price.
     */
    function uint64PriceToUint256(uint64 price) internal pure returns (uint256) {
        return uint256(price) * 1e8;
    }
}
