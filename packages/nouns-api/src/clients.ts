import { NounsTokenABI } from '@nouns/contracts';
import { Contract, providers } from 'ethers';
import Redis from 'ioredis';
import { NFTStorage } from 'nft.storage';
import { config } from './config';

/**
 * IFPS Storage Client
 */
export const storage = new NFTStorage({ token: config.nftStorageApiKey });

/**
 * Redis Client
 */
export const redis = new Redis(config.redisPort, config.redisHost);

/**
 * Ethers JSON RPC Provider
 */
export const jsonRpcProvider = new providers.JsonRpcProvider(config.jsonRpcUrl);

/**
 * Niji ERC721 Token Contract
 */
export const nounsTokenContract = new Contract(
  config.nounsTokenAddress,
  NounsTokenABI,
  jsonRpcProvider,
);
