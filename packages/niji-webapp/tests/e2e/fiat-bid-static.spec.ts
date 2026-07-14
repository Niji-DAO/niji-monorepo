/**
 * fiat bid 特商法 static page e2e (Issue #3073、 高速化 Phase 1a)
 *
 * 責務 —
 * page.goto + assertion のみで完結する 5 test (TC-FB01-05) を切り出した parallel-safe spec。
 * kiwa fixture (dappE2eTest) と anvil chain state に依存しないため、
 * playwright projects の `fiat-bid-static-parallel` (fullyParallel: true + workers: 4) で並列実行する。
 *
 * fiat-bid.spec.ts (kiwa 依存の serial spec) から機械的に切出したもので、
 * assertion / timeout / selector はそのまま維持している。
 */
import { expect, test } from '@playwright/test';

test.describe('特商法 page 描画 + footer link 経路 (Phase 1 実装完了)', () => {
  test('TC-FB01 /legal/tokushoho が 200 で返る', async ({ page }) => {
    const res = await page.goto('/legal/tokushoho');
    expect(res?.status()).toBe(200);
  });

  test('TC-FB02 /legal/tokushoho に h1 "特定商取引法に基づく表記" が描画', async ({ page }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: '特定商取引法に基づく表記' }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test('TC-FB03 /legal/tokushoho に 8 項目 (販売者名 / 所在地 / 電話番号 / 代表者 / 販売価格 / 支払方法 / 商品引渡時期 / 返品ポリシー) が描画', async ({
    page,
  }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await expect(page.getByTestId('legal-tokushoho')).toBeVisible({ timeout: 15_000 });

    const labels = [
      '販売者名',
      '所在地',
      '電話番号',
      '代表者',
      '販売価格',
      '支払方法',
      '商品引渡時期',
      '返品ポリシー',
    ];
    for (const label of labels) {
      await expect(page.getByText(label).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test('TC-FB04 販売者情報 4 項目に [TODO: Phase 3 本番切替時 user 確認] marker が明記', async ({
    page,
  }) => {
    await page.goto('/legal/tokushoho');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const placeholders = page.getByTestId('tokushoho-placeholder');
    await expect(placeholders).toHaveCount(4);
    await expect(placeholders.first()).toContainText('TODO: Phase 3 本番切替時 user 確認');
  });

  test('TC-FB05 footer から /legal/tokushoho link が click 可能で遷移する', async ({ page }) => {
    await page.goto('/');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    const footerLink = page.locator('footer a[href="/legal/tokushoho"]').first();
    await expect(footerLink).toBeVisible({ timeout: 10_000 });
    await footerLink.click();

    await page.waitForURL(/\/legal\/tokushoho$/, { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: '特定商取引法に基づく表記' }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
