import { BaseContract } from 'ethers';

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  Sepolia = 11155111,
}

export type ContractNamesDAOV3 =
  | 'NFTDescriptorV2'
  | 'NounsDescriptorV3'
  | 'SVGRenderer'
  | 'NounsArt'
  | 'Inflator'
  | 'NounsSeeder'
  | 'NounsToken'
  | 'NijiAuctionHouse'
  | 'NijiAuctionHouseProxyAdmin'
  | 'NijiAuctionHouseProxy'
  | 'NijiDAOLogicV4'
  | 'NijiDAOProxyV3'
  | 'NijiDAOAdmin'
  | 'NijiDAODynamicQuorum'
  | 'NijiDAOProposals'
  | 'NijiDAOVotes'
  | 'NijiDAOFork'
  | 'NijiDAOForkEscrow'
  | 'ForkDAODeployer'
  | 'NounsTokenFork'
  | 'NijiAuctionHouseFork'
  | 'NijiDAOLogicV1Fork'
  | 'NijiDAOExecutorV2'
  | 'NijiDAOExecutorProxy'
  | 'NijiDAOData'
  | 'NijiDAODataProxy';

export interface ContractDeployment {
  args?: (string | number | (() => string))[];
  libraries?: () => Record<string, string>;
  waitForConfirmation?: boolean;
  validateDeployment?: () => void;
}

export interface DeployedContract {
  name: string;
  address: string;
  instance: BaseContract;
  constructorArguments: (string | number)[];
  libraries: Record<string, string>;
}

export interface ContractRow {
  Address: string;
  'Deployment Hash'?: string;
}
