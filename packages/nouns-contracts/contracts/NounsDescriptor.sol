// SPDX-License-Identifier: GPL-3.0

/// @title The Niji NFT descriptor

/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

pragma solidity ^0.8.6;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { Strings } from '@openzeppelin/contracts/utils/Strings.sol';
import { INounsDescriptor } from './interfaces/INounsDescriptor.sol';
import { INounsSeeder } from './interfaces/INounsSeeder.sol';
import { NFTDescriptor } from './libs/NFTDescriptor.sol';
import { MultiPartRLEToSVG } from './libs/MultiPartRLEToSVG.sol';

contract NounsDescriptor is INounsDescriptor, Ownable {
    using Strings for uint256;

    // prettier-ignore
    // https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt
    bytes32 constant COPYRIGHT_CC0_1_0_UNIVERSAL_LICENSE = 0xa2010f343487d3f7618affe54f789f5487602331c0a8d03f49e9a7c547cf0499;

    // Whether or not new Niji parts can be added
    bool public override arePartsLocked;

    // Whether or not `tokenURI` should be returned as a data URI (Default: true)
    bool public override isDataURIEnabled = true;

    // Base URI
    string public override baseURI;

    // Niji Color Palettes (Index => Hex Colors)
    mapping(uint8 => string[]) public override palettes;

    // Niji Backgrounds (Hex Colors)
    string[] public override backgrounds;

    // Niji Background Decorations (Custom RLE)
    bytes[] public override backgroundDecorations;

    // Niji Specials (Custom RLE)
    bytes[] public override specials;

    // Niji Left Hand (Custom RLE)
    bytes[] public override leftHands;

    // Niji back (Custom RLE)
    bytes[] public override backs;

    // Niji ear (Custom RLE)
    bytes[] public override ears;

    // Niji choker (Custom RLE)
    bytes[] public override chokers;

    // Niji clothe (Custom RLE)
    bytes[] public override clothes;

    // Niji hair (Custom RLE)
    bytes[] public override hairs;

    // Niji headphone (Custom RLE)
    bytes[] public override headphones;

    // Niji  (Custom RLE)
    bytes[] public override hats;

    // Niji back decoration (Custom RLE)
    bytes[] public override backDecorations;

    /**
     * @notice Require that the parts have not been locked.
     */
    modifier whenPartsNotLocked() {
        require(!arePartsLocked, 'Parts are locked');
        _;
    }

    /**
     * @notice Get the number of available Niji `backgrounds`.
     */
    function backgroundCount() external view override returns (uint256) {
        return backgrounds.length;
    }

    /**
     * @notice Get the number of available Niji `backgroundDecorations`.
     */
    function backgroundDecorationCount() external view override returns (uint256) {
        return backgroundDecorations.length;
    }

    /**
     * @notice Get the number of available Niji `specials`.
     */
    function specialCount() external view override returns (uint256) {
        return specials.length;
    }

    /**
     * @notice Get the number of available Niji `leftHand`.
     */
    function leftHandCount() external view override returns (uint256) {
        return leftHands.length;
    }

    /**
     * @notice Get the number of available Niji `backs`.
     */
    function backCount() external view override returns (uint256) {
        return backs.length;
    }

    /**
     * @notice Get the number of available Niji `ears`.
     */
    function earCount() external view override returns (uint256) {
        return ears.length;
    }

    /**
     * @notice Get the number of available Niji `chokers`.
     */
    function chokerCount() external view override returns (uint256) {
        return chokers.length;
    }

    /**
     * @notice Get the number of available Niji `clothes`.
     */
    function clotheCount() external view override returns (uint256) {
        return clothes.length;
    }

    /**
     * @notice Get the number of available Niji `hairs`.
     */
    function hairCount() external view override returns (uint256) {
        return hairs.length;
    }

    /**
     * @notice Get the number of available Niji `headphones`.
     */
    function headphoneCount() external view override returns (uint256) {
        return headphones.length;
    }

    /**
     * @notice Get the number of available Niji `hats`.
     */
    function hatCount() external view override returns (uint256) {
        return hats.length;
    }

    /**
     * @notice Get the number of available Niji `backDecorations`.
     */
    function backDecorationCount() external view override returns (uint256) {
        return backDecorations.length;
    }

    /**
     * @notice Add colors to a color palette.
     * @dev This function can only be called by the owner.
     */
    function addManyColorsToPalette(uint8 paletteIndex, string[] calldata newColors) external override onlyOwner {
        require(palettes[paletteIndex].length + newColors.length <= 256, 'Palettes can only hold 256 colors');
        for (uint256 i = 0; i < newColors.length; i++) {
            _addColorToPalette(paletteIndex, newColors[i]);
        }
    }

    /**
     * @notice Batch add Niji backgrounds.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyBackgrounds(string[] calldata _backgrounds) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _backgrounds.length; i++) {
            _addBackground(_backgrounds[i]);
        }
    }

    /**
     * @notice Batch add Niji background decorations.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyBackgroundDecorations(bytes[] calldata _backgroundDecorations)
        external
        override
        onlyOwner
        whenPartsNotLocked
    {
        for (uint256 i = 0; i < _backgroundDecorations.length; i++) {
            _addBackgroundDecoration(_backgroundDecorations[i]);
        }
    }

    /**
     * @notice Batch add Niji specials.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManySpecials(bytes[] calldata _specials) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _specials.length; i++) {
            _addSpecial(_specials[i]);
        }
    }

    /**
     * @notice Batch add Niji left hands.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyLeftHands(bytes[] calldata _leftHands) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _leftHands.length; i++) {
            _addLeftHand(_leftHands[i]);
        }
    }

    /**
     * @notice Batch add Niji backs.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyBacks(bytes[] calldata _backs) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _backs.length; i++) {
            _addBack(_backs[i]);
        }
    }

    /**
     * @notice Batch add Niji ears.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyEars(bytes[] calldata _ears) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _ears.length; i++) {
            _addEar(_ears[i]);
        }
    }

    /**
     * @notice Batch add Niji chokers.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyChokers(bytes[] calldata _chokers) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _chokers.length; i++) {
            _addChoker(_chokers[i]);
        }
    }

    /**
     * @notice Batch add Niji clothes.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyClothes(bytes[] calldata _clothes) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _clothes.length; i++) {
            _addClothes(_clothes[i]);
        }
    }

    /**
     * @notice Batch add Niji hairs.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyHairs(bytes[] calldata _hairs) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _hairs.length; i++) {
            _addHair(_hairs[i]);
        }
    }

    /**
     * @notice Batch add Niji headphones.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyHeadphones(bytes[] calldata _headphones) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _headphones.length; i++) {
            _addHeadphone(_headphones[i]);
        }
    }

    /**
     * @notice Batch add Niji hats.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyHats(bytes[] calldata _hats) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _hats.length; i++) {
            _addHat(_hats[i]);
        }
    }

    /**
     * @notice Batch add Niji back decorations.
     * @dev This function can only be called by the owner when not locked.
     */
    function addManyBackDecorations(bytes[] calldata _backDecorations) external override onlyOwner whenPartsNotLocked {
        for (uint256 i = 0; i < _backDecorations.length; i++) {
            _addBackDecoration(_backDecorations[i]);
        }
    }

    /**
     * @notice Add a single color to a color palette.
     * @dev This function can only be called by the owner.
     */
    function addColorToPalette(uint8 _paletteIndex, string calldata _color) external override onlyOwner {
        require(palettes[_paletteIndex].length <= 255, 'Palettes can only hold 256 colors');
        _addColorToPalette(_paletteIndex, _color);
    }

    /**
     * @notice Add a Niji background.
     * @dev This function can only be called by the owner when not locked.
     */
    function addBackground(string calldata _background) external override onlyOwner whenPartsNotLocked {
        _addBackground(_background);
    }

    /**
     * @notice Add a Niji background decoration.
     * @dev This function can only be called by the owner when not locked.
     */
    function addBackgroundDecoration(bytes calldata _backgroundDecoration)
        external
        override
        onlyOwner
        whenPartsNotLocked
    {
        _addBackgroundDecoration(_backgroundDecoration);
    }

    /**
     * @notice Add a Niji special.
     * @dev This function can only be called by the owner when not locked.
     */
    function addSpecial(bytes calldata _special) external override onlyOwner whenPartsNotLocked {
        _addSpecial(_special);
    }

    /**
     * @notice Add a Niji left hand.
     * @dev This function can only be called by the owner when not locked.
     */
    function addLeftHand(bytes calldata _leftHand) external override onlyOwner whenPartsNotLocked {
        _addLeftHand(_leftHand);
    }

    /**
     * @notice Add a Niji back.
     * @dev This function can only be called by the owner when not locked.
     */
    function addBack(bytes calldata _back) external override onlyOwner whenPartsNotLocked {
        _addBack(_back);
    }

    /**
     * @notice Add a Niji ear.
     * @dev This function can only be called by the owner when not locked.
     */
    function addEar(bytes calldata _ear) external override onlyOwner whenPartsNotLocked {
        _addEar(_ear);
    }

    /**
     * @notice Add a Niji choker.
     * @dev This function can only be called by the owner when not locked.
     */
    function addChoker(bytes calldata _choker) external override onlyOwner whenPartsNotLocked {
        _addChoker(_choker);
    }

    /**
     * @notice Add a Niji clothes.
     * @dev This function can only be called by the owner when not locked.
     */
    function addClothes(bytes calldata _clothes) external override onlyOwner whenPartsNotLocked {
        _addClothes(_clothes);
    }

    /**
     * @notice Add a Niji hair.
     * @dev This function can only be called by the owner when not locked.
     */
    function addHair(bytes calldata _hair) external override onlyOwner whenPartsNotLocked {
        _addHair(_hair);
    }

    /**
     * @notice Add a Niji headphones.
     * @dev This function can only be called by the owner when not locked.
     */
    function addHeadphone(bytes calldata _headphones) external override onlyOwner whenPartsNotLocked {
        _addHeadphone(_headphones);
    }

    /**
     * @notice Add a Niji hat.
     * @dev This function can only be called by the owner when not locked.
     */
    function addHat(bytes calldata _hat) external override onlyOwner whenPartsNotLocked {
        _addHat(_hat);
    }

    /**
     * @notice Add a Niji back decoration.
     * @dev This function can only be called by the owner when not locked.
     */
    function addBackDecoration(bytes calldata _backDecoration) external override onlyOwner whenPartsNotLocked {
        _addBackDecoration(_backDecoration);
    }

    /**
     * @notice Lock all Niji parts.
     * @dev This cannot be reversed and can only be called by the owner when not locked.
     */
    function lockParts() external override onlyOwner whenPartsNotLocked {
        arePartsLocked = true;

        emit PartsLocked();
    }

    /**
     * @notice Toggle a boolean value which determines if `tokenURI` returns a data URI
     * or an HTTP URL.
     * @dev This can only be called by the owner.
     */
    function toggleDataURIEnabled() external override onlyOwner {
        bool enabled = !isDataURIEnabled;

        isDataURIEnabled = enabled;
        emit DataURIToggled(enabled);
    }

    /**
     * @notice Set the base URI for all token IDs. It is automatically
     * added as a prefix to the value returned in {tokenURI}, or to the
     * token ID if {tokenURI} is empty.
     * @dev This can only be called by the owner.
     */
    function setBaseURI(string calldata _baseURI) external override onlyOwner {
        baseURI = _baseURI;

        emit BaseURIUpdated(_baseURI);
    }

    /**
     * @notice Given a token ID and seed, construct a token URI for an official Niji DAO noun.
     * @dev The returned value may be a base64 encoded data URI or an API URL.
     */
    function tokenURI(uint256 tokenId, INounsSeeder.Seed memory seed) external view override returns (string memory) {
        if (isDataURIEnabled) {
            return dataURI(tokenId, seed);
        }
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }

    /**
     * @notice Given a token ID and seed, construct a base64 encoded data URI for an official Niji DAO noun.
     */
    function dataURI(uint256 tokenId, INounsSeeder.Seed memory seed) public view override returns (string memory) {
        string memory nounId = tokenId.toString();
        string memory name = string(abi.encodePacked('Niji ', nounId));
        string memory description = string(abi.encodePacked('Niji ', nounId, ' is a member of the Niji DAO'));

        return genericDataURI(name, description, seed);
    }

    /**
     * @notice Given a name, description, and seed, construct a base64 encoded data URI.
     */
    function genericDataURI(
        string memory name,
        string memory description,
        INounsSeeder.Seed memory seed
    ) public view override returns (string memory) {
        NFTDescriptor.TokenURIParams memory params = NFTDescriptor.TokenURIParams({
            name: name,
            description: description,
            parts: _getPartsForSeed(seed),
            background: backgrounds[seed.background]
        });
        return NFTDescriptor.constructTokenURI(params, palettes);
    }

    /**
     * @notice Given a seed, construct a base64 encoded SVG image.
     */
    function generateSVGImage(INounsSeeder.Seed memory seed) external view override returns (string memory) {
        MultiPartRLEToSVG.SVGParams memory params = MultiPartRLEToSVG.SVGParams({
            parts: _getPartsForSeed(seed),
            background: backgrounds[seed.background]
        });
        return NFTDescriptor.generateSVGImage(params, palettes);
    }

    /**
     * @notice Add a single color to a color palette.
     */
    function _addColorToPalette(uint8 _paletteIndex, string calldata _color) internal {
        palettes[_paletteIndex].push(_color);
    }

    /**
     * @notice Add a Niji background.
     */
    function _addBackground(string calldata _background) internal {
        backgrounds.push(_background);
    }

    /**
     * @notice Add a Niji background decoration.
     */
    function _addBackgroundDecoration(bytes calldata _backgroundDecoration) internal {
        backgroundDecorations.push(_backgroundDecoration);
    }

    /**
     * @notice Add a Niji special.
     */
    function _addSpecial(bytes calldata _special) internal {
        specials.push(_special);
    }

    /**
     * @notice Add a Niji left hand.
     */
    function _addLeftHand(bytes calldata _leftHand) internal {
        leftHands.push(_leftHand);
    }

    /**
     * @notice Add a Niji back.
     */
    function _addBack(bytes calldata _back) internal {
        backs.push(_back);
    }

    /**
     * @notice Add a Niji ear.
     */
    function _addEar(bytes calldata _ear) internal {
        ears.push(_ear);
    }

    /**
     * @notice Add a Niji choker.
     */
    function _addChoker(bytes calldata _choker) internal {
        chokers.push(_choker);
    }

    /**
     * @notice Add a Niji clothes.
     */
    function _addClothes(bytes calldata _clothes) internal {
        clothes.push(_clothes);
    }

    /**
     * @notice Add a Niji hair.
     */
    function _addHair(bytes calldata _hair) internal {
        hairs.push(_hair);
    }

    /**
     * @notice Add a Niji headphones.
     */
    function _addHeadphone(bytes calldata _headphones) internal {
        headphones.push(_headphones);
    }

    /**
     * @notice Add a Niji hat.
     */
    function _addHat(bytes calldata _hat) internal {
        hats.push(_hat);
    }

    /**
     * @notice Add a Niji back decoration.
     */
    function _addBackDecoration(bytes calldata _backDecoration) internal {
        backDecorations.push(_backDecoration);
    }

    /**
     * @notice Get all Niji parts for the passed `seed`.
     */
    function _getPartsForSeed(INounsSeeder.Seed memory seed) internal view returns (bytes[] memory) {
        bytes[] memory _parts = new bytes[](4);
        _parts[0] = backgroundDecorations[seed.backgroundDecoration];
        _parts[1] = specials[seed.special];
        _parts[2] = leftHands[seed.leftHand];
        _parts[3] = backs[seed.back];
        _parts[4] = ears[seed.ear];
        _parts[5] = chokers[seed.choker];
        _parts[6] = clothes[seed.clothe];
        _parts[7] = hairs[seed.hair];
        _parts[8] = headphones[seed.headphone];
        _parts[9] = hats[seed.hat];
        _parts[10] = backDecorations[seed.backDecoration];
        return _parts;
    }
}
