// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NounsArt

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

import { IInflator } from './IInflator.sol';

interface INounsArt {
    error SenderIsNotDescriptor();

    error EmptyPalette();

    error BadPaletteLength();

    error EmptyBytes();

    error BadDecompressedLength();

    error BadImageCount();

    error ImageNotFound();

    error PaletteNotFound();

    event DescriptorUpdated(address oldDescriptor, address newDescriptor);

    event InflatorUpdated(address oldInflator, address newInflator);

    event BackgroundsAdded(uint256 count);

    event PaletteSet(uint8 paletteIndex);

    event BackgroundDecorationsAdded(uint16 count);

    event SpecialsAdded(uint16 count);

    event LeftHandsAdded(uint16 count);

    event BacksAdded(uint16 count);

    event EarsAdded(uint16 count);

    event ChokersAdded(uint16 count);

    event ClothesAdded(uint16 count);

    event HairsAdded(uint16 count);

    event HeadphonesAdded(uint16 count);

    event HatsAdded(uint16 count);

    event BackDecorationsAdded(uint16 count);

    struct NounArtStoragePage {
        uint16 imageCount;
        uint80 decompressedLength;
        address pointer;
    }

    struct Trait {
        NounArtStoragePage[] storagePages;
        uint256 storedImagesCount;
    }

    function descriptor() external view returns (address);

    function inflator() external view returns (IInflator);

    function setDescriptor(address descriptor) external;

    function setInflator(IInflator inflator) external;

    function addManyBackgrounds(string[] calldata _backgrounds) external;

    function addBackground(string calldata _background) external;

    function palettes(uint8 paletteIndex) external view returns (bytes memory);

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

    function backgroundCount() external view returns (uint256);

    function backgroundDecorationCount() external view returns (uint256);

    function specialCount() external view returns (uint256);

    function leftHandCount() external view returns (uint256);

    function backCount() external view returns (uint256);

    function earCount() external view returns (uint256);

    function chokerCount() external view returns (uint256);

    function clotheCount() external view returns (uint256);

    function hairCount() external view returns (uint256);

    function headphoneCount() external view returns (uint256);

    function hatCount() external view returns (uint256);

    function backDecorationCount() external view returns (uint256);

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

    function getBackgroundDecorationsTrait() external view returns (Trait memory);

    function getSpecialsTrait() external view returns (Trait memory);

    function getLeftHandsTrait() external view returns (Trait memory);

    function getBacksTrait() external view returns (Trait memory);

    function getEarsTrait() external view returns (Trait memory);

    function getChokersTrait() external view returns (Trait memory);

    function getClothesTrait() external view returns (Trait memory);

    function getHairsTrait() external view returns (Trait memory);

    function getHeadphonesTrait() external view returns (Trait memory);

    function getHatsTrait() external view returns (Trait memory);

    function getBackDecorationsTrait() external view returns (Trait memory);
}
