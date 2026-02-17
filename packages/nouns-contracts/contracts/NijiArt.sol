// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { SSTORE2 } from './libs/SSTORE2.sol';

/// @title Niji Art Storage - stores trait PNG data via SSTORE2
/// @notice Each trait is stored as raw PNG bytes in contract bytecode
contract NijiArt {
    /// @notice Thrown when caller is not the descriptor
    error SenderIsNotDescriptor();

    /// @notice The Niji descriptor address (only one allowed to add art)
    address public descriptor;

    /// @notice Trait category names
    string[] public traitNames;

    /// @notice Number of categories
    uint256 public traitCount;

    /// @notice Mapping: traitCategory => array of SSTORE2 pointers (one per image)
    mapping(uint256 => address[]) internal traitPointers;

    /// @notice Mapping: traitCategory => number of stored images
    mapping(uint256 => uint256) public traitImageCount;

    modifier onlyDescriptor() {
        if (msg.sender != descriptor) revert SenderIsNotDescriptor();
        _;
    }

    constructor(address _descriptor, string[] memory _traitNames) {
        descriptor = _descriptor;
        traitNames = _traitNames;
        traitCount = _traitNames.length;
    }

    /// @notice Store a batch of PNG images for a trait category
    /// @param traitId The trait category index
    /// @param pngDataArray Array of raw PNG bytes
    function addTraitImages(uint256 traitId, bytes[] calldata pngDataArray) external onlyDescriptor {
        for (uint256 i = 0; i < pngDataArray.length; i++) {
            address pointer = SSTORE2.write(pngDataArray[i]);
            traitPointers[traitId].push(pointer);
        }
        traitImageCount[traitId] += pngDataArray.length;
    }

    /// @notice Store a single PNG image for a trait category
    /// @param traitId The trait category index
    /// @param pngData Raw PNG bytes
    function addTraitImage(uint256 traitId, bytes calldata pngData) external onlyDescriptor {
        address pointer = SSTORE2.write(pngData);
        traitPointers[traitId].push(pointer);
        traitImageCount[traitId] += 1;
    }

    /// @notice Read a trait's PNG bytes
    /// @param traitId The trait category index
    /// @param imageIndex The image index within that category
    /// @return Raw PNG bytes
    function getTraitImage(uint256 traitId, uint256 imageIndex) external view returns (bytes memory) {
        return SSTORE2.read(traitPointers[traitId][imageIndex]);
    }

    /// @notice Get the number of images for a trait
    function getTraitImageCount(uint256 traitId) external view returns (uint256) {
        return traitPointers[traitId].length;
    }

    /// @notice Set the descriptor address
    function setDescriptor(address _descriptor) external onlyDescriptor {
        descriptor = _descriptor;
    }
}
