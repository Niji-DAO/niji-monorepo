// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.19;

import { IClientTokenTypes } from './IClientTokenTypes.sol';

interface IClientTokenDescriptor {
    function tokenURI(
        uint256 tokenId,
        IClientTokenTypes.ClientMetadata calldata metadata
    ) external view returns (string memory);
}
