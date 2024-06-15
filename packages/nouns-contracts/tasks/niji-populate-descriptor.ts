import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data-v32.json';
import { dataToDescriptorInput } from './utils';

task('niji-populate-descriptor', 'Populates the descriptor with color palettes and Niji parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptorV2` contract address',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptorV2` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { ethers, network }) => {
    const options = { gasLimit: network.name === 'hardhat' ? 30000000 : undefined };

    const descriptorFactory = await ethers.getContractFactory('NounsDescriptorV2', {
      libraries: {
        NFTDescriptorV2: nftDescriptor,
      },
    });
    const descriptorContract = descriptorFactory.attach(nounsDescriptor);

    const { bgcolors, palette, images } = ImageData;
    const {
      backgroundDecorations,
      specials,
      leftHands,
      backs,
      ears,
      chokers,
      clothes,
      hairs,
      headphones,
      hats,
      backDecorations,
    } = images;

    const backgroundDecorationsPage = dataToDescriptorInput(
      backgroundDecorations.map(({ data }) => data),
    );
    const specialsPage = dataToDescriptorInput(specials.map(({ data }) => data));
    const leftHandsPage = dataToDescriptorInput(leftHands.map(({ data }) => data));
    const backsPage = dataToDescriptorInput(backs.map(({ data }) => data));
    const earsPage = dataToDescriptorInput(ears.map(({ data }) => data));
    const chokersPage = dataToDescriptorInput(chokers.map(({ data }) => data));
    const clothesPage = dataToDescriptorInput(clothes.map(({ data }) => data));
    const hairsPage = dataToDescriptorInput(hairs.map(({ data }) => data));
    const headphonesPage = dataToDescriptorInput(headphones.map(({ data }) => data));
    const hatsPage = dataToDescriptorInput(hats.map(({ data }) => data));
    const backDecorationsPage = dataToDescriptorInput(backDecorations.map(({ data }) => data));

    await descriptorContract.addManyBackgrounds(bgcolors);
    await descriptorContract.setPalette(0, `0x000000${palette.join('')}`);

    await descriptorContract.addBackgroundDecorations(
      backgroundDecorationsPage.encodedCompressed,
      backgroundDecorationsPage.originalLength,
      backgroundDecorationsPage.itemCount,
      options,
    );

    await descriptorContract.addSpecials(
      specialsPage.encodedCompressed,
      specialsPage.originalLength,
      specialsPage.itemCount,
      options,
    );

    await descriptorContract.addLeftHands(
      leftHandsPage.encodedCompressed,
      leftHandsPage.originalLength,
      leftHandsPage.itemCount,
      options,
    );

    await descriptorContract.addBacks(
      backsPage.encodedCompressed,
      backsPage.originalLength,
      backsPage.itemCount,
      options,
    );

    await descriptorContract.addEars(
      earsPage.encodedCompressed,
      earsPage.originalLength,
      earsPage.itemCount,
      options,
    );

    await descriptorContract.addChokers(
      chokersPage.encodedCompressed,
      chokersPage.originalLength,
      chokersPage.itemCount,
      options,
    );

    await descriptorContract.addClothes(
      clothesPage.encodedCompressed,
      clothesPage.originalLength,
      clothesPage.itemCount,
      options,
    );

    await descriptorContract.addHairs(
      hairsPage.encodedCompressed,
      hairsPage.originalLength,
      hairsPage.itemCount,
      options,
    );

    await descriptorContract.addHeadphones(
      headphonesPage.encodedCompressed,
      headphonesPage.originalLength,
      headphonesPage.itemCount,
      options,
    );

    await descriptorContract.addHats(
      hatsPage.encodedCompressed,
      hatsPage.originalLength,
      hatsPage.itemCount,
      options,
    );

    await descriptorContract.addBackDecorations(
      backDecorationsPage.encodedCompressed,
      backDecorationsPage.originalLength,
      backDecorationsPage.itemCount,
      options,
    );

    console.log('Descriptor populated with palettes and parts.');
  });
