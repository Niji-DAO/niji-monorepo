import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test('Crystal Ball ページが描画される + 5 個の次 Niji preview が出る', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto('/crystal-ball', { waitUntil: 'domcontentloaded' });
  await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
  // chain 読み (auctionStorage + seeder + descriptor + 5 件 generateSeed) を待つ
  await page.waitForTimeout(8_000);

  // header
  await expect(page.getByText(/Niji Crystal Ball/i)).toBeVisible();

  // 「+1」 〜 「+5」 ラベルが見える
  for (const idx of ['+1', '+2', '+3', '+4', '+5']) {
    await expect(page.getByText(idx).first()).toBeVisible();
  }

  // SVG (data:image/svg+xml;base64,) で render された Niji が 5 個以上
  const svgCount = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(
      i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
    ).length;
  });
  expect(svgCount).toBeGreaterThanOrEqual(5);

  // BigInt serialize / pageerror なし
  expect(consoleErrors.filter(e => /BigInt|pageerror/i.test(e))).toEqual([]);
});
