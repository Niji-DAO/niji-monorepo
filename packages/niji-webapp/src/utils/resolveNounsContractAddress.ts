import { nijiGovernorAddress, nijiAuctionHouseAddress, nijiTreasuryAddress } from '@/contracts';
import { defaultChain } from '@/wagmi';

export const resolveNounContractAddress = (address: string) => {
  const chainId = defaultChain.id;
  switch (address.toLowerCase()) {
    case nijiGovernorAddress[chainId].toLowerCase():
      return 'Nouns DAO Proxy';
    case nijiAuctionHouseAddress[chainId].toLowerCase():
      return 'Nouns Auction House Proxy';
    case nijiTreasuryAddress[chainId].toLowerCase():
      return 'Nouns DAO Treasury';
    default:
      return undefined;
  }
};
