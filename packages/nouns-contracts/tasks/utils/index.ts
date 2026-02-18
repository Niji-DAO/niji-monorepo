import { deflateRawSync } from 'zlib';

import { AbiCoder } from 'ethers';
import promptjs from 'prompt';

import { ContractNamesDAOV3, ContractRow, DeployedContract } from '../types';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

export function dataToDescriptorInput(data: string[]): {
  encodedCompressed: string;
  originalLength: number;
  itemCount: number;
} {
  const abiEncoded = AbiCoder.defaultAbiCoder().encode(['bytes[]'], [data]);
  const encodedCompressed = `0x${deflateRawSync(
    Buffer.from(abiEncoded.substring(2), 'hex'),
  ).toString('hex')}`;

  const originalLength = abiEncoded.substring(2).length / 2;
  const itemCount = data.length;

  return {
    encodedCompressed,
    originalLength,
    itemCount,
  };
}

export function printContractsTable(contracts: Record<ContractNamesDAOV3, DeployedContract>) {
  console.table(
    Object.values<DeployedContract>(contracts).reduce(
      (acc: Record<string, ContractRow>, contract: DeployedContract) => {
        acc[contract.name] = {
          Address: contract.address,
        };
        const deployTx = contract.instance?.deploymentTransaction?.();
        if (deployTx) {
          acc[contract.name]['Deployment Hash'] = deployTx.hash;
        }
        return acc;
      },
      {},
    ),
  );
}
