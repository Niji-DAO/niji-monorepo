// SPDX-License-Identifier: GPL-3.0

/// @title Interface for Noun Auction Houses V2

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

pragma solidity ^0.8.19;

interface INijiAuctionHouseV3 {
    struct AuctionV2 {
        // ID for the Noun (ERC721 token ID)
        uint96 nounId;
        // ID of the client that facilitated the latest bid, used for client rewards
        uint32 clientId;
        // The current highest bid amount
        uint128 amount;
        // The time that the auction started
        uint40 startTime;
        // The time that the auction is scheduled to end
        uint40 endTime;
        // The address of the current highest bid
        address payable bidder;
        // Whether or not the auction has been settled
        bool settled;
    }

    /// @dev We use this struct as the return value of the `auction` function, to maintain backwards compatibility.
    struct AuctionV2View {
        // ID for the Noun (ERC721 token ID)
        uint96 nounId;
        // The current highest bid amount
        uint128 amount;
        // The time that the auction started
        uint40 startTime;
        // The time that the auction is scheduled to end
        uint40 endTime;
        // The address of the current highest bid
        address payable bidder;
        // Whether or not the auction has been settled
        bool settled;
    }

    struct SettlementState {
        // The block.timestamp when the auction was settled.
        uint32 blockTimestamp;
        // The winning bid amount, with 10 decimal places (reducing accuracy to save bits).
        uint64 amount;
        // The address of the auction winner.
        address winner;
        // ID of the client that facilitated the winning bid, used for client rewards.
        uint32 clientId;
        // Used only to warm up the storage slot for clientId without setting the clientId value.
        bool slotWarmedUp;
    }

    struct Settlement {
        // The block.timestamp when the auction was settled.
        uint32 blockTimestamp;
        // The winning bid amount, converted from 10 decimal places to 18, for better client UX.
        uint256 amount;
        // The address of the auction winner.
        address winner;
        // ID for the Noun (ERC721 token ID).
        uint256 nounId;
        // ID of the client that facilitated the winning bid, used for client rewards
        uint32 clientId;
    }

    /// @dev Using this struct when setting historic prices, and excluding clientId to save gas.
    struct SettlementNoClientId {
        // The block.timestamp when the auction was settled.
        uint32 blockTimestamp;
        // The winning bid amount, converted from 10 decimal places to 18, for better client UX.
        uint256 amount;
        // The address of the auction winner.
        address winner;
        // ID for the Noun (ERC721 token ID).
        uint256 nounId;
    }

    event AuctionCreated(uint256 indexed nounId, uint256 startTime, uint256 endTime);

    event AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended);

    event AuctionBidWithClientId(uint256 indexed nounId, uint256 value, uint32 indexed clientId);

    /**
     * @notice Fiat 代理入札で追加 emit される event。
     *         payer = 実際に msg.value を送った address (relayer / 運営 EOA)。
     *         recipient = NFT を最終的に受け取る address (fiat 支払 user の wallet)。
     *         subgraph 側はこの event を join して bidder 表示を recipient に置換する。
     */
    event BidPlacedFor(
        uint256 indexed nounId,
        address indexed payer,
        address indexed recipient,
        uint256 value,
        bool extended
    );

    event RelayerGranted(address indexed relayer);

    event RelayerRevoked(address indexed relayer);

    event AuctionExtended(uint256 indexed nounId, uint256 endTime);

    event AuctionSettled(uint256 indexed nounId, address winner, uint256 amount);

    event AuctionSettledWithClientId(uint256 indexed nounId, uint32 indexed clientId);

    event AuctionTimeBufferUpdated(uint256 timeBuffer);

    event AuctionReservePriceUpdated(uint256 reservePrice);

    event AuctionMinBidIncrementPercentageUpdated(uint256 minBidIncrementPercentage);

    event SanctionsOracleSet(address newSanctionsOracle);

    function settleAuction() external;

    function settleCurrentAndCreateNewAuction() external;

    function createBid(uint256 nounId) external payable;

    function createBid(uint256 nounId, uint32 clientId) external payable;

    /**
     * @notice Fiat 代理入札用。 relayer が msg.sender で ETH を送りつつ、
     *         recipient を NFT 受取先として記録する。 refund は payer (relayer) に返る。
     * @dev onlyRelayer gate、 権限は grantRelayer / revokeRelayer で owner が管理。
     * @param nounId auction 対象 nounId
     * @param recipient NFT を最終的に受け取る address (fiat 支払 user の wallet)
     */
    function createBidFor(uint256 nounId, address recipient) external payable;

    /**
     * @notice createBidFor 版 clientId 付き。
     */
    function createBidFor(uint256 nounId, address recipient, uint32 clientId) external payable;

    function grantRelayer(address relayer) external;

    function revokeRelayer(address relayer) external;

    function isRelayer(address relayer) external view returns (bool);

    /// @notice fiat 経路で bid した場合の payer (relayer) を nounId 単位で返す。
    function bidPayerOf(uint256 nounId) external view returns (address);

    /// @notice fiat 経路で bid した場合の recipient (NFT 受取先) を nounId 単位で返す。
    function bidRecipientOf(uint256 nounId) external view returns (address);

    function pause() external;

    function unpause() external;

    function setTimeBuffer(uint56 timeBuffer) external;

    function setReservePrice(uint192 reservePrice) external;

    function setMinBidIncrementPercentage(uint8 minBidIncrementPercentage) external;

    function setSanctionsOracle(address newSanctionsOracle) external;

    function auction() external view returns (AuctionV2View memory);

    function getSettlements(
        uint256 auctionCount,
        bool skipEmptyValues
    ) external view returns (Settlement[] memory settlements);

    function getPrices(uint256 auctionCount) external view returns (uint256[] memory prices);

    function getSettlements(
        uint256 startId,
        uint256 endId,
        bool skipEmptyValues
    ) external view returns (Settlement[] memory settlements);

    function getSettlementsFromIdtoTimestamp(
        uint256 startId,
        uint256 endTimestamp,
        bool skipEmptyValues
    ) external view returns (Settlement[] memory settlements);

    function warmUpSettlementState(uint256 startId, uint256 endId) external;

    function duration() external view returns (uint256);

    function biddingClient(uint256 nounId) external view returns (uint32 clientId);
}
