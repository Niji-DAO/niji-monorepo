import { nijiGovernorAddress, nijiAuctionHouseAddress, nijiTreasuryAddress } from '@/contracts';
import { defaultChain } from '@/wagmi';

export const resolveNijiContractAddress = (address: string) => {
  const chainId = defaultChain.id;
  switch (address.toLowerCase()) {
    case nijiGovernorAddress[chainId].toLowerCase():
      return 'Niji DAO Proxy';
    case nijiAuctionHouseAddress[chainId].toLowerCase():
      return 'Niji Auction House Proxy';
    case nijiTreasuryAddress[chainId].toLowerCase():
      return 'Niji DAO Treasury';
    default:
      return undefined;
  }
};
