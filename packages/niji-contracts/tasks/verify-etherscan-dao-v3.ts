import { task, types } from 'hardhat/config';

import { ContractNamesDAOV3, DeployedContract } from './types';

// prettier-ignore
// These contracts require a fully qualified name to be passed because
// they share bytecode with the underlying contract.
const nameToFullyQualifiedName: Record<string, string> = {
  NijiAuctionHouseProxy: 'contracts/proxies/NijiAuctionHouseProxy.sol:NijiAuctionHouseProxy',
  NijiAuctionHouseProxyAdmin: 'contracts/proxies/NijiAuctionHouseProxyAdmin.sol:NijiAuctionHouseProxyAdmin',
  NijiDAOLogicV3Harness: 'contracts/test/NijiDAOLogicV3Harness.sol:NijiDAOLogicV3Harness',
  NijiDAOExecutorV2Test: 'contracts/test/NijiDAOExecutorHarness.sol:NijiDAOExecutorV2Test',
};

task('verify-etherscan-dao-v3', 'Verify the Solidity contracts on Etherscan')
  .addParam('contracts', 'Contract objects from the deployment', undefined, types.json)
  .setAction(
    async ({ contracts }: { contracts: Record<ContractNamesDAOV3, DeployedContract> }, hre) => {
      for (const [, contract] of Object.entries(contracts)) {
        console.log(`verifying ${contract.name}...`);
        try {
          const provider = contract.instance?.runner?.provider;
          const code = provider ? await provider.getCode(contract.address) : '0x';
          if (code === '0x') {
            console.log(
              `${contract.name} contract deployment has not completed. waiting to verify...`,
            );
            await contract.instance?.waitForDeployment();
          }
          await hre.run('verify:verify', {
            ...contract,
            contract: nameToFullyQualifiedName[contract.name],
          });
        } catch ({ message }) {
          if ((message as string).includes('Reason: Already Verified')) {
            continue;
          }
          console.error(message);
        }
      }
    },
  );
