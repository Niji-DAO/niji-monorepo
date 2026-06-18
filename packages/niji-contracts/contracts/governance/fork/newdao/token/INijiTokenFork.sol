// SPDX-License-Identifier: GPL-3.0

/// @title Interface for NijiTokenFork

pragma solidity ^0.8.19;

import { IERC721Upgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import { INijiSeeder } from '../../../../interfaces/INijiSeeder.sol';

interface INijiTokenFork is IERC721Upgradeable {
    event NounCreated(uint256 indexed tokenId, INijiSeeder.Seed seed);

    event NounBurned(uint256 indexed tokenId);

    event MinterUpdated(address minter);

    event MinterLocked();

    event DescriptorUpdated(address descriptor);

    event DescriptorLocked();

    event SeederUpdated(address seeder);

    event SeederLocked();

    function mint() external returns (uint256);

    function burn(uint256 tokenId) external;

    function dataURI(uint256 tokenId) external view returns (string memory);

    function setMinter(address minter) external;

    function lockMinter() external;

    function setDescriptor(address descriptor) external;

    function lockDescriptor() external;

    function setSeeder(address seeder) external;

    function lockSeeder() external;
}
