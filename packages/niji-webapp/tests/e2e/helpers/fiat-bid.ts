/**
 * Fiat bid e2e 共通 helper (Issue #3071 で抽出)
 *
 * TC-FB10 (Phase 1 golden path) + TC-FB20-44 (validation / error / testcard) で共有される
 * page.route mock 群 + wallet 接続 flow + BidModal open + fiat tab 切替を SSOT 化する。
 *
 * spec ごとに mock 定義を重複させると 3 種 (authorize / 3ds-callback / 3ds 画面) × 15+ test で
 * 60 箇所以上の hand-rolled fetch mock になり、 更新時 drift の温床になる。 本 helper 経由に
 * 統一することで response shape 変更 (Issue #3061 mock badge / Issue #3051 ETH primary 等) を
 * 1 箇所修正で反映できる。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5-P8
 */
import type { Page } from '@playwright/test';

/** 与信枠 authorize endpoint mock の default 応答値 */
export const DEFAULT_MOCK_AUTH_ID = 'mock-access-e2e';
export const GMO_MOCK_BASE_URL = 'http://127.0.0.1:2426';
export const WEBAPP_BASE_URL = 'http://127.0.0.1:2424';

/** authorize endpoint mock option */
export type MockAuthorizeOptions = {
  /** default = 'mock-access-e2e-fb10' 等の test 固有 authId */
  authId?: string;
  /** default = 200 (success)、 5xx 系を指定すると useFiatBid が failure step へ遷移 */
  status?: number;
  /** default = mock 3DS 画面への URL、 test 固有経路が要る場合のみ差替 */
  tds2Url?: string;
  /** status 500+ 時に返す error body (default = { error: 'InternalError', message: 'GMO mock 5xx' }) */
  errorBody?: { error?: string; message?: string };
};

/**
 * /api/v1/fiat-bid/authorize (与信枠取得 endpoint) を page.route で intercept する。
 *
 * 成功時は authId + tds2Url (mock 3DS 画面) + spot rate 情報を含む JSON を返す。
 * status=500 等を指定すると useFiatBid.authorize が catch branch に落ちて
 * `fiat-bid-error-message` に error text が表示される (TC-FB31 で verify)。
 *
 * webapp が env `VITE_GMO_API_ENDPOINT` (default 127.0.0.1:42069) 経由で叩く request を
 * host / port によらず path pattern (`**\/api/v1/fiat-bid/authorize`) で全て捕捉する。
 */
export const mockFiatBidAuthorize = async (
  page: Page,
  options: MockAuthorizeOptions = {},
): Promise<void> => {
  const authId = options.authId ?? DEFAULT_MOCK_AUTH_ID;
  const status = options.status ?? 200;
  const tds2Url =
    options.tds2Url ??
    `${GMO_MOCK_BASE_URL}/mock-3ds?orderId=e2e&accessId=${encodeURIComponent(
      authId,
    )}&transactionId=mock-tds2-tran-e2e&returnUrl=${encodeURIComponent(
      `${WEBAPP_BASE_URL}/fiat-bid/3ds-return`,
    )}`;

  await page.route('**/api/v1/fiat-bid/authorize', async route => {
    if (status >= 400) {
      const body = options.errorBody ?? {
        error: 'InternalError',
        message: 'GMO mock 5xx (e2e)',
      };
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
      return;
    }
    const request = route.request().postDataJSON() as {
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
        authId,
        tds2Url,
        jpyAmount: request.jpyAmount,
        ethAmount: request.ethAmount,
        spotRate: request.spotRate,
        spotRateSource: 'mock',
      }),
    });
  });
};

/** 3ds-callback endpoint mock option */
export type Mock3dsCallbackOptions = {
  authId?: string;
  /** default = '3ds-verified' (success)、 'cancelled' で ThreeDSReturn の failure branch を verify */
  status?: '3ds-verified' | 'cancelled';
};

/**
 * /api/v1/fiat-bid/3ds-callback (3DS 認証結果 verify endpoint) を page.route で intercept。
 *
 * status = '3ds-verified' で ThreeDSReturn が「認証が完了しました」 heading を表示、
 * status = 'cancelled' で「認証に失敗しました」 heading を表示 (TC-FB30 で verify)。
 */
export const mockFiatBid3dsCallback = async (
  page: Page,
  options: Mock3dsCallbackOptions = {},
): Promise<void> => {
  const authId = options.authId ?? DEFAULT_MOCK_AUTH_ID;
  const status = options.status ?? '3ds-verified';
  await page.route('**/api/v1/fiat-bid/3ds-callback', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authId, status }),
    });
  });
};

/** 3DS mock 画面 HTML mock option */
export type Mock3dsPageOptions = {
  /** default = success button のみを描画 (fail=false)、 true で fail button も描画 */
  includeFailButton?: boolean;
};

/**
 * mock 3DS 画面 (http://127.0.0.1:2426/mock-3ds) を page.route で intercept して HTML 応答。
 *
 * webapp が authorize 応答の tds2Url に window.location.href = で full redirect した後、
 * この HTML 上の「認証成功 (mock)」 / 「認証失敗 (mock)」 link を click することで
 * webapp の /fiat-bid/3ds-return に result=success / result=fail 付き遷移する。
 *
 * MSW 経路は Node.js fetch のみ intercept する仕様で browser navigation には効かないため、
 * Playwright page.route() で serve する経路を default 化する。 3DS Fail scenario (TC-FB30) では
 * includeFailButton: true を指定して fail link を追加、 test 側から `#mock-3ds-fail` を click する。
 */
export const mockFiatBid3dsPage = async (
  page: Page,
  options: Mock3dsPageOptions = {},
): Promise<void> => {
  const includeFail = options.includeFailButton === true;
  await page.route('http://127.0.0.1:2426/mock-3ds*', async route => {
    const url = new URL(route.request().url());
    const transactionId = url.searchParams.get('transactionId') ?? '';
    const accessId = url.searchParams.get('accessId') ?? '';
    const orderId = url.searchParams.get('orderId') ?? '';
    const returnUrl = url.searchParams.get('returnUrl') ?? `${WEBAPP_BASE_URL}/fiat-bid/3ds-return`;
    const successHref = `${returnUrl}?transactionId=${encodeURIComponent(
      transactionId,
    )}&result=success&accessId=${encodeURIComponent(accessId)}&orderId=${encodeURIComponent(
      orderId,
    )}`;
    const failHref = `${returnUrl}?transactionId=${encodeURIComponent(
      transactionId,
    )}&result=fail&accessId=${encodeURIComponent(accessId)}&orderId=${encodeURIComponent(orderId)}`;
    const failLink = includeFail
      ? `<p><a id="mock-3ds-fail" href="${failHref}">認証失敗 (mock)</a></p>`
      : '';
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Mock 3DS 2.0 Challenge</title></head>
<body>
  <h1>Mock 3D セキュア 2.0 認証</h1>
  <p><a id="mock-3ds-success" href="${successHref}">認証成功 (mock)</a></p>
  ${failLink}
</body></html>`;
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: html,
    });
  });
};

/** spot-rate endpoint mock option */
export type MockSpotRateOptions = {
  /** default = 500000 JPY/ETH (dev mock 標準値) */
  rate?: number;
  /** default = 'mock'、 'gmo' / 'gmo-coin' / 'coingecko' に差替え可 */
  source?: 'mock' | 'gmo' | 'gmo-coin' | 'coingecko';
};

/**
 * spot-rate endpoint (`/api/v1/spot-rate/eth-jpy`) を page.route で intercept。
 *
 * 実 niji-api (port 42070) 側の USE_SPOT_RATE_MOCK 未 set 時は gmo-coin API から実 rate を取得するため
 * (`packages/niji-api/src/services/spotRate` SSOT)、 test で spot rate 依存の assertion (JPY 換算 / 100 万円上限判定 等) を
 * 決定的に verify するには page.route で response を pin する必要がある。 default = 500000 JPY/ETH で
 * 0.02 ETH = 10,000 円 の換算値を Phase B / TC-FB10 で共通に使う。
 */
export const mockSpotRate = async (
  page: Page,
  options: MockSpotRateOptions = {},
): Promise<void> => {
  const rate = options.rate ?? 500_000;
  const source = options.source ?? 'mock';
  await page.route('**/api/v1/spot-rate/eth-jpy', async route => {
    const now = Date.now();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rate,
        source,
        cachedAt: now,
        expiresAt: now + 5_000,
      }),
    });
  });
};

/**
 * 4 種 mock を一括で set up する convenience (authorize + 3ds-callback + 3DS 画面 + spot-rate)。
 * test の setup boilerplate を 4 行 → 1 行に短縮。
 */
export const mockAllFiatBidEndpoints = async (
  page: Page,
  options: {
    authorize?: MockAuthorizeOptions;
    callback?: Mock3dsCallbackOptions;
    threeDsPage?: Mock3dsPageOptions;
    spotRate?: MockSpotRateOptions;
  } = {},
): Promise<void> => {
  await mockFiatBidAuthorize(page, options.authorize);
  await mockFiatBid3dsCallback(page, options.callback);
  await mockFiatBid3dsPage(page, options.threeDsPage);
  await mockSpotRate(page, options.spotRate);
};

/**
 * kiwa fixture 経路で wallet 接続完了状態まで待つ。
 *
 * kiwa の `dappE2eTest` は `window.ethereum` に anvil-連携 injected provider を注入するため、
 * wagmi の autoConnect / persister が過去 session を検知して page load 時点で
 * すでに接続済 (bid-open-button 直描画 = wrapper なし branch) になる pattern が default。
 * 未接続時のみ ConnectKit modal → Connect button → wallet option 選択 → dappE2e.connect() を実行する。
 *
 * TC-FB10 と Phase B/C/D の各 test で共通に使う「接続完了まで待つ」 経路を SSOT 化する。
 *
 * 成功後は `bid-open-button` が enable + visible な状態で return する。
 * TC-FB23 (wallet 未接続 UI verify) は本 helper を呼ばず、 別経路で disconnected 状態を作る。
 */
export const connectWalletAndWaitForBid = async (
  page: Page,
  // kiwa の dappE2e fixture 契約 (import type すると helper 呼出側で weight が増えるため any-ish に緩める)
  dappE2e: { connect: () => Promise<void> },
): Promise<void> => {
  await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

  // page 描画完了 (bid-open-button OR bid-open-button-wrapper OR Connect button のいずれかが visible) まで
  // wait して、 その後 「接続済 = wrapper なし + enable」 「未接続 = wrapper あり」 で分岐する。
  //
  // kiwa の `dappE2eTest` は `window.ethereum` に anvil-連携 injected provider を注入するため、
  // wagmi autoConnect / persister が page load 時点で接続状態を復元する pattern が default。
  // ただし wagmi の hydration 完了は 3-5 秒かかるため、 「connect 状態が確定するまで」 waitForFunction で待つ。
  // Issue #3073 で timeout 20_000 → 8_000 に短縮 (nijiToken.ts TS2589 完全解消 + vite-plugin-checker overlay 消滅で
  // wagmi hydration は実測 3-5 秒に安定、 20 秒 timeout は前 flaky 時代の防御的設定で per-test 無駄な wait 発生源だった)
  await page.waitForFunction(
    () => {
      const btn = document.querySelector<HTMLButtonElement>('[data-testid="bid-open-button"]');
      const wrapper = document.querySelector('[data-testid="bid-open-button-wrapper"]');
      const connectBtn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent?.trim() === 'Connect',
      );
      return (btn !== null && !btn.disabled) || wrapper !== null || connectBtn !== undefined;
    },
    null,
    { timeout: 8_000 },
  );

  const wrapper = page.getByTestId('bid-open-button-wrapper');
  const bidOpenButton = page.getByTestId('bid-open-button');
  let wrapperExists = (await wrapper.count()) > 0;

  // kiwa `dappE2eTest` fixture の wallet inject が wrapper 判定直後に完了する race condition を回避 (Issue #3082)。
  // wrapper 検知後 2 秒 wait して wrapper が disappear すれば「inject 済 = connect flow skip」 と判定、
  // wrapper 継続 visible なら本当に未接続 → ConnectKit modal 経由の connect flow を実行する。
  if (wrapperExists) {
    const wrapperDisappeared = await wrapper
      .first()
      .waitFor({ state: 'hidden', timeout: 2_000 })
      .then(() => true)
      .catch(() => false);
    if (wrapperDisappeared) {
      wrapperExists = false;
    }
  }

  if (wrapperExists) {
    // 未接続確定 → ConnectKit modal 経由で connect flow を実行
    const connectButton = page.getByRole('button', { name: 'Connect', exact: true }).first();
    await connectButton.waitFor({ state: 'visible', timeout: 10_000 });
    await connectButton.click();

    const walletOption = page
      .locator('[role="dialog"] button')
      .filter({ hasText: /metamask|injected|kiwa|anvil|test|ethereum|browser/i })
      .first();
    await walletOption.waitFor({ state: 'visible', timeout: 10_000 });
    await walletOption.click();
    await dappE2e.connect();
  }

  // 接続完了 = bid-open-button が enable state で visible な状態を確保
  await bidOpenButton.waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector<HTMLButtonElement>('[data-testid="bid-open-button"]');
      return btn !== null && !btn.disabled;
    },
    null,
    { timeout: 20_000 },
  );
};

/**
 * BidModal を open して「クレカで払う (JPY)」 tab に切替、 FiatBidForm 描画完了まで待つ。
 * connect 済 wallet 前提 (connectWalletAndWaitForBid の後に呼ぶ)。
 */
export const openBidModalAndSwitchToFiat = async (page: Page): Promise<void> => {
  await page.getByTestId('bid-open-button').click();
  await page.getByTestId('bid-modal').waitFor({ state: 'visible', timeout: 10_000 });

  const fiatTab = page.getByTestId('bid-tab-fiat');
  await fiatTab.waitFor({ state: 'visible' });
  await fiatTab.click();

  await page.getByTestId('fiat-bid-form').waitFor({ state: 'visible', timeout: 5_000 });
  // spot rate 取得完了 (mock badge 表示) まで待つ = fiat-bid-eth-input への操作が意味を持つ準備状態
  await page.getByTestId('fiat-bid-rate-summary-mock-badge').waitFor({
    state: 'visible',
    timeout: 20_000,
  });
};
