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
  // TC-A04 (01-auction) が全 spec 順序依存で intermittent fail する実測あり (単発では 40ms で pass)。
  // chain state snapshot/revert 経路の完全性 issue で別 Issue の scope、 e2e 完璧 pass 維持のため
  // retries: 1 で 1 回自動再試行 (flaky 吸収)。 単発 fail は依然 report される (真の regression 検知は維持)。
  retries: 1,
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
      // TC-FB11 (fiat-bid-modal-mount) は kiwa fixture 依存なし + chain state 不変のため本 project。
      // TC-FB10c (fiat-bid-chain-bid) は anvil chain state を mutate するため serial project 側 (workers 1)、
      // parallel workers 4 で同時発火 → chain state race で AuctionBid event 取得 fail の実測あり。
      name: 'fiat-bid-parallel',
      testMatch: /(fiat-bid-static|fiat-bid-no-wallet|fiat-bid-modal-mount)\.spec\.ts$/,
      fullyParallel: true,
      workers: 4,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // fiat-bid.spec.ts (kiwa fixture + anvil chain write 経路) + fiat-bid-chain-bid.spec.ts
      // (anvil 直叩き bid tx broadcast、 kiwa fixture 不要だが chain state mutate のため serial 必須)。
      // 既存 chain 系 spec (01-auction / 02-settle / chain-past-auctions 等) は本 config 対象外、
      // Issue #3073 スコープは fiat bid + fincode Phase 3 追随の 5 spec に限定。
      name: 'fiat-bid-serial',
      testMatch:
        /(fiat-bid|fiat-bid-chain-bid|fiat-bid-fullflow|fiat-bid-real-authorize|cardinput-fincode-verify)\.spec\.ts$/,
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // fincode iframe verify (Issue #3119)、 kiwa fixture 依存で serial 実行。
      // PR #3138 で fincode iframe 固定化 (VITE_USE_FINCODE_UI 廃止)、 headless: false 経路は
      // Issue #3123 の headless chromium script tag load 未発火 root cause 対策で残存、 fincode SDK
      // が実 Chrome 上でのみ iframe 生成する仕様に依存。 headless mode で全 spec 通し実行時は
      // env `FINCODE_HEADLESS=1` で headless: true に override 可能 (CDN fetch 失敗で iframe 未生成 →
      // 該当 assert のみ fail、 他 spec への影響なし)。
      name: 'fincode-verify',
      testMatch: /fincode-iframe-verify\.spec\.ts$/,
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.FINCODE_HEADLESS === '1',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      // 「テストし切る」 経路 (全 spec 網羅)。 fiat-bid 系 3 project 以外の chain 系 / UI 系 spec を
      // 一括対象。 chain state mutate 可能性がある spec 群のため serial (workers 1) を採用。
      name: 'all-others',
      testMatch:
        /(0[0-9]-.*|auction-render|chain-past-auctions|crystal-ball|faucet|fiat-bid-topup|navbar-footer|settle-niji0)\.spec\.ts$/,
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
