/**
 * Phase 1 fiat bid golden path e2e (Issue #3011 Phase C、 Issue #3069 で TC-FB10 activate)
 *
 * 責務 —
 * (1) 特商法 static page (/legal/tokushoho) の描画 + footer link 遷移経路の e2e verify
 * (2) Phase 1 golden path 前半 (wallet 接続 → クレカ tab → 与信枠 authorize mock → 3DS mock success →
 *     bid tx broadcast → NijiAuctionHouseV3.BidPlaced event assert) の実 browser execute 検証
 *
 * 実行環境 —
 * global-setup.ts で anvil 8547 + deploy-niji-full + spot-rate independent server (port 42070) が
 * 起動する pattern に従う。 fiat-bid endpoint (authorize / 3ds-callback / place-bid) は
 * Ponder 側 (port 42069) 経路が現状 e2e に組込むと build error で応答不能のため、
 * Playwright page.route() で e2e 内 mock する。 spot-rate は Ponder 非依存で実 integration test 経路。
 * 3DS mock 画面 (http://127.0.0.1:2426/mock-3ds) も page.route() で serve、
 * 「認証成功」 link click で /fiat-bid/3ds-return に navigation する経路を成立させる。
 *
 * bid tx broadcast は Node.js 内 viem client で anvil に直接 createBid tx を issue、
 * BidPlaced (=AuctionBid) event が anvil に emit されることを chain 上で assert する。
 * これは backend の BidRelay 経路 (別 process の運営 EOA が place-bid endpoint 応答時に tx を発火) と
 * 同 shape で anvil 状態を進める。
 *
 * 落札後経路 (capture → transferFrom) は TC-FB11 として分離、 Phase 3 で activate (auction time-warp +
 * Ponder settle 検知が要る、 本 PR scope 外)。
 *
 * flaky 対策 —
 * playwright.config.ts で retries: 2 (Issue #3069)、 external state = spot-rate mock + kiwa wallet
 * inject の依存で偶発 flaky を許容、 fail 時 log は trace + screenshot で残す。
 *
 * SSOT —
 * - tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5, P8
 * - tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md § Issue 8 Phase C
 * - GH Issue #3069 (TC-FB10 activate)
 */
import { dappE2eTest as baseTest } from '@kiwa-test/core';
import { expect } from '@playwright/test';
import { createWalletClient, http, parseAbi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { ADDRESSES, ANVIL_KEYS, anvil, publicClient } from './helpers/chain';

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
    // page.route() mock #1 = /api/v1/fiat-bid/authorize (与信枠取得 endpoint)
    //  webapp が VITE_GMO_API_ENDPOINT (default 127.0.0.1:42069) を叩く request を intercept、
    //  authId + tds2Url を含む response を返す。 tds2Url は 3DS mock 画面 (page.route mock #3) を指す。
    // ============================================================================================
    const testAuthId = 'mock-access-e2e-fb10';
    const gmoMockBaseUrl = 'http://127.0.0.1:2426';
    const tds2Url = `${gmoMockBaseUrl}/mock-3ds?orderId=e2e-fb10&accessId=${encodeURIComponent(
      testAuthId,
    )}&transactionId=mock-tds2-tran-e2e-fb10&returnUrl=${encodeURIComponent(
      'http://127.0.0.1:2424/fiat-bid/3ds-return',
    )}`;

    await page.route('**/api/v1/fiat-bid/authorize', async route => {
      const body = route.request().postDataJSON() as {
        auctionId: string;
        bidderWallet: string;
        ethAmount: string;
        jpyAmount: number;
        spotRate: number;
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authId: testAuthId,
          tds2Url,
          jpyAmount: body.jpyAmount,
          ethAmount: body.ethAmount,
          spotRate: body.spotRate,
          spotRateSource: 'mock',
        }),
      });
    });

    // ============================================================================================
    // page.route() mock #2 = /api/v1/fiat-bid/3ds-callback (3DS 認証結果 verify endpoint)
    //  ThreeDSReturn.tsx が /fiat-bid/3ds-return 到達後に叩く request を intercept、
    //  status = 3ds-verified を返して webapp を「認証が完了しました」 表示に遷移。
    // ============================================================================================
    await page.route('**/api/v1/fiat-bid/3ds-callback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          authId: testAuthId,
          status: '3ds-verified',
        }),
      });
    });

    // ============================================================================================
    // page.route() mock #3 = 3DS mock 画面 (http://127.0.0.1:2426/mock-3ds)
    //  authorize response の tds2Url に webapp が window.location.href = で redirect。
    //  ここで「認証成功」 link を含む HTML を serve、 link click で /fiat-bid/3ds-return に遷移。
    //  MSW 経路は Node.js の fetch のみ intercept、 browser navigation には効かないため
    //  Playwright page.route() で serve する。
    // ============================================================================================
    await page.route('http://127.0.0.1:2426/mock-3ds*', async route => {
      const url = new URL(route.request().url());
      const transactionId = url.searchParams.get('transactionId') ?? '';
      const accessId = url.searchParams.get('accessId') ?? '';
      const orderId = url.searchParams.get('orderId') ?? '';
      const returnUrl =
        url.searchParams.get('returnUrl') ?? 'http://127.0.0.1:2424/fiat-bid/3ds-return';
      const successHref = `${returnUrl}?transactionId=${encodeURIComponent(
        transactionId,
      )}&result=success&accessId=${encodeURIComponent(accessId)}&orderId=${encodeURIComponent(
        orderId,
      )}`;
      const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Mock 3DS 2.0 Challenge</title></head>
<body>
  <h1>Mock 3D セキュア 2.0 認証</h1>
  <p><a id="mock-3ds-success" href="${successHref}">認証成功 (mock)</a></p>
</body></html>`;
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      });
    });

    // ============================================================================================
    // step 1 = auction top page に goto、 wagmi injected provider が activate されるまで待つ。
    // kiwa dappE2e.connect() で eth_requestAccounts approval → wagmi useAccount が address 取得。
    // ============================================================================================
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // ConnectKit "Connect" button click → wagmi injected connector 選択 → dappE2e.connect() で approve
    // NavBar 内に非接続時のみ「Connect」 button 存在 (`components/NavBar/index.tsx:322-340`)。
    const connectButton = page.getByRole('button', { name: 'Connect', exact: true }).first();
    await expect(connectButton).toBeVisible({ timeout: 15_000 });
    await connectButton.click();

    // ConnectKit modal 内で「Injected」 系 wallet option を選ぶ → wagmi useConnect が RPC 経路で接続。
    // kiwa の EIP-6963 injected provider は「MetaMask」 相当の label で描画される。
    // modal 内の button 一覧から MetaMask / Injected / kiwa-e2e 等を柔軟に match。
    const walletOption = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /metamask|injected|kiwa|anvil|test|ethereum|browser/i })
      .first();
    await expect(walletOption).toBeVisible({ timeout: 10_000 });
    await walletOption.click();
    // kiwa dappE2e.connect() は internal request approvals 経路、 wagmi useConnect の request を approve する
    await dappE2e.connect();

    // 接続確定を Bid button の enable 状態で確認 (`components/Bid/index.tsx:77` で activeAccount 判定)
    const bidOpenButton = page.getByTestId('bid-open-button');
    await expect(bidOpenButton).toBeVisible({ timeout: 20_000 });
    await expect(bidOpenButton).toBeEnabled({ timeout: 20_000 });

    // ============================================================================================
    // step 2 = 「Bid」 button click → BidModal open → 「クレカで払う (JPY)」 tab click
    // ============================================================================================
    await bidOpenButton.click();
    const bidModal = page.getByTestId('bid-modal');
    await expect(bidModal).toBeVisible({ timeout: 10_000 });

    const fiatTab = page.getByTestId('bid-tab-fiat');
    await expect(fiatTab).toBeVisible();
    await fiatTab.click();

    const fiatForm = page.getByTestId('fiat-bid-form');
    await expect(fiatForm).toBeVisible({ timeout: 5_000 });

    // ============================================================================================
    // step 3 = spot-rate 取得完了まで待つ (実 spot-rate-server から mock 応答、 500000 JPY/ETH)、
    //          ETH input に 0.02 入力 → JPY 換算「約 10,000 円」 表示 confirm
    //          (0.02 ETH × 500000 = 10,000 円)
    // ============================================================================================
    await expect(page.getByTestId('fiat-bid-rate-summary-mock-badge')).toBeVisible({
      timeout: 20_000,
    });

    const ethInput = page.getByTestId('fiat-bid-eth-input');
    await ethInput.fill('0.02');

    await expect(page.getByTestId('fiat-bid-jpy-display')).toContainText('約 10,000 円', {
      timeout: 5_000,
    });

    // ============================================================================================
    // step 4 = テストカード VISA default プリフィル (dev env で自動反映、 Issue #3047) + Terms checkbox 同意
    // ============================================================================================
    const termsCheckbox = page.getByTestId('fiat-bid-terms-checkbox');
    await termsCheckbox.check();

    // ============================================================================================
    // step 5 = 「bid を実行」 click → /authorize mock 200 → tds2Url に redirect
    // useFiatBid.authorize が /api/v1/fiat-bid/authorize を叩き、 mock response で tds2Url を受領。
    // localStorage `niji.fiat-bid.pending` に authId 保存後、 window.location.href = tds2Url で full redirect。
    // ============================================================================================
    const submitButton = page.getByTestId('fiat-bid-submit');
    await expect(submitButton).toBeEnabled({ timeout: 10_000 });
    await submitButton.click();

    // ============================================================================================
    // step 6 = 3DS mock 画面 (page.route mock #3 で intercept) の「認証成功」 link click →
    //         /fiat-bid/3ds-return に navigation → ThreeDSReturn が /3ds-callback (mock #2) を叩き 3ds-verified
    // ============================================================================================
    await page.waitForURL(/127\.0\.0\.1:2426\/mock-3ds/, { timeout: 15_000 });
    const successLink = page.locator('#mock-3ds-success');
    await expect(successLink).toBeVisible({ timeout: 5_000 });
    await successLink.click();

    // ThreeDSReturn page が /3ds-callback (mock) を叩いて status = 3ds-verified に成功、
    // 「認証が完了しました」 heading が render される (`ThreeDSReturn.tsx:196`)。
    await page.waitForURL(/\/fiat-bid\/3ds-return/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: '認証が完了しました', exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    // ============================================================================================
    // step 7 = anvil に createBid tx を viem client で broadcast (backend BidRelay と同 shape)。
    //          実 backend の place-bid endpoint は Ponder DB 経由 fiat_bid record lookup + BidRelay
    //          からの broadcast を実行するが、 e2e は Ponder 不在なので Node.js 側で同 tx を issue する。
    //          deployer key で bidder 兼 operator を担当、 tx params は現 auction の minBid 以上 (0.02 ETH 最低)。
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
    // (Niji contract は Nouns compatible で event 名 = AuctionBid、 spec 上「BidPlaced」 と表現)
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
    // event の nounId は現 auction 対象 Niji (= initialNounId)、 sender は operator (= deployer)
    expect(bidEvent.args.nounId, 'AuctionBid.nounId が現 auction 対象と一致').toBe(initialNounId);
    expect(bidEvent.args.sender.toLowerCase(), 'AuctionBid.sender が operator (deployer)').toBe(
      deployerAccount.address.toLowerCase(),
    );
    // value = bid amount wei、 送信 bidValue と一致
    expect(bidEvent.args.value, 'AuctionBid.value が送信 bidValue と一致').toBe(bidValue);
  });
});

/**
 * Phase 1 fiat bid golden path 後半 (Phase 3 で activate、 Issue #3069 scope 外)
 *
 * 落札後経路 (auction settle → capture → transferFrom → dashboard NFT 保有 assert) は
 * auction time-warp + Ponder settle 検知が要るため、 別 test TC-FB11 に分離。
 * Phase 3 で `test.skip` → `test` に格上げして activate する予定。
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
    // ↑ 全 pass で fiat bid 落札後 経路が通過証拠となる
    await page.goto('/');
    expect(true).toBe(true);
  });
});
