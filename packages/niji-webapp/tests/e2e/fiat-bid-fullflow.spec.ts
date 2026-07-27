/**
 * TC-FB10-FULL fincode iframe frameLocator 経路の tokenize 完全 e2e
 *
 * (1) fincode iframe render + frameLocator で iframe 内 card input 5 field を programmatic fill
 * (2) submit click → fincode SDK の getCardToken() で実 fincode test env に POST /v1/tokens
 * (3) tokenize 成功 → backend authorize endpoint (mock) → 3DS mock URL redirect verify
 *
 * 前提 = `.env.local` に fincode dashboard.test.fincode.jp 発行の VITE_FINCODE_PUBLIC_KEY 設定済。
 * dev server restart 後の env 反映 (Vite は起動時 load 一度きり) 必要。
 */
import { dappE2eTest as baseTest } from '@kiwa-test/core';
import { expect } from '@playwright/test';

import { resetAnvilToPostDeploy } from './helpers/anvil-snapshot';
import {
  connectWalletAndWaitForBid,
  mockAllFiatBidEndpoints,
  openBidModalAndSwitchToFiat,
} from './helpers/fiat-bid';

const test = baseTest.extend<{ _anvilHandle: { port: number; stop: () => Promise<void> } }>({
  _anvilHandle: async ({}, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ port: 8547, stop: async () => {} });
  },
});

test.beforeEach(async () => {
  await resetAnvilToPostDeploy();
});

// TC-FB10-REAL (fiat-bid-real-authorize.spec.ts) が real fincode /v1/authorize + /v1/payments/{id}/capture
// 経路まで verify する上位互換に置換済、 本 spec は mock 経路の重複 = 保守負担のみで skip 化。
test.describe.skip('TC-FB10-FULL fincode iframe frameLocator 経路の tokenize 完全 e2e (TC-FB10-REAL に上位互換移行)', () => {
  test('fincode iframe frameLocator 経路で card 入力 → tokenize → 実 fincode test env 応答 verify', async ({
    page,
    dappE2e,
  }) => {
    test.setTimeout(120_000);

      // ============================================================================================
      // browser console + network 観測 (fincode SDK 通信 debug)
      // ============================================================================================
      page.on('console', msg => {
        const t = msg.text();
        if (t.includes('fincode') || t.includes('Fincode') || msg.type() === 'error') {
          console.log(`[browser ${msg.type()}]`, t.slice(0, 300));
        }
      });
      page.on('pageerror', err => console.log('[browser pageerror]', err.message));
      // 401 発生 endpoint 特定 = 全 fincode / gmo response を log
      page.on('response', res => {
        const url = res.url();
        if ((url.includes('fincode') || url.includes('gmo')) && res.status() >= 400) {
          console.log(`[browser response ${res.status()}]`, url.slice(0, 200));
        }
      });

      await mockAllFiatBidEndpoints(page, { authorize: { authId: 'e2e-tc-fb10-full' } });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await connectWalletAndWaitForBid(page, dappE2e);
      await openBidModalAndSwitchToFiat(page);

      // JPY 入力 + Terms 同意 + iframe render 完了
      await page.getByTestId('fiat-bid-jpy-input').fill('10000');
      await expect(page.getByTestId('fiat-bid-eth-display')).toContainText('0.02', {
        timeout: 5_000,
      });
      await page.locator('label[for="fiat-bid-terms"]').dispatchEvent('click');
      await expect(page.getByTestId('fiat-bid-terms-checkbox')).toBeChecked({ timeout: 5_000 });
      await page.waitForFunction(
        () => {
          const mount = document.getElementById('niji-fincode-card-mount');
          return mount !== null && mount.querySelectorAll('iframe').length > 0;
        },
        null,
        { timeout: 15_000 },
      );
      // SDK content 描画完了 wait (iframe append 後の内部 form render に 2-3s 掛かる、
      // env-check spec の実測で 3s 経過後 iframe count=1 + 200 OK が安定確認済)
      await page.waitForTimeout(4_000);

      // ============================================================================================
      // fincode iframe を DOM handle 経由で取得 (frame url は動的 / 空文字で URL filter は不可)
      // → iframe.contentFrame() で内部 frame handle を取得、 input DOM 実測
      // ============================================================================================
      const iframeHandle = await page.locator('#niji-fincode-card-mount iframe').first().elementHandle();
      expect(iframeHandle, 'fincode iframe DOM が存在').not.toBeNull();
      const fincodeFrame = await iframeHandle!.contentFrame();
      expect(fincodeFrame, 'fincode iframe contentFrame が取得可能').not.toBeNull();

      const inputHandles = await fincodeFrame!.$$('input');
      console.log(`fincode iframe 内 input elements count: ${inputHandles.length}`);
      for (const h of inputHandles) {
        const name = await h.getAttribute('name').catch(() => null);
        const id = await h.getAttribute('id').catch(() => null);
        const type = await h.getAttribute('type').catch(() => null);
        const placeholder = await h.getAttribute('placeholder').catch(() => null);
        const ariaLabel = await h.getAttribute('aria-label').catch(() => null);
        console.log(
          `  input: name="${name}" id="${id}" type="${type}" placeholder="${placeholder}" aria-label="${ariaLabel}"`,
        );
      }
      expect(inputHandles.length, 'fincode iframe 内 input が 1 個以上').toBeGreaterThan(0);

      // frameLocator 経路で card 入力を fill (実測 input name に基づき selector 決定)
      // fincode SDK の実 input attr = cardNumber / cardExpirationMonth / cardExpirationYear / cvc / card-name
      const frameLocator = page.frameLocator('#niji-fincode-card-mount iframe').first();

      await frameLocator
        .locator('input[name="cardNumber"]')
        .fill('4111111111111111', { timeout: 10_000 });
      await frameLocator
        .locator('input[name="cardExpirationMonth"]')
        .fill('12', { timeout: 5_000 });
      await frameLocator
        .locator('input[name="cardExpirationYear"]')
        .fill('30', { timeout: 5_000 });
      await frameLocator.locator('input[name="cvc"]').fill('123', { timeout: 5_000 });
      await frameLocator.locator('input[name="card-name"]').fill('TEST USER', { timeout: 5_000 });

      // submit click → getToken() 内で fincode SDK が iframe 内 value を token 化 → 実 fincode test env 応答
      const submitButton = page.getByTestId('fiat-bid-submit');
      await expect(submitButton).toBeEnabled({ timeout: 10_000 });
      await submitButton.click();

      // 実 tokenize 経路 = 成功なら authorize mock (page.route) が hit されて tds2Url に redirect、
      // fail なら fiat-bid-error-message が表示
      const success = await Promise.race([
        page
          .waitForURL(/127\.0\.0\.1:2426\/mock-3ds/, { timeout: 15_000 })
          .then(() => 'redirect' as const)
          .catch(() => 'error-or-timeout' as const),
        page
          .getByTestId('fiat-bid-error-message')
          .waitFor({ state: 'visible', timeout: 15_000 })
          .then(() => 'error' as const)
          .catch(() => 'error-or-timeout' as const),
      ]);

      console.log(`tokenize result: ${success}`);

      // pass 条件 = redirect 成功 (実 tokenize 済 + authorize mock 経由) or 明示 error (credential 無効 or
      // 実 fincode 側 rejection の fact 記録)
      expect(success).toBe('redirect');
  });
});
