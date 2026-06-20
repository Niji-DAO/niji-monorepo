/**
 * Phase A - Settle Nijider 枠 UX e2e
 * spec ... tests/spec/e2e/test-spec-phase-a-ux.ja.md § Settle Nijider 枠
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test.describe('Settle Nijider 枠 (Niji 0)', () => {
  test('SN-001 状態遷移: Niji 0 表示時に Nijider 枠 UI が描画', async ({ page }) => {
    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(11_000);

    // niji.eth (Nijider 落札者) 表示
    await expect(page.getByText(/niji\.eth/).first()).toBeVisible();
    // 落札額は「-」 (Nijider 枠は入札なし表記)
    const hyphenCount = await page.getByText('-', { exact: true }).count();
    expect(hyphenCount).toBeGreaterThanOrEqual(1);

    // Playwright (kiwa fixture wallet 未接続) では SettleManuallyBtn は出ない
    // wallet 接続済 + auctionEnded 条件で初めて表示される
    const settleBtnCount = await page.getByRole('button', { name: /Settle manually/i }).count();
    expect(settleBtnCount).toBe(0);
  });

  test('SN-002 UI feature: 「詳細はこちら →」 link が描画', async ({ page }) => {
    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(11_000);

    await expect(page.getByText(/詳細はこちら/).first()).toBeVisible();
  });
});
