/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';
import 'solidity-coverage';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import './tasks';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    z_kyoto: {
      url: 'https://rpc.startale.com/zkyoto',
      accounts: process.env.MNEMONIC
        ? { mnemonic: process.env.MNEMONIC }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: process.env.MNEMONIC
        ? { mnemonic: process.env.MNEMONIC }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    hardhat: {
      initialBaseFeePerGas: 0,
    },
  },
  etherscan: {
    apiKey: {
      z_kyoto: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'z_kyoto',
        chainId: 6038361,
        urls: {
          apiURL: 'https://zkyoto.explorer.startale.com/api',
          browserURL: 'https://zkyoto.explorer.startale.com/',
        },
      },
    ],
  },
  abiExporter: {
    path: './abi',
    clear: true,
  },
  typechain: {
    outDir: './typechain',
  },
  gasReporter: {
    enabled: !process.env.CI,
    currency: 'USD',
    gasPrice: 50,
    src: 'contracts',
    coinmarketcap: '7643dfc7-a58f-46af-8314-2db32bdd18ba',
  },
  mocha: {
    timeout: 60_000,
  },
};
export default config;
