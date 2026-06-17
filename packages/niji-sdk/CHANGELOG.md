# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] 2025-08-15

### Added

- `@niji/sdk/treasury` actions:
  - `readNounsTreasuryBalancesInUsd`
  - `readNounsTreasuryBalancesInEth`
- `@niji/sdk/react/treasury` hooks:
  - `useReadNounsTreasuryBalancesInUsd`
  - `useReadNounsTreasuryBalancesInEth`

### Removed

- CJS exports. They were included by mistake, since the package depends on wagmi v2+ which is ESM only

## [1.1.0] 2025-08-08

### Added

- Stream actions (`@niji/sdk/stream`) and react hooks (`@niji/sdk/react/stream`) to be paired up with the `stream-factory` ones

## [1.0.0] - 2025-07-24

### Added

- modules with Wagmi cli generated actions and React hooks for current contracts:
  - actions:
    - `@niji/sdk/governor`
    - `@niji/sdk/legacy-treasury`
    - `@niji/sdk/treasury`
    - `@niji/sdk/data`
    - `@niji/sdk/token`
    - `@niji/sdk/auction-house`
    - `@niji/sdk/descriptor`
    - `@niji/sdk/stream-factory`
    - `@niji/sdk/usdc-payer`
    - `@niji/sdk/usdc-token-buyer`
  - react hooks:
    - `@niji/sdk/react/governor`
    - `@niji/sdk/react/legacy-treasury`
    - `@niji/sdk/react/treasury`
    - `@niji/sdk/react/data`
    - `@niji/sdk/react/token`
    - `@niji/sdk/react/auction-house`
    - `@niji/sdk/react/descriptor`
    - `@niji/sdk/react/stream-factory`
    - `@niji/sdk/react/usdc-payer`
    - `@niji/sdk/react/usdc-token-buyer`

### Changed

- **BREAKING**: Increased minimum node version requirement to 16+

### Removed

- **BREAKING**: Ethers.js dependency and old contract definitions and legacy exports from root module `@niji/sdk`
  - types: `ChainId`, `ContractAddresses`
  - methods: `getContractsForChainOrThrow`, `getContractAddressesForChainOrThrow`
  - abis: `NounsTokenABI`, `NounsAuctionHouseABI`, `NounsDescriptorABI`, `NounsSeederABI`, `NounsDAOABI`, `NounsDAOV2ABI`,
  - factories: `NounsTokenFactory`, `NounsAuctionHouseFactory`, `NounsDescriptorFactory`, `NounsSeederFactory`, `NounsDaoLogicV1Factory`, `NounsDaoLogicV2Factory`

## [0.4.0] - 2022-11-22

### Added

- Started maintaining a changelog from this version onward.

[Unreleased]: https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/niji-sdk
[1.2.0]: https://github.com/nounsDAO/nouns-monorepo/tree/fb183939d/packages/niji-sdk
[1.1.0]: https://github.com/nounsDAO/nouns-monorepo/tree/967341a4b/packages/niji-sdk
[1.0.0]: https://github.com/nounsDAO/nouns-monorepo/tree/6e0b43054/packages/niji-sdk
[0.4.0]: https://github.com/nounsDAO/nouns-monorepo/tree/6e75b03a5/packages/niji-sdk
