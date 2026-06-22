// SPDX-License-Identifier: GPL-3.0

/// @title NijiSeeder - generates random trait seeds for Niji NFTs
/// @author Niji DAO
/// @notice Deterministically generates trait combinations based on token ID and block data
/// @dev Uses keccak256 hashing with block properties for pseudo-randomness

pragma solidity ^0.8.20;

import { INijiSeeder } from './interfaces/INijiSeeder.sol';
import { NijiArt } from './NijiArt.sol';
import { Ownable2Step, Ownable } from '@openzeppelin/contracts-v5/access/Ownable2Step.sol';

contract NijiSeeder is INijiSeeder, Ownable2Step {
    // =============================================================
    //                           ERRORS
    // =============================================================

    /// @notice Thrown when art address is invalid
    error InvalidArtAddress();

    /// @notice Thrown when renounceOwnership is called (disabled to prevent contract becoming unowned)
    error RenounceOwnershipDisabled();

    // =============================================================
    //                           EVENTS
    // =============================================================

    /// @notice Emitted when the art contract is updated
    /// @param oldArt The previous art contract address
    /// @param newArt The new art contract address
    event ArtUpdated(address indexed oldArt, address indexed newArt);

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice The art contract for reading trait counts
    NijiArt public art;

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /// @notice Creates a new NijiSeeder contract
    /// @param _art The art storage contract address
    constructor(address _art) Ownable(msg.sender) {
        if (_art == address(0)) revert InvalidArtAddress();
        art = NijiArt(_art);
    }

    // =============================================================
    //                      SEED GENERATION
    // =============================================================

    /// @notice Generate a seed for a given token ID
    /// @param tokenId The token ID to generate a seed for
    /// @param descriptor The descriptor contract address (unused, kept for interface compatibility)
    /// @return seed The generated seed with trait indices
    function generateSeed(uint256 tokenId, address descriptor) external view override returns (Seed memory) {
        // Use descriptor parameter to avoid unused variable warning
        descriptor;

        uint256 pseudorandom = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    tokenId,
                    block.timestamp,
                    block.prevrandao
                )
            )
        );

        return Seed({
            special: uint48(_pickTrait(0, pseudorandom)),
            choker: uint48(_pickTrait(1, pseudorandom >> 16)),
            headphone: uint48(_pickTrait(2, pseudorandom >> 32)),
            leftHand: uint48(_pickTrait(3, pseudorandom >> 48)),
            hat: uint48(_pickTrait(4, pseudorandom >> 64)),
            clothing: uint48(_pickTrait(5, pseudorandom >> 80)),
            ear: uint48(_pickTrait(6, pseudorandom >> 96)),
            back: uint48(_pickTrait(7, pseudorandom >> 112)),
            backDecoration: uint48(_pickTrait(8, pseudorandom >> 128)),
            background: uint48(_pickTrait(9, pseudorandom >> 144)),
            solidBackground: uint48(_pickTrait(10, pseudorandom >> 160)),
            hair: uint48(_pickTrait(11, pseudorandom >> 176))
        });
    }

    /// @notice Generate a seed with a specific random source (for testing/preview)
    /// @param randomSource The random source value
    /// @return seed The generated seed with trait indices
    function generateSeedFromSource(uint256 randomSource) external view returns (Seed memory) {
        return Seed({
            special: uint48(_pickTrait(0, randomSource)),
            choker: uint48(_pickTrait(1, randomSource >> 16)),
            headphone: uint48(_pickTrait(2, randomSource >> 32)),
            leftHand: uint48(_pickTrait(3, randomSource >> 48)),
            hat: uint48(_pickTrait(4, randomSource >> 64)),
            clothing: uint48(_pickTrait(5, randomSource >> 80)),
            ear: uint48(_pickTrait(6, randomSource >> 96)),
            back: uint48(_pickTrait(7, randomSource >> 112)),
            backDecoration: uint48(_pickTrait(8, randomSource >> 128)),
            background: uint48(_pickTrait(9, randomSource >> 144)),
            solidBackground: uint48(_pickTrait(10, randomSource >> 160)),
            hair: uint48(_pickTrait(11, randomSource >> 176))
        });
    }

    /// @notice Pick a trait index based on trait count and randomness
    /// @param traitId The trait category ID
    /// @param randomValue The random value to use for selection
    /// @return The selected trait index
    function _pickTrait(uint256 traitId, uint256 randomValue) internal view returns (uint256) {
        uint256 traitCount = art.getTraitImageCount(traitId);

        // If no traits available, return SKIP_LAYER (type(uint256).max)
        if (traitCount == 0) {
            return type(uint256).max;
        }

        return randomValue % traitCount;
    }

    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================

    /// @notice Set the art storage contract address
    /// @param _art New art contract address
    function setArt(address _art) external onlyOwner {
        if (_art == address(0)) revert InvalidArtAddress();

        address oldArt = address(art);
        art = NijiArt(_art);

        emit ArtUpdated(oldArt, _art);
    }

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================

    /// @notice Get the number of available traits for a category
    /// @param traitId The trait category ID
    /// @return Number of available trait images
    function getTraitCount(uint256 traitId) external view returns (uint256) {
        return art.getTraitImageCount(traitId);
    }

    /// @notice Get all trait counts
    /// @return Array of trait counts for each category
    function getAllTraitCounts() external view returns (uint256[] memory) {
        uint256 traitCount = art.traitCount();
        uint256[] memory counts = new uint256[](traitCount);

        for (uint256 i = 0; i < traitCount; ) {
            counts[i] = art.getTraitImageCount(i);
            unchecked { ++i; }
        }

        return counts;
    }

    /// @notice Disabled to prevent the contract from becoming permanently unowned.
    /// @dev Always reverts. Use `transferOwnership` (Ownable2Step two-step transfer) for ownership change instead.
    function renounceOwnership() public view override onlyOwner {
        revert RenounceOwnershipDisabled();
    }
}
