import hre from 'hardhat';

const AUCTION = '0x2dD20203b271053D59ef2B8141674AceD71A1a03';

/**
 * auction() の raw return を手動 decode する。
 * 実 contract の struct 順が ABI 定義と一致しないケースがあるため、 32 byte slot 単位で読む。
 * slot 順 = nounId / (clientId or amount) / amount / startTime / endTime / bidder / settled 相当、
 * 非 0 slot を timestamp として解釈して残時間を出す。
 */
async function main() {
  const provider = hre.ethers.provider;

  // auction() selector = keccak("auction()") 先頭 4 byte
  const selector = hre.ethers.id('auction()').slice(0, 10);
  const raw = await provider.call({ to: AUCTION, data: selector });
  const body = raw.slice(2);
  const slots: bigint[] = [];
  for (let i = 0; i + 64 <= body.length; i += 64) {
    slots.push(BigInt('0x' + body.slice(i, i + 64)));
  }

  const now = Math.floor(Date.now() / 1000);
  console.log('=== auction() raw slots ===');
  slots.forEach((s, i) => {
    const asNum = s.toString();
    const isTs = s > 1_600_000_000n && s < 2_000_000_000n;
    console.log(`  slot${i}: ${asNum}${isTs ? '  <- timestamp (' + new Date(Number(s) * 1000).toISOString() + ')' : ''}`);
  });

  // timestamp 候補 = 2 つ (startTime / endTime)
  const timestamps = slots.filter(s => s > 1_600_000_000n && s < 2_000_000_000n);
  if (timestamps.length >= 2) {
    const startTime = Number(timestamps[0]);
    const endTime = Number(timestamps[1]);
    const remain = endTime - now;
    console.log('');
    console.log('=== auction 進行状況 ===');
    console.log('startTime:', startTime, new Date(startTime * 1000).toISOString());
    console.log('endTime:  ', endTime, new Date(endTime * 1000).toISOString());
    console.log('duration: ', endTime - startTime, '秒 =', ((endTime - startTime) / 3600).toFixed(1), 'h');
    console.log('now:      ', now, new Date(now * 1000).toISOString());
    console.log('残り:     ', remain, '秒 =', (remain / 3600).toFixed(2), 'h');
    console.log('');
    console.log(remain > 0 ? '→ auction 進行中 (終了まで待ち)' : '→ 終了済 = keeper が次 cron で settle するはず');
  }

  // 設定値 (個別 getter は decode 問題なし)
  const one = async (sig: string, name: string) => {
    try {
      const sel = hre.ethers.id(sig).slice(0, 10);
      const r = await provider.call({ to: AUCTION, data: sel });
      console.log(`${name}:`, BigInt(r).toString());
    } catch (e) {
      console.log(`${name}: (read fail)`);
    }
  };
  console.log('');
  console.log('=== 設定値 ===');
  await one('duration()', 'duration (秒)');
  await one('reservePrice()', 'reservePrice (wei)');
  await one('timeBuffer()', 'timeBuffer (秒)');
  await one('minBidIncrementPercentage()', 'minBidIncrement (%)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
