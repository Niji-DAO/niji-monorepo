// SPDX-License-Identifier: GPL-3.0

/// @title NijiDescriptor - generates SVG with embedded PNG layers
/// @author Niji DAO
/// @notice Composes trait layers as PNG <image> tags inside an SVG for high-quality on-chain art
/// @dev This contract generates tokenURI with embedded SVG containing base64-encoded PNG layers

pragma solidity ^0.8.20;

import { Base64 } from 'base64-sol/base64.sol';
import { NijiArt } from './NijiArt.sol';
import { Strings } from '@openzeppelin/contracts-v5/utils/Strings.sol';
import { Ownable2Step, Ownable } from '@openzeppelin/contracts-v5/access/Ownable2Step.sol';

contract NijiDescriptor is Ownable2Step {
    using Strings for uint256;

    // =============================================================
    //                           ERRORS
    // =============================================================

    /// @notice Thrown when composite order length doesn't match trait count
    error InvalidCompositeOrderLength(uint256 provided, uint256 expected);

    /// @notice Thrown when resolution is zero
    error InvalidResolution();

    /// @notice Thrown when art address is empty
    error EmptyArtAddress();

    /// @notice Thrown when trait indices array is empty
    error EmptyTraitIndices();

    // =============================================================
    //                           EVENTS
    // =============================================================

    /// @notice Emitted when the art contract is updated
    /// @param oldArt The previous art contract address
    /// @param newArt The new art contract address
    event ArtUpdated(address indexed oldArt, address indexed newArt);

    /// @notice Emitted when resolution is updated
    /// @param oldResolution The previous resolution
    /// @param newResolution The new resolution
    event ResolutionUpdated(uint256 oldResolution, uint256 newResolution);

    /// @notice Emitted when composite order is updated
    /// @param newCompositeOrder The new composite order array
    event CompositeOrderUpdated(uint256[] newCompositeOrder);

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice The art storage contract containing PNG data
    NijiArt public art;

    /// @notice Image resolution in pixels (e.g., 320 for 320x320)
    uint256 public resolution;

    /// @notice Trait composition order (bottom to top layer stacking)
    /// @dev Index i contains traitId to render at layer i
    uint256[] public compositeOrder;

    // =============================================================
    //                           CONSTANTS
    // =============================================================

    /// @notice Skip layer marker - use type(uint256).max to skip a trait layer
    uint256 public constant SKIP_LAYER = type(uint256).max;

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /// @notice Creates a new NijiDescriptor contract
    /// @param _art The art storage contract address
    /// @param _resolution Image resolution in pixels
    /// @param _compositeOrder Array defining layer stacking order
    constructor(
        address _art,
        uint256 _resolution,
        uint256[] memory _compositeOrder
    ) Ownable(msg.sender) {
        if (_art == address(0)) revert EmptyArtAddress();
        if (_resolution == 0) revert InvalidResolution();

        art = NijiArt(_art);
        resolution = _resolution;
        compositeOrder = _compositeOrder;
    }

    // =============================================================
    //                      TOKENURI GENERATION
    // =============================================================

    /// @notice Generate the full tokenURI (data URI with JSON + embedded SVG)
    /// @param tokenId The token ID
    /// @param traitIndices Array of trait indices for each category
    /// @return Data URI containing JSON metadata with embedded SVG
    function tokenURI(uint256 tokenId, uint256[] memory traitIndices) external view returns (string memory) {
        if (traitIndices.length == 0) revert EmptyTraitIndices();

        string memory svgBase64 = generateSVGBase64(traitIndices);
        string memory attributes = _generateAttributes(traitIndices);

        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"Niji #',
                            tokenId.toString(),
                            '", "description":"Niji is a fully on-chain generative art collection featuring high-quality PNG images.", "image": "data:image/svg+xml;base64,',
                            svgBase64,
                            '", "attributes":',
                            attributes,
                            '}'
                        )
                    )
                )
            )
        );
    }

    /// @notice Generate tokenURI with custom name and description
    /// @param tokenId The token ID
    /// @param traitIndices Array of trait indices for each category
    /// @param name Custom name for the token
    /// @param description Custom description for the token
    /// @return Data URI containing JSON metadata with embedded SVG
    function tokenURIWithMetadata(
        uint256 tokenId,
        uint256[] memory traitIndices,
        string memory name,
        string memory description
    ) external view returns (string memory) {
        if (traitIndices.length == 0) revert EmptyTraitIndices();

        string memory svgBase64 = generateSVGBase64(traitIndices);
        string memory attributes = _generateAttributes(traitIndices);

        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name,
                            ' #',
                            tokenId.toString(),
                            '", "description":"',
                            description,
                            '", "image": "data:image/svg+xml;base64,',
                            svgBase64,
                            '", "attributes":',
                            attributes,
                            '}'
                        )
                    )
                )
            )
        );
    }

    // =============================================================
    //                      ATTRIBUTES GENERATION
    // =============================================================

    /// @notice Generate JSON attributes array from trait indices
    /// @param traitIndices Array of trait indices for each category
    /// @return JSON attributes array string (e.g., [{"trait_type":"hair","value":"2"},…])
    function _generateAttributes(uint256[] memory traitIndices) internal view returns (string memory) {
        bytes memory attrs = bytes('[');
        bool first = true;
        for (uint256 i = 0; i < traitIndices.length; ) {
            if (traitIndices[i] != SKIP_LAYER) {
                if (!first) attrs = abi.encodePacked(attrs, ',');
                attrs = abi.encodePacked(
                    attrs,
                    '{"trait_type":"',
                    art.getTraitName(i),
                    '","value":"',
                    traitIndices[i].toString(),
                    '"}'
                );
                first = false;
            }
            unchecked { ++i; }
        }
        return string(abi.encodePacked(attrs, ']'));
    }

    // =============================================================
    //                      SVG GENERATION
    // =============================================================

    /// @notice Generate SVG as base64 string
    /// @param traitIndices Array of trait indices for each category
    /// @return Base64-encoded SVG string
    function generateSVGBase64(uint256[] memory traitIndices) public view returns (string memory) {
        return Base64.encode(bytes(generateSVG(traitIndices)));
    }

    /// @notice Generate raw SVG string with embedded PNG layers
    /// @param traitIndices Array of trait indices for each category
    /// @return Raw SVG markup string
    function generateSVG(uint256[] memory traitIndices) public view returns (string memory) {
        string memory res = resolution.toString();

        // Start SVG with proper namespace and dimensions
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="',
            res,
            '" height="',
            res,
            '" viewBox="0 0 ',
            res,
            ' ',
            res,
            '">'
        );

        // Render layers in composite order (bottom to top)
        uint256 orderLength = compositeOrder.length;
        for (uint256 i = 0; i < orderLength; ) {
            uint256 traitId = compositeOrder[i];

            // Skip if traitId is out of bounds
            if (traitId >= traitIndices.length) {
                unchecked { ++i; }
                continue;
            }

            uint256 imageIndex = traitIndices[traitId];

            // SKIP_LAYER means skip this layer
            if (imageIndex == SKIP_LAYER) {
                unchecked { ++i; }
                continue;
            }

            // Get PNG data from art storage
            bytes memory pngData = art.getTraitImage(traitId, imageIndex);
            if (pngData.length == 0) {
                unchecked { ++i; }
                continue;
            }

            // Encode PNG as base64 and embed in <image> tag
            string memory pngBase64 = Base64.encode(pngData);

            svg = abi.encodePacked(
                svg,
                '<image width="',
                res,
                '" height="',
                res,
                '" href="data:image/png;base64,',
                pngBase64,
                '"/>'
            );

            unchecked { ++i; }
        }

        svg = abi.encodePacked(svg, '</svg>');
        return string(svg);
    }

    /// @notice Generate just the data URI for the SVG image
    /// @param traitIndices Array of trait indices for each category
    /// @return Data URI for the SVG image
    function generateDataURI(uint256[] memory traitIndices) external view returns (string memory) {
        return string(
            abi.encodePacked(
                'data:image/svg+xml;base64,',
                generateSVGBase64(traitIndices)
            )
        );
    }

    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================

    /// @notice Set the art storage contract address
    /// @param _art New art contract address
    function setArt(address _art) external onlyOwner {
        if (_art == address(0)) revert EmptyArtAddress();

        address oldArt = address(art);
        art = NijiArt(_art);

        emit ArtUpdated(oldArt, _art);
    }

    /// @notice Set the image resolution
    /// @param _resolution New resolution in pixels
    function setResolution(uint256 _resolution) external onlyOwner {
        if (_resolution == 0) revert InvalidResolution();

        uint256 oldResolution = resolution;
        resolution = _resolution;

        emit ResolutionUpdated(oldResolution, _resolution);
    }

    /// @notice Set the layer composition order
    /// @param _compositeOrder New composite order array
    function setCompositeOrder(uint256[] memory _compositeOrder) external onlyOwner {
        compositeOrder = _compositeOrder;
        emit CompositeOrderUpdated(_compositeOrder);
    }

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================

    /// @notice Get the composite order array
    /// @return Array of trait IDs in layer order (bottom to top)
    function getCompositeOrder() external view returns (uint256[] memory) {
        return compositeOrder;
    }

    /// @notice Get the number of layers in composite order
    /// @return Number of layers
    function getCompositeOrderLength() external view returns (uint256) {
        return compositeOrder.length;
    }

    /// @notice Check if contract is properly configured
    /// @return True if art, resolution, and compositeOrder are set
    function isConfigured() external view returns (bool) {
        return address(art) != address(0) && resolution > 0 && compositeOrder.length > 0;
    }
}
