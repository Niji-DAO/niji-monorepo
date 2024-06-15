// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsDescriptorV2

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

pragma solidity ^0.8.6;

import { INounsSeeder } from './INounsSeeder.sol';
import { ISVGRenderer } from './ISVGRenderer.sol';
import { INounsArt } from './INounsArt.sol';
import { INounsDescriptorMinimal } from './INounsDescriptorMinimal.sol';

interface INounsDescriptorV2 is INounsDescriptorMinimal {
    event PartsLocked();

    event DataURIToggled(bool enabled);

    event BaseURIUpdated(string baseURI);

    event ArtUpdated(INounsArt art);

    event RendererUpdated(ISVGRenderer renderer);

    error EmptyPalette();
    error BadPaletteLength();
    error IndexNotFound();

    function arePartsLocked() external returns (bool);

    function isDataURIEnabled() external returns (bool);

    function baseURI() external returns (string memory);

    function palettes(uint8 paletteIndex) external view returns (bytes memory);

    function backgrounds(uint256 index) external view returns (string memory);

    function backgroundDecorations(uint256 index) external view returns (bytes memory);

    function specials(uint256 index) external view returns (bytes memory);

    function leftHands(uint256 index) external view returns (bytes memory);

    function backs(uint256 index) external view returns (bytes memory);

    function ears(uint256 index) external view returns (bytes memory);

    function chokers(uint256 index) external view returns (bytes memory);

    function clothes(uint256 index) external view returns (bytes memory);

    function hairs(uint256 index) external view returns (bytes memory);

    function headphones(uint256 index) external view returns (bytes memory);

    function hats(uint256 index) external view returns (bytes memory);

    function backDecorations(uint256 index) external view returns (bytes memory);

    function backgroundCount() external view override returns (uint256);

    function backgroundDecorationCount() external view override returns (uint256);

    function specialCount() external view override returns (uint256);

    function leftHandCount() external view override returns (uint256);

    function backCount() external view override returns (uint256);

    function earCount() external view override returns (uint256);

    function chokerCount() external view override returns (uint256);

    function clotheCount() external view override returns (uint256);

    function hairCount() external view override returns (uint256);

    function headphoneCount() external view override returns (uint256);

    function hatCount() external view override returns (uint256);

    function backDecorationCount() external view override returns (uint256);

    function addManyBackgrounds(string[] calldata backgrounds) external;

    function addBackground(string calldata background) external;

    function setPalette(uint8 paletteIndex, bytes calldata palette) external;

    function addBackgroundDecorations(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addSpecials(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addLeftHands(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addBacks(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addEars(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addChokers(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addClothes(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHairs(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHeadphones(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHats(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addBackDecorations(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function setPalettePointer(uint8 paletteIndex, address pointer) external;

    function addBackgroundDecorationsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addSpecialsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addLeftHandsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addBacksFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addEarsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addChokersFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addClothesFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHairsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHeadphonesFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addHatsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function addBackDecorationsFromPointer(
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) external;

    function lockParts() external;

    function toggleDataURIEnabled() external;

    function setBaseURI(string calldata baseURI) external;

    function tokenURI(uint256 tokenId, INounsSeeder.Seed memory seed) external view override returns (string memory);

    function dataURI(uint256 tokenId, INounsSeeder.Seed memory seed) external view override returns (string memory);

    function genericDataURI(
        string calldata name,
        string calldata description,
        INounsSeeder.Seed memory seed
    ) external view returns (string memory);

    function generateSVGImage(INounsSeeder.Seed memory seed) external view returns (string memory);
}
