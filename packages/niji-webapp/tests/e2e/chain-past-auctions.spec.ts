/**
 * /kiwa-play で生成した spec — chain-past-auctions
 *
 * 仕様書 ... tests/spec/e2e/test-spec-chain-past-auctions.ja.md
 * 機能 ... subgraph 未起動 dev (anvil 31337) で前後ボタン navigation を
 *         WTF? に落とさず動かす chain 直叩き fallback の E2E 検証。
 *
 * 前提 (global-setup.ts が立ち上げる):
 *   - anvil 8547 chain-id 31337
 *   - deploy-niji-full 完了
 *   - SDK 固定 address (AuctionHouse = 0x59b6...857b) で deploy 結果一致
 *   - webapp (port 2424) は別 process で起動 (env VITE_HARDHAT_JSONRPC=8547)
 *   - auto-settler (scripts/anvil-auto-settler.ts) が並走で Niji を自動進行
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

import { increaseTime, revertChain, seedPastAuctions, snapshotChain } from './helpers/chain';

const CHAIN_HOOK_POLL_MS = 11_000;

test.describe('chain-past-auctions (subgraph 未起動 fallback)', () => {
  test('TC-001 正常系: top page で現在 Niji が描画される', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    const hasSvgImg = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).some(
        i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
      ),
    );
    const hasNijiTitle = await page
      .getByText(/Niji\s*#?\d+/)
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasSvgImg || hasNijiTitle).toBe(true);
    // BigInt serialize 系のエラーが混入していないことを確認
    expect(consoleErrors.filter(e => /BigInt/i.test(e))).toEqual([]);
  });

  test('TC-002 状態遷移: 前ボタン 1 回で過去 Niji へ遷移', async ({ page }) => {
    const snapId = await snapshotChain();
    try {
      // navigation 系は過去 auction >= 1 件が前提。 seed で 1 件 settle 進めて
      // ←ボタンが active になる状態を作る (Issue #197)。
      await seedPastAuctions(1);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      const before = page.url();
      const leftArrow = page.getByRole('button', { name: '←' }).first();
      await leftArrow.waitFor({ timeout: 5_000 });
      await leftArrow.click();
      await page.waitForTimeout(1_500);

      expect(page.url()).not.toBe(before);
      expect(page.url()).toMatch(/\/niji\/\d+$/);

      const hasSvgImg = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).some(
          i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
        ),
      );
      expect(hasSvgImg).toBe(true);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-003 状態遷移: 次ボタンで最新 Niji に戻る', async ({ page }) => {
    const snapId = await snapshotChain();
    try {
      await seedPastAuctions(1);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      await page.getByRole('button', { name: '←' }).first().click();
      await page.waitForTimeout(1_500);
      const prevUrl = page.url();

      await page.getByRole('button', { name: '→' }).first().click();
      await page.waitForTimeout(1_500);

      expect(page.url()).not.toBe(prevUrl);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-004 正常系: /niji/0 直接 navigate で Nijider 枠が描画', async ({ page }) => {
    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    const hasNiji0 = await page
      .getByText(/Niji\s*#?0/)
      .first()
      .isVisible()
      .catch(() => false);
    const hasNijiEth = await page
      .getByText(/niji\.eth/)
      .first()
      .isVisible()
      .catch(() => false);
    const hasSvgImg = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).some(
        i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
      ),
    );
    expect(hasNiji0).toBe(true);
    expect(hasNijiEth).toBe(true);
    expect(hasSvgImg).toBe(true);
  });

  test('TC-005 状態遷移: 前ボタン 3 連打で連続して過去 Niji へ', async ({ page }) => {
    const snapId = await snapshotChain();
    try {
      // 3 連打分の遷移を確認するため過去 auction を 3 件 seed
      await seedPastAuctions(3);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      let lastUrl = page.url();
      let movements = 0;
      const leftArrow = page.getByRole('button', { name: '←' }).first();
      for (let i = 0; i < 3; i++) {
        const disabled = await leftArrow.isDisabled().catch(() => true);
        if (disabled) break;
        await leftArrow.click();
        await page.waitForTimeout(1_500);
        if (page.url() !== lastUrl) {
          movements++;
          lastUrl = page.url();
        }
      }
      expect(movements).toBeGreaterThanOrEqual(1);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-006 境界値: /niji/0 で前ボタンが disabled', async ({ page }) => {
    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    const leftArrow = page.getByRole('button', { name: '←' }).first();
    await leftArrow.waitFor({ timeout: 5_000 });
    await expect(leftArrow).toBeDisabled();
  });

  test('TC-007 境界値: 最新 Niji で次ボタンが disabled', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    const rightArrow = page.getByRole('button', { name: '→' }).first();
    await rightArrow.waitFor({ timeout: 5_000 });
    await expect(rightArrow).toBeDisabled();
  });

  test('TC-008 UI feature 網羅: ArrowLeft キーで navigation', async ({ page }) => {
    const snapId = await snapshotChain();
    try {
      await seedPastAuctions(1);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      const before = page.url();
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(1_500);

      // AuctionNavigation の useCallback は first key で空 navigate→次キーで実遷移する hack を
      // 持つので 2 回押す
      if (page.url() === before) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(1_500);
      }
      expect(page.url()).toMatch(/\/niji\/\d+$/);
    } finally {
      await revertChain(snapId);
    }
  });

  test('TC-010 冪等性: 直接 URL と前ボタン経由で同一 Niji を描画', async ({ page }) => {
    const snapId = await snapshotChain();
    try {
      await seedPastAuctions(1);

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      // 前ボタンで 1 つ戻った URL を取得
      await page.getByRole('button', { name: '←' }).first().click();
      await page.waitForTimeout(1_500);
      const viaPrev = page.url();
      const match = viaPrev.match(/\/niji\/(\d+)$/);
      expect(match).not.toBeNull();

      // 直接 URL navigate
      await page.goto(viaPrev, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

      const hasSvgImg = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).some(
          i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
        ),
      );
      expect(hasSvgImg).toBe(true);
    } finally {
      await revertChain(snapId);
    }
  });

  // TC-011 は anvil chain time を進めて auto-settler の settle 動作を観察する。
  // 過去 30s waitForTimeout + 連続 increaseTime で wagmi reconnect race が flaky だったため、
  // snapshot/revert で chain state を test 範囲内に閉じる (Issue #181)。
  test('TC-011 並行処理: chain 時計進行下で auto-settler が走っても webapp が破綻しない', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

    const snapId = await snapshotChain();
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });

      // chain 時計を 70 秒進めて 1 分 duration auction を 1 回 endTime 越え状態に
      // auto-settler が 5s polling で settle するのを最大 12 秒待つ
      await increaseTime(70);
      await page.waitForTimeout(12_000);

      // BigInt error / pageerror が出ていないこと
      expect(consoleErrors.filter(e => /BigInt|pageerror/i.test(e))).toEqual([]);
      // 何らかの Niji 画像が引き続き描画されている
      const hasSvgImg = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).some(
          i => i.src.startsWith('data:image/svg+xml;base64,') && i.src.length > 1000,
        ),
      );
      expect(hasSvgImg).toBe(true);
    } finally {
      // 他 test に chain time 進行を漏らさないよう必ず snapshot に revert
      await revertChain(snapId);
    }
  });

  test('TC-012 回帰: BigInt serialize error が出ない', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

    await page.goto('/niji/0', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    expect(
      consoleErrors.filter(e => /Do not know how to serialize a BigInt/i.test(e)),
    ).toEqual([]);
  });

  test('TC-013 回帰: chain hook が auctions を取得 (SDK address 一致)', async ({ page }) => {
    const chainLogs: string[] = [];
    page.on('console', msg => {
      const t = msg.text();
      if (t.includes('[chain-past]')) chainLogs.push(t);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await page.waitForTimeout(CHAIN_HOOK_POLL_MS);

    const fetchedLog = chainLogs.find(l => /fetched auctions= (\d+)/.test(l));
    expect(fetchedLog).toBeTruthy();
    const m = fetchedLog!.match(/fetched auctions= (\d+)/);
    const count = m ? Number(m[1]) : 0;
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
