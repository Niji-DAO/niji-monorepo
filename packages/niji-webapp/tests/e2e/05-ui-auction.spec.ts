/**
 * Niji auction — UI (http://localhost:2424/)
 *
 * 仕様 ... webapp top の auction UI が wagmi + chain hook 経由で描画されることを
 *         確認する。 NavBar / TESTNET / LP link click までを smoke。
 *         入札金額 / 残り時間 / Niji #N タイトル / SVG image は subgraph 経路または
 *         chain hook + wallet 接続が必要なため、 入札 UI 部の文言検証は
 *         chain-past-auctions.spec.ts (TC-001, TC-004 等) でカバー済として
 *         本 spec では行わない。
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test.describe('Niji auction — UI (http://localhost:2424/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // wagmi polling が走り続けるので networkidle は使わず NavBar 描画完了で代用
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
  });

  test('TC-U01 NavBar に Niji ロゴ (fav_180.png) が描画されている', async ({ page }) => {
    const logo = page.locator('img[alt="Niji DAO"]').first();
    await expect(logo).toBeVisible({ timeout: 10_000 });
    const src = await logo.getAttribute('src');
    expect(src).toMatch(/fav_180\.png/);
  });

  test('TC-U02 TESTNET バッジが NavBar 内に出ている (chainId != 1)', async ({ page }) => {
    // 'TESTNET' は NavBar 内 span で body 全体のどこかに出ていれば OK
    await expect(page.locator('body')).toContainText('TESTNET', { timeout: 15_000 });
  });

  test('TC-U03 NavBar の LP リンクをクリックすると /lp/ に遷移する', async ({ page }) => {
    // a[href="/lp/"] は desktop + mobile collapse の 2 個あるので visible な方を取る
    const lpLink = page.locator('a[href="/lp/"]:visible').first();
    await expect(lpLink).toBeVisible({ timeout: 15_000 });
    await lpLink.click();
    await page.waitForURL('**/lp/', { timeout: 10_000 });
    await expect(page.getByText('共創で進化する')).toBeVisible({ timeout: 10_000 });
  });
});
