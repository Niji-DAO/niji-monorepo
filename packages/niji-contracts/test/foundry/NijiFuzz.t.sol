// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import 'forge-std/Test.sol';
import { NijiArt } from '../../contracts/NijiArt.sol';
import { NijiDescriptor } from '../../contracts/NijiDescriptor.sol';
import { NijiSeeder } from '../../contracts/NijiSeeder.sol';
import { NijiToken } from '../../contracts/NijiToken.sol';
import { INijiSeeder } from '../../contracts/interfaces/INijiSeeder.sol';

contract NijiFuzz is Test {
    NijiArt art;
    NijiDescriptor descriptor;
    NijiSeeder seeder;
    NijiToken token;

    uint256 constant TRAIT_COUNT = 12;
    uint256 constant IMAGES_PER_TRAIT = 10;

    /// @dev Minimal valid PNG (1×1 transparent pixel)
    bytes constant SAMPLE_PNG = hex'89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489000000'
        hex'0a49444154789c63000100000500010d0a2db40000000049454e44ae426082';

    string[] traitNames;

    function setUp() public {
        // Build trait names
        traitNames = new string[](TRAIT_COUNT);
        traitNames[0] = 'special';
        traitNames[1] = 'choker';
        traitNames[2] = 'headphone';
        traitNames[3] = 'leftHand';
        traitNames[4] = 'hat';
        traitNames[5] = 'clothing';
        traitNames[6] = 'ear';
        traitNames[7] = 'back';
        traitNames[8] = 'backDecoration';
        traitNames[9] = 'background';
        traitNames[10] = 'solidBackground';
        traitNames[11] = 'hair';

        // Composite order (bottom to top)
        // SSOT alignment = packages/niji-contracts/scripts/niji-encoder.ts の NIJI_COMPOSITE_ORDER と同順。
        // user 指定 (Issue #3066) = [10, 9, 8, 7, 3, 5, 6, 0, 1, 4, 11, 2]
        uint256[] memory compositeOrder = new uint256[](TRAIT_COUNT);
        compositeOrder[0] = 10;
        compositeOrder[1] = 9;
        compositeOrder[2] = 8;
        compositeOrder[3] = 7;
        compositeOrder[4] = 3;
        compositeOrder[5] = 5;
        compositeOrder[6] = 6;
        compositeOrder[7] = 0;
        compositeOrder[8] = 1;
        compositeOrder[9] = 4;
        compositeOrder[10] = 11;
        compositeOrder[11] = 2;

        // Deploy contracts
        art = new NijiArt(address(this), traitNames);
        descriptor = new NijiDescriptor(address(art), 320, compositeOrder);
        seeder = new NijiSeeder(address(art));
        token = new NijiToken('Niji', 'NIJI', address(descriptor), address(seeder), 0);

        // Set descriptor on art, then transfer to this contract for image management
        art.setDescriptor(address(descriptor));
        art.transferDescriptor(address(this));

        // Populate images: IMAGES_PER_TRAIT per category
        bytes[] memory images = new bytes[](IMAGES_PER_TRAIT);
        for (uint256 j = 0; j < IMAGES_PER_TRAIT; j++) {
            images[j] = SAMPLE_PNG;
        }
        for (uint256 i = 0; i < TRAIT_COUNT; i++) {
            art.addTraitImages(i, images);
        }

        // Activate minting
        token.toggleMinting();

        // placeholder URI 設定 (Niji 仕様 ... mint 前に必須)
        token.setPlaceholderURI('ipfs://placeholder');
    }

    // =========================================================================
    //  Internal helper: seed → traitIndices
    // =========================================================================

    function _seedToTraitIndices(INijiSeeder.Seed memory seed) internal pure returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](TRAIT_COUNT);
        indices[0] = seed.special;
        indices[1] = seed.choker;
        indices[2] = seed.headphone;
        indices[3] = seed.leftHand;
        indices[4] = seed.hat;
        indices[5] = seed.clothing;
        indices[6] = seed.ear;
        indices[7] = seed.back;
        indices[8] = seed.backDecoration;
        indices[9] = seed.background;
        indices[10] = seed.solidBackground;
        indices[11] = seed.hair;
        return indices;
    }

    // =========================================================================
    //  Fuzz: generateSeedFromSource always produces valid trait indices
    // =========================================================================

    function testFuzz_generateSeedFromSource_validTraits(uint256 source) public {
        INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(source);
        uint256[] memory indices = _seedToTraitIndices(seed);

        // All traits must be < IMAGES_PER_TRAIT
        for (uint256 i = 0; i < TRAIT_COUNT; i++) {
            assertLt(indices[i], IMAGES_PER_TRAIT, string(abi.encodePacked(traitNames[i], ' out of range')));
        }
    }

    // =========================================================================
    //  Fuzz: generateSVG with valid traitIndices never reverts
    // =========================================================================

    function testFuzz_generateSVG_noRevert(uint256 source) public {
        uint256[] memory traitIndices = _seedToTraitIndices(seeder.generateSeedFromSource(source));

        string memory svg = descriptor.generateSVG(traitIndices);
        assertTrue(bytes(svg).length > 0, 'SVG should not be empty');
    }

    // =========================================================================
    //  Fuzz: generateSVG with SKIP_LAYER mixing never reverts
    // =========================================================================

    function testFuzz_generateSVG_withSkipLayers(uint256 source, uint256 skipMask) public {
        uint256[] memory traitIndices = _seedToTraitIndices(seeder.generateSeedFromSource(source));

        // Use skipMask bits to randomly set some layers to SKIP_LAYER
        for (uint256 i = 0; i < TRAIT_COUNT; i++) {
            if ((skipMask >> i) & 1 == 1) {
                traitIndices[i] = type(uint256).max;
            }
        }

        string memory svg = descriptor.generateSVG(traitIndices);
        assertTrue(bytes(svg).length > 0, 'SVG should not be empty');
    }

    // =========================================================================
    //  Fuzz: mintBatch with bounded quantity succeeds
    // =========================================================================

    function testFuzz_mintBatch_bounded(uint8 rawQuantity) public {
        // Bound to 1-50 to keep test fast
        uint256 quantity = bound(rawQuantity, 1, 50);

        uint256[] memory tokenIds = token.mintBatch(address(0xBEEF), quantity);
        assertEq(tokenIds.length, quantity, 'wrong number of minted tokens');

        // Verify all tokens exist
        for (uint256 i = 0; i < quantity; i++) {
            assertTrue(token.exists(tokenIds[i]), 'token should exist');
        }
    }

    // =========================================================================
    //  Fuzz: addTraitImage with valid traitId and non-empty data
    // =========================================================================

    function testFuzz_addTraitImage_validInput(uint8 rawTraitId) public {
        uint256 traitId = bound(rawTraitId, 0, TRAIT_COUNT - 1);

        uint256 countBefore = art.getTraitImageCount(traitId);
        art.addTraitImage(traitId, SAMPLE_PNG);
        assertEq(art.getTraitImageCount(traitId), countBefore + 1, 'image count should increase');
    }

    // =========================================================================
    //  Fuzz: _pickTrait modulo distribution (statistical)
    // =========================================================================

    function testFuzz_pickTrait_moduloDistribution() public {
        // Generate 1000 seeds and check trait 0 distribution across 10 buckets
        uint256[10] memory buckets;

        for (uint256 i = 0; i < 1000; i++) {
            INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(i);
            buckets[seed.special]++;
        }

        // With 10 images, each bucket should get ~100 hits.
        // Allow wide tolerance (20-200) to avoid flaky tests while catching severe bias.
        for (uint256 i = 0; i < IMAGES_PER_TRAIT; i++) {
            assertGt(buckets[i], 20, 'bucket underrepresented');
            assertLt(buckets[i], 200, 'bucket overrepresented');
        }
    }
}
