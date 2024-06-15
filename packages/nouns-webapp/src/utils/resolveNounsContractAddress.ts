import config from '../config';

export const resolveNounContractAddress = (address: string) => {
  switch (address.toLowerCase()) {
    case config.addresses.nounsDAOProxy.toLowerCase():
      return 'Niji DAO Proxy';
    case config.addresses.nounsAuctionHouseProxy.toLowerCase():
      return 'Niji Auction House Proxy';
    case config.addresses.nounsDaoExecutor.toLowerCase():
      return 'Niji DAO Treasury';
    default:
      return undefined;
  }
};
