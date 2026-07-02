/**
 * Phase 1 fiat bid golden path e2e (Issue #3011 Phase C)
 *
 * 責務 —
 * (1) 特商法 static page (/legal/tokushoho) の描画 + footer link 遷移経路の e2e verify
 * (2) Phase 1 golden path (wallet 接続 → fiat bid modal → JPY 入力 → GMO mock authorize →
 *     3DS mock success → bid tx broadcast → auction 終了待機 → 落札 modal → capture →
 *     transferFrom → dashboard で NFT 保有確認) の structural spec (Phase 3 e2e infra 実装保留)
 *
 * 実行環境 —
 * global-setup.ts で anvil 8547 + deploy-niji-full が起動する pattern に従う。
 * (1) は localhost anvil で完結、 (2) は Base Sepolia RPC + GMO mock server が別途必要 (Phase 3 で追加)。
 *
 * flaky 対策 —
 * playwright.config.ts で retries: 0 が default だが、 Phase 1 fiat bid golden path は
 * external state (Base Sepolia RPC / GMO mock) 依存で flaky risk あり、
 * Phase 3 で retry: 2 に見直しする ({@link tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P8})。
 *
 * SSOT —
 * - tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5, P8
 * - tests/spec/gmo-fiat-bid/Phase1-02-issue-breakdown.md § Issue 8 Phase C
 */
import { dappE2eTest as test } from '@kiwa-test/core';
import { expect } from '@playwright/test';

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
    // 少なくとも 1 件は TODO marker を持つ (残りは同じ marker を共有)
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

/**
 * Phase 1 golden path (Base Sepolia + GMO mock + wallet inject 統合実行)
 *
 * 実装保留理由 (Phase 3 で activate) —
 * - localhost anvil (global-setup が起動) には fiat bid endpoint (niji-api) 配線なし
 * - GMO mock server (MSW) は niji-api dev server 起動時のみ available、 e2e globalSetup 非統合
 * - kiwa fixture の wallet inject 経路と Base Sepolia RPC 連動の統合実装は Phase 3 で完成
 *
 * 本 describe block は structural spec (契約 pin)、 test.skip で ci-friendly、
 * Phase 3 で `test.skip` → `test` に格上げして activate する。
 */
test.describe('Phase 1 fiat bid golden path (Phase 3 で activate)', () => {
  test.skip('TC-FB10 wallet 接続 → fiat bid modal → JPY 入力 → GMO mock authorize → 3DS mock success → bid tx broadcast → auction 終了待機 → 落札 modal → capture → transferFrom → dashboard NFT 保有確認', async ({
    page,
  }) => {
    // Phase 3 activate 時の steps —
    // 1. page.goto('/niji/0'), kiwa fixture で wallet inject 済
    // 2. 「クレカで入札」 button click → FiatBidModal open
    // 3. JPY 入力 field に 10000 → GMO mock authorize 200 → 3DS redirect
    // 4. 3DS mock success return → bid tx を運営 EOA が Base Sepolia に broadcast
    // 5. auction 終了 (time-warp helper で fast-forward) → SettlementWatcher が enqueue
    // 6. FiatSettlementModal open → 「クレカ決済を確定します」 → 3DS 再認証 → capture 200
    // 7. transferFrom broadcast → user wallet に NijiToken 保有
    // 8. dashboard の holdings で nounId 表示を assert
    // ↑ 8 steps 全 pass で fiat bid golden path 通過証拠となる
    await page.goto('/');
    expect(true).toBe(true);
  });
});
