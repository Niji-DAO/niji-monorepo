import hre from 'hardhat';
async function main() {
  const provider = hre.ethers.provider;
  const latest = await provider.getBlockNumber();
  const addrs: Record<string, string> = {
    NijiToken: '0xFD0d2dDBBD4ff405751c1495cbBe717ed90bd8d2',
    NijiAuctionHouseProxy: '0x2dD20203b271053D59ef2B8141674AceD71A1a03',
  };
  console.log('latest block:', latest);
  // 各 contract の deploy block を binary search (code が存在する最古 block)
  for (const [name, addr] of Object.entries(addrs)) {
    let lo = latest - 5000 > 0 ? latest - 5000 : 0;
    let hi = latest;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const code = await provider.getCode(addr, mid);
      if (code && code !== '0x') hi = mid;
      else lo = mid + 1;
    }
    console.log(`${name} deploy block: ${lo}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
