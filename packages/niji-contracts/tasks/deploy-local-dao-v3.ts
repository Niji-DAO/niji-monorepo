import { Contract as EthersContract, Interface, parseUnits } from 'ethers';
import { task, types } from 'hardhat/config';

import { default as NounsDaoDataABI } from '../abi/contracts/governance/data/NounsDAOData.sol/NounsDAOData.json';
import { default as NounsDAOExecutorV2ABI } from '../abi/contracts/governance/NounsDAOExecutorV2.sol/NounsDAOExecutorV2.json';
import { default as NounsAuctionHouseABI } from '../abi/contracts/NounsAuctionHouse.sol/NounsAuctionHouse.json';

import { ContractNamesDAOV3 } from './types';

type LocalContractName = ContractNamesDAOV3 | 'WETH' | 'Multicall2';

interface Contract {
  args?: (string | number | (() => string | undefined))[];
  instance?: EthersContract;
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
}

task('deploy-local-dao-v3', 'Deploy contracts to hardhat')
  .addOptionalParam('noundersdao', 'The nounders DAO contract address')
  .addOptionalParam('auctionTimeBuffer', 'The auction time buffer (seconds)', 30, types.int) // Default: 30 seconds
  .addOptionalParam('auctionReservePrice', 'The auction reserve price (wei)', 1, types.int) // Default: 1 wei
  .addOptionalParam(
    'auctionMinIncrementBidPercentage',
    'The auction min increment bid percentage (out of 100)', // Default: 5%
    5,
    types.int,
  )
  .addOptionalParam('auctionDuration', 'The auction duration (seconds)', 60 * 2, types.int) // Default: 2 minutes
  .addOptionalParam('timelockDelay', 'The timelock delay (seconds)', 60 * 60 * 24 * 2, types.int) // Default: 2 days
  .addOptionalParam('votingPeriod', 'The voting period (blocks)', 4 * 60 * 24 * 3, types.int) // Default: 3 days
  .addOptionalParam('votingDelay', 'The voting delay (blocks)', 100, types.int) // Default: 1 block
  .addOptionalParam(
    'proposalUpdatablePeriodInBlocks',
    'The updatable period in blocks',
    10,
    types.int,
  ) // Default: 10 blocks
  .addOptionalParam('proposalThresholdBps', 'The proposal threshold (basis points)', 500, types.int) // Default: 5%
  .addOptionalParam(
    'minQuorumVotesBPS',
    'Min basis points input for dynamic quorum',
    1_000,
    types.int,
  ) // Default: 10%
  .addOptionalParam(
    'maxQuorumVotesBPS',
    'Max basis points input for dynamic quorum',
    4_000,
    types.int,
  ) // Default: 40%
  .addOptionalParam('quorumCoefficient', 'Dynamic quorum coefficient (float)', 1, types.float)
  .addOptionalParam(
    'createCandidateCost',
    'Data contract proposal candidate creation cost in wei',
    100000000000000, // 0.0001 ether
    types.int,
  )
  .addOptionalParam(
    'updateCandidateCost',
    'Data contract proposal candidate update cost in wei',
    0,
    types.int,
  )
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    if (Number(network.chainId) !== 31337) {
      console.log(`Invalid chain id. Expected 31337. Got: ${network.chainId}.`);
      return;
    }

    const proxyRegistryAddress = '0xa5409ec958c83c3f309868babaca7c86dcb077c1';

    const NOUNS_ART_NONCE_OFFSET = 5;
    const AUCTION_HOUSE_PROXY_NONCE_OFFSET = 10;
    const GOVERNOR_N_DELEGATOR_NONCE_OFFSET = 24;

    const [deployer] = await ethers.getSigners();
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    const expectedNounsArtAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: nonce + NOUNS_ART_NONCE_OFFSET,
    });
    const expectedNounsDAOProxyAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: nonce + GOVERNOR_N_DELEGATOR_NONCE_OFFSET,
    });
    const expectedAuctionHouseProxyAddress = ethers.getCreateAddress({
      from: deployer.address,
      nonce: nonce + AUCTION_HOUSE_PROXY_NONCE_OFFSET,
    });
    const contracts: Record<LocalContractName, Contract> = {
      WETH: {},
      NFTDescriptorV2: {},
      SVGRenderer: {},
      NounsDescriptorV3: {
        args: [expectedNounsArtAddress, () => contracts.SVGRenderer.instance?.target as string],
        libraries: () => ({
          NFTDescriptorV2: contracts.NFTDescriptorV2.instance?.target as string,
        }),
      },
      Inflator: {},
      NounsArt: {
        args: [
          () => contracts.NounsDescriptorV3.instance?.target as string,
          () => contracts.Inflator.instance?.target as string,
        ],
      },
      NounsSeeder: {},
      NounsToken: {
        args: [
          args.noundersdao || deployer.address,
          expectedAuctionHouseProxyAddress,
          () => contracts.NounsDescriptorV3.instance?.target as string,
          () => contracts.NounsSeeder.instance?.target as string,
          proxyRegistryAddress,
        ],
      },
      NounsAuctionHouse: {
        waitForConfirmation: true,
      },
      NounsAuctionHouseProxyAdmin: {},
      NounsAuctionHouseProxy: {
        args: [
          () => contracts.NounsAuctionHouse.instance?.target as string,
          () => contracts.NounsAuctionHouseProxyAdmin.instance?.target as string,
          () =>
            new Interface(NounsAuctionHouseABI).encodeFunctionData('initialize', [
              contracts.NounsToken.instance?.target as string,
              contracts.WETH.instance?.target as string,
              args.auctionTimeBuffer,
              args.auctionReservePrice,
              args.auctionMinIncrementBidPercentage,
              args.auctionDuration,
            ]),
        ],
      },
      NounsDAODynamicQuorum: {},
      NounsDAOAdmin: {},
      NounsDAOProposals: {},
      NounsDAOVotes: {},
      NounsDAOFork: {},
      NounsDAOLogicV4: {
        libraries: () => ({
          NounsDAOAdmin: contracts.NounsDAOAdmin.instance?.target as string,
          NounsDAODynamicQuorum: contracts.NounsDAODynamicQuorum.instance?.target as string,
          NounsDAOProposals: contracts.NounsDAOProposals.instance?.target as string,
          NounsDAOVotes: contracts.NounsDAOVotes.instance?.target as string,
          NounsDAOFork: contracts.NounsDAOFork.instance?.target as string,
        }),
        waitForConfirmation: true,
      },
      NounsDAOForkEscrow: {
        args: [expectedNounsDAOProxyAddress, () => contracts.NounsToken.instance?.target as string],
      },
      NounsTokenFork: {},
      NounsAuctionHouseFork: {},
      NounsDAOLogicV1Fork: {},
      NounsDAOExecutorV2: {},
      NounsDAOExecutorProxy: {
        args: [
          () => contracts.NounsDAOExecutorV2.instance?.target as string,
          () =>
            new Interface(NounsDAOExecutorV2ABI).encodeFunctionData('initialize', [
              expectedNounsDAOProxyAddress,
              args.timelockDelay,
            ]),
        ],
      },
      ForkDAODeployer: {
        args: [
          () => contracts.NounsTokenFork.instance?.target as string,
          () => contracts.NounsAuctionHouseFork.instance?.target as string,
          () => contracts.NounsDAOLogicV1Fork.instance?.target as string,
          () => contracts.NounsDAOExecutorV2.instance?.target as string,
          60 * 60 * 24 * 30, // 30 days
          36000,
          36000,
          25,
          1000,
        ],
      },
      NounsDAOProxyV3: {
        args: [
          () => contracts.NounsDAOExecutorProxy.instance?.target as string, // timelock
          () => contracts.NounsToken.instance?.target as string, // token
          () => contracts.NounsDAOForkEscrow.instance?.target as string, // forkEscrow
          () => contracts.ForkDAODeployer.instance?.target as string, // forkDAODeployer
          args.noundersdao || deployer.address, // vetoer
          () => contracts.NounsDAOExecutorProxy.instance?.target as string, // admin
          () => contracts.NounsDAOLogicV4.instance?.target as string, // implementation
          {
            votingPeriod: args.votingPeriod,
            votingDelay: args.votingDelay,
            proposalThresholdBPS: args.proposalThresholdBps,
            lastMinuteWindowInBlocks: 0,
            objectionPeriodDurationInBlocks: 0,
            proposalUpdatablePeriodInBlocks: 0,
          }, // DAOParams
          {
            minQuorumVotesBPS: args.minQuorumVotesBPS,
            maxQuorumVotesBPS: args.maxQuorumVotesBPS,
            quorumCoefficient: parseUnits(args.quorumCoefficient.toString(), 6),
          }, // DynamicQuorumParams
        ],
        waitForConfirmation: true,
      },
      Multicall2: {},
      NounsDAOData: {
        args: [() => contracts.NounsToken.instance?.target as string, expectedNounsDAOProxyAddress],
        waitForConfirmation: true,
      },
      NounsDAODataProxy: {
        args: [
          () => contracts.NounsDAOData.instance?.target as string,
          () =>
            new Interface(NounsDaoDataABI).encodeFunctionData('initialize', [
              contracts.NounsDAOExecutorProxy.instance?.target as string,
              args.createCandidateCost,
              args.updateCandidateCost,
              expectedNounsDAOProxyAddress,
            ]),
        ],
      },
    };

    for (const [name, contract] of Object.entries(contracts)) {
      const factory = await ethers.getContractFactory(name, {
        libraries: contract?.libraries?.(),
      });

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
      );

      if (contract.waitForConfirmation) {
        await deployedContract.waitForDeployment();
      }

      contracts[name as LocalContractName].instance = deployedContract;

      console.log(`${name} contract deployed to ${await deployedContract.getAddress()}`);
    }

    const actualNounsArtAddress = contracts.NounsArt.instance?.target as string;
    if (expectedNounsArtAddress !== actualNounsArtAddress) {
      console.log(
        `wrong art address expected: ${expectedNounsArtAddress} actual: ${actualNounsArtAddress}`,
      );
      throw 'wrong address';
    }

    const actualAuctionHouseProxyAddress = contracts.NounsAuctionHouseProxy.instance
      ?.target as string;
    if (expectedAuctionHouseProxyAddress !== actualAuctionHouseProxyAddress) {
      console.log(
        `wrong auctio house proxy address expected: ${expectedAuctionHouseProxyAddress} actual: ${actualAuctionHouseProxyAddress}`,
      );
      throw 'wrong address';
    }

    const actualNounsDAOProxyAddress = contracts.NounsDAOProxyV3.instance?.target as string;
    if (expectedNounsDAOProxyAddress !== actualNounsDAOProxyAddress) {
      console.log(
        `wrong dao proxy address expected: ${expectedNounsDAOProxyAddress} actual: ${actualNounsDAOProxyAddress}`,
      );
      throw 'wrong address';
    }

    return contracts;
  });
