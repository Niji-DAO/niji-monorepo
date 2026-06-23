import { describe, expect, it, vi } from 'vitest';

vi.mock('@/config', () => ({
  ETHERSCAN_API_KEY: 'TEST_KEY',
}));

vi.mock('@/wagmi', () => ({
  defaultChain: {
    id: 1,
    blockExplorers: {
      default: { url: 'https://etherscan.io' },
    },
  },
}));

const importEtherscan = async () => import('./etherscan');

describe('etherscan link builders', () => {
  it('buildEtherscanTxLink uses /tx/ path', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    expect(buildEtherscanTxLink('0xdeadbeef')).toBe('https://etherscan.io/tx/0xdeadbeef');
  });

  it('buildEtherscanAddressLink uses /address/ path', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    expect(buildEtherscanAddressLink('0xabc')).toBe('https://etherscan.io/address/0xabc');
  });

  it('buildEtherscanTokenLink encodes tokenId as query param', async () => {
    const { buildEtherscanTokenLink } = await importEtherscan();
    expect(buildEtherscanTokenLink('0xtoken', 42)).toBe('https://etherscan.io/token/0xtoken?a=42');
  });

  it('buildEtherscanHoldingsLink uses /tokenholdings path', async () => {
    const { buildEtherscanHoldingsLink } = await importEtherscan();
    expect(buildEtherscanHoldingsLink('0xowner')).toBe(
      'https://etherscan.io/tokenholdings?a=0xowner',
    );
  });

  it('buildEtherscanApiQuery includes chainid + module + action + apikey', async () => {
    const { buildEtherscanApiQuery } = await importEtherscan();
    const url = buildEtherscanApiQuery('0xcontract');
    expect(url).toContain('https://api.etherscan.io/v2/api?');
    expect(url).toContain('chainid=1');
    expect(url).toContain('module=contract');
    expect(url).toContain('action=getsourcecode');
    expect(url).toContain('address=0xcontract');
    expect(url).toContain('apikey=TEST_KEY');
  });

  it('buildEtherscanApiQuery accepts custom module/action overrides', async () => {
    const { buildEtherscanApiQuery } = await importEtherscan();
    const url = buildEtherscanApiQuery('0xc', 'account', 'tokenbalance');
    expect(url).toContain('module=account');
    expect(url).toContain('action=tokenbalance');
  });
});
