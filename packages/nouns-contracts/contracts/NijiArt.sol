// SPDX-License-Identifier: GPL-3.0

/// @title Niji Art Storage - stores trait PNG data via SSTORE2
/// @author Niji DAO
/// @notice Each trait is stored as raw PNG bytes in contract bytecode using SSTORE2
/// @dev This contract manages PNG image storage for the Niji generative art system

pragma solidity ^0.8.6;

import { SSTORE2 } from './libs/SSTORE2.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

contract NijiArt is Ownable {
    // Note: Using OpenZeppelin 4.x compatible Ownable (no constructor args)
    // =============================================================
    //                           ERRORS
    // =============================================================

    /// @notice Thrown when caller is not the descriptor
    error SenderIsNotDescriptor();

    /// @notice Thrown when trait ID is invalid (out of bounds)
    error InvalidTraitId(uint256 traitId, uint256 maxTraitId);

    /// @notice Thrown when image index is invalid (out of bounds)
    error InvalidImageIndex(uint256 traitId, uint256 imageIndex, uint256 maxIndex);

    /// @notice Thrown when trying to set an empty descriptor address
    error EmptyDescriptorAddress();

    /// @notice Thrown when PNG data is empty
    error EmptyPngData();

    // =============================================================
    //                           EVENTS
    // =============================================================

    /// @notice Emitted when a trait image is added
    /// @param traitId The trait category index
    /// @param imageIndex The index of the newly added image
    /// @param pointer The SSTORE2 pointer address
    event TraitImageAdded(uint256 indexed traitId, uint256 imageIndex, address pointer);

    /// @notice Emitted when multiple trait images are added
    /// @param traitId The trait category index
    /// @param startIndex The starting index of added images
    /// @param count Number of images added
    event TraitImagesAdded(uint256 indexed traitId, uint256 startIndex, uint256 count);

    /// @notice Emitted when the descriptor is updated
    /// @param oldDescriptor The previous descriptor address
    /// @param newDescriptor The new descriptor address
    event DescriptorUpdated(address indexed oldDescriptor, address indexed newDescriptor);

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice The Niji descriptor address (only one allowed to add art)
    address public descriptor;

    /// @notice Trait category names (e.g., "background", "hair", "clothing")
    string[] public traitNames;

    /// @notice Number of trait categories
    uint256 public traitCount;

    /// @notice Mapping: traitCategory => array of SSTORE2 pointers (one per image)
    mapping(uint256 => address[]) internal traitPointers;

    // =============================================================
    //                           MODIFIERS
    // =============================================================

    /// @notice Restricts function access to the descriptor contract
    modifier onlyDescriptor() {
        if (msg.sender != descriptor) revert SenderIsNotDescriptor();
        _;
    }

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /// @notice Creates a new NijiArt contract
    /// @param _descriptor The descriptor contract address (can add art)
    /// @param _traitNames Array of trait category names
    constructor(
        address _descriptor,
        string[] memory _traitNames
    ) {
        if (_descriptor == address(0)) revert EmptyDescriptorAddress();

        descriptor = _descriptor;
        traitNames = _traitNames;
        traitCount = _traitNames.length;
        // Owner is automatically set to msg.sender by OpenZeppelin Ownable
    }

    // =============================================================
    //                      WRITE FUNCTIONS
    // =============================================================

    /// @notice Store a batch of PNG images for a trait category
    /// @param traitId The trait category index
    /// @param pngDataArray Array of raw PNG bytes
    /// @dev Each PNG is stored via SSTORE2 as contract bytecode
    function addTraitImages(uint256 traitId, bytes[] calldata pngDataArray) external onlyDescriptor {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);

        uint256 startIndex = traitPointers[traitId].length;

        for (uint256 i = 0; i < pngDataArray.length; ) {
            if (pngDataArray[i].length == 0) revert EmptyPngData();

            address pointer = SSTORE2.write(pngDataArray[i]);
            traitPointers[traitId].push(pointer);

            unchecked { ++i; }
        }

        emit TraitImagesAdded(traitId, startIndex, pngDataArray.length);
    }

    /// @notice Store a single PNG image for a trait category
    /// @param traitId The trait category index
    /// @param pngData Raw PNG bytes
    /// @dev PNG is stored via SSTORE2 as contract bytecode
    function addTraitImage(uint256 traitId, bytes calldata pngData) external onlyDescriptor {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);
        if (pngData.length == 0) revert EmptyPngData();

        address pointer = SSTORE2.write(pngData);
        uint256 imageIndex = traitPointers[traitId].length;
        traitPointers[traitId].push(pointer);

        emit TraitImageAdded(traitId, imageIndex, pointer);
    }

    /// @notice Set the descriptor address
    /// @param _descriptor New descriptor address
    /// @dev Only callable by the current descriptor
    function setDescriptor(address _descriptor) external onlyDescriptor {
        if (_descriptor == address(0)) revert EmptyDescriptorAddress();

        address oldDescriptor = descriptor;
        descriptor = _descriptor;

        emit DescriptorUpdated(oldDescriptor, _descriptor);
    }

    /// @notice Transfer descriptor role to a new address (owner only)
    /// @param _descriptor New descriptor address
    /// @dev Allows owner to reassign descriptor if needed
    function transferDescriptor(address _descriptor) external onlyOwner {
        if (_descriptor == address(0)) revert EmptyDescriptorAddress();

        address oldDescriptor = descriptor;
        descriptor = _descriptor;

        emit DescriptorUpdated(oldDescriptor, _descriptor);
    }

    // =============================================================
    //                      READ FUNCTIONS
    // =============================================================

    /// @notice Read a trait's PNG bytes
    /// @param traitId The trait category index
    /// @param imageIndex The image index within that category
    /// @return Raw PNG bytes
    function getTraitImage(uint256 traitId, uint256 imageIndex) external view returns (bytes memory) {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);

        address[] storage pointers = traitPointers[traitId];
        if (imageIndex >= pointers.length) {
            revert InvalidImageIndex(traitId, imageIndex, pointers.length > 0 ? pointers.length - 1 : 0);
        }

        return SSTORE2.read(pointers[imageIndex]);
    }

    /// @notice Get the number of images for a trait
    /// @param traitId The trait category index
    /// @return Number of images stored for this trait
    function getTraitImageCount(uint256 traitId) external view returns (uint256) {
        return traitPointers[traitId].length;
    }

    /// @notice Get all trait names
    /// @return Array of trait category names
    function getTraitNames() external view returns (string[] memory) {
        return traitNames;
    }

    /// @notice Get a specific trait name
    /// @param traitId The trait category index
    /// @return The trait name
    function getTraitName(uint256 traitId) external view returns (string memory) {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);
        return traitNames[traitId];
    }

    /// @notice Get the SSTORE2 pointer for a specific trait image
    /// @param traitId The trait category index
    /// @param imageIndex The image index
    /// @return The SSTORE2 pointer address
    function getTraitPointer(uint256 traitId, uint256 imageIndex) external view returns (address) {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);

        address[] storage pointers = traitPointers[traitId];
        if (imageIndex >= pointers.length) {
            revert InvalidImageIndex(traitId, imageIndex, pointers.length > 0 ? pointers.length - 1 : 0);
        }

        return pointers[imageIndex];
    }

    /// @notice Get all SSTORE2 pointers for a trait category
    /// @param traitId The trait category index
    /// @return Array of SSTORE2 pointer addresses
    function getTraitPointers(uint256 traitId) external view returns (address[] memory) {
        if (traitId >= traitCount) revert InvalidTraitId(traitId, traitCount - 1);
        return traitPointers[traitId];
    }
}
