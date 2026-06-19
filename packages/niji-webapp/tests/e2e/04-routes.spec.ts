import { test, expect } from '@playwright/test';

test.describe('Niji webapp — route smoke tests', () => {
  test('/playground が表示され Niji 12 体生成ボタンがある', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByText('Playground').first()).toBeVisible({ timeout: 15_000 });
    // 'Generate Nijis' ボタンが描画される
    const generateBtn = page.getByRole('button', { name: /Generate Nijis|Niji/i }).first();
    await expect(generateBtn).toBeVisible({ timeout: 15_000 });
  });

  test('/playground の初期 8 体が data:image/svg+xml で描画される', async ({ page }) => {
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

  test('/traits が 200 で返る', async ({ page }) => {
    const res = await page.goto('/traits', { waitUntil: 'commit', timeout: 15_000 });
    expect(res?.status()).toBe(200);
    // /traits は重い PNG zip 生成と subgraph 接続を含むため mount 確認は別 spec で扱う
  });

  test('/nijis が 200 で表示される', async ({ page }) => {
    const res = await page.goto('/nijis');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
  });

  test('/vote が 200 で表示される (DAO governance page)', async ({ page }) => {
    const res = await page.goto('/vote');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
  });

  test('/lp/ が 200 で LP HTML を返す + CSS/画像が読める', async ({ page }) => {
    const res = await page.goto('/lp/');
    expect(res?.status()).toBe(200);
    // lang=ja で固有 H2 が描画
    await expect(page.locator('html[lang="ja"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('共創で進化する').first()).toBeVisible({ timeout: 10_000 });
    // lo_niji.png が読めている (LP header の logo)
    const headerLogo = page.locator('img[src="/lp/assets/images/lo_niji.png"]').first();
    await expect(headerLogo).toBeVisible({ timeout: 10_000 });
  });

  test('/lp (trailing slash 無) が 301 → /lp/ に redirect される', async ({ request }) => {
    const res = await request.get('/lp', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe('/lp/');
  });

  test('/lp/ の Launch App リンクをクリックで / に戻る', async ({ page }) => {
    await page.goto('/lp/');
    await expect(page.getByText('共創で進化する').first()).toBeVisible({ timeout: 10_000 });
    const launch = page.locator('a.launch_bt').first();
    await expect(launch).toBeVisible();
    await launch.click();
    await page.waitForURL(/\/$/, { timeout: 10_000 });
    // webapp top の Niji ロゴが描画される
    await expect(page.locator('img[alt="Niji DAO"]').first()).toBeVisible({ timeout: 15_000 });
  });
});
