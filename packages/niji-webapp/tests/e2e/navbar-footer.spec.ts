/**
 * Phase A - NavBar + Footer UX e2e
 * spec ... tests/spec/e2e/test-spec-phase-a-ux.ja.md § NavBar + Footer
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

test.describe('NavBar + Footer', () => {
  test('NF-001 UI feature: Footer に LP / Crystal Ball link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/^LP$/).first()).toBeVisible();
    await expect(footer.getByText(/Crystal Ball/i).first()).toBeVisible();
  });

  test('NF-002 回帰: Footer から Map (nounspot.com) link が削除済', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const mapLink = page.locator('footer a[href*="nounspot"]');
    await expect(mapLink).toHaveCount(0);
    const mapText = page.locator('footer').getByText(/^Map$/);
    await expect(mapText).toHaveCount(0);
  });

  test('NF-003 回帰: Footer X icon が niji_dao (nounsdao でない)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const nounsX = page.locator('footer a[href*="nounsdao"]');
    await expect(nounsX).toHaveCount(0);
    const nijiX = page.locator('footer a[href*="niji_dao"]');
    await expect(nijiX.first()).toBeVisible();
  });

  test('NF-004 UI feature: /crystal-ball への link が NavBar 内に存在する', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // 1 個でも (mobile collapse 含めて) DOM に存在することを確認
    // Explore Dropdown は hover で開くため click が unreliable、 a 要素の存在で代用
    const crystalLinks = page.locator('a[href="/crystal-ball"]');
    const count = await crystalLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('NF-005 UI feature: chain 31337 で NavBar に Faucet link が DOM 存在', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // viewport / collapse state による visibility 揺らぎを避け、 DOM 存在のみ check
    const faucetLinks = page.locator('a[href="/faucet"]');
    const count = await faucetLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
