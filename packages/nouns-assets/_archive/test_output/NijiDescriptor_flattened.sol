// Sources flattened with hardhat v2.24.3 https://hardhat.org

// SPDX-License-Identifier: AGPL-3.0-only AND GPL-3.0 AND MIT

// File contracts/libs/SSTORE2.sol


pragma solidity ^0.8.6;

/// @notice Read and write to persistent storage at a fraction of the cost.
/// @author Solmate (https://github.com/Rari-Capital/solmate/blob/main/src/utils/SSTORE2.sol)
/// @author Modified from 0xSequence (https://github.com/0xSequence/sstore2/blob/master/contracts/SSTORE2.sol)
library SSTORE2 {
    uint256 internal constant DATA_OFFSET = 1; // We skip the first byte as it's a STOP opcode to ensure the contract can't be called.

    /*///////////////////////////////////////////////////////////////
                               WRITE LOGIC
    //////////////////////////////////////////////////////////////*/

    function write(bytes memory data) internal returns (address pointer) {
        // Prefix the bytecode with a STOP opcode to ensure it cannot be called.
        bytes memory runtimeCode = abi.encodePacked(hex'00', data);

        bytes memory creationCode = abi.encodePacked(
            //---------------------------------------------------------------------------------------------------------------//
            // Opcode  | Opcode + Arguments  | Description  | Stack View                                                     //
            //---------------------------------------------------------------------------------------------------------------//
            // 0x60    |  0x600B             | PUSH1 11     | codeOffset                                                     //
            // 0x59    |  0x59               | MSIZE        | 0 codeOffset                                                   //
            // 0x81    |  0x81               | DUP2         | codeOffset 0 codeOffset                                        //
            // 0x38    |  0x38               | CODESIZE     | codeSize codeOffset 0 codeOffset                               //
            // 0x03    |  0x03               | SUB          | (codeSize - codeOffset) 0 codeOffset                           //
            // 0x80    |  0x80               | DUP          | (codeSize - codeOffset) (codeSize - codeOffset) 0 codeOffset   //
            // 0x92    |  0x92               | SWAP3        | codeOffset (codeSize - codeOffset) 0 (codeSize - codeOffset)   //
            // 0x59    |  0x59               | MSIZE        | 0 codeOffset (codeSize - codeOffset) 0 (codeSize - codeOffset) //
            // 0x39    |  0x39               | CODECOPY     | 0 (codeSize - codeOffset)                                      //
            // 0xf3    |  0xf3               | RETURN       |                                                                //
            //---------------------------------------------------------------------------------------------------------------//
            hex'60_0B_59_81_38_03_80_92_59_39_F3', // Returns all code in the contract except for the first 11 (0B in hex) bytes.
            runtimeCode // The bytecode we want the contract to have after deployment. Capped at 1 byte less than the code size limit.
        );

        assembly {
            // Deploy a new contract with the generated creation code.
            // We start 32 bytes into the code to avoid copying the byte length.
            pointer := create(0, add(creationCode, 32), mload(creationCode))
        }

        require(pointer != address(0), 'DEPLOYMENT_FAILED');
    }

    /*///////////////////////////////////////////////////////////////
                               READ LOGIC
    //////////////////////////////////////////////////////////////*/

    function read(address pointer) internal view returns (bytes memory) {
        return readBytecode(pointer, DATA_OFFSET, pointer.code.length - DATA_OFFSET);
    }

    function read(address pointer, uint256 start) internal view returns (bytes memory) {
        start += DATA_OFFSET;

        return readBytecode(pointer, start, pointer.code.length - start);
    }

    function read(
        address pointer,
        uint256 start,
        uint256 end
    ) internal view returns (bytes memory) {
        start += DATA_OFFSET;
        end += DATA_OFFSET;

        require(pointer.code.length >= end, 'OUT_OF_BOUNDS');

        return readBytecode(pointer, start, end - start);
    }

    /*///////////////////////////////////////////////////////////////
                         INTERNAL HELPER LOGIC
    //////////////////////////////////////////////////////////////*/

    function readBytecode(
        address pointer,
        uint256 start,
        uint256 size
    ) private view returns (bytes memory data) {
        assembly {
            // Get a pointer to some free memory.
            data := mload(0x40)

            // Update the free memory pointer to prevent overriding our data.
            // We use and(x, not(31)) as a cheaper equivalent to sub(x, mod(x, 32)).
            // Adding 31 to size and running the result through the logic above ensures
            // the memory pointer remains word-aligned, following the Solidity convention.
            mstore(0x40, add(data, and(add(add(size, 32), 31), not(31))))

            // Store the size of the data in the first 32 byte chunk of free memory.
            mstore(data, size)

            // Copy the code into memory right after the 32 bytes we used to store the size.
            extcodecopy(pointer, add(data, 32), start, size)
        }
    }
}


// File contracts/NijiArt.sol



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


// File @openzeppelin/contracts/utils/Strings.sol@v4.4.0

// OpenZeppelin Contracts v4.4.0 (utils/Strings.sol)


/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}


// File base64-sol/base64.sol@v1.1.0



/// @title Base64
/// @author Brecht Devos - <brecht@loopring.org>
/// @notice Provides functions for encoding/decoding base64
library Base64 {
    string internal constant TABLE_ENCODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    bytes  internal constant TABLE_DECODE = hex"0000000000000000000000000000000000000000000000000000000000000000"
                                            hex"00000000000000000000003e0000003f3435363738393a3b3c3d000000000000"
                                            hex"00000102030405060708090a0b0c0d0e0f101112131415161718190000000000"
                                            hex"001a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132330000000000";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return '';

        // load the table into memory
        string memory table = TABLE_ENCODE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 3 bytes at a time
            for {} lt(dataPtr, endPtr) {}
            {
                // read 3 bytes
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                // write 4 characters
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(        input,  0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            // padding with '='
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }

        return result;
    }

    function decode(string memory _data) internal pure returns (bytes memory) {
        bytes memory data = bytes(_data);

        if (data.length == 0) return new bytes(0);
        require(data.length % 4 == 0, "invalid base64 decoder input");

        // load the table into memory
        bytes memory table = TABLE_DECODE;

        // every 4 characters represent 3 bytes
        uint256 decodedLen = (data.length / 4) * 3;

        // add some extra buffer at the end required for the writing
        bytes memory result = new bytes(decodedLen + 32);

        assembly {
            // padding with '='
            let lastBytes := mload(add(data, mload(data)))
            if eq(and(lastBytes, 0xFF), 0x3d) {
                decodedLen := sub(decodedLen, 1)
                if eq(and(lastBytes, 0xFFFF), 0x3d3d) {
                    decodedLen := sub(decodedLen, 1)
                }
            }

            // set the actual output length
            mstore(result, decodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 4 characters at a time
            for {} lt(dataPtr, endPtr) {}
            {
               // read 4 characters
               dataPtr := add(dataPtr, 4)
               let input := mload(dataPtr)

               // write 3 bytes
               let output := add(
                   add(
                       shl(18, and(mload(add(tablePtr, and(shr(24, input), 0xFF))), 0xFF)),
                       shl(12, and(mload(add(tablePtr, and(shr(16, input), 0xFF))), 0xFF))),
                   add(
                       shl( 6, and(mload(add(tablePtr, and(shr( 8, input), 0xFF))), 0xFF)),
                               and(mload(add(tablePtr, and(        input , 0xFF))), 0xFF)
                    )
                )
                mstore(resultPtr, shl(232, output))
                resultPtr := add(resultPtr, 3)
            }
        }

        return result;
    }
}


// File contracts/NijiDescriptor.sol





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
