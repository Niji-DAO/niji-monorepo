import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NijiToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_noundersDAO', internalType: 'address', type: 'address' },
      { name: '_minter', internalType: 'address', type: 'address' },
      { name: '_descriptor', internalType: 'contract INijiDescriptor', type: 'address' },
      { name: '_seeder', internalType: 'contract INijiSeeder', type: 'address' },
      { name: '_proxyRegistry', internalType: 'contract IProxyRegistry', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'approved', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'operator', internalType: 'address', type: 'address', indexed: true },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address', indexed: true },
      { name: 'fromDelegate', internalType: 'address', type: 'address', indexed: true },
      { name: 'toDelegate', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DelegateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'delegate', internalType: 'address', type: 'address', indexed: true },
      { name: 'previousBalance', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'newBalance', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DelegateVotesChanged',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'DescriptorLocked' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'descriptor',
        internalType: 'contract INijiDescriptor',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DescriptorUpdated',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'MinterLocked' },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'minter', internalType: 'address', type: 'address', indexed: false }],
    name: 'MinterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'NounBurned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'seed',
        internalType: 'struct INijiSeeder.Seed',
        type: 'tuple',
        components: [
          { name: 'background', internalType: 'uint48', type: 'uint48' },
          { name: 'body', internalType: 'uint48', type: 'uint48' },
          { name: 'accessory', internalType: 'uint48', type: 'uint48' },
          { name: 'head', internalType: 'uint48', type: 'uint48' },
          { name: 'glasses', internalType: 'uint48', type: 'uint48' },
        ],
        indexed: false,
      },
    ],
    name: 'NounCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'noundersDAO', internalType: 'address', type: 'address', indexed: false }],
    name: 'NoundersDAOUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'SeederLocked' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'seeder', internalType: 'contract INijiSeeder', type: 'address', indexed: false },
    ],
    name: 'SeederUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DELEGATION_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_TYPEHASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'nounId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'checkpoints',
    outputs: [
      { name: 'fromBlock', internalType: 'uint32', type: 'uint32' },
      { name: 'votes', internalType: 'uint96', type: 'uint96' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'dataURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegatee', internalType: 'address', type: 'address' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegatee', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'delegateBySig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegator', internalType: 'address', type: 'address' }],
    name: 'delegates',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'descriptor',
    outputs: [{ name: '', internalType: 'contract INijiDescriptor', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getCurrentVotes',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getPriorVotes',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isDescriptorLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isMinterLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isSeederLocked',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lockDescriptor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', inputs: [], name: 'lockMinter', outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', inputs: [], name: 'lockSeeder', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'mint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minter',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'noundersDAO',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'numCheckpoints',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxyRegistry',
    outputs: [{ name: '', internalType: 'contract IProxyRegistry', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'seeder',
    outputs: [{ name: '', internalType: 'contract INijiSeeder', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'seeds',
    outputs: [
      { name: 'special', internalType: 'uint48', type: 'uint48' },
      { name: 'choker', internalType: 'uint48', type: 'uint48' },
      { name: 'headphone', internalType: 'uint48', type: 'uint48' },
      { name: 'leftHand', internalType: 'uint48', type: 'uint48' },
      { name: 'hat', internalType: 'uint48', type: 'uint48' },
      { name: 'clothing', internalType: 'uint48', type: 'uint48' },
      { name: 'ear', internalType: 'uint48', type: 'uint48' },
      { name: 'back', internalType: 'uint48', type: 'uint48' },
      { name: 'backDecoration', internalType: 'uint48', type: 'uint48' },
      { name: 'background', internalType: 'uint48', type: 'uint48' },
      { name: 'solidBackground', internalType: 'uint48', type: 'uint48' },
      { name: 'hair', internalType: 'uint48', type: 'uint48' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newContractURIHash', internalType: 'string', type: 'string' }],
    name: 'setContractURIHash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_descriptor', internalType: 'contract INijiDescriptor', type: 'address' }],
    name: 'setDescriptor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_minter', internalType: 'address', type: 'address' }],
    name: 'setMinter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_noundersDAO', internalType: 'address', type: 'address' }],
    name: 'setNoundersDAO',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_seeder', internalType: 'contract INijiSeeder', type: 'address' }],
    name: 'setSeeder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegator', internalType: 'address', type: 'address' }],
    name: 'votesToDelegate',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenAddress = {
  1: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
  11155111: '0x4C4674bb72a096855496a7204962297bd7e12b85',
  31337: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  84532: '0x0000000000000000000000000000000000000000',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const nijiTokenConfig = { address: nijiTokenAddress, abi: nijiTokenAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiToken = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DELEGATION_TYPEHASH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDelegationTypehash = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'DELEGATION_TYPEHASH',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"DOMAIN_TYPEHASH"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDomainTypehash = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'DOMAIN_TYPEHASH',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'balanceOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"checkpoints"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenCheckpoints = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'checkpoints',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"contractURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenContractUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'contractURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"dataURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDataUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'dataURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"decimals"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'decimals',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegates"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDelegates = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegates',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"descriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenDescriptor = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'descriptor',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getApproved"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getApproved',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getCurrentVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetCurrentVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getCurrentVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"getPriorVotes"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenGetPriorVotes = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'getPriorVotes',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isApprovedForAll',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isDescriptorLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsDescriptorLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isDescriptorLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isMinterLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsMinterLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isMinterLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"isSeederLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenIsSeederLocked = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'isSeederLocked',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"minter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenMinter = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'minter',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"name"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenName = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'name',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"nonces"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenNonces = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'nonces',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"noundersDAO"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenNoundersDao = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'noundersDAO',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"numCheckpoints"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenNumCheckpoints = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'numCheckpoints',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"owner"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'owner',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"ownerOf"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'ownerOf',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"proxyRegistry"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenProxyRegistry = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'proxyRegistry',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSeeder = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeder',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"seeds"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSeeds = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'seeds',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSupportsInterface = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'supportsInterface',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"symbol"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'symbol',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenByIndex = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenByIndex',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenOfOwnerByIndex = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenOfOwnerByIndex',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"tokenURI"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'tokenURI',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'totalSupply',
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"votesToDelegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useReadNijiTokenVotesToDelegate = /*#__PURE__*/ createUseReadContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'votesToDelegate',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiToken = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenDelegate = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenDelegateBySig = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockDescriptor',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockMinter = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockMinter',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenLockSeeder = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockSeeder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSafeTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetContractUriHash = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetDescriptor = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetMinter = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setNoundersDAO"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetNoundersDao = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setNoundersDAO',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenSetSeeder = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWriteNijiTokenTransferOwnership = /*#__PURE__*/ createUseWriteContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiToken = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"approve"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'approve',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"burn"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'burn',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegate"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenDelegate = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegate',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"delegateBySig"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenDelegateBySig = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'delegateBySig',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockDescriptor',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockMinter = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockMinter',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"lockSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenLockSeeder = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'lockSeeder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"mint"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenMint = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'mint',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'renounceOwnership',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSafeTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'safeTransferFrom',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetApprovalForAll = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setApprovalForAll',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setContractURIHash"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetContractUriHash = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setContractURIHash',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setDescriptor"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetDescriptor = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setDescriptor',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setMinter"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetMinter = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setMinter',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setNoundersDAO"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetNoundersDao = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setNoundersDAO',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"setSeeder"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenSetSeeder = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'setSeeder',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenTransferFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferFrom',
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nijiTokenAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useSimulateNijiTokenTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  functionName: 'transferOwnership',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"Approval"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenApprovalEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Approval',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenApprovalForAllEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'ApprovalForAll',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"DelegateChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDelegateChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DelegateChanged',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"DelegateVotesChanged"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDelegateVotesChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'DelegateVotesChanged',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"DescriptorLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDescriptorLockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DescriptorLocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"DescriptorUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenDescriptorUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'DescriptorUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"MinterLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenMinterLockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MinterLocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"MinterUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenMinterUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'MinterUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"NounBurned"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenNounBurnedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'NounBurned',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"NounCreated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenNounCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'NounCreated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"NoundersDAOUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenNoundersDaoUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'NoundersDAOUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nijiTokenAbi,
    address: nijiTokenAddress,
    eventName: 'OwnershipTransferred',
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"SeederLocked"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenSeederLockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'SeederLocked',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"SeederUpdated"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenSeederUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'SeederUpdated',
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nijiTokenAbi}__ and `eventName` set to `"Transfer"`
 *
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x4c4674bb72a096855496a7204962297bd7e12b85)
 */
export const useWatchNijiTokenTransferEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: nijiTokenAbi,
  address: nijiTokenAddress,
  eventName: 'Transfer',
});
