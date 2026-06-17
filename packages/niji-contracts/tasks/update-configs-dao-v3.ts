import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { task, types } from 'hardhat/config';

import { ContractNamesDAOV3, DeployedContract } from './types';

task('update-configs-dao-v3', 'Write the deployed addresses to the SDK and subgraph configs')
  .addParam('contracts', 'Contract objects from the deployment', undefined, types.json)
  .setAction(
    async (
      { contracts }: { contracts: Record<ContractNamesDAOV3, DeployedContract> },
      { ethers },
    ) => {
      const { name: network, chainId } = await ethers.provider.getNetwork();

      // Update SDK addresses
      const sdkPath = join(__dirname, '../../niji-sdk');
      const addressesPath = join(sdkPath, 'src/contract/addresses.json');
      const addresses = JSON.parse(readFileSync(addressesPath, 'utf8'));
      addresses[chainId] = {
        nounsToken: contracts.NounsToken.address,
        nounsSeeder: contracts.NounsSeeder.address,
        nounsDescriptor: contracts.NounsDescriptorV3.address,
        nftDescriptor: contracts.NFTDescriptorV2.address,
        nounsAuctionHouse: contracts.NounsAuctionHouse.address,
        nounsAuctionHouseProxy: contracts.NounsAuctionHouseProxy.address,
        nounsAuctionHouseProxyAdmin: contracts.NounsAuctionHouseProxyAdmin.address,
        nounsDaoExecutor: contracts.NounsDAOExecutorProxy.address,
        nounsDAOProxy: contracts.NounsDAOProxyV3.address,
        nounsDAOLogicV1: contracts.NounsDAOLogicV4.address,
        nounsDAOData: contracts.NounsDAODataProxy.address,
      };
      writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
      try {
        execSync('pnpm build', {
          cwd: sdkPath,
        });
      } catch {
        console.log('Failed to re-build `@niji/sdk`. Please rebuild manually.');
      }
      console.log('Addresses written to the Nouns SDK.');

      // Generate subgraph config
      const configName = `${network}-fork`;
      const subgraphConfigPath = join(__dirname, `../../niji-subgraph/config/${configName}.json`);

      const getDeployBlockNumber = async (contract: DeployedContract) => {
        const deployTx = contract.instance.deploymentTransaction();
        if (deployTx) {
          const receipt = await deployTx.wait();
          return receipt?.blockNumber;
        }
        return undefined;
      };

      const subgraphConfig = {
        network,
        nounsToken: {
          address: contracts.NounsToken.address,
          startBlock: await getDeployBlockNumber(contracts.NounsToken),
        },
        nounsAuctionHouse: {
          address: contracts.NounsAuctionHouseProxy.address,
          startBlock: await getDeployBlockNumber(contracts.NounsAuctionHouseProxy),
        },
        nounsDAO: {
          address: contracts.NounsDAOProxyV3.address,
          startBlock: await getDeployBlockNumber(contracts.NounsDAOProxyV3),
        },
        nounsDAOData: {
          address: contracts.NounsDAODataProxy.address,
          startBlock: await getDeployBlockNumber(contracts.NounsDAODataProxy),
        },
      };
      writeFileSync(subgraphConfigPath, JSON.stringify(subgraphConfig, null, 2));
      console.log('Subgraph config has been generated.');
    },
  );
