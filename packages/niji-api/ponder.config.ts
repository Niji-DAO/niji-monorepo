import {
  nounsAuctionHouseAbi,
  nounsAuctionHouseAddress,
} from '@niji/sdk/auction-house';
import { nijiTokenAbi, nijiTokenAddress } from '@niji/sdk/token';
import { nounsGovernorAbi, nounsGovernorAddress } from '@niji/sdk/governor';
import {
  nijiStreamFactoryAbi,
  nijiStreamFactoryAddress,
} from '@niji/sdk/stream-factory';
import { nijiStreamAbi } from '@niji/sdk/stream';
import { createConfig, factory } from 'ponder';
import { getAbiItem } from 'viem';
import dotenv from 'dotenv';

dotenv.config();

const mainnetConfig = createConfig({
  chains: {
    mainnet: { id: 1, rpc: process.env.PONDER_RPC_URL_1, ws: process.env.PONDER_WS_URL_1 },
  },
  contracts: {
    NounsAuctionHouseV2: {
      chain: 'mainnet',
      address: nounsAuctionHouseAddress[1],
      abi: nounsAuctionHouseAbi,
      startBlock: 12985451,
    },
    NounsToken: {
      chain: 'mainnet',
      address: nijiTokenAddress[1],
      abi: nijiTokenAbi,
      startBlock: 12985438,
    },
    NounsDAOV4: {
      chain: 'mainnet',
      address: nounsGovernorAddress[1],
      abi: nounsGovernorAbi,
      startBlock: 12985453,
    },
    StreamFactory: {
      chain: 'mainnet',
      address: nijiStreamFactoryAddress[1],
      abi: nijiStreamFactoryAbi,
      startBlock: 16576500,
    },

    Stream: {
      chain: 'mainnet',
      address: factory({
        address: nijiStreamFactoryAddress[1],
        event: getAbiItem({ abi: nijiStreamFactoryAbi, name: 'StreamCreated' }),
        parameter: getAbiItem({ abi: nijiStreamFactoryAbi, name: 'StreamCreated' }).inputs[7].name,
      }),
      abi: nijiStreamAbi,
      startBlock: 16576500,
    },
  },
});

const sepoliaConfig = createConfig({
  chains: {
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_RPC_URL_11155111,
      ws: process.env.PONDER_WS_URL_11155111,
    },
  },
  contracts: {
    NounsAuctionHouseV2: {
      chain: 'sepolia',
      address: nounsAuctionHouseAddress[11155111],
      abi: nounsAuctionHouseAbi,
      startBlock: 3594847,
    },
    NounsToken: {
      chain: 'sepolia',
      address: nijiTokenAddress[11155111],
      abi: nijiTokenAbi,
      startBlock: 3594846,
    },
    NounsDAOV4: {
      chain: 'sepolia',
      address: nounsGovernorAddress[11155111],
      abi: nounsGovernorAbi,
      startBlock: 3594849,
    },
    StreamFactory: {
      chain: 'sepolia',
      address: nijiStreamFactoryAddress[11155111],
      abi: nijiStreamFactoryAbi,
      startBlock: 2564095,
    },

    Stream: {
      chain: 'sepolia',
      address: factory({
        address: nijiStreamFactoryAddress[11155111],
        event: getAbiItem({ abi: nijiStreamFactoryAbi, name: 'StreamCreated' }),
        parameter: getAbiItem({ abi: nijiStreamFactoryAbi, name: 'StreamCreated' }).inputs[7].name,
      }),
      abi: nijiStreamAbi,
      startBlock: 2564095,
    },
  },
});

export default process.env.PONDER_CHAIN === 'sepolia' ? sepoliaConfig : mainnetConfig;
