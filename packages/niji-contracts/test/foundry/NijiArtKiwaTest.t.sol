// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import 'forge-std/Test.sol';
import { NijiArt } from '../../contracts/NijiArt.sol';

contract NijiArtKiwaTest is Test {
    NijiArt internal art;
    address internal owner = address(0xBEEF);
    address internal descriptor = address(0x1234);
    address internal nonDescriptor = address(0xDEAD);
    address internal nonOwner = address(0xCAFE);

    event TraitImageAdded(uint256 indexed traitId, uint256 imageIndex, address pointer);
    event TraitImagesAdded(uint256 indexed traitId, uint256 startIndex, uint256 count);
    event DescriptorUpdated(address indexed oldDescriptor, address indexed newDescriptor);

    function setUp() public {
        string[] memory traitNames = new string[](3);
        traitNames[0] = 'special';
        traitNames[1] = 'choker';
        traitNames[2] = 'hair';

        vm.prank(owner);
        art = new NijiArt(descriptor, traitNames);
    }

    // ====================================================
    // TC-001 正常系: addTraitImage + count 増 + event
    // ====================================================
    function test_TC001_addTraitImage_emitsEventAndIncrementsCount() public {
        bytes memory png = hex'89504E470D0A1A0A'; // PNG magic bytes
        assertEq(art.getTraitImageCount(0), 0);

        vm.expectEmit(true, false, false, false);
        emit TraitImageAdded(0, 0, address(0)); // pointer は予測不可、 first 2 引数のみ assert

        vm.prank(descriptor);
        art.addTraitImage(0, png);

        assertEq(art.getTraitImageCount(0), 1);
    }

    // ====================================================
    // TC-002 正常系: addTraitImages batch
    // ====================================================
    function test_TC002_addTraitImages_batch() public {
        bytes[] memory pngs = new bytes[](3);
        pngs[0] = hex'89504E470D0A1A0A01';
        pngs[1] = hex'89504E470D0A1A0A02';
        pngs[2] = hex'89504E470D0A1A0A03';

        vm.expectEmit(true, false, false, true);
        emit TraitImagesAdded(0, 0, 3);

        vm.prank(descriptor);
        art.addTraitImages(0, pngs);

        assertEq(art.getTraitImageCount(0), 3);
    }

    // ====================================================
    // TC-003 異常系: non-descriptor で SenderIsNotDescriptor revert
    // ====================================================
    function test_TC003_addTraitImage_nonDescriptor_reverts() public {
        bytes memory png = hex'89504E470D0A1A0A';
        vm.prank(nonDescriptor);
        vm.expectRevert(NijiArt.SenderIsNotDescriptor.selector);
        art.addTraitImage(0, png);
    }

    // ====================================================
    // TC-004 異常系: 範囲外 traitId で InvalidTraitId
    // ====================================================
    function test_TC004_addTraitImage_outOfRangeTraitId_reverts() public {
        bytes memory png = hex'89504E470D0A1A0A';
        vm.prank(descriptor);
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(5), uint256(2)));
        art.addTraitImage(5, png);
    }

    // ====================================================
    // TC-005 異常系: empty pngData で EmptyPngData
    // ====================================================
    function test_TC005_addTraitImage_emptyPng_reverts() public {
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.EmptyPngData.selector);
        art.addTraitImage(0, '');
    }

    // ====================================================
    // TC-006 境界値: count=0 で getTraitImage が InvalidImageIndex
    // ====================================================
    function test_TC006_getTraitImage_emptyCount_reverts() public {
        vm.expectRevert(
            abi.encodeWithSelector(NijiArt.InvalidImageIndex.selector, uint256(0), uint256(0), uint256(0))
        );
        art.getTraitImage(0, 0);
    }

    // ====================================================
    // TC-007 正常系: getTraitImage が SSTORE2 から data 復元
    // ====================================================
    function test_TC007_getTraitImage_returnsStoredBytes() public {
        bytes memory png = hex'89504E470D0A1A0ADEADBEEF';
        vm.prank(descriptor);
        art.addTraitImage(1, png);

        bytes memory retrieved = art.getTraitImage(1, 0);
        assertEq(keccak256(retrieved), keccak256(png), 'retrieved bytes must match stored');
    }

    // ====================================================
    // TC-008 権限: non-owner transferDescriptor revert
    // ====================================================
    function test_TC008_transferDescriptor_nonOwner_reverts() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        art.transferDescriptor(address(0x5678));
    }

    // ====================================================
    // TC-009 正常系: transferDescriptor で event + 更新
    // ====================================================
    function test_TC009_transferDescriptor_emitsEventAndUpdates() public {
        address newDescriptor = address(0x5678);
        vm.expectEmit(true, true, false, false);
        emit DescriptorUpdated(descriptor, newDescriptor);

        vm.prank(owner);
        art.transferDescriptor(newDescriptor);

        // 旧 descriptor は addTraitImage を呼べなくなり new descriptor が呼べる
        bytes memory png = hex'89504E470D0A1A0A';
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.SenderIsNotDescriptor.selector);
        art.addTraitImage(0, png);

        vm.prank(newDescriptor);
        art.addTraitImage(0, png);
        assertEq(art.getTraitImageCount(0), 1);
    }

    // ====================================================
    // TC-010 性能: addTraitImage の gas usage が実用範囲
    // ====================================================
    function test_TC010_addTraitImage_gasUsage() public {
        // 1KB の dummy png data
        bytes memory png = new bytes(1024);
        for (uint256 i = 0; i < 1024; i++) {
            png[i] = bytes1(uint8(i % 256));
        }

        vm.prank(descriptor);
        uint256 gasBefore = gasleft();
        art.addTraitImage(0, png);
        uint256 gasUsed = gasBefore - gasleft();
        // 1KB png SSTORE2 deploy + storage push で 500k 以下を想定
        assertLt(gasUsed, 500_000, 'addTraitImage gas should be reasonable for 1KB png');
    }

    // ====================================================
    // TC-011 回帰: getTraitNames が constructor 引数を返す
    // ====================================================
    function test_TC011_getTraitNames() public {
        string[] memory names = art.getTraitNames();
        assertEq(names.length, 3);
        assertEq(names[0], 'special');
        assertEq(names[1], 'choker');
        assertEq(names[2], 'hair');
    }
}
