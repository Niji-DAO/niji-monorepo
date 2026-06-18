/**
 * Deploy helpers for Niji contracts.
 */
import { ethers } from 'hardhat';
import { NijiArt, NijiDescriptor, NijiSeeder, NijiToken } from '../../../typechain';
import { TRAIT_NAMES, RESOLUTION, COMPOSITE_ORDER } from './constants';

export async function deployNijiArt(
  descriptorAddress: string,
  traitNames: string[] = TRAIT_NAMES,
): Promise<NijiArt> {
  const factory = await ethers.getContractFactory('NijiArt');
  return (await factory.deploy(descriptorAddress, traitNames)) as unknown as NijiArt;
}

export async function deployNijiDescriptor(
  artAddress: string,
  resolution: number = RESOLUTION,
  compositeOrder: number[] = COMPOSITE_ORDER,
): Promise<NijiDescriptor> {
  const factory = await ethers.getContractFactory('NijiDescriptor');
  return (await factory.deploy(
    artAddress,
    resolution,
    compositeOrder,
  )) as unknown as NijiDescriptor;
}

export async function deployNijiSeeder(artAddress: string): Promise<NijiSeeder> {
  const factory = await ethers.getContractFactory('NijiSeeder');
  return (await factory.deploy(artAddress)) as unknown as NijiSeeder;
}

export async function deployNijiToken(
  name: string,
  symbol: string,
  descriptorAddress: string,
  seederAddress: string,
  maxSupply: number,
): Promise<NijiToken> {
  const factory = await ethers.getContractFactory('NijiToken');
  return (await factory.deploy(
    name,
    symbol,
    descriptorAddress,
    seederAddress,
    maxSupply,
  )) as unknown as NijiToken;
}
