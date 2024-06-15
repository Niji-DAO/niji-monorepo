// SPDX-License-Identifier: GPL-3.0

/// @title The NounsToken pseudo-random seed generator

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

import { INounsSeeder } from './interfaces/INounsSeeder.sol';
import { INounsDescriptorMinimal } from './interfaces/INounsDescriptorMinimal.sol';

contract NounsSeeder is INounsSeeder {
    /**
     * @notice Generate a pseudo-random Niji seed using the previous blockhash and noun ID.
     */
    // prettier-ignore
    function generateSeed(uint256 nounId, INounsDescriptorMinimal descriptor) external view override returns (Seed memory) {
        uint256 pseudorandomness = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))
        );

        uint256 backgroundCount = descriptor.backgroundCount();
        uint256 backgroundDecorationCount = descriptor.backgroundDecorationCount();
        uint256 specialCount = descriptor.specialCount();
        uint256 leftHandCount = descriptor.leftHandCount();
        uint256 backCount = descriptor.backCount();
        uint256 earCount = descriptor.earCount();
        uint256 chokerCount = descriptor.chokerCount();
        uint256 clotheCount = descriptor.clotheCount();
        uint256 hairCount = descriptor.hairCount();
        uint256 headphoneCount = descriptor.headphoneCount();
        uint256 hatCount = descriptor.hatCount();
        uint256 backDecorationCount = descriptor.backDecorationCount();

        return Seed({
            background: uint48(
                uint48(pseudorandomness) % backgroundCount
            ),
            backgroundDecoration: uint48(
                uint48(pseudorandomness >> 48) % backgroundDecorationCount
            ),
            special: uint48(
                uint48(pseudorandomness >> 96) % specialCount
            ),
            leftHand: uint48(
                uint48(pseudorandomness >> 144) % leftHandCount
            ),
            back: uint48(
                uint48(pseudorandomness >> 192) % backCount
            ),
            ear: uint48(
                uint48(pseudorandomness >> 240) % earCount
            ),
            choker: uint48(
                uint48(pseudorandomness >> 288) % chokerCount
            ),
            clothe: uint48(
                uint48(pseudorandomness >> 336) % clotheCount
            ),
            hair: uint48(
                uint48(pseudorandomness >> 384) % hairCount
            ),
            headphone: uint48(
                uint48(pseudorandomness >> 432) % headphoneCount
            ),
            hat: uint48(
                uint48(pseudorandomness >> 480) % hatCount
            ),
            backDecoration: uint48(
                uint48(pseudorandomness >> 528) % backDecorationCount
            )
        });
    }
}
