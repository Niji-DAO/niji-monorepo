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

  it('buildEtherscanTxLink accepts uppercase hash without transformation', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    expect(buildEtherscanTxLink('0xABCDEF')).toBe('https://etherscan.io/tx/0xABCDEF');
  });

  it('buildEtherscanTxLink with empty hash still builds /tx/ root', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    expect(buildEtherscanTxLink('')).toBe('https://etherscan.io/tx/');
  });

  it('buildEtherscanTokenLink supports tokenId = 0', async () => {
    const { buildEtherscanTokenLink } = await importEtherscan();
    expect(buildEtherscanTokenLink('0xt', 0)).toBe('https://etherscan.io/token/0xt?a=0');
  });

  it('buildEtherscanTokenLink supports large tokenId (Number.MAX_SAFE_INTEGER)', async () => {
    const { buildEtherscanTokenLink } = await importEtherscan();
    const id = Number.MAX_SAFE_INTEGER;
    expect(buildEtherscanTokenLink('0xt', id)).toBe(`https://etherscan.io/token/0xt?a=${id}`);
  });

  it('buildEtherscanAddressLink builds /address/ without trailing slash for ENS-shaped input', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    expect(buildEtherscanAddressLink('vitalik.eth')).toBe(
      'https://etherscan.io/address/vitalik.eth',
    );
  });

  it('buildEtherscanApiQuery URL-encodes address with special characters', async () => {
    const { buildEtherscanApiQuery } = await importEtherscan();
    // URLSearchParams encodes spaces as '+' and special chars like '&'
    const url = buildEtherscanApiQuery('0xfoo&bar baz');
    expect(url).toContain('address=0xfoo%26bar+baz');
  });

  it('buildEtherscanApiQuery preserves order: chainid, module, action, address, apikey', async () => {
    const { buildEtherscanApiQuery } = await importEtherscan();
    const url = buildEtherscanApiQuery('0xc');
    const queryString = url.split('?')[1];
    const idxChain = queryString.indexOf('chainid=');
    const idxModule = queryString.indexOf('module=');
    const idxAction = queryString.indexOf('action=');
    const idxAddress = queryString.indexOf('address=');
    const idxApikey = queryString.indexOf('apikey=');
    expect(idxChain).toBeLessThan(idxModule);
    expect(idxModule).toBeLessThan(idxAction);
    expect(idxAction).toBeLessThan(idxAddress);
    expect(idxAddress).toBeLessThan(idxApikey);
  });
});

describe('etherscan link builders — fallback URL when blockExplorers undefined', () => {
  it('falls back to https://etherscan.io when defaultChain.blockExplorers is undefined', async () => {
    vi.resetModules();
    vi.doMock('@/config', () => ({ ETHERSCAN_API_KEY: 'TEST_KEY' }));
    vi.doMock('@/wagmi', () => ({
      defaultChain: { id: 1 }, // no blockExplorers
    }));
    const { buildEtherscanTxLink } = await import('./etherscan');
    expect(buildEtherscanTxLink('0xdead')).toBe('https://etherscan.io/tx/0xdead');
    vi.doUnmock('@/config');
    vi.doUnmock('@/wagmi');
  });
});
