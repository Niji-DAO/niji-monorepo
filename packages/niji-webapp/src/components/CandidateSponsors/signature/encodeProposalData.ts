import {
  encodeAbiParameters,
  encodePacked,
  getAddress,
  hexToBytes,
  keccak256,
  toBytes,
} from 'viem';

import { Address } from '@/utils/types';

/**
 * Encode the proposal payload into the EIP-712 hash layout that `addSignature` expects.
 * Pure helper, no React state.
 */
export async function calcProposalEncodeData(
  proposer: string,
  targets: string[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string,
) {
  const signatureHashes = signatures.map((sig: string) => keccak256(toBytes(sig)));
  const calldatasHashes = calldatas.map((calldata: `0x${string}`) =>
    keccak256(hexToBytes(calldata)),
  );

  return encodeAbiParameters(
    [
      { name: 'proposer', type: 'address' },
      { name: 'targetsHash', type: 'bytes32' },
      { name: 'valuesHash', type: 'bytes32' },
      { name: 'signaturesHash', type: 'bytes32' },
      { name: 'calldatasHash', type: 'bytes32' },
      { name: 'descriptionHash', type: 'bytes32' },
    ],
    [
      getAddress(proposer),
      keccak256(encodePacked(['address[]'], [targets.map(v => v as Address)])),
      keccak256(encodePacked(['uint256[]'], [values])),
      keccak256(encodePacked(['bytes32[]'], [signatureHashes])),
      keccak256(encodePacked(['bytes32[]'], [calldatasHashes])),
      keccak256(toBytes(description)),
    ],
  );
}
