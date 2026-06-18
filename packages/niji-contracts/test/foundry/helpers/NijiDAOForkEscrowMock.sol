// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { INijiDAOForkEscrow, NijiTokenLike } from '../../../contracts/governance/NijiDAOInterfaces.sol';

contract NijiDAOForkEscrowMock is INijiDAOForkEscrow {
    uint32 public forkId;
    address public dao;
    NijiTokenLike public nijiToken;

    /// @dev forkId => tokenId => owner
    mapping(uint32 => mapping(uint256 => address)) public escrowedTokensByForkId;

    constructor(
        uint32 forkId_,
        address dao_,
        NijiTokenLike nijiToken_
    ) {
        forkId = forkId_;
        dao = dao_;
        nijiToken = nijiToken_;
    }

    function markOwner(address owner, uint256[] calldata tokenIds) external {}

    function returnTokensToOwner(address owner, uint256[] calldata tokenIds) external {}

    function closeEscrow() external pure returns (uint32) {
        return 1;
    }

    function numTokensInEscrow() external pure returns (uint256) {
        return 0;
    }

    function numTokensOwnedByDAO() external pure returns (uint256) {
        return 0;
    }

    function withdrawTokens(uint256[] calldata tokenIds, address to) external {}

    function ownerOfEscrowedToken(uint32 forkId_, uint256 tokenId) external view returns (address) {
        return escrowedTokensByForkId[forkId_][tokenId];
    }

    function setOwnerOfTokens(address owner, uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; ++i) {
            escrowedTokensByForkId[forkId][tokenIds[i]] = owner;
        }
    }
}
