import { defineConfig, devices } from '@playwright/test';

/**
 * Niji webapp e2e config (kiwa fixture ベース)。
 * - tests/e2e/ を testDir に固定
 * - global-setup で anvil 8547 + deploy-niji-full を立ち上げる (Niji 固有 deploy が
 *   hardhat task なので kiwa の runE2EPrepareEnv ではなく自前 spawn 経路で起動)
 * - kiwa fixture (@kiwa-test/core の dappE2eTest) は各 spec が import して使う
 *   (webapp を見ない pure dApp test ではそのまま、 webapp UI test では page.goto)
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
  use: {
    baseURL: 'http://localhost:2424',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
