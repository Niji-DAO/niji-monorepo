import fs from 'fs';
import path from 'path';

import hre from 'hardhat';

/**
 * deployments/<network>.json から address を読んで、 mint 状況 (Nijider founder reward が
 * 効いているか = 10 個ごと Nijider 付与 + auction は次 id) を chain 上で確認する。
 */
async function main() {
  const network = hre.network.name;
  const snapPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
  const snap = JSON.parse(fs.readFileSync(snapPath, 'utf-8'));
  const TOKEN: string = snap.contracts.NijiToken;
  const AUCTION: string = snap.contracts.NijiAuctionHouseProxy;

  const provider = hre.ethers.provider;
  const call = async (to: string, sig: string, args = '') => {
    const sel = hre.ethers.id(sig).slice(0, 10);
    return provider.call({ to, data: sel + args });
  };

  console.log(`=== ${network} (deployments snapshot) ===`);
  console.log('NijiToken:   ', TOKEN);
  console.log('AuctionHouse:', AUCTION);
  console.log('');

  const total = BigInt(await call(TOKEN, 'totalSupply()'));
  console.log('=== NijiToken 状態 ===');
  console.log('totalSupply:', total.toString());

  for (const sig of ['nijidersDAO()', 'minter()', 'owner()']) {
    try {
      const r = await call(TOKEN, sig);
      console.log(sig.replace('()', ':'), '0x' + r.slice(-40));
    } catch {
      console.log(sig.replace('()', ':'), '(read fail)');
    }
  }
  try {
    const r = await call(TOKEN, 'nijiderRewardLastId()');
    console.log('nijiderRewardLastId:', BigInt(r).toString());
  } catch {
    console.log('nijiderRewardLastId: (read fail)');
  }
  try {
    const r = await call(TOKEN, 'NIJIDER_REWARD_INTERVAL()');
    console.log('NIJIDER_REWARD_INTERVAL:', BigInt(r).toString());
  } catch {
    console.log('NIJIDER_REWARD_INTERVAL: (read fail)');
  }

  console.log('');
  console.log('=== 各 Niji の owner (Nijider reward 検証) ===');
  const nijiderRaw = await call(TOKEN, 'nijidersDAO()');
  const nijider = ('0x' + nijiderRaw.slice(-40)).toLowerCase();
  const limit = total > 12n ? 12n : total;
  for (let i = 0n; i < limit; i++) {
    const arg = i.toString(16).padStart(64, '0');
    try {
      const r = await call(TOKEN, 'ownerOf(uint256)', arg);
      const owner = ('0x' + r.slice(-40)).toLowerCase();
      let tag = '';
      if (owner === AUCTION.toLowerCase()) tag = '  <- AuctionHouse (auction 対象)';
      else if (owner === nijider) tag = '  <- Nijider DAO (founder reward)';
      console.log(`  Niji ${i}: ${owner}${tag}`);
    } catch {
      console.log(`  Niji ${i}: (未 mint)`);
    }
  }

  console.log('');
  console.log('=== auction 対象 ===');
  const raw = await call(AUCTION, 'auction()');
  const body = raw.slice(2);
  const nounId = BigInt('0x' + body.slice(0, 64));
  console.log('auction.nounId:', nounId.toString());
  const expectFirstAuction = 1n; // reward が id0 を取るので auction は id1 が期待値
  console.log(
    '期待値 (初回):',
    expectFirstAuction.toString(),
    nounId === expectFirstAuction ? '✅ 一致 (Nijider reward 動作)' : '⚠️ 不一致',
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
