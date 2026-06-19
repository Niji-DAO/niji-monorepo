import { defineConfig, devices } from '@playwright/test';

/**
 * Niji webapp e2e config — 31337 ローカル anvil + webapp に接続する dApp テスト用。
 * ・anvil (chain 31337) + webapp (port 2424) は事前に起動してある前提 (Makefile の
 *   `make dev` または手動起動)。 webServer は使わない。
 * ・wallet 接続は test 内で viem の testClient を直接叩いて on-chain state を確認する
 *   形に絞り、 ConnectKit/Wagmi 経由の UI 接続は別 step で扱う。
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts$/,
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  // spec 間で state を共有する設計のため固定順序で実行する。
  // testIdentifier 順を強制するには projects と testMatch を split する案もあるが、
  // alphabetical で意図順になるよう spec を命名する (01-auction / 02-settle / 03-bid-errors)。
  use: {
    baseURL: 'http://localhost:2424',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      // .desktopOnly が `max-width: 1200px` の query で隠れるため width を 1280+ に固定
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
