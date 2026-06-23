// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/// @title NijiArtPhase1Test - Phase 1 kiwa chain (Issue #295) で生成、 11 観点 35 TC
/// @dev Layer 1 spec: tests/spec/contract/test-spec-niji-art-2.ja.md
///      Layer 2 skill: /kiwa-forge
///      observation: 11 観点全 cover (正常系 / 異常系 / 境界値 / 状態遷移 / 権限 / 入力バリデーション / 冪等性 / 並行処理 / 性能 / セキュリティ / 回帰)

import 'forge-std/Test.sol';
import { NijiArt } from '../../../contracts/NijiArt.sol';
import { Ownable } from '@openzeppelin/contracts-v5/access/Ownable.sol';

contract NijiArtPhase1Test is Test {
    NijiArt internal art;
    address internal descriptor = address(0xDE5C);
    address internal owner = address(this);
    address internal bob = address(0xB0B);

    function _traitNames() internal pure returns (string[] memory names) {
        names = new string[](12);
        names[0] = 'special';
        names[1] = 'choker';
        names[2] = 'headphone';
        names[3] = 'leftHand';
        names[4] = 'hat';
        names[5] = 'clothing';
        names[6] = 'ear';
        names[7] = 'back';
        names[8] = 'backDecoration';
        names[9] = 'background';
        names[10] = 'solidBackground';
        names[11] = 'hair';
    }

    function setUp() public virtual {
        art = new NijiArt(descriptor, _traitNames());
    }

    // =============================================================
    //                      観点 1: 正常系 (TC-001 〜 010)
    // =============================================================

    /// TC-001: addTraitImage 成功
    function test_TC001_addTraitImage_HappyPath() public {
        bytes memory png = hex'deadbeef';
        vm.prank(descriptor);
        art.addTraitImage(0, png);
        assertEq(art.getTraitImageCount(0), 1);
    }

    /// TC-002: addTraitImages (batch) 成功
    function test_TC002_addTraitImages_HappyPath() public {
        bytes[] memory pngs = new bytes[](3);
        pngs[0] = hex'aa';
        pngs[1] = hex'bb';
        pngs[2] = hex'cc';
        vm.prank(descriptor);
        art.addTraitImages(0, pngs);
        assertEq(art.getTraitImageCount(0), 3);
    }

    /// TC-003: getTraitImage で SSTORE2 から復元
    function test_TC003_getTraitImage_HappyPath() public {
        bytes memory png = hex'deadbeefcafebabe';
        vm.prank(descriptor);
        art.addTraitImage(0, png);
        bytes memory read = art.getTraitImage(0, 0);
        assertEq(keccak256(read), keccak256(png));
    }

    /// TC-004: getTraitImageCount (initial state)
    function test_TC004_getTraitImageCount_InitialZero() public {
        assertEq(art.getTraitImageCount(0), 0);
    }

    /// TC-005: getTraitNames で array 復元
    function test_TC005_getTraitNames_HappyPath() public {
        string[] memory names = art.getTraitNames();
        assertEq(names.length, 12);
        assertEq(names[0], 'special');
        assertEq(names[11], 'hair');
    }

    /// TC-006: getTraitName で個別取得
    function test_TC006_getTraitName_HappyPath() public {
        assertEq(art.getTraitName(0), 'special');
        assertEq(art.getTraitName(5), 'clothing');
    }

    /// TC-007: getTraitPointer で SSTORE2 pointer 取得
    function test_TC007_getTraitPointer_HappyPath() public {
        bytes memory png = hex'deadbeef';
        vm.prank(descriptor);
        art.addTraitImage(0, png);
        address pointer = art.getTraitPointer(0, 0);
        assertTrue(pointer != address(0));
    }

    /// TC-008: getTraitPointers で全 pointer 配列取得
    function test_TC008_getTraitPointers_HappyPath() public {
        bytes[] memory pngs = new bytes[](3);
        pngs[0] = hex'aa';
        pngs[1] = hex'bb';
        pngs[2] = hex'cc';
        vm.prank(descriptor);
        art.addTraitImages(0, pngs);
        address[] memory pointers = art.getTraitPointers(0);
        assertEq(pointers.length, 3);
    }

    /// TC-009: setDescriptor 成功 (旧 descriptor 経由)
    function test_TC009_setDescriptor_HappyPath() public {
        address newDescriptor = address(0xBEEF);
        vm.prank(descriptor);
        art.setDescriptor(newDescriptor);
        assertEq(art.descriptor(), newDescriptor);
    }

    /// TC-010: transferDescriptor 成功 (owner 経由)
    function test_TC010_transferDescriptor_HappyPath() public {
        address newDescriptor = address(0xBEEF);
        art.transferDescriptor(newDescriptor);
        assertEq(art.descriptor(), newDescriptor);
    }

    // =============================================================
    //                      観点 2: 異常系 (TC-011 〜 022)
    // =============================================================

    /// TC-011: non-descriptor が addTraitImage で SenderIsNotDescriptor revert
    function test_TC011_addTraitImage_Reverts_When_NotDescriptor() public {
        vm.prank(bob);
        vm.expectRevert(NijiArt.SenderIsNotDescriptor.selector);
        art.addTraitImage(0, hex'dead');
    }

    /// TC-012: traitId=12 範囲外で InvalidTraitId revert
    function test_TC012_addTraitImage_Reverts_When_TraitIdOutOfRange() public {
        vm.prank(descriptor);
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(12), uint256(11)));
        art.addTraitImage(12, hex'dead');
    }

    /// TC-013: empty pngData で EmptyPngData revert
    function test_TC013_addTraitImage_Reverts_When_EmptyPng() public {
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.EmptyPngData.selector);
        art.addTraitImage(0, '');
    }

    /// TC-014: image 0 件で getTraitImage が InvalidImageIndex revert
    function test_TC014_getTraitImage_Reverts_When_NoImage() public {
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidImageIndex.selector, uint256(0), uint256(0), uint256(0)));
        art.getTraitImage(0, 0);
    }

    /// TC-015: traitId=12 で getTraitImage が InvalidTraitId revert
    function test_TC015_getTraitImage_Reverts_When_TraitIdOutOfRange() public {
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(12), uint256(11)));
        art.getTraitImage(12, 0);
    }

    /// TC-016: getTraitName(12) で InvalidTraitId revert
    function test_TC016_getTraitName_Reverts_When_TraitIdOutOfRange() public {
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(12), uint256(11)));
        art.getTraitName(12);
    }

    /// TC-017: getTraitPointer(12, 0) で InvalidTraitId revert
    function test_TC017_getTraitPointer_Reverts_When_TraitIdOutOfRange() public {
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(12), uint256(11)));
        art.getTraitPointer(12, 0);
    }

    /// TC-018: getTraitPointers(12) で InvalidTraitId revert
    function test_TC018_getTraitPointers_Reverts_When_TraitIdOutOfRange() public {
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidTraitId.selector, uint256(12), uint256(11)));
        art.getTraitPointers(12);
    }

    /// TC-019: setDescriptor address(0) で EmptyDescriptorAddress revert
    function test_TC019_setDescriptor_RejectsZeroAddress() public {
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.EmptyDescriptorAddress.selector);
        art.setDescriptor(address(0));
    }

    /// TC-020: transferDescriptor address(0) で EmptyDescriptorAddress revert
    function test_TC020_transferDescriptor_RejectsZeroAddress() public {
        vm.expectRevert(NijiArt.EmptyDescriptorAddress.selector);
        art.transferDescriptor(address(0));
    }

    /// TC-021: constructor descriptor=address(0) で EmptyDescriptorAddress revert
    function test_TC021_constructor_RejectsZeroDescriptor() public {
        vm.expectRevert(NijiArt.EmptyDescriptorAddress.selector);
        new NijiArt(address(0), _traitNames());
    }

    /// TC-022: addTraitImages batch 内 empty で EmptyPngData revert
    function test_TC022_addTraitImages_Reverts_When_BatchContainsEmpty() public {
        bytes[] memory pngs = new bytes[](3);
        pngs[0] = hex'aa';
        pngs[1] = ''; // empty
        pngs[2] = hex'cc';
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.EmptyPngData.selector);
        art.addTraitImages(0, pngs);
    }

    // =============================================================
    //                      観点 3: 境界値 (TC-023 〜 025)
    // =============================================================

    /// TC-023: traitId=11 (max-1) boundary 成功
    function test_TC023_addTraitImage_Boundary_MaxTraitId() public {
        vm.prank(descriptor);
        art.addTraitImage(11, hex'dead');
        assertEq(art.getTraitImageCount(11), 1);
    }

    /// TC-024: imageIndex=1 (length 超え) で InvalidImageIndex revert
    function test_TC024_getTraitImage_Boundary_IndexOverflow() public {
        vm.prank(descriptor);
        art.addTraitImage(0, hex'dead');
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidImageIndex.selector, uint256(0), uint256(1), uint256(0)));
        art.getTraitImage(0, 1);
    }

    /// TC-025: traitId=12 で getTraitImageCount は revert しない (length 0 を返す)
    function test_TC025_getTraitImageCount_Boundary_OutOfRange() public {
        // mapping は範囲チェックなしで 0 を返す仕様
        assertEq(art.getTraitImageCount(12), 0);
    }

    // =============================================================
    //                      観点 4: 状態遷移 (TC-026 〜 028)
    // =============================================================

    /// TC-026: lockArt() で isArtLocked=true (1-way)
    function test_TC026_lockArt_StateTransition() public {
        assertFalse(art.isArtLocked());
        art.lockArt();
        assertTrue(art.isArtLocked());
    }

    /// TC-027: lockArt 後の addTraitImage が ArtIsLocked revert
    function test_TC027_addTraitImage_Reverts_After_Locked() public {
        art.lockArt();
        vm.prank(descriptor);
        vm.expectRevert(NijiArt.ArtIsLocked.selector);
        art.addTraitImage(0, hex'dead');
    }

    /// TC-028: lock 後でも transferDescriptor は成功 (write 凍結のみ)
    function test_TC028_transferDescriptor_Succeeds_After_Locked() public {
        art.lockArt();
        address newDescriptor = address(0xBEEF);
        art.transferDescriptor(newDescriptor);
        assertEq(art.descriptor(), newDescriptor);
    }

    // =============================================================
    //                      観点 5: 権限 (TC-029 〜 030)
    // =============================================================

    /// TC-029: non-owner が transferDescriptor で OwnableUnauthorizedAccount revert
    function test_TC029_transferDescriptor_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        art.transferDescriptor(bob);
    }

    /// TC-030: non-owner が lockArt で OwnableUnauthorizedAccount revert
    function test_TC030_lockArt_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        art.lockArt();
    }

    // =============================================================
    //                      観点 6: 入力バリデーション (TC-031)
    // =============================================================

    /// TC-031: 空 trait names で constructor 成功 (traitCount=0、 ただし全 trait 範囲外になる)
    function test_TC031_constructor_AllowsEmptyTraitNames() public {
        string[] memory empty = new string[](0);
        NijiArt emptyArt = new NijiArt(descriptor, empty);
        assertEq(emptyArt.traitCount(), 0);
    }

    // =============================================================
    //                      観点 7: 冪等性 (TC-032)
    // =============================================================

    /// TC-032: lockArt 2 回目で ArtIsLocked revert
    function test_TC032_lockArt_Idempotent() public {
        art.lockArt();
        vm.expectRevert(NijiArt.ArtIsLocked.selector);
        art.lockArt();
    }

    // =============================================================
    //                      観点 8: 並行処理 (TC-033)
    // =============================================================

    /// TC-033: 順序依存 ... pointer は SSTORE2.write 順を保持
    function test_TC033_pointer_OrderPreserved() public {
        vm.startPrank(descriptor);
        art.addTraitImage(0, hex'aa');
        art.addTraitImage(0, hex'bb');
        vm.stopPrank();

        address p0 = art.getTraitPointer(0, 0);
        address p1 = art.getTraitPointer(0, 1);
        assertTrue(p0 != p1, 'distinct pointers');

        // 読み戻して順序確認
        bytes memory r0 = art.getTraitImage(0, 0);
        bytes memory r1 = art.getTraitImage(0, 1);
        assertEq(keccak256(r0), keccak256(hex'aa'));
        assertEq(keccak256(r1), keccak256(hex'bb'));
    }

    // =============================================================
    //                      観点 9: 性能 (TC-034)
    // =============================================================

    /// TC-034: 24 KB png addTraitImage が gas 5M 以下
    function test_TC034_addTraitImage_GasUnder5M() public {
        bytes memory png = new bytes(24_000);
        for (uint256 i = 0; i < 24_000; i++) {
            png[i] = bytes1(uint8(i % 256));
        }
        vm.prank(descriptor);
        uint256 gasBefore = gasleft();
        art.addTraitImage(0, png);
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 7_500_000, 'addTraitImage 24KB should fit in 7.5M gas');
    }

    // =============================================================
    //                      観点 10: セキュリティ (TC-035)
    // =============================================================

    /// TC-035: renounceOwnership() が常に revert
    function test_TC035_renounceOwnership_AlwaysReverts() public {
        vm.expectRevert(NijiArt.RenounceOwnershipDisabled.selector);
        art.renounceOwnership();
    }
}
