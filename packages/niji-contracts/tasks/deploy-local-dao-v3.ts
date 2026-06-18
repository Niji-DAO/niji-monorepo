import { Contract as EthersContract, Interface, parseUnits } from 'ethers';
import { task, types } from 'hardhat/config';

import { default as NijiDaoDataABI } from '../abi/contracts/governance/data/NijiDAOData.sol/NijiDAOData.json';
import { default as NijiDAOExecutorV2ABI } from '../abi/contracts/governance/NijiDAOExecutorV2.sol/NijiDAOExecutorV2.json';
import { default as NijiAuctionHouseABI } from '../abi/contracts/NijiAuctionHouse.sol/NijiAuctionHouse.json';

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
    const expectedNijiDAOProxyAddress = ethers.getCreateAddress({
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
      NijiAuctionHouse: {
        waitForConfirmation: true,
      },
      NijiAuctionHouseProxyAdmin: {},
      NijiAuctionHouseProxy: {
        args: [
          () => contracts.NijiAuctionHouse.instance?.target as string,
          () => contracts.NijiAuctionHouseProxyAdmin.instance?.target as string,
          () =>
            new Interface(NijiAuctionHouseABI).encodeFunctionData('initialize', [
              contracts.NounsToken.instance?.target as string,
              contracts.WETH.instance?.target as string,
              args.auctionTimeBuffer,
              args.auctionReservePrice,
              args.auctionMinIncrementBidPercentage,
              args.auctionDuration,
            ]),
        ],
      },
      NijiDAODynamicQuorum: {},
      NijiDAOAdmin: {},
      NijiDAOProposals: {},
      NijiDAOVotes: {},
      NijiDAOFork: {},
      NijiDAOLogicV4: {
        libraries: () => ({
          NijiDAOAdmin: contracts.NijiDAOAdmin.instance?.target as string,
          NijiDAODynamicQuorum: contracts.NijiDAODynamicQuorum.instance?.target as string,
          NijiDAOProposals: contracts.NijiDAOProposals.instance?.target as string,
          NijiDAOVotes: contracts.NijiDAOVotes.instance?.target as string,
          NijiDAOFork: contracts.NijiDAOFork.instance?.target as string,
        }),
        waitForConfirmation: true,
      },
      NijiDAOForkEscrow: {
        args: [expectedNijiDAOProxyAddress, () => contracts.NounsToken.instance?.target as string],
      },
      NounsTokenFork: {},
      NijiAuctionHouseFork: {},
      NijiDAOLogicV1Fork: {},
      NijiDAOExecutorV2: {},
      NijiDAOExecutorProxy: {
        args: [
          () => contracts.NijiDAOExecutorV2.instance?.target as string,
          () =>
            new Interface(NijiDAOExecutorV2ABI).encodeFunctionData('initialize', [
              expectedNijiDAOProxyAddress,
              args.timelockDelay,
            ]),
        ],
      },
      ForkDAODeployer: {
        args: [
          () => contracts.NounsTokenFork.instance?.target as string,
          () => contracts.NijiAuctionHouseFork.instance?.target as string,
          () => contracts.NijiDAOLogicV1Fork.instance?.target as string,
          () => contracts.NijiDAOExecutorV2.instance?.target as string,
          60 * 60 * 24 * 30, // 30 days
          36000,
          36000,
          25,
          1000,
        ],
      },
      NijiDAOProxyV3: {
        args: [
          () => contracts.NijiDAOExecutorProxy.instance?.target as string, // timelock
          () => contracts.NounsToken.instance?.target as string, // token
          () => contracts.NijiDAOForkEscrow.instance?.target as string, // forkEscrow
          () => contracts.ForkDAODeployer.instance?.target as string, // forkDAODeployer
          args.noundersdao || deployer.address, // vetoer
          () => contracts.NijiDAOExecutorProxy.instance?.target as string, // admin
          () => contracts.NijiDAOLogicV4.instance?.target as string, // implementation
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
      NijiDAOData: {
        args: [() => contracts.NounsToken.instance?.target as string, expectedNijiDAOProxyAddress],
        waitForConfirmation: true,
      },
      NijiDAODataProxy: {
        args: [
          () => contracts.NijiDAOData.instance?.target as string,
          () =>
            new Interface(NijiDaoDataABI).encodeFunctionData('initialize', [
              contracts.NijiDAOExecutorProxy.instance?.target as string,
              args.createCandidateCost,
              args.updateCandidateCost,
              expectedNijiDAOProxyAddress,
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

    const actualAuctionHouseProxyAddress = contracts.NijiAuctionHouseProxy.instance
      ?.target as string;
    if (expectedAuctionHouseProxyAddress !== actualAuctionHouseProxyAddress) {
      console.log(
        `wrong auctio house proxy address expected: ${expectedAuctionHouseProxyAddress} actual: ${actualAuctionHouseProxyAddress}`,
      );
      throw 'wrong address';
    }

    const actualNijiDAOProxyAddress = contracts.NijiDAOProxyV3.instance?.target as string;
    if (expectedNijiDAOProxyAddress !== actualNijiDAOProxyAddress) {
      console.log(
        `wrong dao proxy address expected: ${expectedNijiDAOProxyAddress} actual: ${actualNijiDAOProxyAddress}`,
      );
      throw 'wrong address';
    }

    return contracts;
  });
