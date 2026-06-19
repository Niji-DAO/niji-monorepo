import { test, expect } from '@playwright/test';

/**
 * webapp top の auction UI が anvil の AuctionHouse から状態を取得して描画される
 * ことを確認する。 ja-JP default locale 前提で「現在の入札額」 「残り時間」 等の
 * 文言を assertion key にする。
 */
test.describe('Niji auction — UI (http://localhost:2424/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // wagmi polling が走り続けるので networkidle は使わず、 NavBar 描画完了で代用
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
  });

  test('NavBar に N マークの Niji ロゴが描画されている', async ({ page }) => {
    const logo = page.locator('img[alt="Niji DAO"]').first();
    await expect(logo).toBeVisible({ timeout: 10_000 });
    const src = await logo.getAttribute('src');
    expect(src).toMatch(/fav_180\.png/);
  });

  test('TESTNET バッジが NavBar 内に出ている (chainId != 1)', async ({ page }) => {
    // 'TESTNET' という文字列が body 全体のどこかに出ていれば OK (NavBar inside の span)
    await expect(page.locator('body')).toContainText('TESTNET', { timeout: 15_000 });
  });

  test('NavBar の LP リンクをクリックすると /lp/ に遷移する', async ({ page }) => {
    // a[href="/lp/"] は desktop + mobile collapse の 2 個あるので、 visible な方を取る
    const lpLink = page.locator('a[href="/lp/"]:visible').first();
    await expect(lpLink).toBeVisible({ timeout: 15_000 });
    await lpLink.click();
    await page.waitForURL('**/lp/', { timeout: 10_000 });
    // LP HTML の固有要素 (h2 共創で進化する) を確認
    await expect(page.getByText('共創で進化する')).toBeVisible({ timeout: 10_000 });
  });

  // 以下 3 件は wagmi 経由 auction 状態 (subgraph + wallet 経路) に依存。
  // anvil 起動 + VITE_CHAIN_ID=31337 + 該当 subgraph endpoint 設定が揃った
  // 環境でのみ pass する想定。 ローカル subgraph 未整備のため fixme でスキップし、
  // 整備完了次第 fixme を外して通す。
  test.fixme(
    '現在の入札額 / 残り時間 が描画される (wagmi が anvil 31337 と接続済)',
    async ({ page }) => {
      await expect(page.locator('body')).toContainText(/現在の入札額|Current bid/i, {
        timeout: 30_000,
      });
      await expect(page.locator('body')).toContainText(/残り時間|Time left|オークション/i, {
        timeout: 30_000,
      });
    },
  );

  test.fixme(
    'Niji #N の番号タイトルが描画される (auction nounId が UI に出る)',
    async ({ page }) => {
      await expect(page.locator('body')).toContainText(/Niji\s*[#]?\d+|Niji [0-9]+/i, {
        timeout: 30_000,
      });
    },
  );

  test.fixme(
    'Niji の SVG image (data:image/svg+xml;base64,) が <img> として描画される',
    async ({ page }) => {
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.some(
            i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
          );
        },
        { timeout: 30_000 },
      );
    },
  );
});
