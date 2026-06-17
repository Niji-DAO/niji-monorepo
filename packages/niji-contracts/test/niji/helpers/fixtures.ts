/**
 * Test fixtures for Niji contracts.
 */
import { ethers } from 'hardhat';
import { NijiArt } from '../../../typechain';
import { SAMPLE_PNG, TRAIT_COUNT } from './constants';

/**
 * Populate every trait slot with sample images.
 * Caller must ensure the signer has descriptor permission on the art contract.
 */
export async function populateAllTraits(
  art: NijiArt,
  png: Buffer = SAMPLE_PNG,
  imagesPerTrait: number = 3,
): Promise<void> {
  const images = Array(imagesPerTrait).fill(png);
  for (let i = 0; i < TRAIT_COUNT; i++) {
    await art.addTraitImages(i, images);
  }
}

/**
 * Build a trait indices array with all slots set to SKIP_LAYER (MaxUint256),
 * then override specific traits with the given active map.
 *
 * @param active - Map of traitId → imageIndex to activate
 */
export function buildTraitIndices(active: Record<number, number | bigint> = {}): bigint[] {
  const indices: bigint[] = Array(TRAIT_COUNT).fill(ethers.MaxUint256);
  for (const [traitId, imageIndex] of Object.entries(active)) {
    indices[Number(traitId)] = BigInt(imageIndex);
  }
  return indices;
}
