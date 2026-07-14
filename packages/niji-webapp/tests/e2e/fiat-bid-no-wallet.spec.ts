/**
 * fiat bid wallet 未接続 e2e (Issue #3074 対応、 TC-FB23 活性化経路)
 *
 * 責務 —
 * kiwa `dappE2eTest` fixture は wallet を auto-inject する仕様のため、
 * 「wallet 未接続時の Bid button disabled + tooltip 表示」 の UI を検証するには
 * kiwa を使わない pure Playwright `test` (`@playwright/test`) で新 spec file を用意する必要がある。
 * 本 file はその専用 spec で、 fiat-bid.spec.ts (kiwa fixture 経路) とは独立に実行される。
 *
 * 実行環境 —
 * global-setup が anvil 8547 + deploy-niji-full + spot-rate server (42070) を起動する。
 * wallet inject しないので eth account は wagmi 側で undefined、
 * Bid 側 `isWalletConnected = false` 分岐で TooltipProvider wrap + disabled Bid button が render される。
 *
 * SSOT —
 * - packages/niji-webapp/src/components/Bid/index.tsx:101-122 (wallet 未接続 分岐)
 * - GH Issue #3074 (skip test 活性化 fu Issue)
 * - PR #3072 (Issue #3071) で TC-FB23 を skip 明示していた分の活性化
 */
import { expect, test } from '@playwright/test';

test.describe('fiat bid wallet 未接続 UI (kiwa fixture 非使用、 Issue #3074)', () => {
  test('TC-FB23 wallet 未接続時 Bid button disabled + tooltip「wallet 接続が必要です」', async ({
    page,
  }) => {
    // wallet inject せず auction page に到達 (kiwa 経由でない pure Playwright)
    await page.goto('/');
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

    // wallet 未接続時は TooltipProvider の中に disabled Bid button (data-testid=bid-open-button)
    // + wrapper span (data-testid=bid-open-button-wrapper) が render される
    const wrapper = page.getByTestId('bid-open-button-wrapper').first();
    await expect(wrapper).toBeVisible({ timeout: 15_000 });

    // disabled Bid button が wrapper 内に存在
    const bidButton = wrapper.getByTestId('bid-open-button');
    await expect(bidButton).toBeVisible();
    await expect(bidButton).toBeDisabled();

    // hover で tooltip「wallet 接続が必要です」 表示 (radix TooltipContent の role=tooltip)
    await wrapper.hover();

    // radix tooltip は body 直下に portal で render されるので page 全体を検索
    const tooltip = page.getByText('wallet 接続が必要です');
    await expect(tooltip).toBeVisible({ timeout: 5_000 });
  });
});
