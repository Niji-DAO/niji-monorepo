// SPDX-License-Identifier: GPL-3.0

/// @title NijiToken - ERC721 token for Niji generative art
/// @author Niji DAO
/// @notice ERC721 implementation for minting and managing Niji NFTs
/// @dev Integrates with NijiDescriptor for on-chain SVG generation and NijiSeeder for trait randomization

pragma solidity ^0.8.20;

import { ERC721 } from '@openzeppelin/contracts-v5/token/ERC721/ERC721.sol';
import { ERC721Enumerable } from '@openzeppelin/contracts-v5/token/ERC721/extensions/ERC721Enumerable.sol';
import { ERC721Votes } from '@openzeppelin/contracts-v5/token/ERC721/extensions/ERC721Votes.sol';
import { IVotes } from '@openzeppelin/contracts-v5/governance/utils/IVotes.sol';
import { EIP712 } from '@openzeppelin/contracts-v5/utils/cryptography/EIP712.sol';
import { Ownable2Step, Ownable } from '@openzeppelin/contracts-v5/access/Ownable2Step.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts-v5/utils/ReentrancyGuard.sol';
import { Pausable } from '@openzeppelin/contracts-v5/utils/Pausable.sol';
import { IERC4906 } from '@openzeppelin/contracts-v5/interfaces/IERC4906.sol';
import { IERC165 } from '@openzeppelin/contracts-v5/utils/introspection/IERC165.sol';
import { Strings } from '@openzeppelin/contracts-v5/utils/Strings.sol';
import { NijiDescriptor } from './NijiDescriptor.sol';
import { INijiSeeder } from './interfaces/INijiSeeder.sol';

contract NijiToken is ERC721Enumerable, ERC721Votes, Ownable2Step, ReentrancyGuard, Pausable, IERC4906 {
    // =============================================================
    //                           ERRORS
    // =============================================================

    /// @notice Thrown when minting is not active
    error MintingNotActive();

    /// @notice Thrown when max supply is reached
    error MaxSupplyReached();

    /// @notice Thrown when caller is not the minter
    error OnlyMinter();

    /// @notice Thrown when caller is not the Nijider DAO
    error OnlyNijidersDAO();

    /// @notice Thrown when descriptor is not set
    error DescriptorNotSet();

    /// @notice Thrown when seeder is not set
    error SeederNotSet();

    /// @notice Thrown when address is empty
    error EmptyAddress();

    /// @notice Thrown when token does not exist
    error TokenDoesNotExist();

    /// @notice Thrown when provenance hash is already locked
    error ProvenanceHashLocked();

    /// @notice Thrown when withdraw amount exceeds contract balance
    error WithdrawAmountExceedsBalance();

    /// @notice Thrown when ETH transfer fails during withdraw
    /// @param reason The raw revert data returned by the owner-side call (helps diagnose smart-wallet rejections)
    error WithdrawFailed(bytes reason);

    /// @notice Thrown when renounceOwnership is called (disabled to prevent contract becoming unowned)
    error RenounceOwnershipDisabled();

    /// @notice Thrown when setDescriptor / setSeeder is called after the contract pointers have been locked
    error ContractsAreLocked();

    /// @notice Thrown when reveal is called after it was already executed
    error RevealAlreadyDone();

    /// @notice Thrown when placeholder URI is set to an empty string
    error EmptyPlaceholderURI();

    /// @notice Thrown when mint is attempted before the placeholder URI is set (pre-reveal mint safety)
    error PlaceholderURINotSet();

    /// @notice Thrown when mintBatch quantity exceeds the per-call upper bound (gas safety)
    error MintBatchQuantityExceedsLimit(uint256 requested, uint256 limit);

    /// @notice Thrown when baseURI is modified after being locked
    error BaseURIIsLocked();

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

    /// @notice Emitted when the Nijider DAO address is updated
    /// @param oldNijidersDAO The previous Nijider DAO address
    /// @param newNijidersDAO The new Nijider DAO address
    event NijidersDAOUpdated(address indexed oldNijidersDAO, address indexed newNijidersDAO);

    /// @notice Emitted when the Nijider founder reward window is updated
    /// @param newLastId The last token id eligible for the founder reward
    event NijiderRewardLastIdUpdated(uint256 newLastId);

    /// @notice Emitted when a Nijider founder reward token is minted
    /// @param tokenId The token id granted to the Nijider DAO
    /// @param nijidersDAO The recipient Nijider DAO address
    event NijiderRewardMinted(uint256 indexed tokenId, address indexed nijidersDAO);

    /// @notice Emitted when minting is toggled
    /// @param isActive Whether minting is now active
    event MintingToggled(bool isActive);

    /// @notice Emitted when the contract URI hash is updated
    /// @param newContractURIHash The new IPFS hash for contract metadata
    event ContractURIHashUpdated(string newContractURIHash);

    /// @notice Emitted when the provenance hash is set
    /// @param provenanceHash The provenance hash value
    event ProvenanceHashSet(string provenanceHash);

    /// @notice Emitted when the owner withdraws ETH from the contract
    /// @param to The recipient of the withdrawn ETH
    /// @param amount The amount of ETH withdrawn (wei)
    event Withdrawn(address indexed to, uint256 amount);

    /// @notice Emitted when the placeholder URI is updated (only available pre-reveal)
    /// @param newPlaceholderURI The new placeholder URI used while not revealed
    event PlaceholderURIUpdated(string newPlaceholderURI);

    /// @notice Emitted when the collection is revealed (state is permanent after this)
    event Revealed();

    /// @notice Emitted when the external baseURI fallback is updated
    /// @param newBaseURI The new baseURI string. Empty string disables the fallback (on-chain descriptor is used instead).
    event BaseURIUpdated(string newBaseURI);

    /// @notice Emitted when the baseURI is locked permanently
    event BaseURILocked();

    /// @notice Emitted when the contract pointers (descriptor + seeder) are locked permanently
    event ContractsLocked();

    // =============================================================
    //                           STORAGE
    // =============================================================

    /// @notice Maximum number of tokens allowed in a single mintBatch call (gas-safety cap)
    /// @dev Hard-coded constant since per-batch gas usage scales roughly linearly with the count;
    ///      50 keeps the call well below typical block gas limits even with on-chain seed generation.
    uint256 public constant MAX_MINT_BATCH_SIZE = 50;

    /// @notice The Niji descriptor contract for generating tokenURI
    NijiDescriptor public descriptor;

    /// @notice The Niji seeder contract for generating random traits
    INijiSeeder public seeder;

    /// @notice The minter address (can mint new tokens)
    address public minter;

    /// @notice The Nijider DAO address that receives the founder reward
    /// @dev Mirrors NounsToken.noundersDAO. Every `NIJIDER_REWARD_INTERVAL`-th token (id % interval == 0)
    ///      is minted to this address before the auction token, up to `nijiderRewardLastId`.
    ///      Zero address disables the founder reward entirely (all tokens go to the auction).
    address public nijidersDAO;

    /// @notice Last token ID eligible for the Nijider founder reward (inclusive)
    /// @dev Nouns caps the founder reward at id 1820 (5 years of daily auctions). Configurable here so
    ///      testnet deployments can shorten the window without changing the contract.
    uint256 public nijiderRewardLastId;

    /// @notice Interval of the Nijider founder reward (every N-th token id)
    uint256 public constant NIJIDER_REWARD_INTERVAL = 10;

    /// @notice Current token ID counter
    uint256 private _currentTokenId;

    /// @notice Maximum supply (0 = unlimited)
    uint256 public maxSupply;

    /// @notice Whether minting is active
    bool public isMintingActive;

    /// @notice Mapping from token ID to seed
    mapping(uint256 => INijiSeeder.Seed) public seeds;

    /// @notice The IPFS hash for the contract-level metadata
    string private _contractURIHash;

    /// @notice The provenance hash for verifying image integrity
    string public provenanceHash;

    /// @notice Whether the provenance hash is locked
    bool public isProvenanceHashLocked;

    /// @notice Whether the collection has been revealed (one-way switch)
    /// @dev Pre-reveal: tokenURI returns the placeholder URI for every token.
    ///      Post-reveal: tokenURI delegates to the on-chain descriptor as usual.
    bool public isRevealed;

    /// @notice Placeholder URI returned for every tokenURI while not revealed
    /// @dev Should point to a single metadata JSON (per ERC721 marketplaces convention).
    string private _placeholderURI;

    /// @notice External baseURI fallback for token metadata
    /// @dev Empty string disables the fallback (on-chain descriptor is used). Non-empty value takes precedence over the descriptor post-reveal.
    ///      Concatenation rule: `{baseURI}{tokenId}.json` (no extra slash inserted — include the trailing slash in baseURI if needed).
    string private _baseTokenURI;

    /// @notice Whether the baseURI is locked permanently (no further updates allowed)
    bool public isBaseURILocked;

    /// @notice Whether the contract pointers (descriptor + seeder) are locked permanently
    /// @dev Once true, setDescriptor / setSeeder revert with ContractsAreLocked. Used together with
    ///      NijiDescriptor.freezeMetadata / NijiArt.lockArt to make collection metadata fully immutable.
    bool public isContractsLocked;

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
    ) ERC721(_name, _symbol) EIP712(_name, '1') Ownable(msg.sender) {
        if (bytes(_name).length == 0) revert EmptyAddress();
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

    /// @notice Mint a new Niji to msg.sender (legacy governance compat for auction house)
    /// @dev Auction house contracts (NijiAuctionHouse / NijiAuctionHouseV3 / NijiAuctionHouseFork) call `nouns.mint()` and expect to receive the token (then auction off via transferFrom).
    ///      Mirrors NounsToken.mint: every `NIJIDER_REWARD_INTERVAL`-th token id (0, 10, 20, ...) up to
    ///      `nijiderRewardLastId` is minted to the Nijider DAO first, then the next id is minted for the
    ///      auction. The founder reward is skipped entirely while `nijidersDAO` is the zero address.
    /// @return tokenId The minted token ID handed to the auction house
    function mint() external onlyMinter nonReentrant returns (uint256) {
        if (!isMintingActive) revert MintingNotActive();

        // Nijider founder reward — the reward token consumes one id, so the auction needs two ids here.
        if (
            nijidersDAO != address(0) &&
            _currentTokenId <= nijiderRewardLastId &&
            _currentTokenId % NIJIDER_REWARD_INTERVAL == 0
        ) {
            if (maxSupply > 0 && _currentTokenId + 1 >= maxSupply) revert MaxSupplyReached();

            uint256 rewardTokenId = _mintTo(nijidersDAO);
            emit NijiderRewardMinted(rewardTokenId, nijidersDAO);
        } else if (maxSupply > 0 && _currentTokenId >= maxSupply) {
            revert MaxSupplyReached();
        }

        return _mintTo(msg.sender);
    }

    /// @notice Burn a Niji (legacy NounsDAO governance compat for auction house unbid settlement)
    /// @dev Auction house contracts (NijiAuctionHouse / NijiAuctionHouseV3 / NijiAuctionHouseFork) call `nouns.burn(tokenId)` when an auction ends with no bids.
    ///      onlyMinter modifier ensures only the auction house can burn, matching NounsToken behavior.
    /// @param tokenId The token ID to burn
    function burn(uint256 tokenId) external onlyMinter nonReentrant {
        _burn(tokenId);
    }

    /// @notice Mint multiple Nijis to an address
    /// @param to The recipient address
    /// @param quantity Number of tokens to mint
    /// @return tokenIds Array of minted token IDs
    function mintBatch(address to, uint256 quantity) external onlyMinter nonReentrant returns (uint256[] memory) {
        if (!isMintingActive) revert MintingNotActive();
        if (quantity > MAX_MINT_BATCH_SIZE) {
            revert MintBatchQuantityExceedsLimit(quantity, MAX_MINT_BATCH_SIZE);
        }
        if (maxSupply > 0 && _currentTokenId + quantity > maxSupply) revert MaxSupplyReached();

        uint256[] memory tokenIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; ) {
            tokenIds[i] = _mintTo(to);
            unchecked { ++i; }
        }

        return tokenIds;
    }

    /// @notice Internal mint function
    /// @dev Uses _mint (not _safeMint) to remain compatible with auction house contracts that do not implement IERC721Receiver — matching NounsToken behavior.
    ///      Reverts if the collection is still unrevealed and the placeholder URI is unset (otherwise tokenURI would return an empty string and break marketplaces).
    /// @param to The recipient address
    /// @return tokenId The minted token ID
    function _mintTo(address to) internal returns (uint256) {
        if (!isRevealed && bytes(_placeholderURI).length == 0) revert PlaceholderURINotSet();

        uint256 tokenId = _currentTokenId;

        // Generate seed for this token
        INijiSeeder.Seed memory seed = seeder.generateSeed(tokenId, address(descriptor));
        seeds[tokenId] = seed;

        _mint(to, tokenId);

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
    /// @dev Resolution order: (1) pre-reveal → placeholder URI. (2) post-reveal + baseURI set → `{baseURI}{tokenId}.json`. (3) post-reveal + no baseURI → on-chain descriptor.
    ///      baseURI is intended as an emergency fallback if on-chain rendering is unavailable; flip back to on-chain by setting baseURI to empty.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist();

        if (!isRevealed) {
            return _placeholderURI;
        }

        if (bytes(_baseTokenURI).length > 0) {
            return string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId), '.json'));
        }

        INijiSeeder.Seed memory seed = seeds[tokenId];
        uint256[] memory traitIndices = _seedToTraitIndices(seed);

        return descriptor.tokenURI(tokenId, traitIndices);
    }

    /// @notice Convert seed to trait indices array
    /// @param seed The seed struct
    /// @return Array of trait indices
    /// @dev NijiSeeder._pickTrait は trait image 数が 0 の時 type(uint256).max を返すが、
    ///      Seed struct は uint48 cast で受けるため値が type(uint48).max (=0xffffffffffff) に潰れる。
    ///      Descriptor 側の SKIP_LAYER は type(uint256).max のため、 ここで cast 戻しを行う。
    function _seedToTraitIndices(INijiSeeder.Seed memory seed) internal pure returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](12);

        indices[0] = _expandTraitIndex(seed.special);
        indices[1] = _expandTraitIndex(seed.choker);
        indices[2] = _expandTraitIndex(seed.headphone);
        indices[3] = _expandTraitIndex(seed.leftHand);
        indices[4] = _expandTraitIndex(seed.hat);
        indices[5] = _expandTraitIndex(seed.clothing);
        indices[6] = _expandTraitIndex(seed.ear);
        indices[7] = _expandTraitIndex(seed.back);
        indices[8] = _expandTraitIndex(seed.backDecoration);
        indices[9] = _expandTraitIndex(seed.background);
        indices[10] = _expandTraitIndex(seed.solidBackground);
        indices[11] = _expandTraitIndex(seed.hair);

        return indices;
    }

    /// @dev Expand a uint48 trait index back to uint256, mapping type(uint48).max to SKIP_LAYER (type(uint256).max).
    function _expandTraitIndex(uint48 v) private pure returns (uint256) {
        if (v == type(uint48).max) return type(uint256).max;
        return uint256(v);
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
    /// @dev Reverts if the contract pointers have been locked via lockContracts().
    function setDescriptor(address _descriptor) external onlyOwner {
        if (isContractsLocked) revert ContractsAreLocked();
        if (_descriptor == address(0)) revert EmptyAddress();

        address oldDescriptor = address(descriptor);
        descriptor = NijiDescriptor(_descriptor);

        emit DescriptorUpdated(oldDescriptor, _descriptor);
    }

    /// @notice Set the seeder contract
    /// @param _seeder New seeder address
    /// @dev Reverts if the contract pointers have been locked via lockContracts().
    function setSeeder(address _seeder) external onlyOwner {
        if (isContractsLocked) revert ContractsAreLocked();
        if (_seeder == address(0)) revert EmptyAddress();

        address oldSeeder = address(seeder);
        seeder = INijiSeeder(_seeder);

        emit SeederUpdated(oldSeeder, _seeder);
    }

    /// @notice Lock the descriptor + seeder pointers permanently (owner only, one-way switch).
    /// @dev Freezes only the contract pointers `descriptor` and `seeder`; after this call, `setDescriptor` /
    ///      `setSeeder` always revert with `ContractsAreLocked`. Other mutable surfaces on this token
    ///      (`setPlaceholderURI` pre-reveal, `reveal`, `setBaseURI` until `lockBaseURI` is called) remain in
    ///      effect. To make collection metadata fully immutable end-to-end, owner must combine:
    ///      (a) `NijiArt.lockArt` (PR #251), (b) `NijiDescriptor.freezeMetadata` (PR #252),
    ///      (c) `reveal` + (`lockBaseURI` after `setBaseURI('')` to keep on-chain rendering), and (d) this
    ///      function. The ordering of (a)-(d) is independent.
    function lockContracts() external onlyOwner {
        if (isContractsLocked) revert ContractsAreLocked();
        isContractsLocked = true;
        emit ContractsLocked();
    }

    /// @notice Set the minter address
    /// @param _minter New minter address
    function setMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert EmptyAddress();

        address oldMinter = minter;
        minter = _minter;

        emit MinterUpdated(oldMinter, _minter);
    }

    /// @notice Set the Nijider DAO address that receives the founder reward
    /// @dev Callable by the owner while unset (bootstrap), and by the Nijider DAO itself afterwards —
    ///      mirrors NounsToken.setNoundersDAO where the founders control their own payout address.
    ///      Setting the zero address disables the founder reward (all tokens go to the auction).
    /// @param _nijidersDAO The new Nijider DAO address
    function setNijidersDAO(address _nijidersDAO) external {
        if (nijidersDAO == address(0)) {
            if (msg.sender != owner()) revert OnlyNijidersDAO();
        } else if (msg.sender != nijidersDAO) {
            revert OnlyNijidersDAO();
        }

        address oldNijidersDAO = nijidersDAO;
        nijidersDAO = _nijidersDAO;

        emit NijidersDAOUpdated(oldNijidersDAO, _nijidersDAO);
    }

    /// @notice Set the last token id eligible for the Nijider founder reward
    /// @dev Nouns hard-codes 1820 (5 years of daily auctions). Configurable here so the window can be
    ///      shortened on testnets without redeploying. Owner-only because it caps founder economics.
    /// @param _lastId The last eligible token id (inclusive)
    function setNijiderRewardLastId(uint256 _lastId) external onlyOwner {
        nijiderRewardLastId = _lastId;

        emit NijiderRewardLastIdUpdated(_lastId);
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

    /// @notice Set the contract-level metadata IPFS hash
    /// @param newContractURIHash The new IPFS hash
    function setContractURIHash(string memory newContractURIHash) external onlyOwner {
        _contractURIHash = newContractURIHash;
        emit ContractURIHashUpdated(newContractURIHash);
    }

    /// @notice Set the provenance hash (can only be set before locking)
    /// @param _provenanceHash The provenance hash value
    function setProvenanceHash(string memory _provenanceHash) external onlyOwner {
        if (isProvenanceHashLocked) revert ProvenanceHashLocked();
        provenanceHash = _provenanceHash;
        emit ProvenanceHashSet(_provenanceHash);
    }

    /// @notice Lock the provenance hash permanently
    function lockProvenanceHash() external onlyOwner {
        if (isProvenanceHashLocked) revert ProvenanceHashLocked();
        isProvenanceHashLocked = true;
    }

    // =============================================================
    //                      REVEAL
    // =============================================================

    /// @notice Set the placeholder URI used for unrevealed tokens (owner only, only allowed pre-reveal)
    /// @param newPlaceholderURI URI string returned for every tokenURI while not revealed
    /// @dev Emits ERC-4906 BatchMetadataUpdate so marketplaces refresh stale placeholder metadata.
    function setPlaceholderURI(string calldata newPlaceholderURI) external onlyOwner {
        if (isRevealed) revert RevealAlreadyDone();
        if (bytes(newPlaceholderURI).length == 0) revert EmptyPlaceholderURI();
        _placeholderURI = newPlaceholderURI;
        emit PlaceholderURIUpdated(newPlaceholderURI);
        emit BatchMetadataUpdate(0, type(uint256).max);
    }

    /// @notice Reveal the collection (owner only, one-way switch)
    /// @dev After this call, tokenURI delegates to the on-chain descriptor for every token. Cannot be undone.
    ///      Emits ERC-4906 BatchMetadataUpdate so marketplaces refresh from placeholder to on-chain metadata.
    function reveal() external onlyOwner {
        if (isRevealed) revert RevealAlreadyDone();
        isRevealed = true;
        emit Revealed();
        emit BatchMetadataUpdate(0, type(uint256).max);
    }

    /// @notice Returns the current placeholder URI (empty string if never set)
    function placeholderURI() external view returns (string memory) {
        return _placeholderURI;
    }

    // =============================================================
    //                      BASE URI FALLBACK
    // =============================================================

    /// @notice Set the external baseURI fallback (owner only)
    /// @param newBaseURI The new baseURI. Pass empty string to disable the fallback and return to the on-chain descriptor.
    /// @dev Emits ERC-4906 BatchMetadataUpdate so marketplaces refresh stale metadata.
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        if (isBaseURILocked) revert BaseURIIsLocked();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
        emit BatchMetadataUpdate(0, type(uint256).max);
    }

    /// @notice Lock the baseURI permanently (no further updates allowed)
    /// @dev Used to commit to a specific fallback (or to lock the on-chain descriptor in place by locking with empty baseURI).
    function lockBaseURI() external onlyOwner {
        if (isBaseURILocked) revert BaseURIIsLocked();
        isBaseURILocked = true;
        emit BaseURILocked();
    }

    /// @notice Returns the current baseURI (empty string when fallback is disabled)
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // =============================================================
    //                      PAUSABLE
    // =============================================================

    /// @notice Pause mint / transfer / burn (owner only)
    /// @dev Inherits Pausable.paused() / Paused / Unpaused events. Emergency switch for security incidents.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause mint / transfer / burn (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================
    //                      WITHDRAW
    // =============================================================

    /// @notice Withdraw all ETH held by the contract to the owner
    /// @dev Drains the full contract balance. Reverts if the contract holds zero ETH or the transfer fails (revert data preserved for smart-wallet diagnostics).
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert WithdrawAmountExceedsBalance();

        address ownerAddr = owner();
        (bool success, bytes memory data) = payable(ownerAddr).call{ value: balance }('');
        if (!success) revert WithdrawFailed(data);

        emit Withdrawn(ownerAddr, balance);
    }

    /// @notice Withdraw a specific amount of ETH to the owner
    /// @param amount Amount of wei to withdraw (must be <= contract balance)
    function withdrawAmount(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0 || amount > address(this).balance) revert WithdrawAmountExceedsBalance();

        address ownerAddr = owner();
        (bool success, bytes memory data) = payable(ownerAddr).call{ value: amount }('');
        if (!success) revert WithdrawFailed(data);

        emit Withdrawn(ownerAddr, amount);
    }

    /// @notice Accept ETH so auction proceeds / royalties / direct sends can accumulate for later withdraw
    receive() external payable {}

    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================

    /// @notice The IPFS URI of contract-level metadata (used by marketplaces)
    /// @return The contract URI
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked('ipfs://', _contractURIHash));
    }


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

    // =============================================================
    //                      ERC721Votes INTEGRATION
    // =============================================================

    /// @dev Multi-inheritance override: ERC721Enumerable + ERC721Votes both override `_update`.
    /// Calling super.* chains both extensions: enumeration bookkeeping + voting unit transfer.
    ///      `whenNotPaused` blocks mint / transfer / burn when paused (Pausable extension).
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Enumerable, ERC721Votes) whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }

    /// @dev Multi-inheritance override for `_increaseBalance` (required by ERC721Enumerable + ERC721Votes).
    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721Enumerable, ERC721Votes)
    {
        super._increaseBalance(account, amount);
    }

    /// @notice Disabled to prevent the contract from becoming permanently unowned.
    /// @dev Always reverts. Use `transferOwnership` (Ownable2Step two-step transfer) for ownership change instead.
    function renounceOwnership() public view override onlyOwner {
        revert RenounceOwnershipDisabled();
    }

    /// @dev Multi-inheritance override for `supportsInterface` (ERC721Enumerable + ERC721).
    ///      Also advertises `IVotes` (Governor / aggregators) and `IERC4906` (marketplace metadata refresh).
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IVotes).interfaceId ||
            interfaceId == bytes4(0x49064906) || // ERC-4906 (MetadataUpdate / BatchMetadataUpdate)
            super.supportsInterface(interfaceId);
    }

    // =============================================================
    //                 GOVERNANCE SIGNATURE ADAPTERS
    // =============================================================

    /// @notice Legacy governance signature for historical vote balance lookup.
    /// @dev Wraps `ERC721Votes.getPastVotes(address,uint256)` to return uint96 (the storage type used by NijiDAOVotes / NijiDAOProposals).
    ///      Reverts if balance exceeds uint96 (defense-in-depth — actual ERC721Votes votes are bounded by total supply which is far below 2^96).
    /// @param account The voter address
    /// @param blockNumber The historical block to query
    /// @return The voting power at `blockNumber` as uint96
    function getPriorVotes(address account, uint256 blockNumber) external view returns (uint96) {
        uint256 votes = getPastVotes(account, blockNumber);
        require(votes <= type(uint96).max, 'NijiToken: votes overflow uint96');
        return uint96(votes);
    }

    /// @notice Legacy governance signature for current vote balance.
    /// @dev Wraps `ERC721Votes.getVotes(address)` to return uint96 for governance signature compatibility.
    /// @param account The voter address
    /// @return The current voting power as uint96
    function getCurrentVotes(address account) external view returns (uint96) {
        uint256 votes = getVotes(account);
        require(votes <= type(uint96).max, 'NijiToken: votes overflow uint96');
        return uint96(votes);
    }
}
