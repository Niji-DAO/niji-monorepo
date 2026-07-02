export * from './auction-house.gen';
export * from './data.gen';
export * from './descriptor.gen';
export * from './governor.gen';
export * from './legacy-treasury.gen';
export * from './seeder.gen';
export * from './stream-factory.gen';
export * from './token.gen';
export * from './treasury/index';
export * from './treasury-assets/eth-usd-price-oracle.gen';
export * from './treasury-assets/meth-staking.gen';
export * from './treasury-assets/meth.gen';
export * from './treasury-assets/reth.gen';
export * from './treasury-assets/steth.gen';
export * from './treasury-assets/usdc.gen';
export * from './treasury-assets/weth.gen';
export * from './treasury-assets/wsteth.gen';
export * from './usdc-payer.gen';
export * from './usdc-token-buyer.gen';

// NijiAuctionHouse は local abi 経路で nijiAuctionHouseAbi / nijiAuctionHouseAddress を
// 直接 export するため、 Nouns 旧名からの alias 経路 (GH #3003 以前の nounsAuctionHouse
// as nijiAuctionHouse) は不要になった。

export {
  nounsGovernorAbi as nijiGovernorAbi,
  nounsGovernorAddress as nijiGovernorAddress,
  nounsGovernorConfig as nijiGovernorConfig,
} from './governor.gen';

export {
  nounsLegacyTreasuryAbi as nijiLegacyTreasuryAbi,
  nounsLegacyTreasuryAddress as nijiLegacyTreasuryAddress,
  nounsLegacyTreasuryConfig as nijiLegacyTreasuryConfig,
} from './legacy-treasury.gen';

export {
  nijiUsdcPayerAbi as nijiPayerAbi,
  nijiUsdcPayerAddress as nijiPayerAddress,
  nijiUsdcPayerConfig as nijiPayerConfig,
} from './usdc-payer.gen';

export {
  nijiUsdcTokenBuyerAbi as nijiTokenBuyerAbi,
  nijiUsdcTokenBuyerAddress as nijiTokenBuyerAddress,
  nijiUsdcTokenBuyerConfig as nijiTokenBuyerConfig,
  readNijiUsdcTokenBuyerEthNeeded as readNijiTokenBuyerEthNeeded,
} from './usdc-token-buyer.gen';
