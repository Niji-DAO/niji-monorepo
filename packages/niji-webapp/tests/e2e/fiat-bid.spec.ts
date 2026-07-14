/**
 * Phase 1 fiat bid e2e (Issue #3011 Phase C、 Issue #3069 で TC-FB10 activate、
 *                        Issue #3071 で TC-FB20-44 拡張)
 *
 * 責務 —
 * (1) 特商法 static page (/legal/tokushoho) の描画 + footer link 遷移経路 (TC-FB01-05)
 * (2) Phase 1 golden path 前半 (wallet 接続 → クレカ tab → 与信枠 authorize mock → 3DS mock success →
 *     bid tx broadcast → NijiAuctionHouseV3.BidPlaced event assert、 TC-FB10)
 * (3) validation edge case (TC-FB20-24) — ETH 額 min / bid 上限 / Terms 未同意 /
 *     wallet 未接続 / 空入力
 * (4) 3DS mock error path (TC-FB30-31) — 3DS fail / authorize 5xx
 * (5) testcard 切替 (TC-FB40-44) — VISA / Master / JCB / AMEX / 3DS Success-Fail
 *
 * 実行環境 —
 * global-setup.ts で anvil 8547 + deploy-niji-full + spot-rate independent server (port 42070) が
 * 起動 (Issue #3069)。 fiat-bid endpoint (authorize / 3ds-callback) は Ponder 側 (port 42069)
 * を e2e に組込むと build error で応答不能のため、 Playwright page.route() で e2e 内 mock する
 * (helpers/fiat-bid.ts に SSOT 化、 Issue #3071)。 spot-rate は Ponder 非依存で
 * 実 integration test 経路 = USE_SPOT_RATE_MOCK=true で 500000 JPY/ETH 固定応答。
 *
 * bid tx broadcast は Node.js 内 viem client で anvil に直接 createBid tx を issue、
 * BidPlaced (=AuctionBid) event が anvil に emit されることを chain 上で assert する。
 * これは backend の BidRelay 経路 (別 process の運営 EOA が place-bid endpoint 応答時に tx 発火) と
 * 同 shape で anvil 状態を進める。
 *
 * flaky 対策 —
 * playwright.config.ts で retries: 2 (Issue #3069)、 external state = spot-rate mock + kiwa wallet
 * inject の依存で偶発 flaky を許容、 fail 時 log は trace + screenshot で残す。
 *
 * scope 外 (Issue #3071 で defer 判定) —
 * - TC-FB32 3DS timeout 10 分 — ThreeDSReturn に `status='timeout'` 分岐は enum 上あるが
 *   実 timeout 検出 logic (setTimeout / setInterval) が存在せず fake timer 経路単独では
 *   UI 遷移を trigger できないため defer。 backend 側 fiat_bid timeout handler の integration test 経路が要る。
 * - TC-FB33 GMO alterTran cancel retry 3 回 — capture 経路 (Phase 3 scope 外) の backend logic、
 *   UI e2e で直接 verify する経路がない。 backend 統合 test で cover 済。
 * - TC-FB34 spot rate 2% 超乖離時再確認 modal — 該当 UI/hook が現行実装に不在 (useSpotRate は
 *   単 rate 取得のみ、 authorize 応答内 spotRate との差分 gate は Phase 2 以降の scope)。
 *
 * SSOT —
 * - tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5, P8
 * - tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md § Issue 8 Phase C
 * - GH Issue #3069 (TC-FB10 activate)
 * - GH Issue #3071 (Phase B/C/D 拡張)
 */
import { dappE2eTest as baseTest } from '@kiwa-test/core';
import { expect } from '@playwright/test';
import { createWalletClient, http, parseAbi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { ADDRESSES, ANVIL_KEYS, anvil, publicClient } from './helpers/chain';
import {
  connectWalletAndWaitForBid,
  mockAllFiatBidEndpoints,
  mockFiatBidAuthorize,
  openBidModalAndSwitchToFiat,
} from './helpers/fiat-bid';

/**
 * kiwa の `_anvilHandle` fixture を override して global-setup の anvil (8547) を再利用する。
 *
 * kiwa default は `startAnvil()` で毎 test 新規 anvil を spawn するが、
 * Niji e2e は global-setup で deploy 済 anvil を全 test 共有する設計。
 * `_anvilHandle` を stub して 8547 port を返せば、 kiwa の eth_sendTransaction は
 * 8547 anvil に forward され、 wagmi injected provider 経由の bid tx が deploy 済
 * NijiAuctionHouseV3 に届く。
 */
const test = baseTest.extend<{ _anvilHandle: { port: number; stop: () => Promise<void> } }>({
  _anvilHandle: async ({}, use) => {
    // `use` は Playwright fixture の callback 名 (React hook ではない、 rule false positive)。
    // stop は no-op (global-teardown が 8547 anvil を kill 責務、 test 毎の stop は不要)。
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ port: 8547, stop: async () => {} });
  },
});

test.describe('特商法 page 描画 + footer link 経路 (Phase 1 実装完了)', () => {
  test('TC-FB01 /legal/tokushoho が 200 で返る', async ({ page }) => {
    const res = await page.goto('/legal/tokushoho');
    expect(res?.status()).toBe(200);
  });

  test('TC-FB02 /legal/tokushoho に h1 "特定商取引法に基づく表記" が描画', async ({ page }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: '特定商取引法に基づく表記' }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test('TC-FB03 /legal/tokushoho に 8 項目 (販売者名 / 所在地 / 電話番号 / 代表者 / 販売価格 / 支払方法 / 商品引渡時期 / 返品ポリシー) が描画', async ({
    page,
  }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await expect(page.getByTestId('legal-tokushoho')).toBeVisible({ timeout: 15_000 });

    const labels = [
      '販売者名',
      '所在地',
      '電話番号',
      '代表者',
      '販売価格',
      '支払方法',
      '商品引渡時期',
      '返品ポリシー',
    ];
    for (const label of labels) {
      await expect(page.getByText(label).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('TC-FB04 販売者情報 4 項目に [TODO: Phase 3 本番切替時 user 確認] marker が明記', async ({
    page,
  }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const placeholders = page.getByTestId('tokushoho-placeholder');
    await expect(placeholders).toHaveCount(4);
    // 少なくとも 1 件は TODO marker を持つ (残りは同じ marker を共有)
    await expect(placeholders.first()).toContainText('TODO: Phase 3 本番切替時 user 確認');
  });

  test('TC-FB05 footer から /legal/tokushoho link が click 可能で遷移する', async ({ page }) => {
    await page.goto('/');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const footerLink = page.locator('footer a[href="/legal/tokushoho"]').first();
    await expect(footerLink).toBeVisible({ timeout: 10_000 });
    await footerLink.click();

    await page.waitForURL(/\/legal\/tokushoho$/, { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: '特定商取引法に基づく表記' }),
    ).toBeVisible({ timeout: 15_000 });
  });
});

/**
 * Phase 1 fiat bid golden path 前半 (Issue #3069 で activate)
 *
 * 8 step 分解 —
 *   step 1 = page.goto('/'), kiwa fixture で wallet inject (deployer = ANVIL_KEYS.deployer)
 *   step 2 = 「Bid」 button click → BidModal open → 「クレカで払う (JPY)」 tab click
 *   step 3 = ETH input に 0.02 入力 → JPY 換算「約 10,000 円」 表示 confirm
 *   step 4 = テストカード VISA default プリフィル (dev env) + Terms checkbox 同意
 *   step 5 = 「bid を実行」 click → 与信枠 authorize mock (page.route) 200 → 3DS mock URL に redirect
 *   step 6 = 3DS mock 「認証成功」 link click → /fiat-bid/3ds-return → 3ds-callback mock で 3ds-verified
 *   step 7 = anvil に createBid tx を viem client 経由で broadcast (backend BidRelay 経路と同 shape)
 *   step 8 = NijiAuctionHouseV3.AuctionBid event を anvil chain で assert
 *
 * 落札後経路 (capture → transferFrom) は TC-FB11 として分離 (Phase 3 で activate、 本 PR scope 外)。
 */
test.describe('Phase 1 fiat bid golden path 前半 (bid tx broadcast まで、 Issue #3069)', () => {
  test('TC-FB10 wallet 接続 → クレカ tab → 与信枠 mock → 3DS mock success → bid tx broadcast → BidPlaced event assert', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(120_000);

    // ============================================================================================
    // 準備: 現 auction の state を snapshot、 event assert 用の abi + minimal wallet client を用意
    // ============================================================================================
    const auctionAbi = parseAbi([
      'function auctionStorage() view returns (uint96 nounId, uint32 clientId, uint128 amount, uint40 startTime, uint40 endTime, address bidder, bool settled)',
      'function reservePrice() view returns (uint192)',
      'function minBidIncrementPercentage() view returns (uint8)',
      'function createBid(uint256 nounId) payable',
      'event AuctionBid(uint256 indexed nounId, address indexed sender, uint256 value, bool extended)',
    ]);
    const [initialNounId, , initialAmount] = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'auctionStorage',
    })) as readonly [bigint, number, bigint, number, number, `0x${string}`, boolean];

    // ============================================================================================
    // page.route mock 3 種 (authorize / 3ds-callback / 3DS 画面 HTML) を SSOT helper 経由で set up
    // ============================================================================================
    await mockAllFiatBidEndpoints(page, {
      authorize: { authId: 'mock-access-e2e-fb10' },
    });

    // ============================================================================================
    // step 1 = auction top page に goto、 kiwa 経路で wallet 接続まで完遂 (SSOT helper 経由)
    // ============================================================================================
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);

    // ============================================================================================
    // step 2 = BidModal open + fiat tab 切替 + spot rate 取得完了まで一括
    // ============================================================================================
    await openBidModalAndSwitchToFiat(page);

    // ============================================================================================
    // step 3 = ETH input 0.02 → JPY 換算「約 10,000 円」 (0.02 × 500000 = 10,000)
    // ============================================================================================
    await page.getByTestId('fiat-bid-eth-input').fill('0.02');
    await expect(page.getByTestId('fiat-bid-jpy-display')).toContainText('約 10,000 円', {
      timeout: 5_000,
    });

    // ============================================================================================
    // step 4 = Terms checkbox 同意 (VISA default プリフィルは isDev で自動反映済、 Issue #3047)
    // ============================================================================================
    await page.getByTestId('fiat-bid-terms-checkbox').check();

    // ============================================================================================
    // step 5 = 「bid を実行」 click → /authorize mock 200 → tds2Url に redirect
    // useFiatBid.authorize が /api/v1/fiat-bid/authorize を叩き、 mock response で tds2Url を受領。
    // localStorage `niji.fiat-bid.pending` に authId 保存後、 window.location.href = tds2Url で full redirect。
    // ============================================================================================
    const submitButton = page.getByTestId('fiat-bid-submit');
    await expect(submitButton).toBeEnabled({ timeout: 10_000 });
    await submitButton.click();

    // ============================================================================================
    // step 6 = 3DS mock 画面 (mockFiatBid3dsPage) の「認証成功」 link click →
    //         /fiat-bid/3ds-return → ThreeDSReturn が /3ds-callback (mock) を叩き 3ds-verified
    // ============================================================================================
    await page.waitForURL(/127\.0\.0\.1:2426\/mock-3ds/, { timeout: 15_000 });
    const successLink = page.locator('#mock-3ds-success');
    await expect(successLink).toBeVisible({ timeout: 5_000 });
    await successLink.click();

    await page.waitForURL(/\/fiat-bid\/3ds-return/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: '認証が完了しました', exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    // ============================================================================================
    // step 7 = anvil に createBid tx を viem client で broadcast (backend BidRelay と同 shape)。
    // ============================================================================================
    const reservePrice = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'reservePrice',
    })) as bigint;
    const minIncPct = (await publicClient.readContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'minBidIncrementPercentage',
    })) as number;
    // 現 amount + increment% 以上、 reservePrice 未満で fallback、 0.02 ETH 最低保証
    const nextMinBid =
      initialAmount === 0n
        ? reservePrice > 0n
          ? reservePrice
          : 10_000_000_000_000_000n
        : (initialAmount * (BigInt(minIncPct) + 100n)) / 100n + 1n;
    const bidValue = nextMinBid < 20_000_000_000_000_000n ? 20_000_000_000_000_000n : nextMinBid;

    const deployerAccount = privateKeyToAccount(ANVIL_KEYS.deployer);
    const deployerClient = createWalletClient({
      account: deployerAccount,
      chain: anvil,
      transport: http(),
    });
    const bidTxHash = await deployerClient.writeContract({
      address: ADDRESSES.AuctionHouseProxy,
      abi: auctionAbi,
      functionName: 'createBid',
      args: [initialNounId],
      value: bidValue,
    });

    // ============================================================================================
    // step 8 = anvil 上で NijiAuctionHouseV3 の AuctionBid event を assert
    // ============================================================================================
    const receipt = await publicClient.waitForTransactionReceipt({ hash: bidTxHash });
    expect(receipt.status).toBe('success');

    const events = parseEventLogs({
      abi: auctionAbi,
      eventName: 'AuctionBid',
      logs: receipt.logs,
    });
    expect(events.length, 'AuctionBid event が emit されている').toBeGreaterThan(0);
    const bidEvent = events[0];
    expect(bidEvent.args.nounId, 'AuctionBid.nounId が現 auction 対象と一致').toBe(initialNounId);
    expect(bidEvent.args.sender.toLowerCase(), 'AuctionBid.sender が operator (deployer)').toBe(
      deployerAccount.address.toLowerCase(),
    );
    expect(bidEvent.args.value, 'AuctionBid.value が送信 bidValue と一致').toBe(bidValue);
  });
});

/**
 * Phase B validation edge case (Issue #3071)
 *
 * FiatBidForm の validation (validateEthAmount SSOT、 FiatBidForm.tsx L90-120) を
 * 実 browser 実行で verify する。 unit test (FiatBidForm.test.tsx) で pure logic は cover 済、
 * 本 test は wagmi + spot rate + form state の統合 pass 経路を確認する。
 *
 * spot rate = 500000 JPY/ETH 固定 (USE_SPOT_RATE_MOCK=true、 global-setup)。
 */
test.describe('Phase B fiat bid validation edge case (Issue #3071)', () => {
  test('TC-FB20 ETH 額 < min-bid で「minimum bid X ETH 以上を入力してください」 error 表示', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    await mockAllFiatBidEndpoints(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    // 極小値 (0.000001 ETH = 0.5 円) を入力 → min-bid ETH (≥ reservePrice) 未満で validation fail
    // 現 auction reservePrice = 0.01-0.05 ETH 前後の deploy 設定、 0.000001 は確実に下限未満
    await page.getByTestId('fiat-bid-eth-input').fill('0.000001');

    // 「minimum bid X ETH 以上を入力してください」 の error prefix を verify (X は動的値)
    const ethError = page.getByTestId('fiat-bid-eth-error');
    await expect(ethError).toBeVisible({ timeout: 5_000 });
    await expect(ethError).toContainText(/minimum bid .* ETH 以上を入力してください/);

    // submit button も disabled 状態を verify
    await page.getByTestId('fiat-bid-terms-checkbox').check();
    await expect(page.getByTestId('fiat-bid-submit')).toBeDisabled();
  });

  test('TC-FB21 ETH × spot rate > 100 万円で「bid 上限 1,000,000 円を超えています」 error 表示', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    await mockAllFiatBidEndpoints(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    // 3 ETH × 500000 JPY/ETH = 1,500,000 円 > 100 万円上限
    await page.getByTestId('fiat-bid-eth-input').fill('3');

    const ethError = page.getByTestId('fiat-bid-eth-error');
    await expect(ethError).toBeVisible({ timeout: 5_000 });
    await expect(ethError).toContainText('bid 上限 1,000,000 円を超えています');

    await page.getByTestId('fiat-bid-terms-checkbox').check();
    await expect(page.getByTestId('fiat-bid-submit')).toBeDisabled();
  });

  test('TC-FB22 Terms 未同意で submit button disabled (ETH + card 有効でも block)', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    await mockAllFiatBidEndpoints(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    // ETH は有効値 0.02 (0.02 × 500000 = 10,000 円、 上限内)
    await page.getByTestId('fiat-bid-eth-input').fill('0.02');
    // dev env で VISA default カードプリフィル済、 card は valid
    // Terms checkbox は 未チェックのまま
    const termsCheckbox = page.getByTestId('fiat-bid-terms-checkbox');
    await expect(termsCheckbox).not.toBeChecked();

    const submit = page.getByTestId('fiat-bid-submit');
    await expect(submit).toBeDisabled();

    // Terms 同意すると enable に遷移 (positive check、 disable 起因が Terms 単独と確認)
    await termsCheckbox.check();
    await expect(submit).toBeEnabled({ timeout: 5_000 });
  });

  test('TC-FB23 wallet 未接続時に Bid button は disabled + tooltip「wallet 接続が必要です」', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // ConnectKit の Connect button を click しない = disconnected state 維持
    // Bid ボタンは disabled 状態の wrapper 経由で描画 (`components/Bid/index.tsx:107-121`)
    const wrapper = page.getByTestId('bid-open-button-wrapper');
    await expect(wrapper).toBeVisible({ timeout: 15_000 });

    // wrapper 内の Bid button 自体は disabled
    const disabledBidButton = wrapper.getByTestId('bid-open-button');
    await expect(disabledBidButton).toBeDisabled();

    // hover で Tooltip content 「wallet 接続が必要です」 が表示される
    await wrapper.hover();
    await expect(page.getByText('wallet 接続が必要です')).toBeVisible({ timeout: 5_000 });

    // click しても BidModal は open されない (disabled state)
    await disabledBidButton.click({ force: true }).catch(() => {
      // force click しても disabled は firing しない、 catch は防御
    });
    await expect(page.getByTestId('bid-modal')).toHaveCount(0);
  });

  test('TC-FB24 ETH 空入力で submit disable + validation error は表示せず (未入力は untouched 扱い)', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    await mockAllFiatBidEndpoints(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    // ETH 未入力 (default = '')
    const ethInput = page.getByTestId('fiat-bid-eth-input');
    await expect(ethInput).toHaveValue('');

    // Terms 同意 (validation の他要因を排除)
    await page.getByTestId('fiat-bid-terms-checkbox').check();

    // 空入力時は validation error UI を表示しない (`FiatBidForm.tsx:439` 条件 = ethRaw !== ''、
    // 未入力 = 「まだ user が触っていない」 と扱う UX)
    await expect(page.getByTestId('fiat-bid-eth-error')).toHaveCount(0);

    // submit は disabled (`submitDisabled` の !ethValidation.ok 条件で block)
    await expect(page.getByTestId('fiat-bid-submit')).toBeDisabled();

    // 一度 入力して → 消すと error は非表示に戻る (untouched 判定は「現在の値」 で行う)
    await ethInput.fill('0.02');
    await ethInput.fill('');
    await expect(page.getByTestId('fiat-bid-eth-error')).toHaveCount(0);
    await expect(page.getByTestId('fiat-bid-submit')).toBeDisabled();
  });
});

/**
 * Phase C 3DS / GMO mock error path (Issue #3071)
 *
 * 3DS 認証 fail (TC-FB30) と GMO authorize endpoint 5xx (TC-FB31) の 2 経路を実 browser 実行で verify。
 *
 * scope 外 = TC-FB32 3DS timeout (fake timer 単独で trigger 不可、 backend timeout handler の
 * integration test 経路が要る) / TC-FB33 alterTran cancel retry (capture 経路 = Phase 3 scope 外) /
 * TC-FB34 spot rate 2% 乖離時 modal (UI/hook 未実装、 上記 file header § scope 外 参照)。
 */
test.describe('Phase C fiat bid 3DS / GMO error path (Issue #3071)', () => {
  test('TC-FB30 3DS mock fail link click → ThreeDSReturn 「認証に失敗しました」 heading 表示', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(120_000);
    // 3DS callback を cancelled status で mock (fail path 経路)
    // 3DS mock 画面には fail link を含めて描画 (includeFailButton: true)
    await mockAllFiatBidEndpoints(page, {
      authorize: { authId: 'mock-access-e2e-fb30' },
      callback: { status: 'cancelled', authId: 'mock-access-e2e-fb30' },
      threeDsPage: { includeFailButton: true },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    await page.getByTestId('fiat-bid-eth-input').fill('0.02');
    await page.getByTestId('fiat-bid-terms-checkbox').check();
    await page.getByTestId('fiat-bid-submit').click();

    // 3DS mock 画面遷移 → fail link click
    await page.waitForURL(/127\.0\.0\.1:2426\/mock-3ds/, { timeout: 15_000 });
    const failLink = page.locator('#mock-3ds-fail');
    await expect(failLink).toBeVisible({ timeout: 5_000 });
    await failLink.click();

    // /fiat-bid/3ds-return に遷移 → 3ds-callback mock で cancelled 応答 →
    // ThreeDSReturn が failure branch (`ThreeDSReturn.tsx:204-212`) を表示
    await page.waitForURL(/\/fiat-bid\/3ds-return/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: '認証に失敗しました', exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    // 「auction に戻る」 button が render (recover 経路が user に提示される)
    await expect(page.getByRole('button', { name: 'auction に戻る' })).toBeVisible();
  });

  test('TC-FB31 GMO authorize endpoint 5xx → useFiatBid failure step → error message 表示', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    // authorize を 500 で mock (5xx 系 error path)
    await mockFiatBidAuthorize(page, {
      status: 500,
      errorBody: { error: 'GmoUpstreamError', message: 'GMO API upstream 5xx (mock)' },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    await page.getByTestId('fiat-bid-eth-input').fill('0.02');
    await page.getByTestId('fiat-bid-terms-checkbox').check();
    await page.getByTestId('fiat-bid-submit').click();

    // useFiatBid.authorize catch branch で step = 'failure' に遷移、
    // FiatBidForm の error message UI (`FiatBidForm.tsx:577-581`) に error text が表示
    const errorBox = page.getByTestId('fiat-bid-error-message');
    await expect(errorBox).toBeVisible({ timeout: 15_000 });
    // error text は「authorize failed: GmoUpstreamError — GMO API upstream 5xx (mock)」 形式
    await expect(errorBox).toContainText('authorize failed');
    await expect(errorBox).toContainText('GmoUpstreamError');

    // stepper が failure step で描画される (`FiatBidForm.tsx:565`)
    const stepper = page.getByTestId('fiat-bid-stepper');
    await expect(stepper).toHaveAttribute('data-step', 'failure', { timeout: 5_000 });

    // 3DS 画面には遷移していない (URL は元 auction top のまま)
    expect(page.url()).not.toContain('mock-3ds');
  });
});

/**
 * Phase D テストカード切替 (Issue #3071)
 *
 * dev env の CardInput dropdown (`components/FiatBidModal/CardInput.tsx:246-259`) で
 * VISA / Master / JCB / AMEX / 3DS Success / 3DS Fail を切替、 brand icon 表示 +
 * CVV placeholder 桁数 + card 番号 display が正しく更新されることを verify。
 *
 * dev env 判定 = isDev = import.meta.env.DEV (webapp が pnpm dev の Vite dev server 起動時 true、
 * e2e は Playwright が dev server を叩く経路なので default true)。
 */
test.describe('Phase D fiat bid testcard 切替 (Issue #3071)', () => {
  const testcardCases: {
    /** dropdown 選択 key */
    key: string;
    /** brand icon 表示テキスト (`CardInput.tsx:127-138` brandLabel SSOT) */
    brand: string;
    /** CVV placeholder 桁数期待値 (`CardInput.tsx:318` brand === 'amex' ? '1234' : '123') */
    cvvPlaceholder: string;
    /** card 番号 formatted display 期待 prefix (先頭 4 桁で match) */
    numberPrefix: string;
    /** data-brand 属性期待値 (`CardInput.tsx:220`) */
    brandAttr: string;
  }[] = [
    {
      key: 'visa',
      brand: 'VISA',
      cvvPlaceholder: '123',
      numberPrefix: '4111',
      brandAttr: 'visa',
    },
    {
      key: 'master',
      brand: 'Master',
      cvvPlaceholder: '123',
      numberPrefix: '5111',
      brandAttr: 'mastercard',
    },
    {
      key: 'jcb',
      brand: 'JCB',
      cvvPlaceholder: '123',
      numberPrefix: '3530',
      brandAttr: 'jcb',
    },
    {
      key: 'amex',
      brand: 'AMEX',
      cvvPlaceholder: '1234',
      numberPrefix: '3782',
      brandAttr: 'amex',
    },
  ];

  for (const c of testcardCases) {
    test(`TC-FB4${testcardCases.indexOf(c)} テストカード ${c.brand} 切替で brand icon + CVV 桁数 + card 番号更新`, async ({
      page,
      dappE2e,
    }) => {
      test.setTimeout(90_000);
      await mockAllFiatBidEndpoints(page);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await connectWalletAndWaitForBid(page, dappE2e);
      await openBidModalAndSwitchToFiat(page);

      // dropdown 選択で card データ更新
      await page.getByTestId('card-input-test-card-select').selectOption(c.key);

      // brand icon (card visual 内) が期待 label に更新
      await expect(page.getByTestId('card-brand-icon')).toHaveText(c.brand, { timeout: 5_000 });

      // data-brand 属性 (`CardInput.tsx:220` の判定分岐 SSOT) が更新
      await expect(page.getByTestId('card-input')).toHaveAttribute('data-brand', c.brandAttr);

      // card 番号 display の 先頭 4 桁を verify (`formatCardNumber` 経由の 4-4-4-4 or 4-6-5 format 開始)
      const numberDisplay = page.getByTestId('card-number-display');
      await expect(numberDisplay).toContainText(c.numberPrefix);

      // CVV input の placeholder 桁数 (brand === 'amex' ? '1234' : '123')
      await expect(page.getByTestId('card-input-cvv')).toHaveAttribute(
        'placeholder',
        c.cvvPlaceholder,
      );
    });
  }

  test('TC-FB44 3DS Success / 3DS Fail 特殊テストカード切替で card 番号末尾 4 桁差別化 (mock 判定基盤)', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(90_000);
    await mockAllFiatBidEndpoints(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await connectWalletAndWaitForBid(page, dappE2e);
    await openBidModalAndSwitchToFiat(page);

    // 3DS Success = 4111 1111 1111 1111 (VISA と同、 mock secureTran2 success 経路)
    await page.getByTestId('card-input-test-card-select').selectOption('3ds-success');
    await expect(page.getByTestId('card-brand-icon')).toHaveText('VISA');
    let numberDisplay = page.getByTestId('card-number-display');
    // 末尾は 1111 (format 済表示は「4111 1111 1111 1111」)
    await expect(numberDisplay).toContainText('1111 1111 1111 1111');

    // 3DS Fail = 4111 1111 1111 1129 (VISA 末尾 4 桁変更、 mock 側 fail 判定に使う設計)
    await page.getByTestId('card-input-test-card-select').selectOption('3ds-fail');
    numberDisplay = page.getByTestId('card-number-display');
    await expect(numberDisplay).toContainText('4111 1111 1111 1129');

    // brand は VISA のまま (先頭 4* で判定)
    await expect(page.getByTestId('card-brand-icon')).toHaveText('VISA');

    // 全 dropdown option (6 種) が select 可能
    const optionValues = await page
      .getByTestId('card-input-test-card-select')
      .locator('option')
      .allTextContents();
    expect(optionValues).toEqual(['VISA', 'Master', 'JCB', 'AMEX', '3DS Success', '3DS Fail']);
  });
});

/**
 * Phase 1 fiat bid golden path 後半 (Phase 3 で activate、 Issue #3069 scope 外)
 */
test.describe('Phase 1 fiat bid golden path 後半 (Phase 3 で activate、 scope 外)', () => {
  test.skip('TC-FB11 auction settle → FiatSettlementModal → capture → transferFrom → dashboard NFT 保有', async ({
    page,
  }) => {
    // Phase 3 activate 時の steps (TC-FB10 続き) —
    // 9. auction 終了 (increaseTime helper で fast-forward) → SettlementWatcher が enqueue
    // 10. FiatSettlementModal open → 「クレカ決済を確定します」 → 3DS 再認証 → capture 200
    // 11. transferFrom broadcast → user wallet に NijiToken 保有
    // 12. dashboard の holdings で nounId 表示を assert
    await page.goto('/');
    expect(true).toBe(true);
  });
});

/**
 * Phase C 継続 (scope 外) — timeout / retry / spot rate deviation の 3 test
 *
 * 現行 UI/hook で trigger 経路が確立していないため defer。 backend integration test で cover 済 or
 * 対応 UI 実装 phase (Phase 2/3) で activate 予定。 skip理由は file header § scope 外 SSOT。
 */
test.describe('Phase C 継続 (Issue #3071 で defer、 対応 UI/hook 実装後 activate)', () => {
  test.skip('TC-FB32 3DS 認証 10 分 timeout で status = timeout 遷移 (現行 UI に timeout 検出 logic 不在)', async ({
    page,
  }) => {
    // ThreeDSReturn.tsx の `ReturnStatus` enum に 'timeout' 分岐は存在するが、
    // 現行 useEffect + invokeCallback は setTimeout / setInterval で timeout 検出しない。
    // activate には (1) hook 側 fake timer 発火経路 (2) callback 応答 timeout mock の 2 経路実装が要る。
    await page.goto('/');
    expect(true).toBe(true);
  });

  test.skip('TC-FB33 GMO alterTran cancel API 失敗時の retry 3 回動作 (capture = Phase 3、 backend 統合 test cover 済)', async ({
    page,
  }) => {
    // capture 経路 (Phase 3 scope 外) の backend logic、 UI e2e で直接 verify 経路がない。
    // backend 側 test (packages/niji-api の alterTran retry test) で cover 済。
    await page.goto('/');
    expect(true).toBe(true);
  });

  test.skip('TC-FB34 spot rate 2% 超乖離時の user 再確認 modal (UI/hook 未実装、 Phase 2 以降で追加)', async ({
    page,
  }) => {
    // useSpotRate は単 rate 取得のみ、 authorize 応答 spotRate との差分 gate は Phase 2 以降。
    // activate 前提 = FiatBidForm 側で「認証直前 spot rate と authorize 直前 spot rate を差分 check」
    // の UI 追加 + 差分 > 2% で確認 modal を出す実装が必要。
    await page.goto('/');
    expect(true).toBe(true);
  });
});
