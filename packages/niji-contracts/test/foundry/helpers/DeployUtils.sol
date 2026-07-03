// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import { INijiDAOLogic } from '../../../contracts/interfaces/INijiDAOLogic.sol';
import { NijiArt } from '../../../contracts/NijiArt.sol';
import { NijiDescriptor } from '../../../contracts/NijiDescriptor.sol';
import { NijiSeeder } from '../../../contracts/NijiSeeder.sol';
import { NijiToken } from '../../../contracts/NijiToken.sol';
import { NijiDAOExecutor } from '../../../contracts/governance/NijiDAOExecutor.sol';
import { INijiToken } from '../../../contracts/interfaces/INijiToken.sol';
import { NijiAuctionHouseProxy } from '../../../contracts/proxies/NijiAuctionHouseProxy.sol';
import { NijiAuctionHouseProxyAdmin } from '../../../contracts/proxies/NijiAuctionHouseProxyAdmin.sol';
import { NijiAuctionHouseV3 } from '../../../contracts/NijiAuctionHouseV3.sol';
import { WETH } from '../../../contracts/test/WETH.sol';
import { ChainalysisSanctionsListMock } from './ChainalysisSanctionsListMock.sol';

abstract contract DeployUtils is Test {
    uint256 constant TIMELOCK_DELAY = 2 days;
    uint256 constant VOTING_PERIOD = 7_200; // 24 hours
    uint256 constant VOTING_DELAY = 1;
    uint256 constant PROPOSAL_THRESHOLD = 1;
    uint256 constant QUORUM_VOTES_BPS = 2000;
    uint256 constant AUCTION_TIME_BUFFER = 5 minutes;
    uint256 constant AUCTION_RESERVE_PRICE = 1;
    uint8 constant AUCTION_MIN_BID_INCREMENT_PRCT = 2;
    uint256 constant AUCTION_DURATION = 24 hours;

    function _deployAuctionHouseAndToken(
        address owner,
        address noundersDAO,
        address minter
    ) internal returns (NijiAuctionHouseProxy, NijiAuctionHouseProxyAdmin) {
        noundersDAO;

        NijiToken token = deployToken(minter);
        NijiAuctionHouseV3 logic = new NijiAuctionHouseV3(INijiToken(address(token)), address(new WETH()), AUCTION_DURATION);
        NijiAuctionHouseProxyAdmin admin = new NijiAuctionHouseProxyAdmin();
        admin.transferOwnership(owner);

        bytes memory data = abi.encodeWithSelector(
            NijiAuctionHouseV3.initialize.selector,
            AUCTION_RESERVE_PRICE,
            AUCTION_TIME_BUFFER,
            AUCTION_MIN_BID_INCREMENT_PRCT,
            new ChainalysisSanctionsListMock()
        );
        NijiAuctionHouseProxy proxy = new NijiAuctionHouseProxy(address(logic), address(admin), data);
        NijiAuctionHouseV3 auction = NijiAuctionHouseV3(address(proxy));

        auction.transferOwnership(owner);
        token.setMinter(address(proxy));

        return (proxy, admin);
    }

    uint32 constant LAST_MINUTE_BLOCKS = 10;
    uint32 constant OBJECTION_PERIOD_BLOCKS = 10;
    uint32 constant UPDATABLE_PERIOD_BLOCKS = 10;
    uint256 constant DELAYED_GOV_DURATION = 30 days;
    uint256 constant FORK_PERIOD = 7 days;
    uint256 constant FORK_THRESHOLD_BPS = 2_000; // 20%
    uint256 public constant FORK_DAO_VOTING_PERIOD = 36000; // 5 days
    uint256 public constant FORK_DAO_VOTING_DELAY = 36000; // 5 days
    uint256 public constant FORK_DAO_PROPOSAL_THRESHOLD_BPS = 25; // 0.25%
    uint256 public constant FORK_DAO_QUORUM_VOTES_BPS = 1000; // 10%

    function _traitNames() internal pure returns (string[] memory traitNames) {
        traitNames = new string[](12);
        traitNames[0] = 'special';
        traitNames[1] = 'choker';
        traitNames[2] = 'headphone';
        traitNames[3] = 'leftHand';
        traitNames[4] = 'hat';
        traitNames[5] = 'clothing';
        traitNames[6] = 'ear';
        traitNames[7] = 'back';
        traitNames[8] = 'backDecoration';
        traitNames[9] = 'background';
        traitNames[10] = 'solidBackground';
        traitNames[11] = 'hair';
    }

    /// SSOT alignment = packages/niji-contracts/scripts/niji-encoder.ts の NIJI_COMPOSITE_ORDER と同順。
    /// user 指定 (Issue #3066) = special / choker を 8 / 9 位に配置、
    /// leftHand / clothing / ear を前詰め (5-7 位) にして 前面 3 trait (hat / hair / headphone) を邪魔しない。
    /// = [10, 9, 8, 7, 3, 5, 6, 0, 1, 4, 11, 2]
    function _compositeOrder() internal pure returns (uint256[] memory order) {
        order = new uint256[](12);
        order[0] = 10;
        order[1] = 9;
        order[2] = 8;
        order[3] = 7;
        order[4] = 3;
        order[5] = 5;
        order[6] = 6;
        order[7] = 0;
        order[8] = 1;
        order[9] = 4;
        order[10] = 11;
        order[11] = 2;
    }

    function _deployAndPopulateDescriptor() internal returns (NijiDescriptor) {
        NijiArt art = new NijiArt(address(this), _traitNames());
        NijiDescriptor descriptor = new NijiDescriptor(address(art), 320, _compositeOrder());
        _populateArt(art);
        return descriptor;
    }

    function _deployAndPopulateV2() internal returns (NijiDescriptor) {
        return _deployAndPopulateDescriptor();
    }

    function _deployAndPopulateV3() internal returns (NijiDescriptor) {
        return _deployAndPopulateDescriptor();
    }

    function _populateArt(NijiArt art) internal {
        bytes[] memory images = new bytes[](3);
        images[0] = hex'89504e47';
        images[1] = hex'89504e4700';
        images[2] = hex'89504e4701';

        for (uint256 i = 0; i < 12; i++) {
            art.addTraitImages(i, images);
        }
    }

    function deployToken(address minter) internal returns (NijiToken token) {
        NijiArt art = new NijiArt(address(this), _traitNames());
        NijiDescriptor descriptor = new NijiDescriptor(address(art), 320, _compositeOrder());
        _populateArt(art);

        NijiSeeder seeder = new NijiSeeder(address(art));
        token = new NijiToken('Niji', 'NIJI', address(descriptor), address(seeder), 0);
        token.setMintingActive(true);
        token.setPlaceholderURI('ipfs://placeholder');
        if (minter != address(0)) {
            token.setMinter(minter);
        }
    }

    function get1967Implementation(address proxy) internal view returns (address) {
        bytes32 slot = bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1);
        return address(uint160(uint256(vm.load(proxy, slot))));
    }
}
