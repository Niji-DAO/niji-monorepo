// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import 'forge-std/Test.sol';
import { NijiSeeder } from '../../contracts/NijiSeeder.sol';
import { INijiSeeder } from '../../contracts/interfaces/INijiSeeder.sol';

/// @notice NijiArt の最小限 mock — Seeder が読む getTraitImageCount(uint256) と
///         traitCount() のみ実装、 SSTORE2 や image storage は持たない。
contract NijiArtMock {
    uint256[] public traitImageCounts;

    constructor(uint256[] memory _counts) {
        for (uint256 i = 0; i < _counts.length; i++) {
            traitImageCounts.push(_counts[i]);
        }
    }

    function getTraitImageCount(uint256 traitId) external view returns (uint256) {
        if (traitId >= traitImageCounts.length) return 0;
        return traitImageCounts[traitId];
    }

    function traitCount() external view returns (uint256) {
        return traitImageCounts.length;
    }

    function setTraitImageCount(uint256 traitId, uint256 count) external {
        if (traitId >= traitImageCounts.length) {
            // 拡張、 0 埋め
            while (traitImageCounts.length < traitId) {
                traitImageCounts.push(0);
            }
            traitImageCounts.push(count);
        } else {
            traitImageCounts[traitId] = count;
        }
    }
}

contract NijiSeederKiwaTest is Test {
    NijiSeeder internal seeder;
    NijiArtMock internal art;
    address internal owner = address(0xBEEF);
    address internal nonOwner = address(0xDEAD);
    address internal descriptor = address(0x1234); // unused in current Seeder, kept for signature

    event ArtUpdated(address indexed oldArt, address indexed newArt);

    function setUp() public {
        // 12 trait に valid count (5 ~ 100) を割当てた mock Art
        uint256[] memory counts = new uint256[](12);
        for (uint256 i = 0; i < 12; i++) {
            counts[i] = 10 + i; // 10, 11, 12, ..., 21
        }
        art = new NijiArtMock(counts);

        vm.prank(owner);
        seeder = new NijiSeeder(address(art));
    }

    // ====================================================
    // TC-001 正常系: generateSeed が valid Seed struct を返す
    // ====================================================
    function test_TC001_generateSeed_returnsValidIndices() public {
        INijiSeeder.Seed memory seed = seeder.generateSeed(0, descriptor);
        assertLt(seed.special, 10);
        assertLt(seed.choker, 11);
        assertLt(seed.headphone, 12);
        assertLt(seed.leftHand, 13);
        assertLt(seed.hat, 14);
        assertLt(seed.clothing, 15);
        assertLt(seed.ear, 16);
        assertLt(seed.back, 17);
        assertLt(seed.backDecoration, 18);
        assertLt(seed.background, 19);
        assertLt(seed.solidBackground, 20);
        assertLt(seed.hair, 21);
    }

    // ====================================================
    // TC-002 正常系: generateSeedFromSource(0) で deterministic
    // ====================================================
    function test_TC002_generateSeedFromSource_zero_deterministic() public {
        INijiSeeder.Seed memory seed1 = seeder.generateSeedFromSource(0);
        INijiSeeder.Seed memory seed2 = seeder.generateSeedFromSource(0);
        assertEq(seed1.special, seed2.special);
        assertEq(seed1.hair, seed2.hair);
    }

    // ====================================================
    // TC-003 境界値: traitCount = 1 のとき常に index 0
    // ====================================================
    function test_TC003_pickTrait_count1_alwaysZero() public {
        // trait 0 (special) を 1 に変更
        art.setTraitImageCount(0, 1);
        // 複数 randomSource で確認
        for (uint256 src = 0; src < 5; src++) {
            INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(src);
            assertEq(seed.special, 0, 'special must be 0 when count=1');
        }
    }

    // ====================================================
    // TC-004 境界値: traitCount = 0 で SKIP_LAYER (uint48 max に潰れる)
    // ====================================================
    function test_TC004_pickTrait_count0_returnsSkipLayer() public {
        // trait 1 (choker) を 0 に変更
        art.setTraitImageCount(1, 0);
        INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(42);
        // _pickTrait は type(uint256).max を返すが uint48 cast で type(uint48).max に潰れる
        assertEq(seed.choker, type(uint48).max, 'choker must be uint48 max when count=0');
    }

    // ====================================================
    // TC-005 境界値: traitCount = 1000 でも valid range
    // ====================================================
    function test_TC005_pickTrait_largeCount_validRange() public {
        art.setTraitImageCount(11, 1000); // hair
        for (uint256 src = 0; src < 10; src++) {
            INijiSeeder.Seed memory seed = seeder.generateSeedFromSource(src);
            assertLt(seed.hair, 1000, 'hair must be < 1000');
        }
    }

    // ====================================================
    // TC-006 冪等性: generateSeed 同 chain state で同一 seed
    // ====================================================
    function test_TC006_generateSeed_idempotent() public {
        INijiSeeder.Seed memory seed1 = seeder.generateSeed(7, descriptor);
        INijiSeeder.Seed memory seed2 = seeder.generateSeed(7, descriptor);
        assertEq(seed1.special, seed2.special);
        assertEq(seed1.hair, seed2.hair);
    }

    // ====================================================
    // TC-007 冪等性: generateSeedFromSource(N) 同一引数で同一 seed
    // ====================================================
    function test_TC007_generateSeedFromSource_idempotent() public {
        INijiSeeder.Seed memory seed1 = seeder.generateSeedFromSource(123456789);
        INijiSeeder.Seed memory seed2 = seeder.generateSeedFromSource(123456789);
        assertEq(seed1.special, seed2.special);
        assertEq(seed1.choker, seed2.choker);
        assertEq(seed1.headphone, seed2.headphone);
    }

    // ====================================================
    // TC-008 異常系: setArt(address(0)) で InvalidArtAddress revert
    // ====================================================
    function test_TC008_setArt_zeroAddress_reverts() public {
        vm.prank(owner);
        vm.expectRevert(NijiSeeder.InvalidArtAddress.selector);
        seeder.setArt(address(0));
    }

    // ====================================================
    // TC-009 権限: non-owner が setArt を呼ぶと revert
    // ====================================================
    function test_TC009_setArt_nonOwner_reverts() public {
        // 別 mock Art を準備
        uint256[] memory counts = new uint256[](12);
        for (uint256 i = 0; i < 12; i++) counts[i] = 5;
        NijiArtMock newArt = new NijiArtMock(counts);

        vm.prank(nonOwner);
        // Ownable2Step は OwnableUnauthorizedAccount(address) を投げる
        vm.expectRevert();
        seeder.setArt(address(newArt));
    }

    // ====================================================
    // TC-010 正常系: setArt 成功で ArtUpdated event emit
    // ====================================================
    function test_TC010_setArt_emitsArtUpdated() public {
        uint256[] memory counts = new uint256[](12);
        for (uint256 i = 0; i < 12; i++) counts[i] = 5;
        NijiArtMock newArt = new NijiArtMock(counts);

        address oldArt = address(art);
        vm.expectEmit(true, true, false, false);
        emit ArtUpdated(oldArt, address(newArt));

        vm.prank(owner);
        seeder.setArt(address(newArt));
    }

    // ====================================================
    // TC-011 セキュリティ: 異なる tokenId で異なる seed (collision なし)
    // ====================================================
    function test_TC011_differentTokenIds_yieldDifferentSeeds() public {
        INijiSeeder.Seed memory seed0 = seeder.generateSeed(0, descriptor);
        INijiSeeder.Seed memory seed1 = seeder.generateSeed(1, descriptor);
        // 全 trait が完全一致は天文学的確率 (12 trait × 各 ~10 index)
        // 1 個でも異なれば collision なしと判定
        bool anyDiff = seed0.special != seed1.special
            || seed0.choker != seed1.choker
            || seed0.headphone != seed1.headphone
            || seed0.leftHand != seed1.leftHand
            || seed0.hat != seed1.hat
            || seed0.clothing != seed1.clothing
            || seed0.ear != seed1.ear
            || seed0.back != seed1.back
            || seed0.backDecoration != seed1.backDecoration
            || seed0.background != seed1.background
            || seed0.solidBackground != seed1.solidBackground
            || seed0.hair != seed1.hair;
        assertTrue(anyDiff, 'token 0 and 1 seeds must differ');
    }

    // ====================================================
    // TC-012 性能: generateSeed が想定 gas 内
    // ====================================================
    function test_TC012_generateSeed_gasUsage() public {
        uint256 gasBefore = gasleft();
        seeder.generateSeed(999, descriptor);
        uint256 gasUsed = gasBefore - gasleft();
        // view 経由なので staticcall + storage read 12 回 + keccak で 50k 以下を想定
        assertLt(gasUsed, 100_000, 'generateSeed gas should be reasonable');
    }

    // ====================================================
    // TC-013 回帰: getAllTraitCounts が 12 trait array を返す
    // ====================================================
    function test_TC013_getAllTraitCounts() public {
        uint256[] memory counts = seeder.getAllTraitCounts();
        assertEq(counts.length, 12, 'must return 12 trait counts');
        for (uint256 i = 0; i < 12; i++) {
            assertEq(counts[i], 10 + i, 'count must match setUp value');
        }
    }
}
