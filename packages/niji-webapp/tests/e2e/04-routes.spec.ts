/**
 * Niji webapp — route smoke tests
 *
 * 仕様 ... /playground / /traits / /nijis / /vote / /lp/ の主要ルートが 200 + 描画
 *         される smoke test。 chain state には依存しないため snapshot 不要、
 *         kiwa dappE2eTest fixture の page 経由でアクセスする。
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test.describe('Niji webapp — route smoke tests', () => {
  test('TC-R01 /playground が表示され Generate Nijis ボタンがある', async ({ page }) => {
    await page.goto('/playground');
    // Playground page の h1 heading (Lingui `<Trans>Playground</Trans>` で i18n されるので
    // text 依存でなく role 経由で locale 独立に検出、 ja / en どちらの locale でも pass)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
    const generateBtn = page.getByRole('button', { name: /Generate Nijis|Niji/i }).first();
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
  });

  test('TC-R02 /playground の初期 4 体以上が data:image/svg+xml で描画される', async ({
    page,
  }) => {
    await page.goto('/playground');
    await page.waitForFunction(
      () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const svgImgs = imgs.filter(i => i.src.startsWith('data:image/svg+xml;base64,'));
        return svgImgs.length >= 4;
      },
      { timeout: 20_000 },
    );
  });

  test('TC-R03 /traits が 200 で返る', async ({ page, request }) => {
    // /traits は重い PNG zip 生成 + subgraph 接続を含む。 page.goto では teardown 待ちで
    // timeout するため、 純粋な HTTP status を request fixture で確認する。
    const res = await request.get('/traits');
    expect(res.status()).toBe(200);
  });

  test('TC-R04 /nijis が 200 で表示される', async ({ page }) => {
    const res = await page.goto('/nijis');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
  });

  test('TC-R05 /vote が 200 で表示される (DAO governance page)', async ({ page }) => {
    const res = await page.goto('/vote');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
  });

  test('TC-R06 /lp/ が 200 + LP HTML を返す + 画像/共創 H2 描画', async ({ page }) => {
    const res = await page.goto('/lp/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('html[lang="ja"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('共創で進化する').first()).toBeVisible({ timeout: 10_000 });
    const headerLogo = page.locator('img[src="/lp/assets/images/lo_niji.png"]').first();
    await expect(headerLogo).toBeVisible({ timeout: 10_000 });
  });

  test('TC-R07 /lp (trailing slash 無) が 301 → /lp/ に redirect される', async ({ request }) => {
    const res = await request.get('/lp', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe('/lp/');
  });

  test('TC-R08 /lp/ の Launch App リンクをクリックで / に戻り webapp ロゴが描画', async ({
    page,
  }) => {
    await page.goto('/lp/');
    await expect(page.getByText('共創で進化する').first()).toBeVisible({ timeout: 10_000 });
    const launch = page.locator('a.launch_bt').first();
    await expect(launch).toBeVisible();
    await launch.click();
    await page.waitForURL(/\/$/, { timeout: 10_000 });
    await expect(page.locator('img[alt="Niji DAO"]').first()).toBeVisible({ timeout: 15_000 });
  });
});
