/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';
import 'solidity-coverage';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import './tasks';

// niji-contracts の env 経路 = 環境ごとに .env.local (anvil) / .env.dev (base sepolia) / .env.prod (mainnet) を
// 分離、 package.json script で cp .env.{env} .env → hardhat 実行の順で load される。 dotenv は現 dir の .env
// を default 探す (path 指定なしで process.cwd() + '/.env')、 hardhat 起動時 cwd = niji-contracts。
dotenv.config();
dotenv.config({ path: '../niji-assets/.env' });

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.23',
    settings: {
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
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: process.env.MNEMONIC
        ? { mnemonic: process.env.MNEMONIC }
        : [process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
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
    baseSepolia: {
      url: process.env.RPC_URL || 'https://sepolia.base.org',
      accounts: [process.env.DEPLOYER_PK || process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
      chainId: 84532,
    },
    // kebab-case alias (`--network base-sepolia`)、 package.json script との整合
    'base-sepolia': {
      url: process.env.RPC_URL || 'https://sepolia.base.org',
      accounts: [process.env.DEPLOYER_PK || process.env.WALLET_PRIVATE_KEY!].filter(Boolean),
      chainId: 84532,
    } as any,
    hardhat: {
      initialBaseFeePerGas: 0,
      hardfork: 'cancun', // Pin to Cancun — Hardhat 2.28+ defaults to Fusaka which caps tx gas at 16M (EIP-7825)
      blockGasLimit: 300_000_000, // 300M — elevated for gas benchmarking (NijiGas.test.ts)
    },
    localhost: {
      url: 'http://127.0.0.1:8547',
      chainId: 31337,
      // anvil の default account 0 の private key (chain 31337 / anvil 標準鍵)
      accounts: [
        process.env.WALLET_PRIVATE_KEY ||
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      ],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      sepolia: process.env.ETHERSCAN_API_KEY!,
      baseSepolia: process.env.EXPLORER_API_KEY || process.env.BASESCAN_API_KEY!,
      'base-sepolia': process.env.EXPLORER_API_KEY || process.env.BASESCAN_API_KEY!,
    } as any,
    customChains: [
      {
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
    ],
  },
  abiExporter: {
    path: './abi',
    clear: true,
    runOnCompile: true,
  },
  typechain: {
    outDir: './typechain',
    target: 'ethers-v6',
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
