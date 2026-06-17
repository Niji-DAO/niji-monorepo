import { task } from 'hardhat/config';

import { ContractNamesDAOV3, DeployedContract } from './types';
import { printContractsTable } from './utils';

async function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

task('deploy-descriptor-v3', 'Deploy NounsDescriptorV3 & populate it with art')
  .addParam(
    'daoExecutor',
    'The address of the NounsDAOExecutor that should be the owner of the descriptor.',
  )
  .setAction(async ({ daoExecutor }, { ethers, run, network }) => {
    const contracts: Record<ContractNamesDAOV3, DeployedContract> = {} as Record<
      ContractNamesDAOV3,
      DeployedContract
    >;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from address ${deployer.address}`);

    const nonce = await deployer.getNonce();
    const expectedNounsArtAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: nonce + 4,
    });

    console.log('Deploying contracts...');
    const library = await (await ethers.getContractFactory('NFTDescriptorV2', deployer)).deploy();
    await library.waitForDeployment();
    const libraryAddress = await library.getAddress();
    contracts.NFTDescriptorV2 = {
      name: 'NFTDescriptorV2',
      address: libraryAddress,
      instance: library,
      constructorArguments: [],
      libraries: {},
    };

    const renderer = await (await ethers.getContractFactory('SVGRenderer', deployer)).deploy();
    await renderer.waitForDeployment();
    const rendererAddress = await renderer.getAddress();
    contracts.SVGRenderer = {
      name: 'SVGRenderer',
      address: rendererAddress,
      instance: renderer,
      constructorArguments: [],
      libraries: {},
    };

    const nounsDescriptorFactory = await ethers.getContractFactory('NounsDescriptorV3', {
      libraries: {
        NFTDescriptorV2: libraryAddress,
      },
    });
    const nounsDescriptor = await nounsDescriptorFactory.deploy(
      expectedNounsArtAddress,
      rendererAddress,
    );
    await nounsDescriptor.waitForDeployment();
    const nounsDescriptorAddress = await nounsDescriptor.getAddress();
    contracts.NounsDescriptorV3 = {
      name: 'NounsDescriptorV3',
      address: nounsDescriptorAddress,
      constructorArguments: [expectedNounsArtAddress, rendererAddress],
      instance: nounsDescriptor,
      libraries: {
        NFTDescriptorV2: libraryAddress,
      },
    };

    const inflator = await (await ethers.getContractFactory('Inflator', deployer)).deploy();
    await inflator.waitForDeployment();
    const inflatorAddress = await inflator.getAddress();
    contracts.Inflator = {
      name: 'Inflator',
      address: inflatorAddress,
      instance: inflator,
      constructorArguments: [],
      libraries: {},
    };

    const art = await (
      await ethers.getContractFactory('NounsArt', deployer)
    ).deploy(nounsDescriptorAddress, inflatorAddress);
    await art.waitForDeployment();
    const artAddress = await art.getAddress();
    contracts.NounsArt = {
      name: 'NounsArt',
      address: artAddress,
      constructorArguments: [nounsDescriptorAddress, inflatorAddress],
      instance: art,
      libraries: {},
    };

    console.log('Deployment complete:');
    printContractsTable(contracts);

    console.log('Populating Descriptor...');
    await run('populate-descriptor', {
      nftDescriptor: libraryAddress,
      nounsDescriptor: nounsDescriptorAddress,
    });
    console.log('Population complete.');

    console.log('Transferring ownership to DAO Executor...');
    await nounsDescriptor.transferOwnership(daoExecutor);
    console.log('Transfer complete.');

    if (network.name !== 'localhost') {
      console.log('Waiting 1 minute before verifying contracts on Etherscan');
      await delay(60);

      console.log('Verifying contracts on Etherscan...');
      await run('verify-etherscan', {
        contracts,
      });
      console.log('Verify complete.');
    }
  });
