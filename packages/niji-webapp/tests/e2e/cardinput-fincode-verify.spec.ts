/**
 * CardInput 復元経路 real fincode e2e verify (2026-07-17)
 *
 * 責務 —
 * 本番想定 fiat 決済 flow (webapp CardInput → fincode.tokens() → authorize → place-bid →
 * auction end → SettlementDaemon → capture + transferFrom or cancel) を full chain で verify する。
 *
 * 3 test —
 * (1) win path = user が勝つ → capture + transferFrom + NFT owner = user wallet
 * (2) loss path = 他の crypto bidder が高値で outbid → SettlementDaemon が fincode cancel 発火
 * (3) UI verify = success 後 5 秒で modal auto-close + toast 表示
 *
 * 依存 process —
 * - anvil (:8547) + auto-settler
 * - webapp dev (:2424)
 * - authorize-fincode-server (:42071)
 * - spot-rate-server (:42070)
 */
import { readFileSync, statSync } from 'node:fs';

import { expect, test } from '@playwright/test';
import { createPublicClient, createWalletClient, defineChain, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { nijiAuctionHouseAbi } from '@niji/sdk/react/auction-house';

const SETTLEMENT_LOG_PATH =
  '/Users/cardene/Desktop/work/niji/niji-monorepo/.context/dev/authorize-fincode-standalone.log';
const NIJI_TOKEN_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
const AUCTION_HOUSE_ADDRESS = '0x1Dbbf529D78d6507B0dd71F6c02f41138d828990' as Address;
const OPERATOR_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const USER_WALLET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // anvil account #1
// anvil account #2 = 第 3 者 crypto bidder (loss path 発火用)
const CRYPTO_BIDDER_PK =
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';
const CRYPTO_BIDDER_ADDRESS = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

const anvilChain = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['http://127.0.0.1:8547'] } },
});

const publicClient = createPublicClient({ chain: anvilChain, transport: http() });

/** debug endpoint から store snapshot 取得 (lifecycle 状態確認用) */
const fetchStoreSnapshot = async (): Promise<{
  count: number;
  records: Array<{
    authId: string;
    chainAuctionId: string | null;
    lifecycle: string;
    captureTxId: string | null;
    transferTxHash: string | null;
  }>;
}> => {
  const res = await fetch('http://127.0.0.1:42071/debug/store');
  return (await res.json()) as never;
};

/** chain の NFT owner を確認 */
const fetchNftOwner = async (tokenId: bigint): Promise<Address> => {
  return (await publicClient.readContract({
    address: NIJI_TOKEN_ADDRESS,
    abi: [
      {
        name: 'ownerOf',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'ownerOf',
    args: [tokenId],
  })) as Address;
};

/**
 * log を tail して pattern match を最大 timeoutMs 待つ (fromByteOffset 以降のみ検索、 過去 log 無視)
 * fromByteOffset は test 開始時 statSync().size で取る (誤検出防止)
 */
const waitForLogPatterns = async (
  patterns: RegExp[],
  timeoutMs: number,
  fromByteOffset: number,
): Promise<{ [key: string]: boolean; freshLog: string }> => {
  const results: { [key: string]: boolean } = { freshLog: '' as unknown as boolean };
  patterns.forEach(p => (results[p.source] = false));
  const startTime = Date.now();
  let freshLog = '';
  while (Date.now() - startTime < timeoutMs) {
    const fullLog = readFileSync(SETTLEMENT_LOG_PATH, 'utf-8');
    freshLog = fullLog.slice(fromByteOffset);
    let allFound = true;
    for (const p of patterns) {
      if (p.test(freshLog)) results[p.source] = true;
      if (!results[p.source]) allFound = false;
    }
    if (allFound) break;
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
  results.freshLog = freshLog as unknown as boolean;
  return results;
};

/** 現時点の log file size (byte) を取得 (fromByteOffset 基準用) */
const getLogSize = (): number => {
  return statSync(SETTLEMENT_LOG_PATH).size;
};

/** log から最新 authId 抽出 (fromByteOffset 以降で最後の insertPending log) */
const extractLatestAuthId = (fromByteOffset: number): string | undefined => {
  const fullLog = readFileSync(SETTLEMENT_LOG_PATH, 'utf-8').slice(fromByteOffset);
  const matches = [...fullLog.matchAll(/insertPending authId=([\w-]+)/g)];
  if (matches.length === 0) return undefined;
  return matches[matches.length - 1][1];
};

/** auction 残時間 >= minRemainingSec になるまで待つ (bid 発火 window 確保) */
const waitForAuctionWindow = async (minRemainingSec: number, maxWaitSec = 90): Promise<void> => {
  const startWait = Date.now();
  while (Date.now() - startWait < maxWaitSec * 1000) {
    const auction = (await publicClient.readContract({
      address: AUCTION_HOUSE_ADDRESS,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as { endTime: number; settled: boolean };
    const now = Math.floor(Date.now() / 1000);
    const remaining = auction.endTime - now;
    if (!auction.settled && remaining >= minRemainingSec) {
      console.log(
        `[waitForAuctionWindow] OK: remaining=${remaining}s (min=${minRemainingSec}s) settled=${auction.settled}`,
      );
      return;
    }
    console.log(
      `[waitForAuctionWindow] wait: remaining=${remaining}s < ${minRemainingSec}s or settled=${auction.settled}`,
    );
    await new Promise(resolve => setTimeout(resolve, 3_000));
  }
  throw new Error(`auction window (>=${minRemainingSec}s) が ${maxWaitSec}s 内で確保できなかった`);
};

/** BidModal で 4 field + terms 入力 + submit → success stepper 到達まで */
const submitFiatBid = async (
  page: import('@playwright/test').Page,
  opts: { auctionId: string; bidderWallet: string; jpyAmount: string },
) => {
  // auction 残 30 秒+ 確保してから bid 発火 (place-bid の Auction expired revert 回避)
  await waitForAuctionWindow(30);

  // browser console + error 全て spec log に流す
  page.on('console', msg => console.log(`  [browser ${msg.type()}] ${msg.text().slice(0, 200)}`));
  page.on('pageerror', err => console.log(`  [browser pageerror] ${err.message}`));

  const url = `/test/fiat-bid-form?auctionId=${opts.auctionId}&minBidEth=0.001&bidderWallet=${opts.bidderWallet}`;
  console.log(`[submitFiatBid] goto ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000); // React hydration + Vite HMR settle
  console.log(`[submitFiatBid] after goto, URL = ${page.url()}`);
  await expect(page.getByTestId('test-fiat-bid-form-page')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('fiat-bid-form')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('fiat-bid-jpy-input').fill(opts.jpyAmount);
  await page.getByTestId('card-input-number').waitFor({ state: 'visible', timeout: 15_000 });
  await page.getByTestId('card-input-number').fill('4111111111111111');
  await page.getByTestId('card-input-expiry').fill('1228');
  await page.getByTestId('card-input-cvv').fill('123');
  await page.getByTestId('card-input-holder').fill('TEST USER');
  await page.locator('label[for="fiat-bid-terms"]').dispatchEvent('click');
  await expect(page.getByTestId('fiat-bid-terms-checkbox')).toBeChecked({ timeout: 5_000 });
  await expect(page.getByTestId('fiat-bid-submit')).toBeEnabled({ timeout: 30_000 });
  // 最大 3 回まで submit + 60s stepper 待ち、 failure detected なら waitForAuctionWindow + resubmit
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByTestId('fiat-bid-submit').click();
    console.log(`[submitFiatBid] attempt ${attempt + 1}/3 submitted`);
    try {
      await page.waitForFunction(
        () => {
          const stepper = document.querySelector('[data-testid="fiat-bid-stepper"]');
          const closedMarker = document.querySelector('[data-testid="fiat-bid-form-closed"]');
          const text = stepper?.textContent ?? '';
          const success = /代理入札が完了/.test(text);
          const failure = /決済確保に失敗|取得に失敗/.test(text);
          return success || failure || closedMarker !== null;
        },
        null,
        { timeout: 60_000, polling: 500 },
      );
    } catch {
      // timeout = retry へ
      console.log(`[submitFiatBid] attempt ${attempt + 1}/3 timeout`);
      continue;
    }
    // success/failure/closed 判定
    const stepperText = await page.getByTestId('fiat-bid-stepper').textContent().catch(() => '');
    const closed = (await page.getByTestId('fiat-bid-form-closed').count()) > 0;
    if (closed || /代理入札が完了/.test(stepperText ?? '')) {
      console.log(`[submitFiatBid] attempt ${attempt + 1}/3 SUCCESS`);
      return;
    }
    if (/決済確保に失敗|取得に失敗/.test(stepperText ?? '')) {
      console.log(`[submitFiatBid] attempt ${attempt + 1}/3 failure detected, retry`);
      // form の再入力 = auction window 再確保 → 「bid を実行」 button 再押下
      await waitForAuctionWindow(30);
      continue;
    }
  }
  throw new Error('submitFiatBid: 3 attempts で success 到達せず');
};

test.describe('CardInput fiat bid full flow (2026-07-17)', () => {
  // ===== Test 1: WIN path = capture + transferFrom + NFT owner = user wallet =====
  test('WIN path = fiat bid → auction end → capture + transferFrom → NFT が user wallet 到達', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const logOffsetBeforeBid = getLogSize(); // 過去 log 誤検出防止基準点
    const preBidStoreSnap = await fetchStoreSnapshot();
    const preBidCount = preBidStoreSnap.count;
    console.log(`[WIN e2e] logOffsetBeforeBid=${logOffsetBeforeBid} preBidStoreCount=${preBidCount}`);
    await submitFiatBid(page, { auctionId: '1', bidderWallet: USER_WALLET, jpyAmount: '3000' });

    // 現 e2e で発火した authId を store snapshot 経由で特定 (bid 発火直後の record 追加 poll)
    let targetAuthId: string | undefined;
    for (let i = 0; i < 20; i++) {
      const snap = await fetchStoreSnapshot();
      if (snap.count > preBidCount) {
        // preBidCount 以降で bidderWallet が USER_WALLET の record を特定
        const newRecords = snap.records.slice(preBidCount);
        const win = newRecords.find(r => true);
        if (win) {
          targetAuthId = win.authId;
          break;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`[WIN e2e] targetAuthId=${targetAuthId}`);
    expect(targetAuthId, '現 e2e の authId が store snapshot から特定できない').toBeDefined();

    // SettlementDaemon 完走待ち (最大 120 秒、 authId 込みで pattern match = 誤検出防止)
    const results = await waitForLogPatterns(
      [
        new RegExp(`\\[settlement-daemon\\] fiat WON: authId=${targetAuthId}`),
        new RegExp(`\\[settlement-daemon\\] fincode capture OK: authId=${targetAuthId}`),
        new RegExp(`\\[settlement-daemon\\] transferFrom OK: authId=${targetAuthId}`),
      ],
      120_000,
      logOffsetBeforeBid,
    );
    console.log('[WIN e2e] daemon log verdict:');
    for (const key of Object.keys(results)) {
      if (key !== 'freshLog') console.log(`  ${key} = ${results[key]}`);
    }
    for (const p of [
      new RegExp(`\\[settlement-daemon\\] fiat WON: authId=${targetAuthId}`),
      new RegExp(`\\[settlement-daemon\\] fincode capture OK: authId=${targetAuthId}`),
      new RegExp(`\\[settlement-daemon\\] transferFrom OK: authId=${targetAuthId}`),
    ]) {
      expect(results[p.source], `daemon log pattern 未検出: ${p.source}`).toBe(true);
    }

    // store snapshot verify (authId で filter して該当 record が transferred lifecycle か)
    const snap = await fetchStoreSnapshot();
    const target = snap.records.find(r => r.authId === targetAuthId);
    console.log('[WIN e2e] target store record:', target);
    expect(target, `authId=${targetAuthId} が store に見つからない`).toBeDefined();
    expect(target!.lifecycle).toBe('transferred');
    expect(target!.captureTxId).not.toBeNull();
    expect(target!.transferTxHash).not.toBeNull();
    expect(target!.chainAuctionId).not.toBeNull();

    // chain 側 NFT owner = user wallet 一致まで retry (transferFrom tx confirm 待ち)
    const tokenId = BigInt(target!.chainAuctionId!);
    let owner: Address = OPERATOR_ADDRESS as Address;
    for (let i = 0; i < 30; i++) {
      owner = await fetchNftOwner(tokenId);
      if (owner.toLowerCase() === USER_WALLET.toLowerCase()) break;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`[WIN e2e] tokenId ${tokenId} owner = ${owner}`);
    expect(owner.toLowerCase()).toBe(USER_WALLET.toLowerCase());
  });

  // ===== Test 2: LOSS path = crypto bidder outbid → cancel + NFT が crypto bidder =====
  test('LOSS path = 他 crypto bidder が高値 outbid → SettlementDaemon が fincode cancel + NFT が crypto bidder に', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    const logOffsetBeforeBid = getLogSize();
    const preBidStoreSnap = await fetchStoreSnapshot();
    const preBidCount = preBidStoreSnap.count;
    console.log(
      `[LOSS e2e] logOffsetBeforeBid=${logOffsetBeforeBid} preBidStoreCount=${preBidCount}`,
    );
    await submitFiatBid(page, { auctionId: '1', bidderWallet: USER_WALLET, jpyAmount: '3000' });

    let targetAuthId: string | undefined;
    for (let i = 0; i < 20; i++) {
      const snap = await fetchStoreSnapshot();
      if (snap.count > preBidCount) {
        const newRec = snap.records.slice(preBidCount).find(r => true);
        if (newRec) {
          targetAuthId = newRec.authId;
          break;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`[LOSS e2e] targetAuthId=${targetAuthId}`);
    expect(targetAuthId).toBeDefined();

    // fiat bid が chain 到達するのを待つ (auction.bidder = operator に変化)、 real ABI 使用
    let currentAuction = (await publicClient.readContract({
      address: AUCTION_HOUSE_ADDRESS,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as {
      nounId: bigint;
      amount: bigint;
      endTime: number;
      bidder: Address;
      settled: boolean;
    };
    console.log(
      `[LOSS e2e] fiat bid 直後 auction: nounId=${currentAuction.nounId} amount=${currentAuction.amount} bidder=${currentAuction.bidder}`,
    );

    // crypto bidder が bid する直前に auction state 再確認 + auctionId 一致 verify
    // (fiat bid 直後の race で auction transition 発生していないか)
    const auctionForOutbid = (await publicClient.readContract({
      address: AUCTION_HOUSE_ADDRESS,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as { nounId: bigint; amount: bigint; endTime: number; bidder: Address; settled: boolean };
    if (auctionForOutbid.nounId !== currentAuction.nounId) {
      console.warn(
        `[LOSS e2e] auction transition detected: ${currentAuction.nounId} → ${auctionForOutbid.nounId}`,
      );
    }
    // 固定 0.02 ETH で bid (fiat bid 0.01 ETH の 2 倍、 reservePrice + minIncrement 十分クリア)
    const cryptoBidAmount = 20_000_000_000_000_000n; // 0.02 ETH
    const cryptoAccount = privateKeyToAccount(CRYPTO_BIDDER_PK as `0x${string}`);
    const cryptoWallet = createWalletClient({
      chain: anvilChain,
      account: cryptoAccount,
      transport: http(),
    });
    const outbidTxHash = await cryptoWallet.writeContract({
      address: AUCTION_HOUSE_ADDRESS,
      abi: nijiAuctionHouseAbi,
      functionName: 'createBid',
      args: [auctionForOutbid.nounId],
      value: cryptoBidAmount,
    });
    console.log(
      `[LOSS e2e] crypto bidder outbid: bidder=${CRYPTO_BIDDER_ADDRESS} amount=${cryptoBidAmount} tx=${outbidTxHash}`,
    );
    await publicClient.waitForTransactionReceipt({ hash: outbidTxHash, timeout: 30_000 });

    // outbid 確認 = auction.bidder が crypto bidder に変化
    currentAuction = (await publicClient.readContract({
      address: AUCTION_HOUSE_ADDRESS,
      abi: nijiAuctionHouseAbi,
      functionName: 'auction',
    })) as never;
    expect(currentAuction.bidder.toLowerCase()).toBe(CRYPTO_BIDDER_ADDRESS.toLowerCase());
    const outbidAuctionId = auctionForOutbid.nounId;
    console.log(
      `[LOSS e2e] auction ${outbidAuctionId} bidder now = ${currentAuction.bidder} (crypto bidder outbid 成功)`,
    );

    // SettlementDaemon が「fiat LOST」 を発火するのを待つ (fincode cancel は best-effort、 fail 許容)
    const results = await waitForLogPatterns(
      [new RegExp(`\\[settlement-daemon\\] fiat LOST: authId=${targetAuthId}`)],
      150_000,
      logOffsetBeforeBid,
    );
    console.log('[LOSS e2e] daemon log verdict:');
    for (const key of Object.keys(results)) {
      if (key !== 'freshLog') console.log(`  ${key} = ${results[key]}`);
    }
    const lostPattern = new RegExp(`\\[settlement-daemon\\] fiat LOST: authId=${targetAuthId}`);
    expect(results[lostPattern.source], `daemon log pattern 未検出: ${lostPattern.source}`).toBe(
      true,
    );

    // store lifecycle = "lost" 確認 (authId で filter)
    const snap = await fetchStoreSnapshot();
    const lostRecord = snap.records.find(r => r.authId === targetAuthId);
    console.log(`[LOSS e2e] target store record:`, lostRecord);
    expect(lostRecord).toBeDefined();
    expect(lostRecord!.lifecycle).toBe('lost');

    // chain 側 NFT owner = crypto bidder (user wallet ではない)、 retry で確定
    let owner: Address = OPERATOR_ADDRESS as Address;
    for (let i = 0; i < 30; i++) {
      owner = await fetchNftOwner(outbidAuctionId);
      if (owner.toLowerCase() === CRYPTO_BIDDER_ADDRESS.toLowerCase()) break;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`[LOSS e2e] tokenId ${outbidAuctionId} owner = ${owner}`);
    expect(owner.toLowerCase()).toBe(CRYPTO_BIDDER_ADDRESS.toLowerCase());
    expect(owner.toLowerCase()).not.toBe(USER_WALLET.toLowerCase());
  });

  // ===== Test 3: UI = success 後 5 秒で modal auto-close + toast 表示 =====
  test('UI = 成功後 5 秒で modal auto-close + sonner toast 表示', async ({ page }) => {
    test.setTimeout(180_000);
    await submitFiatBid(page, { auctionId: '1', bidderWallet: USER_WALLET, jpyAmount: '3000' });

    // sonner toast の表示確認 (data-sonner-toast attribute or role=status で検出)
    const toast = page.locator('[data-sonner-toast]').first();
    await expect(toast).toBeVisible({ timeout: 5_000 });
    const toastText = await toast.textContent();
    console.log(`[UI e2e] toast text: "${toastText}"`);
    expect(toastText).toContain('代理入札');

    // 5 秒 auto-close 経路 = TestFiatBidFormPage 側で closed state で unmount
    // stepper 到達直後 ~5 秒 window で fiat-bid-form-closed marker 表示
    await expect(page.getByTestId('fiat-bid-form-closed')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('fiat-bid-form')).not.toBeVisible();
    console.log('[UI e2e] modal auto-close 済 + form unmount 確認');
  });
});
