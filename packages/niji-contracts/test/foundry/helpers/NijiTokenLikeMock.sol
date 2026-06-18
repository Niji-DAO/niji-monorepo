// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { NijiTokenLike } from '../../../contracts/governance/NijiDAOInterfaces.sol';
import { INijiSeeder } from '../../../contracts/interfaces/INijiSeeder.sol';

contract NijiTokenLikeMock is NijiTokenLike {
    address public noundersDAO;
    address public descriptor;
    address public seeder;
    mapping(address => mapping(uint256 => uint96)) priorVotes;
    mapping(uint256 => INijiSeeder.Seed) public seeds;
    mapping(address => address) internal _delegates;

    function setSeed(uint256 nounId, INijiSeeder.Seed memory seed) external {
        seeds[nounId] = seed;
    }

    function totalSupply() external pure returns (uint256) {
        return 0;
    }

    function tokenByIndex(uint256) external pure returns (uint256) {
        return 0;
    }

    function tokenOfOwnerByIndex(address, uint256) external pure returns (uint256) {
        return 0;
    }

    function setPriorVotes(
        address account,
        uint256 blockNumber,
        uint96 votes
    ) external {
        priorVotes[account][blockNumber] = votes;
    }

    function balanceOf(address) external pure returns (uint256 balance) {
        return 0;
    }

    function ownerOf(uint256) external pure returns (address owner) {
        return address(0);
    }

    function name() external pure returns (string memory) {
        return 'Niji';
    }

    function symbol() external pure returns (string memory) {
        return 'NIJI';
    }

    function tokenURI(uint256) external pure returns (string memory) {
        return '';
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        // noop
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        // noop
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external {
        from;
        to;
        tokenId;
        data;
    }

    function approve(address to, uint256 tokenId) external {
        to;
        tokenId;
    }

    function getApproved(uint256 tokenId) external pure returns (address) {
        tokenId;
        return address(0);
    }

    function isApprovedForAll(address owner, address operator) external pure returns (bool) {
        owner;
        operator;
        return false;
    }

    function setNoundersDAO(address _noundersDAO) external {
        noundersDAO = _noundersDAO;
    }

    function mint() public pure returns (uint256) {
        return 0;
    }

    function mint(address to) external pure returns (uint256) {
        to;
        return 0;
    }

    function minter() external pure returns (address) {
        return address(0);
    }

    function burn(uint256 tokenId) external {
        tokenId;
    }

    function owner() external pure returns (address) {
        return address(0);
    }

    function currentTokenId() external pure returns (uint256) {
        return 0;
    }

    function setApprovalForAll(address operator, bool approved) external {}

    function getVotes(address account) external pure returns (uint256) {
        account;
        return 0;
    }

    function getPastVotes(address account, uint256 timepoint) external pure returns (uint256) {
        account;
        timepoint;
        return 0;
    }

    function getPastTotalSupply(uint256 timepoint) external pure returns (uint256) {
        timepoint;
        return 0;
    }

    function delegates(address account) external view returns (address) {
        return _delegates[account];
    }

    function delegate(address delegatee) external {
        _delegates[msg.sender] = delegatee;
    }

    function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) external {
        delegatee;
        nonce;
        expiry;
        v;
        r;
        s;
    }

    function getCurrentVotes(address account) external view returns (uint96) {
        return priorVotes[account][block.number];
    }

    function getPriorVotes(address account, uint256 blockNumber) external view returns (uint96) {
        return priorVotes[account][blockNumber];
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        interfaceId;
        return false;
    }
}
