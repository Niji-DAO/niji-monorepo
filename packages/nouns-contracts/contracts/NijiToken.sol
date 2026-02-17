// SPDX-License-Identifier: GPL-3.0

/// @title NijiToken - ERC721 token for Niji generative art
/// @author Niji DAO
/// @notice ERC721 implementation for minting and managing Niji NFTs
/// @dev Integrates with NijiDescriptor for on-chain SVG generation and NijiSeeder for trait randomization

pragma solidity ^0.8.20;

import { ERC721 } from '@openzeppelin/contracts-v5/token/ERC721/ERC721.sol';
import { ERC721Enumerable } from '@openzeppelin/contracts-v5/token/ERC721/extensions/ERC721Enumerable.sol';
import { Ownable } from '@openzeppelin/contracts-v5/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts-v5/utils/ReentrancyGuard.sol';
import { NijiDescriptor } from './NijiDescriptor.sol';
import { INijiSeeder } from './interfaces/INijiSeeder.sol';

contract NijiToken is ERC721Enumerable, Ownable, ReentrancyGuard {
    // =============================================================
    //                           ERRORS
    // =============================================================

    /// @notice Thrown when minting is not active
    error MintingNotActive();

    /// @notice Thrown when max supply is reached
    error MaxSupplyReached();

    /// @notice Thrown when caller is not the minter
    error OnlyMinter();

    /// @notice Thrown when descriptor is not set
    error DescriptorNotSet();

    /// @notice Thrown when seeder is not set
    error SeederNotSet();

    /// @notice Thrown when address is empty
    error EmptyAddress();

    /// @notice Thrown when token does not exist
    error TokenDoesNotExist();

    // =============================================================
    //                           EVENTS
    // =============================================================

    /// @notice Emitted when a new Niji is minted
    /// @param tokenId The minted token ID
    /// @param to The recipient address
    /// @param seed The generated seed for traits
    event NijiMinted(uint256 indexed tokenId, address indexed to, INijiSeeder.Seed seed);

    /// @notice Emitted when the descriptor is updated
    /// @param oldDescriptor The previous descriptor address
    /// @param newDescriptor The new descriptor address
    event DescriptorUpdated(address indexed oldDescriptor, address indexed newDescriptor);

    /// @notice Emitted when the seeder is updated
    /// @param oldSeeder The previous seeder address
    /// @param newSeeder The new seeder address
    event SeederUpdated(address indexed oldSeeder, address indexed newSeeder);

    /// @notice Emitted when the minter is updated
    /// @param oldMinter The previous minter address
    /// @param newMinter The new minter address
    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    /// @notice Emitted when minting is toggled
    /// @param isActive Whether minting is now active
    event MintingToggled(bool isActive);

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice The Niji descriptor contract for generating tokenURI
    NijiDescriptor public descriptor;

    /// @notice The Niji seeder contract for generating random traits
    INijiSeeder public seeder;

    /// @notice The minter address (can mint new tokens)
    address public minter;

    /// @notice Current token ID counter
    uint256 private _currentTokenId;

    /// @notice Maximum supply (0 = unlimited)
    uint256 public maxSupply;

    /// @notice Whether minting is active
    bool public isMintingActive;

    /// @notice Mapping from token ID to seed
    mapping(uint256 => INijiSeeder.Seed) public seeds;

    // =============================================================
    //                           MODIFIERS
    // =============================================================

    /// @notice Restricts function access to the minter
    modifier onlyMinter() {
        if (msg.sender != minter) revert OnlyMinter();
        _;
    }

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    /// @notice Creates a new NijiToken contract
    /// @param _name Token name
    /// @param _symbol Token symbol
    /// @param _descriptor The descriptor contract address
    /// @param _seeder The seeder contract address
    /// @param _maxSupply Maximum supply (0 = unlimited)
    constructor(
        string memory _name,
        string memory _symbol,
        address _descriptor,
        address _seeder,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        if (_descriptor == address(0)) revert DescriptorNotSet();
        if (_seeder == address(0)) revert SeederNotSet();

        descriptor = NijiDescriptor(_descriptor);
        seeder = INijiSeeder(_seeder);
        maxSupply = _maxSupply;
        minter = msg.sender;
        isMintingActive = false;
    }

    // =============================================================
    //                      MINTING FUNCTIONS
    // =============================================================

    /// @notice Mint a new Niji to an address
    /// @param to The recipient address
    /// @return tokenId The minted token ID
    function mint(address to) external onlyMinter nonReentrant returns (uint256) {
        if (!isMintingActive) revert MintingNotActive();
        if (maxSupply > 0 && _currentTokenId >= maxSupply) revert MaxSupplyReached();

        return _mintTo(to);
    }

    /// @notice Mint multiple Nijis to an address
    /// @param to The recipient address
    /// @param quantity Number of tokens to mint
    /// @return tokenIds Array of minted token IDs
    function mintBatch(address to, uint256 quantity) external onlyMinter nonReentrant returns (uint256[] memory) {
        if (!isMintingActive) revert MintingNotActive();
        if (maxSupply > 0 && _currentTokenId + quantity > maxSupply) revert MaxSupplyReached();

        uint256[] memory tokenIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; ) {
            tokenIds[i] = _mintTo(to);
            unchecked { ++i; }
        }

        return tokenIds;
    }

    /// @notice Internal mint function
    /// @param to The recipient address
    /// @return tokenId The minted token ID
    function _mintTo(address to) internal returns (uint256) {
        uint256 tokenId = _currentTokenId;

        // Generate seed for this token
        INijiSeeder.Seed memory seed = seeder.generateSeed(tokenId, address(descriptor));
        seeds[tokenId] = seed;

        _safeMint(to, tokenId);

        unchecked { ++_currentTokenId; }

        emit NijiMinted(tokenId, to, seed);

        return tokenId;
    }

    // =============================================================
    //                      TOKEN URI
    // =============================================================

    /// @notice Returns the token URI for a given token ID
    /// @param tokenId The token ID
    /// @return The token URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();

        INijiSeeder.Seed memory seed = seeds[tokenId];
        uint256[] memory traitIndices = _seedToTraitIndices(seed);

        return descriptor.tokenURI(tokenId, traitIndices);
    }

    /// @notice Convert seed to trait indices array
    /// @param seed The seed struct
    /// @return Array of trait indices
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

    /// @notice Get the seed for a token
    /// @param tokenId The token ID
    /// @return The seed struct
    function getSeed(uint256 tokenId) external view returns (INijiSeeder.Seed memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return seeds[tokenId];
    }

    /// @notice Get trait indices for a token
    /// @param tokenId The token ID
    /// @return Array of trait indices
    function getTraitIndices(uint256 tokenId) external view returns (uint256[] memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();
        return _seedToTraitIndices(seeds[tokenId]);
    }

    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================

    /// @notice Set the descriptor contract
    /// @param _descriptor New descriptor address
    function setDescriptor(address _descriptor) external onlyOwner {
        if (_descriptor == address(0)) revert EmptyAddress();

        address oldDescriptor = address(descriptor);
        descriptor = NijiDescriptor(_descriptor);

        emit DescriptorUpdated(oldDescriptor, _descriptor);
    }

    /// @notice Set the seeder contract
    /// @param _seeder New seeder address
    function setSeeder(address _seeder) external onlyOwner {
        if (_seeder == address(0)) revert EmptyAddress();

        address oldSeeder = address(seeder);
        seeder = INijiSeeder(_seeder);

        emit SeederUpdated(oldSeeder, _seeder);
    }

    /// @notice Set the minter address
    /// @param _minter New minter address
    function setMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert EmptyAddress();

        address oldMinter = minter;
        minter = _minter;

        emit MinterUpdated(oldMinter, _minter);
    }

    /// @notice Toggle minting active state
    function toggleMinting() external onlyOwner {
        isMintingActive = !isMintingActive;
        emit MintingToggled(isMintingActive);
    }

    /// @notice Set minting active state
    /// @param _isActive Whether minting should be active
    function setMintingActive(bool _isActive) external onlyOwner {
        isMintingActive = _isActive;
        emit MintingToggled(_isActive);
    }

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================

    /// @notice Get the current token ID counter
    /// @return Current token ID
    function currentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }

    /// @notice Check if a token exists
    /// @param tokenId The token ID to check
    /// @return Whether the token exists
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /// @notice Get the remaining supply (if max supply is set)
    /// @return Remaining tokens that can be minted, or type(uint256).max if unlimited
    function remainingSupply() external view returns (uint256) {
        if (maxSupply == 0) return type(uint256).max;
        return maxSupply > _currentTokenId ? maxSupply - _currentTokenId : 0;
    }
}
