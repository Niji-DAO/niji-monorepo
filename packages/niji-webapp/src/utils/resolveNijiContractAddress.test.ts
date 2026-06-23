import { describe, expect, it, vi } from 'vitest';

const GOV = '0x1111111111111111111111111111111111111111';
const AH = '0x2222222222222222222222222222222222222222';
const TRE = '0x3333333333333333333333333333333333333333';

vi.mock('@niji/sdk/react', () => ({
  nijiGovernorAddress: { 1: GOV },
  nijiAuctionHouseAddress: { 1: AH },
  nijiTreasuryAddress: { 1: TRE },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

const importResolver = async () => import('./resolveNijiContractAddress');

describe('resolveNijiContractAddress', () => {
  it('returns "Niji DAO Proxy" for governor address', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress(GOV)).toBe('Niji DAO Proxy');
  });

  it('returns "Niji Auction House Proxy" for auction house', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress(AH)).toBe('Niji Auction House Proxy');
  });

  it('returns "Niji DAO Treasury" for treasury address', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress(TRE)).toBe('Niji DAO Treasury');
  });

  it('handles case-insensitive matching (upper input)', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress(GOV.toUpperCase())).toBe('Niji DAO Proxy');
  });

  it('returns undefined for unknown address', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(
      resolveNijiContractAddress('0x9999999999999999999999999999999999999999'),
    ).toBeUndefined();
  });
});
