import hre from 'hardhat';

const TOKEN = '0xFD0d2dDBBD4ff405751c1495cbBe717ed90bd8d2';
const AUCTION = '0x2dD20203b271053D59ef2B8141674AceD71A1a03';

async function main() {
  const provider = hre.ethers.provider;

  const call = async (to: string, sig: string, args = '') => {
    const sel = hre.ethers.id(sig).slice(0, 10);
    return provider.call({ to, data: sel + args });
  };

  // totalSupply
  const ts = await call(TOKEN, 'totalSupply()');
  const total = BigInt(ts);
  console.log('=== NijiToken ===');
  console.log('totalSupply:', total.toString());

  // nijidersDAO / minter 等の参照先
  for (const sig of ['nijidersDAO()', 'noundersDAO()', 'minter()', 'owner()']) {
    try {
      const r = await call(TOKEN, sig);
      if (r && r !== '0x') {
        console.log(sig, '=', '0x' + r.slice(-40));
      }
    } catch {
      /* 存在しない getter は skip */
    }
  }

  // 各 tokenId の owner
  console.log('');
  console.log('=== 各 Niji の owner ===');
  for (let i = 0n; i < (total > 5n ? 5n : total); i++) {
    const arg = i.toString(16).padStart(64, '0');
    try {
      const r = await call(TOKEN, 'ownerOf(uint256)', arg);
      const owner = '0x' + r.slice(-40);
      const isAuction = owner.toLowerCase() === AUCTION.toLowerCase();
      console.log(`  Niji ${i}: ${owner}${isAuction ? '  <- AuctionHouse (auction 対象)' : ''}`);
    } catch {
      console.log(`  Niji ${i}: (ownerOf revert = 未 mint)`);
    }
  }

  // auction の nounId が誰の持ち物か
  console.log('');
  console.log('=== auction 対象 token の状態 ===');
  const raw = await call(AUCTION, 'auction()');
  const body = raw.slice(2);
  const nounId = BigInt('0x' + body.slice(0, 64));
  console.log('auction.nounId:', nounId.toString());
  try {
    const arg = nounId.toString(16).padStart(64, '0');
    const r = await call(TOKEN, 'ownerOf(uint256)', arg);
    const owner = '0x' + r.slice(-40);
    console.log(`Niji ${nounId} の owner:`, owner);
    console.log('AuctionHouse 保有?:', owner.toLowerCase() === AUCTION.toLowerCase() ? 'YES (正常)' : 'NO (異常 = auction 対象が他者保有)');
  } catch {
    console.log(`Niji ${nounId}: 未 mint (異常 = auction 対象が存在しない)`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
