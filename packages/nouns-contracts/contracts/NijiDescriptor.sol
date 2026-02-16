// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import { Base64 } from 'base64-sol/base64.sol';
import { NijiArt } from './NijiArt.sol';
import { Strings } from '@openzeppelin/contracts/utils/Strings.sol';

/// @title NijiDescriptor - generates SVG with embedded PNG layers
/// @notice Composes trait layers as PNG <image> tags inside an SVG
contract NijiDescriptor {
    using Strings for uint256;

    /// @notice The art storage contract
    NijiArt public art;

    /// @notice Image resolution (e.g., 320)
    uint256 public resolution;

    /// @notice Trait composition order (bottom to top)
    uint256[] public compositeOrder;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _art, uint256 _resolution, uint256[] memory _compositeOrder) {
        art = NijiArt(_art);
        resolution = _resolution;
        compositeOrder = _compositeOrder;
        owner = msg.sender;
    }

    /// @notice Generate the full tokenURI (data URI with JSON + embedded SVG)
    function tokenURI(uint256 tokenId, uint256[] memory traitIndices) external view returns (string memory) {
        string memory svgBase64 = generateSVGBase64(traitIndices);

        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"Niji #',
                            tokenId.toString(),
                            '", "description":"Niji is a fully on-chain generative art collection.", "image": "data:image/svg+xml;base64,',
                            svgBase64,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    /// @notice Generate SVG as base64 string
    function generateSVGBase64(uint256[] memory traitIndices) public view returns (string memory) {
        return Base64.encode(bytes(generateSVG(traitIndices)));
    }

    /// @notice Generate raw SVG string with embedded PNG layers
    function generateSVG(uint256[] memory traitIndices) public view returns (string memory) {
        string memory res = resolution.toString();

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

        for (uint256 i = 0; i < compositeOrder.length; i++) {
            uint256 traitId = compositeOrder[i];
            if (traitId >= traitIndices.length) continue;

            uint256 imageIndex = traitIndices[traitId];
            // type(uint256).max means skip this layer
            if (imageIndex == type(uint256).max) continue;

            bytes memory pngData = art.getTraitImage(traitId, imageIndex);
            if (pngData.length == 0) continue;

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
        }

        svg = abi.encodePacked(svg, '</svg>');
        return string(svg);
    }

    function setArt(address _art) external onlyOwner {
        art = NijiArt(_art);
    }

    function setResolution(uint256 _resolution) external onlyOwner {
        resolution = _resolution;
    }
}
