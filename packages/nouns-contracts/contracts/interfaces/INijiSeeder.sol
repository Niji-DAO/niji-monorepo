// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NijiSeeder
/// @author Niji DAO

pragma solidity ^0.8.20;

interface INijiSeeder {
    /// @notice Seed struct containing trait indices for each category
    /// @dev Each field represents the index within its trait category
    struct Seed {
        uint48 special;          // 0: special effects/overlays
        uint48 choker;           // 1: choker accessory
        uint48 headphone;        // 2: headphone accessory
        uint48 leftHand;         // 3: left hand item
        uint48 hat;              // 4: hat/headwear
        uint48 clothing;         // 5: clothing/outfit
        uint48 ear;              // 6: ear accessory
        uint48 back;             // 7: back layer (wings, cape, etc.)
        uint48 backDecoration;   // 8: back decoration
        uint48 background;       // 9: background pattern
        uint48 solidBackground;  // 10: solid background color
        uint48 hair;             // 11: hair style
    }

    /// @notice Generate a seed for a given token ID
    /// @param tokenId The token ID to generate a seed for
    /// @param descriptor The descriptor contract address (used for trait counts)
    /// @return The generated seed
    function generateSeed(uint256 tokenId, address descriptor) external view returns (Seed memory);
}
