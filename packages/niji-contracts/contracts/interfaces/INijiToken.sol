// SPDX-License-Identifier: GPL-3.0

/// @title INijiToken - Interface for NijiToken with ERC721 + ERC721Enumerable + ERC721Votes
/// @author Niji DAO
/// @notice Combines IERC721Enumerable and IVotes for DAO governance compatibility
/// @dev Used by NijiDAO* contracts in sub PR 1-c.3 to replace the old token interface

pragma solidity ^0.8.20;

import { IERC721Enumerable } from '@openzeppelin/contracts-v5/token/ERC721/extensions/IERC721Enumerable.sol';
import { IERC721Metadata } from '@openzeppelin/contracts-v5/token/ERC721/extensions/IERC721Metadata.sol';
import { IVotes } from '@openzeppelin/contracts-v5/governance/utils/IVotes.sol';

interface INijiToken is IERC721Enumerable, IERC721Metadata, IVotes {
    /// @notice The current descriptor contract.
    function descriptor() external view returns (address);

    /// @notice The current seeder contract.
    function seeder() external view returns (address);

    /// @notice Get the seed for a token (legacy Niji-specific accessor)
    /// @param tokenId The token ID
    /// @return special The trait index for the special category
    function seeds(uint256 tokenId)
        external
        view
        returns (
            uint48 special,
            uint48 choker,
            uint48 headphone,
            uint48 leftHand,
            uint48 hat,
            uint48 clothing,
            uint48 ear,
            uint48 back,
            uint48 backDecoration,
            uint48 background,
            uint48 solidBackground,
            uint48 hair
        );

    /// @notice The current token ID counter
    /// @return Current token ID
    function currentTokenId() external view returns (uint256);

    /// @notice Mint a new Niji to a specific recipient (on-chain access control enforces minter-only; calling from a non-minter context will revert with NotMinter)
    /// @param to The recipient address
    /// @return tokenId The minted token ID
    function mint(address to) external returns (uint256);

    /// @notice Mint a new Niji to msg.sender (legacy governance compat for auction house)
    /// @dev Auction house contracts call `mint()` and expect to receive the token (then auction off via transferFrom).
    /// @return tokenId The minted token ID
    function mint() external returns (uint256);

    /// @notice The current minter address (legacy governance compat accessor)
    /// @return The minter address
    function minter() external view returns (address);

    /// @notice Burn a token (legacy auction house compat accessor).
    function burn(uint256 tokenId) external;

    /// @notice The current owner address.
    function owner() external view returns (address);

    // =============================================================
    //              GOVERNANCE SIGNATURE COMPAT (uint96)
    // =============================================================

    /// @notice Legacy historical vote balance (uint96 return for storage compatibility with NijiDAOVotes / NijiDAOProposals)
    /// @dev Wraps OZ ERC721Votes.getPastVotes() with a uint256 → uint96 downcast (reverts on overflow).
    /// @param account The voter address
    /// @param blockNumber The historical block
    /// @return The voting power at `blockNumber` as uint96
    function getPriorVotes(address account, uint256 blockNumber) external view returns (uint96);

    /// @notice Legacy current vote balance (uint96 return for governance signature compat)
    /// @dev Wraps OZ ERC721Votes.getVotes() with a uint256 → uint96 downcast (reverts on overflow).
    /// @param account The voter address
    /// @return The current voting power as uint96
    function getCurrentVotes(address account) external view returns (uint96);
}
