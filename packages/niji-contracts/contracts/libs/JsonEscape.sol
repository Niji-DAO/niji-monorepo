// SPDX-License-Identifier: GPL-3.0

/// @title JsonEscape - JSON string escape library
/// @author Niji DAO
/// @notice Escapes special characters in strings for safe JSON embedding
/// @dev Uses a 2-pass algorithm (length calculation + write) for memory efficiency

pragma solidity ^0.8.20;

library JsonEscape {
    /// @notice Escape a string for safe use inside a JSON string value
    /// @dev Handles: " → \", \ → \\, \n → \n, \r → \r, \t → \t, 0x00-0x1F → \uXXXX
    /// @param input The raw string to escape
    /// @return The escaped string safe for JSON embedding
    function escape(string memory input) internal pure returns (string memory) {
        bytes memory b = bytes(input);
        uint256 len = b.length;
        if (len == 0) return input;

        // --- Pass 1: calculate output length & check if escaping is needed ---
        uint256 outLen;
        bool needsEscape;
        for (uint256 i; i < len; ) {
            uint8 c = uint8(b[i]);
            if (c == 0x22 || c == 0x5C) {
                // " or \ → 2 chars
                outLen += 2;
                needsEscape = true;
            } else if (c == 0x0A || c == 0x0D || c == 0x09) {
                // \n, \r, \t → 2 chars
                outLen += 2;
                needsEscape = true;
            } else if (c < 0x20) {
                // other control chars → \uXXXX (6 chars)
                outLen += 6;
                needsEscape = true;
            } else {
                outLen += 1;
            }
            unchecked { ++i; }
        }

        // Short-circuit: no escaping needed
        if (!needsEscape) return input;

        // --- Pass 2: write escaped output ---
        bytes memory out = new bytes(outLen);
        uint256 j;
        for (uint256 i; i < len; ) {
            uint8 c = uint8(b[i]);
            if (c == 0x22) {
                // "
                out[j++] = 0x5C; // backslash
                out[j++] = 0x22; // "
            } else if (c == 0x5C) {
                // backslash
                out[j++] = 0x5C;
                out[j++] = 0x5C;
            } else if (c == 0x0A) {
                // \n
                out[j++] = 0x5C;
                out[j++] = 0x6E; // n
            } else if (c == 0x0D) {
                // \r
                out[j++] = 0x5C;
                out[j++] = 0x72; // r
            } else if (c == 0x09) {
                // \t
                out[j++] = 0x5C;
                out[j++] = 0x74; // t
            } else if (c < 0x20) {
                // other control chars → \uXXXX
                out[j++] = 0x5C; // backslash
                out[j++] = 0x75; // u
                out[j++] = 0x30; // 0
                out[j++] = 0x30; // 0
                out[j++] = _hexChar(c >> 4);
                out[j++] = _hexChar(c & 0x0F);
            } else {
                out[j++] = b[i];
            }
            unchecked { ++i; }
        }
        return string(out);
    }

    /// @dev Convert a nibble (0-15) to its hex ASCII character
    function _hexChar(uint8 nibble) private pure returns (bytes1) {
        return nibble < 10
            ? bytes1(nibble + 0x30)       // '0'-'9'
            : bytes1(nibble - 10 + 0x61); // 'a'-'f'
    }
}
