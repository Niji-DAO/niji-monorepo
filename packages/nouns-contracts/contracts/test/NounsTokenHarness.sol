// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.15;

import { NounsToken } from '../NounsToken.sol';
import { INounsDescriptorMinimal } from '../interfaces/INounsDescriptorMinimal.sol';
import { INounsSeeder } from '../interfaces/INounsSeeder.sol';
import { IProxyRegistry } from '../external/opensea/IProxyRegistry.sol';

contract NounsTokenHarness is NounsToken {
    uint256 public currentNounId;

    constructor(
        address noundersDAO,
        address minter,
        INounsDescriptorMinimal descriptor,
        INounsSeeder seeder,
        IProxyRegistry proxyRegistry
    ) NounsToken(noundersDAO, minter, descriptor, seeder, proxyRegistry) {}

    function mintTo(address to) public {
        _mintTo(to, currentNounId++);
    }

    function mintMany(address to, uint256 amount) public {
        for (uint256 i = 0; i < amount; i++) {
            mintTo(to);
        }
    }

    function mintSeed(
        address to,
        uint48 background,
        uint48 backgroundDecoration,
        uint48 special,
        uint48 leftHand,
        uint48 back,
        uint48 ear,
        uint48 choker,
        uint48 clothe,
        uint48 hair,
        uint48 headphone,
        uint48 hat,
        uint48 backDecoration
    ) public {
        seeds[currentNounId] = INounsSeeder.Seed({
            background: background,
            backgroundDecoration: backgroundDecoration,
            special: special,
            leftHand: leftHand,
            back: back,
            ear: ear,
            choker: choker,
            clothe: clothe,
            hair: hair,
            headphone: headphone,
            hat: hat,
            backDecoration: backDecoration
        });

        _mint(owner(), to, currentNounId++);
    }
}
