#!/usr/bin/env node
/**
 * anvil e2e verification script — fincode Phase 2 完成確認
 *
 * chain-level verification (bid → time-warp → settle → NFT mint ownership):
 * fincode 決済 flow 中の chain-side が期待通り機能することを viem 直で assert する。
 *
 * fincode API 側は 25 unit test (services/fincode/client.test.ts + handlers/fiat-bid/authorize-fincode.test.ts) で cover 済。
 * webapp side の auto place-bid chain (fincode AUTHORIZED → placeBid → success) は useFiatBid.test.ts で cover 済。
 * 本 script は「backend が place-bid を呼出したら chain 上で bid tx broadcast + auction settle 後 NFT mint される」 の
 * chain integration を独立検証する。
 *
 * 前提 —
 * - anvil が port 8547 で稼働中 (chainId 31337)
 * - packages/niji-contracts の task:run-local で全 contract deploy 済 (localhost.json 参照)
 * - 現在 auction が open state (amount 0 で bid 受付可能)
 *
 * 使い方 = node packages/niji-webapp/scripts/verify-fincode-anvil-e2e.mjs
 * 期待結果 = "NFT mint verified: YES" 出力 + exit code 0
 */
import { createPublicClient, createWalletClient, http, parseAbi, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

const ANVIL_RPC = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8547';
const AUCTION_HOUSE = process.env.NIJI_AUCTION_HOUSE_ADDRESS ?? '0x1Dbbf529D78d6507B0dd71F6c02f41138d828990';
const NIJI_TOKEN = process.env.NIJI_TOKEN_ADDRESS ?? '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
// hardhat default account #0 (deterministic)
const BIDDER_PRIVATE_KEY = process.env.BIDDER_PRIVATE_KEY ?? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const auctionHouseAbi = parseAbi([
  'function auction() view returns (uint256 nounId, uint256 amount, uint256 startTime, uint256 endTime, address bidder, bool settled)',
  'function createBid(uint256 nounId, uint32 clientId) payable',
  'function settleCurrentAndCreateNewAuction()',
  'function reservePrice() view returns (uint256)',
  'function minBidIncrementPercentage() view returns (uint8)',
]);

const nijiTokenAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

const account = privateKeyToAccount(BIDDER_PRIVATE_KEY);
const publicClient = createPublicClient({ chain: hardhat, transport: http(ANVIL_RPC) });
const walletClient = createWalletClient({ account, chain: hardhat, transport: http(ANVIL_RPC) });

const log = (label, value) => console.log(`[verify-anvil-e2e] ${label}:`, value);

const advanceTime = async (seconds) => {
  const res1 = await fetch(ANVIL_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'evm_increaseTime', params: [seconds] }),
  });
  const json1 = await res1.json();
  if (json1.error) throw new Error(`evm_increaseTime failed: ${JSON.stringify(json1.error)}`);

  const res2 = await fetch(ANVIL_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'evm_mine', params: [] }),
  });
  const json2 = await res2.json();
  if (json2.error) throw new Error(`evm_mine failed: ${JSON.stringify(json2.error)}`);
};

async function main() {
  log('anvil rpc', ANVIL_RPC);
  log('auction house', AUCTION_HOUSE);
  log('niji token', NIJI_TOKEN);
  log('bidder', account.address);

  // Step 1: pre-state
  const [auction, reservePrice, minIncrement, preBalance] = await Promise.all([
    publicClient.readContract({ address: AUCTION_HOUSE, abi: auctionHouseAbi, functionName: 'auction' }),
    publicClient.readContract({ address: AUCTION_HOUSE, abi: auctionHouseAbi, functionName: 'reservePrice' }),
    publicClient.readContract({ address: AUCTION_HOUSE, abi: auctionHouseAbi, functionName: 'minBidIncrementPercentage' }),
    publicClient.readContract({ address: NIJI_TOKEN, abi: nijiTokenAbi, functionName: 'balanceOf', args: [account.address] }),
  ]);

  const [nounId, currentBid, startTime, endTime, currentBidder, settled] = auction;
  log('current auction nounId', nounId.toString());
  log('current bid (wei)', currentBid.toString());
  log('current bidder', currentBidder);
  log('endTime (unix)', endTime.toString());
  log('settled', settled);
  log('pre-bid NFT balance(bidder)', preBalance.toString());

  if (settled) {
    throw new Error('auction already settled, cannot bid — rerun after auction resets');
  }

  // Step 2: place bid (minBid or 0.01 ETH whichever is higher)
  const minBid = currentBid === 0n ? reservePrice : currentBid + (currentBid * BigInt(minIncrement)) / 100n;
  const bidAmount = minBid > parseEther('0.01') ? minBid : parseEther('0.01');
  log('placing bid (wei)', bidAmount.toString());

  const bidHash = await walletClient.writeContract({
    address: AUCTION_HOUSE,
    abi: auctionHouseAbi,
    functionName: 'createBid',
    args: [nounId, 0],
    value: bidAmount,
  });
  const bidReceipt = await publicClient.waitForTransactionReceipt({ hash: bidHash });
  log('bid tx hash', bidHash);
  log('bid tx status', bidReceipt.status);
  if (bidReceipt.status !== 'success') throw new Error(`bid tx failed: ${bidHash}`);

  // Step 3: advance time past endTime + settle
  const now = Math.floor(Date.now() / 1000);
  const secsUntilEnd = Number(endTime) - now;
  const advanceSec = Math.max(secsUntilEnd + 100, 86500);
  log('advancing time by (sec)', advanceSec);
  await advanceTime(advanceSec);

  const settleHash = await walletClient.writeContract({
    address: AUCTION_HOUSE,
    abi: auctionHouseAbi,
    functionName: 'settleCurrentAndCreateNewAuction',
  });
  const settleReceipt = await publicClient.waitForTransactionReceipt({ hash: settleHash });
  log('settle tx hash', settleHash);
  log('settle tx status', settleReceipt.status);
  if (settleReceipt.status !== 'success') throw new Error(`settle tx failed: ${settleHash}`);

  // Step 4: verify NFT mint
  const [postBalance, totalSupply, ownerNoun] = await Promise.all([
    publicClient.readContract({ address: NIJI_TOKEN, abi: nijiTokenAbi, functionName: 'balanceOf', args: [account.address] }),
    publicClient.readContract({ address: NIJI_TOKEN, abi: nijiTokenAbi, functionName: 'totalSupply' }),
    publicClient.readContract({ address: NIJI_TOKEN, abi: nijiTokenAbi, functionName: 'ownerOf', args: [nounId] }),
  ]);
  log('post-settle NFT balance(bidder)', postBalance.toString());
  log('post-settle totalSupply', totalSupply.toString());
  log('ownerOf(nounId)', ownerNoun);

  const nftMintedToBidder = ownerNoun.toLowerCase() === account.address.toLowerCase();
  const balanceIncreased = postBalance > preBalance;
  log('NFT mint verified', nftMintedToBidder && balanceIncreased ? 'YES' : 'NO');

  if (!nftMintedToBidder) {
    console.error(`FAIL: ownerOf(${nounId}) = ${ownerNoun}, expected bidder ${account.address}`);
    process.exit(1);
  }
  if (!balanceIncreased) {
    console.error(`FAIL: post-settle balance (${postBalance}) not > pre-settle balance (${preBalance})`);
    process.exit(1);
  }

  console.log('\n=== anvil e2e verify PASS ===');
  console.log(`fincode 決済 flow の chain-side (bid → settle → NFT mint) が anvil 上で完動確認`);
  console.log(`bid tx = ${bidHash}`);
  console.log(`settle tx = ${settleHash}`);
  console.log(`NFT owner = ${ownerNoun} (bidder)`);
}

main().catch((err) => {
  console.error('[verify-anvil-e2e] ERROR:', err.message);
  process.exit(1);
});
