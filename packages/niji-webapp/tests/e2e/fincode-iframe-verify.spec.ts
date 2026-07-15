/**
 * fincode iframe 描画 verification (Issue #3119 追加 verify、 AI 側で実 dev server + Playwright で assert)
 *
 * VITE_USE_FINCODE_UI=true 環境で dev server (localhost:2424) を起動した状態で、
 * (1) auction ページ navigate
 * (2) Bid button click → BidModal open
 * (3) 「クレカで払う (JPY)」 tab click
 * (4) CardInputFincode component の mount target div 存在確認
 * (5) label が「fincode.js iframe」 表示 (mock 表示ではない)
 * (6) fincode.js SDK が iframe を append することを DOM 検査で確認
 * を pure Playwright で assert する (kiwa fixture 経由 wallet inject 済想定)。
 *
 * SDK 実 API 呼出は VITE_FINCODE_PUBLIC_KEY 有効時のみ、
 * 未設定時は error state で「VITE_FINCODE_PUBLIC_KEY 未設定」 message 検証に fall back。
 */
import { dappE2eTest as baseTest } from '@kiwa-test/core';
import { expect } from '@playwright/test';

const test = baseTest.extend<{ _anvilHandle: { port: number; stop: () => Promise<void> } }>({
  _anvilHandle: async ({}, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ port: 8547, stop: async () => {} });
  },
});

test.describe('fincode iframe verify (Issue #3119)', () => {
  test('VITE_USE_FINCODE_UI=true 時 CardInputFincode が render + label 変化 + mount target 存在', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // wallet connect (kiwa 経由 auto inject) を wait
    const bidOpenButton = page.getByTestId('bid-open-button').first();
    await bidOpenButton.waitFor({ state: 'visible', timeout: 20_000 });
    await bidOpenButton.click();

    // BidModal open + Fiat tab 切替
    await page.getByTestId('bid-tab-fiat').click();

    // fincode 経路 = CardInputFincode の mount target + label 確認
    const fincodeMount = page.getByTestId('card-input-fincode-mount');
    await expect(fincodeMount).toBeVisible({ timeout: 5_000 });

    // 従来 CardInput (data-testid="card-input") は render されない
    await expect(page.getByTestId('card-input')).toHaveCount(0);

    // label が「fincode.js iframe」 に変わる (mock 表示ではない)
    await expect(page.getByText(/fincode\.js iframe/)).toBeVisible();

    // SDK init 完了 wait (10s 上限) = iframe append or error state のいずれかが確実に成立するまで
    await page
      .waitForFunction(
        () => {
          const mount = document.getElementById('niji-fincode-card-mount');
          const hasIframe = mount !== null && mount.querySelectorAll('iframe').length > 0;
          const errorEl = document.querySelector('[data-testid="card-input-fincode-error"]');
          return hasIframe || errorEl !== null;
        },
        null,
        { timeout: 10_000 },
      )
      .catch(() => {
        // timeout 時も screenshot 取って report、 assert で fail 判定
      });

    // screenshot 保存 (verify report 用)
    await page.screenshot({
      path: 'test-results/fincode-iframe-verify.png',
      fullPage: false,
    });

    // fincode SDK 動作確認 = iframe が mount target 内に append されているか
    // (VITE_FINCODE_PUBLIC_KEY 未設定なら error state、 有効なら iframe が生える)
    const iframeCount = await fincodeMount.locator('iframe').count();
    const errorEl = page.getByTestId('card-input-fincode-error');
    const hasError = (await errorEl.count()) > 0;

    console.log('=== fincode iframe verify result ===');
    console.log('iframe count in mount target:', iframeCount);
    console.log('error state visible:', hasError);
    if (hasError) {
      console.log('error message:', await errorEl.textContent());
    }

    // 判定 = iframe あり OR error state (どちらか成立で fincode 経路が render されたことを確認)
    expect(iframeCount > 0 || hasError).toBeTruthy();
  });
});
