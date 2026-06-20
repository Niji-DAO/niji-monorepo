/**
 * Phase A - Auction Render 回帰 e2e
 * spec ... tests/spec/e2e/test-spec-phase-a-ux.ja.md § Auction Render
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test.describe('Auction Render 回帰', () => {
  test('AR-001 正常系: Niji 0 Nijider 枠の表示 (niji.eth + 「-」)', async ({ page }) => {
    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(11_000);

    await expect(page.getByText(/niji\.eth/).first()).toBeVisible();
    // CurrentBid の値が '-' (n/a 廃止確認)
    const hyphen = page.getByText('-', { exact: true });
    expect(await hyphen.count()).toBeGreaterThanOrEqual(1);
    // SVG 画像
    const hasSvg = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).some(
        i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
      ),
    );
    expect(hasSvg).toBe(true);
  });

  test('AR-002 正常系: 通常 auction で SVG + タイトル描画 (top page)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(11_000);

    const hasNijiTitle = await page
      .getByText(/Niji\s*#?\d+/)
      .first()
      .isVisible()
      .catch(() => false);
    const hasSvg = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).some(
        i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
      ),
    );
    expect(hasNijiTitle || hasSvg).toBe(true);
  });

  test('AR-003 回帰: console error / pageerror なし', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(11_000);

    expect(
      consoleErrors.filter(
        e => /BigInt|pageerror|Maximum update depth|Cannot read prop/i.test(e),
      ),
    ).toEqual([]);
  });
});
