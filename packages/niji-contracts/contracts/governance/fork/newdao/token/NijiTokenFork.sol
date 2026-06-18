// SPDX-License-Identifier: GPL-3.0

/// @title The Niji ERC-721 token, adjusted for forks

pragma solidity ^0.8.19;

import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { ERC721CheckpointableUpgradeable } from './base/ERC721CheckpointableUpgradeable.sol';
import { INijiSeeder } from '../../../../interfaces/INijiSeeder.sol';
import { INijiToken } from '../../../../interfaces/INijiToken.sol';
import { INijiTokenFork } from './INijiTokenFork.sol';
import { NijiDescriptor } from '../../../../NijiDescriptor.sol';
import { UUPSUpgradeable } from '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol';
import { INijiDAOForkEscrow } from '../../../NijiDAOInterfaces.sol';

contract NijiTokenFork is INijiTokenFork, OwnableUpgradeable, ERC721CheckpointableUpgradeable, UUPSUpgradeable {
    error OnlyTokenOwnerCanClaim();
    error OnlyOriginalDAO();
    error OnlyDuringForkingPeriod();

    string public constant NAME = 'NijiTokenFork';

    /// @notice An address that has permissions to mint Niji tokens.
    address public minter;

    /// @notice The Niji token URI descriptor.
    NijiDescriptor public descriptor;

    /// @notice The Niji token seeder.
    INijiSeeder public seeder;

    /// @notice The escrow contract used to verify ownership of the original Niji tokens.
    INijiDAOForkEscrow public escrow;

    /// @notice The fork ID, used when querying the escrow for token ownership.
    uint32 public forkId;

    /// @notice How many tokens are still available to be claimed by users who put their original tokens in escrow.
    uint256 public remainingTokensToClaim;

    /// @notice The forking period expiration timestamp, after which new tokens cannot be claimed by the original DAO.
    uint256 public forkingPeriodEndTimestamp;

    /// @notice Whether the minter can be updated.
    bool public isMinterLocked;

    /// @notice Whether the descriptor can be updated.
    bool public isDescriptorLocked;

    /// @notice Whether the seeder can be updated.
    bool public isSeederLocked;

    /// @notice The token seeds.
    mapping(uint256 => INijiSeeder.Seed) public seeds;

    /// @notice The internal token ID tracker.
    uint256 private _currentTokenId;

    /// @notice IPFS content hash of contract-level metadata.
    string private _contractURIHash = 'QmZi1n79FqWt2tTLwCqiy6nLM6xLGRsEPQ5JmReJQKNNzX';

    modifier whenMinterNotLocked() {
        require(!isMinterLocked, 'Minter is locked');
        _;
    }

    modifier whenDescriptorNotLocked() {
        require(!isDescriptorLocked, 'Descriptor is locked');
        _;
    }

    modifier whenSeederNotLocked() {
        require(!isSeederLocked, 'Seeder is locked');
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, 'Sender is not the minter');
        _;
    }

    constructor() initializer {}

    function initialize(
        address _owner,
        address _minter,
        INijiDAOForkEscrow _escrow,
        uint32 _forkId,
        uint256 startTokenId,
        uint256 tokensToClaim,
        uint256 _forkingPeriodEndTimestamp
    ) external initializer {
        __ERC721_init('Niji', 'NIJI');
        _transferOwnership(_owner);
        minter = _minter;
        escrow = _escrow;
        forkId = _forkId;
        _currentTokenId = startTokenId;
        remainingTokensToClaim = tokensToClaim;
        forkingPeriodEndTimestamp = _forkingPeriodEndTimestamp;

        INijiToken originalToken = INijiToken(address(escrow.nijiToken()));
        descriptor = NijiDescriptor(originalToken.descriptor());
        seeder = INijiSeeder(originalToken.seeder());
    }

    function claimFromEscrow(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (escrow.ownerOfEscrowedToken(forkId, tokenId) != msg.sender) revert OnlyTokenOwnerCanClaim();

            _mintWithOriginalSeed(msg.sender, tokenId);
        }

        remainingTokensToClaim -= tokenIds.length;
    }

    function claimDuringForkPeriod(address to, uint256[] calldata tokenIds) external {
        uint256 currentTokenId = _currentTokenId;
        uint256 maxTokenId = 0;
        if (msg.sender != escrow.dao()) revert OnlyOriginalDAO();
        if (block.timestamp >= forkingPeriodEndTimestamp) revert OnlyDuringForkingPeriod();

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            _mintWithOriginalSeed(to, tokenId);

            if (tokenId > maxTokenId) maxTokenId = tokenId;
        }

        if (maxTokenId >= currentTokenId) _currentTokenId = maxTokenId + 1;
    }

    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked('ipfs://', _contractURIHash));
    }

    function setContractURIHash(string memory newContractURIHash) external onlyOwner {
        _contractURIHash = newContractURIHash;
    }

    function mint() public override onlyMinter returns (uint256) {
        return _mintTo(minter, _currentTokenId++);
    }

    function burn(uint256 tokenId) public override onlyMinter {
        _burn(tokenId);
        emit NounBurned(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), 'NijiToken: URI query for nonexistent token');
        return descriptor.tokenURI(tokenId, _seedToTraitIndices(seeds[tokenId]));
    }

    function dataURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), 'NijiToken: URI query for nonexistent token');
        return descriptor.tokenURI(tokenId, _seedToTraitIndices(seeds[tokenId]));
    }

    function setMinter(address _minter) external override onlyOwner whenMinterNotLocked {
        minter = _minter;
        emit MinterUpdated(_minter);
    }

    function lockMinter() external override onlyOwner whenMinterNotLocked {
        isMinterLocked = true;
        emit MinterLocked();
    }

    function setDescriptor(address _descriptor) external override onlyOwner whenDescriptorNotLocked {
        descriptor = NijiDescriptor(_descriptor);
        emit DescriptorUpdated(_descriptor);
    }

    function lockDescriptor() external override onlyOwner whenDescriptorNotLocked {
        isDescriptorLocked = true;
        emit DescriptorLocked();
    }

    function setSeeder(address _seeder) external override onlyOwner whenSeederNotLocked {
        seeder = INijiSeeder(_seeder);
        emit SeederUpdated(_seeder);
    }

    function lockSeeder() external override onlyOwner whenSeederNotLocked {
        isSeederLocked = true;
        emit SeederLocked();
    }

    function _mintTo(address to, uint256 tokenId) internal returns (uint256) {
        INijiSeeder.Seed memory seed = seeder.generateSeed(tokenId, address(descriptor));
        seeds[tokenId] = seed;

        _mint(to, tokenId);
        emit NounCreated(tokenId, seed);

        return tokenId;
    }

    function _mintWithOriginalSeed(address to, uint256 tokenId) internal {
        (bool ok, bytes memory data) =
            address(escrow.nijiToken()).staticcall(abi.encodeWithSelector(INijiToken.seeds.selector, tokenId));
        require(ok, 'Original seed lookup failed');

        INijiSeeder.Seed memory seed = abi.decode(data, (INijiSeeder.Seed));

        seeds[tokenId] = seed;
        _mint(to, tokenId);

        emit NounCreated(tokenId, seed);
    }

    function _seedToTraitIndices(INijiSeeder.Seed memory seed) internal pure returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](12);

        indices[0] = seed.special;
        indices[1] = seed.choker;
        indices[2] = seed.headphone;
        indices[3] = seed.leftHand;
        indices[4] = seed.hat;
        indices[5] = seed.clothing;
        indices[6] = seed.ear;
        indices[7] = seed.back;
        indices[8] = seed.backDecoration;
        indices[9] = seed.background;
        indices[10] = seed.solidBackground;
        indices[11] = seed.hair;

        return indices;
    }

    function _authorizeUpgrade(address) internal view override onlyOwner {}
}
