// SPDX-License-Identifier: GPL-3.0

/// @title INijiToken - Interface for NijiToken with ERC721 + ERC721Enumerable + ERC721Votes
/// @author Niji DAO
/// @notice Combines IERC721Enumerable and IVotes for DAO governance compatibility
/// @dev Used by NijiDAO* contracts in sub PR 1-c.3 to replace INounsToken references

pragma solidity ^0.8.20;

import { IERC721Enumerable } from '@openzeppelin/contracts-v5/token/ERC721/extensions/IERC721Enumerable.sol';
import { IVotes } from '@openzeppelin/contracts-v5/governance/utils/IVotes.sol';

interface INijiToken is IERC721Enumerable, IVotes {
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

    /// @notice Mint a new Niji (minter-only)
    /// @param to The recipient address
    /// @return tokenId The minted token ID
    function mint(address to) external returns (uint256);
}
