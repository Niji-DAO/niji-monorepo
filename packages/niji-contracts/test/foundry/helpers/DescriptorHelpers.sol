// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import { Constants } from './Constants.sol';
import { strings } from '../lib/strings.sol';

abstract contract DescriptorHelpers is Test, Constants {
    using strings for string;
    using strings for strings.slice;

    function removeDataTypePrefix(string memory str) internal pure returns (string memory) {
        strings.slice memory strSlice = str.toSlice();
        strSlice.split(string(',').toSlice());
        return strSlice.toString();
    }
}
