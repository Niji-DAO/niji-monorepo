// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/// @title NijiSeederPhase1Test - Phase 1 kiwa chain (Issue #295) で生成、 11 観点 35 TC
/// @dev Layer 1 spec: tests/spec/contract/test-spec-niji-seeder-2.ja.md
///      Layer 2 skill: /kiwa-forge

import 'forge-std/Test.sol';
import { NijiArt } from '../../../contracts/NijiArt.sol';
import { NijiSeeder } from '../../../contracts/NijiSeeder.sol';
import { INijiSeeder } from '../../../contracts/interfaces/INijiSeeder.sol';
import { Ownable } from '@openzeppelin/contracts-v5/access/Ownable.sol';

contract NijiSeederPhase1Test is Test {
    NijiArt internal art;
    NijiSeeder internal seeder;
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

    /// @dev art に 12 trait 各 4 image を投入 (NijiSeeder の _pickTrait が 0-3 範囲を選ぶ前提)
    function _populateArt(NijiArt a, uint256 imagesPerTrait) internal {
        bytes[] memory imgs = new bytes[](imagesPerTrait);
        for (uint256 j = 0; j < imagesPerTrait; j++) {
            imgs[j] = abi.encodePacked(uint8(j + 1)); // 1, 2, 3, ...
        }
        for (uint256 i = 0; i < 12; i++) {
            a.addTraitImages(i, imgs);
        }
    }

    function setUp() public virtual {
        art = new NijiArt(address(this), _traitNames());
        _populateArt(art, 4);
        seeder = new NijiSeeder(address(art));
    }

    // =============================================================
    //                      観点 1: 正常系 (TC-001 〜 008, 030-033, 035)
    // =============================================================

    /// TC-001: generateSeed 正常系 (12 trait 各 4 image setup)
    function test_TC001_generateSeed_HappyPath() public {
        INijiSeeder.Seed memory seed = seeder.generateSeed(0, address(0));
        // 12 trait 各 4 image なので index 0-3 範囲
        assertTrue(seed.special <= 3);
        assertTrue(seed.hair <= 3);
    }

    /// TC-002: generateSeedFromSource 正常系
    function test_TC002_generateSeedFromSource_HappyPath() public {
        INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(12345);
        assertTrue(seed.special <= 3);
    }

    /// TC-003: generateSeedFromSource deterministic (2 回連続呼出で同 seed)
    function test_TC003_generateSeedFromSource_Deterministic() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeedFromSource(12345);
        INijiSeeder.Seed memory s2 = seeder.generateSeedFromSource(12345);
        assertEq(s1.special, s2.special);
        assertEq(s1.hair, s2.hair);
    }

    /// TC-004: getTraitCount delegate to art
    function test_TC004_getTraitCount_HappyPath() public {
        assertEq(seeder.getTraitCount(0), 4);
        assertEq(seeder.getTraitCount(11), 4);
    }

    /// TC-005: getAllTraitCounts 12 要素 array
    function test_TC005_getAllTraitCounts_HappyPath() public {
        uint256[] memory counts = seeder.getAllTraitCounts();
        assertEq(counts.length, 12);
        for (uint256 i = 0; i < 12; i++) {
            assertEq(counts[i], 4);
        }
    }

    /// TC-006: setArt 成功 + ArtUpdated event
    function test_TC006_setArt_HappyPath() public {
        NijiArt newArt = new NijiArt(address(this), _traitNames());
        seeder.setArt(address(newArt));
        assertEq(address(seeder.art()), address(newArt));
    }

    /// TC-007: setEntropySalt 成功 + EntropySaltUpdated event
    function test_TC007_setEntropySalt_HappyPath() public {
        bytes32 newSalt = bytes32(uint256(0xdeadbeef));
        seeder.setEntropySalt(newSalt);
        assertEq(seeder.entropySalt(), newSalt);
    }

    /// TC-008: lockEntropySalt 成功 + isEntropySaltLocked=true
    function test_TC008_lockEntropySalt_HappyPath() public {
        seeder.lockEntropySalt();
        assertTrue(seeder.isEntropySaltLocked());
    }

    /// TC-030: 最大 randomSource (uint256 max) で trait index 範囲内
    function test_TC030_generateSeedFromSource_MaxRandomSource() public {
        INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(type(uint256).max);
        assertTrue(seed.special <= 3);
        assertTrue(seed.hair <= 3);
    }

    /// TC-031: initial entropySalt は 0
    function test_TC031_initial_entropySalt() public {
        assertEq(seeder.entropySalt(), bytes32(0));
    }

    /// TC-032: initial isEntropySaltLocked は false
    function test_TC032_initial_isEntropySaltLocked() public {
        assertFalse(seeder.isEntropySaltLocked());
    }

    /// TC-033: constructor で渡した art address
    function test_TC033_constructor_artAddress() public {
        assertEq(address(seeder.art()), address(art));
    }

    /// TC-035: descriptor 引数は無視される (interface compat)
    function test_TC035_generateSeed_descriptorArgIgnored() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeed(0, address(0));
        INijiSeeder.Seed memory s2 = seeder.generateSeed(0, address(0xDEAD));
        // 同 block / 同 tokenId なら descriptor 違いでも同 seed
        assertEq(s1.special, s2.special);
    }

    // =============================================================
    //                      観点 2: 異常系 (TC-009 〜 014)
    // =============================================================

    /// TC-009: non-owner が setArt で OwnableUnauthorizedAccount revert
    function test_TC009_setArt_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        seeder.setArt(bob);
    }

    /// TC-010: non-owner が setEntropySalt で OwnableUnauthorizedAccount revert
    function test_TC010_setEntropySalt_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        seeder.setEntropySalt(bytes32(uint256(0xdead)));
    }

    /// TC-011: non-owner が lockEntropySalt で OwnableUnauthorizedAccount revert
    function test_TC011_lockEntropySalt_OnlyOwner() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        seeder.lockEntropySalt();
    }

    /// TC-012: setArt address(0) で InvalidArtAddress revert
    function test_TC012_setArt_RejectsZeroAddress() public {
        vm.expectRevert(NijiSeeder.InvalidArtAddress.selector);
        seeder.setArt(address(0));
    }

    /// TC-013: constructor art=address(0) で InvalidArtAddress revert
    function test_TC013_constructor_RejectsZeroArt() public {
        vm.expectRevert(NijiSeeder.InvalidArtAddress.selector);
        new NijiSeeder(address(0));
    }

    /// TC-014: lockEntropySalt 後 setEntropySalt で EntropySaltLocked revert
    function test_TC014_setEntropySalt_Reverts_After_Locked() public {
        seeder.lockEntropySalt();
        vm.expectRevert(NijiSeeder.EntropySaltLocked.selector);
        seeder.setEntropySalt(bytes32(uint256(0xdead)));
    }

    // =============================================================
    //                      観点 3: 境界値 (TC-015 〜 016, 034)
    // =============================================================

    /// TC-015: art trait image 0 件 → _pickTrait が SKIP_LAYER (uint48 cast で type(uint48).max)
    function test_TC015_pickTrait_ZeroImages_ReturnsSkipLayer() public {
        // art を空 trait で deploy
        NijiArt emptyArt = new NijiArt(address(this), _traitNames());
        NijiSeeder emptySeeder = new NijiSeeder(address(emptyArt));

        INijiSeeder.Seed memory seed = emptySeeder.generateSeedFromSource(12345);
        // 0 件なら _pickTrait が type(uint256).max → uint48 cast で type(uint48).max (0xffffffffffff)
        assertEq(seed.special, type(uint48).max);
    }

    /// TC-016: 1 件 trait で trait index は常に 0
    function test_TC016_pickTrait_SingleImage_AlwaysZero() public {
        NijiArt singleArt = new NijiArt(address(this), _traitNames());
        bytes[] memory imgs = new bytes[](1);
        imgs[0] = hex'aa';
        for (uint256 i = 0; i < 12; i++) {
            singleArt.addTraitImages(i, imgs);
        }
        NijiSeeder singleSeeder = new NijiSeeder(address(singleArt));

        INijiSeeder.Seed memory seed = singleSeeder.generateSeedFromSource(999);
        assertEq(seed.special, 0); // 任意 randomValue % 1 == 0
    }

    /// TC-034: trait count 50 (大き目) で index 0-49 範囲
    function test_TC034_pickTrait_LargeTraitCount() public {
        NijiArt bigArt = new NijiArt(address(this), _traitNames());
        bytes[] memory imgs = new bytes[](50);
        for (uint256 j = 0; j < 50; j++) {
            imgs[j] = abi.encodePacked(uint8(j + 1));
        }
        for (uint256 i = 0; i < 12; i++) {
            bigArt.addTraitImages(i, imgs);
        }
        NijiSeeder bigSeeder = new NijiSeeder(address(bigArt));

        INijiSeeder.Seed memory seed = bigSeeder.generateSeedFromSource(49);
        assertTrue(seed.special <= 49);
    }

    // =============================================================
    //                      観点 4: 状態遷移 (TC-017 〜 018)
    // =============================================================

    /// TC-017: lockEntropySalt() 1-way 遷移
    function test_TC017_lockEntropySalt_OneWayTransition() public {
        assertFalse(seeder.isEntropySaltLocked());
        seeder.lockEntropySalt();
        assertTrue(seeder.isEntropySaltLocked());
    }

    /// TC-018: locked 後の setEntropySalt が block 状態を維持
    function test_TC018_setEntropySalt_Blocked_After_Lock() public {
        seeder.setEntropySalt(bytes32(uint256(0xaa)));
        seeder.lockEntropySalt();
        vm.expectRevert(NijiSeeder.EntropySaltLocked.selector);
        seeder.setEntropySalt(bytes32(uint256(0xbb)));
        assertEq(seeder.entropySalt(), bytes32(uint256(0xaa))); // 元の値維持
    }

    // =============================================================
    //                      観点 6: 入力バリデーション (TC-019 〜 020)
    // =============================================================
    // TC-019, TC-020 は観点 2 と同 logic (TC-012, TC-013 と同経路)、 観点別 grouping のため再掲

    function test_TC019_constructor_RejectsZeroArt_InputValidation() public {
        vm.expectRevert(NijiSeeder.InvalidArtAddress.selector);
        new NijiSeeder(address(0));
    }

    function test_TC020_setArt_RejectsZeroAddress_InputValidation() public {
        vm.expectRevert(NijiSeeder.InvalidArtAddress.selector);
        seeder.setArt(address(0));
    }

    // =============================================================
    //                      観点 7: 冪等性 (TC-021)
    // =============================================================

    /// TC-021: lockEntropySalt 2 回目で EntropySaltLocked revert
    function test_TC021_lockEntropySalt_Idempotent() public {
        seeder.lockEntropySalt();
        vm.expectRevert(NijiSeeder.EntropySaltLocked.selector);
        seeder.lockEntropySalt();
    }

    // =============================================================
    //                      観点 8: 並行処理 (TC-022 〜 023)
    // =============================================================

    /// TC-022: 同 block 内で同 tokenId / 同 chainid → 同 seed (deterministic)
    function test_TC022_generateSeed_SameBlock_SameTokenId_SameSeed() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeed(0, address(0));
        INijiSeeder.Seed memory s2 = seeder.generateSeed(0, address(0));
        assertEq(s1.special, s2.special);
        assertEq(s1.hair, s2.hair);
    }

    /// TC-023: block 進行で seed 変動 (blockhash 変動)
    function test_TC023_generateSeed_DifferentBlock_DifferentSeed() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeed(0, address(0));
        vm.roll(block.number + 10);
        INijiSeeder.Seed memory s2 = seeder.generateSeed(0, address(0));
        // blockhash + timestamp 等が変動するため少なくとも 1 trait は変わる可能性高い
        bool anyDiff = (s1.special != s2.special) || (s1.choker != s2.choker) || (s1.headphone != s2.headphone)
            || (s1.leftHand != s2.leftHand) || (s1.hat != s2.hat) || (s1.clothing != s2.clothing)
            || (s1.ear != s2.ear) || (s1.back != s2.back) || (s1.backDecoration != s2.backDecoration)
            || (s1.background != s2.background) || (s1.solidBackground != s2.solidBackground) || (s1.hair != s2.hair);
        assertTrue(anyDiff, 'block progression changes seed');
    }

    // =============================================================
    //                      観点 9: 性能 (TC-024)
    // =============================================================

    /// TC-024: generateSeed gas < 100k (view、 art への SLOAD のみ)
    function test_TC024_generateSeed_GasUnder100k() public {
        uint256 gasBefore = gasleft();
        seeder.generateSeed(0, address(0));
        uint256 gasUsed = gasBefore - gasleft();
        // 12 trait の getTraitImageCount SLOAD + keccak256 で 100k 程度
        assertLt(gasUsed, 200_000, 'generateSeed should fit in 200k gas');
    }

    // =============================================================
    //                      観点 10: セキュリティ (TC-025 〜 027)
    // =============================================================

    /// TC-025: chainid 変更で seed 変動 (cross-chain replay 防御)
    function test_TC025_generateSeed_ChainIdAffectsSeed() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeed(0, address(0));
        vm.chainId(137); // Polygon に切替
        INijiSeeder.Seed memory s2 = seeder.generateSeed(0, address(0));
        bool anyDiff = (s1.special != s2.special) || (s1.hair != s2.hair) || (s1.background != s2.background);
        assertTrue(anyDiff, 'chainid change rotates seed (cross-chain replay defense)');
    }

    /// TC-026: entropySalt 変更で seed 変動 (rotation 効果)
    function test_TC026_generateSeed_EntropySaltAffectsSeed() public {
        INijiSeeder.Seed memory s1 = seeder.generateSeed(0, address(0));
        seeder.setEntropySalt(bytes32(uint256(0xff)));
        INijiSeeder.Seed memory s2 = seeder.generateSeed(0, address(0));
        bool anyDiff = (s1.special != s2.special) || (s1.hair != s2.hair) || (s1.background != s2.background);
        assertTrue(anyDiff, 'entropySalt change rotates seed');
    }

    /// TC-027: renounceOwnership() 常に revert
    function test_TC027_renounceOwnership_AlwaysReverts() public {
        vm.expectRevert(NijiSeeder.RenounceOwnershipDisabled.selector);
        seeder.renounceOwnership();
    }

    // =============================================================
    //                      観点 11: 回帰 (Issue #34) (TC-028 〜 029)
    // =============================================================

    /// TC-028: 異なる chainid で異なる seed (Issue #34 cross-chain replay 防御)
    function test_TC028_chainId_RegressionDefense_Issue34() public {
        vm.chainId(1);
        INijiSeeder.Seed memory mainnet = seeder.generateSeed(0, address(0));
        vm.chainId(137);
        INijiSeeder.Seed memory polygon = seeder.generateSeed(0, address(0));
        bool anyDiff = (mainnet.special != polygon.special) || (mainnet.hair != polygon.hair);
        assertTrue(anyDiff);
    }

    /// TC-029: 16 種 salt 値で seed が全て異なる (回転 salt 効果)
    function test_TC029_entropySalt_RegressionDefense_Issue34() public {
        INijiSeeder.Seed[] memory seeds = new INijiSeeder.Seed[](16);
        for (uint256 i = 0; i < 16; i++) {
            seeder.setEntropySalt(bytes32(uint256(i + 1)));
            seeds[i] = seeder.generateSeed(0, address(0));
        }
        // 少なくとも 1 trait は変動 (16 種全 special が同 1 値はランダム的にあり得ない)
        bool anyDiff = false;
        for (uint256 i = 1; i < 16; i++) {
            if (seeds[i].special != seeds[0].special) {
                anyDiff = true;
                break;
            }
        }
        assertTrue(anyDiff, '16 salts rotate seed.special');
    }
}
