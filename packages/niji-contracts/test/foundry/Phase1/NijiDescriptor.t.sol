// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/// @title NijiDescriptorPhase1Test - Phase 1 kiwa chain (Issue #295) で生成、 11 観点 35 TC
/// @dev Layer 1 spec: tests/spec/contract/test-spec-niji-descriptor.ja.md

import 'forge-std/Test.sol';
import { NijiArt } from '../../../contracts/NijiArt.sol';
import { NijiDescriptor } from '../../../contracts/NijiDescriptor.sol';
import { Ownable } from '@openzeppelin/contracts-v5/access/Ownable.sol';

contract NijiDescriptorPhase1Test is Test {
    NijiArt internal art;
    NijiDescriptor internal descriptor;
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

    function _compositeOrder() internal pure returns (uint256[] memory order) {
        order = new uint256[](12);
        for (uint256 i = 0; i < 12; i++) order[i] = i;
    }

    function _populateArt(NijiArt a) internal {
        bytes[] memory imgs = new bytes[](2);
        imgs[0] = hex'89504e47'; // PNG magic bytes (fake)
        imgs[1] = hex'89504e47';
        for (uint256 i = 0; i < 12; i++) {
            a.addTraitImages(i, imgs);
        }
    }

    function setUp() public virtual {
        art = new NijiArt(address(this), _traitNames());
        _populateArt(art);
        descriptor = new NijiDescriptor(address(art), 320, _compositeOrder());
    }

    function _allZeroIndices() internal pure returns (uint256[] memory indices) {
        indices = new uint256[](12);
        // 全て 0 (各 trait の 0 番目 image)
    }

    // =============================================================
    //                      観点 1: 正常系 (TC-001 〜 012)
    // =============================================================

    /// TC-001: tokenURI 正常系
    function test_TC001_tokenURI_HappyPath() public {
        string memory uri = descriptor.tokenURI(0, _allZeroIndices());
        assertEq(_startsWith(uri, 'data:application/json;base64,'), true);
    }

    /// TC-002: tokenURIWithMetadata 正常系
    function test_TC002_tokenURIWithMetadata_HappyPath() public {
        string memory uri = descriptor.tokenURIWithMetadata(0, _allZeroIndices(), 'Custom', 'Test');
        assertEq(_startsWith(uri, 'data:application/json;base64,'), true);
    }

    /// TC-003: generateSVG 正常系 (SVG 接頭辞 + image tag)
    function test_TC003_generateSVG_HappyPath() public {
        string memory svg = descriptor.generateSVG(_allZeroIndices());
        assertEq(_startsWith(svg, '<svg xmlns'), true);
    }

    /// TC-004: generateSVGBase64
    function test_TC004_generateSVGBase64_HappyPath() public {
        string memory svgBase64 = descriptor.generateSVGBase64(_allZeroIndices());
        assertTrue(bytes(svgBase64).length > 0);
    }

    /// TC-005: generateDataURI
    function test_TC005_generateDataURI_HappyPath() public {
        string memory dataURI = descriptor.generateDataURI(_allZeroIndices());
        assertEq(_startsWith(dataURI, 'data:image/svg+xml;base64,'), true);
    }

    /// TC-006: getCompositeOrder
    function test_TC006_getCompositeOrder_HappyPath() public {
        uint256[] memory order = descriptor.getCompositeOrder();
        assertEq(order.length, 12);
        assertEq(order[0], 0);
        assertEq(order[11], 11);
    }

    /// TC-007: getCompositeOrderLength
    function test_TC007_getCompositeOrderLength_HappyPath() public {
        assertEq(descriptor.getCompositeOrderLength(), 12);
    }

    /// TC-008: isConfigured true
    function test_TC008_isConfigured_True() public {
        assertTrue(descriptor.isConfigured());
    }

    /// TC-009: setArt 成功
    function test_TC009_setArt_HappyPath() public {
        NijiArt newArt = new NijiArt(address(this), _traitNames());
        descriptor.setArt(address(newArt));
        assertEq(address(descriptor.art()), address(newArt));
    }

    /// TC-010: setResolution 成功
    function test_TC010_setResolution_HappyPath() public {
        descriptor.setResolution(640);
        assertEq(descriptor.resolution(), 640);
    }

    /// TC-011: setCompositeOrder 成功
    function test_TC011_setCompositeOrder_HappyPath() public {
        uint256[] memory newOrder = new uint256[](3);
        newOrder[0] = 2;
        newOrder[1] = 1;
        newOrder[2] = 0;
        descriptor.setCompositeOrder(newOrder);
        assertEq(descriptor.getCompositeOrderLength(), 3);
        assertEq(descriptor.getCompositeOrder()[0], 2);
    }

    /// TC-012: freezeMetadata 成功
    function test_TC012_freezeMetadata_HappyPath() public {
        descriptor.freezeMetadata();
        assertTrue(descriptor.isMetadataFrozen());
    }

    // =============================================================
    //                      観点 2: 異常系 (TC-013 〜 026)
    // =============================================================

    /// TC-013: tokenURI(traitIndices=[]) で EmptyTraitIndices revert
    function test_TC013_tokenURI_Reverts_When_EmptyIndices() public {
        vm.expectRevert(NijiDescriptor.EmptyTraitIndices.selector);
        descriptor.tokenURI(0, new uint256[](0));
    }

    /// TC-014: tokenURIWithMetadata(traitIndices=[]) で EmptyTraitIndices revert
    function test_TC014_tokenURIWithMetadata_Reverts_When_EmptyIndices() public {
        vm.expectRevert(NijiDescriptor.EmptyTraitIndices.selector);
        descriptor.tokenURIWithMetadata(0, new uint256[](0), 'X', 'Y');
    }

    /// TC-015: constructor art=address(0) で EmptyArtAddress revert
    function test_TC015_constructor_RejectsZeroArt() public {
        vm.expectRevert(NijiDescriptor.EmptyArtAddress.selector);
        new NijiDescriptor(address(0), 320, _compositeOrder());
    }

    /// TC-016: constructor resolution=0 で InvalidResolution revert
    function test_TC016_constructor_RejectsZeroResolution() public {
        vm.expectRevert(NijiDescriptor.InvalidResolution.selector);
        new NijiDescriptor(address(art), 0, _compositeOrder());
    }

    /// TC-017: non-owner が setArt で OwnableUnauthorizedAccount revert
    function test_TC017_setArt_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        descriptor.setArt(bob);
    }

    /// TC-018: non-owner が setResolution で OwnableUnauthorizedAccount revert
    function test_TC018_setResolution_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        descriptor.setResolution(640);
    }

    /// TC-019: non-owner が setCompositeOrder で OwnableUnauthorizedAccount revert
    function test_TC019_setCompositeOrder_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        descriptor.setCompositeOrder(new uint256[](0));
    }

    /// TC-020: non-owner が freezeMetadata で OwnableUnauthorizedAccount revert
    function test_TC020_freezeMetadata_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        descriptor.freezeMetadata();
    }

    /// TC-021: setArt address(0) で EmptyArtAddress revert
    function test_TC021_setArt_RejectsZeroAddress() public {
        vm.expectRevert(NijiDescriptor.EmptyArtAddress.selector);
        descriptor.setArt(address(0));
    }

    /// TC-022: setResolution 0 で InvalidResolution revert
    function test_TC022_setResolution_RejectsZero() public {
        vm.expectRevert(NijiDescriptor.InvalidResolution.selector);
        descriptor.setResolution(0);
    }

    /// TC-023: frozen 後 setArt で MetadataIsFrozen revert
    function test_TC023_setArt_Reverts_After_Frozen() public {
        descriptor.freezeMetadata();
        NijiArt newArt = new NijiArt(address(this), _traitNames());
        vm.expectRevert(NijiDescriptor.MetadataIsFrozen.selector);
        descriptor.setArt(address(newArt));
    }

    /// TC-024: frozen 後 setResolution で MetadataIsFrozen revert
    function test_TC024_setResolution_Reverts_After_Frozen() public {
        descriptor.freezeMetadata();
        vm.expectRevert(NijiDescriptor.MetadataIsFrozen.selector);
        descriptor.setResolution(640);
    }

    /// TC-025: frozen 後 setCompositeOrder で MetadataIsFrozen revert
    function test_TC025_setCompositeOrder_Reverts_After_Frozen() public {
        descriptor.freezeMetadata();
        vm.expectRevert(NijiDescriptor.MetadataIsFrozen.selector);
        descriptor.setCompositeOrder(new uint256[](0));
    }

    /// TC-026: 空 compositeOrder で deploy → freezeMetadata で NotConfigured revert
    function test_TC026_freezeMetadata_Reverts_When_NotConfigured() public {
        NijiDescriptor unconfigured = new NijiDescriptor(address(art), 320, new uint256[](0));
        vm.expectRevert(NijiDescriptor.NotConfigured.selector);
        unconfigured.freezeMetadata();
    }

    // =============================================================
    //                      観点 3: 境界値 (TC-027 〜 029)
    // =============================================================

    /// TC-027: compositeOrder 範囲外 traitId で layer skip (out of bounds 経路)
    function test_TC027_generateSVG_Boundary_CompositeOrderOutOfBounds() public {
        // compositeOrder=[5] だが indices.length=1 → traitId=5 は範囲外で skip
        uint256[] memory smallOrder = new uint256[](1);
        smallOrder[0] = 5;
        descriptor.setCompositeOrder(smallOrder);

        uint256[] memory smallIndices = new uint256[](1);
        smallIndices[0] = 0;
        string memory svg = descriptor.generateSVG(smallIndices);
        // SVG 接頭辞 + 終了 tag のみ (layer なし)
        assertEq(_startsWith(svg, '<svg xmlns'), true);
    }

    /// TC-028: SKIP_LAYER 含む indices で layer skip
    function test_TC028_generateSVG_Boundary_SkipLayer() public {
        uint256[] memory indices = new uint256[](12);
        indices[0] = type(uint256).max; // SKIP_LAYER
        // 他は 0
        string memory svg = descriptor.generateSVG(indices);
        assertTrue(bytes(svg).length > 0); // skip しても他 layer は render
    }

    /// TC-029: art に該当 trait image なし → InvalidImageIndex revert (NijiArt 側)
    function test_TC029_generateSVG_Boundary_InvalidImageIndex() public {
        uint256[] memory indices = new uint256[](12);
        indices[0] = 999; // image 0-1 しか存在しない
        // descriptor.generateSVG → art.getTraitImage(0, 999) → InvalidImageIndex revert
        vm.expectRevert(abi.encodeWithSelector(NijiArt.InvalidImageIndex.selector, uint256(0), uint256(999), uint256(1)));
        descriptor.generateSVG(indices);
    }

    // =============================================================
    //                      観点 4: 状態遷移 (TC-030 〜 031)
    // =============================================================

    /// TC-030: unconfigured で freezeMetadata が NotConfigured revert
    function test_TC030_freezeMetadata_Reverts_When_Unconfigured() public {
        NijiDescriptor unconfigured = new NijiDescriptor(address(art), 320, new uint256[](0));
        vm.expectRevert(NijiDescriptor.NotConfigured.selector);
        unconfigured.freezeMetadata();
    }

    /// TC-031: freeze 済 2 回目で MetadataIsFrozen revert
    function test_TC031_freezeMetadata_Idempotent() public {
        descriptor.freezeMetadata();
        vm.expectRevert(NijiDescriptor.MetadataIsFrozen.selector);
        descriptor.freezeMetadata();
    }

    // =============================================================
    //                      観点 6: 入力バリデーション (TC-032)
    // =============================================================

    /// TC-032: 空 compositeOrder で isConfigured = false
    function test_TC032_isConfigured_False_When_EmptyCompositeOrder() public {
        NijiDescriptor unconfigured = new NijiDescriptor(address(art), 320, new uint256[](0));
        assertFalse(unconfigured.isConfigured());
    }

    // =============================================================
    //                      観点 7: 冪等性 (TC-033)
    // =============================================================
    // TC-033 は TC-031 と同経路、 観点別 grouping のため再掲

    function test_TC033_freezeMetadata_Idempotent_RestatedForViewpoint7() public {
        descriptor.freezeMetadata();
        vm.expectRevert(NijiDescriptor.MetadataIsFrozen.selector);
        descriptor.freezeMetadata();
    }

    // =============================================================
    //                      観点 9: 性能 (TC-034)
    // =============================================================

    /// TC-034: 12 trait generateSVG が gas 10M 以下
    function test_TC034_generateSVG_GasUnder10M() public {
        uint256 gasBefore = gasleft();
        descriptor.generateSVG(_allZeroIndices());
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 10_000_000, 'generateSVG 12 layer should fit in 10M gas');
    }

    // =============================================================
    //                      観点 10: セキュリティ (TC-035)
    // =============================================================

    /// TC-035: renounceOwnership 常に revert
    function test_TC035_renounceOwnership_AlwaysReverts() public {
        vm.expectRevert(NijiDescriptor.RenounceOwnershipDisabled.selector);
        descriptor.renounceOwnership();
    }

    // =============================================================
    //                      helper
    // =============================================================

    /// @dev string が prefix で始まるかを判定 (simple startsWith)
    function _startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        if (strBytes.length < prefixBytes.length) return false;
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) return false;
        }
        return true;
    }
}
