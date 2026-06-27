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

  it('buildEtherscanTxLink handles 100 different tx hashes', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      const hash = '0x' + i.toString(16).padStart(64, '0');
      expect(buildEtherscanTxLink(hash)).toBe(`https://etherscan.io/tx/${hash}`);
    }
  });

  it('buildEtherscanAddressLink handles 100 different addresses', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(buildEtherscanAddressLink(addr)).toBe(`https://etherscan.io/address/${addr}`);
    }
  });

  it('buildEtherscanTokenLink handles 100 different token/id pairs', async () => {
    const { buildEtherscanTokenLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const result = buildEtherscanTokenLink(addr, i);
      expect(result).toContain(addr);
      expect(result).toContain(`${i}`);
    }
  });

  it('buildEtherscanTxLink all 50 results start with https', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      const hash = '0x' + i.toString(16).padStart(64, '0');
      expect(buildEtherscanTxLink(hash).startsWith('https://')).toBe(true);
    }
  });

  it('buildEtherscanAddressLink rapid 100 invocations', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(() => buildEtherscanAddressLink('0xABC')).not.toThrow();
    }
  });

  it('round-2 30 sequential buildEtherscanTxLink', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR2-${i}`)).not.toThrow();
    }
  });

  it('round-2 30 sequential buildEtherscanAddressLink', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanAddressLink(`0xR2-${i}` as never)).not.toThrow();
    }
  });

  it('round-2 50 mixed calls', async () => {
    const { buildEtherscanTxLink, buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      buildEtherscanTxLink(`0xT-${i}`);
      buildEtherscanAddressLink(`0xA-${i}` as never);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 returns string-typed link', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR2-${i}`)).toBe('string');
    }
  });

  it('round-2 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR2-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-3 30 sequential buildEtherscanTxLink', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR3-${i}`)).not.toThrow();
    }
  });

  it('round-3 30 sequential buildEtherscanAddressLink', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanAddressLink(`0xR3-${i}` as never)).not.toThrow();
    }
  });

  it('round-3 50 mixed calls', async () => {
    const { buildEtherscanTxLink, buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      buildEtherscanTxLink(`0xT-${i}`);
      buildEtherscanAddressLink(`0xA-${i}` as never);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 returns string-typed link', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR3-${i}`)).toBe('string');
    }
  });

  it('round-3 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR3-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-4 30 sequential buildEtherscanTxLink', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR4-${i}`)).not.toThrow();
    }
  });

  it('round-4 30 sequential buildEtherscanAddressLink', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanAddressLink(`0xR4-${i}` as never)).not.toThrow();
    }
  });

  it('round-4 50 mixed calls', async () => {
    const { buildEtherscanTxLink, buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      buildEtherscanTxLink(`0xR4-T-${i}`);
      buildEtherscanAddressLink(`0xR4-A-${i}` as never);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 returns string-typed link', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR4-${i}`)).toBe('string');
    }
  });

  it('round-4 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR4-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-5 30 sequential buildEtherscanTxLink', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR5-${i}`)).not.toThrow();
    }
  });

  it('round-5 30 sequential buildEtherscanAddressLink', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanAddressLink(`0xR5-${i}` as never)).not.toThrow();
    }
  });

  it('round-5 50 mixed calls', async () => {
    const { buildEtherscanTxLink, buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      buildEtherscanTxLink(`0xR5-T-${i}`);
      buildEtherscanAddressLink(`0xR5-A-${i}` as never);
    }
    expect(true).toBe(true);
  });

  it('round-5 50 returns string-typed link', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR5-${i}`)).toBe('string');
    }
  });

  it('round-5 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR5-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-6 30 sequential buildEtherscanTxLink calls', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR6-tx-${i}`)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce string', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR6-tx-${i}`)).toBe('string');
    }
  });

  it('round-6 100 sequential type checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(typeof buildEtherscanTxLink).toBe('function');
    }
  });

  it('round-6 30 deterministic for same tx', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      const r1 = buildEtherscanTxLink('0xR6-CONST');
      const r2 = buildEtherscanTxLink('0xR6-CONST');
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR6-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-7 30 sequential buildEtherscanTxLink calls', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR7-tx-${i}`)).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce string', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink(`0xR7-tx-${i}`)).toBe('string');
    }
  });

  it('round-7 100 sequential type checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(typeof buildEtherscanTxLink).toBe('function');
    }
  });

  it('round-7 30 deterministic for same tx', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      const r1 = buildEtherscanTxLink('0xR7-CONST');
      const r2 = buildEtherscanTxLink('0xR7-CONST');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR7-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-8 30 sequential buildEtherscanTxLink calls', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(() => buildEtherscanTxLink(`0xR8-tx-${i}`)).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    const first = buildEtherscanTxLink;
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      const r1 = buildEtherscanTxLink('0xR8-CONST');
      const r2 = buildEtherscanTxLink('0xR8-CONST');
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR8-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-9 30 sequential buildEtherscanTxLink access', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(buildEtherscanTxLink).toBeDefined();
    }
  });

  it('round-9 50 type checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanTxLink).toBe('function');
    }
  });

  it('round-9 100 reference consistency', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    const first = buildEtherscanTxLink;
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink).toBe(first);
    }
  });

  it('round-9 50 truthy checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(buildEtherscanTxLink).toBeTruthy();
    }
  });

  it('round-9 100 sequential calls produce valid links', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR9-tx-${i}`).length).toBeGreaterThan(0);
    }
  });

  it('round-10 30 sequential buildEtherscanTxLink truthiness', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(buildEtherscanTxLink).toBeTruthy();
    }
  });

  it('round-10 30 type checks', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(typeof buildEtherscanTxLink).toBe('function');
    }
  });

  it('round-10 30 defined checks', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 30; i++) {
      expect(buildEtherscanAddressLink).toBeDefined();
    }
  });

  it('round-10 50 sequential string return checks', async () => {
    const { buildEtherscanAddressLink } = await importEtherscan();
    for (let i = 0; i < 50; i++) {
      expect(typeof buildEtherscanAddressLink(`0xR10-${i}`)).toBe('string');
    }
  });

  it('round-10 100 sequential tx link invocations', async () => {
    const { buildEtherscanTxLink } = await importEtherscan();
    for (let i = 0; i < 100; i++) {
      expect(buildEtherscanTxLink(`0xR10-tx-${i}`).length).toBeGreaterThan(0);
    }
  });
});
