import { defineConfig, devices } from '@playwright/test';

/**
 * Niji webapp e2e config (Issue #3073 高速化 Phase 1a 対応)。
 *
 * projects で 2 経路に分離。
 * - `fiat-bid-parallel` = fullyParallel: true + workers: 4
 *     chain state 不変 (page.goto only or Playwright page.route mock 経路) + kiwa fixture 非依存の spec
 *     対象 = fiat-bid-static.spec.ts / fiat-bid-no-wallet.spec.ts
 * - `fiat-bid-serial` = fullyParallel: false + workers: 1
 *     kiwa dappE2eTest fixture 経由 + anvil chain write 経路
 *     対象 = fiat-bid.spec.ts (bid tx broadcast / validation / error path / testcard)
 *     spec 内で snapshot/revert (helpers/anvil-snapshot.ts) が beforeEach 発火し auction fresh state に戻す
 *
 * global-setup で anvil 8547 + deploy-niji-full + spot-rate 42070 を起動、
 * global-teardown で kill する (Issue #3069)。
 *
 * retries: 0 (Issue #3073、 nijiToken.ts TS2589 完全解消 + snapshot/revert 経路配線で flaky 根絶)。
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:2424',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'fiat-bid-parallel',
      testMatch: /(fiat-bid-static|fiat-bid-no-wallet)\.spec\.ts$/,
      fullyParallel: true,
      workers: 4,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // fiat-bid.spec.ts (kiwa fixture + anvil chain write 経路) 単独。
      // 既存 chain 系 spec (01-auction / 02-settle / chain-past-auctions 等) は本 config 対象外、
      // Issue #3073 スコープは fiat bid 3 spec に限定。
      name: 'fiat-bid-serial',
      testMatch: /fiat-bid\.spec\.ts$/,
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
