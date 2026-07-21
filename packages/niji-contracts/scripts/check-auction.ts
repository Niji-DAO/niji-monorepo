import hre from 'hardhat';

const AUCTION = '0x2dD20203b271053D59ef2B8141674AceD71A1a03';
const ABI = [
  {
    name: 'auction',
    inputs: [],
    outputs: [
      { name: 'nounId', type: 'uint96' },
      { name: 'clientId', type: 'uint32' },
      { name: 'amount', type: 'uint128' },
      { name: 'startTime', type: 'uint40' },
      { name: 'endTime', type: 'uint40' },
      { name: 'bidder', type: 'address' },
      { name: 'settled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  { name: 'paused', inputs: [], outputs: [{ type: 'bool' }], stateMutability: 'view', type: 'function' },
] as const;

async function main() {
  const c = new hre.ethers.Contract(AUCTION, ABI, hre.ethers.provider);
  const paused = await c.paused();
  const a = await c.auction();
  const now = Math.floor(Date.now() / 1000);
  console.log('paused:', paused);
  console.log('nounId:', a.nounId.toString());
  console.log('amount:', hre.ethers.formatEther(a.amount), 'ETH');
  console.log('startTime:', a.startTime.toString());
  console.log('endTime:', a.endTime.toString());
  console.log('now:', now);
  console.log('残り:', (Number(a.endTime) - now), '秒 (', ((Number(a.endTime) - now) / 3600).toFixed(1), 'h)');
  console.log('bidder:', a.bidder);
  console.log('settled:', a.settled);
  console.log('started?:', a.startTime.toString() !== '0');
}
main().catch(e => { console.error(e); process.exit(1); });
