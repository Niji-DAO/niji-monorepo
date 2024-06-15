// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsDescriptor

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
import { INounsDescriptorMinimal } from './INounsDescriptorMinimal.sol';

interface INounsDescriptor is INounsDescriptorMinimal {
    event PartsLocked();

    event DataURIToggled(bool enabled);

    event BaseURIUpdated(string baseURI);

    function arePartsLocked() external returns (bool);

    function isDataURIEnabled() external returns (bool);

    function baseURI() external returns (string memory);

    function palettes(uint8 paletteIndex, uint256 colorIndex) external view returns (string memory);

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

    function addManyColorsToPalette(uint8 paletteIndex, string[] calldata newColors) external;

    function addManyBackgrounds(string[] calldata backgrounds) external;

    function addManyBackgroundDecorations(bytes[] calldata bodies) external;

    function addManySpecials(bytes[] calldata bodies) external;

    function addManyLeftHands(bytes[] calldata bodies) external;

    function addManyBacks(bytes[] calldata bodies) external;

    function addManyEars(bytes[] calldata bodies) external;

    function addManyChokers(bytes[] calldata bodies) external;

    function addManyClothes(bytes[] calldata bodies) external;

    function addManyHairs(bytes[] calldata bodies) external;

    function addManyHeadphones(bytes[] calldata bodies) external;

    function addManyHats(bytes[] calldata bodies) external;

    function addManyBackDecorations(bytes[] calldata bodies) external;

    function addColorToPalette(uint8 paletteIndex, string calldata color) external;

    function addBackground(string calldata background) external;

    function addBackgroundDecoration(bytes calldata body) external;

    function addSpecial(bytes calldata body) external;

    function addLeftHand(bytes calldata body) external;

    function addBack(bytes calldata body) external;

    function addEar(bytes calldata body) external;

    function addChoker(bytes calldata body) external;

    function addClothes(bytes calldata body) external;

    function addHair(bytes calldata body) external;

    function addHeadphone(bytes calldata body) external;

    function addHat(bytes calldata body) external;

    function addBackDecoration(bytes calldata body) external;

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
