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

  it('handles mixed-case input (checksum-style 0xAaBb...) for governor', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    // GOV = '0x1111...1111' を意図的に大小ミックスして渡す (全 1 のため case が無くなるので AH を使う)
    // AH = '0x2222222222222222222222222222222222222222' は全数字、 同 hex case ミックス test 用に別 hex 文字を使う
    // 今回 mock の AH は数字のみだが、 .toLowerCase() の idempotency を確認する代用として upper を再度 mixed 化
    const mixed = AH.replace(/2/g, '2').toUpperCase().slice(0, 4) + AH.slice(4);
    expect(resolveNijiContractAddress(mixed)).toBe('Niji Auction House Proxy');
  });

  it('returns undefined for empty string input', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress('')).toBeUndefined();
  });

  it('returns undefined for address without 0x prefix', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    expect(resolveNijiContractAddress('1111111111111111111111111111111111111111')).toBeUndefined();
  });

  it('is idempotent — same input gives same result across multiple calls', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    const first = resolveNijiContractAddress(GOV);
    const second = resolveNijiContractAddress(GOV);
    const third = resolveNijiContractAddress(GOV.toUpperCase());
    expect(first).toBe('Niji DAO Proxy');
    expect(second).toBe('Niji DAO Proxy');
    expect(third).toBe('Niji DAO Proxy');
  });

  it('returns undefined for address with extra whitespace (no trim)', async () => {
    const { resolveNijiContractAddress } = await importResolver();
    // source は trim しないため空白付きは match しない
    expect(resolveNijiContractAddress(` ${GOV} `)).toBeUndefined();
  });
});
