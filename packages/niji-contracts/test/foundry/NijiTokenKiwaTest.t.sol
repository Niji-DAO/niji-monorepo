// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import 'forge-std/Test.sol';
import { NijiToken } from '../../contracts/NijiToken.sol';
import { INijiSeeder } from '../../contracts/interfaces/INijiSeeder.sol';

/// @notice 最小 mock Seeder — generateSeed が deterministic な Seed を返す。
contract NijiSeederMock {
    function generateSeed(uint256 tokenId, address) external pure returns (INijiSeeder.Seed memory) {
        // tokenId に応じて単純な seed を返す (collision なし)
        return
            INijiSeeder.Seed({
                special: uint48(tokenId % 5),
                choker: uint48((tokenId + 1) % 5),
                headphone: uint48((tokenId + 2) % 5),
                leftHand: uint48((tokenId + 3) % 5),
                hat: uint48((tokenId + 4) % 5),
                clothing: uint48((tokenId + 5) % 5),
                ear: uint48((tokenId + 6) % 5),
                back: uint48((tokenId + 7) % 5),
                backDecoration: uint48((tokenId + 8) % 5),
                background: uint48((tokenId + 9) % 5),
                solidBackground: uint48((tokenId + 10) % 5),
                hair: uint48((tokenId + 11) % 5)
            });
    }
}

/// @notice 最小 mock Descriptor — tokenURI 呼出 は本 spec で扱わない (Issue #185)。
///         NijiToken constructor は `NijiDescriptor(_descriptor)` で cast するため
///         empty contract address でも byte code が deploy されていれば設置可。
contract NijiDescriptorStub {
    // Storage 配置 / function 実装は本 test では呼ばないため省略
}

contract NijiTokenKiwaTest is Test {
    NijiToken internal token;
    NijiSeederMock internal seeder;
    NijiDescriptorStub internal descriptor;
    address internal owner = address(0xBEEF);
    address internal nonOwner = address(0xDEAD);
    address internal minter = address(0x4567);
    address internal nonMinter = address(0xCAFE);
    address internal recipient = address(0x1234);

    event NijiMinted(uint256 indexed tokenId, address indexed to, INijiSeeder.Seed seed);
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    event SeederUpdated(address indexed oldSeeder, address indexed newSeeder);
    event DescriptorUpdated(address indexed oldDescriptor, address indexed newDescriptor);
    event MintingToggled(bool isActive);

    function setUp() public {
        seeder = new NijiSeederMock();
        descriptor = new NijiDescriptorStub();

        vm.prank(owner);
        token = new NijiToken('Niji', 'NIJI', address(descriptor), address(seeder), 0);

        // constructor で minter = msg.sender = owner、 default minter は owner
        // test 用に dedicated minter を設定
        vm.prank(owner);
        token.setMinter(minter);

        // mintingActive を true に
        vm.prank(owner);
        token.setMintingActive(true);

        // placeholder URI 設定 (Niji 仕様 ... mint 前に必須)
        vm.prank(owner);
        token.setPlaceholderURI('ipfs://placeholder');
    }

    // ====================================================
    // TC-001 正常系: mint(to) 成功、 NijiMinted event
    // ====================================================
    function test_TC001_mint_to_emitsNijiMinted() public {
        vm.expectEmit(true, true, false, false);
        emit NijiMinted(0, recipient, seeder.generateSeed(0, address(descriptor)));

        vm.prank(minter);
        uint256 tokenId = token.mint(recipient);
        assertEq(tokenId, 0, 'first mint tokenId == 0');
        assertEq(token.ownerOf(0), recipient, 'recipient owns token 0');
    }

    // ====================================================
    // TC-002 異常系: mintingActive=false で mint revert
    // ====================================================
    function test_TC002_mint_inactive_reverts() public {
        vm.prank(owner);
        token.setMintingActive(false);

        vm.prank(minter);
        vm.expectRevert(NijiToken.MintingNotActive.selector);
        token.mint(recipient);
    }

    // ====================================================
    // TC-003 異常系: maxSupply 到達で revert
    // ====================================================
    function test_TC003_mint_maxSupply_reverts() public {
        // maxSupply = 2 の新 token を deploy
        vm.prank(owner);
        NijiToken capped = new NijiToken('Capped', 'CAP', address(descriptor), address(seeder), 2);

        vm.prank(owner);
        capped.setMinter(minter);
        vm.prank(owner);
        capped.setMintingActive(true);
        vm.prank(owner);
        capped.setPlaceholderURI('ipfs://placeholder');

        vm.prank(minter);
        capped.mint(recipient); // 0
        vm.prank(minter);
        capped.mint(recipient); // 1
        // 3 mint 目で MaxSupplyReached
        vm.prank(minter);
        vm.expectRevert(NijiToken.MaxSupplyReached.selector);
        capped.mint(recipient);
    }

    // ====================================================
    // TC-004 状態遷移: toggleMinting で反転 + event
    // ====================================================
    function test_TC004_toggleMinting() public {
        // setUp で true なので 1 度目 toggle で false
        vm.expectEmit(false, false, false, true);
        emit MintingToggled(false);
        vm.prank(owner);
        token.toggleMinting();

        // 2 度目 toggle で true
        vm.expectEmit(false, false, false, true);
        emit MintingToggled(true);
        vm.prank(owner);
        token.toggleMinting();
    }

    // ====================================================
    // TC-005 状態遷移: setMintingActive 直接 + event
    // ====================================================
    function test_TC005_setMintingActive() public {
        vm.expectEmit(false, false, false, true);
        emit MintingToggled(false);
        vm.prank(owner);
        token.setMintingActive(false);

        vm.expectEmit(false, false, false, true);
        emit MintingToggled(true);
        vm.prank(owner);
        token.setMintingActive(true);
    }

    // ====================================================
    // TC-006 権限: non-minter が mint() で OnlyMinter revert
    // ====================================================
    function test_TC006_mint_nonMinter_reverts() public {
        vm.prank(nonMinter);
        vm.expectRevert(NijiToken.OnlyMinter.selector);
        token.mint(recipient);
    }

    // ====================================================
    // TC-007 権限: non-owner が setMinter で revert
    // ====================================================
    function test_TC007_setMinter_nonOwner_reverts() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        token.setMinter(nonMinter);
    }

    // ====================================================
    // TC-008 正常系: setMinter 成功で MinterUpdated event
    // ====================================================
    function test_TC008_setMinter_emitsEvent() public {
        address newMinter = address(0x9999);
        vm.expectEmit(true, true, false, false);
        emit MinterUpdated(minter, newMinter);
        vm.prank(owner);
        token.setMinter(newMinter);
    }

    // ====================================================
    // TC-009 正常系: setSeeder / setDescriptor で event
    // ====================================================
    function test_TC009_setSeederDescriptor_emitsEvents() public {
        NijiSeederMock newSeeder = new NijiSeederMock();
        NijiDescriptorStub newDescriptor = new NijiDescriptorStub();

        vm.expectEmit(true, true, false, false);
        emit SeederUpdated(address(seeder), address(newSeeder));
        vm.prank(owner);
        token.setSeeder(address(newSeeder));

        vm.expectEmit(true, true, false, false);
        emit DescriptorUpdated(address(descriptor), address(newDescriptor));
        vm.prank(owner);
        token.setDescriptor(address(newDescriptor));
    }

    // ====================================================
    // TC-010 回帰: burn(tokenId) で ownerOf revert + remainingSupply 増
    // ====================================================
    function test_TC010_burn_clearsOwnership() public {
        vm.prank(minter);
        token.mint(recipient);
        assertEq(token.ownerOf(0), recipient);

        vm.prank(minter);
        token.burn(0);

        // ownerOf(0) は ERC721NonexistentToken revert
        vm.expectRevert();
        token.ownerOf(0);
        assertFalse(token.exists(0), 'burned token must not exist');
    }

    // ====================================================
    // TC-011 セキュリティ: lockProvenanceHash 後の set が revert
    // ====================================================
    function test_TC011_provenanceHash_lockedReverts() public {
        vm.prank(owner);
        token.setProvenanceHash('hash1');

        vm.prank(owner);
        token.lockProvenanceHash();

        vm.prank(owner);
        vm.expectRevert(NijiToken.ProvenanceHashLocked.selector);
        token.setProvenanceHash('hash2');
    }
}
