// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

interface IClientTokenTypes {
    struct ClientMetadata {
        bool approved;
        uint96 rewarded;
        uint96 withdrawn;
        uint56 __gap;
        string name;
        string description;
    }
}
